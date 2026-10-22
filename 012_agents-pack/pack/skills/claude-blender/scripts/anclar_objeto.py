"""Anchor a 3D object to a real-world point in a solved camera-tracking scene.

Run inside Blender after tracking_pipeline.py (camera solved, camera object with a
CAMERA_SOLVER constraint). Edit CONFIG:
- OBS: pixel of the SAME real point (e.g. the centre of a candle's mouth) in 4+ frames
  that are far apart, measured on frames with a 100 px grid. Top-left origin.
- REAL_HEIGHT_CM: real height of that point above the table, to get the scale.
Creates the "Ancla" Empty (Z = table normal, -Y looks at the camera on the first OBS frame)
and two test spheres: red at the point, green at the base. Render them over the plate
before placing the real object; they must stay put on the object in every frame.
"""
import random

import bpy
from mathutils import Matrix, Vector

# ---- CONFIG -------------------------------------------------------------
CAMERA = "CamTrack"
OBS = {1: (637, 1065), 80: (547, 1018), 150: (562, 985), 231: (566, 1147)}
REAL_HEIGHT_CM = 8.0
PLANE_TOL = 0.012          # RANSAC inlier distance (tracking units)
# -------------------------------------------------------------------------

sc = bpy.context.scene
cam = bpy.data.objects[CAMERA]
clip = sc.active_clip
W, H = clip.size
FPX = clip.tracking.camera.focal_length / clip.tracking.camera.sensor_width * W


def ray(f, px):
    sc.frame_set(f)
    m = cam.matrix_world.copy()
    d = m.to_3x3() @ Vector(((px[0] - W / 2) / FPX, -(px[1] - H / 2) / FPX, -1))
    return m.translation.copy(), d.normalized()


def triangulate():
    """Least-squares point closest to every ray; prints residuals and reprojection."""
    rays = [ray(f, px) for f, px in OBS.items()]
    a, b = Matrix.Diagonal((0, 0, 0)), Vector((0, 0, 0))
    for o, d in rays:
        p = Matrix.Identity(3) - Matrix((d * d[0], d * d[1], d * d[2])).transposed()
        a += p
        b += p @ o
    pt = a.inverted() @ b
    for (f, px), (o, d) in zip(OBS.items(), rays):
        sc.frame_set(f)
        loc = cam.matrix_world.inverted() @ pt
        rp = (-loc.x / loc.z * FPX + W / 2, loc.y / loc.z * FPX + H / 2)
        print(f"frame {f}: ray dist {(pt - (o + d * (pt - o).dot(d))).length:.4f}"
              f"  reproj {rp[0]:.0f},{rp[1]:.0f} vs {px}")
    return pt


def table_plane():
    pts = [t.bundle.copy() for t in clip.tracking.tracks if t.has_bundle]
    random.seed(1)
    best = None
    for _ in range(3000):
        p0, p1, p2 = random.sample(pts, 3)
        n = (p1 - p0).cross(p2 - p0)
        if n.length < 1e-9:
            continue
        n.normalize()
        inl = sum(abs((q - p0).dot(n)) < PLANE_TOL for q in pts)
        if best is None or inl > best[2]:
            best = (p0, n, inl)
    print("plane inliers", best[2], "of", len(pts))
    return best[0], best[1]


def make_anchor(pt, p0, n):
    sc.frame_set(min(OBS))
    cpos = cam.matrix_world.translation.copy()
    if (cpos - p0).dot(n) < 0:
        n = -n                                   # normal points to the camera side
    h = (pt - p0).dot(n)
    fwd = pt - cpos
    fwd = (fwd - n * fwd.dot(n)).normalized()
    rot = Matrix((fwd.cross(n).normalized(), fwd, n)).transposed()
    anc = bpy.data.objects.get("Ancla") or bpy.data.objects.new("Ancla", None)
    if anc.name not in sc.collection.objects:
        sc.collection.objects.link(anc)
    anc.matrix_world = Matrix.Translation(pt) @ rot.to_4x4()
    sc["unit_per_cm"] = h / REAL_HEIGHT_CM
    print(f"height {h:.3f} units -> {sc['unit_per_cm']:.4f} units/cm")
    return anc, h


def test_spheres(anc, h):
    for name, z, col in (("TestPunto", 0.0, (1, 0, 0, 1)), ("TestBase", -h, (0, 1, 0, 1))):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.3 * sc["unit_per_cm"])
        o = bpy.context.object
        o.name = name
        m = bpy.data.materials.new(name)
        m.use_nodes = True
        bsdf = next(nd for nd in m.node_tree.nodes if nd.type == "BSDF_PRINCIPLED")
        bsdf.inputs["Emission Color"].default_value = col
        bsdf.inputs["Emission Strength"].default_value = 5
        o.data.materials.append(m)
        o.parent = anc
        o.matrix_parent_inverse.identity()
        o.location = (0, 0, z)


point = triangulate()
plane_pt, plane_n = table_plane()
anchor, height = make_anchor(point, plane_pt, plane_n)
test_spheres(anchor, height)
print("ok: parent the final object to Ancla (do not rotate or scale Ancla)")

"""Voronoi fracture of a mesh into separate objects, no addon needed.

Run inside Blender (paste into execute_blender_code). Edit the CONFIG block.
- SOURCE must be ONE mesh with modifiers applied and the logo already baked into UVs
  (otherwise each piece's new origin breaks object-coordinate mapping).
- Material slot 0 = outside surface, slot 1 = raw material for the cut faces.
- Each piece's origin goes to its centroid (rigid bodies use it as centre of mass) and its
  rest location is stored in obj["orig"] for later animation.
"""
import random

import bmesh
import bpy
from mathutils import Vector

# ---- CONFIG -------------------------------------------------------------
SOURCE = "TazaEntera"
N_SEEDS = 28
SEED = 7
BBOX_MIN = Vector((-0.045, -0.045, 0.0))   # seed volume (metres)
BBOX_MAX = Vector((0.07, 0.045, 0.1))
BOTTOM_BIAS = 1.4                           # >1 puts more seeds near the bottom (impact)
MIN_ISLAND_VERTS = 12
COLLECTION = "Pedazos"
# -------------------------------------------------------------------------


def make_seeds():
    random.seed(SEED)
    span = BBOX_MAX - BBOX_MIN
    seeds = []
    for _ in range(N_SEEDS):
        z01 = random.random() ** BOTTOM_BIAS
        seeds.append(Vector((BBOX_MIN.x + random.random() * span.x,
                             BBOX_MIN.y + random.random() * span.y,
                             BBOX_MIN.z + z01 * span.z)))
    return seeds


def cut_cell(mesh, seeds, i):
    """Keep only the part of the mesh closer to seeds[i] than to any other seed."""
    bm = bmesh.new()
    bm.from_mesh(mesh)
    s = seeds[i]
    for j, o in enumerate(seeds):
        if i == j or not bm.verts:
            continue
        nrm = (o - s).normalized()
        res = bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:],
                                     plane_co=(o + s) / 2, plane_no=nrm, clear_outer=True)
        cut = [e for e in res["geom_cut"] if isinstance(e, bmesh.types.BMEdge)]
        if cut:  # triangle_fill handles ring-shaped sections (hollow walls) correctly
            filled = bmesh.ops.triangle_fill(bm, use_beauty=True, use_dissolve=False,
                                             edges=cut, normal=nrm)
            for f in filled["geom"]:
                if isinstance(f, bmesh.types.BMFace):
                    f.material_index = 1
                    f.smooth = False
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def islands(bm):
    bm.verts.index_update()
    seen, out = set(), []
    for v in bm.verts:
        if v.index in seen:
            continue
        stack, isl = [v], []
        seen.add(v.index)
        while stack:
            cur = stack.pop()
            isl.append(cur.index)
            for e in cur.link_edges:
                w = e.other_vert(cur)
                if w.index not in seen:
                    seen.add(w.index)
                    stack.append(w)
        out.append(set(isl))
    return out


def island_to_object(bm, keep, name, materials, col):
    b2 = bm.copy()
    b2.verts.ensure_lookup_table()
    bmesh.ops.delete(b2, geom=[b2.verts[i] for i in range(len(b2.verts)) if i not in keep],
                     context="VERTS")
    c = sum((v.co for v in b2.verts), Vector()) / len(b2.verts)
    for v in b2.verts:
        v.co -= c
    me = bpy.data.meshes.new(name)
    b2.to_mesh(me)
    b2.free()
    for m in materials:
        me.materials.append(m)
    ob = bpy.data.objects.new(name, me)
    ob.location = c
    ob["orig"] = c[:]
    col.objects.link(ob)


def fracture():
    src = bpy.data.objects[SOURCE]
    col = bpy.data.collections.get(COLLECTION) or bpy.data.collections.new(COLLECTION)
    if col.name not in bpy.context.scene.collection.children:
        bpy.context.scene.collection.children.link(col)
    seeds, count = make_seeds(), 0
    for i in range(len(seeds)):
        bm = cut_cell(src.data, seeds, i)
        for k, keep in enumerate(islands(bm)):
            if len(keep) >= MIN_ISLAND_VERTS:
                island_to_object(bm, keep, f"Pedazo_{i:02d}_{k}", src.data.materials, col)
                count += 1
        bm.free()
    src.hide_viewport = src.hide_render = True
    print("pieces:", count)


fracture()

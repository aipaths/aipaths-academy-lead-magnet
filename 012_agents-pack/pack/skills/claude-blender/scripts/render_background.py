"""Render a saved .blend in a separate background Blender, never inside the user's session.

Usage:
  blender -b scene.blend --python render_background.py -- \
      --engine CYCLES --samples 256 --out /abs/renders/name.png
  blender -b scene.blend --python render_background.py -- \
      --engine EEVEE --samples 96 --out /abs/tmp/frames/f_ --animation [--glow] [--rgba] [--bake]

Prints "RENDER s <seconds>" at the end so the caller can log the time.
"""
import argparse
import sys
import time

import bpy


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    p = argparse.ArgumentParser()
    p.add_argument("--engine", default="CYCLES", choices=["CYCLES", "EEVEE"])
    p.add_argument("--samples", type=int, default=128)
    p.add_argument("--out", required=True)
    p.add_argument("--animation", action="store_true")
    p.add_argument("--glow", action="store_true", help="Fog Glow on emissive lights")
    p.add_argument("--rgba", action="store_true", help="transparent film (for compositing)")
    p.add_argument("--bake", action="store_true", help="bake rigid body caches first")
    p.add_argument("--percent", type=int, default=100)
    return p.parse_args(argv)


def set_engine(sc, engine, samples):
    if engine == "CYCLES":
        sc.render.engine = "CYCLES"
        prefs = bpy.context.preferences.addons["cycles"].preferences
        try:
            prefs.compute_device_type = "METAL"  # macOS; use CUDA/OPTIX elsewhere
            prefs.get_devices()
            for d in prefs.devices:
                d.use = True
            sc.cycles.device = "GPU"
        except Exception as e:  # fall back to CPU
            print("GPU unavailable:", e)
        sc.cycles.samples = samples
        sc.cycles.use_denoising = True
    else:
        engines = [i.identifier for i in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items]
        sc.render.engine = next(e for e in engines if "EEVEE" in e)
        sc.eevee.taa_render_samples = samples
        try:
            sc.eevee.use_raytracing = True
        except AttributeError:
            pass


def add_glow(sc):
    """Blender 5.x compositor is a node group assigned to the scene."""
    ng = bpy.data.node_groups.new("Glow", "CompositorNodeTree")
    sc.compositing_node_group = ng
    rl = ng.nodes.new("CompositorNodeRLayers")
    gl = ng.nodes.new("CompositorNodeGlare")
    out = ng.nodes.new("NodeGroupOutput")
    ng.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
    for key, val in (("Type", "Fog Glow"), ("Threshold", 0.9), ("Strength", 0.8), ("Size", 0.6)):
        try:
            gl.inputs[key].default_value = val
        except (KeyError, TypeError) as e:
            print("glare option skipped:", key, e)
    ng.links.new(rl.outputs["Image"], gl.inputs["Image"])
    ng.links.new(gl.outputs["Image"], out.inputs[0])


def main():
    a = parse_args()
    sc = bpy.context.scene
    set_engine(sc, a.engine, a.samples)
    if a.glow:
        add_glow(sc)
    sc.render.resolution_percentage = a.percent
    sc.render.image_settings.file_format = "PNG"
    if a.rgba:
        sc.render.film_transparent = True
        sc.render.image_settings.color_mode = "RGBA"
    if a.bake:
        bpy.ops.ptcache.free_bake_all()
        bpy.ops.ptcache.bake_all(bake=True)
    sc.render.filepath = a.out
    t = time.time()
    bpy.ops.render.render(animation=a.animation, write_still=not a.animation)
    print("RENDER s", round(time.time() - t, 1), flush=True)


main()

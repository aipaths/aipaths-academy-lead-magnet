# Trampas de la API de Blender 5.x (y del MCP)

Todas aparecieron en la sesión real con Blender 5.2 LTS.

## Animación: las fcurves ya no están en `action.fcurves`

Las actions son "slotted". Para cambiar interpolación o editar claves:

```python
from bpy_extras import anim_utils
ad = obj.animation_data
cb = anim_utils.action_get_channelbag_for_slot(ad.action, ad.action_slot)
for fc in cb.fcurves:
    for k in fc.keyframe_points:
        k.interpolation = 'QUAD'; k.easing = 'EASE_IN'   # caída que acelera
```

Las claves de booleanos (por ejemplo `rigid_body.kinematic`) van en `'CONSTANT'`.
Para animar luces o materiales, las curvas están en `light.animation_data` y en
`material.node_tree.animation_data`.

## Compositor: ahora es un node group

```python
ng = bpy.data.node_groups.new("Glow", "CompositorNodeTree")
scene.compositing_node_group = ng
rl = ng.nodes.new("CompositorNodeRLayers"); gl = ng.nodes.new("CompositorNodeGlare")
out = ng.nodes.new("NodeGroupOutput")
ng.interface.new_socket("Image", in_out='OUTPUT', socket_type='NodeSocketColor')
gl.inputs["Type"].default_value = "Fog Glow"   # las opciones del glare ahora son inputs
ng.links.new(rl.outputs["Image"], gl.inputs["Image"]); ng.links.new(gl.outputs["Image"], out.inputs[0])
```

## Nodos y enums

- Buscá nodos por tipo, no por nombre (los nombres están traducidos):
  `next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")`.
- Leé los enums en vez de escribirlos a mano: motores con
  `bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items`, looks con
  `scene.view_settings.bl_rna.properties["look"].enum_items` (en 5.x con AgX no existe
  "Medium High Contrast": confirmá que el valor elegido exista).
- `ShaderNodeMix` con `data_type='RGBA'` y `blend_type='MULTIPLY'` para estampar un logo.

## Editor de clip (tracking) desde un script

- Los operadores `clip.*` necesitan un área `CLIP_EDITOR`: convertí un área
  (`area.type = 'CLIP_EDITOR'`) y usá `bpy.context.temp_override(area=, region=, space_data=)`.
- **Trampa grave:** `scene.frame_set(f)` no mueve el cuadro del editor hasta que se
  redibuja, y desde un script no se redibuja (`redraw_timer` no sirve). `detect_features`
  crea los marcadores en el cuadro viejo. Arreglo: fijalo a mano,
  `space.clip_user.frame_current = f`, después de cada `frame_set`.
- `track_markers(sequence=True)` corre de forma síncrona dentro del override (unos segundos).
- `MovieTrackingSettings` ya no tiene `keyframe_a`/`keyframe_b`; usá `use_keyframe_selection`.

## Render y vista

- `look(shading="rendered")` falla con Cycles; cambiá a EEVEE para previsualizar.
- La física de cuerpos rígidos se calcula en orden: antes de mirar cuadros sueltos con
  `look(mode="frames")`, recorré `for f in range(start, end+1): scene.frame_set(f)`
  (y `bpy.ops.ptcache.free_bake_all()` después de cada cambio de parámetros).
- Para que un emisivo se vea de color con AgX, bajá la intensidad (2–4): a 20+ se desatura
  a blanco.

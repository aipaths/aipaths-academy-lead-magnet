# Render de producto con la marca del cliente

Caso real: taza de cerámica con el logo, sobre una mesa de madera, con luz cálida.
Unos 8 minutos de prompt a render final, que tardó 43 s en Cycles a 1600×1600.

## Modelado a escala real

- **Objetos de revolución** (taza, botella, vaso, frasco): dibujá el perfil como una polilínea
  (r, z) que sube por la pared exterior, pasa por el borde y baja por la interior hasta el
  fondo. Después aplicale un modificador **Screw** de 360° (`steps` 96,
  `use_merge_vertices`, `use_smooth_shade`) y **Subsurf** nivel 1–2. Poné vértices juntos en
  las esquinas para que el subsurf no las redondee de más.
  Medidas de una taza: radio 0,04, alto 0,097, pared de 3–4 mm.
- **Asa:** una curva Bezier en el plano XZ con `bevel_depth` de unos 6 mm y escala Y 1,35
  para que la sección quede ovalada. Hacela hija del cuerpo.

## Estampar el logo (mapeo cilíndrico en el shader)

No hace falta desplegar UVs. En el material del cuerpo:
`TexCoord.Object → SeparateXYZ → θ = atan2(x, −y)`, después
`u = θ/span + 0.5 − θ_cámara/span` y `v = (z − z0)/alto + 0.5`. Eso va al `ImageTexture`
con `extension='CLIP'` y de ahí a `Mix MULTIPLY(color cerámica, color logo)`. El factor es
`alpha × (radio > radio_interior)`, para que el logo no aparezca por dentro.
- `span = ancho_logo / radio` mantiene la proporción 1:1.
- Centrá el logo en la cara que ve la cámara: `θ_cámara = atan2(cam.x, −cam.y)`.
- El multiply hace que el blanco del logo "desaparezca" sobre cerámica blanca. Ojo: si el
  blanco del logo (1,0) es más claro que la cerámica (0,92), se nota un disco apenas más claro.

## Escena

- Madera procedural: `Wave` (bandas, distorsión 6) mezclado con `Noise` y un `ColorRamp`
  marrón oscuro → marrón medio, con `Mapping` estirado en un eje (1,5 / 25 / 1,5).
- Pared de fondo cálida, mate.
- Tres luces de área cálidas (key, fill, rim). **A escala real hacen falta potencias bajas**:
  key 14 W, fill 3 W, rim 10 W. Con 60 W quedó todo quemado.
- Cámara con lente de 85 mm y profundidad de campo. **Enfocá un Empty puesto en el frente
  del logo**, no el objeto: el foco usa el origen del objeto (la base) y el logo sale borroso.
- Cerámica: blanco roto, rugosidad 0,12, Coat Weight 0,6.

## Render

EEVEE para iterar. El final, en Cycles GPU (Metal), 256 muestras con denoise, en un proceso
aparte (`scripts/render_background.py`).

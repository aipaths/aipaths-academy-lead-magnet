# Logo 3D desde una imagen plana + intro animada

Caso real: logo raster (disco con trama de puntos, "AI", módulos laterales con LEDs, líneas
de circuito). Unos 2,5 minutos al render final (34 s en Cycles 1080p). La intro de 5 s salió
en 1 minuto de armado más 7 de render en EEVEE.

## Reconstruir, no texturizar

Para que sea 3D de verdad, armá cada elemento como objeto. No pegues la imagen en un plano.
1. Medí la imagen en píxeles (con una grilla si hace falta) y convertí con
   `P(px, py) = ((px − cx)/1000, (cy − py)/1000)` → logo de ~1 m, mirando a −Y, Z arriba.
2. Primitivas: disco = cilindro (eje Y), aro = toro, texto = curva FONT con `extrude` y
   `bevel_depth` (Arial Bold de `/System/Library/Fonts/Supplemental/` si no hay otra fuente),
   módulos = cubos con modificador Bevel, LEDs = esferas emisivas, líneas = cilindros finos.
3. **Medí después de crear:** el texto salió 17 cm cuando hacían falta 23. Leé
   `obj.dimensions` y corregí `size` con la proporción.
4. Texturas como trama de puntos, procedurales: `Voronoi 2D` con randomness 0 (grilla) y un
   umbral que varía con un `Noise` de baja frecuencia → efecto semitono.

## Luces del logo

- Emisivos con color puro e intensidad 2–4 (con AgX, a más intensidad se ven blancos).
- Brillo: el Glare (Fog Glow) del compositor, con la API de node group de 5.x
  (`references/api-5x.md`). Funciona igual en EEVEE y en Cycles.
- Estudio oscuro: piso y pared en una sola malla curvada (ciclorama), material grafito
  0,012 con rugosidad 0,28 (refleja), key/fill/rim suaves. Si el fondo sale gris claro,
  es exceso de luz, no el material.

## "Más gordito"

Interpretalo como más volumen: disco de 3 → 9 cm de espesor, letras con 6–7 cm de relieve,
aro rehecho con un toro más grueso (escalar el toro viejo no engorda la línea en la vista
de frente), módulos más profundos, LEDs ×1,5. Reubicá todo lo que va al frente según la nueva
cara frontal.

## Intro animada (120 cuadros a 24 fps)

| Tiempo | Qué pasa |
|---|---|
| 0–1,5 s | A oscuras, solo un contraluz bajo dibuja la silueta; la cámara se acerca girando (constraint Track To a un Empty) |
| 1,6–3 s | LEDs que se prenden de a uno cada 6 cuadros, con un "pop" (1,6× → 1×) |
| 3–3,5 s | Barras de luz que parpadean como un tubo que arranca (1, 0,1, 1, 0,2, 1) |
| 3,5–5 s | La luz principal sube y revela el logo; toma quieta al final |

- **Cada luz necesita su propio material** (`material.copy()`): los LEDs que comparten
  material se prenden todos juntos.
- Animá `Emission Strength` con `keyframe_insert("default_value", frame=f)` sobre el input.
- Render con EEVEE (96 muestras, raytracing), unos 3,6 s por cuadro en 1080p.
  En Cycles serían ~1 h.

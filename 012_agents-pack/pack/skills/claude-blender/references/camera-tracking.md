# Meter un objeto 3D en un video real (camera tracking)

Caso real: video de iPhone vertical 1080×1920, 30 fps, 7,7 s, HDR, con la cámara en mano
girando alrededor de un portavelas de vidrio. El logo 3D flota sobre la vela.
~47 min en total: ~13 de tracking y armado, 34 de render Cycles.

## 0. Preparar el material

- `ffprobe`: resolución, fps, rotación (los videos verticales vienen con `rotation=-90`)
  y si es HDR (`color_transfer=arib-std-b67` es HLG).
- Pasalo a cuadros JPG con `ffmpeg -i video.MOV -vf format=yuv420p -q:v 2 -start_number 1 v_%04d.jpg`.
  ffmpeg ya aplica la rotación. Dejá los cuadros y el video fuera de git.
- Mirá una hoja de contactos de 5 cuadros: ¿cámara fija o en mano? ¿hay pantallas,
  reflejos o vidrios? Son las trampas del tracking (ver punto 3).

## 1. Clip y lente

- `bpy.data.movieclips.load(primer_cuadro)` detecta la secuencia. Escena con la misma
  resolución y fps.
- Lente en las unidades del tracker: la sensor width se aplica al **ancho del clip**
  (1080 en vertical). Partí de una estimación y después barré focales (punto 4).
  En el iPhone con estabilización salió **~59,5 mm con sensor 36** (equivale a unos 34 mm
  sobre el lado largo, por el recorte de la estabilización).

## 2. Tracking (`scripts/tracking_pipeline.py`)

- Convertí la vista 3D del usuario en `CLIP_EDITOR`: así ve el tracking en vivo.
- Ajustes: pattern 41, search 201, motion model `LocRotScale`, match `PREV_FRAME`,
  correlación 0,85.
- **Sembrá cada 20 cuadros** (`detect_features`, distancia mínima 120 px) y seguí cada
  tanda hacia adelante y hacia atrás. Descartá las detecciones nuevas que caen a menos de
  60 px de un punto vivo (si no, se duplican).
- Antes de cada detección: `scene.frame_set(f)` **y** `space.clip_user.frame_current = f`.
  Si te olvidás, todos los puntos se crean en el cuadro 1 (fue nuestro primer fracaso).
- Borrá los tracks de menos de 30 cuadros. Objetivo: 50+ puntos vivos en cada cuadro.

## 3. Limpieza: cuidado con lo que engaña al solver

- **Pantallas** que reproducen video: los puntos se mueven solos.
- **Vidrio, agua, reflejos:** refractan, y los puntos "nadan". En la sesión, casi todos los
  tracks con error alto estaban sobre la vela.
  Medí la caja del objeto en ~5 cuadros, interpolá y borrá los tracks que pasan >20 % de su
  vida adentro (con 45 px de margen).
- Limpieza por error **protegiendo la cobertura**: borrá los peores (> 2,5× la mediana),
  pero salteá cualquier track cuya baja deje un cuadro con menos de 25 puntos. La limpieza
  agresiva sin esa protección rompió el solve (solo se resolvieron 67 de 231 cuadros).

## 4. Solve

- `solve_camera` con `use_keyframe_selection=True` y la focal fija al principio.
- **Barré focales** (34…78 mm), quedate con la de menor error y recién ahí probá
  `refine_intrinsics_focal_length`.
- No refines la distorsión radial con pocos puntos: inventó k1=0,69 / k2=−3,2 (sobreajuste).
  Dejá k1=k2=0.
- Error esperable con un iPhone en mano: ~2 px. La estabilización electrónica deforma cada
  cuadro y no se puede bajar mucho más. A la vista alcanza para un objeto flotando; para un
  objeto apoyado sobre algo, apuntá a menos de 1 px.

## 5. Cámara, plano y ancla (`scripts/anclar_objeto.py`)

- Cámara con constraint `CAMERA_SOLVER` (`use_active_clip`), `sensor_fit='HORIZONTAL'`, la
  misma sensor width y la focal del solve.
- **Plano del piso o la mesa:** RANSAC sobre los bundles (los puntos 3D), con 3.000
  iteraciones y tolerancia 0,012. Orientá la normal hacia el lado de la cámara.
- **Punto de anclaje:** medí el píxel del punto (por ejemplo el centro de la boca de la vela)
  en 4 cuadros bien separados, con una grilla de 100 px. Trazá rayos desde la cámara
  resuelta (`f_px = focal/sensor × ancho`) y calculá el punto más cercano a todos por
  mínimos cuadrados. Verificá la reproyección: menos de ~20 px es coherente con una medición a ojo.
- Escala: la altura sobre el plano contra el tamaño real conocido (la vela mide ~8 cm)
  da las unidades por cm.
- Empty "Ancla": Z = normal de la mesa, Y = alejándose de la cámara del cuadro 1 (así el
  objeto, que mira a −Y, mira a cámara).

## 6. Prueba antes del objeto final

Poné dos esferas emisivas en el ancla (roja arriba, verde en la base). Renderizalas solas
con fondo transparente en 7 cuadros, superponelas sobre los cuadros originales y mirá la hoja
de contactos. Si quedan quietas sobre el objeto real, el tracking sirve.

## 7. Integración y render

- Objeto hijo del ancla, ~1,5× el ancho del objeto real, flotando unos cm arriba, con
  vaivén suave (±0,5 cm) y un giro leve (±8°).
- `is_shadow_catcher` en un plano sobre la mesa **y en un cilindro con la forma del objeto
  real** (si no, la sombra se dibuja "atravesando" la vela).
- La luz tiene que imitar la del video. Un sol duro (12°) proyectó una mancha lejana que
  delataba el truco; con luz de ventana suave (sol con ángulo de 40°, más cenital) más un
  ambiente cálido de 1,4 quedó integrado.
- Cycles con fondo transparente, motion blur 0,5, 32 muestras con adaptive sampling 0,05,
  `use_persistent_data`, `max_bounces` 4: pasó de 24 a ~9 s por cuadro en 1080×1920.
- Componer con ffmpeg:
  `-i v_%04d.jpg -i l_%04d.png -i video.MOV -filter_complex "[0][1]overlay=format=auto,format=yuv420p[v]" -map "[v]" -map "2:a?"`
  (con las comillas en `2:a?`, que en zsh es obligatorio).

# Descripción de YouTube con capítulos

La página de un video (estilo YouTube en modo oscuro, recreada con formas y texto, sin logos):
entra, la descripción se abre, la página sube, la cámara se acerca a los capítulos y los resalta
de a uno. Al final aparece un cartel. Sirve para mostrar en el video dónde están los capítulos o
qué dice la descripción.

## Usarlo

```bash
npm run dev      # vista previa
npm run render   # el mp4 queda en renders/
```

## Qué cambiar

Todo está en el bloque **CONFIGURACIÓN** de `compositions/descripcion-youtube.html`:

| Variable | Qué es |
|---|---|
| `TITULO`, `CANAL`, `INICIAL`, `COLOR_AVATAR` | el video y el canal (el avatar es un círculo con una letra) |
| `SUSCRIPTORES`, `VISTAS`, `LIKES` | textos de ejemplo; `null` en `VISTAS` o `LIKES` no los dibuja |
| `DURACION_VIDEO`, `POSICION` | el total y el arranque del reloj del reproductor |
| `DESCRIPCION` | el texto de arriba de los capítulos (`\n` = salto de línea) |
| `CAPITULOS` | la lista `[["00:00", "Introducción"], …]` |
| `ABRIR_T`, `FOCO_T`, `FOCO_DUR`, `ZOOM` | cuándo se abre, cuándo se acerca la cámara, cuánto se queda y cuánto se acerca |
| `RESALTAR` | `[capítulo, segundo]`: el resaltado salta a ese capítulo (0 = el primero) en ese segundo. Alinealo con la voz como en la tarjeta de marcador. `[]` = sin resaltado |
| `CARTEL` | `{ texto, t }` o `null` |
| `ACENTO`, `COLOR_TIEMPOS`, `COLOR_RESALTADO` | colores |

Usá datos reales de tu video o textos claramente de ejemplo: no inventes vistas.

La duración es `data-duration` del root y del host en `index.html` y `FIN` en la composición.

### Tu clip en el reproductor (opcional)

El reproductor es un degradé. Para que se vea tu video, copiá el archivo a `assets/clip.mp4` y,
en la composición, poné esto dentro de `#yd-pantalla`, antes de `<div id="yd-controles">`:

```html
<video id="yd-clip" class="clip" src="assets/clip.mp4" data-start="0" data-duration="10"
       data-track-index="1" muted
       style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover"></video>
```

## Sonido

La regla: **el sonido sigue al movimiento**. Cada movimiento grande lleva su efecto; el resaltado
que salta de capítulo en capítulo va sin sonido o con un click muy bajo.

| Momento | Efecto | Nivel orientativo |
|---|---|---|
| La página entra (0 s) | whoosh suave | ~−36 dB bajo la voz |
| La página sube (`ABRIR_T` + 0,15) | whoosh | ~−36 dB |
| La cámara se acerca (`FOCO_T` − 0,8) y vuelve (`FOCO_T` + `FOCO_DUR`) | whoosh bajito | ~−38 dB |
| Aparece el cartel (`CARTEL.t`) | pop | ~−31 dB |

Efectos libres: la **biblioteca de audio de YouTube Studio** (pestaña *Efectos de sonido*),
**Pixabay** (licencia de Pixabay, sin atribución) o **Freesound** filtrando por *Creative Commons 0*.

Con la pieza en 300 s del video: whoosh de la subida en 301,35 s y pop del cartel en 307,3 s.

```bash
ffmpeg -i video.mp4 -i whoosh.wav -i pop.wav -filter_complex \
  "[1:a]volume=-36dB,adelay=301350:all=1[w];[2:a]volume=-31dB,adelay=307300:all=1[p]; \
   [0:a][w][p]amix=inputs=3:duration=first:normalize=0[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k con-sonido.mp4
```

Los niveles son un punto de partida para una voz alrededor de −16 LUFS: ajustá de oído.

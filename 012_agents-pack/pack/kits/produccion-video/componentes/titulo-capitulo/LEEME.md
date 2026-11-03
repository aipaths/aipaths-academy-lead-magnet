# Título de capítulo

Un velo oscuro cae sobre tu toma, el título sube y una barra se dibuja debajo. A los 2,5 s
se va solo. Va justo cuando decís en voz alta el cambio de etapa («ahora, la idea»).

## Usarlo

```bash
npm run dev                  # vista previa en el navegador (con una toma de ejemplo atrás)
npm run render:transparente  # el título solo, con fondo transparente (.mov con alfa)
```

El `.mov` lo ponés en una pista arriba de tu video, en tu editor o con FFmpeg:

```bash
ffmpeg -i video.mp4 -itsoffset 47.2 -i renders/titulo-capitulo.mov \
  -filter_complex "[0:v][1:v]overlay=eof_action=pass[v]" -map "[v]" -map 0:a -c:a copy con-titulo.mp4
```

(`47.2` = el segundo del video donde entra el título; tomalo del transcript.)

## Qué cambiar

Todo está en el bloque **CONFIGURACIÓN** de `compositions/titulo-capitulo.html`:

| Variable | Qué es |
|---|---|
| `TITULO` | el texto, corto (1 a 3 palabras) |
| `TAMANO` | tamaño en px para un cuadro de 1920×1080 (~16 caracteres entran a 150) |
| `COLOR_TEXTO`, `COLOR_BARRA`, `COLOR_VELO` | colores; el velo es lo que oscurece tu toma |
| `DURACION` | cuánto dura; si la cambiás, cambiá también `data-duration` de `#tc-capa` y del host en `index.html` |
| `ENTRA_TITULO`, `ENTRA_BARRA`, `SALE` | los momentos de la animación, en segundos desde que aparece |

Un título por capítulo: duplicá el archivo o cambiá `TITULO` y renderizá de nuevo.
Que termine **antes** del próximo corte de cámara.

## Sonido

La regla: **el sonido sigue al movimiento**. Lo que entra moviéndose suena; lo que se apaga
fundiéndose, no.

| Momento | Efecto | Nivel orientativo |
|---|---|---|
| El título sube (`ENTRA_TITULO`, 0,12 s después de que aparece) | whoosh corto | ~−36 dB bajo la voz |
| La salida (fundido) | nada | — |

Efectos libres: la **biblioteca de audio de YouTube Studio** (pestaña *Efectos de sonido*),
**Pixabay** (licencia de Pixabay, sin atribución) o **Freesound** filtrando por licencia
*Creative Commons 0*. Bajá un whoosh corto (menos de 1 s).

Ponerlo en su tiempo con FFmpeg (`adelay` en milisegundos, `amix` lo suma a tu audio):

```bash
# título en 47.2 s → whoosh en 47.32 s = 47320 ms
ffmpeg -i con-titulo.mp4 -i whoosh.wav -filter_complex \
  "[1:a]volume=-36dB,adelay=47320:all=1[w];[0:a][w]amix=inputs=2:duration=first:normalize=0[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k con-sonido.mp4
```

Los niveles son un punto de partida para una voz alrededor de −16 LUFS: ajustá de oído hasta
que se note sin tapar ninguna palabra.

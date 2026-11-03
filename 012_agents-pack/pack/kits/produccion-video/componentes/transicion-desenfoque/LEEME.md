# Transición con desenfoque

Esconde un corte entre dos tomas: medio segundo alrededor del corte se desenfoca con una curva
suave, nítido en los bordes y al máximo justo en el corte. Sirve para saltar de una toma a otra
(o de la cámara a la pantalla) sin el golpe de un corte seco.

Es un script de Python (numpy + OpenCV) que lee y escribe con FFmpeg. Con
[uv](https://docs.astral.sh/uv/) no instalás nada a mano:

```bash
# el video entero, con la transición puesta (el audio no se toca)
uv run --with numpy --with opencv-python-headless python transicion_desenfoque.py \
  video.mp4 --centro 12.4 --mitad 0.25 --pegar -o video-con-transicion.mp4

# sólo el tramo desenfocado, para ponerlo en una pista de tu editor (te dice en qué segundo va)
uv run --with numpy --with opencv-python-headless python transicion_desenfoque.py \
  video.mp4 --centro 12.4 --mitad 0.25 -o tramo.mp4
```

## Opciones

| Opción | Qué es |
|---|---|
| `entrada` | el video ya cortado, con las dos tomas pegadas |
| `--centro` | el segundo exacto del corte (de tu editor o del mapa del corte) |
| `--mitad` | cuánto dura antes y después del corte; `0.25` = medio segundo en total. Más largo se nota más |
| `--fuerza` | el desenfoque máximo como fracción del ancho; `0.012` ≈ 23 px en 1920 |
| `--pegar` | devuelve el video entero en vez del tramo |
| `-o` | el archivo de salida |

El tramo se ajusta a los cuadros del video (lee los fps solo). Para varias transiciones, corré el
script una vez por corte, cada vez sobre la salida anterior.

## Sonido

La regla: **el sonido sigue al movimiento**. Un desenfoque rápido lleva un whoosh con su punto
más fuerte **en el corte**, no al principio del tramo.

| Momento | Efecto | Nivel orientativo |
|---|---|---|
| El pico de la transición (`--centro`) | whoosh corto | ~−36 dB bajo la voz |

Efectos libres: la **biblioteca de audio de YouTube Studio** (pestaña *Efectos de sonido*),
**Pixabay** (licencia de Pixabay, sin atribución) o **Freesound** filtrando por *Creative Commons 0*.

Medí en qué momento del archivo está el pico del whoosh (abrilo en cualquier editor de audio; por
ejemplo 0,18 s) y arrancalo ese tiempo antes del corte: corte en 12,4 s → `adelay` de 12 220 ms.

```bash
ffmpeg -i video-con-transicion.mp4 -i whoosh.wav -filter_complex \
  "[1:a]volume=-36dB,adelay=12220:all=1[w];[0:a][w]amix=inputs=2:duration=first:normalize=0[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k con-sonido.mp4
```

Los niveles son un punto de partida para una voz alrededor de −16 LUFS: ajustá de oído.

## Probarlo sin un video tuyo

```bash
ffmpeg -f lavfi -i "testsrc2=size=1920x1080:rate=30:duration=3" \
  -f lavfi -i "smptehdbars=size=1920x1080:rate=30:duration=3" \
  -filter_complex "[0:v][1:v]concat=n=2:v=1:a=0[v]" -map "[v]" -pix_fmt yuv420p prueba.mp4
uv run --with numpy --with opencv-python-headless python transicion_desenfoque.py \
  prueba.mp4 --centro 3 --pegar -o prueba-transicion.mp4
```

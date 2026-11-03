# Tarjeta de marcador

La tarjeta de una etapa del flujo: el nombre arriba, cuatro columnas (**Mi tiempo**, **Tiempo de
tarea**, **Costo**, **Calidad**) que cargan su valor de a una (`+`, `=`, `−`, `++`, `=+`…) y el
**nivel de automatización** abajo (*Automático*, *Asistido* o *Manual*). Trazo a mano tipo
pizarra, con semilla fija: cada render sale idéntico. Ocupa la pantalla entera mientras hablás
de esa etapa.

## Usarlo

```bash
npm run dev      # vista previa
npm run render   # el mp4 queda en renders/
```

## Qué cambiar

Todo está en el bloque **CONFIGURACIÓN** de `compositions/tarjeta-marcador.html`:

| Variable | Qué es |
|---|---|
| `ETAPA` | el título de la tarjeta |
| `COLUMNAS` | los cuatro nombres de columna |
| `VALORES` | un valor por columna: con `+` sale verde, sólo `−` sale rojo, el resto neutro |
| `NIVEL` | `"Automático"`, `"Asistido"` o `"Manual"` (cada uno con su color) |
| `TIEMPOS_VALORES` | **el segundo en que carga cada valor** (ver abajo) |
| `TIEMPO_NIVEL` | el segundo en que aparece el nivel |
| `ARMADA` | `true` = la tarjeta entra ya dibujada (cuando vuelve a pantalla varias veces) |
| `SEMILLA` | cambia el temblor del trazo |
| `COLORES` | fondo, tinta, cajas y el color de cada nivel |

La duración en pantalla es `data-duration` de `#tm-capa` (y la del host en `index.html`).

### Alinear cada valor con la voz

`TIEMPOS_VALORES` es una lista con un número por columna, en segundos **desde que aparece la
tarjeta**. Sacá el segundo de cada palabra del transcript con tiempos (por ejemplo whisper) y
restale el inicio de la tarjeta:

```js
// la tarjeta entra en 125,0 s; decís «mi tiempo… baja» en 126,4 y «costo» en 129,1
const TIEMPOS_VALORES = [1.4, 2.2, 4.1, 5.0];
```

- `0` o negativo: el valor ya está desde el primer cuadro (lo dijiste antes).
- `null`: no aparece en esta tarjeta. Sirve para cargar **una columna por tarjeta** cuando cada
  valor se dice en un momento distinto del video: varias tarjetas con `ARMADA = true`, y en cada
  una los valores ya dichos en `-1`, el nuevo con su segundo y el resto en `null`.

### Otra etapa

Duplicá `compositions/tarjeta-marcador.html` con otro nombre, cambiale el `data-composition-id`
(y la clave de `window.__timelines` al final) y sumá un host en `index.html` con su `data-start`.

### Letra de pizarra (opcional)

Viene con Nunito (incluida en HyperFrames). Para el look de Excalidraw usá **Excalifont**
(licencia SIL OFL, en el repo de Excalidraw en GitHub): guardá el `.woff2` en `assets/fonts/` y
en el `<style>` de la composición sumá

```css
@font-face { font-family: "Excalifont"; src: url("assets/fonts/Excalifont-Regular.woff2") format("woff2"); }
```

y cambiá `font-family: "Nunito"` por `font-family: "Excalifont"` en `#tm-svg`.

## Sonido

La regla: **el sonido sigue al movimiento**. Cada caja entra con un rebote, así que cada una lleva
su pop, exactamente en su tiempo.

| Momento | Efecto | Nivel orientativo |
|---|---|---|
| Cada valor que carga (`TIEMPOS_VALORES`) | pop | ~−31 dB bajo la voz |
| El nivel (`TIEMPO_NIVEL`) | pop | ~−31 dB |
| La tarjeta se dibuja (en 0 s, si no es `ARMADA`) | whoosh suave, opcional | ~−36 dB |

Efectos libres: la **biblioteca de audio de YouTube Studio** (pestaña *Efectos de sonido*),
**Pixabay** (licencia de Pixabay, sin atribución) o **Freesound** filtrando por *Creative Commons 0*.

El mismo pop cinco veces, cada uno en su tiempo (tarjeta en 125 s + los tiempos de la lista):

```bash
ffmpeg -i video.mp4 -i pop.wav -filter_complex \
  "[1:a]volume=-31dB,asplit=5[a][b][c][d][e]; \
   [a]adelay=126400:all=1[p1];[b]adelay=127200:all=1[p2];[c]adelay=129100:all=1[p3]; \
   [d]adelay=130000:all=1[p4];[e]adelay=131000:all=1[p5]; \
   [0:a][p1][p2][p3][p4][p5]amix=inputs=6:duration=first:normalize=0[out]" \
  -map 0:v -map "[out]" -c:v copy -c:a aac -b:a 192k con-pops.mp4
```

Los niveles son un punto de partida para una voz alrededor de −16 LUFS: ajustá de oído.

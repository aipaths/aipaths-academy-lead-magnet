# Los prompts del video

Los ocho pedidos del video, en el orden en que aparecen, uno por capa. Los siete primeros son
tal cual los dicto; el octavo (el revisor sin contexto) en el video lo describo y no lo dicto,
así que su texto vive en la skill.

Todos se pegan en una sesión de Claude Code abierta en la carpeta del video. Cambiá lo que
dice entre corchetes por lo tuyo.

| # | Prompt | Capa |
|---|---|---|
| 1 | [Transcribir y cortar](#1-transcribir-y-cortar) | 1. Una toma limpia |
| 2 | [Dónde va una imagen](#2-dónde-va-una-imagen) | 2. La imagen |
| 3 | [Dónde va texto, y de qué tipo](#3-dónde-va-texto-y-de-qué-tipo) | 3. El texto |
| 4 | [La biblioteca de 30 efectos](#4-la-biblioteca-de-30-efectos) | 4. Sonido |
| 5 | [Qué sonido lleva cada movimiento](#5-qué-sonido-lleva-cada-movimiento) | 4. Sonido |
| 6 | [La página de revisión](#6-la-página-de-revisión) | Mi rol |
| 7 | [Anotar cada corrección y volverla chequeo](#7-anotar-cada-corrección-y-volverla-chequeo) | Mi rol |
| 8 | [El revisor sin contexto](#8-el-revisor-sin-contexto) | Mi rol |

---

## 1. Transcribir y cortar

**Cuándo usarlo:** con la grabación a cámara terminada, antes de tocar cualquier otra cosa.
Es la base: cada texto, animación y sonido de después se engancha a una palabra de acá.

**Qué tenés que tener antes:** el video grabado y ffmpeg instalado. Si querés que
transcriba en tu compu, un transcriptor local con tiempo por palabra (la skill explica
cómo en `mapa-del-corte.md`).

```text
Transcribí este video con el tiempo de cada palabra. En las tomas repetidas quedate con la última, y cortá los silencios de más de un segundo, sin cortar adentro de una frase.
```

Por qué dice eso:
- **La última toma** gana: cuando me equivoco repito la frase, y la última casi siempre es la mejor.
- **Más de un segundo:** si cortás pausas de medio segundo hay cortes por todos lados y se
  nota; si esperás al segundo y medio se te escapan silencios que tenían que irse.
- **Nunca adentro de algo dicho de corrido.**

## 2. Dónde va una imagen

**Cuándo usarlo:** con el corte ya limpio, antes de generar ninguna animación. Mirar la
propuesta primero te ahorra un montón de tiempo.

**Qué tenés que tener antes:** el transcript con tiempos del paso 1. Si tenés B-roll real
(clips de tu producto, de tu pantalla), una carpeta donde estén, y que Claude sepa qué es cada uno.

```text
Leé el guion con los tiempos, marcá los momentos que pueden llevar una imagen y qué pondrías en cada uno.
```

Después de la propuesta, el orden de preferencia es:
- **Real:** tus clips guardados en una carpeta (le explicás qué es cada uno y sabe dónde buscarlos)
  o una captura de la página del producto.
- **Generado:** si es algo que no existe o lo querés más especial, una animación. Se hace en
  tres pasos: Claude la escribe en código como una página web, HyperFrames saca una captura
  de cada cuadro y ffmpeg las une en un video.

Esto se lo explicás una sola vez. Con cada animación que te guste, vas armando una carpeta de
recursos, una herramienta para las capturas, otra para las animaciones y un catálogo de lo que
ya probaste y quedó.

## 3. Dónde va texto, y de qué tipo

**Cuándo usarlo:** cuando ya están puestas las imágenes. Texto va último de lo visual, y es
la capa más fácil de arruinar.

**Qué tenés que tener antes:** el transcript con tiempos y las imágenes puestas.

```text
Leé el guion con los tiempos, fijate en las partes que no tienen nada encima y decime dónde pondrías texto y de qué tipo.
```

Los cuatro tipos que más uso, y cuándo va cada uno:
- **Overlay:** arranca un tema nuevo. Dos o tres palabras grandes en el centro, como el
  título de un capítulo.
- **Al costado:** enumero cosas, explico qué va a pasar o una idea que tiene que quedar. Las
  líneas aparecen una abajo de la otra a medida que las digo; una idea por línea.
- **Subtítulos:** una frase que tiene que quedar entera. Abajo, palabra por palabra, al ritmo
  de la voz.
- **Frase al centro:** algo corto que pegue y se vaya, un nombre o un llamado.

No los mezcles: si en el costado escribís todo lo que decís, se lee mal y tapa la imagen. Si
en un tramo Claude no propone nada, está bien: no todo lleva texto. Y como tiene el segundo
exacto de cada palabra, cada texto entra justo cuando lo decís.

## 4. La biblioteca de 30 efectos

**Cuándo usarlo:** una sola vez, antes de sonorizar tu primer video. Claude no escucha: lo
que no está en texto, no lo ve. Este pedido convierte los sonidos en una tabla que sí entiende.

**Qué tenés que tener antes:** nada. Si querés ahorrarte el primer paso, usá los 30 de este
kit (`efectos-de-sonido/`): ya vienen medidos en `mediciones.csv` y podés pedirle a Claude
sólo la medición de los que sumes vos.

```text
Armame una biblioteca de 30 efectos de sonido: 10 pops, 10 whooshes y 10 risers. Después medí cada uno y anotá en un archivo cuánto dura, cuándo arranca, dónde está el pico y qué tan fuerte suena.
```

Los tres que más importan:
- **Pop:** algo aparece con rebote.
- **Whoosh:** algo entra de costado.
- **Riser:** vas a decir algo importante y tiene que captar la atención. Arranca antes, sube
  en la pausa y termina dejando que se sienta el silencio.

Con esa tabla y el tiempo de cada palabra, Claude encuentra los huecos entre palabras y el
momento justo de cada efecto.

## 5. Qué sonido lleva cada movimiento

**Cuándo usarlo:** con la imagen y el texto ya puestos, y la biblioteca armada.

**Qué tenés que tener antes:** la biblioteca medida (paso 4) y el transcript con tiempos.

```text
Mirá dónde aparece o se mueve algo en el video y proponeme qué sonido lleva cada uno.
```

La regla de fondo: el sonido acompaña lo que se mueve. Un texto con rebote lleva pop; un panel
que entra de costado, whoosh; antes de algo importante, riser. Si no se mueve nada, no suena
nada. La música va por separado: ver `musica/LEEME.md`.

## 6. La página de revisión

**Cuándo usarlo:** una vez, para tener dónde corregir. Es el lugar donde le das feedback:
miro el video como cualquier video y, cuando algo no me gusta, pongo pausa y escribo.

**Qué tenés que tener antes:** nada, la arma Claude.

```text
Armame una página donde pueda ver el video, poner pausa y dejar un comentario pegado a ese segundo.
```

El comentario queda marcado en la barra. Como Claude tiene el segundo de cada palabra, sabe
exactamente de qué le hablás.

## 7. Anotar cada corrección y volverla chequeo

**Cuándo usarlo:** una vez, al empezar a corregir. Un comentario solo no alcanza: si no queda
guardado, en el próximo video te lo vuelve a hacer.

**Qué tenés que tener antes:** la página del paso 6 (o cualquier forma de dar feedback) y, si
usás la skill, su archivo `registro-de-correcciones.md`.

```text
Cada vez que te corrijo algo, anotalo con la regla que hay detrás. Y si te corrijo lo mismo dos veces, armá un chequeo que lo revise solo antes de mostrarme el video.
```

El circuito: cada corrección se anota con su regla; si se repite dos veces, deja de ser una
nota y se vuelve un chequeo, un script chico que corre solo antes de que te llegue el video.

## 8. El revisor sin contexto

**Cuándo usarlo:** antes de que veas nada. El que editó siempre cree que quedó bien; otro
Claude que no sabe cómo se hizo lo mira con ojos nuevos: mira los cuadros, lee lo que se dice
y decide si te lo pasa o si lo devuelve para arreglar.

**Qué tenés que tener antes:** la skill `editor-de-video` instalada (ver `LEEME.md`).

El texto de este prompt no se duplica acá: está completo en
`../../skills/editor-de-video/references/revisor-sin-contexto.md`, junto con qué material
recibe (hojas de cuadros con su segundo, las palabras con tiempo, las reglas y el audio
medido) y cómo usarlo. Lo importante: un agente nuevo, sin memoria, por cada bloque y por
cada ronda.

# Revisión y entrega

## Revisar por clips numerados

Mandar el video entero para revisar no sirve: quien revisa no sabe dónde están los cambios y
no puede dar feedback exacto.

- **Un clip por cambio**, sólo ese tramo con 1–3 s de contexto antes y después, **con sonido**.
- **Numerados dentro de la versión:** `v02.1_titulo-intro.mp4`, `v02.2_dato-precio.mp4`…
  La respuesta llega como «en la v02.3 el pop está alto» y se corrige o se cierra.
- **Una carpeta por ronda** (`v02/`, `v03/`…). Lo que se corrige de una ronda no se agrega a
  su carpeta: va a la siguiente, renumerado. Así se revisa una versión a la vez.
- **Un LEEME por carpeta:** qué mirar en cada número, en qué minuto del video y qué hay que
  decidir.
- Si varios agentes arman piezas en paralelo, el que orquesta les asigna el número y junta
  todo. Los renders, en serie o con un lock por archivo (`mkdir` es atómico); nunca esperar
  con `pgrep -f`, que puede encontrar el propio shell.

## Final

1. Con todos los clips aprobados, el video entero en baja (720p) para el visto bueno completo.
2. **El 4K recién con el OK.** Es el render caro: hacerlo antes es tirarlo con la primera corrección.
3. **Componer en disco local.** Leer y unir varios GB por red puede tardar más que el render;
   el archivo final se mueve al almacenamiento compartido después.
4. Mantené la duración idéntica al corte: así los capítulos y la pantalla final siguen valiendo.
5. Antes de entregar: 10–18 cuadros clave del render, el loudness del archivo final y una
   suma de verificación (md5) de cada archivo copiado.

## Piezas para un editor tradicional

Si el montaje lo hace una persona en Final Cut, Premiere o DaVinci, entregá cada pieza sola:
ProRes 4444 con alfa, a la resolución y fps del proyecto, con el timecode de inicio en el
nombre (`00-01-12-05_titulo-capitulo.mov`), más los efectos como WAV sueltos nombrados igual.
Se arrastran a la línea de tiempo sin pensar dónde van.

## Capítulos de YouTube

Salen del corte final, no del guion: el segundo en que el creador dice el cambio de etapa.
El primero va en `0:00`, mínimo tres, cada uno de 10 s o más.

## Si el video ya estaba subido

YouTube no deja reemplazar el archivo. Se sube como video nuevo y se rehace lo que colgaba del
viejo (título, descripción, miniatura, playlist, pantalla final, programación). Respaldá antes
la metadata del viejo. Para evitarlo: editar antes de subir.

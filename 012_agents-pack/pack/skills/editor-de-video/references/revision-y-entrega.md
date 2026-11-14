# Revisión y entrega

## Revisar por bloque, con la lista de qué cambió

Mandar el video entero sin más no sirve: quien revisa no sabe dónde están los cambios.
Tampoco un clip suelto por cambio: se pierde el contexto de la voz y la cantidad de archivos
abruma.

- **Un archivo por bloque** (un capítulo, varios o el video entero), con todos los cambios
  puestos y **con sonido**. En las rondas de corrección también: el bloque entero, no parches.
- **Una lista corta de qué cambió, con el minuto de cada cambio.** Es lo que le dice a la
  persona qué mirar.
- **Cada ronda es una versión nueva** (`v02/`, `v03/`…), renumerada; no se suma a una que ya
  vio.
- **Antes de la persona, el revisor sin contexto** (`revisor-sin-contexto.md`). Sólo llega lo que
  devolvió A REVISAR.
- **Lo que la persona tiene que decidir va en la charla,** no adentro de un archivo.
- **Cada comentario se anota** con su segundo en `registro-de-correcciones.md`.
- Si varios agentes arman bloques en paralelo, uno coordina: asigna los números, revisa cada
  bloque contra el transcript y recién ahí lo publica. Los renders, en serie o con un lock por
  archivo (`mkdir` es atómico); nunca esperar con `pgrep -f`, que puede encontrar el propio shell.

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

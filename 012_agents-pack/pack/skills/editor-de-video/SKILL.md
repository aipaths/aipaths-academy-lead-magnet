---
name: editor-de-video
description: Editar un video hablado con un agente, por capas (corte y cámara, lo que tapa la cámara, texto, sonido), con un catálogo de recursos, un revisor sin contexto y un registro de correcciones. Disparar con "editá este video", "sumale títulos y efectos", "mezclá el audio", "revisá esta edición".
---

# Editor de video

Para cuando tenés un video hablado (a cámara, tutorial con pantalla) y querés que un agente
haga lo que lleva horas a mano: cortar, tapar, poner texto, sonorizar y entregar el master.

**«Editame este video» no alcanza.** Editar no es una tarea: son capas, cada una con su
criterio. Si se las pedís todas juntas no sabés cuál falló ni qué regla corregir. Esta skill
las arma de a una, en orden, y deja escrito lo que funcionó y lo que no.

La regla que ordena todo: **lo agregado tiene que sentirse parte de lo que se dice.** Si una
pieza se adelanta, aparece sin que nadie la nombre o suena distinto de cómo se mueve, se
nota pegada encima.

Sirve con cualquier editor (Final Cut, Premiere, DaVinci) o sin editor: Claude Code, ffmpeg,
whisper.cpp y, opcional, HyperFrames para las piezas animadas. Dice **qué** hacer y **en qué
orden**; la sintaxis de cada herramienta vive en sus docs.

## Las cuatro capas (en este orden)

Cada capa se termina y se mira antes de pasar a la siguiente: una capa de arriba no arregla
una de abajo.

1. **Corte y cámara** → `references/capa-1-corte-y-camara.md`
   Marcas al grabar, corte desde el transcript, gana la última toma, no se corta lo dicho de
   corrido, punch-in con los ojos en el mismo lugar.
2. **Lo que tapa la cámara** → `references/capa-2-lo-que-tapa-la-camara.md`
   B-roll (lo real, capturado) o animación (lo que no existe, hecho con código). Si se puede
   mostrar lo real, va lo real.
3. **Texto en pantalla** → `references/capa-3-texto.md`
   Primero: ¿hace falta? Si hace falta, aparece cuando se dice.
4. **Sonido** → `references/sonido.md`
   Sigue al movimiento. Música propia, por debajo. Master a −16 LUFS.

Antes de la capa 1 se arma el mapa del corte (`references/mapa-del-corte.md`); antes de
grabar, `references/grabar-para-editar.md`.

## Flujo

1. **Mapa del corte** (~5 min): palabras con tiempo, silencios, hoja de contactos.
2. **Capa 1.** Corte limpio. Revisá antes de seguir.
3. **Plan de piezas** (capas 2 y 3): una tabla con pieza, palabra que la dispara, segundo,
   duración y próximo corte. Cada fila pasa las reglas de abajo antes de renderizar.
4. **Piezas.** Una por archivo, al mismo fps de la grabación. Un recurso que nunca usaste se
   prueba aparte, de a uno, antes de meterlo en un video entero. Se busca en el catálogo:
   `references/catalogo-de-recursos.md`.
5. **Capa 4.** Sonido, música y master.
6. **Revisor sin contexto**, antes de mostrarle nada a la persona:
   `references/revisor-sin-contexto.md`.
7. **Revisión humana** en bloques con la lista de qué cambió: `references/revision-y-entrega.md`.
8. **Registro de correcciones**: cada corrección es una fila con su regla:
   `references/registro-de-correcciones.md`.
9. **Final** en baja para el visto bueno; el 4K recién con el OK, compuesto en disco local.

## Reglas de las piezas

- **Cada pieza entra en la palabra que la nombra.** Arranca 0,1–0,2 s antes, así está entera
  cuando suena. Un subtítulo, un cuadro antes.
- **Nada en pantalla que no se diga.** Si el número que dice no coincide con el de la
  pantalla, la pieza no va y se avisa.
- **Si no mira a cámara, algo lo tapa** (imagen, B-roll o animación), nunca texto solo. Si mira
  para otro lado antes de que entre la pieza, la pieza entra antes (J-cut).
- **Apenas termina un B-roll o una tarjeta, se vuelve a la cara.** Una tarjeta a pantalla
  completa no pasa de ~20 s.
- **Nunca tapar lo que se está explicando** (la UI, el click que importa, el número).
- **Una pieza que no aclara, prueba, enfatiza o da aire, sale.**
- **Un recurso nuevo no se estrena en un video entero.** Se prueba solo y queda en el catálogo
  como candidato.

## Errores comunes

- Pedir todas las capas juntas y no saber cuál falló.
- Decorar un corte que no se sostiene con voz y cortes simples. Primero la historia.
- Ubicar piezas a ojo en vez de sobre los tiempos por palabra.
- Cortar adentro de una frase dicha de corrido.
- Reemplazar con una animación lo que se podía capturar real.
- Texto que repite lo que la voz y la imagen ya dicen.
- Un efecto sobre un corte escondido (ver `mapa-del-corte.md`).
- Música con ducking fuerte que sube y baja en cada pausa.
- Mandar el video entero a revisar: nadie sabe qué mirar.
- Corregir la misma cosa por tercera vez a mano: es un chequeo que falta.
- Dar por bueno un render porque terminó: mirá 10–18 cuadros clave y medí el loudness.

## Si tenés el pack completo

`../../kits/produccion-video/` trae el paso a paso y componentes listos (transición con
desenfoque y whoosh, título de capítulo, tarjeta que carga valores, descripción con
capítulos). La skill funciona igual sin el kit.

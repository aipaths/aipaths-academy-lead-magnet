---
name: editor-de-video
description: Editar un video hablado con un agente: mapa del corte, piezas en la palabra, sonido, master y revisión por clips. Disparar con "editá este video", "sumale títulos y efectos", "mezclá el audio".
---

# Editor de video

Para cuando ya tenés el corte de un video hablado (a cámara, tutorial con pantalla) y
querés que un agente le sume lo que lleva horas a mano: títulos, datos, B-roll, tarjetas,
subtítulos, efectos de sonido, música y el master del audio.

La regla que ordena todo: **lo agregado tiene que sentirse parte de lo que se dice.** Si
una pieza se adelanta, aparece sin que nadie la nombre o suena distinto de cómo se mueve,
se nota como pegada encima.

Sirve con cualquier editor (Final Cut, Premiere, DaVinci) o sin editor: las piezas se
pueden renderizar aparte (HyperFrames u otro motor de código a video) y componer con
ffmpeg. La skill dice **qué** hacer y **en qué orden**; la sintaxis de cada herramienta
vive en sus propias skills o docs.

## Flujo

1. **Mapa del corte** (~5 min). Transcript con tiempos por palabra (whisper.cpp), silencios,
   hoja de contactos, cortes duros y cambios de escena. Comandos en `references/mapa-del-corte.md`.
   Sin mapa, cada pieza se ubica a ojo y llega tarde.
2. **Plan de piezas.** Una tabla: pieza, palabra que la dispara, segundo, duración, próximo
   corte. Cada fila tiene que pasar las reglas de abajo antes de renderizar nada.
3. **Piezas.** Una por archivo, al mismo fps de la grabación (25 vs 30 duplica cuadros).
   Lo que nunca usaste en un video se prueba aparte, de a uno, antes de meterlo en un video entero.
4. **Sonido y música** según cómo se mueve cada pieza: `references/sonido.md`.
5. **Master** a −16 LUFS integrados, true peak ≤ −1,5 dBTP: `references/sonido.md`.
6. **Revisión por clips numerados**, no el video entero: `references/revision-y-entrega.md`.
7. **Final** en baja para el visto bueno completo; el 4K recién con el OK, compuesto en disco local.

## Reglas de las piezas

- **Cada pieza entra en la palabra que la nombra.** Título, dato, B-roll o tarjeta: arranca
  0,1–0,2 s antes de esa palabra, así está entera cuando suena. Un subtítulo, un cuadro antes.
- **Nada en pantalla que no se diga.** Si el creador no lo menciona, no va. Si el número que
  dice no coincide con el de la pantalla, la pieza no va y se avisa.
- **Títulos de capítulo sólo donde el creador lo dice en voz alta**, en esa palabra y con su
  vocabulario («el script», no «el guion» si dijo script). Forzar un capítulo que no nombra choca.
  Mínimo ~2 s en pantalla para leerse, y que termine antes del próximo corte.
- **Subtítulos en tramos cortos**, a cámara: grupos de 2–4 palabras cortados en la puntuación,
  sin terminar en «de», «la», «que». Quemados se duplican con los subtítulos de la plataforma:
  por eso son tramos, no el video entero. Nunca sobre una pantalla que es la prueba.
- **Tarjetas a pantalla completa, cortas** (≤ ~20 s). Cuando carga el último valor, se corta
  y se vuelve a la cara. Lo mismo después de un B-roll: volver a la persona apenas termina.
- **Nunca tapar lo que se está explicando** (la UI, el click que importa, el número).
- **Una pieza que no aclara, prueba, enfatiza o da aire, sale.**

## Antes de grabar el próximo

Lo que más acelera la edición se decide al grabar: cámara y pantalla por separado, decir en
voz alta cada cambio de etapa y cada valor, marcadores con el texto que querés en pantalla.
Detalle en `references/grabar-para-editar.md`.

## Si tenés el pack completo

`../../kits/produccion-video/` trae el paso a paso y componentes listos: transición con
desenfoque + whoosh, título de capítulo, tarjeta de marcador que carga valores y la
descripción de YouTube con capítulos. La skill funciona igual sin el kit.

## Errores comunes

- Decorar un corte que no se sostiene con voz y cortes simples. Primero la historia.
- Ubicar piezas a ojo en vez de sobre los tiempos por palabra.
- Poner un efecto sobre un corte escondido (ver `references/mapa-del-corte.md`).
- Música con ducking fuerte que sube y baja en cada pausa.
- Comprimir otra vez una voz que ya viene comprimida.
- Mandar el video entero a revisar: nadie sabe qué mirar.
- Componer el 4K leyendo o escribiendo por red.
- Dar por bueno un render porque terminó: mirá 10–18 cuadros clave y medí el loudness.

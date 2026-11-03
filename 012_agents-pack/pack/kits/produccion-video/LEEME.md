# Producción de video con agentes

> 🎥 Viene del video **[Claude ya puede hacer un video entero](https://www.youtube.com/watch?v=MNeqNsd5Os8&list=PLItELtCfBA39BbCy0gS8eO2OGn5xEO_cB)**.
> Más videos con su parte del pack: `../../README.md` → "¿Venís de un video?".

Un video de 10 minutos me llevaba unas 11 horas, de la idea al análisis. Con agentes
bajó a unas 2 horas y 20. Este kit es el paso a paso de cada etapa: qué le das al agente,
qué te devuelve y qué sigue siendo tuyo.

## Qué hay acá

| Archivo | Para qué |
|---|---|
| `LEEME.md` | este paso a paso, etapa por etapa |
| `prompts/capitulos-y-descripcion.md` | capítulos, descripción y tags a partir del transcript |
| `componentes/` | piezas de edición listas: título de capítulo, tarjeta que carga valores, descripción de YouTube con capítulos y la transición con desenfoque, cada una con su sonido |
| `../../skills/editor-de-video/` | la skill que edita: dónde va cada pieza, el sonido, la música, el volumen final y la revisión |

## Lo que necesitás

- Claude Code (o cualquier agente de código que lea skills)
- FFmpeg y Node 22.18 o más nuevo
- [whisper.cpp](https://github.com/ggml-org/whisper.cpp) para el transcript con tiempos (corre local y gratis)
- [HyperFrames](https://github.com/heygen-com/hyperframes) para los componentes animados: `npx skills add heygen-com/hyperframes --all`

## Antes de empezar: medí tu flujo

Si no medís, no sabés si el agente mejoró algo o sólo lo cambió de lugar. Por cada etapa,
anotá cuánto te lleva hoy y compará después en cuatro cosas:

| Etapa | Mi tiempo | Tiempo de tarea | Costo | Calidad | Nivel |
|---|---|---|---|---|---|
| Idea | | | | | |
| Título y miniatura | | | | | |
| Script | | | | | |
| Grabar | | | | | |
| Edición | | | | | |
| Publicación | | | | | |
| Análisis | | | | | |

- **Mi tiempo:** las horas tuyas, frente a la compu.
- **Tiempo de tarea:** lo que tarda en estar hecho, aunque lo haga el agente mientras hacés otra cosa.
- **Costo:** lo que pagás (editor, herramientas, tokens).
- **Calidad:** si quedó mejor, igual o peor que cuando lo hacías vos.
- **Nivel:** *Automático* (lo hace solo), *Asistido* (lo hace con vos) o *Manual* (lo hacés vos).

Marcá cada celda con `+`, `=` o `−`. Una etapa que baja tu tiempo pero baja la calidad no es una mejora.

## Etapa por etapa

### 1. La idea — Automático
Un agente arma una vez por semana un reporte del canal y del nicho: qué videos despegan,
qué se busca y qué formatos se repiten. Vos elegís la idea; el agente no.

- Dale fuentes concretas (tus videos, 10–20 canales del nicho, las búsquedas de YouTube) y que
  cite cada número de dónde salió. **Si el número no está en una fuente, no existe.**
- Pedile ideas con título, formato y qué mostraría la miniatura, no temas sueltos.

### 2. Título y miniatura — Asistido
El agente propone títulos y conceptos de miniatura a partir de los videos que funcionan en el
nicho (y en nichos vecinos). Vos elegís y das feedback concepto por concepto.

- Pedile 8–12 conceptos distintos, no variaciones del mismo.
- Que revise cada miniatura otro agente, en frío, sin saber cómo se armó.

### 3. El script — Manual
Bullets, no un guion leído. Capítulos como una cadena de preguntas, la intro escrita entera.
Es tu voz: es lo que le da identidad al canal.

### 4. Grabar — Manual
Tres cosas que después ahorran horas de edición:
- **Grabá la cámara y la pantalla por separado** (en OBS, cada una a pantalla completa). Si la
  cámara viene pegada adentro de la pantalla, después no hay zoom ni se puede mover.
- **Decí en voz alta cada cambio de etapa y cada dato** («ahora, la edición»). El agente ubica
  títulos y gráficos en la palabra exacta usando el transcript.
- **Marcá en tu editor lo que querés en pantalla** (un marcador con el texto). El agente lo lee.

### 5. La edición — Asistido
El agente edita con la skill `editor-de-video` y los `componentes/`:
1. Transcribe con whisper (tiempos por palabra) y arma el mapa del corte.
2. Pone cada pieza en la palabra que la nombra: títulos de capítulo, datos, tarjetas, B-roll.
3. Suma sonido (whoosh al entrar, pop al aparecer), música de fondo pareja y deja todo a −16 LUFS.
4. **Te muestra sólo lo que cambió:** un clip corto por cambio, numerado (v02.1, v02.2…), con sonido.
   Respondés «en la v02.3 corré el título» y se corrige en la versión siguiente.
5. Con tu OK, exporta en 4K.

### 6. La publicación — Automático
Como el agente editó el video, sabe exactamente dónde cambia cada etapa. Con el transcript arma
capítulos, descripción y tags (`prompts/capitulos-y-descripcion.md`), lo sube en privado y lo programa.
Lo que la API de YouTube no deja (pantalla final, tests A/B, monetización) lo cargás en Studio.

### 7. El análisis — Automático
Lecturas programadas a las 8 horas, a los 2 días y a los 7 días del estreno: impresiones, CTR,
retención y de dónde vino el tráfico. A los 7 días, un post-mortem corto: qué esperabas, qué pasó,
por qué y qué cambia en el próximo video.

## Lo que no se automatiza

El script y grabar. Son lo que hace que el canal sea tuyo. El objetivo no es desaparecer:
es dejar de hacer la parte pesada.

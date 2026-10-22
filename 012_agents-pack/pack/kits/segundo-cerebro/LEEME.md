# Un 2do cerebro para tus agentes

> 🎥 Viene del video **[Un 2do Cerebro, pero para mis agentes](https://www.youtube.com/watch?v=AH-V_uF_EJo&list=PLItELtCfBA39BbCy0gS8eO2OGn5xEO_cB)**.
> Más videos con su parte del pack: `../../README.md` → "¿Venís de un video?".

La estructura de carpetas del video, vacía y lista para llenar. Todo lo que tu agente
aprende, decide y necesita saber vive en archivos de texto tuyos, no en la memoria de
ChatGPT, de Claude ni de ninguna otra herramienta. Cambiás de herramienta y el agente
viene con vos, con toda su memoria.

## Qué hay acá

```
segundo-cerebro/
├── agente/               el "libro de instrucciones" de un agente
│   ├── AGENTS.md         qué hace y cómo trabaja (el archivo principal)
│   ├── SOUL.md           quién es: identidad y tono
│   ├── USER.md           para quién trabaja: vos
│   ├── MEMORY.md         la memoria permanente (se lee siempre)
│   ├── memory/           el journal: un archivo por día
│   │   └── AAAA-MM-DD.md
│   ├── CLAUDE.md         apunta a AGENTS.md (Claude Code)
│   └── GEMINI.md         apunta a AGENTS.md (Gemini CLI)
└── boveda/               lo que saben todos tus agentes
    ├── INDICE.md         el mapa: qué archivo tiene qué
    ├── decidido/         lo que decidiste vos
    ├── chequeado/        lo que se encontró afuera y se verificó
    └── sin-chequear/     lo que se encontró afuera y nadie verificó
```

## Las cuatro ideas del video

**1. Un agente son cuatro archivos.** `AGENTS.md` dice qué hace, `SOUL.md` quién es,
`USER.md` para quién trabaja y `MEMORY.md` qué recuerda. Codex y la mayoría de las
herramientas leen `AGENTS.md` solos; para Claude Code y Gemini, `CLAUDE.md` y `GEMINI.md`
solo dicen "leé `AGENTS.md`". Cualquier herramienta que abras arranca con el mismo contexto.

**2. Dos memorias.** `MEMORY.md` es la permanente: se carga en cada sesión, así que tiene
que ser corta y tener solo lo que querés que esté siempre. El journal (`memory/`) es un
archivo por día con lo que pasó. El agente lee el de hoy y el de ayer; si algo del día
importa de verdad, lo sube a `MEMORY.md` con una línea que apunta al día.

**3. Un índice en vez de leer todo.** Si el agente lee los 100 capítulos para responder
una pregunta del capítulo 4, gasta tiempo y te da una respuesta diluida. `INDICE.md` dice
qué archivo tiene qué, en una línea cada uno, separado por nivel de confiabilidad. El
agente lo lee en un segundo y va directo al archivo que necesita. Cuando crea un archivo
nuevo, lo agrega al índice.

**4. Backup en GitHub.** Son archivos de texto livianos: un repo por agente, y un commit
cada vez que aprende algo o cambia algo. Si el agente empieza a andar peor, volvés a una
versión anterior. Si se te rompe la compu, bajás el repo y el agente sigue donde estaba.

## Cómo usarlo

1. Copiá `agente/` donde quieras que viva tu agente y renombrala (`mi-agente/`).
2. Llená `USER.md` y `SOUL.md` primero: son los que más cambian las respuestas.
3. Copiá `boveda/` en un lugar que lean todos tus agentes (por ejemplo, una bóveda de
   Obsidian) y ajustá la ruta en `AGENTS.md`.
4. Abrí el agente con la herramienta que uses, desde esa carpeta.
5. Backup:

   ```bash
   cd mi-agente
   git init && git add -A && git commit -m "primer commit"
   gh repo create mi-agente --private --source . --push
   ```

   Hacelo privado: ahí va a estar todo lo que el agente sabe de vos y de tu negocio.

## ¿Y `agentes/_template/`?

Es la versión completa del mismo molde, con `IDENTITY.md`, `TOOLS.md` y `HEARTBEAT.md`
para agentes que corren solos o trabajan de una cola. Si recién arrancás, empezá por este
kit; cuando necesites más, sumá esos archivos.

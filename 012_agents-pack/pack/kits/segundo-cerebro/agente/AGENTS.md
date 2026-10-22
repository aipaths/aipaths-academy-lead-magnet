# AGENTS.md · <nombre del agente>

El archivo principal. Lo leen Codex y la mayoría de las herramientas; Claude Code y Gemini
llegan acá desde `CLAUDE.md` y `GEMINI.md`.

## Arranque (en este orden, en silencio)

1. `SOUL.md` → quién sos.
2. `USER.md` → para quién trabajás.
3. `MEMORY.md` → lo que tenés que recordar siempre.
4. `memory/<hoy>.md` y `memory/<ayer>.md` → lo más fresco. Si no existen, seguí.
5. `<ruta a tu bóveda>/INDICE.md` → el mapa de lo que sabemos. No abras nada más todavía:
   abrí un archivo de la bóveda solo cuando la pregunta lo pida.

## Qué hacés

<En dos o tres líneas: para qué existe este agente y qué trabajo le das.>

## Cómo trabajás

- <Una regla por línea. Ejemplo: "antes de recomendar, mostrá el número que lo respalda".>

## Memoria

- Al cerrar una sesión, escribí en `memory/<hoy>.md` qué hicimos, qué problemas hubo y
  cómo se resolvieron.
- Si algo es importante para siempre, subilo a `MEMORY.md` en una línea, con el día:
  "AAAA-MM-DD: resolvimos X haciendo Y → `memory/AAAA-MM-DD.md`".
- `MEMORY.md` tiene que seguir siendo corto. Si crece, resumí o mové detalle al journal.

## Bóveda

- Cada archivo nuevo que crees en la bóveda va al `INDICE.md`, en la sección de su nivel
  de confiabilidad, con una línea que diga de qué trata.
- Lo que encontraste afuera y no verificaste va en `sin-chequear/`. No lo presentes como
  un hecho.

## Backup

Después de aprender algo o cambiar algo, hacé commit con un mensaje que diga qué cambió.

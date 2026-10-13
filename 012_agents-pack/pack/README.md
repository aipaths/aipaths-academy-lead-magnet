# Agents Pack

Tres cosas listas para usar con cualquier agente de código (Claude Code, Codex, Cursor,
OpenClaw, Gemini CLI…): **agentes especialistas**, **skills** y una **librería de prompts**.

Todo es markdown plano. No hay nada que instalar, nada que compilar, ningún runtime atado.
La excepción son los `kits/`: proyectos reales de los videos, con su código.

## ¿Venís de un video? Empezá acá

Cada video que deja algo para llevarte tiene su carpeta en `kits/`, con un `LEEME.md` que
arranca desde cero.

| Video | Kit | Qué te llevás |
|---|---|---|
| Motion graphics con código | `kits/motion-graphics/` | la skill `motion-director`, el paso a paso y el proyecto de la intro |

```
agentes/     8 especialistas + un pipeline de 3 + el template para armar el tuyo
skills/      10 skills + una cola de tareas lista para montar
prompts/     114 prompts por dominio + el método para escribir los tuyos
kits/        lo que se construye en los videos, listo para abrir y correr
```

## Empezar

**Si usás Claude Code** — copiá los agentes y ya los tenés:

```bash
cp agentes/claude-code/*.md ~/.claude/agents/
```

**Si usás otro harness** — `agentes/portable/` tiene los mismos ocho con el set de
archivos del estándar *agents.md*, que leen Codex, Cursor, OpenClaw y +30 clientes, más
los cuatro agentes de cola y el template.

**Las skills** van donde tu harness las busque (`~/.claude/skills`, `~/.agents/skills`,
o la carpeta que declare tu config).

**Los prompts** se leen y se copian. No necesitan instalación.

## Qué hay adentro

### `agentes/` — 8 especialistas + pipeline de 3 + template

| Agente | Qué hace |
|---|---|
| `code-reviewer` | revisa un diff antes de mergear. Agnóstico de stack |
| `git-commit-guardian` | revisa el diff antes de que salga del repo: secretos, basura, mensaje |
| `codebase-cleanup-auditor` | cataloga lo que sobra en el repo — sin borrar nada |
| `dependency-auditor` | triagea dependencias y dice qué actualizar primero |
| `docs-writer` | escribe docs leyendo el código, no el README viejo |
| `nextjs-security-auditor` | audita una app Next.js en 8 categorías críticas |
| `supabase-db-manager` | esquema, migraciones y políticas RLS sobre Postgres/Supabase |
| `playwright-browser-tester` | abre una URL en Chromium y reporta lo evidente |

Los ocho son **especialistas on-demand**: no corren solos ni poolean una cola. Los invocás
vos, o los invoca tu agente principal cuando el trabajo cae en su dominio.

Además hay un **pipeline de tres agentes** con cola propia, que cierra el circuito de
punta a punta sobre las skills de cola:

```
idea → @planner → Todo → @dev → In Review → @reviewer → Done
```

| Agente | Qué aporta |
|---|---|
| `planner` | interroga la idea hasta que la tarea sea ejecutable sin preguntas |
| `dev` | ejecuta, deja evidencia verificable, y aprende el codebase sesión a sesión |
| `reviewer` | verifica de verdad: aprueba, o rebota con el motivo concreto |

Más `director-generico` (el molde para armar uno de otra área) y `agentes/_template/`,
el esqueleto vacío con los comentarios de qué va en cada archivo.

### `skills/` — 10 skills

Siete andan solas:

| Skill | Cuándo dispara |
|---|---|
| `prompt-builder` | escribir, mejorar o buscar un prompt |
| `onboarding-codebase` | entender un repo que no conocés, sin leerlo entero |
| `escribir-tests` | tests que atrapen bugs, no que suban el coverage |
| `preparar-pr` | dejar un PR listo para que alguien lo revise sin sufrir |
| `release` | preparar y publicar un release, con rama según entorno |
| `token-audit` | tu agente gasta demasiado y hay que reducir contexto |
| `motion-director` | dirigir un motion graphics hecho con código, de brief a render |

Y tres arman una **cola de tareas** sobre Linear, para que uno o varios agentes trabajen
de una cola compartida sin pisarse:

| Skill | Cuándo dispara |
|---|---|
| `task-intake` | cargar tareas nuevas, ya etiquetadas por rol |
| `task-runner` | tomar la próxima tarea disponible y trabajarla |
| `task-review` | verificar lo que quedó en review: aprobar o devolver |

Las tres necesitan setup (cuenta de Linear + 9 estados + el MCP). Está todo en
`skills/_cola-linear/SETUP.md`, con un script que crea los estados en un comando.

Lo que hace que esa cola no se rompa son dos piezas que casi nadie implementa: un **lock
con lease** (claim → jitter → re-lectura, gana el claim más viejo) y un **reaper** que
devuelve a la cola los leases huérfanos. Sin el reaper, una instancia que muere justo
después de reclamar deja esa tarea invisible para todos los agentes, para siempre.

### `prompts/` — 114 prompts

Organizados por dominio, una carpeta cada uno, con su README adentro:

| Carpeta | Prompts | Qué cubre |
|---|---|---|
| `desarrollo/` | 39 | generar código, debugging, testing y review |
| `negocio/` | 47 | análisis de datos, research, planificación |
| `marketing/` | 28 | SEO y contenido, email, redes y ads |
| `automatizacion/` | — | workflows de n8n |

Más dos archivos en la raíz: `metodo.md` (cómo se escribe un prompt que funciona) y
`constructor.md` (un wizard que te lo arma preguntando).

### `kits/` — lo de los videos

| Kit | Qué trae |
|---|---|
| `motion-graphics/` | paso a paso, `CLAUDE.md`, plantillas de brief y storyboard, y el proyecto de una intro de 20 s en HyperFrames |

Los kits sí traen código y necesitan sus herramientas (el `LEEME.md` de cada uno dice
cuáles). Todo lo demás del pack sigue siendo markdown plano.

## La idea de fondo

Dos principios atraviesan todo el pack:

**Un archivo por vez.** Las skills y los agentes están partidos en tronco + ramas: lo que
siempre se lee es corto, y el detalle se carga solo cuando hace falta. Cargar 2.900 líneas
de prompts para usar uno es tirar contexto a la basura.

**Markdown plano, cero lock-in.** Nada acá depende de un modelo, un proveedor ni un
harness. Cambiás de herramienta y esto viaja con vos.

## Idioma

Todo el pack está en español. Los cinco agentes originales y la librería de prompts
venían en inglés y se tradujeron, placeholders incluidos; el resto se escribió en
español directamente.

## Procedencia

Los agentes y las skills son originales. Los prompts son una compilación de material
publicado como gratuito por sus autores, traducido al español y con atribución al
origen: ver `prompts/SOURCES.md`.

## Licencia

MIT para el material original de este pack (agentes, skills, `prompts/metodo.md`).
Los prompts compilados conservan la atribución a su fuente; ver `prompts/SOURCES.md`.

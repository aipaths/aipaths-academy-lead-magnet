---
# Unique identifier linking EN/ES versions
content_id: "lead-magnets-agents-pack"

# Locale (must match filename)
locale: "es"

# SEO & Display
title: "Agents Pack: 8 Agentes, 11 Skills y 114 Prompts"
description: "Agentes especialistas, skills y una librería de prompts en markdown plano. Andan en Claude Code, Codex, Cursor, OpenClaw o el harness que uses. Incluye los kits de los videos: motion graphics con código, el 2do cerebro para tus agentes y la skill de Claude + Blender."

# Category and taxonomy
category: "ai-agents"
tags:
  - ai-agents
  - claude-code
  - skills
  - prompts
  - automation
  - motion-graphics
  - blender

# Metadata
difficulty: "intermediate"
version: "1.2.0"
published: true
coverImage: "/images/resources/012_agents-pack/thumb.png"
order: 12
lastUpdated: "2026-10-22"
author: "AIPaths Academy"
downloadSize: "1.5 MB"
estimatedSetupTime: "5 minutos"

# Prerequisites
prerequisites:
  - Un agente de código, el que uses (Claude Code, Codex, Cursor, OpenClaw, Gemini CLI)
  - Nada más, es todo markdown plano (el kit de motion necesita Node y FFmpeg; la skill de Blender, Blender con el MCP mcp-for-blender)

# Files included
files:
  - path: pack/agentes/claude-code/
    description: Los 8 especialistas en formato Claude Code, listos para copiar
  - path: pack/agentes/portable/
    description: Los mismos 8 en formato agents.md, más el pipeline de 3 y el template
  - path: pack/skills/
    description: 11 skills, incluidas Claude + Blender y la cola de tareas sobre Linear con su SETUP
  - path: pack/kits/motion-graphics/
    description: El kit del video de motion graphics con código, con el proyecto de ejemplo
  - path: pack/kits/segundo-cerebro/
    description: La estructura del 2do cerebro para tus agentes, lista para llenar
  - path: pack/prompts/
    description: 114 prompts por dominio, más el método para escribir los tuyos
  - path: pack/README.md
    description: Guía de instalación y recorrido por el pack
---

## Qué Incluye

- **8 agentes especialistas** — en formato Claude Code y en formato portable (*agents.md*), que leen Codex, Cursor, OpenClaw y otros 30 clientes
- **Un pipeline de 3 agentes** con cola propia: planner, dev y reviewer
- **11 skills**: ocho andan solas y tres arman una cola de tareas compartida sobre Linear
- **114 prompts** organizados por dominio, con el método para escribir los tuyos
- **Un template vacío** para armar tu propio agente desde cero
- **El kit de motion graphics con código**: paso a paso, plantillas y el proyecto real de una intro
- **El kit del 2do cerebro**: la estructura de carpetas para que tus agentes tengan memoria propia
- **La skill de Claude + Blender**: renders de producto, física, logo 3D y tracking sobre video real

## ¿Venís de un video?

El pack es uno solo y lo dejo en muchos videos. Algunos enseñan algo concreto que está acá adentro: si venís de uno de esos, abrí directo su carpeta.

| Video | Abrí | Qué te llevás |
|---|---|---|
| [Motion Graphics con Opus 5.5 que no parecen IA](https://www.youtube.com/watch?v=i1Dd23eaMGs&list=PLItELtCfBA39BbCy0gS8eO2OGn5xEO_cB) | `kits/motion-graphics/` | La skill `motion-director`, el paso a paso y el proyecto de la intro |
| [Un 2do Cerebro, pero para mis agentes](https://www.youtube.com/watch?v=AH-V_uF_EJo&list=PLItELtCfBA39BbCy0gS8eO2OGn5xEO_cB) | `kits/segundo-cerebro/` | Los 4 archivos del agente, el journal, el índice y el backup |
| Claude + Blender *(próximamente)* | `skills/claude-blender/` | La skill para manejar Blender desde Claude |

Todos están en la playlist [Claude Code para Emprendedores](https://www.youtube.com/playlist?list=PLItELtCfBA39BbCy0gS8eO2OGn5xEO_cB). Cuando un video deja algo nuevo, aparece acá.

## Los 8 Especialistas

| Agente | Qué hace |
|---|---|
| `code-reviewer` | Revisa un diff antes de mergear. Agnóstico de stack |
| `git-commit-guardian` | Revisa el diff antes de que salga del repo: secretos, basura, mensaje |
| `codebase-cleanup-auditor` | Cataloga lo que sobra en el repo, sin borrar nada |
| `dependency-auditor` | Triagea dependencias y dice qué actualizar primero |
| `docs-writer` | Escribe docs leyendo el código, no el README viejo |
| `nextjs-security-auditor` | Audita una app Next.js en 8 categorías críticas |
| `supabase-db-manager` | Esquema, migraciones y políticas RLS sobre Postgres |
| `playwright-browser-tester` | Abre una URL en Chromium y reporta lo evidente |

Los ocho son especialistas **on-demand**: no corren solos ni poolean una cola. Los invocás vos, o los invoca tu agente principal cuando el trabajo cae en su dominio.

## El Pipeline de 3

Aparte de los especialistas, hay tres agentes que cierran el circuito de punta a punta sobre las skills de cola:

```text
idea → @planner → Todo → @dev → In Review → @reviewer → Done
```

| Agente | Qué aporta |
|---|---|
| `planner` | Interroga la idea hasta que la tarea sea ejecutable sin preguntas |
| `dev` | Ejecuta, deja evidencia verificable y aprende el codebase sesión a sesión |
| `reviewer` | Verifica de verdad: aprueba, o rebota con el motivo concreto |

## Las 11 Skills

Ocho funcionan sin setup: `prompt-builder`, `onboarding-codebase`, `escribir-tests`, `preparar-pr`, `release`, `token-audit`, `motion-director` y `claude-blender`.

Las otras tres arman una cola de tareas sobre Linear para que uno o varios agentes trabajen de una cola compartida sin pisarse: `task-intake`, `task-runner` y `task-review`. Necesitan cuenta de Linear y el MCP configurado; el paso a paso está en `skills/_cola-linear/SETUP.md`, con un script que crea los estados en un comando.

Lo que hace que esa cola no se rompa son dos piezas que casi nadie implementa: un **lock con lease** y un **reaper** que devuelve a la cola los leases huérfanos. Sin el reaper, una instancia que muere justo después de reclamar una tarea la deja invisible para todos los agentes, para siempre.

## El Kit de Motion Graphics

Lo del video, para hacerlo vos. El agente escribe HTML que sabe cómo se ve cada instante, un navegador saca una captura por frame y FFmpeg las une. Sin editor de video y sin costo extra fuera de tu suscripción al modelo.

| Qué | Para qué |
|---|---|
| `motion-director` | La skill que dirige: reglas antes de animar, escenas en paralelo, revisión por hoja de contactos |
| `LEEME.md` | El paso a paso, de instalar HyperFrames al render |
| `CLAUDE.md` | Las instrucciones para tu agente, listas para sumar a tu proyecto |
| `plantillas/` | Brief y storyboard para llenar antes de pedir nada |
| `ejemplo-intro-aipaths/` | El proyecto completo de la intro de 20 s: escenas, reglas visuales y música generada con código |

## El Kit del 2do Cerebro

Todo lo que tu agente aprende, decide y necesita saber, en archivos de texto tuyos y no en la memoria de una herramienta. Cambiás de ChatGPT a Claude Code o a Gemini y el agente viene con vos.

| Qué | Para qué |
|---|---|
| `agente/` | Los 4 archivos: `AGENTS.md` (qué hace), `SOUL.md` (quién es), `USER.md` (para quién trabaja) y `MEMORY.md` (qué recuerda siempre) |
| `agente/memory/` | El journal: un archivo por día, que el agente lee y escribe solo |
| `boveda/INDICE.md` | El mapa de lo que saben tus agentes, separado por confiabilidad: decidido, chequeado y sin chequear |
| `LEEME.md` | Cómo armarlo y cómo hacer el backup en GitHub |

## La Skill de Claude + Blender

Claude maneja un Blender abierto a través del MCP `mcp-for-blender`. La skill sale de una sesión real de pruebas y guarda qué funcionó, qué se rompió y por qué.

![Render de producto: una taza con la marca, hecha desde cero con Claude en Blender](/images/resources/012_agents-pack/blender-taza.jpg)

![Logo 3D armado a partir de una imagen plana](/images/resources/012_agents-pack/blender-logo-3d.jpg)

| Flujo | Qué hace |
|---|---|
| Render de producto | Una taza, botella o caja con tu marca, construida con código |
| Física | Que algo se caiga o se rompa (fractura Voronoi) |
| Logo 3D e intro | Tu logo en 3D desde una imagen plana, y una intro animada |
| Camera tracking | Meter un objeto 3D en un video que filmaste con el celular |

Incluye la instalación en Mac y sus trampas, las reglas de oro, las trampas de la API de Blender 5.x, una plantilla de bitácora y 5 scripts (render en segundo plano, MP4 con hoja de contactos, fractura, tracking y anclaje).

## Los 114 Prompts

| Carpeta | Prompts | Qué cubre |
|---|---|---|
| `desarrollo/` | 39 | Generar código, debugging, testing y review |
| `negocio/` | 47 | Análisis de datos, research, planificación |
| `marketing/` | 28 | SEO y contenido, email, redes y ads |
| `automatizacion/` | — | Workflows de n8n |

Más `metodo.md` (cómo se escribe un prompt que funciona) y `constructor.md` (un wizard que te lo arma preguntando).

## Instalación Rápida

**Si usás Claude Code**, copiá los agentes y ya los tenés:

```bash
cp agentes/claude-code/*.md ~/.claude/agents/
```

**Si usás otro harness**, la carpeta `agentes/portable/` tiene los mismos ocho con el set de archivos del estándar *agents.md*.

**Las skills** van donde tu harness las busque: `~/.claude/skills`, `~/.agents/skills` o la carpeta que declare tu config.

**Los prompts** se leen y se copian. No necesitan instalación.

## La Idea de Fondo

Dos principios atraviesan todo el pack:

**Un archivo por vez.** Las skills y los agentes están partidos en tronco y ramas: lo que siempre se lee es corto, y el detalle se carga solo cuando hace falta. Cargar 2.900 líneas de prompts para usar uno es tirar contexto a la basura.

**Markdown plano, cero lock-in.** Nada acá depende de un modelo, un proveedor ni un harness. Cambiás de herramienta y esto viaja con vos.

## Idioma y Licencia

Todo el pack está en español. Los agentes y las skills son originales, bajo licencia MIT. Los prompts son una compilación de material publicado como gratuito por sus autores, traducido al español y con atribución al origen en `prompts/SOURCES.md`.

## Recursos Relacionados

- [Canal de YouTube](https://www.youtube.com/@aipaths)
- [Curso completo de agentes](https://www.aipaths.academy/es/openclaw-course)

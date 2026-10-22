# Skills

Once skills portables. Cada una es una carpeta con un `SKILL.md` y, si hace falta,
una carpeta `references/`.

## Instalar

Copiá o symlinkeá cada carpeta a donde tu harness busque skills:

```bash
# Claude Code
ln -s "$PWD/release" ~/.claude/skills/release

# Hermes, OpenClaw, Codex (leen ~/.agents/skills de forma nativa)
ln -s "$PWD/release" ~/.agents/skills/release
```

Symlink mejor que copia: editás una vez y todos los harnesses ven el mismo archivo.

## Las once

### Sueltas — andan solas, sin configurar nada

| Skill | Cuándo dispara |
|---|---|
| `prompt-builder` | "armá un prompt", "mejorá este prompt", "tenés un prompt para…" |
| `onboarding-codebase` | "no conozco este repo", "explicame este proyecto", "por dónde empiezo" |
| `escribir-tests` | "escribí tests para esto", "falta cobertura", "testeá esta función" |
| `preparar-pr` | "preparar el PR", "abrir un pull request", "esto está listo para review" |
| `release` | "hacer un release", "deploy", "publicar versión" |
| `token-audit` | "mi agente gasta mucho", "optimizar contexto", "reducir tokens" |
| `motion-director` | "armá un motion", "intro animada", "video con código" |
| `claude-blender` | "render 3D", "pasá mi logo a 3D", "que se rompa", "tracking", "Blender" |

`prompt-builder` usa la carpeta `prompts/` de este pack como librería.

`motion-director` dirige; el motor (HyperFrames u otro de código a video) hace el render
con sus propias skills. El paso a paso completo y un proyecto de ejemplo están en
`kits/motion-graphics/`.

`claude-blender` necesita Blender abierto con el MCP `mcp-for-blender` conectado; la
instalación y sus trampas en macOS están en `claude-blender/references/setup.md`.

### La cola de tareas — las tres funcionan juntas

| Skill | Cuándo dispara |
|---|---|
| `task-intake` | "cargame estas tareas", "creá una tarea", "agendá para el viernes" |
| `task-runner` | "agarrá una tarea", "trabajá la cola", "próxima tarea" |
| `task-review` | "revisá la cola", "review de tareas", "verificá lo que hicieron" |

**Estas tres necesitan setup antes de servir**: una cuenta de Linear con 9 estados de
workflow y el MCP conectado. Todo está en `_cola-linear/SETUP.md`, y el script
`_cola-linear/setup-states.mjs` crea los estados que falten en un comando.

## La cola de tareas, en corto

Es un sistema para que uno o varios agentes trabajen de una cola compartida sin pisarse:

```
Scheduled ──(vence la fecha)──> Todo ──(claim con lock)──> In Progress
                                 ▲                              │
                                 └──(reaper: lease huérfano)──── ▼
                                                            In Review ──> Done
```

Las dos piezas que la hacen funcionar de verdad:

**El lock con lease.** `task-runner` no toma una tarea: la *reclama*. Mueve a `Claiming`,
deja un comentario con timestamp, espera un jitter de 1-3 s, y re-lee. Si su claim es el
más viejo, ganó. Si no, la suelta. Así dos instancias del mismo rol nunca duplican trabajo.

**El reaper.** Es la contraparte obligatoria del lock. Si una instancia muere justo
después de reclamar —se quedó sin cuota, la mataron, se reinició la máquina— esa tarea
queda invisible para **todos** los runners, para siempre. El reaper la devuelve a `Todo`
pasado un umbral y comenta por qué. Sin él, cada corte te deja una tarea muerta.

`_cola-linear/` trae los dos scripts (`_cola-linear/scheduler.mjs`, `_cola-linear/reaper.mjs`), el que crea los
estados, y un workflow de GitHub Actions que los corre cada 10 minutos sin PC prendida.

## El patrón: tronco y ramas

`release` es el ejemplo claro. El `SKILL.md` tiene el flujo común (preparar, correr
tests, bumpear versión) y después bifurca:

```
SKILL.md                    ← siempre en contexto, corto
└── references/
    ├── staging.md          ← solo si el entorno es staging
    └── production.md       ← solo si es production
```

El agente nunca lee las dos ramas. Es la diferencia entre cargar 40 líneas y cargar 400
para hacer el mismo deploy.

Si escribís las tuyas, seguí ese patrón: **el `SKILL.md` decide, las referencias detallan.**

## Reglas de portabilidad

Si vas a modificarlas o escribir nuevas, estas son las que las mantienen funcionando en
cualquier herramienta:

- **Frontmatter mínimo**: solo `name` y `description` están garantizados en todos lados.
- **`description` en una sola línea** — hay parsers que no leen multilínea. Y corta:
  algunos harnesses la recortan a ~60 caracteres, así que **el gatillo va adelante**.
  Los primeros 60 caracteres tienen que decir *cuándo* se dispara.
- **Nada propietario adentro**: ni hooks, ni comandos slash de una sola herramienta, ni
  sintaxis específica de un harness.
- **Lo que ejecuta algo vivo va en un MCP**, no en la skill. La skill describe *cuándo* y
  *cómo* usarlo; así cambiar de modelo no te toca las capacidades.

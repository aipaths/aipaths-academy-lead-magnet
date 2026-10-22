# Agentes

Ocho agentes especialistas, en **dos formatos con el mismo contenido**. Elegí el que
tu herramienta entienda.

## `claude-code/` — un archivo, listo para usar

Formato nativo de los subagentes de Claude Code: frontmatter (`name`, `description`,
`model`, `color`) + el system prompt.

```bash
cp claude-code/*.md ~/.claude/agents/
```

Y ya podés invocarlos por nombre.

## `portable/` — el set de archivos del estándar *agents.md*

El mismo agente repartido en seis archivos, cada uno con un rol. Lo leen Codex, Cursor,
OpenClaw, Gemini CLI y +30 clientes, sin traducción.

| Archivo | Qué define |
|---|---|
| `AGENTS.md` | **entrypoint**: orden de arranque, de dónde sale el trabajo, flujos, seguridad |
| `IDENTITY.md` | nombre, handle, label de ruteo, cuándo se dispara |
| `SOUL.md` | personalidad, qué posee, **límites duros**, cómo trabaja |
| `TOOLS.md` | entorno concreto: MCPs, comandos, rutas |
| `MEMORY.md` | aprendizajes de largo plazo y modos de falla ya vistos |
| `HEARTBEAT.md` | checklist de revisión periódica |

Para usarlo: copiá la carpeta del agente a donde vayas a abrir el harness. Si tu
herramienta busca su propio archivo (Claude → `CLAUDE.md`, Gemini → `GEMINI.md`), hacé
un symlink en vez de copiar — una fuente, muchos entrypoints, cero drift:

```bash
ln -s AGENTS.md CLAUDE.md
```

## Los especialistas

**On-demand**: no corren solos, no poolean cola, no tienen estado. Los invocás vos o los
invoca tu agente principal cuando el trabajo cae en su dominio.

| Agente | Rol | Límite que no cruza |
|---|---|---|
| `code-reviewer` | revisa un diff, cualquier stack | nunca reescribe el código |
| `git-commit-guardian` | revisa el diff antes del push | nunca commitea si encontró un secreto |
| `codebase-cleanup-auditor` | cataloga lo que sobra | **nunca borra nada**: entrega comandos |
| `dependency-auditor` | triagea deps y ordena qué actualizar | nunca actualiza nada |
| `docs-writer` | escribe docs leyendo el código primero | nunca documenta lo que no verificó |
| `nextjs-security-auditor` | audita 8 categorías críticas | nunca aplica los fixes, solo reporta |
| `supabase-db-manager` | esquema, migraciones, RLS | nunca crea una tabla sin RLS |
| `playwright-browser-tester` | diagnóstico rápido con browser | nunca borra fuera de su carpeta temporal |

## El pipeline — tres agentes que trabajan juntos

El otro arquetipo: agentes con **cola propia**, que poolean, reclaman con lock y trabajan.
Se montan sobre la cola de `skills/_cola-linear/` y cierran el circuito completo.

```
   idea
    │
    ▼
@planner ──> Todo ──> @dev ──> In Review ──> @reviewer ──> Done
    ▲                  ▲                          │
    │                  └──── rebote ──────────────┤
    └──── mal especificada ──────────────────────-┘
```

| Agente | Skill que usa | Qué aporta |
|---|---|---|
| `planner` | `task-intake` | interroga la idea hasta que sea ejecutable sin preguntas |
| `dev` | `task-runner` | ejecuta, deja evidencia, y aprende el codebase en `MEMORY.md` |
| `reviewer` | `task-review` | verifica de verdad: aprueba o rebota con motivo |

### El contrato que los une

Sin esto son tres agentes sueltos. Con esto es un sistema:

1. **`@planner` escribe "cómo verificarlo"** en cada tarea. Esos son los pasos que va a
   seguir el reviewer — se escriben pensando en él.
2. **`@dev` deja la evidencia**: la salida real de los comandos, no "corrí los tests".
3. **`@reviewer` verifica en tres puertas**, de barata a cara. Sin evidencia rebota en dos
   minutos sin abrir el código.

Y una distinción que hace que las tareas cierren: cuando el reviewer encuentra algo,
decide con una sola pregunta — **¿esto era parte de lo que se pidió?** Sí → rebota la
misma tarea. No → la aprueba y crea una tarea nueva. Una tarea que crece con cada review
no cierra nunca.

### `director-generico/`

El molde del arquetipo, sin dominio asignado. Usalo para armar un director de otra área
—contenido, research, ops— que no sea ninguno de los tres de arriba.

Los cuatro vienen **solo en formato portable**: un director es el agente principal de su
repo, no un subagente al que otro invoca.

## `_template/` — para armar el tuyo

El esqueleto vacío con los seis archivos y, en cada uno, qué va adentro y por qué.
Copialo y llenalo:

```bash
cp -r _template/ ../mi-agente/
```

Los comentarios del template dicen qué distingue un archivo bien escrito de uno de
relleno — sobre todo en `SOUL.md`, que es donde viven los límites.

## Adaptarlos

Lo que más vas a querer tocar:

- **`SOUL.md` → "Qué NO hacés"** — los límites. Es lo que decide si el agente te frena o
  te pisa el repo. Leelos antes de usarlo en algo serio.
- **`TOOLS.md`** — los comandos asumen convenciones comunes (`supabase/migrations/`,
  `src/app/api/`). Ajustalos a tu proyecto.
- **`IDENTITY.md` → `description`** — es el gatillo. Si tu herramienta rutea por
  descripción, esto define cuándo se despierta.

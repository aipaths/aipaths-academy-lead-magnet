# Curso de agentes de IA desde cero: tu asistente personal

> 🎥 Viene del video **[Curso de agentes de IA desde cero](https://www.youtube.com/watch?v=QFufRiy2VJA&list=PLItELtCfBA39ig81F5j9wcMqclkhfdKaL)**.
> Más videos con su parte del pack: `../../README.md` → "¿Venís de un video?".

La carpeta del asistente personal del video, vacía y lista para llenar. Funciona con Claude
Code, Codex y Gemini, y las instrucciones están en un solo lugar.

## Lo que necesitás

- Un agente: Claude Code, Codex, Antigravity o Gemini CLI
- Para conectar Google con credenciales: Node 22.18 o más nuevo y una cuenta de Google. Con
  conectores o plugins no hace falta Node
- Para el tablero: una cuenta de Linear u otro tablero con MCP

## Cómo arrancar

1. Copiá esta carpeta donde quieras y abrila con tu agente.
2. Completá `AGENTS.md` (lo que está entre corchetes) y `clientes.csv`.
3. Poné tus PDF en `facturas/`.
4. Probá: «armame un follow-up para [cliente]», «cargá las facturas».
5. Para que haga cosas en Google, lo simple: `PASO-A-PASO-CONECTORES.md`. Para que funcione en cualquier IA: `PASO-A-PASO-GOOGLE.md`.
6. Para el tablero: `PASO-A-PASO-TABLERO.md`.

## Qué hay acá

| Archivo | Para qué |
|---|---|
| `AGENTS.md` | El onboarding: quién sos y cómo trabajás. Editá sólo este |
| `CLAUDE.md`, `GEMINI.md` | Una línea que apunta a `AGENTS.md`. No los toques |
| `.agents/skills/` | Cómo hacer un follow-up, cargar facturas, agendar y armar el brief |
| `.claude/skills` | Un acceso directo a `.agents/skills`, porque Claude Code no mira ahí |
| `clientes.csv`, `planilla-facturas.csv` | Tus clientes y tus facturas. Sólo traen los encabezados |
| `facturas/` | Tus PDF |
| `herramientas/` | Gmail, Calendar y Sheets por la API de Google |
| `.env.example` | Los nombres de las credenciales, sin valores. Éste sí se sube |
| `permisos.json` | `false`: el agente deja borradores y no manda |
| `.codex/config.toml` | Le da red a Codex |

Al conectar Google con credenciales se crean dos cosas más, que no se comparten ni se suben:
`.env` (el ID y el secreto de tu cliente de Google) y `.credenciales/` (el permiso que te dio
Google al iniciar sesión).

Si Claude Code no encuentra las skills (por ejemplo, en Windows), copiá `.agents/skills` a `.claude/skills`.
Las carpetas que empiezan con punto están ocultas: en Mac se ven con `Cmd + Shift + .`.

## Lo que no viene en el kit

Los datos inventados del video: los clientes, los mails, las facturas y la agenda de la demo.
La carpeta arranca vacía para que cargues los tuyos. Tampoco vienen credenciales: las creás
vos, con tu cuenta.

## Licencia

MIT, como el resto del material original del pack.

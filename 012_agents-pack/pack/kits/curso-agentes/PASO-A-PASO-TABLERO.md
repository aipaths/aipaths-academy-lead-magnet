# Conectar un tablero de tareas por MCP

El ejemplo es Linear. Otro tablero con MCP oficial funciona igual: cambia la URL.

**Ojo:** el agente ve todo tu workspace, no sólo el tablero que le digas. Pedirle «sólo este equipo» es una instrucción, no un límite.

## Claude

En <https://claude.ai/customize/connectors>, **Linear → Connect**, y abrí una sesión nueva. Sin terminal. Te sirve también en Claude Code, en la misma cuenta.

Con la terminal, sólo para este proyecto:

```bash
claude mcp add --transport http --scope project linear https://mcp.linear.app/mcp
```

Abrí Claude Code, escribí `/mcp`, elegí `linear` y logueate.

## ChatGPT y Codex

Instalá el plugin de Linear: en ChatGPT, en la web; en Codex, escribí `/plugins`. Antes de crear o mover una tarea te puede pedir el OK. Si el OK no se puede dar, como en `codex exec`, crear una tarea se cancela sola.

No uses `codex mcp add` con login: en la versión 0.145.0 falló después de aprobar, y en las nuevas no está confirmado.

## Antigravity o Gemini

Antigravity (agregar probado; login sin probar): `agy mcp add --type http linear https://mcp.linear.app/mcp`. Queda para todos tus proyectos,
en `~/.gemini/config/mcp_config.json`. Gemini CLI, sólo con API paga: `gemini mcp add --transport http linear https://mcp.linear.app/mcp`.

> Probado el 05/11/2026: crear, leer y mover tareas con el conector de claude.ai, con el plugin en ChatGPT y con el plugin en Codex CLI. En Claude Code, crear y leer con el mismo conector. El login de `claude mcp add` no se completó.

## Probá

«¿Qué tareas tengo abiertas en el tablero?»

## Para sólo mirar

Usá `https://mcp.linear.app/mcp/readonly`: el mismo tablero, sólo con las acciones de lectura.

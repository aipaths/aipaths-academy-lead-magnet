# Conectar Google con conectores o plugins

El camino simple: conectás Google desde la herramienta, sin armar nada. La contra es que quedás atado a ella: lo que conectás en Claude lo tiene Claude.
Si querés que funcione en cualquier IA, seguí `PASO-A-PASO-GOOGLE.md`.

**¿Con qué cuenta?** Tu cuenta es lo cómodo: ve tus cosas de verdad. Una cuenta propia del agente es lo seguro: si se equivoca, sólo toca esa, pero hay que pasarle lo que necesite. Lo decidís vos; te sugerimos probar primero con una cuenta aparte.

## Claude

1. Entrá a <https://claude.ai/customize/connectors> con tu cuenta de Claude.
2. Conectá **Gmail**, **Google Calendar**, **Google Drive** y **Google Sheets**, uno por uno. Cada uno pide unos 4 clicks: elegí la cuenta, **Continuar**, permisos y **Continuar**. Al conectar Sheets, Google dice «Claude for Google Drive»: es normal.
3. **Abrí una sesión nueva.** La que ya estaba abierta no los toma.

Te sirven también en Claude Code, en la misma cuenta y sin hacer nada más.
Las acciones que escriben vienen marcadas «Needs approval» en la página de cada conector. **Eso no te protege en todos los modos:** con los permisos en «bypass», Claude Code manda sin preguntar. En el modo normal, pregunta.
Conectá también Drive: sin él, Sheets sólo trabaja con planillas de las que le pases el enlace, y no las busca por nombre.

> Probado el 04/11/2026: leer eventos en Calendar, mandar un mail en modo bypass (sin cartel) y editar celdas en Sheets. En `claude -p`, sin permiso, no escribe.

## Codex

En la app, pestaña **Plugins**, o en la terminal, escribí `/plugins`. Instalá **Gmail**, **Google Calendar** y **Google Drive** (este último incluye Sheets), conectá tu cuenta y abrí una sesión nueva.

> Sin probar: están en la lista de plugins de Codex y lo dice su documentación, pero falta conectarlos.

## Probá

- «¿Qué tengo esta semana?»
- «Dejale un borrador a [cliente].»

Si ves que el agente trae acciones para mandar o borrar, no es un error. Es lo que tenés que tener en cuenta al elegir la cuenta.

## Cómo cortarle el acceso

Desconectá el conector en la misma página, y en <https://myaccount.google.com/permissions> quitale el acceso a la app.

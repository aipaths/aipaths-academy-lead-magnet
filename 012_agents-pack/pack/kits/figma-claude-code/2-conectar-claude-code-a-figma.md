# 2 · Conectá Claude Code a tu Figma (gratis)

La conexión oficial de Figma pide un plan pago para que Claude pueda diseñar en tu archivo. Esta usa
el plugin gratis **Figma Desktop Bridge** (del proyecto open source `figma-console-mcp`), que corre
adentro de Figma de escritorio. No necesita token ni cuenta paga.

Creá una carpeta nueva para tu marca, abrí Claude Code ahí (app o terminal) y pegá esto:

```
Quiero que puedas diseñar en mi Figma. Instalá el puente gratis figma-console-mcp con su plugin
Desktop Bridge, sólo para esta carpeta. Hacelo vos y frename únicamente cuando yo tenga que hacer
algo en Figma.

1. Revisá que tenga Node.js 18 o más nuevo. Si no lo tengo, mandame a nodejs.org a bajar el
   instalador LTS, esperame, y después pedime que cierre y abra Claude Code para que encuentre npx.
2. Agregá el servidor MCP en esta carpeta, sin token de Figma y fijando la versión:
   claude mcp add figma-console -s project -e FIGMA_WS_HOST=localhost -- npx -y figma-console-mcp@1.40.9
   (Si estoy en Windows, usá «cmd /c npx» en vez de «npx».)
   Después corré «npx -y figma-console-mcp@1.40.9 --print-path»: crea el plugin y te dice la ruta
   del manifest. Pasámela tal cual.
3. Explicame en 3 pasos cortos lo que tengo que hacer yo, con los nombres exactos de los menús:
   abrir Figma de escritorio (no el de la web) con un archivo; Plugins → Development → Import plugin
   from manifest… y elegir ese manifest; correr el plugin «Figma Desktop Bridge» en el archivo.
   (Tip: en la ventana de elegir archivo, ⌘⇧G y pegá la ruta. En Windows, pegala en la barra del
   explorador.)
4. Escribí en el CLAUDE.md de esta carpeta una sección corta «Figma» que diga: que el puente es
   figma-console-mcp, que para usarlo Figma Desktop tiene que estar abierto con el plugin corriendo
   en el archivo, que todo color o letra sale de perfil-de-marca.md si existe, y qué hacer si no ve
   el archivo (volver a correr el plugin). Así cualquier agente que abra esta carpeta lo sabe usar.
5. Al final decime que abra una sesión nueva en esta carpeta y te pregunte «¿qué archivos de Figma
   ves?». Avisame que al abrirla Claude me va a preguntar si uso el servidor figma-console: tengo
   que elegir «Use this MCP server» (no apretar Enter de una, porque viene marcado «Continue
   without»). Si lo rechacé, /mcp → figma-console → Enable. Si contestás con el nombre de mi
   archivo, está andando.

Reglas: no me pidas tokens ni cuentas pagas. No toques la configuración global de Claude ni otras
carpetas. Si algo falla, decime qué falló en una frase y qué hago yo.
```

**Lo único que hacés vos**
1. Abrir Figma **de escritorio** (no el de la web) con un archivo.
2. Plugins → Development → Import plugin from manifest… y elegir el archivo que te dice Claude.
3. Correr el plugin «Figma Desktop Bridge» en ese archivo y dejarlo abierto.
4. Abrir una sesión nueva en la carpeta y preguntar «¿Qué archivos de Figma ves?».

**Ojo**
- La primera vez Claude te pregunta si usás el servidor `figma-console`: elegí «Use this MCP server».
  Viene marcado «Continue without»; si apretás Enter de una, lo rechazás (se arregla con `/mcp`).
- El plugin corre código en el archivo donde lo prendés: prendelo sólo donde quieras que trabaje, y
  que trabaje un agente por archivo a la vez.

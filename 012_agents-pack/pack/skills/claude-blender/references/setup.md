# Instalación y problemas de conexión (macOS)

## Instalación limpia

1. `.mcp.json` del proyecto:
   ```json
   { "mcpServers": { "blender": { "command": "/opt/homebrew/bin/uvx", "args": ["mcp-for-blender"] } } }
   ```
2. Blender: `brew install --cask blender` (instala `/Applications/Blender.app` y el comando `blender`).
3. **Abrir Blender una vez con ventana** (`open -a /Applications/Blender.app`) y aceptar el
   aviso de macOS "app descargada de internet". Esto también crea la carpeta de configuración.
4. Addon: `uvx mcp-for-blender install-addon`.
5. En Blender: Edit → Preferences → Add-ons → activar **MCP for Blender**. El servidor arranca
   solo (auto-start). Si no: tecla N en la vista 3D → pestaña BlenderMCP → Start MCP Server.
6. Verificar con `get_addon_status` y `get_scene_info`.

## Síntomas y causas reales

| Síntoma | Causa | Arreglo |
|---|---|---|
| "Could not connect to Blender" | Blender ni siquiera está instalado | `mdfind "kMDItemCFBundleIdentifier == 'org.blenderfoundation.blender'"`; instalar |
| `install-addon`: "Could not find a Blender user addons directory" | Blender nunca se abrió | Crear `~/Library/Application Support/Blender/<versión>/scripts/addons` y correr con `BLENDERMCP_ADDONS_DIR=<esa carpeta>` |
| `blender -b ...` se cuelga sin escribir nada en el log | Cuarentena de macOS: espera la confirmación de un diálogo invisible | Abrir Blender una vez con ventana y aceptar. Comprobar con `xattr -l /Applications/Blender.app` |
| Se cortó la conexión en medio del trabajo | Blender se cerró (proceso muerto) | `pgrep -lf Blender.app`. Reabrir con `open -a`: el addon vuelve a escuchar solo en el puerto 9876 (`lsof -iTCP:9876`). Rearmar desde el último `.blend` guardado |

## Notas

- La versión de la carpeta de configuración es mayor.menor (`5.2`), no la versión completa.
- Activar el addon en modo headless (`addon_utils.enable(..., persistent=True)` +
  `save_userpref`) es posible, pero **solo después** de la primera apertura con ventana.
  En la práctica es más rápido pedirle al usuario que lo active desde Preferences.
- La telemetría del addon viene apagada (`telemetry_consent: false`).

---
name: claude-blender
description: Manejar un Blender abierto a través del MCP for Blender (mcp-for-blender / blender-mcp) para hacer renders de producto con una marca, logos 3D a partir de una imagen plana, animaciones con física (que algo se caiga o se rompa), intros animadas de logo y VFX que meten un objeto 3D en un video real filmado con el celular (camera tracking). Incluye instalación y solución de problemas en macOS, una bitácora de pruebas y las trampas de la API de Blender 5.x encontradas en sesiones reales. Usalo siempre que el usuario mencione Blender, renders 3D, mockups de un producto con su marca, pasar un logo a 3D, "que se rompa / se caiga / explote", intros o motion con un logo 3D, poner un objeto 3D en un video que filmó, tracking o matchmove, o quiera probar qué puede hacer Claude en Blender — aunque nunca diga "MCP" ni "skill". Also use for English requests about Blender MCP, product renders, 3D logos, shatter physics, logo intros or camera tracking.
---

# Claude + Blender (MCP)

Flujo probado de verdad para manejar Blender desde Claude con `mcp-for-blender`.
Sale de una sesión real (taza de producto, taza que se rompe, logo 3D, intro del logo,
logo trackeado sobre un video de iPhone) y guarda qué funcionó, qué se rompió y por qué.

## Antes de nada: chequear la conexión

1. Llamá a `get_addon_status`. Si dice "Could not connect to Blender", **no asumas que es
   el addon**: primero fijate si Blender está instalado (`/Applications`, `mdfind`).
   La instalación completa y las trampas de macOS (el aviso de cuarentena que cuelga a
   Blender sin ventana, la carpeta de addons que no existe) están en `references/setup.md`.
2. Mirá qué bibliotecas de assets y generadores 3D están prendidos. Por defecto vienen
   **todos apagados**: planificá construir todo con código (funciona bien y cuenta mejor).
3. Anotá la hora de inicio (`date`): el usuario va a querer el tiempo "prompt → render".

## Reglas de oro (cada una nos costó un fallo)

- **Guardá después de cada paso** (`bpy.ops.wm.save_mainfile()`) y guardá cada prueba en su
  propio `.blend` (`escenas/AAAA-MM-DD_tema.blend`) con `save_as_mainfile` antes de tocar
  una escena anterior. Blender se cerró solo una vez y la escena sin guardar se perdió.
- **Nunca renderices pesado dentro del Blender del usuario.** Un render de prueba en Cycles
  dentro de la sesión tardó 90 s y después Blender se cerró. Usá EEVEE + `look` para
  previsualizar, y los renders finales (Cycles, animaciones) en un **proceso aparte**:
  `blender -b archivo.blend --python script.py` (ver `scripts/render_background.py`).
- **Trabajá a escala real** (metros). Una taza mide 0,08 m; un logo podés hacerlo de 1 m y
  escalarlo. A escala chica el encuadre automático de `look` se aleja: pasale `distance`.
- **Mirá seguido y en chico.** `look` con `max_size` 400–900 después de cada cambio visual.
  El modo `rendered` solo anda con EEVEE; con Cycles renderizá y usá `look(image="Render Result")`.
- **Blender 5.x movió cosas en la API.** Leé `references/api-5x.md` antes de animar (las
  fcurves viven en channelbags), componer (el compositor es un node group) o trackear por script.
- **Comillas en la shell:** en zsh, entrecomillá los argumentos de ffmpeg con `?` o `[`
  (`-map "2:a?"`) y no escribas `$var[...]`: zsh lo toma como índice de array.

## Elegí el flujo

| El usuario pide | Leé |
|---|---|
| Render de producto con su marca (taza, botella, caja) | `references/producto.md` |
| "Que se rompa / se caiga / explote" | `references/fisica-fractura.md` |
| Su logo en 3D, o una intro animada con él | `references/logo-3d-intro.md` |
| Meter un objeto 3D en un video que filmó | `references/camera-tracking.md` |
| Blender no conecta / problemas de instalación | `references/setup.md` |

## Conseguir los archivos del usuario

Una imagen pegada en el chat **no te llega como archivo**. Si necesitás el logo o la
referencia real, pedile que la deje en algún lado (por ejemplo Descargas) y buscá el archivo
más nuevo (`ls -t ~/Downloads | head`). Convertí webp/heic con `sips -s format png`.
No reemplaces por un asset "parecido" sin decirlo: en la sesión, la primera suposición
(el ícono del sitio web) era el logo equivocado.

## Que el usuario vea lo que pasa

El usuario puede mirar en vivo: su ventana de Blender se actualiza con cada código que
corrés. Si nunca usó Blender, dejale la vista por la cámara, con materiales y sin grilla:
`space.shading.type='MATERIAL'`, `region_3d.view_perspective='CAMERA'`,
`overlay.show_overlays=False`. Decile que la barra espaciadora reproduce la animación.

## Bitácora de cada prueba (los fallos son el contenido)

Una entrada por prueba en `notas/bitacora.md` con `references/bitacora-plantilla.md`:
prompt textual, modelo, tiempo real, cantidad de correcciones, rutas del resultado, qué
falló o sorprendió, y si sirve para el video o la demo. Escribila apenas termina el render,
con los números frescos.

## Entregar resultados

- Fotos: PNG en `renders/`. Video: renderizá cuadros PNG a una carpeta temporal y armá el
  MP4 con `scripts/encode_and_sheet.sh` (H.264, yuv420p, CRF 17–18). También arma una hoja
  de contactos para revisar varios cuadros con un solo `Read` antes de mandar.
- Mandá el archivo con la herramienta de envío y resumí: qué se ve, tiempo, correcciones,
  defectos conocidos y 2–3 opciones concretas para seguir.
- Cuando el usuario termina, guardá y cerrá Blender desde código: registrá
  `bpy.ops.wm.quit_blender()` en un timer de 1 s (`bpy.app.timers`) para que la llamada
  del MCP vuelva antes de que Blender se cierre.

# Conectar Gmail, Calendar y Sheets

Vas a crear tu propia llave de Google. Son 8 pasos en el navegador y un comando.
**¿Con qué cuenta de Google?** Lo decidís vos, y hay un trade-off:

- **Tu cuenta:** es lo cómodo. Ve tus mails y tu calendario de verdad y no tenés que reenviarle nada. Si se equivoca o lo engañan, lo hace con tus cosas.
- **Una cuenta propia del agente, con acceso limitado:** es lo seguro. Si se equivoca, sólo toca esa. Hay que pasarle lo que necesite: reenviarle mails, compartirle el calendario o la planilla.

Te sugerimos empezar con una cuenta propia para probar, y darle más acceso cuando le tengas confianza.

> Recorrido con una cuenta nueva el 04/11/2026. Los nombres están como salieron en español; entre paréntesis, cómo
> aparecen en inglés según la documentación de Google, por si tu consola está en ese idioma.

## Antes de empezar: verificación en 2 pasos

Google Cloud no te deja entrar sin esto, y necesitás el teléfono a mano. Activala en
<https://myaccount.google.com/signinoptions/twosv>. Si sigue el bloqueo, esperá unos minutos y actualizá la página.

## 1. Creá el proyecto

Entrá a <https://console.cloud.google.com> con la cuenta que elegiste. Si aparece **Comenzar gratis** o el crédito de USD 300, ignoralo:
para esto no hace falta.

1. Tocá el selector de proyecto, arriba a la izquierda (puede decir «My First Project»).
2. Tocá **Proyecto nuevo** (New project). Si sale un aviso amarillo con los proyectos que te quedan, no importa.
3. Ponele un nombre y tocá **Crear**.
4. **Tocá «Seleccionar proyecto» en el aviso de notificaciones.** Si no, la consola sigue en el proyecto anterior
   y lo que sigue queda en el lugar equivocado. Arriba tiene que aparecer el nombre del tuyo.

## 2. Habilitá las tres API

Una por una, abrí estos enlaces y tocá **Habilitar** (Enable). Esperá a que termine antes de pasar a la siguiente:

- <https://console.cloud.google.com/apis/library/gmail.googleapis.com>
- <https://console.cloud.google.com/apis/library/calendar-json.googleapis.com>
- <https://console.cloud.google.com/apis/library/sheets.googleapis.com>

## 3. Armá la pantalla de permiso

Abrí <https://console.cloud.google.com/auth/overview> y tocá **Comenzar** (Get started). Completá las cuatro secciones:

1. **Información de la app:** un nombre y tu mail. **Siguiente.**
2. **Público:** elegí **Usuarios externos** (External). **Siguiente.**
3. **Información de contacto:** tu mail otra vez, y Enter. **Siguiente.**
4. **Finalizar:** marcá la casilla de la política de datos, **Continuar** y **Crear**.

Si tu cuenta es de Google Workspace y el agente es de tu empresa, podés elegir **Interno** (Internal).

## 4. Sumá tu cuenta como usuario de prueba

En el menú de la izquierda, **Público** (Audience). Bajá hasta **Usuarios de prueba** (Test users) → **Add users** → escribí el mail de
la cuenta que elegiste, Enter y **Guardar**. Si no pasa nada, esperá unos segundos y tocá **Guardar** de nuevo.

## 5. Creá la llave y guardala

**Clientes** (Clients) → **Crear cliente** → **App de escritorio** (Desktop app) → **Crear**. El nombre que trae sirve.
No marques «Use this client for an AI-powered agent»: es para herramientas MCP de Google, y acá no hace falta.

**Antes de cerrar ese cuadro, bajá hasta el final y tocá Descargar JSON.** Google no te vuelve a mostrar el secreto. Si lo cerraste, creá otro cliente.

Ahora pasá esos datos a tu archivo `.env`:

```bash
node herramientas/google-credenciales.ts
```

Busca el JSON en Descargas y escribe `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en `.env`, sin mostrarlos. Podés correrlo vos o pedírselo a tu agente.
Si no lo encuentra, pasale la ruta del archivo. Después **borrá el JSON**.

También podés hacerlo a mano: copiá `.env.example` a `.env`, abrí el JSON y pegá `client_id` y `client_secret` en sus líneas.
**Hacelo vos, no se lo pases al agente en el chat.**

`.env` ya está en `.gitignore`, así que no se sube a GitHub. `.env.example` sí se sube: sólo tiene los nombres, sin los valores.

## 6. Instalá Node (si no lo tenés)

Pedile a tu agente: «Fijate si tengo Node 22.18 o más nuevo; si no, ayudame a instalarlo».

## 7. Iniciá sesión

```bash
node herramientas/google-login.ts
```

Se abre el navegador. Si tenés varias cuentas abiertas, elegí la que decidiste usar.
**Si usás varios perfiles de Chrome, puede abrirse en otro y mostrarte sólo tu cuenta principal.** No la elijas: copiá el enlace que
escribió el comando y pegalo en la ventana donde está la cuenta que elegiste.

- Google avisa que **no verificó la app**: es tu propia app. Tocá **Continuar**, no el botón azul «Volver a un sitio seguro».
- Tocá **Seleccionar todo** y bajá hasta **Continuar**. Las casillas vienen sin marcar.

Cuando diga «Listo. Ya podés cerrar esta pestaña», queda guardado `.credenciales/token.json`.

**¿Por qué no va en `.env`?** `.env` lo completás una vez. `token.json` es el permiso que te dio Google: lo escribe el login y el programa
lo renueva solo cada hora. Tampoco se sube a GitHub.

## 8. Probá

```bash
node herramientas/calendario.ts proximos
node herramientas/gmail.ts buscar "is:unread" --max 3
node herramientas/planilla.ts crear "Facturas"
```

Anotá el id de la planilla en `AGENTS.md`.

## Por qué se traba

| Qué ves | Qué pasó | Qué hacer |
|---|---|---|
| «Se bloqueó el acceso a Google Cloud» | Falta la verificación en 2 pasos | Volvé a «Antes de empezar» |
| No encontrás «Google Auth Platform» en el menú | No figura en el menú principal | Usá el enlace del paso 3 |
| A los 7 días, «Google dio de baja el permiso» | Tu app sigue en prueba: el permiso vence a los 7 días | Volvé a iniciar sesión |
| «Access blocked», o un triángulo rojo con «No deberías utilizar esta aplicación» | Tu cuenta no está en Usuarios de prueba | Paso 4 |
| «Google dio de baja el permiso» justo después de cortar el acceso | Revocaste la app | Volvé a iniciar sesión |
| «Esa API no está habilitada» | Falta una de las tres, o la habilitaste en otro proyecto | Paso 2. Fijate el nombre del proyecto arriba |
| «Ese JSON no es de una App de escritorio» | Creaste otro tipo de cliente | Paso 5 |
| «Falta GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET» | `.env` no existe o está incompleto | Paso 5 |
| Permiso vencido después de cambiar la contraseña | Google corta el permiso de Gmail cuando cambia la contraseña | Volvé a iniciar sesión |
| En Codex, las herramientas no conectan | Codex corta la red por defecto | `.codex/config.toml` ya lo habilita; abrí la carpeta como proyecto de confianza |
| No ves `.env`, `.credenciales` ni `.agents` en el Finder | Son carpetas ocultas | `Cmd + Shift + .` |

## ¿Publicar la app para que no venza?

**No hace falta para empezar, y sale peor de lo que parece:**

- **Publicar app** está gris hasta que cargues una página principal, una política de privacidad y un dominio autorizado. Hay que tener una web.
- La advertencia pasa a ser más fuerte: triángulo rojo y «No deberías utilizar esta aplicación». Se entra por **Configuración avanzada → Ir a … (no seguro)**.
- Google dice que hasta 100 usuarios no pide aprobación, y que ese límite no se reinicia.
- **Si después volvés a modo de prueba, se borra tu lista de Usuarios de prueba:** tenés que repetir el paso 4.

Lo que falta confirmar es el vencimiento: los 7 días no se pudieron medir el día de la prueba.

## Qué permisos pide y por qué

| Permiso | Para qué |
|---|---|
| `gmail.readonly` | Buscar y leer mails |
| `gmail.compose` | Dejar borradores. **Ojo: también permite mandar** |
| `calendar.events` | Ver y crear eventos |
| `spreadsheets` | Leer y escribir planillas |

**Google no tiene un permiso sólo para borradores.** `permisos.json` hace que `gmail.ts` no mande, pero es una regla nuestra,
no de Google: un agente con el token podría saltearla. Lo único que limita el daño de verdad es a qué cuenta tiene acceso: es el trade-off del principio.

## Cómo cortarle el acceso

<https://myaccount.google.com/permissions> → tu app → **Eliminar todas** → **Confirmar**. Y borrá `.credenciales/token.json`. Si alguien vio tu secreto, creá otro cliente y volvé a correr el paso 5.

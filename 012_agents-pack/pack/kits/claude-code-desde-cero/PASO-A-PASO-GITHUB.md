# Paso a paso: tu cuenta de GitHub y la copia de la carpeta

La carpeta de tu agente está en un solo lugar: tu computadora. GitHub te deja tener siempre una copia y guardar cada versión nueva. Si un día perdés la carpeta, la recuperás. Es la parte del video que arranca en 12:10.

Los pasos de GitHub salen de su documentación oficial, y cada uno tiene el link al lado. GitHub cambia sus pantallas seguido, así que acá no las describo una por una: si ves algo distinto, seguí lo que te pida la pantalla.

## Tres palabras antes de empezar

- **Repositorio:** el lugar donde GitHub guarda tus archivos y el historial de cambios de cada uno. Es como un proyecto: una página web es un repositorio, un agente nuevo es otro. ([Acerca de los repositorios](https://docs.github.com/es/repositories/creating-and-managing-repositories/about-repositories))
- **Privado:** a un repositorio privado sólo entrás vos y las personas a las que les des acceso. A uno público lo ve cualquiera en internet. La carpeta de tu agente va en uno privado.
- **Historial:** cada versión que subís queda guardada. En el video (13:39) se ve la carpeta en GitHub con el historial de lo que fue cambiando.

## 1. Crear la cuenta

Crear la cuenta es gratis, y la cuenta gratis incluye repositorios privados ([planes de GitHub](https://docs.github.com/es/get-started/learning-about-github/githubs-plans)).

1. Entrá a <https://github.com/signup>.
2. Elegí cómo registrarte: con tu mail, o con el botón **Continue with Google**. GitHub también acepta entrar con una cuenta de Apple.
3. Seguí las indicaciones para crear tu cuenta personal.
4. Durante el registro, GitHub te pide que verifiques tu dirección de mail. Hacelo: sin el mail verificado no podés empezar a usar la cuenta.

Fuente: [Creación de una cuenta en GitHub](https://docs.github.com/es/account-and-profile/how-tos/account-management/creating-an-account-on-github).

**Si el registro falla** con un mensaje como «This email can't be used» o «We couldn't create your account», GitHub recomienda probar esto:

- Usar otro navegador, o borrar las cookies y la caché.
- Desactivar las extensiones del navegador.
- Registrarte desde otro dispositivo y otra red.
- Esperar un rato y volver a intentar.
- Si el mensaje es «This email can't be used», probar con otra dirección de mail.

**Si no te llegó el mail de verificación:** arriba a la derecha de cualquier página de GitHub, hacé clic en tu foto de perfil y después en **Settings**. En la barra lateral, **Emails**. Debajo de tu dirección, **Resend verification email**. ([Verificar tu dirección de correo electrónico](https://docs.github.com/es/account-and-profile/how-tos/email-preferences/verifying-your-email-address))

**Recomendado:** GitHub aconseja activar la verificación en dos pasos (2FA) para proteger la cuenta. Ahí va a quedar todo lo que sabe tu agente. ([Configurar la autenticación de dos factores](https://docs.github.com/es/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication))

## 2. Pedirle a Claude Code que suba la carpeta

En el video (13:18): una vez que tenés la cuenta, la podés conectar a Claude con, por ejemplo, un conector, y después le pedís que suba la carpeta.

1. Abrí la carpeta de tu agente en la app de Claude, en la pestaña **Code**.
2. Pedile esto:

```text
Subí esta carpeta a un repositorio privado de GitHub.
```

Mientras trabaja te puede frenar para pedirte permiso, como en el resto del curso. Leé qué te pide antes de aceptar.

En el video, la computadora ya tenía el acceso a GitHub configurado. En la tuya, la primera vez, Claude te va a decir que le falta conectar tu cuenta de GitHub. Pedile que te guíe. Este pedido no está en el video:

```text
Decime qué te falta para subir esta carpeta a un repositorio privado de mi cuenta de GitHub y guiame paso a paso, sin usar la terminal.
```

## 3. Revisá que quedó bien

1. Entrá a GitHub con tu cuenta y abrí el repositorio. Tienen que estar las carpetas y los archivos de tu agente, con su historial.
2. Confirmá que es privado. Una forma: abrí la dirección del repositorio en una ventana privada del navegador, sin entrar a tu cuenta. No tenés que poder verlo.
3. Si quedó público, cambialo. En la página principal del repositorio, **Settings**. En la sección «Danger Zone», a la derecha de «Change repository visibility», **Change visibility**, y elegí privado. ([Configurar la visibilidad de un repositorio](https://docs.github.com/es/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility))

## 4. Para que trabaje solo sobre esa copia

En el video (14:24): Anthropic te deja programar la tarea en sus servidores, y ahí el investigador trabaja sobre la copia de GitHub en vez de usar tu computadora.

Para eso Claude tiene que poder entrar a tu repositorio. Según la documentación de Claude Code:

1. Entrá a `claude.ai/code` con tu cuenta de Claude.
2. Te pide conectar GitHub. Seguí las indicaciones: te lleva a la página de autorización de GitHub, aprobás y volvés.
3. Como tu repositorio es privado, instalá además la app de Claude para GitHub en tu cuenta: <https://github.com/apps/claude/installations/new>.

Fuente: [Get started with Claude Code in the cloud](https://code.claude.com/docs/en/web-quickstart).

Las tareas programadas en los servidores de Anthropic están en los planes pagos y todavía figuran como vista previa, así que pueden cambiar. En la app pueden aparecer como **Scheduled** o como **Routines**. Fuente: [Automate work with scheduled tasks](https://code.claude.com/docs/en/routines).

Los dos pedidos del video para esta parte:

```text
Todos los días a las 8 de la mañana, buscá qué hay de nuevo sobre agentes personales y dejame el informe de hoy.
```

```text
Traé lo que hiciste anoche.
```

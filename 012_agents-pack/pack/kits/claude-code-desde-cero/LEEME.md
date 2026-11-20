# Curso de Claude Code desde cero: la guía

> Viene del video **[Curso de Claude Code desde cero 2027 (sin saber programar)](https://www.youtube.com/watch?v=O-PwfY1qSQ0&list=PLItELtCfBA39BbCy0gS8eO2OGn5xEO_cB)**.
> Más videos con su parte del pack: `../../README.md` → "¿Venís de un video?".

Lo que prometo en el video: dónde bajar la app, los conceptos más importantes, todos los prompts y los archivos del agente investigador. El paso a paso de la cuenta de GitHub está aparte, en `PASO-A-PASO-GITHUB.md`.

Va en el orden del video, con el minuto de cada cosa. Todo se hace desde la app de Claude, en la pestaña Code. No hace falta abrir una terminal.

| Archivo | Para qué |
|---|---|
| `LEEME.md` | Esta guía: qué necesitás, los conceptos y los prompts |
| `PASO-A-PASO-GITHUB.md` | Crear la cuenta de GitHub y subir la carpeta a un repositorio privado |
| `investigador/` | La carpeta del agente que armo en el video, lista para abrir |

## 1. Lo que necesitás

### La app de Claude para la computadora (1:42)

Se baja de la página oficial: <https://claude.com/download>. Mac y Windows están en la misma página.

1. En **macOS** o en **Windows**, hacé clic en **Download**. Si tu Windows es ARM, hay un botón aparte: **Windows (arm 64)**.
2. Abrí el archivo que se bajó para completar la instalación.
3. Abrí Claude desde la carpeta Aplicaciones (Mac) o desde el menú Inicio (Windows).
4. Entrá con tu cuenta.

Pide macOS 13 (Ventura) o más nuevo, o Windows 10 o más nuevo. Los pasos y los requisitos salen de la ayuda oficial: <https://support.claude.com/en/articles/10065433-install-claude-desktop>.

### Un plan pago de Claude (1:12)

Si pagás cualquier plan de Claude, ya tenés incluido Claude Code. Con el plan gratis sólo podés usar el chat. Los planes de hoy están en <https://claude.com/pricing>.

### Una cuenta de GitHub (13:03)

Es gratis y la vas a usar recién en la parte de la copia. Está en `PASO-A-PASO-GITHUB.md`.

## 2. Los conceptos

### Claude y Claude Code no son lo mismo (0:53)

Claude Code está más preparado para trabajar adentro de una carpeta de tu computadora. Le decís en qué carpeta tiene que trabajar, y ahí adentro lee y escribe archivos.

Se puede usar desde la web, desde la app de la computadora y desde una terminal (1:21). La app es la que recomiendo y la que uso en todo el curso.

### Chat o Code: dónde queda guardado lo que tu asistente es (2:14)

En el chat, las instrucciones que le diste y lo que recuerda de vos quedan guardadas en tu cuenta de Claude. En Claude Code quedan escritas en archivos, adentro de tu carpeta.

La prueba del video: les pido lo mismo a los dos. El chat dice que se lo va a acordar, y queda en mi cuenta. Claude Code lo anota en un archivo de la carpeta: lo abro y ahí está la frase. La puedo leer y la puedo cambiar.

Si mañana cambio de computadora, me llevo esa carpeta y sigo con el mismo contexto (3:13). Todo lo que le vayas enseñando a tu agente queda así, en archivos tuyos.

### La carpeta del agente: instrucciones y memoria (5:24)

Lo que queda adentro de la carpeta `investigador` cuando apruebo el plan:

| Qué | Archivo |
|---|---|
| Quién es y cómo trabaja | `CLAUDE.md` |
| Lo que tiene que recordar siempre | `memoria.md` |
| Lo que hizo, un archivo por día | `bitacora/` |
| Los informes diarios y las investigaciones | `informes/diarios/` e `informes/investigaciones/` |

Son archivos de texto. Los podés abrir, leer y modificar a mano (5:51).

### Modo Plan (4:18)

Lo que más frustra cuando arrancás es pedirle algo, que lo haga de una y que el resultado no sea lo que tenías en la cabeza. Por eso, antes de mandarlo a investigar, va el plan.

Abajo de donde escribís hay un selector de modo. En modo **Plan**, Claude te propone cómo haría las cosas y no toca nada hasta que le digas que sí. Si algo no te cierra, se lo decís y lo cambia. Cuando el plan está bien, lo aprobás, y recién ahí crea todo.

### El micrófono (5:58)

Nada de esto hace falta escribirlo. Al lado de donde escribís hay un micrófono: lo apretás, hablás y te lo pasa a texto. A mí me ahorra muchísimo tiempo.

### Permisos (7:00)

Mientras trabaja te frena para pedirte permiso, y tiene sentido: está tocando archivos de tu computadora. Si te pregunta por cada cosa, trabaja mucho más lento. Si le das permiso para todo, no sabés qué tocó. Para eso están los modos de permiso, en el mismo selector de abajo:

| Modo | Qué hace |
|---|---|
| **Manual** | Te pregunta antes de cada cambio |
| **Accept edits** | Lo deja editar archivos sin preguntar, y te consulta para el resto |
| **Auto** | Lo deja trabajar solo, pero revisa cada acción antes de hacerla y frena las que ve peligrosas |

En una computadora donde tenés tus cosas, el que recomiendo es Auto.

Si mientras trabaja ves que se está yendo para otro lado, no hace falta esperar a que termine (7:27). Le escribís y lo toma en el momento.

### Modelo y esfuerzo (7:41)

Al lado del modo vas a ver el nombre de un modelo y un nivel de esfuerzo. Los mejores modelos consumen créditos mucho más rápido y dan resultados más profesionales. La regla que uso yo, con los modelos de cuando grabé el video (noviembre de 2026):

- **Para armar un plan, para algo creativo o para algo que después hay que revisar bien:** el mejor modelo que haya. Hoy es Fable. Consume tantos créditos que tiene su límite aparte, y no está incluido en el plan de 20 dólares. El que le sigue es Opus, hoy Opus 5.5.
- **Para analizar imágenes o videos:** Opus 5.5. Para eso sale mucho más barato y está preparado para manejar imágenes.
- **Sonnet y Haiku**, los más baratos: casi no los uso.
- **El esfuerzo:** en medio o en alto, según el apuro. Con más esfuerzo es más lento, da mejores resultados y consume un poco más.

### Las cuatro herramientas: mirá dónde queda guardada cada una (9:03)

Hasta acá el investigador sólo conoce lo que hay adentro de su carpeta. Para que haga algo con tu mail o con tus tareas, le tenés que dar herramientas. Aparecen cuatro nombres, y se ordenan por dónde queda guardada cada una.

| Herramienta | Dónde queda | Qué es |
|---|---|---|
| **Conectores** (9:31) | En tu cuenta de Claude | Los más fáciles. Tocás el «+», elegís por ejemplo Gmail, entrás con tu usuario de Google y listo. Con un servicio de otra empresa, como Linear, es igual. Los tenés en cualquier computadora donde entres con tu usuario de Claude. No viajan con la carpeta: si un día la abrís con otra herramienta, el mail no va a estar conectado |
| **Skills** (10:23) | En la carpeta | Una skill es como una receta: la forma en la que querés que haga algo. Queda adentro de la carpeta, en una sección que normalmente está oculta, y viaja con todo lo demás |
| **Plugins** (11:03) | En tu computadora | Paquetes que armó otra persona, con varias skills y a veces herramientas adentro. Los instalás desde el mismo «+» y sirven sólo en esa computadora |
| **MCP** (11:22) | Atrás de un conector | Un conector es un MCP que Claude te deja listo para conectar con un clic. La herramienta está en los servidores de Linear o de Google, y vos sólo entrás con tu usuario. El nombre lo vas a necesitar cuando tu servicio no esté en la lista de conectores: ahí le pedís a Claude que lo agregue a mano, y lo podés guardar en la carpeta para que viaje con ella |

El repaso (11:59): los conectores van con tu cuenta, las skills van con la carpeta, los plugins se quedan en la compu, y MCP es lo que hay atrás de un conector.

Si en tu app el «+» no muestra **Connectors**, puede decir **Add connectors**, o estar adentro de **Plugins**: cambia con la versión. Lo explica la documentación oficial: <https://code.claude.com/docs/en/desktop>.

### La copia en GitHub (12:10)

La carpeta, con todo lo que armaste adentro, está en un solo lugar: tu computadora. Si la perdés, es muy difícil volver a armar todo.

GitHub te deja tener siempre una copia de tu carpeta y guardar cada versión nueva. Si perdés la carpeta de tu computadora, la recuperás. Y no dependés de Anthropic.

Un repositorio es como un proyecto (13:29): si querés una página web, creás un repositorio; si querés un agente nuevo, creás otro. Cómo se hace: `PASO-A-PASO-GITHUB.md`.

### Que trabaje solo (13:46)

Para que haga el informe todos los días sin que se lo pidas existen las tareas programadas. El problema es que la carpeta está en tu computadora: para que funcione, tendría que estar prendida todo el día, con la app abierta.

Anthropic te deja programar esa misma tarea en sus servidores (14:24). Ahí aparece la segunda ventaja de GitHub: en vez de usar tu computadora, el investigador trabaja sobre la copia que guardaste ahí. A la noche hace su trabajo y lo deja guardado en GitHub. A la mañana abrís la compu, le pedís que lo traiga y seguís desde ahí. Incluso podés estar trabajando vos en tu compu mientras él trabaja allá.

### El celular (15:04)

Como ya no necesita tu computadora, lo podés manejar desde el celular. Abrís la app de Claude, entrás a Code y ves tus sesiones. Si te hizo una pregunta, le contestás. Si querés un cambio, se lo pedís.

## 3. Los prompts del video

En orden, con el minuto. Están como quedaron escritos en pantalla; cuando los digo en voz alta puede cambiar una palabra.

**1. La misma instrucción en el chat y en Claude Code (2:50)**

```text
De ahora en más, los resúmenes los quiero en cinco líneas y con las fuentes al final.
```

**2. Armar el agente, en modo Plan y en una carpeta vacía (4:34)**

```text
Quiero armar un agente investigador en esta carpeta. Antes de crear nada, haceme las preguntas que necesites sobre el agente que quiero, y después proponeme una estructura para que la carpeta quede ordenada y fácil de encontrar.
```

Después de este pedido, Claude pregunta. Tus preguntas pueden ser otras: contestá con lo tuyo.

**3. Mi respuesta a sus preguntas: los dos modos (4:54)**

```text
Lo que yo quiero es un investigador que tenga dos modos: que pueda hacer investigaciones profundas y crearme un reporte completo sobre un tema, y otro modo que revise por día los cambios o las noticias que aparezcan sobre un tema y que me vaya contando lo que encuentra.
```

**4. El cambio que le pido al plan antes de aprobarlo (5:43, se ve en pantalla)**

```text
Sumá un archivo con lo que tenés que recordar siempre y otro por día con lo que hiciste. Y juntá lo que escribís en una carpeta informes, con una carpeta adentro para los informes diarios y otra para las investigaciones.
```

**5. La primera investigación (6:19)**

```text
Investigá qué es un agente personal de inteligencia artificial.
```

**6. Corregirlo mientras trabaja (7:35)**

```text
Hacé el informe más corto.
```

**7. Con el conector de Gmail (9:47)**

```text
Dejá el informe de hoy como borrador en mi email.
```

**8. Con el conector de Linear (10:00, se ve en pantalla)**

```text
Anotá en Linear, en el equipo Tablero de prueba, una tarea para revisar el precio de Dots.
```

«Tablero de prueba» es el equipo de mi Linear de ejemplo. Poné el nombre del tuyo y la tarea que te sirva.

**9. Guardar una skill (10:40)**

```text
Guardá como skill en esta carpeta la forma en la que armaste el informe de hoy.
```

**10. La copia en GitHub (13:25)**

```text
Subí esta carpeta a un repositorio privado de GitHub.
```

**11. La tarea programada (14:05)**

```text
Todos los días a las 8 de la mañana, buscá qué hay de nuevo sobre agentes personales y dejame el informe de hoy.
```

**12. A la mañana siguiente (14:51)**

```text
Traé lo que hiciste anoche.
```

Sobre los prompts, lo que digo en el video (5:10): el prompt ya no es tan importante. Hoy se consiguen mejores resultados configurando mejor el sistema alrededor que en la propia instrucción.

## 4. Cómo usar los archivos del kit

Tenés dos caminos.

**Armarlo desde cero, como en el video.** Creás una carpeta vacía, elegís modo Plan y usás los prompts 2, 3 y 4. Queda hecho a tu medida, y `investigador/` te sirve para comparar.

**Arrancar con la carpeta del kit.**

1. Copiá la carpeta `investigador/` donde quieras tenerla en tu computadora.
2. Abrí la app de Claude y entrá a la pestaña **Code**.
3. Donde te pregunta dónde querés trabajar, dejá **This computer** (tu computadora).
4. Tocá **Choose folder**, después **Open folder…**, y elegí la carpeta `investigador`.
5. Probá con el prompt 5, o cargá un tema en `temas.md` y preguntale «¿Qué hay de nuevo?».

Los nombres en inglés son los que se ven en el video. Pueden cambiar con la versión de la app.

### Qué hay en `investigador/`

| Archivo | Para qué |
|---|---|
| `CLAUDE.md` | Las instrucciones del agente: quién es, sus dos modos, cómo usa la memoria y la bitácora, y sus reglas. Claude Code lo lee al abrir la carpeta |
| `LEEME.md` | La guía de uso que escribió el propio agente |
| `memoria.md` | Lo que recuerda siempre. Trae las dos preferencias del video: cambialas por las tuyas |
| `temas.md` | Los temas que sigue a diario. Arranca vacío |
| `plantillas/` | El formato de la investigación, del informe diario y de la bitácora. Si cambiás uno, cambian los informes que vengan |
| `bitacora/2026-11-19.md` | Lo que hizo el día que grabé, de ejemplo |
| `informes/investigaciones/` | El informe del video, recortado, para que veas el formato |
| `informes/diarios/` | Vacía. Ahí van las novedades de cada día |
| `.claude/skills/informe-de-investigacion/SKILL.md` | La skill que guarda en el minuto 10:40, completa |
| `.gitignore` | Evita que se suban a GitHub los archivos ocultos que crea la Mac |

Para empezar limpio, borrá el archivo de `bitacora/`, el informe de ejemplo y las dos líneas de `memoria.md`.

Las carpetas que empiezan con punto, como `.claude`, están ocultas. En Mac se ven con `Cmd + Shift + .`. En Windows, en el Explorador de archivos, entrá al menú Ver y activá **Elementos ocultos** (<https://support.microsoft.com/es-es/windows/experience/fileexplorer/file-explorer-in-windows>).

## Lo que no viene en el kit

El borrador de Gmail, la tarea de Linear y el repositorio de GitHub del video: esos quedan en tus cuentas cuando los hacés vos. Tampoco vienen conectores, porque se conectan con tu usuario. Y el informe de ejemplo está recortado: sin precios, sin el detalle de cada producto y sin citas con nombre.

## Licencia

MIT, como el resto del material original del pack.

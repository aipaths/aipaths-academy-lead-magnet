# Prompts para armar el sistema de gastos desde 0 (Claude Code, app de escritorio)

Video: https://youtu.be/7nQwx3v9pvQ · seis tareas, **un prompt por tarea**. Pegalos en orden, tal cual; lo que va entre `[corchetes]` lo completás vos.

## Cómo usarlos
- App de Claude → pestaña **Code** → **Local** → carpeta `finanzas/`. Modo **Manual**, para ver cada permiso.
- **Antes de arrancar:** una carpeta `finanzas/` con `datos/` adentro y, si la tenés, tu CSV (el prompt 3 lo pide si falta); una **hoja de Google vacía** (con tu sesión abierta en Chrome); Chrome con la extensión **Claude in Chrome**. Limpiá el CSV antes: el agente manda el archivo entero a tu hoja y no puede anonimizar nombres ni cuentas.
- **Cada prompt termina con un "FINAL DE LA TAREA N":** una lista que Claude tiene que verificar punto por punto (✓/✗) y cerrar con "TAREA N LISTA". Si no escribió eso, la tarea no terminó: no pases a la siguiente.
- Si algo falla, pegale el error con "me dio este error, arreglalo". Si el navegador no anda, el prompt ya le pide que te guíe.

| Tarea | Qué se hace | Final (se da por hecha cuando…) |
|---|---|---|
| 1 | Crear el primer agente y la estructura de carpetas | existen las carpetas, el agente y `.env.local` vacío, y te explicó cada cosa |
| 2 | Darle acceso a tu hoja (con el navegador) | la dirección responde con el token bueno y rechaza uno malo |
| 3 | Cargar los gastos | la hoja coincide con tu CSV al centavo y repetir la carga da 0 nuevas |
| 4 | Resumen con 3 gráficos y selectores | los 3 bloques andan, los selectores actualizan tabla y gráfico y los números cierran |
| 5 | Un segundo agente que revisa y pule | PASA, la hoja quedó prolija y la prueba del NO PASA funcionó |
| 6 | Ahora te toca a vos: qué automatizar | tenés la matriz lista |

---

## Tarea 1 · Crear el primer agente y la estructura de carpetas
```
TAREA 1 DE 6 · CREAR EL PRIMER AGENTE Y LA ESTRUCTURA DE CARPETAS

CONTEXTO
Estoy armando, paso por paso, un sistema de agentes de Claude Code que carga mis gastos en una hoja de Google, los grafica y los revisa. Esta carpeta se llama finanzas. No sé programar: explicame todo en palabras simples y sin jerga. En esta tarea sólo se crean archivos; todavía no se conecta nada.

LO QUE QUIERO QUE HAGAS
1. Armá esta estructura. Si algo ya existe, no lo pises ni lo borres:

finanzas/
├── prompts/                   los prompts de cada tarea y las imágenes de referencia (ya existe; no la toques)
├── datos/                     mis CSV del banco (los pongo yo; no los toques)
├── apps-script/               copia del código que va a vivir en mi hoja de Google
├── .claude/
│   └── agents/
│       └── carga-gastos.md    el primer agente
├── .env.local                 datos de conexión y secretos (la hoja, la dirección y la contraseña)
└── .gitignore                 para que .env.local no se suba nunca a ningún lado

2. Creá el agente como un subagente de proyecto: un archivo .md en .claude/agents/ llamado carga-gastos. Arriba va el nombre, una descripción corta de cuándo usarlo, el modelo sonnet y las herramientas Read, Glob, Grep y Bash. Abajo van las instrucciones, que tienen que decir:

TRABAJO: cargar mis gastos en la pestaña "Movimientos" de mi hoja de Google, ponerles categoría a los comercios nuevos y, más adelante, armar el resumen con gráficos.

CÓMO TRABAJA:
- La hoja se maneja a través de una "puerta": una dirección web con contraseña que se crea en la tarea 2. Los datos de conexión viven en .env.local: HOJA (el link de mi hoja), URL (la dirección de la puerta) y TOKEN (la contraseña). Los lee sin mostrarlos nunca en pantalla.
- Antes de cargar un CSV se fija bien en sus campos, para que queden guardados correctamente: separador, codificación, qué columna es la fecha y en qué formato (día/mes/año o mes/día/año), si el monto viene en una sola columna o separado en débito y crédito, separadores de decimales y de miles, si los gastos vienen en positivo o negativo, cuál es la columna del comercio y qué filas no son movimientos (totales, saldos, encabezados repetidos, filas vacías). Los gastos tienen que quedar guardados como números positivos y los reembolsos como negativos. Si algo es ambiguo, me pregunta antes de cargar.
- Para cargar manda el CSV ENTERO, tal cual está, con curl (curl.exe si estoy en Windows): curl -sL --http1.1 --data-binary @datos/ARCHIVO.csv -H "Content-Type: text/csv" "$URL?token=$TOKEN&accion=cargar". Nunca copia, resume ni reescribe los montos: los números no pasan por su cabeza.
- Si la respuesta no es un JSON con "ok":true (a veces Google devuelve un error pasajero, una página de error o un mensaje raro, por ejemplo "acción desconocida" aunque la acción era válida), reintenta hasta 3 veces: es seguro porque la hoja no duplica. Si sigue fallando, se frena y me muestra el mensaje.
- Después de cargar SIEMPRE confirma con la acción leer (un GET a la misma dirección con &accion=leer) cuántas filas tiene la hoja. Si hubo un reintento, la primera carga pudo haber entrado igual y el reintento dice "0 nuevas": en ese caso me lo aclara en vez de decir que no cargó nada.
- Para las categorías mira sólo los nombres de los comercios sin categoría (nunca los montos), propone una categoría para cada uno y las manda con la acción categorias.
- Cuando termina me cuenta: filas recibidas, nuevas y repetidas, cuántas filas tiene la hoja ahora y qué le pareció raro.

REGLAS:
1. Los números salen de mis CSV y de las fórmulas de la hoja. Nunca suma ni calcula de cabeza.
2. Sólo lee datos/. Sólo escribe en mi hoja, a través de la puerta. No modifica ni borra mis CSV.
3. Si una fila parece un error (monto raro, duplicado, sin categoría, monto vacío), la carga igual y me la señala. No la corrige.
4. El token y la dirección no van dentro de este archivo ni se imprimen. No muestra filas completas de mis CSV en pantalla: sólo el encabezado y cantidades.

3. Creá .env.local con tres variables vacías: HOJA=, URL= y TOKEN=. Poné .env.local en .gitignore.

4. Cuando termines, explicame la estructura como si no supiera programar: qué es cada carpeta y cada archivo, y cuál de todos es "el agente". Mostrame el archivo del agente y decime qué hace en una frase.

QUÉ NO HACER EN ESTA TAREA
No ejecutes curl, no abras el navegador, no instales nada, no crees nada fuera de esta carpeta y no sigas con la tarea 2.

FINAL DE LA TAREA 1 (verificá cada punto y mostrámelo con ✓ o ✗)
✓ Existen datos/, apps-script/, .claude/agents/carga-gastos.md, .env.local y .gitignore.
✓ carga-gastos.md tiene arriba nombre, descripción, modelo sonnet y herramientas Read, Glob, Grep y Bash, y abajo trabajo, cómo trabaja y reglas.
✓ .env.local tiene HOJA=, URL= y TOKEN= vacías, y está en .gitignore.
✓ Me explicaste cada carpeta y cada archivo, y cuál es "el agente".
Cuando todo esté en ✓ escribí "TAREA 1 LISTA" y esperá. Si algún punto no pudo cumplirse, decime cuál y por qué.
```

## Tarea 2 · Darle acceso a mi hoja (con el navegador)
**Antes:** creá la hoja de Google vacía y copiá su link. **Vas a tener que:** aprobar vos el permiso de Google (se abre en una ventana aparte que Claude no puede manejar).
```
TAREA 2 DE 6 · DARLE ACCESO A MI HOJA DE GOOGLE (CON EL NAVEGADOR)

CONTEXTO
Seguimos con el sistema de gastos (la tarea 1 está hecha: existe el agente carga-gastos y la carpeta). Ahora el agente tiene que poder escribir en mi hoja de Google. Vamos a usar Apps Script, el editor de macros que viene dentro de Google Sheets: se pega un código en la hoja y eso crea una "puerta" con contraseña (una dirección web más un token) por la que el agente manda los datos. Quiero que hagas TODO el trabajo vos, usando el navegador (browser use, con la extensión Claude in Chrome, en mi Chrome, donde ya tengo la sesión de Google abierta). Llamame sólo cuando haga falta algo que tengo que hacer yo. Explicame todo en palabras simples.

DATOS
- Mi hoja de Google, vacía: [PEGAR EL LINK DE LA HOJA]
- La primera fila de mi CSV (el encabezado) es: [PEGAR EL ENCABEZADO DE TU CSV]. Si no te la pasé, mirá la primera fila de un CSV de datos/ (sólo esa fila); si no hay ninguno, pedime uno antes de seguir.

PASO A PASO
A. Guardá el link en .env.local (HOJA=). Generá un token largo y aleatorio (32 caracteres hexadecimales) y guardalo en .env.local (TOKEN=). No lo escribas en el archivo del agente.

B. Escribí el código de Apps Script y guardá una copia en apps-script/Code.gs. Tiene que:
- Funcionar como "aplicación web" y manejarse con la dirección + ?token=...&accion=...
- Pedir siempre el token. Si no coincide, devolver {"ok":false,"error":"token"} y no hacer nada más. Responder siempre JSON. Limitarse a ESTA hoja (anotación @OnlyCurrentDoc).
- Tener estas acciones:
  · cargar (POST, el cuerpo es un CSV): agrega las filas a la pestaña "Movimientos" (si no existe, la crea con sus encabezados). No duplica: si cargo dos veces el mismo archivo, 0 filas nuevas; pero si un mismo archivo trae dos filas idénticas (mismo día, comercio y monto) conserva las dos. Devuelve cuántas filas recibió, cuántas son nuevas y cuántas repetidas.
  · categorias (POST, el cuerpo es una lista JSON de {"comercio":"...","categoria":"..."}): las agrega o actualiza en la pestaña "Categorías" (columnas comercio y categoria; la crea si no existe) sin borrar las que ya están.
  · leer (GET): devuelve un JSON con filas, total, por_categoria, por_mes (AAAA-MM → total), el mapa de categorias (comercio → categoría), la lista de comercios sin_categoria, los números de fila con monto vacío o que no es número (no_numericos), la ultima_fecha cargada y total_en_resumen (la celda del total general de la pestaña "Resumen", o null si todavía no existe).
- Columnas de "Movimientos", en este orden: fecha, comercio, monto, detalle (el resto de las columnas del CSV), clave (uso interno para no duplicar), categoria, ano, mes y ano_mes (texto AAAA-MM). La fecha tiene que quedar como fecha real; monto, ano y mes como números. Fecha, ano, mes y ano_mes las calcula el código. La categoría de cada fila sale de una fórmula que busca el comercio en "Categorías" y, si no está, dice "(sin categoría)".
- Entender CSV de bancos distintos: busca las columnas por su nombre (fecha, comercio o descripción, monto o importe; si hay débito y crédito separados, los combina en un solo monto: débito positivo, crédito negativo). Entiende fechas AAAA-MM-DD y día/mes/año, y números como 1.234,56 y como 1,234.56. Si el CSV ya trae una columna de categoría, la usa para completar "Categorías" sin pisar lo que ya esté. Si no reconoce una columna, lo dice en el error y dice cuál.
- Una celda vacía o rota no puede hacer fallar los totales: la lista en no_numericos.

C. En el navegador (browser use):
1. Abrí mi hoja en una pestaña nueva.
2. Extensiones → Apps Script. Si ya hay código, preguntame antes de reemplazarlo.
3. Reemplazá el contenido por el código y guardá.
4. Antes de publicar, decime en una frase qué vas a hacer. Después: Implementar → Nueva implementación → tipo "Aplicación web" → ejecutar como yo → acceso "Cualquier persona" → Implementar.
5. Google va a pedir autorización y abre una ventana aparte que vos no podés manejar. FRENÁ y decime exactamente qué voy a ver y qué tengo que tocar: "Google no verificó esta aplicación" → Avanzado → Ir a (nombre del proyecto) → leer el permiso (tiene que decir que sólo accede a esta hoja, no a todos mis archivos; si dice otra cosa, avisame y no aceptes) → Permitir. Esperá a que te diga "listo".
6. Copiá la dirección de la aplicación web (termina en /exec) y guardala en .env.local como URL=, sin mostrarla en el chat.

D. Probá la puerta con curl (curl.exe en Windows, con --http1.1; si Google devuelve un error pasajero, reintentá):
1. Con un token incorrecto: tiene que responder ok:false.
2. Con el token correcto y accion=leer: tiene que responder ok:true con 0 filas.

E. Cerrá las pestañas que abriste.

SI TE FALTA ALGO, GUIAME
Si no podés usar el navegador, no encontrás la extensión, no la ves conectada o algo no está activado, NO sigas ni busques atajos: frená y guiame paso a paso, en palabras simples, hasta dejarlo funcionando, y esperá a que te diga que ya está. Revisá estas causas, en este orden:
1. La extensión "Claude" (Claude in Chrome) no está instalada o está desactivada en chrome://extensions (hace falta la versión 1.0.36 o posterior).
2. Chrome está cerrado.
3. La extensión no está conectada a mi cuenta de Claude (tiene que ser la misma cuenta de pago que usa esta app, no una clave de API).
4. Falta el permiso para los sitios docs.google.com y script.google.com.
5. Se perdió la conexión: reconectar la extensión o reiniciar Chrome.
6. Si nada de eso alcanza, usá el panel Navegador de la app (Cmd+Shift+B en Mac, Ctrl+Shift+B en Windows), donde me vas a tener que dejar iniciar sesión en Google a mí.
También avisame si no veo el menú Extensiones → Apps Script (por ejemplo, en una cuenta de trabajo con eso bloqueado) o si falta cualquier otro permiso de Google, y decime cómo resolverlo.

REGLAS PARA VOS
- Tocá sólo mi hoja y su proyecto de Apps Script. No abras ni modifiques ninguna otra hoja ni archivo de mi Drive, ni los ajustes de mi cuenta de Google.
- No hagas nada que no esté en estos pasos. No sigas con la tarea 3.
- El token y la dirección no se imprimen en el chat (dentro del editor se van a ver, y está bien).

FINAL DE LA TAREA 2 (verificá cada punto y mostrámelo con ✓ o ✗)
✓ El Apps Script de mi hoja contiene el código, publicado como aplicación web (ejecutar como yo, acceso cualquier persona) y autorizado por mí.
✓ .env.local tiene HOJA, URL y TOKEN completos.
✓ La prueba con token incorrecto dio ok:false.
✓ La prueba con el token correcto dio ok:true y 0 filas.
✓ apps-script/Code.gs es una copia del código publicado.
✓ Cerraste las pestañas que abriste.
Cuando todo esté en ✓ escribí "TAREA 2 LISTA" y esperá. Si algún punto no pudo cumplirse, decime cuál y por qué.
```

## Tarea 3 · Cargar los gastos
**Antes:** poné tu CSV en `datos/` (si no, el prompt te lo pide).
```
TAREA 3 DE 6 · CARGAR MIS GASTOS

CONTEXTO
Tareas 1 y 2 hechas: tengo el agente carga-gastos y la puerta a mi hoja funcionando. Ahora quiero cargar mis gastos de verdad. Usá el agente carga-gastos (si no lo podés invocar, hacé su trabajo siguiendo su archivo). Hacé todo en esta misma tarea, de punta a punta. Explicame en palabras simples lo que vas haciendo.

PASOS
0. EL CSV. Mirá si hay algún .csv en datos/. Si NO hay ninguno, pedime que te pase la ruta o que lo deje en datos/, y esperá: no sigas sin CSV. Si hay más de uno, preguntame cuáles cargar.

1. ENTENDÉ BIEN EL CSV ANTES DE MANDARLO. Fijate bien en cada campo, para que queden guardados correctamente en la hoja. Revisá y contame (sin imprimir filas completas: sólo el encabezado y cantidades):
- el separador (coma o punto y coma) y la codificación (que los acentos se lean bien);
- qué columna es la fecha y en qué formato está: día/mes/año o mes/día/año (buscá fechas con un número mayor a 12 en la primera posición para saberlo) o AAAA-MM-DD;
- cómo viene el monto: una sola columna o débito y crédito separados; el separador de decimales y el de miles; la moneda;
- si los gastos vienen en positivo o negativo. Yo quiero los gastos como números positivos y los reembolsos o ingresos como negativos: si mi CSV viene al revés, decímelo y ajustalo;
- cuál es la columna del comercio o descripción y qué otras columnas hay;
- qué filas no son movimientos (totales, saldos, encabezados repetidos, filas vacías) y qué hacés con ellas.
Si algún campo es ambiguo, preguntame antes de cargar. Si el código del Apps Script no entiende bien algún campo de mi CSV (fechas, montos, signos), ajustalo con el navegador, publicá una versión nueva en la misma dirección (Implementar → Administrar implementaciones → editar → Versión nueva), actualizá apps-script/Code.gs y avisame qué cambiaste.

2. CARGÁ. Mandá el CSV ENTERO, tal cual, con curl, a la acción cargar (reintentá hasta 3 veces si la respuesta no es un JSON con "ok":true). Nunca copies ni reescribas los montos.

3. VERIFICÁ QUE QUEDÓ BIEN GUARDADO:
- Con la acción leer: cuántas filas tiene la hoja, el total y la ultima_fecha. Que no haya filas en no_numericos (si hay, decime cuáles y por qué).
- Recalculá por tu cuenta, con código (python3, node o PowerShell), el total y la cantidad de filas del CSV con la MISMA interpretación de campos, y compará con lo que dice la hoja (tolerancia de medio centavo). Tienen que coincidir.
- Abrí la hoja con el navegador y miralo con tus ojos: fechas como fechas (no como texto), montos como números con signo correcto, comercios legibles, ninguna columna corrida.

4. REPETÍ LA CARGA. Mandá el mismo archivo otra vez: tiene que dar 0 filas nuevas. Si hubo algún reintento, aclaramelo.

5. CATEGORÍAS. Mirá la lista de sin_categoria. Para cada comercio, mirando sólo el nombre (nunca los montos), asigná una categoría simple. Usá pocas categorías, por ejemplo: [Comida, Transporte, Software, Publicidad, Servicios, Impuestos, Hogar, Salud, Ocio, Otros] (ajustá la lista a lo que te parezca más claro para mis comercios). Escribilas con la acción categorias. Las que tengas dudas, no las inventes: dejalas aparte y preguntame al final. Verificá con leer que sólo quedan sin categoría las que me preguntaste.

6. INFORME. Contame en pocas líneas: cómo interpretaste cada campo del CSV, filas recibidas, nuevas y repetidas, filas en la hoja, total, rango de fechas, las categorías que usaste y qué filas te parecieron raras (montos fuera de lo normal, duplicados reales, reembolsos). No corrijas nada de lo raro: sólo señalalo.

SI ALGO FALLA O FALTA
Si el navegador no está disponible, la puerta no responde o falta cualquier permiso, frená y guiame en palabras simples. Si Google devuelve un error pasajero, reintentá antes de avisarme.

REGLAS
Los números salen de mi CSV y de las fórmulas de la hoja, nunca de tu cabeza. No modifiques ni borres mi CSV. No imprimas el token ni la dirección. No sigas con la tarea 4.

FINAL DE LA TAREA 3 (verificá cada punto y mostrámelo con ✓ o ✗)
✓ Tenía el CSV (o me lo pediste y lo recibiste) y me contaste cómo interpretaste cada campo.
✓ La hoja tiene las filas del CSV: cantidad y total coinciden con tu recálculo por código.
✓ No hay filas en no_numericos, o me explicaste cada una.
✓ Repetir la carga dio 0 filas nuevas.
✓ Los comercios tienen categoría, salvo los que me preguntaste.
✓ Miraste la hoja con el navegador: fechas y montos bien guardados.
✓ Me diste el informe.
Cuando todo esté en ✓ escribí "TAREA 3 LISTA" y esperá. Si algún punto no pudo cumplirse, decime cuál y por qué.
```

## Tarea 4 · Resumen con 3 gráficos y selectores
**Antes:** las 3 imágenes de referencia están en `prompts/references/` (`bloque-1-total-por-mes.png`, `bloque-2-por-categoria.png`, `bloque-3-torta-del-mes.png`) y el prompt le pide a Claude que las mire ahí. Si corrés el prompt en otra carpeta, adjuntalas.
```
TAREA 4 DE 6 · RESUMEN CON TRES GRÁFICOS Y SELECTORES

CONTEXTO
Tareas 1 a 3 hechas: mis gastos están en la hoja, con categorías. Ahora quiero verlos en gráficos. Mirá las tres imágenes de referencia de cómo los quiero, en prompts/references/ (si no las encontrás, avisame y te las adjunto): arriba un selector (una lista desplegable), abajo una mini tabla con los números y, al costado, el gráfico. Hacelo vos, con el navegador (browser use, Claude in Chrome). Explicame en palabras simples.

LO QUE QUIERO
En mi hoja, una pestaña "Resumen" con TRES bloques, uno debajo del otro. Cada bloque tiene: un título, uno o más selectores (celdas con lista desplegable), una mini tabla con los números a la izquierda (columnas A y B) y un gráfico al lado de la tabla (a la derecha). Cuando cambio el selector, la mini tabla y el gráfico se actualizan solos. Todo con fórmulas de la hoja (por ejemplo QUERY o SUMIFS): nada escrito a mano.

BLOQUE 1 · TOTAL POR MES (prompts/references/bloque-1-total-por-mes.png)
- Selector: Año. La lista tiene los años que hay en mis datos y arranca en el último.
- Mini tabla: encabezado "Año-Mes" y "Total"; una fila por cada mes del año elegido (AAAA-MM, ordenado de enero a diciembre) con la suma de lo gastado ese mes.
- Gráfico de columnas con esa tabla.

BLOQUE 2 · GASTO DE UNA CATEGORÍA (prompts/references/bloque-2-por-categoria.png)
- Selector: Categoría. La lista tiene todas las categorías y arranca en la que más gasté.
- Mini tabla: "Año-Mes" y "Total"; una fila por cada mes (de todos los años) con la suma de esa categoría.
- Gráfico de columnas.

BLOQUE 3 · DETALLE DE UN MES (prompts/references/bloque-3-torta-del-mes.png)
- Selectores: Año y Mes (del 1 al 12). Arrancan en el año y el mes de la última fecha cargada.
- Mini tabla: "Categoría" y "Total"; el gasto de cada categoría en ese año y mes, de mayor a menor.
- Gráfico de torta con los porcentajes visibles.

Arriba de todo, un "Total general" (la suma de todos los gastos).

ASPECTO: prolijo y consistente. Encabezados de las mini tablas con color, números con dos decimales y separador de miles, los mismos colores (tonos de azul) en los tres gráficos, títulos claros, sin leyenda en los gráficos de columnas, ningún elemento superpuesto, y cada gráfico pegado a su tabla. Las listas de los selectores pueden salir de una pestaña auxiliar oculta.

CÓMO HACERLO
1. Con el navegador, abrí el Apps Script de mi hoja y agregá (o actualizá) la acción resumen (POST, sin cuerpo) que arma esa pestaña. Usá las columnas ano, mes y ano_mes que ya tiene "Movimientos" (si faltan, agregalas calculadas en el código a partir de la fecha y completá las filas ya cargadas). Si ejecuto la acción de nuevo, tiene que rehacer la pestaña SIN duplicar gráficos y conservando lo que yo haya elegido en los selectores.
2. Publicá una versión nueva en la MISMA dirección (Implementar → Administrar implementaciones → editar → Versión nueva). Si pide autorización de nuevo, frená y guiame como en la tarea 2. Actualizá apps-script/Code.gs.
3. Editá el archivo del agente carga-gastos para sumarle esta habilidad: armar el resumen (POST a la dirección con &accion=resumen, sin cuerpo) cuando se lo pida o después de cargar. Mostrame qué cambió en el archivo.
4. Ejecutá la acción con el agente.
5. Verificalo con el navegador, mirando la hoja: en cada bloque, cambiá el selector a otro valor, comprobá que la tabla y el gráfico cambian, y volvé al valor original. Sacá una captura de cada bloque.
6. Verificá los números con la acción leer: el total general coincide con el total; en el bloque 1, la suma de la tabla de un año coincide con la suma de por_mes de ese año; en el bloque 3, la suma de la tabla coincide con por_mes de ese mes; la categoría con más gasto es la del bloque 2.

SI ALGO FALLA O FALTA
Si el navegador no está disponible o falta un permiso, frená y guiame (extensión Claude in Chrome instalada y activa, Chrome abierto, misma cuenta, permisos para docs.google.com y script.google.com). Si una fórmula o un gráfico no se comporta como pedí, arreglalo y contame qué pasó; si hay una limitación de Google Sheets, proponeme la alternativa más simple y explicame por qué.

REGLAS
No cambies ni borres montos, fechas ni categorías. Tocá sólo la pestaña Resumen, una pestaña auxiliar oculta y el Apps Script. No imprimas el token ni la dirección. No sigas con la tarea 5.

FINAL DE LA TAREA 4 (verificá cada punto y mostrámelo con ✓ o ✗)
✓ Existe "Resumen" con el Total general y los tres bloques (título, selectores, mini tabla y gráfico al lado).
✓ Los selectores tienen listas desplegables: Año (bloque 1), Categoría (bloque 2) y Año y Mes (bloque 3), con valores iniciales sensatos.
✓ Cambiar cada selector actualiza la tabla y el gráfico (lo probaste con el navegador y volviste al valor original).
✓ Los números cierran con la acción leer (total general, suma del año, suma del mes).
✓ Volver a ejecutar el resumen no duplica gráficos y conserva las selecciones.
✓ El archivo del agente tiene la habilidad nueva y apps-script/Code.gs está actualizado.
✓ Me mostraste una captura de cada bloque.
Cuando todo esté en ✓ escribí "TAREA 4 LISTA" y esperá. Si algún punto no pudo cumplirse, decime cuál y por qué.
```

## Tarea 5 · Un segundo agente que revisa y pule (con el navegador)
**Antes:** tené un CSV cargado (tarea 3) y el resumen armado (tarea 4).
```
TAREA 5 DE 6 · UN SEGUNDO AGENTE QUE REVISA Y PULE (revisor-de-gastos)

CONTEXTO
Tareas 1 a 4 hechas: tengo cargados mis gastos, el resumen y los tres gráficos. Ahora quiero un segundo agente que controle el trabajo del primero: primero revisa los números y después, con el navegador (browser use, Claude in Chrome, en mi Chrome), revisa cómo se ve todo y lo deja prolijo: cambia categorías, arregla formatos, colores y detalles. Explicame todo en palabras simples.

LO QUE QUIERO QUE HAGAS
1. Creá el agente revisor-de-gastos: un archivo .md en .claude/agents/, modelo sonnet, con las herramientas Read, Glob, Grep y Bash y también las del navegador (Claude in Chrome). Si limitar las herramientas le quita el navegador, dejalo heredar todas. Las instrucciones tienen que decir:

"EN FRÍO": no sabe cómo se cargó nada. No lee el archivo de carga-gastos ni el historial de otras conversaciones: sólo mira mis CSV de datos/ y mi hoja.

FASE 1 · NÚMEROS (sólo lectura, siempre con código, nunca de cabeza)
- Recalcula por su cuenta, con código (python3, node o PowerShell), desde mis CSV: cantidad de filas, total, total por mes (AAAA-MM) y total por categoría, usando el mapa comercio → categoría que devuelve la hoja.
- Lee la hoja con un GET a la dirección de .env.local con ?token=$TOKEN&accion=leer. Sólo hace GET: no escribe, no corrige, no llama a otras acciones.
- Compara cifra por cifra (tolerancia de medio centavo) y devuelve: PASA o NO PASA, una tabla con cada cifra (CSV vs hoja) y una lista de hallazgos: números que no coinciden, filas que faltan o sobran, montos no numéricos y comercios sin categoría.
- Si da NO PASA, lo reporta con la cifra exacta y SE FRENA: los números no se arreglan a mano en la hoja, se investiga cómo se cargaron. No hace la fase 2.

FASE 2 · REVISIÓN VISUAL Y LIMPIEZA (con el navegador; sólo si la fase 1 dio PASA)
Abre mi hoja (el link está en HOJA de .env.local) en mi Chrome y revisa pestaña por pestaña:
- Movimientos: fechas con formato de fecha, montos con dos decimales y separador de miles, encabezados en negrita, primera fila fija, columnas con ancho legible y nada cortado, las filas "(sin categoría)" resaltadas.
- Categorías: asigna categoría a los comercios que quedaron sin categoría (mirando sólo el nombre), unifica categorías duplicadas o con errores de escritura (Comida / comida / Comidas) y revisa que cada comercio tenga una sola. Los cambios de categoría los hace en la pestaña Categorías, nunca en Movimientos. Si un comercio es ambiguo, me pregunta.
- Resumen: prueba cada selector (cambia el valor, comprueba que la mini tabla y el gráfico se actualizan, vuelve al valor original), títulos claros, los mismos colores en los tres gráficos y en los encabezados de las mini tablas, nada superpuesto, cada gráfico al lado de su tabla.
- PUEDE CAMBIAR SÓLO: categorías (en la pestaña Categorías), formatos (fecha, número, negrita, alineación), colores, anchos de columna, filas fijas, títulos y posición de los gráficos.
- NO PUEDE TOCAR: montos, fechas, comercios, la columna clave, fórmulas, el Apps Script, otras pestañas, otras hojas ni archivos, y no borra filas. Si cree que hay que cambiar algo de eso, lo reporta y me pregunta.
- Después de cada grupo de cambios saca una captura y verifica que quedó bien. Al final vuelve a correr la fase 1: tiene que seguir dando PASA (el pulido no puede haber roto nada).
- Si el navegador no está disponible, no hace atajos: me guía paso a paso para activarlo (extensión Claude in Chrome instalada y activa, Chrome abierto, misma cuenta, permisos para docs.google.com).

Reglas: no imprime el token ni la dirección; no muestra filas completas de mis CSV, sólo cifras; deja un registro de cada cambio de la fase 2 (qué, dónde, antes y después).

2. Cuando esté creado, mostrame el archivo y explicame en una frase por qué se llama "revisor" y no "corrector".

3. Ejecutalo ahora sobre datos/[NOMBRE-DEL-ARCHIVO].csv y mostrame el resultado de cada fase y el registro de cambios. Si el subagente no puede usar el navegador, decímelo y hacé la fase 2 en esta conversación siguiendo el mismo checklist.

4. PRUEBA DEL NO PASA. Cuando termines lo anterior, pedime que cambie un monto a mano en la pestaña Movimientos (por ejemplo, sumarle 20 a una celda) y que te avise. Esperá mi aviso. Cuando te avise, corré sólo la fase 1 otra vez: tiene que decir NO PASA y señalar qué cifra no coincide (total, mes y categoría afectados). Después decime que vuelva a poner el valor original, esperá mi aviso y corré la fase 1 de nuevo: tiene que dar PASA.

REGLAS PARA VOS EN ESTA TAREA
No cambies nada de la hoja vos mismo fuera de lo que hace el revisor en su fase 2. No imprimas el token ni la dirección. No sigas con la tarea 6.

FINAL DE LA TAREA 5 (verificá cada punto y mostrámelo con ✓ o ✗)
✓ Existe revisor-de-gastos.md con las dos fases, las reglas y el navegador entre sus herramientas.
✓ La fase 1 dio PASA sobre mi CSV, con la tabla CSV vs hoja.
✓ La fase 2 se hizo con el navegador y me diste el registro de cambios (qué, dónde, antes y después).
✓ Después del pulido la fase 1 sigue dando PASA.
✓ La prueba: con el monto cambiado dio NO PASA y señaló la cifra; con el valor original volvió a dar PASA.
Cuando todo esté en ✓ escribí "TAREA 5 LISTA" y esperá. Si algún punto no pudo cumplirse, decime cuál y por qué.
```

## Tarea 6 · Ahora te toca a vos: qué automatizar
```
TAREA 6 DE 6 · AHORA TE TOCA A VOS: QUÉ AUTOMATIZAR

CONTEXTO
El sistema ya carga mis gastos, los grafica y los revisa. No lo vamos a automatizar en este video: quiero una tabla para decidir QUÉ conviene automatizar después, con cinco preguntas de sí o no.

LO QUE QUIERO
Armame una tabla (en el chat, lista para mostrar en pantalla) con estas cinco preguntas como columnas: ¿Es repetitivo? ¿Es mecánico? ¿Tiene un output claro? ¿Es independiente de mi criterio? ¿Es fácil ver si sale mal? Aplicala a estos candidatos de mi sistema de gastos: 1) cargar solo un CSV nuevo que dejo en una carpeta, 2) el cierre de mes con un reporte, 3) un aviso si pasan días sin cargar nada, 4) categorizar comercios nuevos, 5) [UN CANDIDATO TUYO]. Al final clasificá cada candidato en Automático, Semi automático o Manual, con una línea de por qué.
Aclarame dos cosas debajo de la tabla: que los tildes sólo dicen por dónde empezar y que la categoría final protege mi criterio (no gana el que tiene más tildes). Y sumá una regla: automatizar algo que no tiene un disparador claro (data nueva, una fecha) no tiene sentido.

FINAL DE LA TAREA 6 (✓ o ✗)
✓ La tabla tiene las cinco preguntas, los cinco candidatos y la clasificación final con su motivo.
✓ Están las dos aclaraciones y la regla del disparador.
Cuando todo esté en ✓ escribí "TAREA 6 LISTA".
```

---

## Notas y límites conocidos
- **Código de respaldo:** `apps-script/Code.gs` y `apps-script/Resumen.gs` cumplen el contrato de las tareas 2 y 4. Si Claude no logra armar el Apps Script por el navegador, pegá los dos archivos en tu proyecto de Apps Script (dos archivos en el mismo proyecto).
- **El token vive en dos lugares:** en `.env.local` (`TOKEN=`) y en las **Propiedades del script** de tu proyecto de Apps Script (clave `TOKEN`, el mismo valor). El código lo compara contra esa propiedad: si falta, toda llamada responde `"error":"token"`.
- **La ventana de autorización de Google se abre aparte** y Claude no la puede manejar: la aprobás vos.
- **Google devuelve errores pasajeros** (404, una página de error o "acción desconocida" en la primera llamada tras un rato sin usar la puerta) aunque el script haya corrido: la carga puede haber entrado igual. Por eso el agente reintenta hasta 3 veces y siempre verifica con `leer`.
- **`ano_mes` se guarda como texto:** si no, Sheets lo convierte en fecha y los meses salen como números de serie.
- **Windows:** los prompts contemplan `curl.exe`, pero no se probó ahí.
- **Cuando termines de usar el sistema:** Implementar → Administrar implementaciones → archivar. La dirección de la puerta es pública y sólo la protege el token.

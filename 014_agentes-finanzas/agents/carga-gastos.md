---
name: carga-gastos
description: Carga los gastos de un CSV del banco (carpeta datos/) en la pestaña "Movimientos" de la hoja de Google, categoriza los comercios nuevos y arma la pestaña "Resumen" con sus tres gráficos. Usalo cuando haya un CSV nuevo para cargar, comercios sin categoría, o cuando haya que armar o actualizar el resumen.
model: sonnet
tools: Read, Glob, Grep, Bash
---

# TRABAJO

Cargar mis gastos en la pestaña "Movimientos" de mi hoja de Google, ponerles categoría a los comercios nuevos y armar la pestaña "Resumen" con sus tres gráficos.

# CÓMO TRABAJA

## La puerta a la hoja

- La hoja se maneja a través de una "puerta": una dirección web con contraseña que se crea en la tarea 2.
- Los datos de conexión viven en `.env.local`:
  - `HOJA`: el link de mi hoja.
  - `URL`: la dirección de la puerta.
  - `TOKEN`: la contraseña.
- Los lee sin mostrarlos nunca en pantalla: no abre `.env.local` con Read ni con `cat`. Los carga dentro del mismo comando de Bash con `set -a; . ./.env.local; set +a` y usa las variables `$URL` y `$TOKEN`.

## Antes de cargar un CSV

Se fija bien en los campos del archivo para que queden guardados correctamente:

- Separador y codificación.
- Qué columna es la fecha y en qué formato (día/mes/año o mes/día/año).
- Si el monto viene en una sola columna o separado en débito y crédito.
- Separadores de decimales y de miles.
- Si los gastos vienen en positivo o negativo.
- Cuál es la columna del comercio.
- Qué filas no son movimientos: totales, saldos, encabezados repetidos, filas vacías.

Los gastos tienen que quedar guardados como números **positivos** y los reembolsos como **negativos**.

Si algo es ambiguo, me pregunta antes de cargar.

## Cargar

Manda el CSV ENTERO, tal cual está, con curl (`curl.exe` si estoy en Windows):

```
curl -sL --http1.1 --data-binary @datos/ARCHIVO.csv -H "Content-Type: text/csv" "$URL?token=$TOKEN&accion=cargar"
```

Nunca copia, resume ni reescribe los montos: los números no pasan por su cabeza.

## Si la respuesta no es buena

Si la respuesta no es un JSON con `"ok":true` (a veces Google devuelve un error pasajero, una página de error o un mensaje raro, por ejemplo "acción desconocida" aunque la acción era válida), reintenta hasta 3 veces. Es seguro porque la hoja no duplica. Si sigue fallando, se frena y me muestra el mensaje.

## Confirmar

Después de cargar SIEMPRE confirma con la acción `leer` (un GET a la misma dirección con `&accion=leer`) cuántas filas tiene la hoja.

Si hubo un reintento, la primera carga pudo haber entrado igual y el reintento dice "0 nuevas": en ese caso me lo aclara en vez de decir que no cargó nada.

## Categorías

Mira sólo los nombres de los comercios sin categoría (nunca los montos), propone una categoría para cada uno y las manda con la acción `categorias` (el formato exacto se define en la tarea 2).

## Resumen

Arma (o rehace) la pestaña "Resumen" con la acción `resumen`: un POST a la misma dirección, sin cuerpo:

```
curl -sL --http1.1 -d '' "$URL?token=$TOKEN&accion=resumen"
```

- Lo hace cuando se lo pida y SIEMPRE después de cargar un CSV nuevo, para que las tablas y los gráficos cubran todos los meses cargados.
- Es seguro repetirlo: rehace la pestaña sin duplicar gráficos y conserva lo que elegí en los selectores. Si la respuesta no es un JSON con `"ok":true`, reintenta hasta 3 veces, igual que al cargar.
- La pestaña tiene arriba el "Total general" y tres bloques, cada uno con selector, mini tabla y gráfico: total por mes de un año, gasto de una categoría mes a mes, y detalle de un mes. Todo son fórmulas de la hoja: él no escribe ni calcula ningún número.
- Después confirma con `leer` que `total_en_resumen` es igual a `total`.

## Al terminar

Me cuenta:

- Filas recibidas, nuevas y repetidas.
- Cuántas filas tiene la hoja ahora.
- Si armó el resumen: cuántos gráficos hay (tienen que ser 3) y qué quedó elegido en los selectores.
- Qué le pareció raro.

# REGLAS

1. Los números salen de mis CSV y de las fórmulas de la hoja. Nunca suma ni calcula de cabeza.
2. Sólo lee `datos/`. Sólo escribe en mi hoja, a través de la puerta. No modifica ni borra mis CSV.
3. Si una fila parece un error (monto raro, duplicado, sin categoría, monto vacío), la carga igual y me la señala. No la corrige.
4. El token y la dirección no van dentro de este archivo ni se imprimen. No muestra filas completas de mis CSV en pantalla: sólo el encabezado y cantidades.

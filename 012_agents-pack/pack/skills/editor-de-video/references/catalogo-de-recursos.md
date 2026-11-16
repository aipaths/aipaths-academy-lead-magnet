# Catálogo de recursos

Un recurso es una pieza reutilizable: un título de capítulo, un recuadro de dato, una
transición, un efecto de sonido, una forma de empalmar. El catálogo es la lista de lo que
tu agente puede usar y **cuándo**. Sin catálogo, el agente inventa una pieza nueva cada vez y
ninguna se parece a otra.

## La ficha

Un archivo `recursos.json` (o una tabla) con una fila por recurso:

| Campo | Qué dice |
|---|---|
| `nombre` | Cómo se llama y cómo lo pedís |
| `capa` | corte, tapa, texto o sonido |
| `cuando_va` | La situación que lo pide («un número en medio de una explicación») |
| `cuando_no` | La situación donde sobra o molesta |
| `estado` | `candidato`, `probado`, `aprobado` o `descartado` |
| `usos` | En qué videos se usó, y qué se dijo de él |
| `notas` | Duración, nivel de sonido, tamaño mínimo, lo que haga falta |

```json
{
  "nombre": "dato-recuadro",
  "capa": "texto",
  "cuando_va": "un número en medio de una explicación",
  "cuando_no": "un dato suelto al abrir un tema (ahí va centrado, grande)",
  "estado": "aprobado",
  "usos": ["video-03: sin correcciones"],
  "notas": "entra con pop; ≥ 2 s en pantalla"
}
```

## Los cuatro estados

- **candidato:** se te ocurrió o lo viste en otro lado. No se usa en un video real.
- **probado:** lo hiciste una vez aparte, en una pieza de prueba. Todavía sin veredicto.
- **aprobado:** lo viste en un video real y quedó. Es lo que el agente usa por defecto.
- **descartado:** lo probaste y no. **Se queda en la lista con el motivo**: sin eso el agente
  lo vuelve a proponer.

Un recurso pasa de `candidato` a `aprobado` sólo después de usarse en un video entero y
revisarse. Que el agente diga que «quedó bien» no cuenta.

## Cómo se usa

1. Antes de armar el plan de piezas, el agente lee el catálogo y elige de ahí por `cuando_va`.
2. Si nada cubre el momento, propone un `candidato` y lo prueba aparte, de a uno.
3. Después de la revisión humana, actualizá `estado` y `usos`. Una corrección que cambia cuándo
   va un recurso se anota también en `registro-de-correcciones.md`.
4. Mantenelo corto: un recurso que nunca se usa en 10 videos, o se aprueba o se descarta.

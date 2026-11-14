# Registro de correcciones

La persona que revisa es el único lugar donde entra el criterio humano. Lo que dice se anota
**una vez** y se convierte en regla, para que no tenga que repetirlo. Sin registro, las
correcciones se pierden en el chat y se vuelve a corregir lo mismo.

## La fila

Una tabla (o `correcciones.json`), una fila por corrección:

| Campo | Qué dice |
|---|---|
| `video` y `segundo` | Dónde pasó, en el segundo exacto |
| `corrección` | Lo que dijo la persona, tal cual |
| `capa` | corte, tapa, texto o sonido |
| `regla` | La regla de esta skill o del catálogo que toca; si no existe, la regla nueva que se escribe |
| `se_repite` | Cuántas veces ya se corrigió algo equivalente |
| `medible` | sí / no: ¿se puede comprobar con un script sin mirar el video? |
| `estado` | `anotada`, `aplicada`, `chequeo` |

## El circuito

1. **Anotala en el momento,** con su segundo. Nunca «después la paso».
2. **Buscá la regla.** Si ya existe, la corrección es que el editor no la aplicó: se marca
   en qué otros bloques o videos aplica y se arreglan todos. Si no existe, se escribe en la capa
   que corresponde (`capa-1…`, `capa-2…`, `capa-3…`, `sonido.md`) o en el catálogo.
3. **Aplicala en todos los bloques parecidos** antes de la próxima entrega. Una corrección vale
   para todo el video, no sólo para el segundo donde se dijo.
4. **Si se repite dos veces y se puede medir, se vuelve un chequeo:** un script chico que
   falla si lo ve (por ejemplo: mirada hacia abajo más de 1,2 s sin una pieza encima; una pieza
   que arranca más de 0,3 s antes o después de su palabra; loudness fuera de −16 ± 1 LUFS). El
   chequeo corre antes del revisor, así la persona no vuelve a ver lo que una máquina atrapa.
5. **Lo que no se puede medir** (gusto, ritmo, tono) queda como regla escrita y como
   punto del revisor sin contexto.

## Qué mirar cada tanto

- Qué porcentaje de las correcciones de un video ya estaba dicho antes: si no baja, las reglas
  no están llegando al agente (o hay que pasarlas a chequeos).
- Qué reglas se rompen más: son las que primero hay que convertir en chequeo.
- Reglas que nadie aplica en 10 videos: sacarlas.

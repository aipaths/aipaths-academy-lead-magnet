# Que se caiga y se rompa (fractura + cuerpos rígidos)

Caso real: la taza con el logo cae 10 cm, se parte en 35 pedazos y se desparrama en
cámara lenta. Unos 8 minutos de armado más 4,5 minutos de render (96 cuadros EEVEE 1080p).

## 1. Trabajar en una copia

`save_as_mainfile` a un `.blend` nuevo: la escena del producto entero queda intacta.

## 2. Fijar el logo en UV antes de romper

Si el logo se mapea con coordenadas de objeto, al partir la malla cada pedazo tiene su
propio origen y el logo se desarma. Primero uní cuerpo y asa en **una sola malla evaluada**
(`obj.evaluated_get(dg).to_mesh()` + `transform(matrix_world)`). Después calculá, por cada
loop, una UV con la misma fórmula cilíndrica del producto. Mandá a `(-1,-1)` (fuera de la
imagen) las caras interiores, el fondo y el asa. El material usa esa UV.

## 3. Fractura Voronoi propia

Blender no trae el addon Cell Fracture activado, y no hace falta:
`scripts/fractura_voronoi.py` parte la malla en menos de 1 s.
- ~28 semillas al azar, con más densidad abajo (donde pega).
- Cada celda: `bmesh.ops.bisect_plane(clear_outer=True)` contra el plano mediador con cada
  otra semilla, y después `triangle_fill` de los bordes cortados (rellena bien los anillos
  de una pared hueca). Las caras nuevas van con un segundo material de "cerámica cruda" mate.
- Separá las islas sueltas de cada celda y poné el origen de cada pedazo en su centroide
  (el cuerpo rígido usa el origen como centro de masa).
- Revisalo con una vista "explotada" (pedazos alejados del centro un 60 %) antes de simular.

## 4. Caída animada y soltar a la física

- Los pedazos arrancan **cinemáticos** (`rigid_body.kinematic=True`), con la taza entera
  animada bajando de 10 cm a 1,2 cm de la mesa, con curva QUAD ease-in para que acelere.
- En el cuadro de impacto pasan a `kinematic=False` (clave CONSTANT) y toma la simulación.
- Mesa y pared: PASSIVE, forma MESH.

## 5. Ajustes que hicieron la diferencia

| Intento | Resultado |
|---|---|
| CONVEX_HULL sin más | Estalla: los cascos convexos de pedazos vecinos se superponen y salen volando ~0,5 m |
| MESH (forma exacta) | Peor: se atraviesan y algunos terminan a 7 m |
| **CONVEX_HULL + `rigidbody_world.use_split_impulse = True`** | Realista: mediana de 9 cm. Split impulse separa superposiciones sin agregar velocidad |

Además: `substeps_per_frame` 60, `solver_iterations` 30, `time_scale` 0,35 (cámara lenta),
margen 0,0003, fricción 0,6, rebote 0,1, `use_deactivation=False`.

## 6. Cámara y render

- Encuadre más abierto que para la foto (50 mm, más lejos): la taza tiene que entrar en el
  cuadro 1 y los pedazos se desparraman. Hacé la mesa más grande para que no caigan del borde.
- Medí la dispersión por código (distancia de cada pedazo al centro) antes de renderizar.
- Render: hornear con `bpy.ops.ptcache.bake_all(bake=True)` en el proceso de fondo y
  después la animación con EEVEE. Cycles para 96 cuadros es demasiado lento para una prueba.

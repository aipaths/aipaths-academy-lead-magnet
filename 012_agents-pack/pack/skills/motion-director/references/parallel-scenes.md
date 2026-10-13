# Escenas en paralelo

Para videos de más de ~4 escenas. Un orquestador reparte, N constructores trabajan a la
vez, un integrador junta. Funciona en cualquier harness con subagentes; sin subagentes, el
mismo orden en serie sigue sirviendo.

## Antes de repartir (lo hace el orquestador)
1. Rulebook escrito y guardado (ver `rulebook.md`).
2. Lista de escenas con: id, inicio–fin en segundos, contenido, reglas que aplican,
   y el archivo que le toca a cada una (ej. `compositions/escena-07.html`).
3. Lo compartido resuelto **una vez**: paleta, tipografías, componentes comunes,
   tiempos de audio por palabra. Los constructores lo leen, no lo redefinen.

## Encargo a cada constructor
Cada uno recibe solo lo suyo:
- su escena (id, tiempos, contenido) y el rulebook completo;
- la ruta del único archivo que puede escribir;
- qué tiene que entregar: la escena funcionando sola + una captura de su frame clave.

Regla dura: **un constructor no toca archivos de otra escena ni el archivo raíz.**

## Integración (un solo agente)
1. Montar las escenas en el archivo raíz en orden y con sus tiempos.
2. Transiciones entre escenas: las decide el integrador, no los constructores.
3. Correr los chequeos del motor (lint, layout, contraste).
4. Hoja de contactos de todo el video (ver `SKILL.md`).
5. Las fallas vuelven al constructor de esa escena, o las corrige el integrador si son
   menores. Nunca se re-genera todo por una escena mala.

## Tamaño del lote
- Más constructores ≠ mejor. Entre 4 y 8 a la vez es manejable para revisar.
- Si el video tiene 15+ escenas, agrupalas por sección (verso, estribillo) y repartí por
  sección.

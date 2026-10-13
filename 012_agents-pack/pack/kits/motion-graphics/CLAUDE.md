
## Motion graphics — cómo trabajamos en este proyecto

Este proyecto es un video hecho con código (HyperFrames). Antes de escribir una
composición, cargá la skill `motion-director` y seguí su flujo. Las skills de HyperFrames
son para la sintaxis, el render y los chequeos; `motion-director` decide qué se hace y en
qué orden.

### Antes de animar
- Leé `BRIEF.md`. Si falta el mensaje, la duración o el aspecto, preguntá; no inventes.
- Si es el primer video del proyecto, que dure 15–30 s aunque el brief pida más.
- Escribí las reglas visuales (rulebook de `motion-director`) y mostrámelas. No animes
  hasta que las apruebe.
- Llená `STORYBOARD.md`: una escena por bloque, con inicio, fin y la regla que aplica.

### Mientras construís
- Primero el layout estático de cada escena, después el movimiento.
- Más de 4 escenas: un subagente por escena, cada uno escribe solo su archivo en
  `compositions/`. Nadie más que el integrador toca `index.html`.
- Todo frame es función del tiempo: nada de `Math.random()` sin semilla.

### Antes de decir "listo"
1. `npm run check` sin errores.
2. Hoja de contactos: un frame por escena en una grilla, revisada contra el rulebook.
   Mostrámela. Cada falla, como `mm:ss — regla — escena`.
3. Corregí solo las escenas con fallas y repetí el chequeo.
4. Recién ahí, `npm run render`.

Decime siempre qué fue gratis y qué usó algo pago (APIs de voz, imagen o video).

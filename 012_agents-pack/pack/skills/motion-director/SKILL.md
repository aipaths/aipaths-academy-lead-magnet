---
name: motion-director
description: Dirigir un motion graphics hecho con código: rulebook, escenas en paralelo, QA por hoja de contactos. Disparar con "armá un motion", "intro animada".
---

# Motion director

El modelo escribe el código; vos (o el agente que orquesta) **dirigís**. La mayoría del
motion hecho con IA se ve igual —texto centrado, gradientes, nada se mueve con intención—
porque nadie lo dirige. Esta skill es la dirección: reglas antes de animar, escenas
repartidas, y una revisión visual que decide qué está bien y qué es "mid".

No reemplaza al motor. El motor (HyperFrames u otro de código→video) tiene sus propias
skills para sintaxis, render y lint: cargalas para eso. Esta skill dice **qué** hacer y
**en qué orden**, no cómo se escribe una composición.

## Cómo funciona el render (para no prometer de más)
El modelo no genera video: escribe una página que sabe cómo se ve cada instante. Un
navegador headless saca una captura por frame y FFmpeg las une. Un tema de 2:45 a 30 fps
son 4.950 capturas. Consecuencia: **todo es editable** (colores, tiempos, textos) y el
costo extra es cero si no usás modelos pagos de imagen, video o voz.

## Flujo
1. **Brief corto.** Mensaje en una frase, duración, aspecto, audiencia, ¿hay audio?
   Primera vez con un proyecto: **15–30 s**, no el tema entero. Lo largo viene después de
   ver que el estilo funciona.
2. **Reglas antes de animar.** Escribí el rulebook del proyecto (plantilla en
   `references/rulebook.md`) y guardalo junto al brief. Sin reglas escritas, cada escena
   inventa su estética y el resultado es genérico.
3. **Partir en escenas.** Una escena = un bloque con principio y fin claros (un verso, un
   beat, una idea). Anotá para cada una: tiempo de inicio/fin, qué se ve, qué regla del
   rulebook la gobierna.
4. **Construir en paralelo** cuando hay más de ~4 escenas. Ver `references/parallel-scenes.md`.
5. **Integrar.** Un solo agente junta las escenas, ajusta transiciones y sincroniza con el
   audio. Nadie más toca el archivo raíz.
6. **QA por hoja de contactos** (abajo). Corregir, re-chequear, recién ahí render final.

## Hoja de contactos (la revisión que importa)
El lint y los chequeos automáticos encuentran errores técnicos, no escenas aburridas.
Para eso:

1. Capturá **un frame representativo por plano** (o cada N segundos si no hay planos
   definidos). Si el motor tiene snapshots, usalos.
2. Ponelos **todos en una sola página**, en grilla, con el timestamp debajo.
3. Revisá la grilla contra el rulebook, no contra el gusto: ¿hay dos planos seguidos con
   la misma composición? ¿algo viola la paleta? ¿texto ilegible? ¿todo centrado?
4. Anotá cada falla con timestamp y regla violada. Corregí solo esas escenas.

Lo que **no** cuenta como QA: decir "lo revisé" sin la grilla, o tomar que el render
terminó como prueba de que el video está bien.

## Personajes
- **$0:** el personaje se dibuja en código (mascota geométrica, wordmark animado,
  partículas). Puede bailar al beat y "cantar" con la boca sincronizada a los tiempos de
  palabra, sin modelo de lip-sync.
- **Mixto:** una hoja de personaje (frente, perfil, espalda, expresiones) hecha con un
  modelo de imagen, usada como **materia prima** que el código transforma (partículas,
  caracteres, máscaras), no como video. Barato y se ve menos "avatar IA" que el lip-sync.
- Lip-sync con modelo de video: probalo último. Suele verse como cualquier avatar.

## Audio
Si el video lleva música o canción, ver `references/music-pipeline.md` (generar en local,
elegir toma por claridad, tiempos por palabra).

## Costos y modelo
- Usá el modelo más capaz disponible para construir escenas; el ahorro en modelo se paga
  en estética.
- Decí siempre qué fue gratis y qué pagado (créditos de imagen, APIs). "$0" significa $0
  **además** de la suscripción al modelo.
- Medí el uso en el primer clip corto antes de escalar.

## Errores comunes
- Animar sin rulebook y "arreglar la estética al final".
- Un solo agente escribiendo 15 escenas en serie: lento y se pierde coherencia igual.
- Varios agentes editando el archivo raíz a la vez.
- Creer los "un prompt, 12 horas, sin tocar nada" de redes: los prompts reales suelen ser
  largos y detallados. Un brief bueno es parte del trabajo, no un atajo que se salta.
- Copiar la paleta de otro creador. Copiá el mecanismo (reglas duras), no la estética.

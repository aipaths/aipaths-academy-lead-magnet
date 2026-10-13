# Motion graphics con código

El kit del video: la skill que dirige, el paso a paso, y el proyecto real de la intro
que viste, para que lo abras, lo rompas y lo hagas tuyo.

Ningún editor de video: el agente escribe una página HTML que sabe cómo se ve cada
instante, un navegador headless saca una captura por frame y FFmpeg las une. Todo queda
editable: colores, tiempos, textos.

## Qué hay acá

| Archivo | Para qué |
|---|---|
| `LEEME.md` | este paso a paso |
| `CLAUDE.md` | las instrucciones para tu agente: lo sumás al `CLAUDE.md` de tu proyecto |
| `plantillas/BRIEF.md` | el brief que llenás antes de pedir nada |
| `plantillas/STORYBOARD.md` | la lista de escenas con tiempos |
| `ejemplo-intro-aipaths/` | el proyecto completo de la intro de 20 s del video |
| `../../skills/motion-director/` | la skill que dirige todo el proceso |

## Lo que necesitás

- Claude Code (o cualquier agente de código que lea skills)
- Node 22.18 o más nuevo, y FFmpeg instalado
- Costo extra: **$0**. Solo pagás tu suscripción al modelo. La única parte paga del
  ejemplo es la voz en off (OpenAI TTS, centavos), y ya viene generada.

## Paso 1 — Instalar el motor y la skill

[HyperFrames](https://github.com/heygen-com/hyperframes) es el motor: convierte HTML en
video. Sus skills le enseñan a tu agente la sintaxis, el render y los chequeos.

```bash
npx skills add heygen-com/hyperframes --all
```

`motion-director` es la dirección: qué hacer y en qué orden. Desde la raíz del pack:

```bash
ln -s "$PWD/skills/motion-director" ~/.claude/skills/motion-director
```

## Paso 2 — Correr el ejemplo

Antes de armar el tuyo, mirá uno que funciona:

```bash
cd kits/motion-graphics/ejemplo-intro-aipaths
npm run setup     # genera la música con código y trae los efectos de sonido
npm run dev       # preview en el navegador
npm run render    # el mp4 queda en renders/
```

Leé en este orden: `BRIEF.md` → `frame.md` (las reglas visuales) → `STORYBOARD.md` →
`index.html` → `compositions/`. La música es `scripts/synth-bed.ts`: 120 BPM, y cada corte
de escena cae en un beat.

## Paso 3 — Tu propio motion

```bash
npx hyperframes init mi-intro
cd mi-intro
cat ../kits/motion-graphics/CLAUDE.md >> CLAUDE.md
cp ../kits/motion-graphics/plantillas/*.md .
```

Ajustá las rutas a donde tengas el pack. Después llenás `BRIEF.md` y le pedís a tu agente
"armá el motion". El orden que sigue (y que vos tenés que exigir):

1. **Brief corto.** 15–30 segundos la primera vez, no el video entero.
2. **Reglas antes de animar.** Paleta, ritmo, tipografía, qué está prohibido. Sin reglas
   escritas, cada escena inventa su estética y el resultado es genérico.
3. **Escenas.** Cada una con inicio, fin y la regla que la gobierna.
4. **Construir en paralelo** si son más de 4: un agente por escena, uno solo integra.
5. **Chequeo automático:** `npm run check` (lint, layout, contraste).
6. **Hoja de contactos:** un frame por escena en una grilla, revisada contra las reglas.
   Cada falla se anota como `mm:ss — regla — escena` y se corrige solo esa escena.
7. **Render.**

El paso 6 es el que separa un motion dirigido de uno "hecho con IA". El render terminado
no prueba que el video esté bien.

## Lo que no viene en el kit

- **Los efectos de sonido.** Son de la librería de la skill `media-use` (Pixabay) y su
  licencia no deja redistribuir los archivos sueltos. `npm run setup` los copia desde tu
  instalación de las skills de HyperFrames.
- **La música.** No es un archivo: se genera con código en el `setup`, siempre igual.
- **Los renders.** Los generás vos.

La voz en off del ejemplo es sintética (OpenAI TTS, voz `marin`). Para regenerarla con
otra voz: `python3 scripts/generar-voz.py <voz>` con tu `OPENAI_API_KEY`.

## Licencia

MIT, como el resto del material original del pack. La marca AIPaths del ejemplo (nombre,
wordmark, paleta) es nuestra: usala para aprender, no la publiques como tuya.

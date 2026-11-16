# Editar videos con Claude Code

> 🎥 Viene del video **Cómo edito mis videos con Claude Code** *(próximamente)*.
> Más videos con su parte del pack: `../../README.md` → "¿Venís de un video?".

Una buena edición tiene muchas capas, y pedirle todas juntas a Claude Code no funciona. Este kit
es lo que prometo al final del video: **los prompts de cada capa, 30 efectos de sonido medidos,
música sin copyright y una skill de base con las cuatro capas** para que armes la edición
de a una.

## Qué hay

| Qué | Para qué |
|---|---|
| `prompts.md` | Los 8 prompts del video, en orden, cada uno con cuándo usarlo y qué tener antes |
| `efectos-de-sonido/` | Los 30 efectos (10 pops, 10 whooshes, 10 risers) en WAV, con la tabla de mediciones y el código que los generó |
| `musica/` | 3 pistas lo-fi de 80 s, sin voz, parejas de volumen, y cómo generar las tuyas |
| `../../skills/editor-de-video/` | La skill de base: las cuatro capas, el catálogo de recursos, el revisor sin contexto y el registro de correcciones |

Todo el kit pesa unos 14 MB, casi todo audio.

## Lo que necesitás

- **Claude Code** (o cualquier agente de código que lea skills).
- **ffmpeg**, para cortar, medir y mezclar.
- Opcional y gratis: **[HyperFrames](https://github.com/heygen-com/hyperframes)**, para las
  animaciones (`npx skills add heygen-com/hyperframes --all`; necesita Node 22.18 o más nuevo),
  y **[ACE-Step](https://github.com/ace-step/ACE-Step-1.5)**, si querés generar más música.

No necesitás un editor de video.

## Instalar la skill

La skill es una carpeta de este pack. Desde esta carpeta, la dejás donde Claude Code busca skills:

```bash
mkdir -p ~/.claude/skills
ln -s "$(cd ../../skills/editor-de-video && pwd)" ~/.claude/skills/editor-de-video
```

Con otro harness, la carpeta de skills es la que declare tu config (por ejemplo
`~/.agents/skills`). Sin instalarla, también podés pedirle a tu agente que lea
`skills/editor-de-video/SKILL.md` antes de empezar.

## El orden de uso

Las cuatro capas, de a una. Cada una se termina y se mira antes de pasar a la siguiente: una
capa de arriba no arregla una de abajo.

1. **Una toma limpia.** Prompt 1 de `prompts.md`: el video pasa a ser un texto con el segundo de
   cada palabra, y de ahí salen los cortes. Todo lo que viene después se engancha a una palabra
   de acá.
2. **La imagen.** Prompt 2: Claude propone dónde va una imagen, y recién cuando te gusta la
   lista, la consigue o la genera. Si se puede mostrar lo real, va lo real.
3. **El texto.** Prompt 3: dónde va texto y de qué tipo (overlay, al costado, subtítulos o frase
   al centro). Si en un tramo no propone nada, está bien.
4. **El sonido.** Prompts 4 y 5, con los efectos de `efectos-de-sonido/` y la música de
   `musica/`: el sonido acompaña lo que se mueve.
5. **Tu rol: dar feedback para que aprenda.** Prompts 6, 7 y 8: una página para dejar
   comentarios pegados al segundo, un registro con la regla de cada corrección (que a la
   segunda vez se vuelve un chequeo) y un revisor sin contexto que mira antes que vos.

Si es tu primer video, hacé el 1 y el 2 y mirá el resultado antes de seguir. Cuando una
corrección se repite, no la repitas: anotala (prompt 7).

## Licencia

- **Efectos de sonido y música:** CC0, dominio público. Sin atribución, para videos comerciales
  o no. Los detalles están en el `LEEME.md` de cada carpeta.
- **Prompts, skill y código del generador:** MIT, como el resto del pack (ver `../../LICENSE`).
- La música es generada con ACE-Step 1.5 (licencia MIT).

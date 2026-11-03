# Capítulos, descripción y tags desde el transcript

> Para usar con el transcript del video final (el que vas a subir, no el bruto): si cortaste algo
> después de transcribir, los tiempos ya no sirven. Reemplazá todo lo que está en `[MAYÚSCULAS]`.

**Sacar el transcript con tiempos** (whisper.cpp, local y gratis):

```bash
ffmpeg -i video-final.mp4 -ar 16000 -ac 1 audio.wav
whisper-cli -m models/ggml-small.bin -l es -osrt -f audio.wav   # deja audio.wav.srt
```

---

## Capítulos

```
Te paso el transcript con tiempos de un video de YouTube de [DURACIÓN] minutos.

Armá los capítulos:
- El primero empieza en 00:00.
- Entre 5 y 10 capítulos, cada uno de al menos 1 minuto.
- Cada capítulo empieza donde yo digo en voz alta que cambia la etapa o el tema
  (buscá frases como «ahora», «lo que sigue», «pasemos a»), no en la mitad de una idea.
- Títulos cortos (máximo 6 palabras), con las palabras que yo uso, no sinónimos.
- No inventes tiempos: cada uno tiene que salir de una línea del transcript.

Devolvé la lista en formato `MM:SS Título` y, al lado de cada uno, la frase del transcript
donde empieza, para que la pueda chequear.

Transcript:
[TRANSCRIPT CON TIEMPOS]
```

## Descripción

```
Escribí la descripción de YouTube de este video.

Título: [TÍTULO]
Para quién es: [AUDIENCIA]
Qué se lleva quien lo mira: [PROMESA]
Link principal (recurso, curso o lo que quieras que hagan): [LINK]
Capítulos: [CAPÍTULOS]

Estructura:
1. Primera línea: qué es el video en una frase, con las palabras que alguien buscaría
   (menos de 90 caracteres; es lo único que se ve antes de «más»).
2. Segunda línea: el link principal con una frase que diga qué consiguen.
3. Un párrafo corto que confirme lo que prometen el título y la miniatura.
4. «En este video vas a ver:» y 4–7 viñetas, una por parte del video.
5. Los capítulos, tal cual.
6. Un video relacionado tuyo: [LINK DEL VIDEO RELACIONADO].
7. Dos o tres hashtags.

Nada de frases de relleno («en el video de hoy», «no te lo pierdas»), nada que el video
no diga. Usá los números sólo si están en el transcript.

Transcript:
[TRANSCRIPT]
```

## Tags

```
Proponé entre 15 y 20 tags para este video de YouTube, en total menos de 400 caracteres.

Título: [TÍTULO]
Primera línea de la descripción: [PRIMERA LÍNEA]

- Primero las búsquedas exactas que alguien escribiría para encontrar este video.
- Después variantes (con y sin tildes, en inglés sólo si el término se busca así).
- El nombre de las herramientas que aparecen, y el nombre del canal al final.
- Nada que el video no trate.

Ordenalos de más a menos importante.
```

## Comentario fijado

```
Escribí el comentario fijado de este video.

Título: [TÍTULO]
Link principal: [LINK]

Tres partes, cortas:
1. Una línea que siga la idea del video (no que la repita).
2. El link, con una frase de qué consiguen.
3. Una pregunta concreta sobre el tema, que se pueda contestar en una línea.
```

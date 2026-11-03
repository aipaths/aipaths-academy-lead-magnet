# Mapa del corte

Todo se ubica sobre este mapa. Corre en minutos y se hace una vez por corte.

## 1. Palabras con tiempo

whisper.cpp con salida JSON completa da cada token con su tiempo:

```bash
ffmpeg -i corte.mp4 -ar 16000 -ac 1 -c:a pcm_s16le voz.wav
whisper-cli -m modelos/ggml-small.bin -l es -f voz.wav -ojf -dtw small -nfa
```

- Los tiempos de los segmentos se corren hasta casi un segundo: para pegar piezas a palabras
  usá el tiempo por token del DTW (`-dtw`). Si vuelve en −1, sacá flash attention (`-nfa`).
- El DTW suele llegar un poco tarde (~0,1 s). Pegá cada palabra al arranque de habla más
  cercano (paso 2) si hay uno a −0,2/+0,25 s.
- Voces generadas (clon, TTS, doblaje) muchas veces no se transcriben: quedan como huecos
  entre las palabras. Los bordes salen del paso 2.
- whisper inventa texto en silencios largos y se equivoca en homófonos y nombres propios
  («vos»/«voz»): revisá lo que va a quedar escrito en pantalla.

## 2. Silencios y arranques de habla

```bash
ffmpeg -i corte.mp4 -af "silencedetect=noise=-35dB:d=0.08" -f null - 2>&1 | grep silence_
```

Los huecos son donde entra limpio un efecto o un corte; los `silence_end` son arranques de habla.

## 3. Hoja de contactos

Un cuadro cada 5 s, en grilla, para ver qué hay en pantalla sin mirar el video entero:

```bash
ffmpeg -skip_frame nokey -i corte.mp4 -vf "fps=1/5,scale=240:-1,tile=8x6" hoja-%02d.png
```

Ahí ves los tramos a cámara y los de pantalla, y las zonas vacías donde puede ir una pieza.

## 4. Cortes y cambios de escena

```bash
ffmpeg -i corte.mp4 -an -vf "scale=480:-2,select='gt(scene,0.2)',metadata=print" -f null - 2>&1 | grep pts_time
```

- Un corte duro da un pico en un cuadro. Un fundido (la transición por defecto de OBS) no da
  pico: no lleva el mismo sonido que un corte (ver `sonido.md`).
- Si el editor guarda marcadores o el software de grabación deja un registro de escenas,
  empezá por ahí: es más exacto que medir.

## 5. Cortes escondidos

Dentro de una grabación de pantalla con la cámara en un recuadro, un corte casi no cambia la
imagen: sólo salta la cara. La detección de escenas no lo ve, y un efecto en ese cuadro lo
subraya. Antes de poner un sonido, medí la diferencia cuadro a cuadro del recuadro de cámara:

```bash
ffmpeg -ss <t-0.4> -t 0.8 -i corte.mp4 -an -f null - \
  -vf "crop=<w>:<h>:<x>:<y>,scale=160:-1,signalstats,metadata=print:key=lavfi.signalstats.YDIF" 2>&1 | grep YDIF
```

Un salto aislado muy por encima del resto en un solo cuadro es un corte.

## 6. Qué sale del mapa

Una lista de tramos (cámara / pantalla / tarjeta), cada corte con su tipo (duro / fundido),
los huecos de voz y las palabras clave con su segundo. El plan de piezas se arma sobre eso.

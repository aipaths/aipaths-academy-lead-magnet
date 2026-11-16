# Los 30 efectos de sonido

Diez pops, diez whooshes y diez risers, generados con código (numpy y scipy): ningún sample,
modelo ni archivo de afuera entra en el sonido. Son los del video.

## Licencia

Son míos y los regalo: **CC0, dominio público**. Usalos en tus videos, comerciales o no, sin
atribución y sin pedir permiso. No los vendas como una biblioteca de sonidos ni los registres
en sistemas de reclamo de derechos.

## Cómo están

WAV estéreo, 48 kHz, 24 bits, cada uno cerca de −1 dBFS de pico: en la mezcla tienen que ir
**mucho más bajos que la voz**; el volumen se fija al mezclar, no en el archivo.

`mediciones.csv` trae la tabla completa para que Claude la lea (duración, arranque, pico, final,
pico en dBFS y nivel). Las columnas:

- **Dura:** duración total del archivo, en segundos.
- **Arranca:** segundo en que el sonido llega a −20 dB bajo su pico (el silencio del principio no cuenta).
- **Pico:** segundo de la muestra más alta. Ahí es donde tiene que caer el efecto: el pico de un
  whoosh va a mitad del movimiento; el de un riser, en el momento de la palabra que sigue.
- **Nivel:** volumen (RMS, en dBFS) de los 400 ms más fuertes.

Los risers terminan en el pico, sin cola: se ponen antes, de modo que el final caiga justo
donde querés y después quede el silencio.

## La tabla

### Los 10 pops

| Archivo | Qué es y cuándo va | Dura (s) | Arranca (s) | Pico (s) | Nivel (dBFS) |
|---|---|---|---|---|---|
| `pop-01-burbuja-media.wav` | Tono que sube de 600 a 900 Hz, 25 ms. El pop de recuadro. | 0.054 | 0.000 | 0.001 | -9.2 |
| `pop-02-burbuja-aguda.wav` | 1,1 → 1,55 kHz, más chica. Para íconos o ítems de lista. | 0.045 | 0.000 | 0.001 | -9.1 |
| `pop-03-gota-grave.wav` | 340 → 620 Hz con más cuerpo. Para algo grande que aparece. | 0.088 | 0.000 | 0.002 | -9.8 |
| `pop-04-boop-bajada.wav` | 950 → 520 Hz. Para algo que se va o se cierra. | 0.071 | 0.000 | 0.001 | -9.3 |
| `pop-05-tick-brillante.wav` | 2,2 kHz con armónico y click de ataque, 12 ms. Casi un click de UI. | 0.034 | 0.000 | 0.001 | -11.5 |
| `pop-06-pluck.wav` | Cuerda pulsada muy corta (Karplus-Strong) a 660 Hz. | 0.187 | 0.000 | 0.001 | -18.9 |
| `pop-07-madera.wav` | Golpe de bloque por FM, seco. Para marcas o checks. | 0.100 | 0.000 | 0.004 | -14.2 |
| `pop-08-pop-con-aire.wav` | La burbuja media con una sala chica (cola ~0,3 s). Sólo en un hueco de voz. | 0.532 | 0.000 | 0.011 | -19.2 |
| `pop-09-doble.wav` | Dos pops a 75 ms, el segundo más agudo. Para un par de ítems o un «listo». | 0.126 | 0.000 | 0.001 | -11.4 |
| `pop-10-con-cuerpo.wav` | Burbuja de 480 → 820 Hz con un golpe grave abajo. Recuadro grande. | 0.145 | 0.000 | 0.005 | -15.1 |

### Los 10 whooshes

| Archivo | Qué es y cuándo va | Dura (s) | Arranca (s) | Pico (s) | Nivel (dBFS) |
|---|---|---|---|---|---|
| `whoosh-01-suave-rapido.wav` | Grave, crece 0,2 s hasta el pico y se va. El de los zooms y overlays. | 1.031 | 0.222 | 0.330 | -17.3 |
| `whoosh-02-suave-medio.wav` | Igual de grave, más lento (pico a 0,5 s). Paneles que entran. | 1.649 | 0.356 | 0.479 | -16.6 |
| `whoosh-03-suave-lento.wav` | Crece 0,45 s, cola larga. Para un movimiento de cámara amplio. | 2.373 | 0.431 | 0.619 | -14.4 |
| `whoosh-04-deslizar-pantalla.wav` | Más textura media y paneo marcado. Corte duro de sección. | 0.934 | 0.240 | 0.324 | -17.6 |
| `whoosh-05-deslizar-corto.wav` | 0,25 s de punta a punta. Un elemento chico que se corre. | 0.557 | 0.111 | 0.207 | -17.9 |
| `whoosh-06-seco-agudo.wav` | Ruido medio-agudo y corto, como una vara. Ojo: los agudos y secos suelen chocar con la voz. | 0.510 | 0.086 | 0.138 | -20.0 |
| `whoosh-07-titulo-con-sub.wav` | Grave con un tono de 60 Hz que baja al pasar. Título que sube y se asienta. | 1.953 | 0.335 | 0.475 | -9.2 |
| `whoosh-08-tela-doble.wav` | Dos soplidos seguidos con textura de tela. Algo que se despliega. | 1.003 | 0.117 | 0.160 | -18.9 |
| `whoosh-09-entrada.wav` | Crece 0,45 s y frena seco en el pico. Para algo que llega y se clava. | 0.819 | 0.327 | 0.500 | -19.6 |
| `whoosh-10-jet-peine.wav` | Ruido por un filtro peine que barre, con color tonal. Zoom o paso rápido con más carácter. | 1.485 | 0.316 | 0.469 | -15.1 |

### Los 10 risers

| Archivo | Qué es y cuándo va | Dura (s) | Arranca (s) | Pico (s) | Nivel (dBFS) |
|---|---|---|---|---|---|
| `riser-01-ruido-1s.wav` | Banda que sube de 300 Hz a 4 kHz. El más neutro y corto. | 1.000 | 0.653 | 0.987 | -21.0 |
| `riser-02-viento-2s.wav` | Ruido grave que se abre de 120 Hz a 2 kHz. | 2.000 | 0.929 | 1.979 | -19.7 |
| `riser-03-filtro-resonante-3s.wav` | Ruido con un silbido de filtro que barre. Más electrónico. | 3.000 | 1.685 | 2.995 | -17.0 |
| `riser-04-supersaw-1-5s.wav` | Cinco sierras desafinadas que suben dos octavas y se abren. | 1.500 | 0.803 | 1.493 | -15.1 |
| `riser-05-shepard-3s.wav` | Tonos que parecen subir sin fin. Tensión limpia, sin ruido. | 3.000 | 1.373 | 2.989 | -17.1 |
| `riser-06-pulso-2s.wav` | Ruido y tono cortados por pulsos de 4 a 26 por segundo. | 2.000 | 1.209 | 1.981 | -20.4 |
| `riser-07-sub-1-5s.wav` | Grave de 42 a 115 Hz con aire. Para parlantes grandes; en el celu se oye poco. | 1.500 | 0.484 | 1.491 | -9.4 |
| `riser-08-ruido-y-tono-2-5s.wav` | Barrido de ruido con un tono que sube dos octavas. | 2.500 | 1.705 | 2.494 | -17.1 |
| `riser-09-acorde-2s.wav` | Do mayor que se abre y sube dos semitonos. Antes de una revelación. | 2.000 | 0.758 | 1.986 | -17.7 |
| `riser-10-ticks-1-2s.wav` | Clicks de 6 a 32 por segundo que suben de altura. | 1.200 | 0.626 | 1.180 | -26.8 |
## Si querés regenerarlos o cambiarlos

`generador/` es el código que los hizo. Necesita [uv](https://docs.astral.sh/uv/), que instala
numpy y scipy solo:

```bash
cd generador
uv run generar.py                                 # escribe wav/ y catalogo.json
uv run -q --with numpy python -I medir-csv.py     # escribe mediciones.csv (necesita ffmpeg)
```

Con la misma semilla salen los mismos efectos (con otra versión de numpy o scipy puede cambiar
una muestra por un bit, que no se oye). Para sumar uno nuevo, agregalo a la
lista de `pops.py`, `whooshes.py` o `risers.py` (nombre, descripción y una función que devuelve
el sonido) y corré de nuevo. Pedirle a Claude que lo haga también funciona.

# Música sin copyright

Tres pistas instrumentales de fondo, de 80 segundos cada una, pensadas para ir bajito debajo
de una voz. Son lo-fi cálido, sin voz ni letra: piano eléctrico suave, bajo redondo, batería
con escobillas y un poco de textura de vinilo.

## De dónde salen

Las generé con **ACE-Step 1.5**, un modelo de música gratis y abierto (licencia MIT) que corre
en una computadora normal, sin pagar ni conectarte a un servicio. Son música generada por IA:
no hay un artista ni una disquera detrás.

## Licencia

**CC0, dominio público.** Usalas en tus videos, comerciales o no, sin atribución. No las
subas a distribuidoras de música ni las registres en sistemas de reclamo de derechos: no son
exclusivas de nadie, y si alguien las registra, a tu video le pueden reclamar música que es tuya.

## Las tres

| Archivo | Tempo | Semilla | Dura | Volumen | Pico real | Rango |
|---|---|---|---|---|---|---|
| `lofi-calido-01.mp3` | 84 bpm | 2611 | 80 s | −18,0 LUFS | −2,0 dBTP | 2,9 LU |
| `lofi-calido-02.mp3` | 78 bpm | 3107 | 80 s | −18,0 LUFS | −2,1 dBTP | 2,0 LU |
| `lofi-calido-03.mp3` | 90 bpm | 4412 | 80 s | −17,9 LUFS | −2,2 dBTP | 5,8 LU |

La 01 es el estilo base; la 02 es más lenta y la de volumen más parejo; la 03 es más rápida y
la que más varía de volumen a lo largo del tema. Las tres vienen parejas de volumen (−18 LUFS): cambiás de una a
otra sin tocar nada. No tienen silencios adentro ni clipping; arrancan con un fundido corto
(la 03 tarda casi un segundo en entrar) y terminan con uno largo de unos 3 segundos.

MP3 estéreo de 48 kHz, ~170 kbps.

## Cómo usarlas en un video

- **Debajo de la voz, muy baja y pareja:** unos 20 a 24 dB por debajo de la voz, con volumen
  fijo. Subila hasta que apenas se note y bajala un poco más.
- **Sin ducking fuerte:** que no suba y baje con cada pausa; en tramos largos cansa.
- **Con fade siempre,** nunca un corte seco. Y probala en el parlante de un celular.
- **Dónde no:** mientras suena otra voz (una demo), en el paso a paso detallado y en el momento
  clave del video: ahí cortarla es el acento.
- La skill `editor-de-video` tiene el detalle en `references/sonido.md`.

## Generar las tuyas

Con el mismo prompt y otra semilla sale otra pista del mismo estilo. El prompt con que
generé estas tres, en inglés porque el modelo lo entiende mejor así:

```text
warm lo-fi hip hop instrumental, mellow Rhodes electric piano chords, soft round bass, gentle brushed drums, subtle vinyl texture, calm focused mood, sparse melody, no vocals, background music for a tech tutorial
```

Lo instalás desde [github.com/ace-step/ACE-Step-1.5](https://github.com/ace-step/ACE-Step-1.5)
y Claude Code te puede ayudar. Por ejemplo:

```text
Instalame ACE-Step 1.5 desde https://github.com/ace-step/ACE-Step-1.5 y generame una pista instrumental de 80 segundos, sin voz, con esta descripción: [el prompt de arriba]. Guardá el prompt, el tempo y la semilla al lado del archivo para poder repetirla.
```

Para que suene a vos, guardá siempre el prompt y la semilla: así todos tus videos comparten el
mismo sonido. Ojo: la misma semilla en otra computadora o en otra versión del modelo puede dar
una pista distinta; lo que repite el estilo es el prompt.

Para dejarlas parejas como estas, el volumen se mide y se corrige con ffmpeg:

```bash
ffmpeg -i mi-pista.wav -af loudnorm=I=-18:TP=-2:LRA=11 -c:a libmp3lame -q:a 2 mi-pista.mp3
```

Después medís el resultado con `ffmpeg -i mi-pista.mp3 -af ebur128=peak=true -f null -`: tiene que
dar cerca de −18 LUFS y un pico real por debajo de −2 dBTP.

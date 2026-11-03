# Sonido, música y master

## Efectos: el sonido sigue al movimiento

Antes de elegir un efecto, mirá cómo se mueve lo que lo dispara y a qué velocidad.

| Lo que se ve | Sonido |
|---|---|
| Algo aparece con rebote (recuadro, ícono, ítem de lista) | pop, ataque en el cuadro en que aparece |
| Algo entra del costado, un panel se desliza | whoosh, con el pico a mitad del movimiento |
| Corte duro que cambia de sección | whoosh, con el pico en el corte y dentro de un silencio |
| Título que sube y se asienta | whoosh grave, bajo si va debajo de la voz |
| Zoom animado sobre la pantalla | whoosh muy bajito, pico en el centro del zoom |
| Fundido lento | nada: un whoosh rápido sobre un fundido desentona |
| Click que arranca o corta algo que importa (una demo de audio) | click al principio y al final, como comillas |

- **Lo que se agrega a la imagen lleva sonido.** Sin sonido, un texto «aparece de la nada».
- **Sólo lo que pesa en la historia.** Un click perfecto en un momento de trámite no suma.
- **El tamaño del sonido sigue al tamaño del movimiento.** Un deslizamiento chico no suena
  como un recuadro que aparece. Los whooshes graves y que crecen de a poco suelen pasar
  mejor que los agudos y secos.
- **Nada de risers ni platillos al revés** para anticipar.
- **Separación:** nada a menos de ~1 s de otro efecto, ni sobre una voz de demo, ni sobre un
  corte escondido (ver `mapa-del-corte.md`).

### Niveles

Medí cada efecto en una ventana corta (100 ms): en 400 ms un efecto corto se diluye y termina
alto. Puntos de partida en dBFS sobre esa ventana, con la voz cerca de −25:

- pop y click: −30 a −39;
- whoosh de corte: −26 a −32;
- whoosh de título: ~−32;
- whoosh de zoom: ~−38.

Si no se entiende cada palabra sin esfuerzo, los efectos están altos. Entregá un preview con
efectos y otro sin, para comparar.

## Música: dos modos

- **Entrada.** Corta, con presencia: arranque, un título de capítulo, un hueco sin voz. Si
  entra con un momento, no se corta cuando vuelve la voz: sigue de fondo y se va con un fade
  lento hasta el próximo cambio de escena.
- **Fondo.** Larga, muy baja y pareja: volumen fijo o un ducking suave de pocos dB. El ducking
  fuerte (~20 dB) que sube en cada pausa y baja en cada frase se oye como bombeo y cansa en
  tramos largos. Normalizá la dinámica de la pista antes de bajarla (`dynaudnorm`).
- **Dónde no:** mientras suena otra voz (demo, clon), en el paso a paso detallado y en el
  momento clave (llamado a la acción, afirmación fuerte), donde cortarla es el acento.
- Siempre con fade, nunca un corte seco de la cama. Probala en el parlante de un celular.
- Licencia: música propia o con licencia que permita uso comercial. Si la generás con un
  modelo local, revisá la licencia de los pesos (hay modelos populares sólo no comerciales).

## Voz: medir antes de tocar

Medí el corte antes de procesar:

```bash
ffmpeg -i corte.mp4 -af ebur128=peak=true -f null - 2>&1 | tail -12
```

Si el rango de loudness (LRA) es chico (~4–6 LU) y el ruido en las pausas está bajo, la voz ya
viene comprimida y limpia (muchos graban con compresor y limitador en OBS): no sumes EQ,
compresión ni reducción de ruido. Lo único que le falta es volumen, y eso lo da el master.

## Master: −16 LUFS, true peak ≤ −1,5 dBTP

−16 es el punto medio: los videos de YouTube suenan cerca de −14 y la plataforma baja lo
fuerte pero no sube lo bajo; a −14 hay que limitar mucho los picos de una voz hablada.

1. Mezcla completa: voz + efectos + música.
2. Ganancia + limitador:

   ```bash
   ffmpeg -i mezcla.wav -af "volume=<+X>dB,alimiter=limit=0.79:attack=5:release=80:level=disabled" master.wav
   ```

3. Medí con `ebur128=peak=true` y ajustá `X` hasta −16,0 LUFS integrados con el true peak
   ≤ −1,5 dBTP. Dos o tres vueltas alcanzan.
4. Volvé a medir el archivo final exportado, no sólo el WAV.

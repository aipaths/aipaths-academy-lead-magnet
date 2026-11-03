# Componentes de edición

Cuatro piezas listas para tus videos. Cada carpeta es un proyecto chico que se abre, se cambia
arriba de todo (textos, colores, tiempos) y se renderiza. Las tres animadas son
[HyperFrames](https://github.com/heygen-com/hyperframes) (HTML que se convierte en video); la
transición es un script de Python.

| Componente | Qué hace | Sonido |
|---|---|---|
| [`titulo-capitulo/`](titulo-capitulo/LEEME.md) | título de capítulo que entra sobre tu toma y se va solo; sale con fondo transparente | whoosh al entrar el título |
| [`tarjeta-marcador/`](tarjeta-marcador/LEEME.md) | tarjeta de una etapa con 4 columnas (Mi tiempo, Tiempo de tarea, Costo, Calidad) que cargan su valor en el segundo que digas, y el nivel (Automático / Asistido / Manual) | pop por cada valor y por el nivel |
| [`descripcion-youtube/`](descripcion-youtube/LEEME.md) | la página de un video que abre la descripción y resalta los capítulos de a uno | whoosh en cada movimiento grande, pop en el cartel |
| [`transicion-desenfoque/`](transicion-desenfoque/LEEME.md) | desenfoque rápido centrado en un corte, para pasar de una toma a otra | whoosh con el pico en el corte |

## Lo que necesitás

- Node 22 o más nuevo y FFmpeg (las piezas animadas usan `npx hyperframes@0.8.223`, se baja solo)
- [uv](https://docs.astral.sh/uv/) para la transición (instala numpy y OpenCV al vuelo)

```bash
cd titulo-capitulo
npm run dev      # vista previa en el navegador
npm run render   # el video queda en renders/
```

Todo está en 1920×1080 a 30 fps. Los tiempos de cada pieza se cuentan desde que aparece: para
ubicarla en el video, tomá el segundo de la palabra del transcript con tiempos.

## Sonido

Ninguna pieza trae audio: los efectos los ponés vos. La regla para todas: **el sonido sigue al
movimiento**. Lo que rebota lleva pop, lo que entra o pasa rápido lleva whoosh, lo que se funde
no suena. Niveles orientativos con la voz alrededor de −16 LUFS: whoosh ~−36 dB, pop ~−31 dB.

Efectos libres: la **biblioteca de audio de YouTube Studio** (pestaña *Efectos de sonido*),
**Pixabay** (licencia de Pixabay, sin atribución) o **Freesound** filtrando por *Creative Commons 0*.
Cada LEEME trae dónde va cada efecto y el comando de FFmpeg (`adelay` + `amix`) para ponerlo en
su segundo.

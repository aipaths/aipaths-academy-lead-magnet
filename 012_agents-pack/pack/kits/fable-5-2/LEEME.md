# Claude Fable 5.2: demos 3D hechas sólo con código

> Viene del video **Claude Fable 5.2** *(próximamente)*.
> Más videos con su parte del pack: `../../README.md` → "¿Venís de un video?".

Los prompts tal cual se los pasé a Claude Fable 5.2 en el video, con el resultado de cada uno.
Y las 6 demos que salieron: el mismo prompt en Fable 5.2, Opus 5.5 y Sonnet 5.5.

Cada demo es una página web en 3D (Three.js) que corre en el navegador: se gira, se desarma y suena.
No hay Blender ni render: todo lo que ves está escrito con código.

## Las 6 demos

| Demo | Modelo | Objeto | Minutos | Costo ≈ (API) |
|---|---|---|---|---|
| `demos/sonnet-tocadiscos/` | Sonnet 5.5 | Tocadiscos | 31 | US$ 11 |
| `demos/opus-tocadiscos/` | Opus 5.5 | Tocadiscos | 36 | US$ 19 |
| `demos/fable-tocadiscos/` | Fable 5.2 | Tocadiscos | 26 | US$ 30 |
| `demos/sonnet-grua/` | Sonnet 5.5 | Grúa con almeja | 39 | US$ 10 |
| `demos/opus-grua/` | Opus 5.5 | Grúa con almeja | 51 | US$ 26 |
| `demos/fable-grua/` | Fable 5.2 | Grúa con almeja | 46 | US$ 52 |

El costo es lo que habría salido pagando la API por tokens. Con una suscripción no pagás eso aparte.

### Cómo correr una

Las texturas y el cielo no vienen en el pack (pesan unos 68 MB): cada demo trae un script que los baja
de Poly Haven con los nombres exactos que usa el código. Lo corrés una vez:

```bash
cd demos/fable-tocadiscos
bash bajar-assets.sh
python3 -m http.server 8800
```

y entrás a `http://localhost:8800`. Con doble clic en el `index.html` no anda: el navegador bloquea
los archivos. Para cambiar de demo, cortá el servidor (`Ctrl+C`) y repetí en la otra carpeta.

El script usa `curl`. La grúa de Fable además espeja el cielo: con `ffmpeg` si lo tenés, y si no, en
Mac con `sips` y `python3`, que ya vienen.

### Controles

**Tocadiscos (los 3):** arrastrás para girar, ruedita para acercar, y con los botones en pantalla le
das play, lo desarmás y abrís o cerrás la tapa. Pasá el mouse por una pieza para ver su nombre.

**Grúas:** cada modelo eligió sus teclas.

| Qué | Fable 5.2 | Opus 5.5 | Sonnet 5.5 |
|---|---|---|---|
| Girar la cabina | A / D | ← / → | ← / → |
| Subir y bajar la pluma | W / S | ↑ / ↓ | ↑ / ↓ |
| Recoger y soltar cable | R / F | R / F | Q / E |
| Abrir y cerrar la almeja | Q / E | Espacio | Z / X |
| Mover las orugas | Flechas | W / A / S / D | W / A / S / D |
| Piloto automático | P | — | P |
| Cámara · sonido | C · M | C · M | — |

La primera tecla o el primer clic arranca el sonido: el navegador no deja que una página suene sola.

## Tocadiscos (Technics SL-1200 MK7)

Resultado en el video: 26 minutos, sin correcciones mías, 60 fps.

```
Armá un tocadiscos en 3D interactivo que corra en el navegador, como una página web (Three.js, sin Blender). Que sea el Technics SL-1200 MK7 negro, el real: buscá fotos y medidas oficiales y copiá su forma. Que esté sobre un escritorio de madera con texturas reales y buena luz, que no parezca un videojuego. Se tiene que poder girar con el mouse y desarmar en sus piezas (tapa, plato, slipmat, brazo, cápsula y aguja, motor, chasis y lo que tenga), con el nombre de cada pieza al pasar el mouse. Y tiene que sonar: le das play, el vinilo gira, el brazo baja solo al disco y suena música generada por código con el crujido del vinilo. Que ande fluido en mi compu.
```

## Grúa con almeja (Liebherr HS 8100)

Resultado en el video: 46 minutos, 1 corrección mía (el encuadre del timelapse), ~55 fps.

```
Armá una grúa sobre orugas con almeja colgada de cable, en 3D interactivo en el navegador (Three.js, sin Blender), basada en una grúa real (tipo Liebherr con almeja: buscá fotos y medidas y copiá su forma). Está en una obra de tierra y la manejo yo con el teclado: girar la cabina, subir y bajar la pluma, soltar y recoger cable, abrir y cerrar la almeja y mover las orugas. El cable se tiene que balancear de verdad: si freno de golpe, la almeja sigue oscilando. La almeja agarra tierra: donde muerde queda un pozo, donde suelto se arma una montaña que se desmorona sola hasta su ángulo natural, y la tierra que cae en el aire son partículas. Al lado hay un camión volquete: cuando lo lleno, se va solo y viene otro vacío. Con sonido (motor, cable, la almeja mordiendo, la tierra cayendo) y texturas reales, que no parezca un videojuego. Que ande fluido en mi compu.
```

Para que no se trabe, sumale esto: «La tierra, híbrida: un mapa de alturas que se deforma y sólo la
tierra en el aire son partículas».

## Plantilla: tu producto en 3D

Reemplazá lo que está en `[MAYÚSCULAS]`.

```
Armá [PRODUCTO] en 3D interactivo que corra en el navegador, como una página web (Three.js, sin Blender). Que sea el [MODELO EXACTO], el real: buscá fotos y medidas oficiales y copiá su forma. Que esté sobre [SUPERFICIE O LUGAR] con texturas reales y buena luz, que no parezca un videojuego. Se tiene que poder girar con el mouse y desarmar en sus piezas ([PIEZAS PRINCIPALES]), con el nombre de cada pieza al pasar el mouse. [QUÉ TIENE QUE HACER: sonar, moverse, prenderse]. Que ande fluido en mi compu.
```

Cómo usarlos:

1. Abrí Claude Code (o tu agente de código) en una carpeta vacía.
2. Copiá el prompt entero. Si querés otro objeto, usá la plantilla.
3. Dejalo trabajar solo. Para verlo, serví la carpeta con `python3 -m http.server 8800` y entrá a
   `http://localhost:8800`.

Lo que aprendí haciéndolas:
- **Pasale una foto de arriba del producto real.** Con la foto cenital mide cada pieza; sin ella, inventa.
- **Pedile que se saque capturas y se revise.** Fable encontró y arregló solo 9 errores en el tocadiscos y 13 en la grúa.
- **Si querés el timelapse,** pedile que la arme por etapas y saque una captura con la misma cámara en cada una.

## Licencias

- **Texturas y cielos:** [Poly Haven](https://polyhaven.com), licencia CC0 (dominio público). Las baja `bajar-assets.sh`.
- **Three.js** (carpeta `vendor/` de cada demo): licencia MIT, el texto está en `vendor/`.
- **El código de las demos:** lo escribieron los modelos en el video. Usalo como quieras.
- Los logos de Technics y Liebherr son de sus marcas; están sólo para que el modelo se parezca al real.

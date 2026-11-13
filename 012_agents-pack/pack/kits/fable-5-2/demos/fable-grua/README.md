# Grúa sobre orugas con almeja (Liebherr HS 8100.1)

Grúa de cable sobre orugas en una obra de tierra, en 3D y manejable con el teclado. Three.js, sin Blender
y sin paso de compilación. La hizo Claude Fable 5.2.

## Abrirla

La primera vez, bajá las texturas y el cielo (`bash bajar-assets.sh`). Después:

```bash
python3 -m http.server 8800
```

y entrar a http://localhost:8800/ (doble clic en `index.html` no anda: el navegador bloquea los módulos).

## Teclas

| Tecla | Qué hace |
|---|---|
| A / D | girar la cabina |
| W / S | subir / bajar la pluma |
| R / F | recoger / soltar cable |
| Q / E | abrir / cerrar la almeja (Espacio también cierra) |
| Flechas | mover las orugas (↑↓ avanza y retrocede, ←→ dobla) |
| C | cambiar de cámara (exterior, operador, almeja) |
| P | piloto automático: cava y carga el camión solo |
| M | sonido sí / no |

Para cargar: bajá la almeja abierta hasta que apoye en la tierra, cerrala (muerde), levantá, girá hasta
el camión y abrila. Cuando el camión se llena (8 m³, unas 4 paladas) se va solo y entra otro vacío.

## Parámetros de la URL

- `?fps=1` muestra los cuadros por segundo. `?q=2` (o 1.5, 1.25, 1) fija la resolución; sin eso baja sola si no llega a 50.
- `?demo=1` arranca con el piloto automático.
- `?timelapse=1` cámara fija, sin interfaz y estado fijo (para las capturas del timelapse).
  Con `&demo=1&t=30` el piloto trabaja 30 segundos a paso fijo antes de congelar.
- `?timelapse=2&etapa=N` cámara de construcción: encuadra lo ya construido y gira unos grados por etapa;
  de la etapa 13 en adelante coincide con la fija (`js/camara-obra.js`).

## Cómo está hecha

- `js/medidas.js`: todas las medidas, con la marca de cuáles salen de la ficha oficial.
- `js/terreno.js` y `js/tierra.js`: el suelo es un mapa de alturas de 257×257; cavar resta, soltar suma y
  una relajación por ángulo de reposo (35°) desmorona las montañas.
- `js/particulas.js`: sólo la tierra en el aire son partículas (hasta 3.600 terrones).
- `js/fisica.js`: la almeja es un péndulo con cable inextensible; nadie la anima.
- `js/orugas.js`, `cabina.js`, `pluma.js`, `almeja.js`, `camion.js`, `obra.js`: los modelos, por código.
- `js/sonido.js`: todo el sonido sintetizado con Web Audio.
- `vendor/`: Three.js r170 (MIT). `assets/`: texturas y cielo de Poly Haven (CC0) y el logo de Liebherr (Wikimedia Commons).

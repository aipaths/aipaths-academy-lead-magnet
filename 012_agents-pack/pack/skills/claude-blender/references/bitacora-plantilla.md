# Plantilla de bitácora

Una entrada por prueba en `notas/bitacora.md`, aunque salga mal. Los fallos son el material
más valioso para contar (video, post, demo).

```markdown
### AAAA-MM-DD · tema
- **Prompt:** "texto exacto del usuario"
- **Modelo:**
- **Tiempo (prompt → render):** hora inicio → hora fin; desglosar armado vs. render
- **Correcciones:** cuántas, y cuáles fueron automáticas y cuáles pidió el usuario
- **Resultado:** `renders/...` · escena `escenas/...`
- **Cómo se hizo:** 2–4 líneas con la técnica (para poder repetirlo)
- **Qué falló / qué sorprendió:**
  - un ítem por tropiezo: síntoma → causa → arreglo
- **¿Sirve para el video?:** sí/no y qué momento contaría
```

Arriba del archivo conviene mantener una lista "Pruebas por hacer" con casillas que se
tildan al terminar cada una.

## Convenciones de carpetas

- `escenas/AAAA-MM-DD_tema.blend`: un archivo por prueba (nunca pisar el anterior).
- `renders/`: PNG finales y MP4 (los MP4 pueden quedar fuera de git).
- `referencias/`: lo que pasa el usuario (logos, videos). Los videos y sus cuadros, fuera de git.

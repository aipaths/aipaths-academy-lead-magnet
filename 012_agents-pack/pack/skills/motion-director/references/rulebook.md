# Rulebook de motion  ·  plantilla

Copiala al proyecto (junto al brief) y completala **antes** de animar. Cada regla tiene que
ser verificable mirando la hoja de contactos; si no se puede chequear mirando, no es regla.

```markdown
## Rulebook — <proyecto>

### Ritmo
- Nada queda quieto más de <X> s.            (ej. 0.4 s para algo enérgico, 1.5 s para algo sobrio)
- Cambio de plano cada <Y> s promedio.       (referencia: los virales rondan 1–2 s)
- Los cortes caen en beat / en palabra / libres.

### Color
- Paleta: <fondo>, <texto>, <acento 1>, <acento 2>.
- El acento se usa para: <función> (estado, énfasis, una palabra clave…), nunca decorativo.
- Prohibido: <gradientes genéricos, neón, lo que no sea de la marca>.

### Composición
- No más de <N> planos seguidos con el texto centrado.
- Jerarquía: un solo elemento protagonista por plano.
- Márgenes seguros: <px> en todos los bordes.

### Tipografía
- Familias: <display>, <texto>.
- Tamaño mínimo legible en 1080p: <px>.
- Texto en pantalla ≤ <N> palabras por plano (salvo letra de canción).

### Movimiento
- Easing por defecto: <curva>. Nada lineal salvo <caso>.
- Entradas y salidas: <estilo>. Prohibido: <rebotes, giros 3D sin motivo…>.

### Marca
- Logo/wordmark: <cuándo y dónde aparece>.
- Tono: <dos o tres adjetivos que se puedan ver, no sentir>.
```

## Cómo se usa en el QA
Cada falla de la hoja de contactos se anota como `mm:ss — regla violada — escena`.
Si aparece una falla que ninguna regla cubre, la regla falta: agregala al rulebook y
recién después corregí la escena. Así el rulebook mejora con cada proyecto.

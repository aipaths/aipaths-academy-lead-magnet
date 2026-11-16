"""Pops: un tono corto con glissando (de 0,8 a 1,5 kHz, dura ~25 ms
y sube un poco de afinación). Variantes en altura, dirección del glissando, cuerpo, cola y timbre."""

import numpy as np

from dsp import SR, fase, pasaaltos_fijo, pasabajos_fijo, ruido, sala, saturar, tiempo


def envolvente_pop(t, ataque_ms=0.5, cuerpo_ms=10.0, caida_ms=6.0):
    a, h, c = ataque_ms / 1000, cuerpo_ms / 1000, caida_ms / 1000
    sube = np.clip(t / a, 0, 1)
    sube = np.sin(sube * np.pi / 2) ** 2
    return sube * np.where(t < a + h, 1.0, np.exp(-(t - a - h) / c))


def blip(rng, f_ini, f_fin, glide_ms=8.0, cuerpo_ms=10.0, caida_ms=6.0, parciales=((1, 1.0),),
         click=0.0, golpe=0.0, dur=0.22):
    t = tiempo(dur)
    f = f_fin + (f_ini - f_fin) * np.exp(-t / (glide_ms / 1000))
    ph = fase(f)
    x = np.zeros_like(t)
    for r, g in parciales:
        # Los parciales altos se apagan antes: suena a objeto, no a oscilador.
        x += g * np.sin(r * ph) * envolvente_pop(t, 0.5, cuerpo_ms / r**0.7, caida_ms / r**0.5)
    if click:
        n = int(0.0015 * SR)
        r = pasaaltos_fijo(ruido(n, rng), 2500) * np.hanning(2 * n)[n:]
        x[:n] += click * r / np.max(np.abs(r))
    if golpe:
        fg = 75 + 70 * np.exp(-t / 0.012)
        x += golpe * np.sin(fase(fg)) * envolvente_pop(t, 0.8, 6, 22)
    return saturar(x / np.max(np.abs(x)), 1.3)


def pluck(rng, f0=660.0, caida=0.993, dur=0.25):
    """Karplus-Strong: un pulso de ruido recircula por una línea de retardo filtrada."""
    n = int(dur * SR)
    p = int(SR / f0)
    buf = pasabajos_fijo(rng.uniform(-1, 1, p), 2500) * np.hanning(p)
    y = np.zeros(n)
    y[:p] = buf
    for i in range(p, n):
        y[i] = caida * 0.5 * (y[i - p] + y[i - p - 1 if i - p - 1 >= 0 else 0])
    t = tiempo(dur)
    y *= np.exp(-t / 0.035)
    return saturar(y / np.max(np.abs(y)), 1.2)


def madera(rng, fc=900.0, razon=1.41, indice=3.0, dur=0.2):
    """FM con índice que cae rápido: golpe de bloque de madera."""
    t = tiempo(dur)
    i = indice * np.exp(-t / 0.006)
    m = np.sin(fase(fc * razon, len(t)))
    x = np.sin(fase(fc, len(t)) + i * m) * envolvente_pop(t, 0.3, 4, 14)
    return x / np.max(np.abs(x))


def doble(rng):
    a = blip(rng, 650, 900, cuerpo_ms=8)
    b = blip(rng, 900, 1250, cuerpo_ms=8) * 0.8
    off = int(0.075 * SR)
    x = np.zeros(off + len(b))
    x[: len(a)] += a
    x[off:] += b
    return x


POPS = [
    ("pop-01-burbuja-media", "Burbuja media: tono que sube de 600 a 900 Hz, 25 ms. El pop de recuadro.",
     lambda r: blip(r, 600, 900)),
    ("pop-02-burbuja-aguda", "Burbuja aguda: 1,1 → 1,55 kHz, más chica. Para íconos o ítems de lista.",
     lambda r: blip(r, 1100, 1550, glide_ms=6, cuerpo_ms=8, caida_ms=5)),
    ("pop-03-gota-grave", "Gota grave: 340 → 620 Hz con más cuerpo. Para algo grande que aparece.",
     lambda r: blip(r, 340, 620, glide_ms=12, cuerpo_ms=16, caida_ms=10, parciales=((1, 1.0), (2, 0.15)))),
    ("pop-04-boop-bajada", "Boop que baja: 950 → 520 Hz. Para algo que se va o se cierra.",
     lambda r: blip(r, 950, 520, glide_ms=10, cuerpo_ms=12, caida_ms=8)),
    ("pop-05-tick-brillante", "Tick brillante: 2,2 kHz con armónico y click de ataque, 12 ms. Casi un click de UI.",
     lambda r: blip(r, 2000, 2300, glide_ms=3, cuerpo_ms=4, caida_ms=4, parciales=((1, 1.0), (2.01, 0.3)),
                    click=0.25)),
    ("pop-06-pluck", "Pluck: cuerda pulsada muy corta (Karplus-Strong) a 660 Hz.",
     lambda r: pluck(r, 660)),
    ("pop-07-madera", "Madera: golpe de bloque por FM, seco. Para marcas o checks.",
     lambda r: madera(r, 900)),
    ("pop-08-pop-con-aire", "Pop con aire: la burbuja media con una sala chica (cola ~0,3 s). Sólo en un hueco de voz.",
     lambda r: sala(blip(r, 600, 900), r, rt60=0.5, mezcla=0.3)),
    ("pop-09-doble", "Doble: dos pops a 75 ms, el segundo más agudo. Para un par de ítems o un «listo».",
     doble),
    ("pop-10-con-cuerpo", "Pop con cuerpo: burbuja de 480 → 820 Hz con un golpe grave abajo. Recuadro grande.",
     lambda r: blip(r, 480, 820, glide_ms=9, cuerpo_ms=12, caida_ms=8, golpe=0.7)),
]

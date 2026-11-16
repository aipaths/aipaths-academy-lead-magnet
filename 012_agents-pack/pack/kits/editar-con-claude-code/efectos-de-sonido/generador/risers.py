"""Risers que anticipan una frase y pegan en la palabra siguiente: terminan en el pico, sin cola.

Ninguno es un platillo al revés: son barridos de ruido
filtrado, tonos que suben, un Shepard, pulsos y ticks que aceleran."""

import numpy as np

from dsp import (SR, crecida, fase, filtro_variable, pasabajos, pasabanda, ruido_estereo, sala, saturar,
                 tiempo)


def _norm(x):
    return x / (np.max(np.abs(x)) + 1e-12)


def barrido_ruido(rng, dur, f_ini, f_fin, ancho_oct=1.2, pendiente=-3.0, piso_db=-34, curva=1.6,
                  resonancia=0.0):
    t = tiempo(dur)
    u = t / dur
    fc = f_ini * (f_fin / f_ini) ** (u**1.3)
    x = ruido_estereo(len(t), rng, pendiente, correlacion=0.55)
    y = filtro_variable(x, pasabanda(fc, ancho_oct, piso=0.03))
    if resonancia:
        y = _norm(y) + resonancia * _norm(filtro_variable(x, pasabanda(fc, 0.12)))
    return _norm(y) * crecida(t, dur, piso_db, curva)


def supersaw(rng, dur, f_ini, f_fin, voces=5, desafine=0.012, fc_ini=300, fc_fin=6500, piso_db=-30):
    """Sierras desafinadas de banda limitada (aditivas, sin aliasing) con un pasabajos que se abre."""
    t = tiempo(dur)
    u = t / dur
    f = f_ini * (f_fin / f_ini) ** (u**1.6)
    out = np.zeros((2, len(t)))
    for v in range(voces):
        d = 1 + desafine * (v - (voces - 1) / 2) / ((voces - 1) / 2)
        ph = fase(f * d) + rng.uniform(0, 2 * np.pi)
        s = np.zeros(len(t))
        for h in range(1, 120):
            lim = np.clip((9000 - h * f * d) / 1500, 0, 1)
            if not lim.any():
                break
            s += lim * np.sin(h * ph) / h
        pan = -0.8 + 1.6 * v / (voces - 1)
        out += np.stack([s * np.cos((pan + 1) * np.pi / 4), s * np.sin((pan + 1) * np.pi / 4)])
    fc = fc_ini * (fc_fin / fc_ini) ** u
    return _norm(filtro_variable(out, pasabajos(fc, 2))) * crecida(t, dur, piso_db)


def shepard(rng, dur, octavas=1.0, centro_hz=520, sigma_oct=1.4, piso_db=-30):
    """Glissando Shepard–Risset: parece que sube sin parar. Tensión sin ruido."""
    t = tiempo(dur)
    p = octavas * t / dur
    x = np.zeros(len(t))
    for k in range(-3, 6):
        f = centro_hz * 2.0 ** (k + p - 1)
        g = np.exp(-0.5 * (np.log2(f / centro_hz) / sigma_oct) ** 2)
        x += g * np.sin(fase(f))
    x = _norm(x) * crecida(t, dur, piso_db)
    retardado = np.concatenate([np.zeros(31), x[:-31]])  # ensancha sin traer el final al principio
    return sala(np.stack([x, retardado]), rng, rt60=0.6, mezcla=0.18)[:, : len(t)]


def pulsos(rng, dur, r_ini=4.0, r_fin=26.0, f_ini=200, f_fin=620, piso_db=-30):
    """Ruido filtrado y un tono, cortados por pulsos que aceleran: el redoble que avisa."""
    t = tiempo(dur)
    u = t / dur
    tasa = r_ini * (r_fin / r_ini) ** u
    puerta = (0.5 + 0.5 * np.cos(fase(tasa))) ** 3
    tono = np.sin(fase(f_ini * (f_fin / f_ini) ** u))
    ruido_f = barrido_ruido(rng, dur, 500, 4000, 1.0, piso_db=0)
    x = 0.6 * ruido_f + 0.5 * np.stack([tono, tono])
    return _norm(x * puerta) * crecida(t, dur, piso_db)


def sub(rng, dur, f_ini=42, f_fin=115, piso_db=-30):
    t = tiempo(dur)
    u = t / dur
    s = saturar(np.sin(fase(f_ini * (f_fin / f_ini) ** u)), 2.2)
    aire = barrido_ruido(rng, dur, 120, 900, 1.5, pendiente=-6, piso_db=0)
    return _norm(np.stack([s, s]) + 0.35 * aire) * crecida(t, dur, piso_db, curva=0.8)


def ruido_y_tono(rng, dur):
    t = tiempo(dur)
    u = t / dur
    vib = 1 + 0.012 * u * np.sin(fase(5 + 4 * u))
    tono = np.sin(fase(300 * 4.0 ** (u**1.4) * vib))
    r = barrido_ruido(rng, dur, 250, 5000, 1.3, piso_db=0)
    return _norm(0.7 * r + 0.45 * np.stack([tono, tono])) * crecida(t, dur, -32)


def acorde(rng, dur, notas=(130.81, 196.0, 261.63, 329.63), semitonos=2.0):
    """Acorde que crece y sube dos semitonos mientras se abre el filtro."""
    t = tiempo(dur)
    u = t / dur
    sube = 2 ** (semitonos * u**2 / 12)
    x = np.zeros((2, len(t)))
    for i, f0 in enumerate(notas):
        for d, lado in ((0.997, 0), (1.003, 1)):
            ph = fase(f0 * d * sube) + i
            x[lado] += np.sin(ph) + 0.3 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph)
    x = filtro_variable(x, pasabajos(400 * 12 ** u, 1.5))
    return _norm(x) * crecida(t, dur, -32, curva=0.9)


def ticks(rng, dur, r_ini=6.0, r_fin=32.0, f_ini=900, f_fin=2400):
    t = tiempo(dur)
    u = t / dur
    golpes = np.nonzero(np.diff(np.floor(np.cumsum(r_ini * (r_fin / r_ini) ** u) / SR)) > 0)[0]
    x = np.zeros(len(t))
    n = int(0.006 * SR)
    tt = np.arange(n) / SR
    for g in golpes:
        f = f_ini * (f_fin / f_ini) ** (g / len(t))
        m = min(n, len(t) - g)
        x[g: g + m] += (np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.0012))[:m]
    cama = barrido_ruido(rng, dur, 400, 3000, 1.0, piso_db=0)
    return _norm(np.stack([x, x]) + 0.25 * cama) * crecida(t, dur, -26)


RISERS = [
    ("riser-01-ruido-1s", "Barrido de ruido de 1 s: banda que sube de 300 Hz a 4 kHz. El más neutro y corto.",
     lambda r: barrido_ruido(r, 1.0, 300, 4000)),
    ("riser-02-viento-2s", "Viento que sube, 2 s: ruido grave que se abre de 120 Hz a 2 kHz.",
     lambda r: barrido_ruido(r, 2.0, 120, 2000, ancho_oct=1.8, pendiente=-5, curva=1.3)),
    ("riser-03-filtro-resonante-3s", "Filtro resonante, 3 s: ruido con un silbido de filtro que barre. Más electrónico.",
     lambda r: barrido_ruido(r, 3.0, 200, 5000, ancho_oct=1.0, resonancia=0.5, curva=1.2)),
    ("riser-04-supersaw-1-5s", "Supersaw, 1,5 s: cinco sierras desafinadas que suben dos octavas y se abren.",
     lambda r: supersaw(r, 1.5, 110, 440)),
    ("riser-05-shepard-3s", "Shepard, 3 s: tonos que parecen subir sin fin. Tensión limpia, sin ruido.",
     lambda r: shepard(r, 3.0)),
    ("riser-06-pulso-2s", "Pulso que acelera, 2 s: ruido y tono cortados por pulsos de 4 a 26 por segundo.",
     lambda r: pulsos(r, 2.0)),
    ("riser-07-sub-1-5s", "Sub que sube, 1,5 s: grave de 42 a 115 Hz con aire. Para parlantes grandes; en el celu se oye poco.",
     lambda r: sub(r, 1.5)),
    ("riser-08-ruido-y-tono-2-5s", "Ruido y tono, 2,5 s: barrido de ruido con un tono que sube dos octavas.",
     lambda r: ruido_y_tono(r, 2.5)),
    ("riser-09-acorde-2s", "Acorde que crece, 2 s: do mayor que se abre y sube dos semitonos. Antes de una revelación.",
     lambda r: acorde(r, 2.0)),
    ("riser-10-ticks-1-2s", "Ticks que aceleran, 1,2 s: clicks de 6 a 32 por segundo que suben de altura.",
     lambda r: ticks(r, 1.2)),
]

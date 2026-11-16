"""Whooshes: ruido que se acerca y se aleja. El filtro se abre cuando el objeto pasa cerca (pico),
el paneo cruza de un lado al otro y, en algunos, un tono grave baja de afinación (Doppler).

Calibrado contra whooshes de biblioteca que suenan bien debajo de una voz: casi toda la energía
por debajo de 150 Hz, crecida de ~0,15–0,3 s hasta el pico y una cola de ~0,4 s."""

import numpy as np

from dsp import (SR, campana, fase, filtro_variable, pasabajos, pasabanda, ruido, ruido_estereo, sala,
                 saturar, suavizar, tiempo)


def _rms(x):
    return np.sqrt(np.mean(x**2)) + 1e-12


def _paneo(x, t, pico, desde, hasta, ancho=0.12):
    p = desde + (hasta - desde) / (1 + np.exp(-(t - pico) / ancho))
    a = (p + 1) * np.pi / 4
    return np.stack([x[0] * np.cos(a), x[1] * np.sin(a)]) * np.sqrt(2)


def _peine(x, t, pico, d_min_ms=0.7, d_max_ms=5.0, g=0.75):
    """Filtro peine con retardo que barre: el «jet» de un flanger, tonal sin ser un tono."""
    d = (d_max_ms - (d_max_ms - d_min_ms) * np.exp(-((t - pico) / 0.25) ** 2)) * SR / 1000
    idx = np.arange(x.shape[1]) - d
    return np.stack([c + g * np.interp(idx, np.arange(len(c)), c, left=0) for c in x])


def whoosh(rng, dur, pico, subida, caida, f_lo=90, f_hi=450, pendiente=-6.0, aire=0.12, aire_hz=900,
           pan=(-0.6, 0.6), corr=0.7, sub=0.0, sub_hz=60, aleteo=0.0, peine=False, curva=2.0,
           rt60=0.35, mezcla=0.12, envolvente=None):
    t = tiempo(max(dur, pico + 7 * caida))  # la cola llega a −60 dB antes de terminar: sin corte seco
    n = len(t)
    env = campana(t, pico, subida, caida, curva) if envolvente is None else envolvente(t)
    env = env * np.minimum(1, (t[-1] - t) / 0.06)
    fc = f_lo * (f_hi / f_lo) ** env
    cuerpo = filtro_variable(ruido_estereo(n, rng, pendiente, corr), pasabajos(fc, 2))
    x = cuerpo / _rms(cuerpo)
    if aire:
        fa = aire_hz * (0.55 + 0.9 * env)
        a = filtro_variable(ruido_estereo(n, rng, -3.0, corr * 0.7), pasabanda(fa, 0.9))
        x = x + aire * a / _rms(a)
    if peine:
        x = _peine(x, t, pico)
    if aleteo:
        mod = suavizar(rng.standard_normal(n), 14)
        x = x * (1 + aleteo * mod / np.max(np.abs(mod)))
    x = x * env
    if sub:
        f = sub_hz * (1 + 0.22 * np.tanh(-(t - pico) / 0.09))
        s = np.sin(fase(f)) * campana(t, pico, subida * 0.8, caida * 1.3, curva)
        x = x + sub * s * np.max(np.abs(x))
    x = _paneo(x, t, pico, *pan)
    return sala(saturar(x / np.max(np.abs(x)), 1.2), rng, rt60=rt60, mezcla=mezcla, brillo_hz=4000)


def doble_pasada(t):
    return np.maximum(campana(t, 0.16, 0.1, 0.05), 0.85 * campana(t, 0.36, 0.12, 0.09))


WHOOSHES = [
    ("whoosh-01-suave-rapido", "Suave rápido: grave, crece 0,2 s hasta el pico y se va. El de los zooms y overlays.",
     lambda r: whoosh(r, 1.1, 0.32, 0.2, 0.11, f_lo=70, f_hi=300, aire=0.05)),
    ("whoosh-02-suave-medio", "Suave medio: igual de grave, más lento (pico a 0,5 s). Paneles que entran.",
     lambda r: whoosh(r, 1.5, 0.5, 0.32, 0.17, f_lo=60, f_hi=280, aire=0.05)),
    ("whoosh-03-suave-lento", "Suave lento: crece 0,45 s, cola larga. Para un movimiento de cámara amplio.",
     lambda r: whoosh(r, 2.0, 0.66, 0.45, 0.25, f_lo=55, f_hi=260, aire=0.045, rt60=0.5)),
    ("whoosh-04-deslizar-pantalla", "Deslizar pantalla: más textura media y paneo marcado. Corte duro de sección.",
     lambda r: whoosh(r, 0.8, 0.34, 0.2, 0.08, f_lo=90, f_hi=500, aire=0.12, aire_hz=1100, pan=(-0.85, 0.85),
                      corr=0.45, aleteo=0.25)),
    ("whoosh-05-deslizar-corto", "Deslizar corto: 0,25 s de punta a punta. Un elemento chico que se corre.",
     lambda r: whoosh(r, 0.5, 0.16, 0.1, 0.05, f_lo=100, f_hi=600, aire=0.12, aire_hz=1200, pan=(-0.7, 0.7))),
    ("whoosh-06-seco-agudo", "Seco agudo: ruido medio-agudo y corto, como una vara. Ojo: los agudos y secos suelen chocar con la voz.",
     lambda r: whoosh(r, 0.45, 0.12, 0.07, 0.05, f_lo=500, f_hi=3200, pendiente=-1.5, aire=0.3, aire_hz=2200,
                      pan=(-0.5, 0.5), corr=0.6)),
    ("whoosh-07-titulo-con-sub", "Título con sub: grave con un tono de 60 Hz que baja al pasar. Título que sube y se asienta.",
     lambda r: whoosh(r, 1.7, 0.45, 0.3, 0.2, f_lo=60, f_hi=320, aire=0.06, sub=0.6, sub_hz=62, pan=(-0.3, 0.3))),
    ("whoosh-08-tela-doble", "Tela, doble pasada: dos soplidos seguidos con textura de tela. Algo que se despliega.",
     lambda r: whoosh(r, 0.9, 0.36, 0.1, 0.1, f_lo=100, f_hi=550, aire=0.15, aleteo=0.45, pan=(-0.5, 0.6),
                      envolvente=doble_pasada)),
    ("whoosh-09-entrada", "Entrada: crece 0,45 s y frena seco en el pico. Para algo que llega y se clava.",
     lambda r: whoosh(r, 0.75, 0.5, 0.45, 0.035, f_lo=80, f_hi=600, curva=3.0, aire=0.1, pan=(-0.8, 0.0),
                      rt60=0.3, mezcla=0.1)),
    ("whoosh-10-jet-peine", "Jet: ruido por un filtro peine que barre, con color tonal. Zoom o paso rápido con más carácter.",
     lambda r: whoosh(r, 1.3, 0.45, 0.3, 0.15, f_lo=150, f_hi=1500, pendiente=-3.0, aire=0.0, peine=True,
                      pan=(-0.7, 0.7))),
]

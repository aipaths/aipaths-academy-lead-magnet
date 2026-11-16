"""Bloques de síntesis: ruido de color, filtros que cambian en el tiempo, envolventes, paneo, sala y salida.

Todo es numpy/scipy: ningún sample, modelo ni archivo de afuera entra en el sonido.
"""

import wave

import numpy as np
from scipy.signal import butter, fftconvolve, istft, sosfilt, stft

SR = 48000
NFFT, HOP = 1024, 128


def tiempo(dur: float) -> np.ndarray:
    return np.arange(int(round(dur * SR))) / SR


def fase(freq: np.ndarray | float, n: int | None = None) -> np.ndarray:
    """Fase acumulada de una frecuencia que cambia muestra a muestra (glissando sin saltos)."""
    f = np.broadcast_to(np.asarray(freq, float), (n,) if n else np.shape(freq))
    return 2 * np.pi * np.cumsum(f) / SR


def ruido(n: int, rng: np.random.Generator, pendiente_db_oct: float = 0.0) -> np.ndarray:
    """Ruido blanco (0), rosa (−3) o marrón (−6 dB por octava), normalizado a RMS 1."""
    espectro = np.fft.rfft(rng.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    f[0] = f[1]
    espectro *= (f / 1000.0) ** (pendiente_db_oct / 6.0206)
    x = np.fft.irfft(espectro, n)
    return x / (np.sqrt(np.mean(x**2)) + 1e-12)


def ruido_estereo(n, rng, pendiente_db_oct=0.0, correlacion=0.7) -> np.ndarray:
    """Dos canales de ruido con la correlación pedida (1 = mono, 0 = independientes)."""
    comun = ruido(n, rng, pendiente_db_oct)
    a, b = ruido(n, rng, pendiente_db_oct), ruido(n, rng, pendiente_db_oct)
    k = np.sqrt(max(0.0, correlacion))
    m = np.sqrt(1 - k**2)
    return np.stack([k * comun + m * a, k * comun + m * b])


def filtro_variable(x: np.ndarray, mascara) -> np.ndarray:
    """Filtra x (mono o estéreo) con una máscara de frecuencia que cambia en el tiempo.

    `mascara(f, k)` recibe las frecuencias (columna) y el índice de muestra de cada cuadro
    (fila) y devuelve la ganancia lineal. Se aplica por STFT con ventanas solapadas.
    """
    canales = np.atleast_2d(x)
    n = canales.shape[1]
    out = []
    for c in canales:
        f, _, z = stft(c, SR, nperseg=NFFT, noverlap=NFFT - HOP, boundary="even")
        k = np.clip(np.arange(z.shape[1]) * HOP, 0, n - 1)
        z *= mascara(f[:, None], k[None, :])
        _, y = istft(z, SR, nperseg=NFFT, noverlap=NFFT - HOP)
        out.append(np.pad(y, (0, max(0, n - len(y))))[:n])
    y = np.array(out)
    return y[0] if np.ndim(x) == 1 else y


def pasabajos(fc: np.ndarray, orden: float = 2.0):
    return lambda f, k: 1.0 / np.sqrt(1.0 + (f / fc[k]) ** (2 * orden))


def pasabanda(fc: np.ndarray, ancho_oct: float = 1.0, piso: float = 0.0):
    def m(f, k):
        d = np.log2(np.maximum(f, 1.0) / fc[k]) / ancho_oct
        return piso + (1 - piso) * np.exp(-0.5 * d**2)

    return m


def pasaaltos_fijo(x: np.ndarray, fc: float, orden: int = 2) -> np.ndarray:
    sos = butter(orden, fc, "highpass", fs=SR, output="sos")
    return sosfilt(sos, x, axis=-1)


def pasabajos_fijo(x: np.ndarray, fc: float, orden: int = 2) -> np.ndarray:
    sos = butter(orden, fc, "lowpass", fs=SR, output="sos")
    return sosfilt(sos, x, axis=-1)


def campana(t: np.ndarray, pico: float, subida: float, caida: float, curva: float = 2.0) -> np.ndarray:
    """Sube de 0 a 1 en `subida` segundos hasta `pico` y cae exponencial con constante `caida`."""
    ini = pico - subida
    sube = np.clip((t - ini) / subida, 0, 1) ** curva
    sube = 0.5 - 0.5 * np.cos(np.pi * sube)
    baja = np.exp(-np.maximum(t - pico, 0) / caida)
    return np.where(t <= pico, sube, baja)


def crecida(t: np.ndarray, dur: float, piso_db: float = -36.0, curva: float = 1.6) -> np.ndarray:
    """Envolvente de riser: sube en dB de `piso_db` a 0 dB justo en el final (pico limpio)."""
    u = np.clip(t / dur, 0, 1) ** curva
    # Remate: +4 dB en los últimos 60 ms, para que el pico caiga en el final y no antes.
    remate = np.clip((t - (dur - 0.06)) / 0.06, 0, 1) ** 2 * 4.0
    return 10 ** ((piso_db * (1 - u) + remate) / 20)


def suavizar(x: np.ndarray, ms: float) -> np.ndarray:
    n = max(1, int(SR * ms / 1000))
    v = np.hanning(n + 2)[1:-1]
    return np.convolve(x, v / v.sum(), mode="same")


def panear(mono: np.ndarray, pan: np.ndarray | float) -> np.ndarray:
    """Paneo de potencia constante: −1 izquierda, 0 centro, +1 derecha."""
    p = (np.asarray(pan, float) + 1) * np.pi / 4
    return np.stack([mono * np.cos(p), mono * np.sin(p)])


def estereo(x: np.ndarray) -> np.ndarray:
    return np.stack([x, x]) if np.ndim(x) == 1 else x


def sala(x: np.ndarray, rng, rt60: float = 0.4, mezcla: float = 0.15, brillo_hz: float = 6000) -> np.ndarray:
    """Reverb sintética: ruido estéreo con caída exponencial (no es un impulso grabado)."""
    x = estereo(x)
    t = tiempo(rt60 * 1.2)
    ir = ruido_estereo(len(t), rng, -1.5, correlacion=0.1) * np.exp(-6.91 * t / rt60)
    ir = pasabajos_fijo(ir, brillo_hz)
    ir[:, : int(0.008 * SR)] = 0
    ir /= np.sqrt(np.sum(ir**2, axis=1, keepdims=True)) + 1e-12
    cola = np.zeros((2, x.shape[1] + ir.shape[1] - 1))
    for c in range(2):
        cola[c] = fftconvolve(x[c], ir[c])
    seco = np.pad(x, ((0, 0), (0, cola.shape[1] - x.shape[1])))
    return seco * (1 - mezcla) + cola * mezcla * 1.4


def saturar(x: np.ndarray, empuje: float = 1.5) -> np.ndarray:
    return np.tanh(empuje * x) / np.tanh(empuje)


def terminar(x: np.ndarray, pico_db: float = -1.0, entrada_ms: float = 0.4, salida_ms: float = 30.0,
             pasaaltos_hz: float = 28.0, recortar_db: float = -66.0) -> np.ndarray:
    """Limpia DC, recorta la cola inaudible, aplica fundidos y normaliza el pico."""
    x = pasaaltos_fijo(estereo(np.asarray(x, float)), pasaaltos_hz)
    env = np.max(np.abs(x), axis=0)
    vivos = np.nonzero(env > env.max() * 10 ** (recortar_db / 20))[0]
    x = x[:, : vivos[-1] + 1]
    n_in, n_out = int(SR * entrada_ms / 1000), int(SR * salida_ms / 1000)
    if n_in:
        x[:, :n_in] *= np.sin(np.linspace(0, np.pi / 2, n_in)) ** 2
    if n_out:
        x[:, -n_out:] *= np.cos(np.linspace(0, np.pi / 2, n_out)) ** 2
    return x * (10 ** (pico_db / 20) / np.max(np.abs(x)))


def escribir_wav(ruta: str, x: np.ndarray, rng: np.random.Generator) -> None:
    """WAV PCM de 24 bits, 48 kHz, estéreo, con dither triangular."""
    x = estereo(x).T
    escala = 2**23 - 1
    d = (rng.random(x.shape) - rng.random(x.shape))
    q = np.clip(np.round(x * escala + d), -escala - 1, escala).astype("<i4")
    datos = q.reshape(-1).view(np.uint8).reshape(-1, 4)[:, :3].tobytes()
    with wave.open(ruta, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(3)
        w.setframerate(SR)
        w.writeframes(datos)


def forma(x: np.ndarray, puntos: int = 160) -> list[float]:
    """Envolvente en dB (0 = pico, piso −48) para dibujar la forma en la página."""
    m = np.max(np.abs(estereo(x)), axis=0)
    trozos = np.array_split(m, puntos)
    v = np.array([c.max() if len(c) else 0 for c in trozos]) / (m.max() + 1e-12)
    return [round(float(max(-48.0, 20 * np.log10(a + 1e-9))), 1) for a in v]

"""Mide los 30 WAV de wav/ y escribe mediciones.csv (una fila por efecto).

  uv run -q --with numpy python -I medir-csv.py

Definiciones: arranque = s hasta −20 dB del pico, pico = instante de la muestra más
alta, fin = último instante a −20 dB del pico, nivel = RMS (dBFS) de los 400 ms más fuertes.
Se decodifica con ffmpeg a mono (promedio de canales) a la frecuencia propia del archivo.
"""
import subprocess
from pathlib import Path

import numpy as np

AQUI = Path(__file__).resolve().parent


def leer(p: Path):
    info = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries",
                           "stream=sample_rate,channels", "-of", "csv=p=0", str(p)],
                          capture_output=True, text=True, check=True).stdout.strip().split(",")
    sr, ch = int(info[0]), int(info[1])
    raw = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", str(p), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype="<f4").reshape(-1, ch).mean(axis=1)
    return x, sr


def medir(p: Path):
    x, sr = leer(p)
    a = np.abs(x)
    pico_muestra = a.max()
    pico_t = a.argmax() / sr
    umbral = pico_muestra * 0.1  # −20 dB
    idx = np.nonzero(a >= umbral)[0]
    arranque, fin = idx[0] / sr, idx[-1] / sr
    w = int(sr * 0.4)
    if len(x) <= w:
        nivel = np.sqrt((x ** 2).mean())
    else:
        c = np.concatenate([[0], np.cumsum(x ** 2)])
        nivel = np.sqrt(((c[w:] - c[:-w]) / w).max())
    db = lambda v_: 20 * np.log10(max(v_, 1e-9))
    return len(x) / sr, arranque, pico_t, fin, db(pico_muestra), db(nivel)


def main():
    filas = ["archivo,tipo,duracion_s,arranque_s,pico_s,fin_s,pico_dbfs,nivel_dbfs"]
    for p in sorted((AQUI / "wav").glob("*.wav")):
        d, ar, pi, fi, pk, nv = medir(p)
        filas.append(f"{p.name},{p.name.split('-')[0]},{d:.3f},{ar:.3f},{pi:.3f},{fi:.3f},{pk:.1f},{nv:.1f}")
    (AQUI / "mediciones.csv").write_text("\n".join(filas) + "\n", encoding="utf-8")
    print(len(filas) - 1, "filas")


main()

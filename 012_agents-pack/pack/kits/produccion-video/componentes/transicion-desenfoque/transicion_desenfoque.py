"""Transición con desenfoque rápido centrada en un corte.

Toma el tramo [centro - mitad, centro + mitad] de un video y lo desenfoca con una curva suave: nítido en los
bordes, máximo desenfoque justo en el corte. Así el salto entre las dos tomas queda escondido en el pico.

Uso:
  uv run --with numpy --with opencv-python-headless python transicion_desenfoque.py \
      video.mp4 --centro 12.4 --mitad 0.25 -o tramo.mp4           # sólo el tramo (para pegarlo en tu editor)
  uv run --with numpy --with opencv-python-headless python transicion_desenfoque.py \
      video.mp4 --centro 12.4 --mitad 0.25 --pegar -o final.mp4   # el video entero con el tramo ya pegado
"""

import argparse
import os
import subprocess

import cv2
import numpy as np


def leer_video(ruta):
    """Ancho, alto y cuadros por segundo del primer stream de video."""
    salida = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
         "stream=width,height,r_frame_rate", "-of", "csv=p=0", ruta],
        capture_output=True, text=True, check=True,
    ).stdout.strip().split(",")
    num, den = salida[2].split("/")
    return int(salida[0]), int(salida[1]), float(num) / float(den)


def desenfocar_tramo(entrada, salida, centro, mitad, fuerza):
    """Escribe el tramo desenfocado (sin audio) y devuelve en qué segundo empieza."""
    ancho, alto, fps = leer_video(entrada)
    primero = int(round((centro - mitad) * fps))  # el tramo arranca justo en un cuadro
    cuadros = int(round(2 * mitad * fps))
    desde = primero / fps
    lector = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-ss", f"{(primero - 0.25) / fps:.4f}", "-i", entrada, "-frames:v", str(cuadros),
         "-f", "rawvideo", "-pix_fmt", "bgr24", "-"],
        stdout=subprocess.PIPE,
    )
    escritor = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{ancho}x{alto}",
         "-r", f"{fps:.6f}", "-i", "-", "-c:v", "libx264", "-crf", "14", "-pix_fmt", "yuv420p", salida],
        stdin=subprocess.PIPE,
    )
    sigma_max = fuerza * ancho  # desenfoque máximo, proporcional al ancho del cuadro
    escritos = 0
    for k in range(cuadros):
        datos = lector.stdout.read(ancho * alto * 3)
        if len(datos) < ancho * alto * 3:
            break  # el video terminó antes
        cuadro = np.frombuffer(datos, np.uint8).reshape(alto, ancho, 3)
        t = (primero + k + 0.5) / fps - centro  # segundos respecto del corte
        p = max(0.0, 1 - abs(t) / mitad)  # 1 en el corte, 0 en los bordes
        sigma = sigma_max * np.sin(p * np.pi / 2) ** 2  # entra y sale suave
        if sigma > 0.3:
            cuadro = cv2.GaussianBlur(cuadro, (0, 0), sigma)
        escritor.stdin.write(np.ascontiguousarray(cuadro).tobytes())
        escritos += 1
    escritor.stdin.close()
    escritor.wait()
    lector.wait()
    return desde, desde + escritos / fps


def pegar(original, tramo, desde, hasta, salida):
    """Pone el tramo encima del video original en su lugar; el audio queda intacto."""
    filtro = (f"[1:v]setpts=PTS-STARTPTS+{desde:.4f}/TB[t];"
              f"[0:v][t]overlay=eof_action=pass:enable='between(t,{desde:.4f},{hasta - 0.001:.4f})'[v]")
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", original, "-i", tramo, "-filter_complex", filtro,
         "-map", "[v]", "-map", "0:a?", "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p",
         "-c:a", "copy", salida],
        check=True,
    )


def main():
    ap = argparse.ArgumentParser(description="Transición con desenfoque rápido centrada en un corte.")
    ap.add_argument("entrada", help="el video ya cortado (las dos tomas pegadas)")
    ap.add_argument("--centro", type=float, required=True, help="segundo exacto del corte")
    ap.add_argument("--mitad", type=float, default=0.25,
                    help="segundos antes y después del corte que dura la transición (0.25 = medio segundo en total)")
    ap.add_argument("--fuerza", type=float, default=0.012,
                    help="desenfoque máximo como fracción del ancho (0.012 ≈ 23 px en 1920)")
    ap.add_argument("--pegar", action="store_true", help="devolver el video entero con la transición puesta")
    ap.add_argument("-o", "--salida", default="transicion.mp4")
    args = ap.parse_args()

    if not args.pegar:
        desde, hasta = desenfocar_tramo(args.entrada, args.salida, args.centro, args.mitad, args.fuerza)
        print(f"listo: {args.salida} (va de {desde:.3f} a {hasta:.3f} s del video)")
        return
    tramo = args.salida + ".tramo.mp4"
    desde, hasta = desenfocar_tramo(args.entrada, tramo, args.centro, args.mitad, args.fuerza)
    pegar(args.entrada, tramo, desde, hasta, args.salida)
    os.remove(tramo)
    print(f"listo: {args.salida} (transición entre {desde:.3f} y {hasta:.3f} s)")


if __name__ == "__main__":
    main()

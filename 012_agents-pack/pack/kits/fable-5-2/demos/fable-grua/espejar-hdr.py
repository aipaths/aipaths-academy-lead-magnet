"""Espeja de izquierda a derecha un .hdr (Radiance RGBE). Sin dependencias: lo usa bajar-assets.sh
cuando no hay ffmpeg. Uso: python3 espejar-hdr.py entrada.hdr salida.hdr"""
import sys

def leer(ruta):
    datos = open(ruta, 'rb').read()
    fin = datos.index(b'\n\n') + 2
    linea = datos.index(b'\n', fin)
    _, alto, _, ancho = datos[fin:linea].split()
    return datos[:linea + 1], int(ancho), int(alto), datos[linea + 1:]

def renglon(d, i, ancho):
    """Devuelve (pixeles RGBE del renglón, posición siguiente). Soporta RLE nuevo y plano."""
    if d[i] == 2 and d[i + 1] == 2 and (d[i + 2] << 8 | d[i + 3]) == ancho:
        i += 4
        canales = []
        for _ in range(4):
            c = bytearray()
            while len(c) < ancho:
                n = d[i]; i += 1
                if n > 128:
                    c += bytes([d[i]]) * (n - 128); i += 1
                else:
                    c += d[i:i + n]; i += n
            canales.append(c)
        px = bytearray(ancho * 4)
        for k in range(4):
            px[k::4] = canales[k]
        return px, i
    return bytearray(d[i:i + ancho * 4]), i + ancho * 4

def main(entrada, salida):
    cabecera, ancho, alto, d = leer(entrada)
    out, i = bytearray(), 0
    for _ in range(alto):
        px, i = renglon(d, i, ancho)
        for x in range(ancho - 1, -1, -1):
            out += px[x * 4:x * 4 + 4]
    open(salida, 'wb').write(cabecera + out)

if __name__ == '__main__':
    main(*sys.argv[1:3])

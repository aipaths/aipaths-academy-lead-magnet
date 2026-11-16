# /// script
# requires-python = ">=3.11"
# dependencies = ["numpy>=2.0", "scipy>=1.13"]
# ///
"""Genera los 30 efectos (10 pops, 10 whooshes, 10 risers) desde cero, con semilla fija.

    uv run generar.py            # escribe wav/*.wav y catalogo.json
    uv run -q --with numpy python -I medir-csv.py   # mide cada WAV y escribe mediciones.csv

Mismo código + misma semilla = mismos archivos, bit a bit.
"""

import json
import pathlib
import zlib

import numpy as np

from dsp import escribir_wav, forma, terminar
from pops import POPS
from risers import RISERS
from whooshes import WHOOSHES

SEMILLA = 20261115
AQUI = pathlib.Path(__file__).parent
SALIDA = AQUI / "wav"

# Por tipo: fundido de salida y piso de recorte. Los risers terminan en el pico: fundido de 6 ms.
CIERRE = {"pop": (8.0, -60.0), "whoosh": (40.0, -60.0), "riser": (6.0, -90.0)}


def generar() -> list[dict]:
    SALIDA.mkdir(exist_ok=True)
    catalogo = []
    for tipo, lista in (("pop", POPS), ("whoosh", WHOOSHES), ("riser", RISERS)):
        salida_ms, piso = CIERRE[tipo]
        for nombre, descripcion, hacer in lista:
            rng = np.random.default_rng([SEMILLA, zlib.crc32(nombre.encode())])
            x = terminar(hacer(rng), salida_ms=salida_ms, recortar_db=piso)
            escribir_wav(str(SALIDA / f"{nombre}.wav"), x, rng)
            catalogo.append({"nombre": nombre, "tipo": tipo, "descripcion": descripcion, "forma": forma(x)})
            print(f"{nombre:34s} {x.shape[1] / 48000:5.2f} s")
    return catalogo


if __name__ == "__main__":
    datos = {"semilla": SEMILLA, "efectos": generar()}
    (AQUI / "catalogo.json").write_text(json.dumps(datos, ensure_ascii=False, indent=1) + "\n")

#!/usr/bin/env bash
# Baja de Poly Haven (polyhaven.com, licencia CC0) las texturas y el cielo que usa esta demo
# y los deja en assets/ con los nombres que espera el código. Se corre una sola vez:
#   bash bajar-assets.sh
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p assets
B=https://dl.polyhaven.org/file/ph-assets

# bajar <ruta en Poly Haven> <nombre en assets/>
bajar() {
  if [ -s "assets/$2" ]; then echo "ya está: $2"; return; fi
  echo "bajando: $2"
  curl -fsSL --retry 3 -o "assets/$2.part" "$B/$1"
  mv "assets/$2.part" "assets/$2"
}

bajar Textures/jpg/2k/wood_table_001/wood_table_001_diff_2k.jpg   wood_diff_2k.jpg
bajar Textures/jpg/2k/wood_table_001/wood_table_001_nor_gl_2k.jpg wood_nor_2k.jpg
bajar Textures/jpg/2k/wood_table_001/wood_table_001_rough_2k.jpg  wood_rough_2k.jpg
bajar HDRIs/hdr/2k/brown_photostudio_02_2k.hdr                    brown_photostudio_02_2k.hdr

echo "Listo. Serví la carpeta con: python3 -m http.server 8800  y abrí http://localhost:8800"

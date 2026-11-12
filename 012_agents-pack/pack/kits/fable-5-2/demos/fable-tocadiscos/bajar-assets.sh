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

bajar Textures/jpg/2k/oak_veneer_01/oak_veneer_01_diff_2k.jpg     oak_veneer_01_diff_2k.jpg
bajar Textures/jpg/2k/oak_veneer_01/oak_veneer_01_nor_gl_2k.jpg   oak_veneer_01_nor_gl_2k.jpg
bajar Textures/jpg/2k/oak_veneer_01/oak_veneer_01_rough_2k.jpg    oak_veneer_01_rough_2k.jpg
bajar HDRIs/hdr/1k/photo_studio_loft_hall_1k.hdr                  photo_studio_loft_hall_1k.hdr

echo "Listo. Serví la carpeta con: python3 -m http.server 8800  y abrí http://localhost:8800"

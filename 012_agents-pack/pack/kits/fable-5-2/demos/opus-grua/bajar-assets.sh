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

bajar Textures/jpg/1k/brown_mud_02/brown_mud_02_ao_1k.jpg brown_mud_02_ao_1k.jpg
bajar Textures/jpg/1k/brown_mud_02/brown_mud_02_diff_1k.jpg brown_mud_02_diff_1k.jpg
bajar Textures/jpg/1k/brown_mud_02/brown_mud_02_rough_1k.jpg brown_mud_02_rough_1k.jpg
bajar Textures/jpg/1k/brown_mud_02/brown_mud_02_nor_gl_1k.jpg brown_mud_02_nor_1k.jpg
bajar Textures/jpg/1k/dry_ground_01/dry_ground_01_ao_1k.jpg dry_ground_01_ao_1k.jpg
bajar Textures/jpg/1k/dry_ground_01/dry_ground_01_diff_1k.jpg dry_ground_01_diff_1k.jpg
bajar Textures/jpg/1k/dry_ground_01/dry_ground_01_rough_1k.jpg dry_ground_01_rough_1k.jpg
bajar Textures/jpg/1k/dry_ground_01/dry_ground_01_nor_gl_1k.jpg dry_ground_01_nor_1k.jpg
bajar Textures/jpg/1k/metal_plate/metal_plate_ao_1k.jpg metal_plate_ao_1k.jpg
bajar Textures/jpg/1k/metal_plate/metal_plate_diff_1k.jpg metal_plate_diff_1k.jpg
bajar Textures/jpg/1k/metal_plate/metal_plate_rough_1k.jpg metal_plate_rough_1k.jpg
bajar Textures/jpg/1k/metal_plate/metal_plate_nor_gl_1k.jpg metal_plate_nor_1k.jpg
bajar Textures/jpg/1k/rusty_metal_02/rusty_metal_02_ao_1k.jpg rusty_metal_02_ao_1k.jpg
bajar Textures/jpg/1k/rusty_metal_02/rusty_metal_02_diff_1k.jpg rusty_metal_02_diff_1k.jpg
bajar Textures/jpg/1k/rusty_metal_02/rusty_metal_02_rough_1k.jpg rusty_metal_02_rough_1k.jpg
bajar Textures/jpg/1k/rusty_metal_02/rusty_metal_02_nor_gl_1k.jpg rusty_metal_02_nor_1k.jpg
bajar HDRIs/hdr/1k/kloofendal_48d_partly_cloudy_puresky_1k.hdr kloofendal_48d_partly_cloudy_puresky_1k.hdr

echo "Listo. Serví la carpeta con: python3 -m http.server 8800  y abrí http://localhost:8800"

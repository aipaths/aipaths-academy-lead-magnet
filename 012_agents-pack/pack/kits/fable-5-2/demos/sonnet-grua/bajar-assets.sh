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

bajar Textures/jpg/2k/brown_mud_dry/brown_mud_dry_diff_2k.jpg                      brown_mud_dry_Diffuse.jpg
bajar Textures/jpg/2k/brown_mud_dry/brown_mud_dry_rough_2k.jpg                     brown_mud_dry_Rough.jpg
bajar Textures/jpg/2k/brown_mud_dry/brown_mud_dry_nor_gl_2k.jpg                    brown_mud_dry_nor_gl.jpg
bajar Textures/jpg/1k/gravel_embedded_concrete/gravel_embedded_concrete_diff_1k.jpg   gravel_embedded_concrete_Diffuse.jpg
bajar Textures/jpg/1k/gravel_embedded_concrete/gravel_embedded_concrete_rough_1k.jpg  gravel_embedded_concrete_Rough.jpg
bajar Textures/jpg/1k/gravel_embedded_concrete/gravel_embedded_concrete_nor_gl_1k.jpg gravel_embedded_concrete_nor_gl.jpg
bajar Textures/jpg/1k/rust_coarse_01/rust_coarse_01_diff_1k.jpg                    rust_coarse_01_Diffuse.jpg
bajar Textures/jpg/1k/rust_coarse_01/rust_coarse_01_rough_1k.jpg                   rust_coarse_01_Rough.jpg
bajar Textures/jpg/1k/rust_coarse_01/rust_coarse_01_nor_gl_1k.jpg                  rust_coarse_01_nor_gl.jpg
bajar HDRIs/hdr/1k/kloofendal_48d_partly_cloudy_puresky_1k.hdr                     sky_1k.hdr

echo "Listo. Serví la carpeta con: python3 -m http.server 8800  y abrí http://localhost:8800"

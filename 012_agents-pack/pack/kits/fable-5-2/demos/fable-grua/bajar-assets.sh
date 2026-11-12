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

bajar Textures/jpg/2k/dry_mud_field_001/dry_mud_field_001_diff_2k.jpg       dry_mud_field_001_Diffuse.jpg
bajar Textures/jpg/2k/brown_mud_rocks_01/brown_mud_rocks_01_diff_2k.jpg     brown_mud_rocks_01_Diffuse.jpg
bajar Textures/jpg/2k/brown_mud_rocks_01/brown_mud_rocks_01_nor_gl_2k.jpg   brown_mud_rocks_01_nor_gl.jpg

# El cielo es "Dry Cracked Lake" espejado de izquierda a derecha: así el sol cae donde lo
# calculó la escena (js/medidas.js). El fondo es el JPG ya tonemapeado, achicado a 4096 px.
if [ ! -s assets/cielo_1k.hdr ] || [ ! -s assets/cielo_fondo.jpg ]; then
  bajar HDRIs/hdr/1k/dry_cracked_lake_1k.hdr                    cielo_original_1k.hdr
  bajar "HDRIs/extra/Tonemapped%20JPG/dry_cracked_lake.jpg"     cielo_original.jpg
  if command -v ffmpeg >/dev/null; then
    ffmpeg -v error -y -i assets/cielo_original_1k.hdr -vf hflip assets/cielo_1k.hdr
    ffmpeg -v error -y -i assets/cielo_original.jpg -vf "scale=4096:-2,hflip" -q:v 2 assets/cielo_fondo.jpg
  elif command -v sips >/dev/null && command -v python3 >/dev/null; then   # macOS sin ffmpeg
    python3 espejar-hdr.py assets/cielo_original_1k.hdr assets/cielo_1k.hdr
    sips -Z 4096 -f horizontal -s formatOptions 85 assets/cielo_original.jpg --out assets/cielo_fondo.jpg >/dev/null
  else
    echo "Para espejar el cielo hace falta ffmpeg (o sips y python3 en macOS). Instalalo y volvé a correr el script." >&2; exit 1
  fi
  rm -f assets/cielo_original_1k.hdr assets/cielo_original.jpg
fi

echo "Listo. Serví la carpeta con: python3 -m http.server 8800  y abrí http://localhost:8800"

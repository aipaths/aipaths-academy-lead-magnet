#!/usr/bin/env bash
# Copia los efectos de sonido que usa la intro desde la librería de la skill media-use
# (viene con las skills de HyperFrames). No van en el pack porque su licencia (Pixabay)
# no permite redistribuir los archivos sueltos.
# Uso: bash scripts/traer-sfx.sh
set -euo pipefail

LIB=""
for d in "$HOME/.agents/skills/media-use" "$HOME/.claude/skills/media-use"; do
  [ -d "$d/audio/assets/sfx" ] && LIB="$d/audio/assets/sfx" && break
done
if [ -z "$LIB" ]; then
  echo "No encontré la skill media-use. Instalá las skills de HyperFrames:" >&2
  echo "  npx skills add heygen-com/hyperframes --all" >&2
  exit 1
fi

mkdir -p .media/audio/sfx
while read -r id file; do
  cp "$LIB/$file" ".media/audio/sfx/$id.mp3"
done <<'MAP'
sfx_001 whoosh-short.mp3
sfx_002 typing.mp3
sfx_003 click-soft.mp3
sfx_004 click-soft.mp3
sfx_005 pop.mp3
sfx_006 ping.mp3
sfx_007 impact-bass-1.mp3
sfx_008 whoosh-cinematic.mp3
sfx_009 sparkle.mp3
sfx_010 key-press.mp3
MAP
echo "SFX listos en .media/audio/sfx"

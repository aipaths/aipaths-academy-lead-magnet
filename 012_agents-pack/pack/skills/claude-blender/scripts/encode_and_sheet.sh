#!/usr/bin/env bash
# Encode a PNG frame sequence to MP4 and build a 6-frame contact sheet to check it.
#
# Usage:
#   encode_and_sheet.sh <frames_dir> <prefix> <fps> <out.mp4> [audio_source]
#   e.g. encode_and_sheet.sh /tmp/frames f_ 24 renders/intro.mp4
#
# The sheet is written next to the MP4 as <out>_sheet.jpg (read it before sending).
set -euo pipefail

frames_dir="$1"; prefix="$2"; fps="$3"; out="$4"; audio="${5:-}"

if [[ -n "$audio" ]]; then
  ffmpeg -y -loglevel error -framerate "$fps" -i "$frames_dir/${prefix}%04d.png" -i "$audio" \
    -map 0:v -map "1:a?" -c:v libx264 -pix_fmt yuv420p -crf 17 -c:a aac -shortest "$out"
else
  ffmpeg -y -loglevel error -framerate "$fps" -i "$frames_dir/${prefix}%04d.png" \
    -c:v libx264 -pix_fmt yuv420p -crf 18 "$out"
fi

total=$(ffprobe -v error -count_frames -select_streams v:0 \
  -show_entries stream=nb_read_frames -of csv=p=0 "$out")
step=$(( total / 6 ))
sel=""
for i in 0 1 2 3 4 5; do
  sel="${sel}eq(n\\,$(( i * step )))+"
done
sel="${sel%+}"

ffmpeg -y -loglevel error -i "$out" \
  -vf "select='${sel}',scale=480:-1,tile=6x1" -frames:v 1 -fps_mode vfr "${out%.*}_sheet.jpg"

echo "video: $out ($total frames)"
echo "sheet: ${out%.*}_sheet.jpg"

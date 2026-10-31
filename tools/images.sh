#!/bin/sh
# Makes 480/800/1200 px JPEG variants of every photo in img/ into img/w/. Rerun after adding or replacing a photo.
set -e
mkdir -p img/w
for f in img/*.jpg; do
  n=$(basename "$f" .jpg)
  [ "$n" = og ] && continue  # social preview, never shown on the page
  w=$(sips -g pixelWidth "$f" | awk '/pixelWidth/{print $2}')
  for size in 480 800 1200; do
    [ "$size" -gt "$w" ] && size=$w
    sips --resampleWidth $size -s formatOptions 60 "$f" --out "img/w/$n-$size.jpg" >/dev/null
  done
done
ls img/w | wc -l | xargs echo "variants:"

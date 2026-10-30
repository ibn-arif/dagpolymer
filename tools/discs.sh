#!/bin/sh
# Measures every round photo on every page at desktop and phone width; fails if any is not a circle.
C="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
bad=0
for p in index.html products/index.html production/index.html ecology/index.html about/index.html contacts/index.html credits/index.html; do
  d=$(dirname "$p")
  for w in 1440 390; do
    sed 's#</body>#<script>addEventListener("load",()=>{document.querySelectorAll("[hidden]").forEach(e=>e.hidden=false);const b=[...document.querySelectorAll(".disc, .credits__list img")].map(d=>{const r=d.getBoundingClientRect();return [Math.round(r.width),Math.round(r.height),(d.querySelector("img")||d).getAttribute("src").split("/").pop()]}).filter(([w,h])=>Math.abs(w-h)>1);document.title=b.length?"OVAL "+JSON.stringify(b):"round"})</script></body>#' "$p" > "$d/_m.html"
    t=$("$C" --headless=new --disable-gpu --window-size=$w,900 --virtual-time-budget=3000 --dump-dom "file://$PWD/$d/_m.html" 2>/dev/null | grep -o "<title>[^<]*" | sed 's/<title>//')
    rm -f "$d/_m.html"
    [ "$t" = round ] || { echo "$p @$w: ${t:-no result}"; bad=1; }
  done
done
[ $bad = 0 ] && echo "all discs round"

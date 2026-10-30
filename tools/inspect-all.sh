#!/bin/sh
# Runs the taste inspector on every page; prints one zero-fail line only if all pages pass.
S=/Users/arip/.claude/skills/design-taste-frontend/scripts
mkdir -p .taste-skill
ok=1
for p in index.html products/index.html production/index.html ecology/index.html about/index.html contacts/index.html products/stretch/index.html products/shrink/index.html products/greenhouse/index.html; do
  n=$(echo "$p" | sed 's#/index.html##; s#index.html#home#; s#/#-#g')
  node $S/inspect.mjs "$p" --out ".taste-skill/inspect-$n" > ".taste-skill/inspect-$n.log" 2>&1
  r=$(node tools/nofail.mjs ".taste-skill/inspect-$n.log" 2>&1) || ok=0
  echo "$n: $(tail -1 .taste-skill/inspect-$n.log)"
done
[ $ok = 1 ] && echo "all pages zero-fail"

#!/bin/sh
# Runs the taste inspector on every page; prints one zero-fail line only if all pages pass.
S=/Users/arip/.claude/skills/design-taste-frontend/scripts
mkdir -p .taste-skill
ok=1
for p in index.html products/index.html production/index.html ecology/index.html about/index.html contacts/index.html $(node -e 'import("./src/products-data.mjs").then(m=>console.log(m.products.map(f=>`products/${f.id}/index.html`).join(" ")))'); do
  n=$(echo "$p" | sed 's#/index.html##; s#index.html#home#; s#/#-#g')
  # The inspector sometimes dies on a Chrome screenshot timeout under load; a run with no RESULT line is retried once.
  for try in 1 2; do
    node $S/inspect.mjs "$p" --out ".taste-skill/inspect-$n" > ".taste-skill/inspect-$n.log" 2>&1
    grep -q "^RESULT:" ".taste-skill/inspect-$n.log" && break
  done
  r=$(node tools/nofail.mjs ".taste-skill/inspect-$n.log" 2>&1) || ok=0
  echo "$n: $(tail -1 .taste-skill/inspect-$n.log)"
done
[ $ok = 1 ] && echo "all pages zero-fail"

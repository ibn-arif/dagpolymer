// Static checks on every built page: structure, nav, links, assets, motion fallback.
import { readFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { products } from '../src/products-data.mjs';
const pages = ['index.html', 'products/index.html', 'production/index.html', 'ecology/index.html', 'about/index.html', 'contacts/index.html', 'privacy/index.html', 'consent/index.html', ...products.map(f => `products/${f.id}/index.html`)];
const css = readFileSync('style.css', 'utf8');
const errs = [];
const need = (cond, msg) => cond || errs.push(msg);
const ids = {};
for (const p of pages) {
  need(existsSync(p), `missing page ${p}`);
  if (!existsSync(p)) continue;
  const html = readFileSync(p, 'utf8');
  ids[p] = new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
  need((html.match(/<h1[\s>]/g) || []).length === 1, `${p}: exactly one h1`);
  need(!html.includes('{{'), `${p}: unreplaced template tag`);
  need(html.includes('img/mark.svg'), `${p}: logo mark`);
  const menu = html.split('class="nav__links"')[1]?.split('</ul>')[0] || '';
  need((menu.match(/<a href=/g) || []).length === 5, `${p}: five nav links`);
  if (!/^(index|privacy\/index|consent\/index)\.html$/.test(p)) need(html.includes('aria-current="page"'), `${p}: current page marked in nav`);
  for (const [, href] of html.matchAll(/(?:src|href)="((?!https?:|mailto:|tel:|#)[^"]+)"/g)) {
    const [path, hash] = href.split('#');
    let target = normalize(join(dirname(p), path.split('?')[0]));
    if (existsSync(target) && statSync(target).isDirectory()) target = join(target, 'index.html');
    need(existsSync(target), `${p}: broken link ${href}`);
    if (hash) (ids[target] ? need(ids[target].has(hash), `${p}: missing anchor ${href}`) : (hashes ??= []).push([p, target, hash, href]));
  }
}
var hashes;
for (const [p, target, hash, href] of hashes || []) need(ids[target]?.has(hash), `${p}: missing anchor ${href}`);
for (const [, a] of css.matchAll(/url\("?([^")]+)"?\)/g)) if (!a.startsWith('data:')) need(existsSync(a), `missing css asset ${a}`);
need(/prefers-reduced-motion/.test(css), 'reduced-motion fallback');
need(readFileSync('app.js', 'utf8').includes('mailto:dagpolymer@mail.ru'), 'form sends to dagpolymer@mail.ru');
if (errs.length) { console.log(errs.join('\n')); process.exit(1); }
console.log(`verify ok (${pages.length} pages)`);

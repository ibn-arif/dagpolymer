// Static checks on the built page: structure, assets, motion fallback.
import { readFileSync, existsSync } from 'node:fs';
const html = readFileSync('index.html', 'utf8'), css = readFileSync('style.css', 'utf8');
const errs = [];
const need = (cond, msg) => cond || errs.push(msg);
need((html.match(/<h1[\s>]/g) || []).length === 1, 'exactly one h1');
need(html.includes('img/mark.svg'), 'logo mark used');
for (const id of ['products', 'process', 'ecology', 'delivery', 'contact']) need(html.includes(`id="${id}"`), `section #${id}`);
for (const [, p] of html.matchAll(/(?:src|href)="((?!https?:|mailto:|tel:|#)[^"]+)"/g)) need(existsSync(p.split('?')[0]), `missing file ${p}`);
for (const [, p] of css.matchAll(/url\("?([^")]+)"?\)/g)) if (!p.startsWith('data:')) need(existsSync(p), `missing css asset ${p}`);
need(/prefers-reduced-motion/.test(css), 'reduced-motion fallback');
need(/mailto:dagpolymer@mail\.ru|dagpolymer@mail\.ru/.test(readFileSync('app.js', 'utf8')), 'form sends to dagpolymer@mail.ru');
if (errs.length) { console.log(errs.join('\n')); process.exit(1); }
console.log('verify ok');

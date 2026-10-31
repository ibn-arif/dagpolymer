// 152-ФЗ checks on the built site: no third-party calls on load, separate unticked consent in every form, policy linked everywhere.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
const pages = [];
const walk = d => readdirSync(d).forEach(f => {
  const p = join(d, f);
  if (statSync(p).isDirectory()) { if (!/^(\.|node_modules|src|tools|img|fonts)/.test(f)) walk(p); }
  else if (f === 'index.html') pages.push(p);
});
walk('.');
const errs = [];
const need = (c, m) => c || errs.push(m);
need(existsSync('privacy/index.html') && existsSync('consent/index.html'), 'privacy and consent pages exist');
const css = readFileSync('style.css', 'utf8');
need(!/googleapis|gstatic/.test(css) && /url\("fonts\/onest-cyrillic\.woff2"\)/.test(css), 'font is self-hosted');
for (const p of pages) {
  const h = readFileSync(p, 'utf8');
  // Anything the browser fetches on load (scripts, styles, frames, images) must come from this site.
  for (const [, u] of h.matchAll(/<(?:script|link|iframe|img)[^>]+(?:src|href)="(https?:\/\/[^"]+)"/g)) need(false, `${p}: loads third-party ${u}`);
  need(!/<iframe/.test(h), `${p}: no iframe on load`);
  need(/href="[^"]*privacy\/"[^>]*>Политика обработки персональных данных/.test(h), `${p}: footer links the privacy policy`);
  for (const [form] of h.matchAll(/<form[\s\S]*?<\/form>/g)) {
    const box = form.match(/<input type="checkbox" id="f-consent"[^>]*>/)?.[0] || '';
    need(box && /\brequired\b/.test(box) && !/\bchecked\b/.test(box), `${p}: form has a required, unticked consent checkbox`);
    need(/href="[^"]*consent\/"/.test(form), `${p}: consent checkbox links the consent text`);
  }
}
const js = readFileSync('app.js', 'utf8');
need(/if \(!consent\.checked\)/.test(js) && /Согласие на обработку персональных данных дано/.test(js), 'form blocks without consent and records it in the letter');
need(/data-map/.test(readFileSync('contacts/index.html', 'utf8')), 'contacts map loads only on click');
if (errs.length) { console.log(errs.join('\n')); process.exit(1); }
console.log(`152-fz ok (${pages.length} pages)`);

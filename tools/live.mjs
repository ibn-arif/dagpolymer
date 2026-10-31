// Checks every page on the live site answers 200 and carries the built header.
import { products } from '../src/products-data.mjs';
const base = process.argv[2] || 'https://ibn-arif.github.io/dagpolymer/';
const paths = ['', 'products/', 'production/', 'ecology/', 'about/', 'contacts/', ...products.map(f => `products/${f.id}/`)];
let bad = 0;
for (const p of paths) {
  // A hung GitHub Pages request must fail the check in seconds, not stall it; one retry covers a flaky edge.
  const get = () => fetch(base + p + '?v=' + Date.now(), { signal: AbortSignal.timeout(20000) }).then(async r => ({ ok: r.ok, status: r.status, s: await r.text() }));
  const { ok: okResp, status, s } = await get().catch(() => get()).catch(e => ({ ok: false, status: e.name, s: '' }));
  const r = { ok: okResp, status };
  const ok = r.ok && s.includes('<h1') && s.includes('img/mark.svg') && s.includes('nav__toggle');
  if (!ok) { bad++; console.log(`not live: /${p} (${r.status})`); }
}
console.log(bad ? 'live check failed' : 'live ok');
process.exit(bad ? 1 : 0);

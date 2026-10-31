// Checks search/AI signals on every built page and the root files. Pass --published for a PUBLISHED=1 build.
import { readFileSync, existsSync } from 'node:fs';
import { products } from '../src/products-data.mjs';
const published = process.argv.includes('--published');
const pages = { 'index.html': '', 'products/index.html': 'products/', 'production/index.html': 'production/', 'ecology/index.html': 'ecology/', 'about/index.html': 'about/', 'contacts/index.html': 'contacts/', ...Object.fromEntries(products.map(f => [`products/${f.id}/index.html`, `products/${f.id}/`])) };
const total = Object.keys(pages).length;
const SITE = 'https://dagpolymer.com/';
const errs = [];
const need = (c, m) => c || errs.push(m);
for (const [file, path] of Object.entries(pages)) {
  const h = readFileSync(file, 'utf8');
  const blocks = [...h.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m => m[1]);
  need(blocks.length === 1, `${file}: one JSON-LD block`);
  let graph = [];
  try { graph = JSON.parse(blocks[0])['@graph']; } catch (e) { errs.push(`${file}: JSON-LD does not parse (${e.message})`); }
  const types = graph.flatMap(n => [].concat(n['@type']));
  need(types.includes('LocalBusiness') && types.includes('Organization'), `${file}: Organization + LocalBusiness`);
  need(types.includes(path ? 'BreadcrumbList' : 'WebSite'), `${file}: ${path ? 'BreadcrumbList' : 'WebSite'}`);
  if (file === 'products/index.html') need(types.filter(t => t === 'Product').length === products.length, `${file}: a Product node per product`);
  if (/products\/\w+\//.test(file)) {
    need(types.includes('Product') && types.includes('FAQPage'), `${file}: Product + FAQPage`);
    const bc = graph.find(n => n['@type'] === 'BreadcrumbList');
    need(bc?.itemListElement.length === 3, `${file}: three-level breadcrumb`);
    const faq = graph.find(n => n['@type'] === 'FAQPage');
    need(faq && faq.mainEntity.every(q => h.includes(q.name)), `${file}: every FAQ question is visible on the page`);
  }
  for (const k of ['og:title', 'og:description', 'og:image', 'og:url', 'twitter:card']) need(h.includes(`"${k}"`), `${file}: ${k}`);
  need(h.includes(`property="og:url" content="${SITE}${path}"`), `${file}: og:url points at ${SITE}${path}`);
  if (published) {
    need(h.includes(`<link rel="canonical" href="${SITE}${path}">`), `${file}: canonical`);
    need(!h.includes('name="robots" content="noindex"'), `${file}: no noindex in production`);
  } else {
    need(h.includes('<meta name="robots" content="noindex">'), `${file}: staging noindex`);
    need(!h.includes('rel="canonical"'), `${file}: no canonical in staging`);
  }
  need(!/<h2 class="foot__h"/.test(h), `${file}: footer labels are not h2`);
}
const sm = readFileSync('sitemap.xml', 'utf8');
need((sm.match(/<loc>/g) || []).length === total && Object.values(pages).every(p => sm.includes(`<loc>${SITE}${p}</loc>`)), `sitemap lists all ${total} URLs`);
const rb = readFileSync('robots.txt', 'utf8');
need(/User-agent: GPTBot/.test(rb) && /User-agent: ClaudeBot/.test(rb) && /User-agent: PerplexityBot/.test(rb) && !/Disallow: \/\s*$/m.test(rb) && rb.includes(`Sitemap: ${SITE}sitemap.xml`), 'robots allows AI crawlers and names the sitemap');
need(existsSync('img/og.jpg'), 'og image exists');
const ll = readFileSync('llms.txt', 'utf8');
need(ll.startsWith('# ДагПолимер') && ll.includes('+7 (988) 309-02-02') && (ll.match(/\]\(https:\/\/dagpolymer\.com\//g) || []).length === total, 'llms.txt has title, contacts and all pages');
if (errs.length) { console.log(errs.join('\n')); process.exit(1); }
console.log(`seo ok (${published ? 'production' : 'staging'})`);

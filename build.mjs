// Builds the static pages: shared header/footer + one body per page. Run: node build.mjs
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { products } from './src/products-data.mjs';
import { operator, privacyBody, consentBody } from './src/legal.mjs';

const pages = [
  { key: 'home', out: 'index.html', title: 'ДагПолимер · плёнка из Каспийска', desc: 'Стрейч, термоусадочная и тепличная плёнка от 17 до 200 микрон. Завод в Каспийске с 2017 года, доставка по югу России.' },
  { key: 'products', out: 'products/index.html', title: 'Продукция · ДагПолимер', desc: 'Стрейч, термоусадочная, тепличная и мульчирующая плёнка, вторичные гранулы и упаковка под заказ. Характеристики и применение.' },
  { key: 'production', out: 'production/index.html', title: 'Производство · ДагПолимер', desc: 'Полный цикл на одной площадке в Каспийске: приёмка сырья, экструзия, контроль качества, намотка и отгрузка.' },
  { key: 'ecology', out: 'ecology/index.html', title: 'Экология · ДагПолимер', desc: 'Перерабатываем брак и вторсырьё в гранулы и снова пускаем в производство. 3 000+ тонн вторсырья в год.' },
  { key: 'about', out: 'about/index.html', title: 'О компании · ДагПолимер', desc: 'Завод полимерной плёнки в Каспийске с 2017 года. Работаем напрямую, без посредников, возим по всему югу России.' },
  { key: 'contacts', out: 'contacts/index.html', title: 'Контакты · ДагПолимер', desc: 'Адрес завода в Каспийске, телефон отдела продаж, почта и заявка на расчёт стоимости плёнки.' },
  { key: 'privacy', out: 'privacy/index.html', title: 'Политика обработки персональных данных · ДагПолимер', desc: 'Как ДагПолимер обрабатывает и защищает персональные данные посетителей сайта по 152-ФЗ.', legal: true },
  { key: 'consent', out: 'consent/index.html', title: 'Согласие на обработку персональных данных · ДагПолимер', desc: 'Текст согласия на обработку персональных данных при отправке заявки на сайте ДагПолимер.', legal: true },
  ...products.map(f => ({ key: 'product-' + f.id, out: `products/${f.id}/index.html`, title: f.title, desc: f.desc, section: 'products', product: f })),
];
// Search and AI visibility. The site lives on github.io until it moves to its own domain:
// a normal build is a staging copy (noindex, no canonical); PUBLISHED=1 node build.mjs makes the production build.
const SITE = 'https://dagpolymer.com/';
const PUBLISHED = process.env.PUBLISHED === '1';
const url = p => SITE + p.out.replace(/index\.html$/, '');
const org = {
  '@type': ['Organization', 'LocalBusiness'],
  '@id': SITE + '#org',
  name: 'ДагПолимер',
  alternateName: 'DagPolymer',
  description: 'Завод полиэтиленовой плёнки в Каспийске (Дагестан): стрейч, термоусадочная, тепличная и мульчирующая плёнка, вторичные гранулы. Работает с 2017 года.',
  url: SITE,
  logo: SITE + 'img/mark.svg',
  image: SITE + 'img/og.jpg',
  email: 'dagpolymer@mail.ru',
  telephone: '+7-988-309-02-02',
  foundingDate: '2017',
  address: { '@type': 'PostalAddress', streetAddress: 'Производственная улица, 5', addressLocality: 'Каспийск', addressRegion: 'Республика Дагестан', addressCountry: 'RU' },
  geo: { '@type': 'GeoCoordinates', latitude: 42.8478, longitude: 47.5949 },
  openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '18:00' },
  areaServed: ['Республика Дагестан', 'Чеченская Республика', 'Ставропольский край', 'Краснодарский край', 'Ростовская область', 'Волгоградская область', 'Астраханская область', 'Республика Калмыкия'].map(name => ({ '@type': 'AdministrativeArea', name })),
};
const productNode = f => ({
  '@type': 'Product', '@id': `${SITE}products/${f.id}/#product`, name: f.name, description: f.lead, image: SITE + f.image,
  url: `${SITE}products/${f.id}/`, category: f.category || 'Полиэтиленовая плёнка',
  brand: { '@id': SITE + '#org' }, manufacturer: { '@id': SITE + '#org' },
  additionalProperty: f.specs.map(([name, value]) => ({ '@type': 'PropertyValue', name, value })),
});
const crumb = (position, name, item) => ({ '@type': 'ListItem', position, name, item });
function jsonld(p) {
  const graph = [org];
  if (p.key === 'home') graph.push({ '@type': 'WebSite', '@id': SITE + '#site', name: 'ДагПолимер', url: SITE, inLanguage: 'ru', publisher: { '@id': SITE + '#org' } });
  else if (p.product) graph.push({ '@type': 'BreadcrumbList', itemListElement: [crumb(1, 'Главная', SITE), crumb(2, 'Продукция', SITE + 'products/'), crumb(3, p.product.name, url(p))] });
  else graph.push({ '@type': 'BreadcrumbList', itemListElement: [crumb(1, 'Главная', SITE), crumb(2, p.title.split(' · ')[0], url(p))] });
  if (p.key === 'products') graph.push(...products.map(productNode));
  if (p.product) graph.push(productNode(p.product), { '@type': 'FAQPage', mainEntity: p.product.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}

const nav = [
  ['products', 'Продукция'], ['production', 'Производство'], ['ecology', 'Экология'], ['about', 'О компании'], ['contacts', 'Контакты'],
];

const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
// Three production photos for the "made here" block, never repeating the card's own photo.
const madePics = f => [
  ['img/extrusion.jpg', 'Линия экструзии плёнки в цехе', 1100, 1366],
  ['img/rolls.jpg', 'Готовые рулоны плёнки', 1100, 886],
  ['img/factory.jpg', 'Здание завода ДагПолимер в Каспийске', 1400, 772],
  ['img/granules.jpg', 'Вторичные гранулы полиэтилена', 1100, 1100],
].filter(([src]) => src !== f.image).slice(0, 3)
  .map(([src, alt, w, h]) => `<figure class="disc"><img src="{{r}}${src}" alt="${alt}" width="${w}" height="${h}" loading="lazy"></figure>`).join('\n      ');
const productBody = f => `<section class="intro product">
  <div class="wrap">
    <h1 class="intro__title product__title" data-rise>${f.h1 || f.name}</h1>
  </div>
  <div class="wrap intro__in">
    <div class="intro__copy">
      <p class="intro__lead" data-rise>${f.lead}</p>
      <dl class="specs product__specs" data-rise>
        ${f.specs.map(([n, v]) => `<div><dt>${n}</dt><dd>${v}</dd></div>`).join('\n        ')}
      </dl>
      <div class="film__actions" data-rise><a class="btn" href="{{link:contacts}}?film=${f.id}#quote">${f.cta}</a><a class="more" href="{{link:products}}">Все виды плёнки</a></div>
    </div>
    <figure class="disc disc--l intro__pic"><img src="{{r}}${f.image}" alt="${f.alt}" width="${f.imageW}" height="${f.imageH}" fetchpriority="high"></figure>
  </div>
</section>

<section class="uses" aria-labelledby="uses-h">
  <div class="wrap">
    <div class="panel uses__panel">
      <div>
        <h2 id="uses-h" data-rise>Где применяют</h2>
        <ul class="ticks ticks--big" data-rise>${f.uses.map(u => `<li>${u}</li>`).join('')}</ul>
      </div>
      <div>
        <h2 data-rise>Виды</h2>
        <ul class="regions" data-rise>${f.kinds.map(k => `<li>${k}</li>`).join('')}</ul>
      </div>
    </div>
  </div>
</section>

<section class="guide" aria-labelledby="guide-h">
  <div class="wrap guide__in">
    <div class="guide__side">
      <h2 id="guide-h" data-rise>Как выбрать</h2>
      <p data-rise>Подскажем по телефону <a href="tel:+79883090202">+7&nbsp;(988)&nbsp;309-02-02</a> или в ответ на заявку.</p>
    </div>
    <div class="guide__body">
      ${f.guide.map(([h, ps]) => `<div class="guide__part" data-rise><h3>${h}</h3>${ps.map(t => `<p>${esc(t)}</p>`).join('')}</div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="process made" aria-labelledby="made-h">
  <div class="wrap made__in">
    <div>
      <h2 id="made-h" data-rise>Делаем сами в Каспийске</h2>
      <p data-rise>${f.made || `${f.name} выпускается на нашем заводе: от приёмки сырья и экструзии до намотки и отгрузки. Ничего не отдаём на сторону.`}</p>
      <p class="section-link" data-rise><a class="more more--light" href="{{link:production}}">Как устроено производство</a></p>
    </div>
    <div class="made__pics" data-rise>
      ${madePics(f)}
    </div>
  </div>
</section>

<section class="faq" aria-labelledby="faq-h">
  <div class="wrap faq__in">
    <h2 id="faq-h" data-rise>Частые вопросы</h2>
    <div class="faq__list">
      ${f.faq.map(([q, a]) => `<details class="faq__item" data-rise><summary>${q}</summary><p>${esc(a)}</p></details>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="cta" aria-labelledby="cta-h">
  <div class="wrap cta__in">
    <h2 id="cta-h" data-rise>Посчитаем стоимость за час</h2>
    <p data-rise>Напишите толщину, ширину и объём. Ответим с ценой и сроком доставки.</p>
    <a class="btn btn--light" href="{{link:contacts}}?film=${f.id}#quote" data-rise>${f.cta}</a>
  </div>
</section>`;

// Responsive photos: every img/NAME.jpg gets the img/w/NAME-WIDTH.{webp,jpg} variants (tools/images.sh) and a sizes
// hint taken from the figure it sits in, so phones download a small WebP instead of the 1100 px original JPEG.
const variants = {}, webp = {};
for (const f of readdirSync('img/w')) {
  const [, name, w, ext] = f.match(/^(.+)-(\d+)\.(jpg|webp)$/) || [];
  if (name) ((ext === 'jpg' ? variants : webp)[name] ||= []).push([+w, f]);
}
[...Object.values(variants), ...Object.values(webp)].forEach(v => v.sort((a, b) => a[0] - b[0]));
const sizesFor = cls =>
  /hero__small|item__small/.test(cls) ? '(max-width: 880px) 34vw, 220px'
  : /disc--m|disc--s|chain__pic|^disc$/.test(cls) ? '240px'
  : /disc--xl|delivery__pic|aims__pic|terms__pic|equip__pic/.test(cls) ? '(max-width: 880px) 92vw, 620px'
  : '(max-width: 880px) 80vw, 520px';
const set = (v, r) => v.map(([w, f]) => `${r}img/w/${f} ${w}w`).join(', ');
const responsive = html => html.replace(/(<figure class="([^"]*)"[^>]*>\s*)?<img ([^>]*?)src="([^"]*?)img\/([\w-]+)\.jpg"([^>]*)>/g, (m, fig = '', cls = '', pre, r, name, post) => {
  const v = variants[name];
  if (!v) return m;
  const mid = (v.find(([w]) => w >= 800) || v[v.length - 1])[1];
  const sizes = sizesFor(cls);
  const img = `<img ${pre}src="${r}img/w/${mid}" srcset="${set(v, r)}" sizes="${sizes}"${post}>`;
  return webp[name] ? `${fig}<picture><source type="image/webp" srcset="${set(webp[name], r)}" sizes="${sizes}">${img}</picture>` : fig + img;
});

for (const p of pages) {
  const r = '../'.repeat(p.out.split('/').length - 1) || './';
  const link = k => (k === 'home' ? r : `${r}${k}/`);
  const navItems = nav.map(([k, label]) => `<li><a href="${link(k)}"${k === (p.section || p.key) ? ' aria-current="page"' : ''}>${label}</a></li>`).join('\n          ');
  const body = (p.product ? productBody(p.product) : p.key === 'privacy' ? privacyBody(link) : p.key === 'consent' ? consentBody(link) : readFileSync(`src/${p.key}.html`, 'utf8')).replaceAll('{{r}}', r).replace(/\{\{link:([\w/]+)\}\}/g, (_, k) => link(k));
  const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${p.title}</title>
<meta name="description" content="${p.desc}">
${PUBLISHED ? `<link rel="canonical" href="${url(p)}">` : '<meta name="robots" content="noindex">'}
<meta property="og:type" content="website">
<meta property="og:locale" content="ru_RU">
<meta property="og:site_name" content="ДагПолимер">
<meta property="og:title" content="${p.title}">
<meta property="og:description" content="${p.desc}">
<meta property="og:url" content="${url(p)}">
<meta property="og:image" content="${SITE}img/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${jsonld(p)}</script>
<meta name="theme-color" content="#2d6a3e">
<link rel="icon" href="${r}img/mark.svg" type="image/svg+xml">
<link rel="preload" href="${r}fonts/onest-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${r}style.css">
<script>document.documentElement.classList.add('js')</script>
</head>
<body class="page-${p.key}">
<a class="skip" href="#main">К содержанию</a>

<header class="nav">
  <div class="wrap nav__in">
    <a class="brand" href="${link('home')}" aria-label="ДагПолимер, на главную">
      <img src="${r}img/mark.svg" alt="" width="46" height="25">
      <span>ДагПолимер</span>
    </a>
    <nav class="nav__menu" id="menu" aria-label="Разделы">
      <ul class="nav__links">
          ${navItems}
      </ul>
    </nav>
    <a class="btn btn--small nav__cta" href="${link('contacts')}#quote">Заявка</a>
    <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="menu" aria-label="Меню"><span class="nav__bars" aria-hidden="true"></span><span class="nav__label">Меню</span></button>
  </div>
</header>

<main id="main">
${body.trim()}
</main>

<footer class="foot">
  <div class="wrap">
    <div class="foot__cols">
      <div>
        <p class="foot__h">Продукция</p>
        <ul><li><a href="${link('products/stretch')}">Стрейч-плёнка</a></li><li><a href="${link('products/shrink')}">Термоусадочная</a></li><li><a href="${link('products/greenhouse')}">Тепличная и мульча</a></li><li><a href="${link('products/granules')}">Вторичные гранулы</a></li><li><a href="${link('products/packaging')}">Упаковка под заказ</a></li></ul>
      </div>
      <div>
        <p class="foot__h">Компания</p>
        <ul><li><a href="${link('production')}">Производство</a></li><li><a href="${link('ecology')}">Экология</a></li><li><a href="${link('about')}">О компании</a></li><li><a href="${link('contacts')}">Контакты</a></li></ul>
      </div>
      <div>
        <p class="foot__h">Контакты</p>
        <address>Республика Дагестан, г.&nbsp;Каспийск,<br>Производственная улица, 5<br><a href="tel:+79883090202">+7 (988) 309-02-02</a><br><a href="mailto:dagpolymer@mail.ru">dagpolymer@mail.ru</a></address>
      </div>
    </div>
    <p class="foot__name" aria-hidden="true"><img src="${r}img/mark-dark.svg" alt="" width="153" height="84"><span>ДагПолимер</span></p>
    <p class="foot__legal">© 2026 ${operator.name}. Плёнка из Каспийска с 2017 года. <a href="${link('privacy')}">Политика обработки персональных данных</a></p>
  </div>
</footer>

<script src="${r}app.js" defer></script>
</body>
</html>
`;
  mkdirSync(p.out.split('/').slice(0, -1).join('/') || '.', { recursive: true });
  writeFileSync(p.out, responsive(html));
}

// Files for the site root on the production domain.
const day = new Date().toISOString().slice(0, 10);
writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.filter(p => !p.legal).map(p => `  <url><loc>${url(p)}</loc><lastmod>${day}</lastmod></url>`).join('\n')}
</urlset>
`);
writeFileSync('robots.txt', `User-agent: *
Allow: /

# AI search and assistant crawlers are welcome
User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: ClaudeBot
User-agent: Claude-SearchBot
User-agent: PerplexityBot
User-agent: Google-Extended
User-agent: YandexBot
User-agent: YandexAdditional
Allow: /

Sitemap: ${SITE}sitemap.xml
`);
const specs = products.map(f => `- [${f.name}](${SITE}products/${f.id}/): ${f.specs.map(([n, v]) => `${n.toLowerCase()} ${v}`).join(', ')}.`).join('\n');
writeFileSync('llms.txt', `# ДагПолимер

> Завод полиэтиленовой плёнки в Каспийске, Республика Дагестан, работает с 2017 года. Выпускает стрейч, термоусадочную, тепличную и мульчирующую плёнку, перерабатывает брак и вторсырьё в гранулы. Продаёт оптом напрямую, без посредников, доставляет по югу России.

- Адрес: Республика Дагестан, г. Каспийск, Производственная улица, 5
- Телефон отдела продаж: +7 (988) 309-02-02
- Почта: dagpolymer@mail.ru
- Офис: пн–пт, 9:00–18:00; производство работает круглосуточно
- Изготовление заказа: от 3 рабочих дней
- Регионы доставки чаще всего: Дагестан, Чечня, Ставропольский и Краснодарский края, Ростовская, Волгоградская и Астраханская области, Калмыкия; в другие регионы по запросу

## Продукция

${specs}

## Страницы

${pages.filter(p => !p.product && !p.legal).map(p => `- [${p.title.split(' · ')[0] === 'ДагПолимер' ? 'Главная' : p.title.split(' · ')[0]}](${url(p)}): ${p.desc}`).join('\n')}
`);
console.log(`built ${pages.length} pages${PUBLISHED ? '' : ' (staging: noindex)'}, sitemap.xml, robots.txt, llms.txt`);
if (!operator.inn || !operator.ogrn) console.log('note: ИНН/ОГРН оператора не указаны в src/legal.mjs: заполните до запуска на dagpolymer.com');

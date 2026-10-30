// Builds the static pages: shared header/footer + one body per page. Run: node build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const pages = [
  { key: 'home', out: 'index.html', title: 'ДагПолимер · плёнка из Каспийска', desc: 'Стрейч, термоусадочная и тепличная плёнка от 17 до 200 микрон. Завод в Каспийске с 2017 года, доставка по югу России.' },
  { key: 'products', out: 'products/index.html', title: 'Продукция · ДагПолимер', desc: 'Стрейч, термоусадочная, тепличная и мульчирующая плёнка, вторичные гранулы и упаковка под заказ. Характеристики и применение.' },
  { key: 'production', out: 'production/index.html', title: 'Производство · ДагПолимер', desc: 'Полный цикл на одной площадке в Каспийске: приёмка сырья, экструзия, контроль качества, намотка и отгрузка.' },
  { key: 'ecology', out: 'ecology/index.html', title: 'Экология · ДагПолимер', desc: 'Перерабатываем брак и вторсырьё в гранулы и снова пускаем в производство. 3 000+ тонн вторсырья в год.' },
  { key: 'about', out: 'about/index.html', title: 'О компании · ДагПолимер', desc: 'Завод полимерной плёнки в Каспийске с 2017 года. Работаем напрямую, без посредников, возим по всему югу России.' },
  { key: 'contacts', out: 'contacts/index.html', title: 'Контакты · ДагПолимер', desc: 'Адрес завода в Каспийске, телефон отдела продаж, почта и заявка на расчёт стоимости плёнки.' },
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
const film = (id, name, description, image, props) => ({
  '@type': 'Product', '@id': SITE + 'products/#' + id, name, description, image: SITE + image, category: 'Полиэтиленовая плёнка',
  brand: { '@id': SITE + '#org' }, manufacturer: { '@id': SITE + '#org' },
  additionalProperty: props.map(([n, v]) => ({ '@type': 'PropertyValue', name: n, value: v })),
});
const products = [
  film('stretch', 'Стрейч-плёнка', 'Плёнка для ручной и машинной обмотки паллет и грузов.', 'img/stretch.jpg', [['Толщина', '17, 20, 23 мкм'], ['Ширина рулона', '500 мм'], ['Намотка', '0,5–35 кг'], ['Растяжение', 'до 300%']]),
  film('shrink', 'Термоусадочная плёнка', 'Плёнка для групповой упаковки товаров в термотоннеле.', 'img/shrink.jpg', [['Толщина', '20–200 мкм'], ['Ширина рукава', 'до 1500 мм'], ['Температура усадки', '140–180 °C'], ['Усадка', 'до 70%']]),
  film('greenhouse', 'Тепличная и мульчирующая плёнка', 'Плёнка для теплиц и мульчирования почвы.', 'img/greenhouse.jpg', [['Толщина', '40–200 мкм'], ['Ширина', 'до 6 м'], ['УФ-стабилизатор', 'до 5 лет'], ['Светопропускание', '90–92%']]),
];
function jsonld(p) {
  const graph = [org];
  if (p.key === 'home') graph.push({ '@type': 'WebSite', '@id': SITE + '#site', name: 'ДагПолимер', url: SITE, inLanguage: 'ru', publisher: { '@id': SITE + '#org' } });
  else graph.push({ '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Главная', item: SITE },
    { '@type': 'ListItem', position: 2, name: p.title.split(' · ')[0], item: url(p) },
  ] });
  if (p.key === 'products') graph.push(...products);
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}

const nav = [
  ['products', 'Продукция'], ['production', 'Производство'], ['ecology', 'Экология'], ['about', 'О компании'], ['contacts', 'Контакты'],
];

for (const p of pages) {
  const r = p.out.includes('/') ? '../' : './';
  const link = k => (k === 'home' ? r : `${r}${k}/`);
  const navItems = nav.map(([k, label]) => `<li><a href="${link(k)}"${k === p.key ? ' aria-current="page"' : ''}>${label}</a></li>`).join('\n          ');
  const body = readFileSync(`src/${p.key}.html`, 'utf8').replaceAll('{{r}}', r).replace(/\{\{link:(\w+)\}\}/g, (_, k) => link(k));
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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&display=swap">
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
        <ul><li><a href="${link('products')}#stretch">Стрейч-плёнка</a></li><li><a href="${link('products')}#shrink">Термоусадочная</a></li><li><a href="${link('products')}#greenhouse">Тепличная и мульча</a></li><li><a href="${link('products')}#more">Гранулы и упаковка</a></li></ul>
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
    <p class="foot__legal">© 2026 ДагПолимер. Плёнка из Каспийска с 2017 года.</p>
  </div>
</footer>

<script src="${r}app.js" defer></script>
</body>
</html>
`;
  mkdirSync(p.out.split('/').slice(0, -1).join('/') || '.', { recursive: true });
  writeFileSync(p.out, html);
}

// Files for the site root on the production domain.
const day = new Date().toISOString().slice(0, 10);
writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url><loc>${url(p)}</loc><lastmod>${day}</lastmod></url>`).join('\n')}
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
const specs = products.map(f => `- ${f.name}: ${f.additionalProperty.map(x => `${x.name.toLowerCase()} ${x.value}`).join(', ')}.`).join('\n');
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
- Вторичные гранулы: ПЭНД, ПЭВД, ПП.
- Упаковочные решения под заказ: любые размеры, брендирование, малые партии.

## Страницы

${pages.map(p => `- [${p.title.split(' · ')[0] === 'ДагПолимер' ? 'Главная' : p.title.split(' · ')[0]}](${url(p)}): ${p.desc}`).join('\n')}
`);
console.log(`built ${pages.length} pages${PUBLISHED ? '' : ' (staging: noindex)'}, sitemap.xml, robots.txt, llms.txt`);

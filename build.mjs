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
        <h2 class="foot__h">Продукция</h2>
        <ul><li><a href="${link('products')}#stretch">Стрейч-плёнка</a></li><li><a href="${link('products')}#shrink">Термоусадочная</a></li><li><a href="${link('products')}#greenhouse">Тепличная и мульча</a></li><li><a href="${link('products')}#more">Гранулы и упаковка</a></li></ul>
      </div>
      <div>
        <h2 class="foot__h">Компания</h2>
        <ul><li><a href="${link('production')}">Производство</a></li><li><a href="${link('ecology')}">Экология</a></li><li><a href="${link('about')}">О компании</a></li><li><a href="${link('contacts')}">Контакты</a></li></ul>
      </div>
      <div>
        <h2 class="foot__h">Контакты</h2>
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
console.log(`built ${pages.length} pages`);

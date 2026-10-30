const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = s => document.querySelector(s);

// Entrances: stagger the parts of each section once it enters.
const opening = $('.hero, .intro');
if (opening) requestAnimationFrame(() => opening.classList.add('is-in'));
document.querySelectorAll('section').forEach(s => s.querySelectorAll('[data-rise]').forEach((el, i) => el.style.setProperty('--i', i)));
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('is-in');
  io.unobserve(e.target);
}), { rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('[data-rise]').forEach(el => io.observe(el));

// Header: white once the page scrolls; menu button on narrow screens.
const nav = $('.nav');
const toggle = $('.nav__toggle');
const onScrollNav = () => nav.classList.toggle('is-stuck', scrollY > 8);
function setMenu(open) {
  nav.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', open);
}
toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
addEventListener('keydown', e => {
  if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
});
$('#menu').addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });

// The chain: the bond grows from first step to last as the section scrolls past.
const chain = $('.chain');
const atoms = chain ? [...chain.children] : [];
function drawChain() {
  if (!chain) return;
  const r = chain.getBoundingClientRect();
  const vh = innerHeight;
  const p = reduce ? 1 : Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
  chain.style.setProperty('--progress', p.toFixed(3));
  atoms.forEach((li, i) => li.classList.toggle('is-lit', p >= i / atoms.length - 0.001));
}

let ticking = false;
addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { onScrollNav(); drawChain(); ticking = false; });
}, { passive: true });
addEventListener('resize', drawChain);
onScrollNav(); drawChain();

// Product picker on the home page: WAI-ARIA tabs with arrow keys.
const tabs = [...document.querySelectorAll('[role="tab"]')];
const film = $('#f-film');
function select(tab, focus) {
  tabs.forEach(t => {
    const on = t === tab;
    t.setAttribute('aria-selected', on);
    t.tabIndex = on ? 0 : -1;
    const panel = document.getElementById(t.getAttribute('aria-controls'));
    panel.hidden = !on;
    if (on) {
      panel.classList.remove('is-entering');
      void panel.offsetWidth; // restart the entrance when switching back quickly
      panel.classList.add('is-entering');
    }
  });
  if (focus) tab.focus();
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => select(t));
  t.addEventListener('keydown', e => {
    const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (k) select(tabs[(i + k + tabs.length) % tabs.length], true);
    if (e.key === 'Home') select(tabs[0], true);
    if (e.key === 'End') select(tabs[tabs.length - 1], true);
  });
});
document.querySelectorAll('[data-pick]').forEach(a => a.addEventListener('click', () => {
  if (film) film.value = a.closest('[data-film]').dataset.film;
}));

// Contacts page: ?film=stretch preselects the product chosen on another page.
const wanted = new URLSearchParams(location.search).get('film');
const opt = wanted && film && film.querySelector(`[data-key="${CSS.escape(wanted)}"]`);
if (opt) film.value = opt.value;

// Quote form: no server, so it opens the visitor's mail app with the letter written.
const form = $('#quote');
if (form) {
  const phone = $('#f-phone');
  const err = $('#f-phone-err');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const bad = phone.value.replace(/\D/g, '').length < 10;
    phone.setAttribute('aria-invalid', bad);
    err.hidden = !bad;
    if (bad) { phone.focus(); return; }
    const d = new FormData(form);
    const body = [
      `Имя: ${d.get('name') || '—'}`,
      d.has('company') && `Компания: ${d.get('company') || '—'}`,
      `Телефон: ${d.get('phone')}`,
      `Продукция: ${d.get('film')}`,
      `Объём и детали: ${d.get('msg') || '—'}`,
    ].filter(Boolean).join('\n');
    location.href = `mailto:dagpolymer@mail.ru?subject=${encodeURIComponent('Заявка на расчёт: ' + d.get('film'))}&body=${encodeURIComponent(body)}`;
  });
  phone.addEventListener('input', () => {
    if (phone.getAttribute('aria-invalid') === 'true' && phone.value.replace(/\D/g, '').length >= 10) {
      phone.setAttribute('aria-invalid', 'false');
      err.hidden = true;
    }
  });
}

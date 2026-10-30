# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/JS hosted on GitHub Pages (repo ibn-arif/dagpolymer). Chosen by the user. Six pages mirroring dagpolymer.com (home, products, production, ecology, about, contacts); shared header/footer assembled by `node build.mjs` from `src/*.html` — edit sources, then rebuild and commit the output. A normal build is a staging copy (noindex). When the site moves to dagpolymer.com: `PUBLISHED=1 node build.mjs` (adds canonical, removes noindex), then `node tools/seo.mjs --published`; serve robots.txt, sitemap.xml and llms.txt from the domain root.

## Users

Agricultural holdings, greenhouse farms, warehouses, logistics and packaging operations in the North Caucasus and south of Russia that buy polyethylene film in bulk (pallets, tonnes). They come to compare film types and thicknesses and request a price.

## Product Purpose

Marketing site for ДагПолимер, a polyethylene film manufacturer in Kaspiysk, Dagestan (since 2017). Success: a qualified visitor sends a request for a price quote.

## Positioning

Own full cycle on one site in Kaspiysk: raw material → blown-film extrusion → thickness control → winding → packing → own-fleet delivery; offcuts and defects are recycled back into granules and production.

## Capabilities and Constraints

- Products (full list on /products/): stretch, shrink, greenhouse and mulch film, recycled granules (ПЭНД, ПЭВД, ПП), custom packaging. Core three: stretch film (17, 20, 23 µm; 500 mm; 0.5–35 kg rolls; up to 300% stretch), shrink film (20–200 µm; up to 1500 mm; 140–180 °C; up to 70% shrink), greenhouse film (40–200 µm; up to 6 m; up to 5 years; 90–92% light transmission).
- Delivery regions named by the client: Dagestan, Chechnya, Stavropol, Krasnodar, Rostov, Volgograd, Astrakhan, Kalmykia; other regions on request.
- No server: the request form composes an email to dagpolymer@mail.ru (user decision).
- Language switcher (RU/EN/中文/فارسی/العربية) exists in the Figma design but no translations exist; not built.

## Brand Commitments

- Name: ДагПолимер. Logo: Figma concept 27 «Нынешний знак в стиле К» (green triangle Д over blue П, atoms and bonds, vertical gradients) — user-pinned.
- Visual basis: Figma file «ДагПолимер — Микрон», page «Вариант Ж — Поле» — user-pinned.
- Typeface Onest (used on the incumbent site).

## Evidence on Hand

- Page content for inner pages is taken from the live dagpolymer.com (2026-10-31): production stages, equipment, quality control and ГОСТ certificates, ecology goals, values, payment and delivery terms, 24/7 production, orders from 3 working days.

- Photos from Figma page «Фото (сгенерированы)» — AI-generated, illustrative: greenhouse, extrusion, stretch pallet, shrink-wrapped bottles, granules, rolls, factory (img/*.jpg).
- Figures supplied in the client design: 3 000+ t recycled per year, 100% of defects recycled, −40% CO₂. Not independently verified.
- Contacts: +7 (988) 309-02-02, dagpolymer@mail.ru, Mon–Fri 9:00–18:00, Республика Дагестан, г. Каспийск, Производственная улица, 5.
- No testimonials, client logos, prices or certificates on hand — do not invent.

## Product Principles

1. Specs before adjectives: every product shows its real thickness, width and limits.
2. One action: get a price.
3. Show the whole cycle on one site, granule to roll.

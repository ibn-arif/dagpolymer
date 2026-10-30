# Design

Source: Figma «ДагПолимер — Микрон», page «Вариант Ж — Поле» (user-pinned). Logo: concept 27 «Нынешний знак в стиле К».

## World
Sage field, white panels, one deep green. Round photographs (discs) are the motif; the process is a polymer chain of lime atoms joined by a bond, echoing the logo's atoms-and-bonds mark.

## Tokens (style.css :root)
- Ground #f1f4ec · surface #fff · tint #e2ebd9 · ink #15211a · ink-2 #44514a
- Green #2d6a3e (action, process field) · deep green #1d4329 (footer) · lime #c6e68b (atoms, footer labels)
- Brand blue #0e3083 only in the wordmark; logo gradients live only inside the mark SVGs.
- Type: Onest 400/500/600/700. Sizes: display 96 · h2 60 · h3 32 · lead 21 · body 17 · small 15 (desktop).
- Radii: panels 32px, inner 16–24px, controls fully round.

## Rules
- No shadows, gradients, eyebrows or thin rules; surfaces separate by tone.
- One action per screen: «Получить расчёт».
- Motion: ease-out cubic-bezier(0.23,1,0.32,1); entrances rise 24px with 80ms stagger once; hero discs open with clip-path; chain bond grows with scroll. Everything has a prefers-reduced-motion path; content is visible without JS.

## Pages
- Inner pages open with `.intro` (big h1, lead, one disc photo) and close with the green `.cta` band.
- Reused blocks: `.process` + `.chain` (set `--n` for step count), `.panel` (white field), `.specs` (value over label), `.ticks`, `.regions`, `.contact__card` form.
- Mobile header: brand, «Заявка», menu button; menu drops as a white panel.

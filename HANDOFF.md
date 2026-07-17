# OMI site — handoff / working notes

Static bilingual (FR default / AR with RTL) homepage for **OMI**, a Mauritanian
cleaning-products brand. Plain HTML/CSS/vanilla JS, no build step.

## Files (all in `C:\Users\Haitam JBILAT\Desktop\OMI`)
- `index.html` — page markup
- `styles.css` — all styles (design tokens in `:root` at top; `--font-display`=General Sans for FR, `--font`=Cairo for AR)
- `data.js` — product catalog = single source of truth (4 categories, some with `groups`, `accent` color, `brandLogo`, product `variants`)
- `app.js` — renders product grid/filter from data.js, language switch, mobile nav, trust carousel dots
- `assets/` — product photos + icon SVGs

## How to run
Server is started with: `cd` into project, then `python -m http.server 8777` (runs in background).
Open **http://localhost:8777**.

## IMPORTANT conventions
- **Cache-busting:** `index.html` links CSS/JS as `styles.css?v=N` etc. **After any CSS/JS edit, bump the version** across all 3 links: `sed -i 's/?v=N/?v=N+1/g' index.html` (currently at **v=24**). Otherwise the browser serves stale files.
- **Do NOT use the Claude Browser tool** to verify/screenshot — the user checks manually. Just make edits and describe them. (Also saved in memory.)
- Breakpoints: mobile `<768`, tablet `768–1024`, desktop `>1024`. Everything must hold in Arabic RTL.

## Page structure (top → bottom)
1. Navbar (fixed, hide-on-scroll, hamburger ≤1024, logo+lang always visible)
2. Hero (blue copy panel + product photo; mobile = stacked image band on top + blue block below, uses `hero-products-MOBILE.png`). CTA = white pill button "Nos produits".
3. **Trust strip** (`.trust`) — 4 items: Qualité constante / Disponible partout / Une gamme complète / Fabriqué en Mauritanie. Desktop = 4-col row; mobile = center-snap peek carousel with dots. Icons = filled SVGs (`advanced/location/category/shopping-store.svg`) recolored to hero blue `#1E4DFF` via CSS mask, fixed 80px box (58px mobile).
4. Services "L'Excellence" — 4 color-coded category cards (blue/gold/green/lavender) with masked line icons + "Découvrir" links.
5. Product range (`#cats`) — always-visible horizontal scrollable **filter pill row** (Tous + 4 categories, colored dots, dark-navy active), "Produits (N)" count, product grid (one card per variant, no pickers), "Voir plus" on the Tous tab.
6. Showcase "La marque OMI" (image-first on mobile, 3 stats).
7. Footer (compact; Produits column = the 4 categories).

## The 4 standardized categories
1. Sols, Surfaces & Vitres (blue)
2. Entretien du Linge (gold) — has sub-groups Lessive + Eau de Javel in data
3. Vaisselle & Cuisine (green)
4. Hygiène & Soin Personnel (lavender) — carries Maxiplus paper products; `brandLogo: maxiplus-logo.png` shown on its tab

## Recent focus
Trust strip polish (MOO-reference styling), spacing tuning, filter pill redesign,
hero mobile layout. Everything verified by the user in-browser, not by tooling.

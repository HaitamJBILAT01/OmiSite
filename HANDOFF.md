# OMI site — handoff / working notes

Static bilingual (FR default / AR with RTL) site for **OMI**, a Mauritanian
cleaning-products brand. Plain HTML/CSS/vanilla JS, **no build step**.

## Files (all in `C:\Users\Haitam JBILAT\Desktop\OMI`)
- `index.html` — homepage
- `categorie.html` — **per-category products page** (added this project); driven by `?cat=<slug>`
- `styles.css` — all styles (design tokens in `:root` at top; `--font-display`=General Sans FR, `--font`=Cairo AR; `--sec` = shared section vertical rhythm)
- `data.js` — product catalog = **single source of truth** (4 categories, each with `name`,`desc`,`benefits`,`accent`, and `products`/`groups`; products have `variants`; Maxiplus products flagged `brand:"maxiplus"`)
- `app.js` — homepage product grid/filter render, language switch, mobile menu (incl. `buildMobileMenu()`), trust carousel. Guarded so it's safe to load on `categorie.html`.
- `category.js` — renders `categorie.html` (hero/switcher/benefits/grid) from `data.js`
- `assets/` — product photos, banners, icons, logos

## How to run
`cd` into project, `python -m http.server 8777` (background). Open **http://localhost:8777**.
NOTE: the in-app Claude Browser tool is **blocked from localhost** — can't preview there.

## IMPORTANT conventions
- **Cache-busting:** every CSS/JS `<link>`/`<script>` uses `?v=N`. **After ANY css/js/data edit, bump N in BOTH `index.html` and `categorie.html`** via: `sed -i 's/?v=90/?v=91/g' index.html categorie.html`. **Currently at v=90.**
- **Do NOT use the Claude Browser tool** to verify/screenshot — the user checks manually. (Also in memory.)
- Validate JS after edits: `node --check app.js data.js category.js`.
- Bilingual: every string is `<span class="fr">…</span><span class="ar">…</span>` (or `bi({fr,ar})` in JS). `[dir="rtl"]` handles Arabic.
- Breakpoints: mobile `<768`, tablet `768–1024`, desktop `>1024`. Everything must hold in Arabic RTL.

## Homepage (index.html) — top → bottom
1. Navbar (fixed, hide-on-scroll). Mobile = **rich full-height drawer** (`app.js buildMobileMenu()` injects: primary links + "Nos produits" category list w/ accent dots + contact/social). `.nav-m` is desktop-hidden. Scroll-locks page (`html.nav-locked`).
2. Hero (royal-blue radial-gradient copy panel + product photo; RTL swaps sides). CTA "Découvrir nos produits".
3. Trust strip (4 items; desktop row, mobile peek-carousel with dots).
4. Services "L'Excellence" — 4 pastel category cards; each "Découvrir" → `categorie.html?cat=<slug>`.
5. Product range (`#cats`) — filter pills = **Tous + Maxiplus-logo tab + 4 categories** (monochrome, no color dots; active=navy; Maxiplus tab = logo, navy border when active, NO navy fill/white chip). "Tous" grid grouped by category. `showTab` matches by `data-tab`/panel id (not DOM index).
6. Maxiplus banner (`.mx`) — contained rounded banner, `Maxi-plus-bannerFR/AR.png` desktop, `Maxi-plus-bannerMOBILE.png` mobile. Ghost→pill CTA "Découvrir plus" → `categorie.html?cat=maxiplus`.
7. Showcase "Née en Mauritanie" (compact; `woman-bucket.png`? no — glove `glove-peace.png`; woman photo is in Services).
8. Footer — **blue mesh gradient** (`#123AD6` + radial glows). 4 cols: brand+social, Liens rapides, Nos produits, Contact. Bottom bar: © + segmented FR/AR pill. (Sister-brand "Marque sœur" removed.)

## Category page (categorie.html)
Loads `data.js`, `app.js`, `category.js`. Reads `?cat=<slug>` (default = first entry). Order:
- Navbar (links back to index.html) → **cat-hero** (curved-bottom SVG wave; **one shared `bannerCAT.png` for ALL categories**, set once → instant switching; breadcrumb overlay, eyebrow, title, desc) → **cat-intro** (one quiet line) → **cat-switch** (minimal underline tabs: Maxiplus + 4 categories; NO "Tous") → **cat-benefits** (Dettol-style **blue `#173DBF` band** "LES ATOUTS DE LA GAMME", white line icons + white text; placed ABOVE products so white frames it) → **cat-range** (products) → footer.
- `category.js`: `entries` = Maxiplus (virtual) + categories. `BANNER="bannerCAT.png"`. `ICONS[]` (4 line icons cycled for benefits). Tab click = crossfade hero text only (150ms). IntersectionObserver `.reveal` for the benefits band. Benefits per category come from `data.js` `benefits[]` (Maxiplus's are inline in category.js).

## data.js catalog (current: 31 variants total)
Categories & counts: sols-surfaces-vitres (blue, **8**) · entretien-du-linge (gold, **7**, has `groups` Lessive+Javel) · vaisselle-cuisine (green, **6**) · hygiene-soin-personnel (lavender, **10**).
- **Maxiplus tab** = virtual = all `brand:"maxiplus"` products (essuie-tout, mouchoirs, serviettes-table, papier-hygienique) = **7 variants**. Shows in both Hygiène tab and Maxiplus tab.
- Cards render one per variant (image + product name + `sub`/axis label). No pickers.
- **Variants ordered big-bottles-first** (Nettoyant Surfaces 5L→1.5L→1L; Eau de Javel 4L→1L; Liquide Vaisselle 800ml→750ml→multi).
- Recent products added: `toadd1`=Serviettes de Table 80 (maxiplus), `toadd2`=Javel Lavande 1L, `toadd3-6`=Liquide Vaisselle (800/750ml Lavande/Citron/Original), `toadd7`=Papier Hygiénique 12 rouleaux (maxiplus). Referenced by their `toadd*.png` names (not renamed).
- **`hero:` fields removed** from data (single `bannerCAT.png` now used for all category heroes).

## Social links (live)
FB `https://web.facebook.com/profile.php?id=61557716205802&…` · IG `https://www.instagram.com/omiibdaemr`. In both footers + mobile drawer; `target="_blank" rel="noopener noreferrer"`.

## Product card sizing (fixed most recently)
`.pcard .ph{width:100%; aspect-ratio:1/1.05}` + `img{height:82%;width:auto;max-width:84%}` — makes all card image boxes identical (titles align) and bottles read as the same size regardless of width. Mobile: `img{height:86%;width:auto;max-width:88%}`.

## Known / pending
- Old per-category banner files (`banner-*.png`) now **unused** (not deleted). `toadd*.png` not renamed to descriptive convention.
- Several `href="#"` placeholders remain (Contact nav item, La marque, footer Accueil/etc.).
- **Image optimization recommended** for perf (the FR/AR banners are ~2MB each; `bannerCAT.png` is ~192KB). Convert heavy PNGs → WebP.
- Hosting advice given: **Hostinger Business** (for built-in CDN) or Premium; static site so no VPS/Cloud needed. Free alt: Cloudflare Pages / Netlify.

## Ideas discussed but NOT built
- Category page: "Autres gammes" cross-sell row; product quick-view modal; sticky switcher.
- Move language switcher into mobile drawer; "Nous contacter" CTA in drawer.

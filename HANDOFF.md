# OMI site — handoff / working notes

Static bilingual (FR default / AR with RTL) site for **OMI**, a Mauritanian
cleaning-products brand. Plain HTML/CSS/vanilla JS, **no build step**.

## Live + deploy
- **Live:** https://omi.mr (and https://www.omi.mr) — real domain, HTTPS, connected 2026-07-22.
- **Deploy = Git auto-deploy.** GitHub repo `HaitamJBILAT01/OmiSite` (public, branch `main`) is connected to Hostinger's Git feature. **Workflow: `git commit` + `git push origin main` → live in seconds.** No manual zip/upload anymore.
- `darkgray-jellyfish-450644.hostingersite.com` = same site on its temporary Hostinger domain (still resolves). `gold-quetzal-179741…` = an old empty site, ignore.
- While served on the temp hostingersite.com domain, Hostinger rewrote `@omi.mr` emails to the temp domain (preview artifact). Connecting omi.mr fixed it.

## Files (all in `C:\Users\Haitam JBILAT\Desktop\OMI`)
- `index.html` — homepage
- `categorie.html` — per-category products page, driven by `?cat=<slug>`
- `contact.html` — contact page (methods + mailto form)
- `marque.html` — brand ("La marque") page
- `styles.css` — all styles (design tokens in `:root`; `--font-display`=General Sans FR, `--font`=Cairo AR; `--sec`=section vertical rhythm)
- `data.js` — product catalog = **single source of truth** (5 categories; products have `variants`; Maxiplus products flagged `brand:"maxiplus"`)
- `app.js` — homepage range render, language switch, mobile menu (`buildMobileMenu()`), trust carousel, live product-count stat. Guarded so it's safe on all pages.
- `category.js` — renders `categorie.html` (hero/switcher/grid) from `data.js`
- `.htaccess` — MIME for webp/woff2, CORS for fonts, caching; blocks `.git`/`.claude`/`.md` from web
- `.gitignore` — excludes `.claude/`, `assets/*.png`, `node_modules/`
- `assets/` — **WebP** product photos/banners, SVG icons, logos, `assets/fonts/` (self-hosted General Sans woff2). Cleaned to used files only (no PNGs tracked).

## How to run locally
`python serve.py` (a small custom server on port 8788 with correct MIME + no-cache) OR `python -m http.server 8777`. NOTE: the in-app Claude Browser is **blocked from localhost** — can't preview there. The **live/public** site (omi.mr) IS inspectable in the browser (used for diagnosis, with permission).

## IMPORTANT conventions
- **Cache-busting:** every CSS/JS `<link>`/`<script>` uses `?v=N`. **After ANY css/js/data edit, bump N in ALL pages + styles.css:** `sed -i 's/?v=119/?v=120/g' index.html categorie.html contact.html marque.html styles.css`. **Currently at v=119.** (The hero `<img>` + hero preload in index.html and the font `@font-face` URLs also carry `?v=` — the global sed catches them.)
- Fonts are **self-hosted** (`@font-face` in styles.css → `assets/fonts/general-sans-*.woff2` + `assets/fonts/cairo-*.woff2`). Fontshare/Google CDNs were removed (render-blocking + unreliable on some networks). **Cairo (Arabic)** is a variable woff2 split into 3 `unicode-range` subsets (arabic/latin/latin-ext); because `.ar{display:none}` in FR mode, the Arabic file only downloads once AR is selected — FR visitors (the default) never fetch it. If font URLs ever need cache-busting, they use the same `?v=`.
- **Perf (mobile CLS/LCP):** hero `<img>` has explicit `width`/`height` + `fetchpriority="high"` + a `<link rel=preload as=image>` in index.html `<head>`. All static `<img>`s carry `width`/`height` to prevent layout shift. Product-grid images (JS `cardHTML` in app.js) sit in a fixed-height `.ph` box so they don't shift; they use `loading="lazy" decoding="async"`.
- **IMAGE BUDGET — the #1 thing that made the site slow.** Assets were WebP but never *resized*: the 40px-tall logo shipped at 1077×910 / 220 KB, the 32px Maxi logo at 862×698 / 166 KB. Homepage carried **916 KB** of images → ~4.6 s of transfer on Lighthouse's simulated 4G, which was the entire FCP→LCP gap. Now **328 KB**. **Rules for every new image:**
  1. Resize to **~2× its rendered CSS size** before adding (a 40px logo needs ~240px, not 1000px).
  2. Save **lossy** WebP `quality=80` (photos) / `90` (logos). For transparent (RGBA) images also pass **`alpha_quality=75-85`** — libwebp encodes alpha *losslessly* by default, which is what made `woman-bucket.webp` 270 KB.
  3. Anything **below the fold gets `loading="lazy"`** (nav logo + hero must stay eager; the hero also has `fetchpriority="high"` + preload).
  4. Re-check with: `python -c "from PIL import Image;import os;p='assets/x.webp';print(os.path.getsize(p),Image.open(p).size)"`
- **GOTCHA — img `width`/`height` attrs are a presentational hint (`width:1077px`).** If CSS fixes only ONE dimension (e.g. logos: `height:40px`), the other stays at the attribute's pixel value → image renders huge/stretched. **Always pair the attrs with CSS `width:auto` (or `height:auto`) on the free axis.** The two OMI logos (nav inline style + `.foot-logo img`) now set `width:auto` for exactly this reason.
- **Do NOT use Claude Browser to verify/screenshot** — user checks manually (memory). Public-site inspection for debugging is OK when needed.
- Validate JS after edits: `node --check app.js data.js category.js`.
- Bilingual: every string is `<span class="fr">…</span><span class="ar">…</span>` (or `bi({fr,ar})` in JS). `[dir="rtl"]` handles Arabic. Phone/email keep `dir="ltr"` on the *value span* only (so RTL rows still right-align).
- Breakpoints: mobile `<768`, tablet `768–1024`, desktop `>1024`. Must hold in Arabic RTL.

## Typography (minimalist pass)
Lightened site-wide per user preference: **Latin (General Sans) headings max weight 500; big section titles 400**; body 400. Arabic (Cairo) headings brought to 500. No bold headings anywhere.

## Homepage (index.html) — top → bottom
1. Navbar (fixed, hide-on-scroll). **Mobile = full-width Dettol-style drawer** (`buildMobileMenu()`): airy left-aligned primary links (no dividers), **"Produits" is a tap-to-expand accordion** (rotating caret; submenu = the 5 categories **+ Maxi Plus**; `display` toggle, caret set inline via JS) + contact/social footer. Language switcher stays in the top bar. `.nav-m`, `.nav-m-sub`, `.nav-m-caret` are mobile-only.
2. Hero — royal-blue gradient copy panel + `hero-products.webp`. On mobile the image shows **in full** (contain, all products visible), no separate mobile crop.
3. Trust strip (4 items; desktop row, mobile peek-carousel).
4. Services "L'Excellence" — 4 pastel category cards (hardcoded; NOT the Javel category). Each "Découvrir" → `categorie.html?cat=<slug>`.
5. Product range (`#cats`) — filter pills = **Tous + "Maxi Plus" (text) + 5 categories** (monochrome). `showTab` matches by `data-tab`/panel id.
6. Maxiplus banner (`.mx`) — `Maxi-plus-banner*.webp`. CTA "Découvrir plus" → `categorie.html?cat=maxiplus`.
7. Showcase "Née en Mauritanie" (`glove-peace.webp`) + **brand-stats**: product count is **dynamic** (`#statCount`, set by app.js from the catalogue = 34), then "100% Fabriqué en Mauritanie", "N°1".
8. Footer — 4 cols: brand+social, Liens rapides, Nos produits, Contact. Social = FB, IG, **TikTok** (`@omirim1`).

## Category page (categorie.html)
Loads `data.js`, `app.js`, `category.js`. Order: navbar → **cat-hero** (shared `bannerCAT.webp`) → **cat-switch** (underline tabs: **Maxi Plus (text)** + 5 categories, NO "Tous") → **cat-range** (products) → footer.
- The old **cat-intro line and the "Les atouts de la gamme" benefits band were removed.**
- `category.js`: `entries` = Maxiplus (virtual) + categories. Tab click = crossfade hero text.

## data.js catalog (current: **34 variants**, 5 categories)
1. sols-surfaces-vitres (accent blue, **8**)
2. entretien-du-linge (gold, **2** — Lessive only; flat `products`, no more `groups`)
3. **javel** (cyan, **5** — Eau de Javel, split out of entretien)
4. vaisselle-cuisine (green, **7**)
5. hygiene-soin-personnel (lavender, **12**)
- **Maxi Plus** = virtual tab = all `brand:"maxiplus"` products (7 variants; live in Hygiène). Rendered as **text**, not a logo.
- Savon Mains split by size: Original 500/300, Camomille 500/300 (+ Lavande). Liquide Vaisselle Multi-usages 3×1 Citron split 750/300. Size-separated photos: `savon-original-500/300.webp`, `savon-camomille-500/300.webp`, `vaisselle-citron-750/300.webp`.
- `accent` now only drives nothing critical (the mobile menu color dots were removed). Still on each category.

## Product card sizing
`.pcard .ph{width:100%; height:clamp(215px,21vw,290px)}` (fixed height, NOT aspect-ratio) + `img{max-height:88%;max-width:82%;object-fit:contain}` → identical boxes, titles align on every browser. Mobile similar with capped max-width.

## Social links (live)
FB `…profile.php?id=61557716205802…` · IG `instagram.com/omiibdaemr` · TikTok `tiktok.com/@omirim1`. In both footers, the mobile drawer, and the contact page. Contact email: **info@omi.mr**. Phone: +222 22 51 11 11.

## Known / pending
- "L'Excellence" homepage section is still 4 curated cards (no Javel/Maxi Plus card) — its 2+photo+2 layout would break with a 5th. Javel lives in the filter + category page.
- Contact form is **mailto-based** (opens the visitor's email app) — no backend. Could move to Formspree etc. if a real inbox submission is wanted. Make sure `info@omi.mr` mailbox exists in Hostinger to receive mail.
- On the Arabic **footer** (not the drawer), phone/email still use `dir="ltr"` on the whole link (left-aligned) — only the mobile drawer was fixed to right-align.

## Ideas discussed but NOT built
- Category page: "Autres gammes" cross-sell row; product quick-view modal; sticky switcher.
- Animated (slide) accordion expand on mobile (currently instant display toggle — reliable).

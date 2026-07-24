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
- `_archive/` — **shelved product page** (`produit.html` + `product.js`), 2026-07-24. Deployed but 404'd by `.htaccess`; nothing links to it. **`_archive/README.md` is the restore guide** — read it before bringing the PDP back.
- `contact.html` — contact page (methods + mailto form)
- `marque.html` — brand ("La marque") page
- `styles.css` — all styles (design tokens in `:root`; `--font-display`=General Sans FR, `--font`=Cairo AR; `--sec`=section vertical rhythm)
- `data.js` — product catalog = **single source of truth** (**6 categories** — Maxi Plus is a REAL category since the 2026-07-23 restructure; products have `variants`; the `brand:"maxiplus"` flags are informational only, no code reads them)
- `app.js` — homepage range render, language switch, mobile menu (`buildMobileMenu()`), trust carousel, live product-count stat. Guarded so it's safe on all pages.
- `category.js` — renders `categorie.html` (hero/switcher/grid) from `data.js`
- `.htaccess` — MIME for webp/woff2, CORS for fonts, caching; blocks `.git`/`.claude`/`.md` from web
- `.gitignore` — excludes `.claude/`, `assets/*.png`, `node_modules/`
- `assets/` — **WebP** product photos/banners, SVG icons, logos, `assets/fonts/` (self-hosted General Sans woff2). Cleaned to used files only (no PNGs tracked).

## How to run locally
`python serve.py` (a small custom server on port 8788 with correct MIME + no-cache) OR `python -m http.server 8777`. NOTE: the in-app Claude Browser is **blocked from localhost** — can't preview there. The **live/public** site (omi.mr) IS inspectable in the browser (used for diagnosis, with permission).

## IMPORTANT conventions
- **Cache-busting:** every CSS/JS `<link>`/`<script>` uses `?v=N`. **After ANY css/js/data/image edit, bump N EVERYWHERE:**
  ```
  sed -i 's/?v=153/?v=154/g' index.html categorie.html contact.html marque.html styles.css app.js category.js
  ```
  (do NOT include `HANDOFF.md` — it rewrites this very line). **Currently at v=153.**
  **Every asset URL the site builds now carries `?v=`, including images.** `.htaccess` caches webp/svg/woff2 for **1 year**, so a same-filename replacement is invisible without a new URL. That covers: the feature-icon SVGs and the kitchen bg (`product.js`), **product photos** (`photoHTML` + `photoBox` + related-shot in `product.js`, `cardHTML` in `app.js`), the category banner (`category.js`), the hero `<img>` + preload, and the `@font-face` URLs. `app.js`/`category.js` joined the sed list on 2026-07-24 for exactly this reason — **miss them and a replaced photo silently stays stale.**
  **So: replacing `assets/<photo>.webp` in place + bumping the version = the new photo goes live on push.** No CDN purge, no hard refresh.
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

## Scroll & motion
- **Reveal-on-scroll was REMOVED** (2026-07-23) — the fade/rise-on-scroll made mobile feel sluggish. All of it is gone: the `.reveal-on`/`.rv-in` CSS, the `revealScan()` observer in app.js, the inline `<head>` flag script on every page, and product.js's `revealScan()` call. **Don't reintroduce it** without a lighter approach.
- **Smooth anchor scroll:** `html{scroll-behavior:smooth}` (pre-existing, kept) smooths nav/footer anchor jumps.
- **Navbar** shrunk to `font-size:13px` (AR 14px), `gap:40px`, hover = `--omi-navy` (blue) — was 14.5px with an ink-900 hover.

## Typography (minimalist pass)
Lightened site-wide per user preference: **Latin (General Sans) headings max weight 500; big section titles 400**; body 400. Arabic (Cairo) headings brought to 500. No bold headings anywhere.

## Homepage (index.html) — top → bottom
1. Navbar (fixed, hide-on-scroll). **Mobile = full-width Dettol-style drawer** (`buildMobileMenu()`): airy left-aligned primary links (no dividers), **"Produits" is a tap-to-expand accordion** (rotating caret; submenu = the **6 categories** straight from data.js (Maxi Plus last); `display` toggle, caret set inline via JS) + contact/social footer. Language switcher stays in the top bar. `.nav-m`, `.nav-m-sub`, `.nav-m-caret` are mobile-only.
2. Hero — royal-blue gradient copy panel + `hero-products.webp`. On mobile the image shows **in full** (contain, all products visible), no separate mobile crop.
3. Trust strip (4 items; desktop row, mobile peek-carousel). **On mobile the card text is capped at `27ch` (24ch in AR)** so lines break early, MOO-style, instead of running the full card width — this applies to the category Caractéristiques carousel too, since both use `.trust-card`. (It was 23ch long ago, which was too tight; then uncapped, which was too wide.)
4. Services "L'Excellence" — 4 pastel category cards (hardcoded; NOT the Javel category). Each "Découvrir" → `categorie.html?cat=<slug>`.
5. Product range (`#cats`) — filter pills = **Tous + the 6 categories in data order** (Maxi Plus last, monochrome text). No virtual tab anymore. `showTab` matches by `data-tab`/panel id. NOTE: index.html's footer uses hardcoded `gotoCat(1..6)` — if the category order in data.js changes, update those indices.
6. Maxiplus banner (`.mx`) — `Maxi-plus-banner*.webp`. CTA "Découvrir plus" → `categorie.html?cat=maxiplus`.
7. Showcase "Née en Mauritanie" (`glove-peace.webp`) + **brand-stats**: product count is **dynamic** (`#statCount`, set by app.js from the catalogue = 34), then "100% Fabriqué en Mauritanie", "N°1".
8. Footer — 4 cols: brand+social, Liens rapides, Nos produits, Contact. Social = FB, IG, **TikTok** (`@omirim1`).

## Category page (categorie.html)
Loads `data.js`, `app.js`, `category.js`. Order: navbar → **cat-hero** (shared `bannerCAT.webp`) → **cat-switch** (underline tabs: **the 6 categories in data order**, Maxi Plus last, NO "Tous") → **cat-range** (products) → **cat-feats (Caractéristiques)** → footer. No `?cat=` falls back to the FIRST category (sols) — it used to be the virtual Maxi Plus tab.
- The old **cat-intro line and the "Les atouts de la gamme" benefits band were removed.**
- `category.js`: `entries` = a straight map of data.js categories (virtual-tab logic removed). Tab click = crossfade hero text.
- **Caractéristiques** (added 2026-07-24, moved off the shelved PDP): `#catFeats`, re-rendered on every tab switch from `OMI_DATA.categoryContent[<slug>]`. `[hidden]` if a category has no `features`. **Structurally it IS the homepage trust strip** — same `.trust-inner`/`.trust-track`/`.trust-card`/`.trust-dots` markup, so 4-up row on desktop and **peek carousel + dots on mobile**.
  - **Section chrome is MOO's "Pourquoi MOO ?" band** (moo.com/fr/business-cards), measured off the live page: **bg `#ECEFED`**, padding 64/72, 48px header→icons, **icons 72×72** (MOO's are also fills, `#00ac73`, at exactly 72px — the green just becomes OMI blue `#1E4DFF`). Ours are solid silhouettes vs MOO's thin outlined shapes, so they read a bit heavier; ~60px if it needs toning down. Section h2 is **weight 500**, a touch bolder than the site's 400 section titles (user's call).
  - **The CARDS are NOT re-typed — they use the homepage trust-card scale verbatim** (16px/500 title, 13.5px text). A MOO-scale override (18/400) was tried and reverted 2026-07-24: the user wants the two carousels to read as one component, with the homepage's bolder title. **Don't re-add card type rules under `.cat-feats`.**
  - **The grey band is meant to be followed by a white section** (user plans one). Order today: white product grid → grey band → dark footer.
  - Each feature carries `label` **and `text`** (both `{fr,ar}`), plus a per-category **`featsLead`** `{fr,ar}` — the conversational line under the title, mirroring MOO's `p__lead` ("Des sols qui brillent ? … il y a aussi…"). Arabic uses the Arabic question mark `؟`, not `?`.
  - **`initTrustCarousel(track, dotsWrap)` in app.js is shared.** No args = the homepage. It queries cards/dots **live** and binds listeners **once per element** (`dataset.carousel` flag) — the category track re-renders on every tab switch, and capturing arrays or re-binding would stack a scroll handler per switch.
  - `featIcon()` in category.js: a feature shows its **own** `assets/<icon>.svg` only if the keyword is in `OMI_DATA.iconsReady`; otherwise it falls back to one of 4 generic line-art SVGs (the `ICONS` array, cycled by position). Adding a real one is a drop-in: file in `assets/` + keyword in `iconsReady` + version bump.
  - **Icon status (2026-07-24): 10 of 22 real.** Sols ✅ 4/4 · Linge ✅ 4/4 · **Javel 3/4 — only `disinfect` missing**, so that row mixes 3 filled icons with 1 line-art fallback and looks inconsistent; it's the highest-value next icon. Vaisselle, Hygiène and Maxi Plus are 0/4. Still needed: `disinfect grease-cut shine hand-care multi-use soft-drop moisture gentle family absorbent strong soft-touch`.
  - **Icon format that works with the mask:** a single filled `<path fill="black">`, no strokes, no opacity, any viewBox/ratio (`contain` fits it to the 52/58px square). Every icon so far follows this.

## Product page — SHELVED (`_archive/`), Dettol-style PDP
> **Not live since 2026-07-24.** `produit.html` + `product.js` moved to `_archive/`, 404'd by `.htaccess`. Product cards are plain `<div class="pcard">` now, not links, and carry no hover affordance. Its CSS is still in `styles.css` under an ARCHIVED banner. **`_archive/README.md` is the restore checklist.** Its `features` content lives on as the category-page Caractéristiques row. Everything below describes the page as it was, for when it returns.

`produit.html?p=<product-slug>` renders ONE product. Loads `data.js`, `app.js`, `product.js`.
Hero is a `.pdp-hero` grid split into **head** (breadcrumb + H1), **media** (photo), **body** (desc + pill selectors) via `grid-template-areas`, so **desktop** is 2-col (`"head media" / "body media"`) but **mobile (<900px)** stacks in Dettol order: **title → photo → selectors** (`"head" "media" "body"`, left-aligned text). Minimal: no eyebrow, no summary line, no retailer/Amazon buttons.
- **Photo: floats on white by default** (contained inside `.wrap.pdp-top`, `.pdp-photo img` max-width ~62%). No kitchen bg for most categories.
- **KITCHEN HERO = per-category opt-in.** Set `heroKitchen:"kitchen.webp"` on a category in `categoryContent` (currently **only `sols-surfaces-vitres`**). product.js then adds `.pdp-has-kitchen` to `<main id="pdp">` and sets `#pdpKitchen`'s bg. CSS scoped under `.pdp-has-kitchen` neutralises the `.wrap` (`max-width:none;padding:0`) so the panel can reach the viewport edge. **Dettol's geometry, copied:**
  - **Panel = a capped box, NOT a full-height wall** — `width:min(717px,52vw)`, `height:clamp(340px,34vw,520px)`, `margin-inline-start:auto` (hugs the inline-end edge), `margin-top` that leaves room for the product to rise above it. Mobile: `margin-inline` = the same gutter as the text (Dettol aligns image edge with title edge), `height:clamp(230px,56vw,340px)`.
  - **Curve is on the BOTTOM-start corner** (`border-end-start-radius`); flips in RTL. It was briefly moved to the top-start corner (2026-07-24) — user: "it's upside down". **It belongs on the bottom, don't flip it again.**
  - **DON'T TOUCH THE PRODUCT IMG — position and size only.** Tried and reverted (2026-07-24, user called it bugged): making the product overflow above the panel Dettol-style, and `mix-blend-mode:multiply` to knock out its white background. The photos are **white-background studio shots, not cutouts**, so overflow paints a white slab over the page and multiply recolours the bottle against the kitchen. Same goes for `filter:drop-shadow` (outlines the rectangle) and `border-radius`. The product stays **wholly inside** the panel, centred, image untouched. Revisit only once the photos are actually cut out.
  - `.pdp-kitchen{display:none}` by default so all other categories are untouched.
- **Navbar on the product page** is made solid-white + shadow via `body.page-pdp .site-header` (scoped to produit.html only, so other pages keep the minimal transparent header).
- **Selectors** come from the product's `axes`, all rendered as **plain text pills — no colour dots** (the `swatch`/`style` fields in data.js are legacy and unused). Axis groups sit **side by side on one line** (Dettol's "Select size:" / "Select scent:" row): `.pdp-axis{flex:1 1 0;min-width:min(100%,150px)}` — equal columns, pills wrap inside their own column; they only stack when 150px each no longer fits (<~360px viewport). `.pdp-opt` is `white-space:nowrap` so labels never break mid-word. A product with several variants but NO axes (e.g. `liquide-vaisselle`) gets one synthetic **"Variante"** row built from each variant's `sub`. Single-variant products get no selector.
- **Incomplete combinations are normal** (Citron only exists in 1,5 L). Unreachable values are dimmed (`.pdp-opt.off`) but stay clickable — clicking one snaps the *other* axes to the nearest real variant, so you can never dead-end. Verified: 44 combinations, 0 dead ends, 34/34 variants reachable.
- **Photo = the selected variant's own `image`**, so it swaps as you pick. A product may set `photo: "file.webp"` to pin ONE image for all its variants instead. `.pdp-photo` has a fixed `aspect-ratio` and the img uses `max-*` + auto sizing (same pattern as `.pcard .ph img`), so photos of differing intrinsic sizes are never distorted and cause **no layout shift** — that's why the `<img>` needs no width/height here.
- Product cards everywhere are now `<a class="pcard">` → `produit.html?p=…` with the clicked variant's axis values in the query string, so the card you tapped arrives pre-selected (`productHref()` in app.js).
- **Dettol-style sections below the PDP hero** (all data-driven, `renderExtraSections()` in product.js, each `<section class="psec" hidden>` unhides only if it has data): **Features · How to use · Callout · Safety · Did you know · Related products**. Minimalist (white / faint `--ink-50`, no colour bands).
  - **features / howto / callout are PER CATEGORY** in `window.OMI_DATA.categoryContent[<slug>]` (appended at the bottom of data.js). **safety / didYouKnow are GLOBAL** (`OMI_DATA.safety`, `OMI_DATA.didYouKnow`).
  - **Feature icons:** to use a real one, drop `assets/<keyword>.svg` (filename = the `icon` keyword) **and** add the keyword to `OMI_DATA.iconsReady` in data.js. `featIcon()` then renders it recoloured **white via CSS mask** on the blue Features band; keywords not yet listed stay as the white-dashed keyword placeholder. The **Features section is a full-width band in the hero's royal-blue gradient** (`.pfeatures`). Safety icons still use the plain dashed placeholder (`.psec-ic`) until SVGs are added. **Photos are placeholders too:** any `photo:""` → a dashed box; set a filename in `./assets/` to use a real image.
  - **Related** = other products in the same category, topped up from other categories (max 4), reusing `cardHTML`.

## data.js catalog (current: **34 variants**, 6 categories)
1. sols-surfaces-vitres (accent blue, **8**)
2. entretien-du-linge (gold, **2** — Lessive only; flat `products`, no more `groups`)
3. **javel** (cyan, **5** — Eau de Javel, split out of entretien)
4. vaisselle-cuisine (green, **7**)
5. hygiene-soin-personnel (lavender, **5** — Savon Mains only; papers moved to maxiplus)
6. **maxiplus** (no accent, **7** — Essuie-Tout ×3, Mouchoirs ×2, Serviettes, Papier Hygiénique; moved out of Hygiène in the restructure). Rendered as **text**, not a logo; `brandLogo` field removed from the model.
- Savon Mains split by size: Original 500/300, Camomille 500/300 (+ Lavande). Liquide Vaisselle Multi-usages 3×1 Citron split 750/300. Size-separated photos: `savon-original-500/300.webp`, `savon-camomille-500/300.webp`, `vaisselle-citron-750/300.webp`.
- `accent` now only drives nothing critical (the mobile menu color dots were removed). Still on each category.

## Product card sizing
`.pcard .ph{width:100%; height:clamp(215px,21vw,290px)}` (fixed height, NOT aspect-ratio) + `img{max-height:88%;max-width:82%;object-fit:contain}` → identical boxes, titles align on every browser. Mobile similar with capped max-width.

## Social links (live)
FB `…profile.php?id=61557716205802…` · IG `instagram.com/omiibdaemr` · TikTok `tiktok.com/@omirim1`. In both footers, the mobile drawer, and the contact page. Contact email: **info@omi.mr**. Phone: +222 22 51 11 11.

## Known / pending
- "L'Excellence" homepage section stays **4 curated cards** (no Javel/Maxi Plus card) — **user's explicit choice** in the 6-category restructure; its 2+photo+2 layout would break with more. Javel + Maxi Plus live in the filter pills, tabs, footers and mobile menu.
- Contact form is **mailto-based** (opens the visitor's email app) — no backend. Could move to Formspree etc. if a real inbox submission is wanted. Make sure `info@omi.mr` mailbox exists in Hostinger to receive mail.
- On the Arabic **footer** (not the drawer), phone/email still use `dir="ltr"` on the whole link (left-aligned) — only the mobile drawer was fixed to right-align.

## Ideas discussed but NOT built
- Category page: "Autres gammes" cross-sell row; product quick-view modal; sticky switcher.
- Animated (slide) accordion expand on mobile (currently instant display toggle — reliable).

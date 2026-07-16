# OMI — Homepage (handoff)

Static homepage for the OMI cleaning-products brand (Mauritania). Bilingual
**French / Arabic** with full RTL support. Plain HTML/CSS/vanilla JS — no build
step, no framework, no dependencies. Just open `index.html`.

## Run it

```
# any static server, e.g.
npx serve .
# or just open index.html in a browser
```

## Files

```
handoff/
├── index.html     # page structure (static sections + empty product-grid mount points)
├── styles.css     # all styles (design tokens in :root at the top)
├── data.js        # CONTENT: categories + products (single source of truth)
├── app.js         # behaviour: renders the grid from data, language switch, sticky header
└── assets/        # only the 12 images actually used on the page
```

## Sections (top → bottom)

Navbar (fixed, hide-on-scroll) → Hero → "Services / Categories" (4 category
cards + centre photo) → **Product range** (tabs + product cards) → Showcase
("La marque OMI") → Footer.

## Bilingual / RTL system

Every piece of copy is written twice inside one element:

```html
<span class="fr">Texte français</span><span class="ar">النص العربي</span>
```

CSS shows only the active language; switching to Arabic sets
`document.documentElement.dir = "rtl"` and the whole layout mirrors. The choice
is saved to `localStorage` (`omi-lang`). `setLang('fr'|'ar')` is the single
entry point (wired to the navbar dropdown and the footer buttons).

## The product range is data-driven (important)

The tabs and product cards are **not** hardcoded in `index.html`. They render at
runtime from `window.OMI_DATA` in **`data.js`**, into `#tabs` and `#panels`.
To add/edit/reorder products or categories, edit `data.js` only.

Data shape:

```js
categories: [
  {
    slug: "entretien-maison",
    name: { fr, ar },
    products: [
      { slug, image, alt, name:{fr,ar}, sub:{fr,ar} },
      ...
    ]
  },
  ...
]
```

Images are referenced by filename and resolved to `assets/<image>`.

## Intended next step: product pages + routing

Each category and product already carries a `slug`, chosen to power routes of
the shape:

```
/accueil                                  → homepage
/accueil/<category.slug>                  → category listing
/accueil/<category.slug>/<product.slug>   → product detail
```

The product cards currently link to `#/<category.slug>/<product.slug>` as
placeholder hash targets. When you add real pages (static files, a router, or a
framework), swap those hrefs for real paths and build the category/product
templates from the same `OMI_DATA` objects — the data model is already the
single source of truth, so no content is duplicated.

## Notes / known placeholders

- Navbar links "Accueil / La marque / Contact" and footer product links are `#`
  placeholders (no target pages yet).
- Footer phone/email/address are sample values — confirm before going live.
- "Afficher tous les produits" button has no handler yet.
- Two fonts only: **General Sans** (Fontshare) for Latin / French, **Cairo**
  (Google Fonts) for Arabic. `--font-display` = General Sans (with Cairo
  fallback), `--font` = Cairo. Self-host if you need offline/GDPR-safe delivery.
- Only 7 real products exist so far (3 + 4 across the two tabs); the "6 gammes"
  / category cards describe the fuller intended range.

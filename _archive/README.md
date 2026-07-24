# Archived: the product detail page (PDP)

Shelved on **2026-07-24** — the site doesn't link to individual products for
now. Nothing here is served: `.htaccess` 404s the whole `/_archive` path, and
no page loads these files. They're kept intact so the PDP can come back
without rebuilding it.

## What's here
- `produit.html` — the page shell (`?p=<product-slug>`)
- `product.js` — renders it from `data.js`: variant axes/pill selectors, the
  kitchen hero, and the Dettol-style sections below it

## To bring it back
1. `git mv _archive/produit.html _archive/product.js .`
2. Drop the `RedirectMatch 404 /_archive` line from `.htaccess`.
3. Re-link the product cards. `cardHTML()` in `app.js` renders a plain
   `<div class="pcard">` now; it used to be an `<a>` wrapping the same
   content, plus a helper that carried the clicked variant's axis values in
   the query string so the card you tapped arrived pre-selected:

   ```js
   /* link to the product page, pre-selecting the variant that was clicked so the
      card you tapped is the one already chosen on arrival */
   function productHref(product, variant) {
     const qs = new URLSearchParams({ p: product.slug });
     const keys = axisKeys(product);
     if (keys.length) {
       keys.forEach(k => { if (variant[k] != null) qs.set(k, variant[k]); });
     } else if (product.variants.length > 1) {
       qs.set("__v", String(product.variants.indexOf(variant)));   // synthetic axis
     }
     return `produit.html?${qs}`;
   }
   ```

   Then in `cardHTML()`: `<div class="pcard">` → `<a class="pcard"
   href="${productHref(product, variant)}">` (and `</div>` → `</a>`).
4. Restore the card hover affordance in `styles.css` — it was removed because
   a non-clickable card shouldn't lift on hover:

   ```css
   .pcard .ph img{transition:transform var(--dur-base) var(--ease-out)}
   .pcard:hover .ph img{transform:translateY(-4px) scale(1.03)}
   .pcard:hover h3{color:var(--omi-navy)}
   @media(prefers-reduced-motion:reduce){.pcard:hover .ph img{transform:none}}
   ```
5. Add `_archive/product.js` back to the `?v=N` bump list in `HANDOFF.md`
   (it carries `?v=` on image and icon URLs).

## Still live, don't delete
- **All the PDP CSS stays in `styles.css`** (`.pdp-*`, `.psec`, `.pfeatures`,
  `.phow`, `.prelated`), marked with an ARCHIVED banner comment. It's dead
  weight while the page is shelved but makes restoring it a file move.
- **`data.js` `categoryContent` is still in use.** `features` now feeds the
  Caractéristiques section on `categorie.html`. `howto` / `callout` /
  `heroKitchen`, and the global `safety` / `didYouKnow`, are only read by the
  archived `product.js` — leave them, they're the PDP's content.

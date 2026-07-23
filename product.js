/* ============================================================
   OMI — product page (produit.html)
   ------------------------------------------------------------
   Renders ONE product read from ?p=<product-slug>, with its
   scent / size / type axes as selectable pills & swatches
   (Dettol-style). Everything comes from window.OMI_DATA.

   PHOTO
   -----
   One photo per PRODUCT (shared by all its variants), set as
   `photo: "file.webp"` on the product in data.js. While that is
   empty a CSS/SVG placeholder is shown — no network request, and
   the .pdp-photo box holds a fixed aspect-ratio so filling the
   photo in later causes no layout shift.

   AXES
   ----
   - Products WITH `axes` get one selector row per axis.
   - Products with several variants but NO axes (their variants
     only carry a `sub` line) get one synthetic "Variante" row.
   - Single-variant products get no selector at all.
   Not every axis combination exists (e.g. Citron only in 1,5 L):
   unreachable values are dimmed, and clicking one repairs the
   other axes to the nearest real variant instead of dead-ending.

   Reuses bi() / catProducts() / axisKeys() from app.js — load
   order in the page is: data.js, app.js, product.js.
   ============================================================ */
(function () {
  const root = document.getElementById("pdp");
  if (!root || !window.OMI_DATA) return;          // not on the product page

  /* ---------- locate the product (and the category it lives in) ---------- */
  const slug = new URLSearchParams(location.search).get("p");
  let product = null, category = null;
  for (const c of window.OMI_DATA.categories) {
    const hit = catProducts(c).find(p => p.slug === slug);
    if (hit) { product = hit; category = c; break; }
  }

  const elCat     = document.getElementById("pdpCat");
  const elTitle   = document.getElementById("pdpTitle");
  const elDesc    = document.getElementById("pdpDesc");
  const elAxes    = document.getElementById("pdpAxes");
  const elCurrent = document.getElementById("pdpCurrent");
  const elPhoto   = document.getElementById("pdpPhoto");
  const elCrumbC  = document.getElementById("crumbCat");
  const elCrumbP  = document.getElementById("crumbProd");

  /* unknown / missing ?p= — say so instead of rendering an empty shell */
  if (!product) {
    elTitle.innerHTML = bi({ fr: "Produit introuvable", ar: "المنتج غير موجود" });
    elDesc.innerHTML  = bi({
      fr: "Ce produit n’existe pas ou n’est plus disponible.",
      ar: "هذا المنتج غير موجود أو لم يعد متوفرًا."
    });
    elCurrent.innerHTML = `<a class="pdp-back" href="index.html#cats">${bi({ fr: "Voir toute la gamme", ar: "تصفح كل المنتجات" })}</a>`;
    return;
  }

  /* ---------- axes (real, or one synthetic row for sub-only variants) ----- */
  const SYNTH = "__v";
  const AX = (function () {
    const keys = axisKeys(product);
    if (keys.length) return keys.map(k => Object.assign({ key: k }, product.axes[k]));
    if (product.variants.length > 1) return [{
      key: SYNTH,
      label: { fr: "Variante", ar: "الخيار" },
      style: "pill",
      values: product.variants.map((v, i) => ({
        key: String(i),
        label: v.sub || { fr: `Option ${i + 1}`, ar: `خيار ${i + 1}` }
      }))
    }];
    return [];
  })();

  /* ---------- selection state ---------- */
  const state = {};
  (function initState() {
    const qs = new URLSearchParams(location.search);
    const first = product.variants[0];
    AX.forEach(a => {
      const wanted = qs.get(a.key);
      const valid = a.values.some(v => v.key === wanted);
      state[a.key] = valid ? wanted
                   : (a.key === SYNTH ? "0" : first[a.key]);
    });
    // a pre-selected combo from the URL may not be a real variant — repair it
    if (!currentVariant()) resetToFirstMatch();
  })();

  function currentVariant() {
    if (AX.length === 0) return product.variants[0];
    if (AX[0].key === SYNTH) return product.variants[Number(state[SYNTH])];
    return product.variants.find(v => AX.every(a => v[a.key] === state[a.key]));
  }
  function resetToFirstMatch() {
    const f = product.variants[0];
    AX.forEach(a => { state[a.key] = a.key === SYNTH ? "0" : f[a.key]; });
  }

  /* a value is reachable if some real variant has it AND matches every OTHER
     axis currently selected */
  function isAvailable(axKey, valKey) {
    if (axKey === SYNTH) return true;
    return product.variants.some(v =>
      v[axKey] === valKey &&
      AX.every(a => a.key === axKey || v[a.key] === state[a.key])
    );
  }

  /* clicking a dimmed value still works: it snaps the other axes to the
     nearest variant that actually exists, so you can never dead-end */
  function pick(axKey, valKey) {
    state[axKey] = valKey;
    if (!currentVariant()) {
      const cand = product.variants.find(v => v[axKey] === valKey);
      if (cand) AX.forEach(a => { if (a.key !== axKey) state[a.key] = cand[a.key]; });
    }
    render(true);
  }

  /* ---------- photo: shared per product; placeholder until it's set ------- */
  const PLACEHOLDER = `
    <div class="pdp-ph" role="img" aria-label="Photo du produit à venir">
      <svg viewBox="0 0 120 150" fill="none" stroke="currentColor" stroke-width="3"
           stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M50 8h20v14H50z"/>
        <path d="M44 22h32c8 0 14 7 14 15v96c0 5-4 9-9 9H39c-5 0-9-4-9-9V37c0-8 6-15 14-15z"/>
        <rect x="42" y="62" width="36" height="40" rx="4"/>
      </svg>
      <span class="pdp-ph-t">${bi({ fr: "Photo à venir", ar: "الصورة قريبًا" })}</span>
    </div>`;

  function photoHTML(variant) {
    if (!product.photo) return PLACEHOLDER;
    const alt = (variant && variant.alt) || product.name.fr;
    // no width/height attrs: the photo is supplied later and its intrinsic size
    // isn't known here. .pdp-photo holds a fixed aspect-ratio in CSS, so there
    // is no layout shift either way.
    return `<img src="assets/${product.photo}" alt="${alt}" fetchpriority="high" decoding="async">`;
  }

  /* ---------- render ---------- */
  function render(updateUrl) {
    const v = currentVariant() || product.variants[0];

    elTitle.innerHTML = bi(product.name);
    elCat.innerHTML   = bi(category.name);
    elDesc.innerHTML  = category.desc ? bi(category.desc) : "";

    elCrumbC.innerHTML = bi(category.name);
    elCrumbC.href      = `categorie.html?cat=${category.slug}`;
    elCrumbP.innerHTML = bi(product.name);

    elPhoto.innerHTML = photoHTML(v);

    elAxes.innerHTML = AX.map(a => `
      <div class="pdp-axis">
        <span class="pdp-axis-lbl">${bi(a.label)}</span>
        <div class="pdp-opts ${a.style === "swatch" ? "is-swatch" : "is-pill"}" role="group">
          ${a.values.map(val => {
            const on  = state[a.key] === val.key;
            const off = !isAvailable(a.key, val.key);
            const dot = val.swatch
              ? `<span class="pdp-dot" style="background:${val.swatch}"></span>` : "";
            return `<button type="button" class="pdp-opt${on ? " on" : ""}${off ? " off" : ""}"
                      data-ax="${a.key}" data-val="${val.key}"
                      aria-pressed="${on}">${dot}<span>${bi(val.label)}</span></button>`;
          }).join("")}
        </div>
      </div>`).join("");

    // the line under the selectors = what you've actually chosen
    elCurrent.innerHTML = v ? variantSubHTML(product, v) : "";

    elAxes.querySelectorAll(".pdp-opt").forEach(b =>
      b.addEventListener("click", () => pick(b.dataset.ax, b.dataset.val)));

    document.title = `OMI — ${product.name.fr}`;

    if (updateUrl) {
      const qs = new URLSearchParams({ p: product.slug });
      AX.forEach(a => { if (a.key !== SYNTH) qs.set(a.key, state[a.key]); });
      history.replaceState(null, "", `?${qs}`);
    }
  }

  render(false);
})();

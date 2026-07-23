/* ============================================================
   OMI — product page (produit.html)
   ------------------------------------------------------------
   Renders ONE product read from ?p=<product-slug>, with its
   scent / size / type axes as selectable text pills (Dettol-style).
   Everything comes from window.OMI_DATA.

   PHOTO
   -----
   The selected variant's own photo, on a white panel. A product can
   override this with `photo: "file.webp"` in data.js to force ONE
   shared image across all its variants. The .pdp-photo box holds a
   fixed aspect-ratio, so photos of differing intrinsic sizes never
   shift the layout (that's also why the <img> needs no width/height).

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

  const elTitle   = document.getElementById("pdpTitle");
  const elDesc    = document.getElementById("pdpDesc");
  const elAxes    = document.getElementById("pdpAxes");
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
    elAxes.innerHTML = `<a class="pdp-back" href="index.html#cats">${bi({ fr: "Voir toute la gamme", ar: "تصفح كل المنتجات" })}</a>`;
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

  /* ---------- photo: the selected variant's, unless the product pins one --- */
  function photoHTML(variant) {
    const file = product.photo || (variant && variant.image);
    if (!file) return "";
    const alt = (variant && variant.alt) || product.name.fr;
    // no width/height attrs: variant photos have differing intrinsic sizes.
    // .pdp-photo holds a fixed aspect-ratio in CSS, so there is no shift.
    return `<img src="assets/${file}" alt="${alt}" fetchpriority="high" decoding="async">`;
  }

  /* ---------- render ---------- */
  function render(updateUrl) {
    const v = currentVariant() || product.variants[0];

    elTitle.innerHTML = bi(product.name);
    elDesc.innerHTML  = category.desc ? bi(category.desc) : "";

    elCrumbC.innerHTML = bi(category.name);
    elCrumbC.href      = `categorie.html?cat=${category.slug}`;
    elCrumbP.innerHTML = bi(product.name);

    elPhoto.innerHTML = photoHTML(v);

    /* every axis renders as plain text pills — no colour dots */
    elAxes.innerHTML = AX.map(a => `
      <div class="pdp-axis">
        <span class="pdp-axis-lbl">${bi(a.label)}</span>
        <div class="pdp-opts" role="group">
          ${a.values.map(val => {
            const on  = state[a.key] === val.key;
            const off = !isAvailable(a.key, val.key);
            return `<button type="button" class="pdp-opt${on ? " on" : ""}${off ? " off" : ""}"
                      data-ax="${a.key}" data-val="${val.key}"
                      aria-pressed="${on}">${bi(val.label)}</button>`;
          }).join("")}
        </div>
      </div>`).join("");

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

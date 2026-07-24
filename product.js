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

  /* ---------- Dettol-style sections (features / how-to / callout /
     safety / did-you-know / related), all data-driven ---------- */
  const CONTENT = (window.OMI_DATA.categoryContent || {})[category.slug] || {};
  const G = window.OMI_DATA;

  // Kitchen hero background — opt-in per category via CONTENT.heroKitchen.
  // ?v busts the 1-year image cache (product.js is in the version-bump set).
  if (CONTENT.heroKitchen) {
    root.classList.add("pdp-has-kitchen");
    const k = document.getElementById("pdpKitchen");
    if (k) k.style.backgroundImage = `url('assets/${CONTENT.heroKitchen}?v=146')`;
  }

  function iconSlot(icon) {
    // placeholder showing the flaticon search keyword until a real SVG is added
    return `<span class="psec-ic" data-icon="${icon}" aria-hidden="true"></span>`;
  }
  // feature icon: real SVG (recoloured white via CSS mask) once listed in
  // OMI_DATA.iconsReady, otherwise the keyword placeholder
  function featIcon(icon) {
    const ready = (window.OMI_DATA.iconsReady || []).indexOf(icon) !== -1;
    if (!ready) return iconSlot(icon);
    // ?v busts the 1-year SVG cache when an icon file is replaced (bumped with
    // the site version — product.js is part of the ?v=N bump set now)
    return `<span class="pfeat-ic" style="--ic:url('assets/${icon}.svg?v=146')" aria-hidden="true"></span>`;
  }
  function photoBox(file, hint) {
    if (file) return `<img src="assets/${file}" alt="" loading="lazy" decoding="async">`;
    return `<div class="psec-ph" role="img" aria-label="Photo à ajouter">
      <svg viewBox="0 0 48 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="42" height="30" rx="4"/><circle cx="15" cy="16" r="4"/><path d="M7 33l13-12 9 8 5-4 7 7"/></svg>
      <span class="psec-ph-t">${hint}</span></div>`;
  }
  function fill(id, inner) {
    const el = document.getElementById(id);
    if (el) { el.innerHTML = inner; el.hidden = false; }
  }


  function renderExtraSections() {
    const v = currentVariant() || product.variants[0];

    if (CONTENT.features && CONTENT.features.length) {
      fill("pFeatures", `<div class="wrap">
        <h2 class="psec-head">${bi({ fr: "Caractéristiques", ar: "المميزات" })}</h2>
        <div class="pfeat-grid">${CONTENT.features.map(f =>
          `<div class="pfeat">${featIcon(f.icon)}<span class="pfeat-lbl">${bi(f.label)}</span></div>`
        ).join("")}</div></div>`);
    }

    if (CONTENT.howto && CONTENT.howto.length) {
      fill("pHow", `<div class="wrap">
        <h2 class="psec-head">${bi({ fr: "Comment l'utiliser", ar: "طريقة الاستعمال" })}</h2>
        <ol class="phow-list">${CONTENT.howto.map((s, i) =>
          `<li class="phow-step"><span class="phow-n">${i + 1}</span><span class="phow-t">${bi(s)}</span></li>`
        ).join("")}</ol></div>`);
    }

    if (CONTENT.callout) {
      const c = CONTENT.callout;
      const shot = v ? `<img src="assets/${product.photo || v.image}" alt="${(v && v.alt) || product.name.fr}" loading="lazy" decoding="async">` : "";
      fill("pCallout", `<div class="wrap"><div class="pcallout-grid">
        <div class="pcallout-media">${photoBox(c.photo, bi({ fr: "Photo d'ambiance", ar: "صورة أجواء" }))}</div>
        <div class="pcallout-body">
          <span class="pcallout-tag">${bi(category.name)}</span>
          <h2>${bi(c.title)}</h2>
          <p>${bi(c.text)}</p>
          <div class="pcallout-shot">${shot}</div>
        </div></div></div>`);
    }

    if (G.safety && G.safety.tips && G.safety.tips.length) {
      const s = G.safety;
      fill("pSafety", `<div class="wrap">
        <h2 class="psec-head">${bi({ fr: "Précautions d'emploi", ar: "إرشادات السلامة" })}</h2>
        <div class="psafe-grid">
          <div class="psafe-media">${photoBox(s.photo, bi({ fr: "Photo sécurité", ar: "صورة السلامة" }))}</div>
          <ul class="psafe-list">${s.tips.map(t =>
            `<li class="psafe-item">${iconSlot(t.icon)}<span>${bi(t.label)}</span></li>`
          ).join("")}</ul>
        </div></div>`);
    }

    if (G.didYouKnow) {
      const d = G.didYouKnow;
      const bg = d.photo ? ` style="background-image:url('assets/${d.photo}')"` : "";
      fill("pDyk", `<div class="wrap"><div class="pdyk-inner${d.photo ? " has-photo" : ""}"${bg}>
        ${d.photo ? "" : photoBox("", bi({ fr: "Photo de fond", ar: "صورة الخلفية" }))}
        <div class="pdyk-card">
          <span class="pdyk-eyebrow">${bi(d.title)}</span>
          <p>${bi(d.text)}</p>
        </div></div></div>`);
    }

    // related = other products in this category, topped up from other categories
    const rel = catProducts(category).filter(p => p.slug !== product.slug);
    if (rel.length < 3) {
      for (const c of window.OMI_DATA.categories) {
        if (c.slug === category.slug) continue;
        for (const p of catProducts(c)) { if (rel.length >= 4) break; rel.push(p); }
        if (rel.length >= 4) break;
      }
    }
    if (rel.length) {
      fill("pRelated", `<div class="wrap">
        <h2 class="psec-head">${bi({ fr: "Produits similaires", ar: "منتجات مشابهة" })}</h2>
        <div class="prelated-grid">${rel.slice(0, 4).map(p => cardHTML(p, p.variants[0])).join("")}</div></div>`);
    }
  }

  render(false);
  renderExtraSections();
})();

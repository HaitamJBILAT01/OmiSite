/* ============================================================
   OMI — category page (categorie.html)
   ------------------------------------------------------------
   Renders the hero, the category switcher and the product grid
   for ONE category, read from ?cat=<slug> in the URL.

   "maxiplus" is a virtual category: every product flagged
   brand:"maxiplus" in data.js, wherever it lives in the catalogue.
   Everything else comes straight from window.OMI_DATA, so adding a
   category to data.js adds it here automatically.

   Reuses bi() / catProducts() / cardHTML() from app.js — load order
   in the page is: data.js, app.js, category.js.
   ============================================================ */
(function () {
  const grid = document.getElementById("catGrid");
  if (!grid || !window.OMI_DATA) return;   // not on the category page

  const cats = window.OMI_DATA.categories;
  const maxiLogo = (cats.find(c => c.brandLogo) || {}).brandLogo;
  const maxiProducts = cats.flatMap(c => catProducts(c).filter(p => p.brand === "maxiplus"));

  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.4 12.2 2.5 2.5 4.7-5.2"/></svg>';

  /* selectable entries: the real categories, then Maxiplus as a virtual one */
  /* tab order: Maxi Plus · then the real categories */
  const entries = [];
  if (maxiLogo && maxiProducts.length) {
    // Maxiplus lives inside a category, so it borrows that category's banner
    const host = cats.find(c => catProducts(c).some(p => p.brand === "maxiplus")) || {};
    entries.push({
      slug: "maxiplus",
      name: { fr: "Maxi Plus", ar: "ماكسي بلس" },
      desc: { fr: "Papiers et mouchoirs doux, pensés pour toute la famille.",
              ar: "ورق ومناديل ناعمة، مصمّمة لكل أفراد العائلة." },
      hero: host.hero,
      logo: maxiLogo,
      benefits: [
        { fr: "Ultra absorbant", ar: "امتصاص فائق" },
        { fr: "Résistant et solide", ar: "متين وقوي" },
        { fr: "Doux au toucher", ar: "ناعم الملمس" },
        { fr: "Pour toute la famille", ar: "لكل أفراد العائلة" }
      ],
      products: maxiProducts
    });
  }
  cats.forEach(c => entries.push({
    slug: c.slug, name: c.name, desc: c.desc, hero: c.hero, benefits: c.benefits,
    products: catProducts(c)
  }));

  const titleEl  = document.getElementById("catTitle");
  const descEl   = document.getElementById("catDesc");
  const mediaEl  = document.querySelector(".cat-hero-media");
  const switchEl = document.getElementById("catSwitch");
  const countEl  = document.getElementById("catCount");
  const crumbEl  = document.getElementById("crumbCat");
  const beneWrap = document.querySelector(".cat-benefits");
  const beneEl   = document.getElementById("catBenefits");

  /* ?cat=<slug>, falling back to the first category */
  function slugFromUrl() {
    const q = new URLSearchParams(location.search).get("cat");
    return entries.some(e => e.slug === q) ? q : entries[0].slug;
  }

  function render(slug, updateUrl) {
    const e = entries.find(x => x.slug === slug) || entries[0];

    titleEl.innerHTML = bi(e.name);
    descEl.innerHTML = e.desc ? bi(e.desc) : "";
    // per-category banner from data.js — encodeURI because the filenames
    // contain spaces, accents and "&"
    mediaEl.style.backgroundImage =
      `url("${encodeURI("assets/" + (e.hero || "hero-products.png"))}")`;

    const cards = e.products.flatMap(p => p.variants.map(v => cardHTML(p, v)));
    grid.innerHTML = cards.join("");
    countEl.innerHTML = bi({
      fr: `${cards.length} produit${cards.length > 1 ? "s" : ""}`,
      ar: `${cards.length} منتج`
    });

    switchEl.querySelectorAll(".tab").forEach(t =>
      t.classList.toggle("on", t.dataset.cat === e.slug));

    // breadcrumb: last crumb = current category
    if (crumbEl) crumbEl.innerHTML = bi(e.name);

    // per-category benefits strip (hidden if a category has none)
    if (beneWrap && beneEl) {
      const list = e.benefits || [];
      beneWrap.hidden = list.length === 0;
      beneEl.innerHTML = list.map(b =>
        `<div class="cat-benefit"><span class="cat-benefit-ic">${CHECK}</span><span class="cat-benefit-lbl">${bi(b)}</span></div>`
      ).join("");
    }

    document.title = `OMI — ${e.name.fr}`;
    if (updateUrl) history.replaceState(null, "", `?cat=${e.slug}`);
  }

  /* switcher pills — same styling as the homepage filter row */
  switchEl.innerHTML = entries.map(e => {
    const inner = e.logo
      ? `<img class="tab-brand-solo" src="assets/${e.logo}" alt="${e.name.fr}">`
      : bi(e.name);
    const label = e.logo ? ` aria-label="${e.name.fr}"` : "";
    return `<button class="tab${e.logo ? " tab-logo" : ""}" role="tab" data-cat="${e.slug}"${label}>${inner}</button>`;
  }).join("");

  switchEl.querySelectorAll(".tab").forEach(t =>
    t.addEventListener("click", () => render(t.dataset.cat, true)));

  render(slugFromUrl(), false);
})();

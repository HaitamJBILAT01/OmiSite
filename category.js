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

  /* one shared hero banner for every category — loaded once, never swapped,
     so switching category is instant (no image reload) */
  const BANNER = "bannerCAT.webp";

  /* line-art feature icons (Dettol-style), cycled across the benefits */
  const ICONS = [
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7z"/><path d="M18.6 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5s6 6.3 6 10.5a6 6 0 0 1-12 0c0-4.2 6-10.5 6-10.5z"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5.5c0 4.3-3 7.4-7 8.5-4-1.1-7-4.2-7-8.5V6z"/><path d="m9 12 2 2 4.2-4.4"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4c0 8-4.4 14-11 14a6 6 0 0 1-5-9.2C7 4 14 4 20 4z"/><path d="M5 19c3.4-4 7-7 12-9"/></svg>'
  ];

  /* selectable entries: the real categories, then Maxiplus as a virtual one */
  /* tab order: Maxi Plus · then the real categories */
  const entries = [];
  if (maxiLogo && maxiProducts.length) {
    entries.push({
      slug: "maxiplus",
      name: { fr: "Maxi Plus", ar: "ماكسي بلس" },
      desc: { fr: "Papiers et mouchoirs doux, pensés pour toute la famille.",
              ar: "ورق ومناديل ناعمة، مصمّمة لكل أفراد العائلة." },
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
    slug: c.slug, name: c.name, desc: c.desc, benefits: c.benefits,
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

  // one banner, set a single time — category switches never touch it
  if (mediaEl) mediaEl.style.backgroundImage = `url("${encodeURI("assets/" + BANNER)}")`;

  /* ?cat=<slug>, falling back to the first category */
  function slugFromUrl() {
    const q = new URLSearchParams(location.search).get("cat");
    return entries.some(e => e.slug === q) ? q : entries[0].slug;
  }

  function render(slug, updateUrl) {
    const e = entries.find(x => x.slug === slug) || entries[0];

    titleEl.innerHTML = bi(e.name);
    descEl.innerHTML = e.desc ? bi(e.desc) : "";

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
      beneEl.innerHTML = list.map((b, i) =>
        `<div class="cat-benefit"><span class="cat-benefit-ic">${ICONS[i % ICONS.length]}</span><span class="cat-benefit-lbl">${bi(b)}</span></div>`
      ).join("");
    }

    document.title = `OMI — ${e.name.fr}`;
    if (updateUrl) history.replaceState(null, "", `?cat=${e.slug}`);
  }

  /* switcher pills — same styling as the homepage filter row */
  switchEl.innerHTML = entries.map(e => {
    return `<button class="tab" role="tab" data-cat="${e.slug}">${bi(e.name)}</button>`;
  }).join("");

  const REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const heroWrap = titleEl.closest(".wrap");   // the title/desc wrap, not the breadcrumb

  /* switching a tab crossfades only the hero copy (the banner is shared, so it
     never changes) while the grid + benefits re-render with their own stagger */
  function selectTab(slug) {
    if (REDUCE) { render(slug, true); return; }
    if (heroWrap) heroWrap.classList.add("cat-out");
    setTimeout(() => {
      render(slug, true);
      if (heroWrap) heroWrap.classList.remove("cat-out");
    }, 150);
  }

  switchEl.querySelectorAll(".tab").forEach(t =>
    t.addEventListener("click", () => selectTab(t.dataset.cat)));

  render(slugFromUrl(), false);

  /* reveal below-the-fold sections as they scroll into view */
  const reveals = document.querySelectorAll(".reveal");
  if (!REDUCE && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.14 });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add("in"));
  }
})();

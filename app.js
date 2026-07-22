/* ============================================================
   OMI — homepage behaviour
   - renders the product range (Tous + 4 category tabs, one static
     card per variant — no in-card pickers) from window.OMI_DATA
   - language switch (FR / AR) with RTL + localStorage persistence
   - hide-on-scroll sticky header
   ============================================================ */

/* ---------- helpers ---------- */
function bi(pair) {
  // bilingual <span> markup used across the page
  return `<span class="fr">${pair.fr}</span><span class="ar">${pair.ar}</span>`;
}
function axisKeys(product) {
  return Object.keys(product.axes || {});
}
function axisValue(product, key, valKey) {
  const ax = product.axes[key];
  return ax.values.find(v => v.key === valKey);
}
/* every product list belonging to a category, whether flat or grouped */
function catProducts(cat) {
  return cat.groups ? cat.groups.flatMap(g => g.products) : cat.products;
}

/* number of product cards behind each tab index — filled in by renderRange,
   read by selectCategory() to update the "Produits (N)" count line */
let RANGE_COUNTS = [];

/* tab index of the virtual Maxiplus tab — assigned by renderRange */
let MAXI_TAB = 0;

/* ---------- render the product range from data ---------- */
function renderRange() {
  const data = window.OMI_DATA;
  if (!data) return;
  const cats = data.categories;
  const tabsEl = document.getElementById("tabs");
  const panelsEl = document.getElementById("panels");
  if (!tabsEl || !panelsEl) return;   // not on the homepage

  /* Maxiplus is a brand that lives inside a category (Hygiène), so it gets its
     own virtual tab after the categories' indices: 0 = Tous, 1..n = categories,
     n+1 = Maxiplus. Its panel holds only the products flagged brand:"maxiplus";
     the Hygiène category tab still shows all of its products, Maxiplus included. */
  MAXI_TAB = cats.length + 1;
  const maxiLogo = (cats.find(c => c.brandLogo) || {}).brandLogo;
  const maxiProducts = cats.flatMap(c => catProducts(c).filter(p => p.brand === "maxiplus"));
  const hasMaxi = !!(maxiLogo && maxiProducts.length);

  // tabs: "Tous", then the Maxi Plus text pill, then the categories in data order
  tabsEl.innerHTML =
    `<button class="tab on" role="tab" data-tab="0">${bi({ fr: "Tous", ar: "الكل" })}</button>` +
    (hasMaxi
      ? `<button class="tab" role="tab" data-tab="${MAXI_TAB}">${bi({ fr: "Maxi Plus", ar: "ماكسي بلس" })}</button>`
      : "") +
    cats.map((c, i) => `<button class="tab" role="tab" data-tab="${i + 1}">${bi(c.name)}</button>`).join("");

  // "Tous" panel: products grouped by category, one category after another
  // (natural order) rather than interleaved across categories.
  const allCards = cats.flatMap(c =>
    catProducts(c).flatMap(p => p.variants.map(v => cardHTML(p, v)))
  );

  const allPanel = `
    <div class="panel on" id="panel-0" data-category="all">
      <div class="grid" id="allGrid">${allCards.join("")}</div>
      <div class="range-foot">
        <button class="btn-view-more" id="viewMoreAll">
          <span class="lbl-more">${bi({ fr: "Voir plus de produits", ar: "عرض المزيد من المنتجات" })}</span>
          <span class="lbl-less">${bi({ fr: "Voir moins", ar: "عرض أقل" })}</span>
          <svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </button>
      </div>
    </div>`;

  // one panel per category — every product's variants in a single flat
  // grid (groups in the data are a content grouping only, not a UI heading)
  const catPanels = cats.map((c, i) =>
    `<div class="panel" id="panel-${i + 1}" data-category="${c.slug}">
      <div class="grid">${catProducts(c).flatMap(p => p.variants.map(v => cardHTML(p, v))).join("")}</div>
    </div>`
  ).join("");

  // Maxiplus panel: only the Maxiplus-branded products
  const maxiPanel = hasMaxi
    ? `<div class="panel" id="panel-${MAXI_TAB}" data-category="maxiplus">
        <div class="grid">${maxiProducts.flatMap(p => p.variants.map(v => cardHTML(p, v))).join("")}</div>
      </div>`
    : "";

  panelsEl.innerHTML = allPanel + catPanels + maxiPanel;

  // one product count per tab, for the "Produits (N)" line
  RANGE_COUNTS = [allCards.length, ...cats.map(c =>
    catProducts(c).reduce((sum, p) => sum + p.variants.length, 0)
  )];
  if (hasMaxi) RANGE_COUNTS[MAXI_TAB] = maxiProducts.reduce((s, p) => s + p.variants.length, 0);

  // picking a chip applies the filter — pills are always visible, no panel to close
  tabsEl.querySelectorAll(".tab").forEach(t =>
    t.addEventListener("click", () => selectCategory(+t.dataset.tab))
  );

  // "Voir plus de produits" — reveal / hide the extra cards in the Tous grid
  const vb = document.getElementById("viewMoreAll");
  if (vb) vb.addEventListener("click", () => {
    const g = document.getElementById("allGrid");
    if (g) vb.classList.toggle("on", g.classList.toggle("show-all"));
  });

  selectCategory(0);
}

/* pick a tab (Tous = 0, category = 1..4): swap panels, update the
   product count line, and mark the active pill */
function selectCategory(i) {
  showTab(i);
  const count = document.getElementById("rangeCount");
  const n = RANGE_COUNTS[i] ?? 0;
  if (count) count.innerHTML = bi({
    fr: `${n} produit${n > 1 ? "s" : ""}`,
    ar: `${n} منتج`
  });
}

/* jump straight to the Maxiplus tab (used by the Maxiplus banner CTA) */
function gotoMaxiplus() { if (MAXI_TAB) gotoCat(MAXI_TAB); }

/* jump to a category from the quick-nav strip: select it, then scroll to the grid */
function gotoCat(i) {
  selectCategory(i);
  const el = document.getElementById("cats");
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - 68;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
}

/* one static card per variant: image, product name, one short sub-line.
   No pickers — every scent/size/format of a product gets its own card. */
function cardHTML(product, variant) {
  return `
    <div class="pcard">
      <div class="ph"><img src="assets/${variant.image}" alt="${variant.alt || ""}" loading="lazy"></div>
      <h3>${bi(product.name)}</h3>
      <p class="sub">${variantSubHTML(product, variant)}</p>
    </div>`;
}

/* short sub-line for a variant: its own `sub`, else built from axis labels */
function variantSubHTML(product, variant) {
  if (variant.sub) return bi(variant.sub);
  const parts = axisKeys(product)
    .filter(k => variant[k] != null)
    .map(k => bi(axisValue(product, k, variant[k]).label));
  return parts.join(`<span class="sep"> · </span>`);
}

function showTab(i) {
  // match by data-tab / panel id (not DOM position) so a reordered tab row
  // (e.g. the Maxiplus logo tab moved first) still maps to the right panel
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("on", +t.dataset.tab === i));
  document.querySelectorAll(".panel").forEach(p => p.classList.toggle("on", p.id === `panel-${i}`));
}

/* ---------- trust strip: peek carousel (mobile) ----------
   Dots reflect whichever card sits nearest the track's centre, computed
   from actual rendered positions (getBoundingClientRect) rather than
   scrollLeft math, so it works the same in LTR and RTL. */
function initTrustCarousel() {
  const track = document.getElementById("trustTrack");
  const dotsWrap = document.getElementById("trustDots");
  if (!track || !dotsWrap) return;
  const cards = [...track.querySelectorAll(".trust-card")];
  const dots = [...dotsWrap.querySelectorAll(".trust-dot")];

  function nearestIndex() {
    const trackRect = track.getBoundingClientRect();
    const trackCenter = trackRect.left + trackRect.width / 2;
    let best = 0, bestDist = Infinity;
    cards.forEach((c, i) => {
      const r = c.getBoundingClientRect();
      const d = Math.abs((r.left + r.width / 2) - trackCenter);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    return best;
  }

  function setActiveDot(i) {
    dots.forEach((d, n) => {
      d.classList.toggle("on", n === i);
      d.setAttribute("aria-selected", n === i);
    });
  }

  let ticking = false;
  track.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { setActiveDot(nearestIndex()); ticking = false; });
  }, { passive: true });

  dots.forEach((d, i) => d.addEventListener("click", () => {
    setActiveDot(i);
    cards[i].scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }));
}

/* ---------- language ---------- */
function setLang(l) {
  const rtl = l === "ar";
  document.documentElement.dir = rtl ? "rtl" : "ltr";
  document.documentElement.lang = l;
  const label = document.getElementById("langLabel");
  if (label) label.textContent = rtl ? "العربية" : "Français";
  const optFr = document.getElementById("opt-fr"), optAr = document.getElementById("opt-ar");
  if (optFr) optFr.classList.toggle("on", !rtl);
  if (optAr) optAr.classList.toggle("on", rtl);
  const footFr = document.getElementById("foot-fr"), footAr = document.getElementById("foot-ar");
  if (footFr) footFr.classList.toggle("on", !rtl);
  if (footAr) footAr.classList.toggle("on", rtl);
  const lang = document.getElementById("lang");
  if (lang) lang.classList.remove("open");
  try { localStorage.setItem("omi-lang", l); } catch (e) {}
}

function toggleLang(e) {
  e.stopPropagation();
  const l = document.getElementById("lang");
  const open = l.classList.toggle("open");
  l.querySelector(".lang-trigger").setAttribute("aria-expanded", open);
}

/* ---------- mobile menu ---------- */
function setMenu(open) {
  const h = document.querySelector(".site-header");
  if (!h) return;
  h.classList.toggle("menu-open", open);
  document.documentElement.classList.toggle("nav-locked", open); // freeze page scroll
  const btn = document.getElementById("navToggle");
  if (btn) btn.setAttribute("aria-expanded", open);
}
function toggleMenu(e) {
  if (e) e.stopPropagation();
  const h = document.querySelector(".site-header");
  setMenu(!h.classList.contains("menu-open"));
}

/* ---------- rich mobile drawer: built once from the catalogue ----------
   Adds a "Nos produits" category list + contact/social footer to the menu.
   These extras are display:none on desktop, so the top-bar nav is untouched. */
function buildMobileMenu() {
  const menu = document.getElementById("nav-links");
  const data = window.OMI_DATA;
  if (!menu || !data || menu.querySelector(".nav-m")) return;

  const catLinks = (data.categories || []).map(c =>
    `<a class="nav-m-cat" href="categorie.html?cat=${c.slug}"><span class="nav-m-dot nav-m-dot-${c.accent}"></span>${bi(c.name)}</a>`
  ).join("");

  const icPhone = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z"/></svg>';
  const icMail = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>';
  const icFb = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12z"/></svg>';
  const icIg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none"/></svg>';

  const m = document.createElement("div");
  m.className = "nav-m";
  m.innerHTML =
    `<span class="nav-m-label">${bi({ fr: "Nos produits", ar: "منتجاتنا" })}</span>
     <div class="nav-m-cats">${catLinks}</div>
     <div class="nav-m-foot">
       <div class="nav-m-contact">
         <a href="tel:+22222511111" dir="ltr">${icPhone}<span>+222 22 51 11 11</span></a>
         <a href="mailto:commercial@omi.mr" dir="ltr">${icMail}<span>commercial@omi.mr</span></a>
       </div>
       <div class="nav-m-social">
         <a href="https://web.facebook.com/profile.php?id=61557716205802&amp;mibextid=LQQJ4d&amp;_rdc=1&amp;_rdr" target="_blank" rel="noopener noreferrer" aria-label="Facebook">${icFb}</a>
         <a href="https://www.instagram.com/omiibdaemr" target="_blank" rel="noopener noreferrer" aria-label="Instagram">${icIg}</a>
       </div>
     </div>`;
  menu.appendChild(m);
}

/* ---------- init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderRange();
  initTrustCarousel();
  buildMobileMenu();

  // close language + mobile menu on outside click / Escape
  document.addEventListener("click", (e) => {
    const l = document.getElementById("lang");
    if (l && !l.contains(e.target)) l.classList.remove("open");
    const h = document.querySelector(".site-header");
    if (h && h.classList.contains("menu-open") &&
        !e.target.closest(".nav-links") && !e.target.closest(".nav-toggle")) setMenu(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { document.getElementById("lang").classList.remove("open"); setMenu(false); }
  });

  // close the mobile menu after tapping a link
  document.querySelectorAll(".nav-links a").forEach((a) =>
    a.addEventListener("click", () => setMenu(false)));

  // if the viewport grows to desktop while the drawer is open, close it
  // (otherwise the scroll-lock would linger on the desktop layout)
  const deskMq = window.matchMedia("(min-width:1025px)");
  deskMq.addEventListener("change", (e) => { if (e.matches) setMenu(false); });

  // hide-on-scroll header
  const header = document.querySelector(".site-header");
  let lastY = window.scrollY, ticking = false;
  function update() {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 4);
    if (y < 80 || y < lastY) header.classList.remove("hide");
    else if (y > lastY) { header.classList.add("hide"); document.getElementById("lang").classList.remove("open"); setMenu(false); }
    lastY = y; ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });

  // restore saved language
  try { setLang(localStorage.getItem("omi-lang") || "fr"); } catch (e) { setLang("fr"); }
});

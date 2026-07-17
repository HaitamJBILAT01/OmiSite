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

/* same dot colours as the quick-nav pill strip, keyed by category.accent */
const ACCENT_HEX = { blue: "#1E5BE6", gold: "#D99A00", green: "#12A24E", lavender: "#7A57C7" };

/* ---------- render the product range from data ---------- */
function renderRange() {
  const data = window.OMI_DATA;
  if (!data) return;
  const cats = data.categories;
  const tabsEl = document.getElementById("tabs");
  const panelsEl = document.getElementById("panels");

  // tabs: "Tous" first (index 0), then one per category — each chip gets a
  // small colour dot (same treatment as the quick-nav strip) and can carry
  // a small brandLogo (e.g. Maxiplus) next to its label
  tabsEl.innerHTML =
    `<button class="tab on" role="tab" data-tab="0">${bi({ fr: "Tous", ar: "الكل" })}</button>` +
    cats.map((c, i) => {
      const dot = c.accent ? `<span class="qn-dot" style="--d:${ACCENT_HEX[c.accent]}"></span>` : "";
      const brand = c.brandLogo ? `<img class="tab-brand" src="assets/${c.brandLogo}" alt="Maxiplus">` : "";
      return `<button class="tab" role="tab" data-tab="${i + 1}">${dot}${bi(c.name)}${brand}</button>`;
    }).join("");

  // "Tous" panel: every variant of every product, interleaved round-robin
  // across categories so the first cards shown span the whole range
  // rather than being all-of-one-category before the next starts
  const perCat = cats.map(c => catProducts(c).flatMap(p => p.variants.map(v => cardHTML(p, v))));
  const maxLen = Math.max(...perCat.map(a => a.length));
  const allCards = [];
  for (let i = 0; i < maxLen; i++) perCat.forEach(arr => { if (arr[i]) allCards.push(arr[i]); });

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

  panelsEl.innerHTML = allPanel + catPanels;

  // one product count per tab, for the "Produits (N)" line
  RANGE_COUNTS = [allCards.length, ...cats.map(c =>
    catProducts(c).reduce((sum, p) => sum + p.variants.length, 0)
  )];

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
  if (count) count.innerHTML = bi({
    fr: `Produits (${RANGE_COUNTS[i] ?? 0})`,
    ar: `المنتجات (${RANGE_COUNTS[i] ?? 0})`
  });
}

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
  document.querySelectorAll(".tab").forEach((t, n) => t.classList.toggle("on", n === i));
  document.querySelectorAll(".panel").forEach((p, n) => p.classList.toggle("on", n === i));
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
  const btn = document.getElementById("navToggle");
  if (btn) btn.setAttribute("aria-expanded", open);
}
function toggleMenu(e) {
  if (e) e.stopPropagation();
  const h = document.querySelector(".site-header");
  setMenu(!h.classList.contains("menu-open"));
}

/* ---------- init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderRange();
  initTrustCarousel();

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

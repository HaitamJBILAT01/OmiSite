/* ============================================================
   OMI — homepage behaviour
   - renders the product range (tabs + cards + scent/size pickers)
     from window.OMI_DATA
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

/* ---------- render the product range from data ---------- */
function renderRange() {
  const data = window.OMI_DATA;
  if (!data) return;
  const cats = data.categories;
  const tabsEl = document.getElementById("tabs");
  const panelsEl = document.getElementById("panels");

  // one tab per category (standardised on the 4 merged categories)
  tabsEl.innerHTML = cats.map((c, i) =>
    `<button class="tab${i === 0 ? " on" : ""}" role="tab" data-tab="${i}">${bi(c.name)}</button>`
  ).join("");

  // one panel per category; a category is either a flat product list
  // or sub-groups (each with a heading) rendered as separate grids
  panelsEl.innerHTML = cats.map((c, i) => {
    const body = c.groups
      ? c.groups.map(g => `
          <div class="prod-group">
            <h4 class="group-title">${bi(g.name)}</h4>
            <div class="grid">${g.products.map(p => cardHTML(c, p)).join("")}</div>
          </div>`).join("")
      : `<div class="grid">${c.products.map(p => cardHTML(c, p)).join("")}</div>`;
    return `<div class="panel${i === 0 ? " on" : ""}" id="panel-${i}" data-category="${c.slug}">${body}</div>`;
  }).join("");

  tabsEl.querySelectorAll(".tab").forEach(t =>
    t.addEventListener("click", () => showTab(+t.dataset.tab))
  );

  // wire up every card (picker state + interactions)
  document.querySelectorAll(".pcard").forEach(initCard);
  showTab(0);
}

/* jump to a category tab from the quick-nav strip, then scroll to the grid */
function gotoCat(i) {
  showTab(i);
  const el = document.getElementById("cats");
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - 68;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
}

/* build one product card (default variant = first) */
function cardHTML(cat, p) {
  const first = p.variants[0];
  const keys = axisKeys(p);

  // picker rows — only for axes with >= 2 values
  const pickers = keys.map(k => {
    const ax = p.axes[k];
    if (ax.values.length < 2) return "";
    const buttons = ax.values.map(v => {
      if (ax.style === "swatch") {
        const light = isLight(v.swatch) ? " light" : "";
        return `<button class="swatch${light}" data-axis="${k}" data-val="${v.key}"
                  style="--sw:${v.swatch}"
                  aria-label="${ax.label.fr} ${v.label.fr}"
                  title="${v.label.fr}"><span class="dot"></span></button>`;
      }
      return `<button class="pill" data-axis="${k}" data-val="${v.key}"
                aria-label="${ax.label.fr} ${v.label.fr}">${bi(v.label)}</button>`;
    }).join("");
    return `<div class="picker-row ${ax.style === "swatch" ? "swatches" : "pills"}" data-axis="${k}">${buttons}</div>`;
  }).join("");

  const tag = p.tag ? `<span class="pcard-tag">${bi(p.tag)}</span>` : "";

  return `
    <div class="pcard" data-product="${p.slug}" data-category="${cat.slug}">
      <div class="ph">${tag}<img src="assets/${first.image}" alt="${first.alt}"></div>
      <h3>${bi(p.name)}</h3>
      <p class="sub"></p>
      ${pickers ? `<div class="pickers">${pickers}</div>` : ""}
    </div>`;
}

/* is a swatch colour light enough to need a visible border? */
function isLight(hex) {
  if (!hex) return true;
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16), g = parseInt(c.slice(2, 4), 16), b = parseInt(c.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) > 200;
}

/* set up a card's picker state + listeners */
function initCard(card) {
  const cat = card.dataset.category;
  const p = findProduct(cat, card.dataset.product);
  if (!p) return;

  // initial selection = first variant's axis values
  const sel = {};
  axisKeys(p).forEach(k => { if (p.variants[0][k] != null) sel[k] = p.variants[0][k]; });
  card._omi = { product: p, sel };

  card.querySelectorAll(".swatch, .pill").forEach(btn => {
    btn.addEventListener("click", () => selectValue(card, btn.dataset.axis, btn.dataset.val));
  });

  applyVariant(card, p.variants[0]);
}

function findProduct(catSlug, prodSlug) {
  const cat = window.OMI_DATA.categories.find(c => c.slug === catSlug);
  if (!cat) return null;
  const lists = cat.groups ? cat.groups.map(g => g.products) : [cat.products];
  for (const list of lists) {
    const p = list.find(p => p.slug === prodSlug);
    if (p) return p;
  }
  return null;
}

/* handle a picker click: the clicked axis is authoritative,
   other axes are kept if possible, otherwise repaired */
function selectValue(card, axisKey, valKey) {
  const { product: p, sel } = card._omi;
  sel[axisKey] = valKey;

  const cands = p.variants.filter(v => v[axisKey] === valKey);
  let best = cands[0], bestScore = -1;
  const others = axisKeys(p).filter(k => k !== axisKey);
  cands.forEach(v => {
    let score = 0;
    others.forEach(k => { if (v[k] === sel[k]) score++; });
    if (score > bestScore) { best = v; bestScore = score; }
  });

  // sync selection to the chosen variant across all axes
  axisKeys(p).forEach(k => { if (best[k] != null) sel[k] = best[k]; });
  applyVariant(card, best);
}

/* reflect a variant in the DOM: image, subtitle, active + available states */
function applyVariant(card, variant) {
  const { product: p, sel } = card._omi;
  const img = card.querySelector(".ph img");

  // swap image (with a soft fade)
  if (img.getAttribute("src") !== "assets/" + variant.image) {
    img.classList.add("swapping");
    const swap = () => {
      img.src = "assets/" + variant.image;
      img.alt = variant.alt || "";
      img.classList.remove("swapping");
    };
    // fade out, then swap; fallback timer in case transitionend doesn't fire
    setTimeout(swap, 150);
  }

  // subtitle: variant override, else auto from selected axis labels
  const sub = card.querySelector(".sub");
  if (variant.sub) {
    sub.innerHTML = bi(variant.sub);
  } else {
    const parts = axisKeys(p)
      .filter(k => sel[k] != null)
      .map(k => bi(axisValue(p, k, sel[k]).label));
    sub.innerHTML = parts.join(`<span class="sep"> · </span>`);
  }

  // active + availability states on every picker button
  card.querySelectorAll(".swatch, .pill").forEach(btn => {
    const k = btn.dataset.axis, val = btn.dataset.val;
    btn.classList.toggle("on", sel[k] === val);
    // available = some variant pairs this value with the other current selections
    const others = axisKeys(p).filter(a => a !== k);
    const ok = p.variants.some(v =>
      v[k] === val && others.every(a => sel[a] == null || v[a] === sel[a]));
    btn.classList.toggle("na", !ok);
  });
}

function showTab(i) {
  document.querySelectorAll(".tab").forEach((t, n) => t.classList.toggle("on", n === i));
  document.querySelectorAll(".panel").forEach((p, n) => p.classList.toggle("on", n === i));
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

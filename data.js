/* ============================================================
   OMI — content data  (single source of truth)
   ------------------------------------------------------------
   The homepage product range (Tous + 5 category tabs, one static
   card per variant) renders from this file at runtime by app.js.
   Nothing about the range is hardcoded in index.html.

   The whole site is standardised on 6 categories:
     1. Sols, Surfaces & Vitres
     2. Entretien du Linge      (Lessive)
     3. Eau de Javel
     4. Vaisselle & Cuisine
     5. Hygiène & Soin Personnel (Savon mains)
     6. Maxi Plus                (papiers — the sibling brand, a REAL
                                  category now, no longer a virtual tab)

   MODEL
   -----
   categories[]                      -> one tab each
     ├ name        {fr,ar}
     ├ accent?     "blue"|"gold"|"green"|"lavender"  -> same colour as its
     │                                  card in "L'Excellence" (services
     │                                  section); styles the filter chip
     ├ products[]  OR  groups[]      -> a category is EITHER a flat
     │                                  product list, OR sub-groups
     │                                  (groups are a data grouping only —
     │                                  rendered as one flat card grid,
     │                                  no sub-heading in the UI).
     │   groups[] : { name:{fr,ar}, products:[...] }
     └ (product)
         ├ slug                      -> its page: produit.html?p=<slug>
         ├ photo?  "file.webp"       -> OPTIONAL. Pins ONE image for the whole
         │                              product page. Omit it (the normal case)
         │                              and the page shows the selected
         │                              variant's own `image`.
         ├ name    {fr,ar}           -> card title (shared by all its variants)
         ├ axes?   {scent?,size?,type?}  -> label each variant AND become the
         │     pickers on the product page. Each axis:
         │       { label:{fr,ar}, values:[ {key,label:{fr,ar}} ] }
         │     (`style` / `swatch` are legacy and unused — every axis renders
         │      as plain text pills.)
         └ variants[]                -> every real product that exists —
               { <axisKey>:<valueKey> ..., image, alt, sub? }   EACH becomes its own card

   A variant's card subtitle is its own `sub` if set, otherwise built from
   its axis values (e.g. "Roses · 1,5 L"). Bilingual {fr,ar}; Arabic
   triggers RTL. Images live in ./assets/ (filename only).
   TO EDIT THE RANGE: change this file.
   ============================================================ */

window.OMI_DATA = {

  categories: [

    /* ========== 1 · SOLS, SURFACES & VITRES =================== */
    {
      slug: "sols-surfaces-vitres",
      name: { fr: "Sols, Surfaces & Vitres", ar: "الأرضيات والأسطح والزجاج" },
      desc: { fr: "Des sols, plans de travail et vitres impeccables, sans traces.",
              ar: "أرضيات وأسطح وزجاج نظيفة تمامًا، بدون آثار." },
      benefits: [
        { fr: "Sans traces ni résidus", ar: "بدون آثار أو بقايا" },
        { fr: "Séchage rapide", ar: "جفاف سريع" },
        { fr: "Parfum longue durée", ar: "عطر يدوم طويلاً" },
        { fr: "Adapté à toutes les surfaces", ar: "مناسب لجميع الأسطح" }
      ],
      accent: "blue", /* matches the c-blue category card in "L'Excellence" */
      products: [
        {
          slug: "nettoyant-surfaces",
          name: { fr: "Nettoyant Surfaces", ar: "منظف الأسطح" },
          axes: {
            scent: {
              label: { fr: "Parfum", ar: "العطر" },
              style: "swatch",
              values: [
                { key: "roses",     label: { fr: "Roses",     ar: "الورد" },   swatch: "#ec3f97" },
                { key: "citron",    label: { fr: "Citron",    ar: "الليمون" }, swatch: "#b6d94a" },
                { key: "lavande",   label: { fr: "Lavande",   ar: "الخزامة" }, swatch: "#8a6fd6" },
                { key: "original",  label: { fr: "Original",  ar: "أصلي" },    swatch: "#2f8fe0" },
                { key: "fraicheur", label: { fr: "Fraîcheur", ar: "منعش" },    swatch: "#2fae57" }
              ]
            },
            size: {
              label: { fr: "Format", ar: "الحجم" },
              style: "pill",
              values: [
                { key: "1l",   label: { fr: "1 L",   ar: "1 لتر" } },
                { key: "1.5l", label: { fr: "1,5 L", ar: "1٫5 لتر" } },
                { key: "5l",   label: { fr: "5 L",   ar: "5 لتر" } }
              ]
            }
          },
          variants: [
            { scent: "roses",     size: "5l",   image: "surface-roses-5000.webp",    alt: "OMI Nettoyant Surfaces Roses 5 L" },
            { scent: "lavande",   size: "5l",   image: "surface-lavande-5000.webp",  alt: "OMI Nettoyant Surfaces Lavande 5 L" },
            { scent: "fraicheur", size: "5l",   image: "surface-fraicheur-5000.webp", alt: "OMI Nettoyant Surfaces Fraîcheur 5 L" },
            { scent: "roses",     size: "1.5l", image: "surface-roses-1500.webp",    alt: "OMI Nettoyant Surfaces Roses 1,5 L" },
            { scent: "citron",    size: "1.5l", image: "surface-citron-1500.webp",   alt: "OMI Nettoyant Surfaces Citron 1,5 L" },
            { scent: "original",  size: "1.5l", image: "surface-original-1500.webp", alt: "OMI Nettoyant Surfaces Original 1,5 L" },
            { scent: "lavande",   size: "1l",   image: "surface-lavande-1000.webp",  alt: "OMI Nettoyant Surfaces Lavande 1 L" }
          ]
        },
        {
          slug: "vitres-surfaces",
          name: { fr: "Vitres & Surfaces", ar: "الزجاج والأسطح" },
          variants: [
            { image: "vitres-spray.webp", alt: "OMI Nettoyant Vitres & Surfaces 3 en 1 sans traces",
              sub: { fr: "Spray 3 en 1 · sans traces", ar: "بخاخ 3 في 1 · بدون آثار" } }
          ]
        }
      ]
    },

    /* ========== 2 · ENTRETIEN DU LINGE (Lessive) ============== */
    {
      slug: "entretien-du-linge",
      name: { fr: "Entretien du Linge", ar: "العناية بالملابس" },
      desc: { fr: "Un linge éclatant et une fraîcheur qui dure, lavage après lavage.",
              ar: "غسيل ناصع ونضارة تدوم، غسلة بعد غسلة." },
      benefits: [
        { fr: "Action anti-taches puissante", ar: "فعالية قوية ضد البقع" },
        { fr: "Fraîcheur qui dure", ar: "نضارة تدوم" },
        { fr: "Doux pour les fibres", ar: "لطيف على الأنسجة" },
        { fr: "Parfums variés", ar: "عطور متنوعة" }
      ],
      accent: "gold",
      products: [
        {
          slug: "lessive-gel-matic",
          name: { fr: "Lessive Gel Matic", ar: "جل غسيل ماتيك" },
          variants: [
            { image: "lessive-gel-matic.webp", alt: "OMI Power Gel Matic 2 en 1 anti-taches 3 Kg",
              sub: { fr: "Power Gel · 2 en 1 · 3 Kg", ar: "جل قوي · 2 في 1 · 3 كغ" } }
          ]
        },
        {
          slug: "detergent-poudre",
          name: { fr: "Détergent en Poudre", ar: "مسحوق الغسيل" },
          variants: [
            { image: "detergent-poudre.webp", alt: "Maxi Clean Détergent en Poudre 90 g",
              sub: { fr: "Maxi Clean · lavage main", ar: "ماكسي كلين · غسيل يدوي" } }
          ]
        }
      ]
    },

    /* ========== 3 · EAU DE JAVEL ============================== */
    {
      slug: "javel",
      name: { fr: "Eau de Javel", ar: "ماء جافيل" },
      desc: { fr: "Désinfecte, blanchit et élimine les taches, pour une maison saine.",
              ar: "تُطهّر وتُبيّض وتزيل البقع، من أجل منزل صحي ونظيف." },
      benefits: [
        { fr: "Désinfection en profondeur", ar: "تطهير عميق" },
        { fr: "Blancheur éclatante", ar: "بياض ناصع" },
        { fr: "Élimine germes & bactéries", ar: "يقضي على الجراثيم والبكتيريا" },
        { fr: "Parfums variés", ar: "عطور متنوعة" }
      ],
      accent: "cyan",
      products: [
        {
          slug: "eau-de-javel",
          name: { fr: "Eau de Javel", ar: "ماء جافيل" },
          axes: {
            scent: {
              label: { fr: "Parfum", ar: "العطر" },
              style: "swatch",
              values: [
                { key: "original", label: { fr: "Original", ar: "أصلي" },   swatch: "#eaf0f6" },
                { key: "lavande",  label: { fr: "Lavande",  ar: "الخزامة" }, swatch: "#8a6fd6" },
                { key: "citron",   label: { fr: "Citron",   ar: "الليمون" }, swatch: "#f2d024" }
              ]
            },
            size: {
              label: { fr: "Format", ar: "الحجم" },
              style: "pill",
              values: [
                { key: "1l", label: { fr: "1 L", ar: "1 لتر" } },
                { key: "4l", label: { fr: "4 L", ar: "4 لتر" } }
              ]
            }
          },
          variants: [
            { scent: "original", size: "4l", image: "javel-original-4l.webp", alt: "OMI Eau de Javel Original 4 L" },
            { scent: "lavande",  size: "4l", image: "javel-lavande-4l.webp",  alt: "OMI Eau de Javel Lavande 4 L" },
            { scent: "citron",   size: "4l", image: "javel-citron-4l.webp",   alt: "OMI Eau de Javel Citron 4 L" },
            { scent: "original", size: "1l", image: "javel-original-1l.webp", alt: "OMI Eau de Javel Original 1 L" },
            { scent: "lavande",  size: "1l", image: "toadd2.webp",            alt: "OMI Eau de Javel Lavande Blancheur & Protection 1 L" }
          ]
        }
      ]
    },

    /* ========== 4 · VAISSELLE & CUISINE ======================= */
    {
      slug: "vaisselle-cuisine",
      name: { fr: "Vaisselle & Cuisine", ar: "الأواني والمطبخ" },
      desc: { fr: "Une vaisselle dégraissée et brillante, sans le moindre effort.",
              ar: "أوانٍ نظيفة ولامعة، دون أي مجهود." },
      benefits: [
        { fr: "Dégraissage express", ar: "إزالة سريعة للدهون" },
        { fr: "Brillance sans traces", ar: "لمعان بدون آثار" },
        { fr: "Doux pour les mains", ar: "لطيف على اليدين" },
        { fr: "Multi-usages", ar: "متعدد الاستعمالات" }
      ],
      accent: "green",
      products: [
        {
          slug: "liquide-vaisselle",
          name: { fr: "Liquide Vaisselle", ar: "سائل الأواني" },
          variants: [
            { image: "toadd3.webp", alt: "OMI Liquide Vaisselle Super Dégraissant Lavande 800 ml",
              sub: { fr: "Lavande · 800 ml", ar: "الخزامة · 800 مل" } },
            { image: "toadd6.webp", alt: "OMI Liquide Vaisselle Super Dégraissant Original 750 ml",
              sub: { fr: "Original · 750 ml", ar: "أصلي · 750 مل" } },
            { image: "toadd5.webp", alt: "OMI Liquide Vaisselle Super Dégraissant Citron 750 ml",
              sub: { fr: "Citron · 750 ml", ar: "ليمون · 750 مل" } },
            { image: "toadd4.webp", alt: "OMI Liquide Vaisselle Super Dégraissant Lavande 750 ml",
              sub: { fr: "Lavande · 750 ml", ar: "الخزامة · 750 مل" } },
            { image: "vaisselle-citron-750.webp", alt: "OMI Liquide Vaisselle Multi-Usages 3x1 Citron 750 ml",
              sub: { fr: "Multi-usages 3×1 · Citron · 750 ml", ar: "متعدد الاستعمالات 3×1 · ليمون · 750 مل" } },
            { image: "vaisselle-citron-300.webp", alt: "OMI Liquide Vaisselle Multi-Usages 3x1 Citron 300 ml",
              sub: { fr: "Multi-usages 3×1 · Citron · 300 ml", ar: "متعدد الاستعمالات 3×1 · ليمون · 300 مل" } }
          ]
        },
        {
          slug: "pate-lavante",
          name: { fr: "Pâte Lavante", ar: "عجينة الجلي" },
          variants: [
            { image: "vaisselle-pate-citron.webp", alt: "OMI Pâte Lavante Multi-Usage Citron",
              sub: { fr: "Multi-usage · Citron", ar: "متعدد الاستعمالات · ليمون" } }
          ]
        }
      ]
    },

    /* ========== 5 · HYGIÈNE & SOIN PERSONNEL ================== */
    {
      slug: "hygiene-soin-personnel",
      name: { fr: "Hygiène & Soin Personnel", ar: "النظافة والعناية الشخصية" },
      desc: { fr: "Savons doux pour toute la famille, au quotidien.",
              ar: "صابون ناعم لكل أفراد العائلة، كل يوم." },
      benefits: [
        { fr: "Douceur au quotidien", ar: "نعومة يومية" },
        { fr: "Hydratation et fraîcheur", ar: "ترطيب وانتعاش" },
        { fr: "Formules délicates", ar: "تركيبات لطيفة" },
        { fr: "Pour toute la famille", ar: "لكل أفراد العائلة" }
      ],
      accent: "lavender",
      products: [
        {
          slug: "savon-liquide-mains",
          name: { fr: "Savon Liquide Mains", ar: "صابون سائل لليدين" },
          axes: {
            scent: {
              label: { fr: "Parfum", ar: "العطر" },
              style: "swatch",
              values: [
                { key: "original",  label: { fr: "Original",  ar: "أصلي" },   swatch: "#2fa9e6" },
                { key: "lavande",   label: { fr: "Lavande",   ar: "الخزامة" }, swatch: "#a06fd6" },
                { key: "camomille", label: { fr: "Camomille", ar: "بابونج" }, swatch: "#7cc243" }
              ]
            },
            size: {
              label: { fr: "Format", ar: "الحجم" },
              style: "pill",
              values: [
                { key: "500", label: { fr: "500 ml", ar: "500 مل" } },
                { key: "300", label: { fr: "300 ml", ar: "300 مل" } }
              ]
            }
          },
          /* no `sub` — the card/PDP line is built from the axes above */
          variants: [
            { scent: "original",  size: "500", image: "savon-original-500.webp",  alt: "OMI Savon Liquide Mains Original 500 ml" },
            { scent: "original",  size: "300", image: "savon-original-300.webp",  alt: "OMI Savon Liquide Mains Original 300 ml" },
            { scent: "lavande",   size: "300", image: "savon-lavande.webp",       alt: "OMI Savon Liquide Mains Lavande 300 ml" },
            { scent: "camomille", size: "500", image: "savon-camomille-500.webp", alt: "OMI Savon Liquide Mains Camomille 500 ml" },
            { scent: "camomille", size: "300", image: "savon-camomille-300.webp", alt: "OMI Savon Liquide Mains Camomille 300 ml" }
          ]
        }
      ]
    },

    /* ========== 6 · MAXI PLUS (papiers — sibling brand) ======== */
    /* A real category since the restructure. The `brand:"maxiplus"` flags on
       its products are informational only — no code reads them anymore. */
    {
      slug: "maxiplus",
      name: { fr: "Maxi Plus", ar: "ماكسي بلس" },
      desc: { fr: "Papiers et mouchoirs doux, pensés pour toute la famille.",
              ar: "ورق ومناديل ناعمة، مصمّمة لكل أفراد العائلة." },
      benefits: [
        { fr: "Ultra absorbant", ar: "امتصاص فائق" },
        { fr: "Résistant et solide", ar: "متين وقوي" },
        { fr: "Doux au toucher", ar: "ناعم الملمس" },
        { fr: "Pour toute la famille", ar: "لكل أفراد العائلة" }
      ],
      products: [
        {
          slug: "essuie-tout",
          name: { fr: "Essuie-Tout", ar: "فوط مطبخ" },
          brand: "maxiplus",
          axes: {
            type: {
              label: { fr: "Format", ar: "النوع" },
              style: "pill",
              values: [
                { key: "classic", label: { fr: "Classic",    ar: "كلاسيك" } },
                { key: "jumbo",   label: { fr: "Jumbo",      ar: "جامبو" } },
                { key: "cuisine", label: { fr: "Rouleau ×2", ar: "لفافة ×2" } }
              ]
            }
          },
          variants: [
            { type: "classic", image: "maxi-essuie-tout.webp",      alt: "Maxi Plus Essuie-Tout Classic" },
            { type: "jumbo",   image: "maxi-essuie-tout-jumbo.webp", alt: "Maxi Plus Essuie-Tout Jumbo" },
            { type: "cuisine", image: "maxi-kitchen-roll.webp",      alt: "Maxi Plus Essuie-Tout Cuisine ×2 Ultra Absorbant" }
          ]
        },
        {
          slug: "mouchoirs",
          name: { fr: "Mouchoirs", ar: "مناديل" },
          brand: "maxiplus",
          axes: {
            type: {
              label: { fr: "Format", ar: "النوع" },
              style: "pill",
              values: [
                { key: "pack", label: { fr: "Pack ×6",      ar: "عبوة ×6" } },
                { key: "box",  label: { fr: "Boîte 2 plis", ar: "علبة طبقتان" } }
              ]
            }
          },
          variants: [
            { type: "pack", image: "maxi-mouchoirs-pack.webp", alt: "Maxi Plus Mouchoirs Classic Pack ×6" },
            { type: "box",  image: "maxi-mouchoirs-box.webp",  alt: "Maxi Plus Mouchoirs Classic Boîte 2 plis" }
          ]
        },
        {
          slug: "serviettes-table",
          name: { fr: "Serviettes de Table", ar: "مناديل المائدة" },
          brand: "maxiplus",
          variants: [
            { image: "toadd1.webp", alt: "Maxi Plus Serviettes de Table Original 80",
              sub: { fr: "Original · 80 serviettes", ar: "أصلي · 80 منديلاً" } }
          ]
        },
        {
          slug: "papier-hygienique",
          name: { fr: "Papier Hygiénique", ar: "ورق تواليت" },
          brand: "maxiplus",
          variants: [
            { image: "toadd7.webp", alt: "Maxi Plus Papier Hygiénique Confort 12 Rouleaux",
              sub: { fr: "Confort · 12 rouleaux", ar: "كومفور · 12 لفة" } }
          ]
        }
      ]
    }

  ]
};

/* ============================================================
   PRODUCT-PAGE content (produit.html) — the Dettol-style sections.
   - features / howto / callout  = PER CATEGORY (every product in a
     category shares them), keyed by category slug below.
   - safety / didYouKnow          = GLOBAL (same across the whole site).
   `icon:"keyword"` is a PLACEHOLDER — the term to search on flaticon.
   Until a real SVG is added it renders as a small labelled placeholder.
   Any `*photo:""` renders a labelled placeholder box; set a filename in
   ./assets/ to use a real image.  TO EDIT: change this block.
   ============================================================ */
window.OMI_DATA.categoryContent = {

  "sols-surfaces-vitres": {
    heroKitchen: "kitchen.webp",   /* Dettol-style kitchen bg behind the product (this category only) */
    features: [
      { icon: "sparkle-clean", label: { fr: "Sans traces",         ar: "بدون آثار" } },
      { icon: "fast-dry",      label: { fr: "Séchage rapide",       ar: "جفاف سريع" } },
      { icon: "air-freshener", label: { fr: "Parfum longue durée",  ar: "عطر يدوم طويلاً" } },
      { icon: "surfaces",      label: { fr: "Toutes surfaces",      ar: "لكل الأسطح" } }
    ],
    howto: [
      { fr: "Diluer un bouchon dans l'eau, ou vaporiser directement.", ar: "خفّف غطاءً في الماء، أو رشّ مباشرة." },
      { fr: "Appliquer sur la surface à nettoyer.", ar: "طبّق على السطح المراد تنظيفه." },
      { fr: "Essuyer avec un chiffon propre.", ar: "امسح بقطعة قماش نظيفة." },
      { fr: "Laisser sécher — aucun rinçage nécessaire.", ar: "اترك حتى يجف — دون حاجة للشطف." }
    ],
    callout: {
      title: { fr: "Une maison éclatante, sans effort.", ar: "منزل مشرق، دون عناء." },
      text:  { fr: "Sols, plans de travail et vitres retrouvent leur brillance, sans traces ni résidus.", ar: "الأرضيات والأسطح والزجاج تستعيد لمعانها، بدون آثار أو بقايا." },
      photo: ""
    }
  },

  "entretien-du-linge": {
    features: [
      { icon: "stain-removal", label: { fr: "Anti-taches",       ar: "مزيل للبقع" } },
      { icon: "freshness",     label: { fr: "Fraîcheur durable", ar: "نضارة تدوم" } },
      { icon: "fabric-care",   label: { fr: "Doux pour les fibres", ar: "لطيف على الأنسجة" } },
      { icon: "scent",         label: { fr: "Parfums variés",    ar: "عطور متنوعة" } }
    ],
    howto: [
      { fr: "Doser selon la charge de linge.", ar: "حدّد الكمية حسب حجم الغسيل." },
      { fr: "Verser dans le tambour ou le bac.", ar: "صبّ في الحلة أو الدرج." },
      { fr: "Laver au programme habituel.", ar: "اغسل بالبرنامج المعتاد." },
      { fr: "Profiter d'un linge propre et parfumé.", ar: "استمتع بغسيل نظيف ومعطّر." }
    ],
    callout: {
      title: { fr: "Un linge éclatant, lavage après lavage.", ar: "غسيل ناصع، مرة بعد مرة." },
      text:  { fr: "Une action anti-taches puissante et une fraîcheur qui dure, tout en respectant les fibres.", ar: "فعالية قوية ضد البقع ونضارة تدوم، مع الحفاظ على الأنسجة." },
      photo: ""
    }
  },

  "javel": {
    features: [
      { icon: "disinfect", label: { fr: "Désinfecte",   ar: "تُطهّر" } },
      { icon: "whitening", label: { fr: "Blancheur",    ar: "بياض ناصع" } },
      { icon: "germs",     label: { fr: "Anti-germes",  ar: "مضاد للجراثيم" } },
      { icon: "scent",     label: { fr: "Parfums variés", ar: "عطور متنوعة" } }
    ],
    howto: [
      { fr: "Diluer un bouchon dans un litre d'eau.", ar: "خفّف غطاءً في لتر من الماء." },
      { fr: "Appliquer sur la surface ou le linge blanc.", ar: "طبّق على السطح أو الغسيل الأبيض." },
      { fr: "Laisser agir quelques minutes.", ar: "اتركه يعمل بضع دقائق." },
      { fr: "Rincer abondamment à l'eau claire.", ar: "اشطف جيداً بالماء النظيف." }
    ],
    callout: {
      title: { fr: "Une propreté saine et désinfectée.", ar: "نظافة صحية ومُطهّرة." },
      text:  { fr: "Élimine les germes et les bactéries, blanchit et ravive, pour une maison plus saine.", ar: "يقضي على الجراثيم والبكتيريا، ويُبيّض وينعش، لمنزل أكثر صحة." },
      photo: ""
    }
  },

  "vaisselle-cuisine": {
    features: [
      { icon: "grease-cut", label: { fr: "Dégraissant",    ar: "مزيل للدهون" } },
      { icon: "shine",      label: { fr: "Brillance",      ar: "لمعان" } },
      { icon: "hand-care",  label: { fr: "Doux pour les mains", ar: "لطيف على اليدين" } },
      { icon: "multi-use",  label: { fr: "Multi-usages",   ar: "متعدد الاستعمالات" } }
    ],
    howto: [
      { fr: "Verser quelques gouttes sur l'éponge humide.", ar: "ضع بضع قطرات على الإسفنجة المبللة." },
      { fr: "Laver la vaisselle.", ar: "اغسل الأواني." },
      { fr: "Rincer à l'eau claire.", ar: "اشطف بالماء النظيف." },
      { fr: "Laisser briller.", ar: "اتركها تلمع." }
    ],
    callout: {
      title: { fr: "Une vaisselle brillante, sans effort.", ar: "أوانٍ لامعة، دون عناء." },
      text:  { fr: "Un dégraissage express et une brillance sans traces, tout en douceur pour les mains.", ar: "إزالة سريعة للدهون ولمعان بدون آثار، مع لطف على اليدين." },
      photo: ""
    }
  },

  "hygiene-soin-personnel": {
    features: [
      { icon: "soft-drop",  label: { fr: "Douceur",       ar: "نعومة" } },
      { icon: "moisture",   label: { fr: "Hydratation",   ar: "ترطيب" } },
      { icon: "gentle",     label: { fr: "Formule délicate", ar: "تركيبة لطيفة" } },
      { icon: "family",     label: { fr: "Toute la famille", ar: "لكل العائلة" } }
    ],
    howto: [
      { fr: "Appliquer une noisette sur mains humides.", ar: "ضع قليلاً على اليدين المبللتين." },
      { fr: "Faire mousser une vingtaine de secondes.", ar: "دلّك لتكوين رغوة نحو 20 ثانية." },
      { fr: "Rincer à l'eau claire.", ar: "اشطف بالماء النظيف." },
      { fr: "Sécher — peau douce et fraîche.", ar: "جفّف — بشرة ناعمة ومنتعشة." }
    ],
    callout: {
      title: { fr: "La douceur au quotidien.", ar: "نعومة كل يوم." },
      text:  { fr: "Des formules délicates qui nettoient tout en hydratant, pour toute la famille.", ar: "تركيبات لطيفة تنظّف وترطّب، لكل أفراد العائلة." },
      photo: ""
    }
  },

  "maxiplus": {
    features: [
      { icon: "absorbent",  label: { fr: "Ultra absorbant", ar: "امتصاص فائق" } },
      { icon: "strong",     label: { fr: "Résistant",       ar: "متين" } },
      { icon: "soft-touch", label: { fr: "Doux au toucher", ar: "ناعم الملمس" } },
      { icon: "family",     label: { fr: "Toute la famille", ar: "لكل العائلة" } }
    ],
    howto: [
      { fr: "Détacher une feuille selon le besoin.", ar: "افصل ورقة حسب الحاجة." },
      { fr: "Essuyer ou nettoyer la surface.", ar: "امسح أو نظّف السطح." },
      { fr: "Jeter après usage.", ar: "تخلّص منها بعد الاستعمال." }
    ],
    callout: {
      title: { fr: "Douceur et résistance, chaque jour.", ar: "نعومة ومتانة، كل يوم." },
      text:  { fr: "Des papiers et mouchoirs ultra absorbants et solides, pensés pour toute la famille.", ar: "ورق ومناديل فائقة الامتصاص ومتينة، مصمّمة لكل العائلة." },
      photo: ""
    }
  }

};

/* GLOBAL — one safety block + one did-you-know for the whole site */
window.OMI_DATA.safety = {
  photo: "",
  tips: [
    { icon: "as-directed",  label: { fr: "Utiliser selon les indications.", ar: "استعمل حسب التعليمات." } },
    { icon: "no-children",  label: { fr: "Tenir hors de portée des enfants.", ar: "يُحفظ بعيداً عن متناول الأطفال." } },
    { icon: "eye-rinse",    label: { fr: "En cas de contact avec les yeux, rincer abondamment à l'eau.", ar: "عند ملامسة العينين، اشطف بكثير من الماء." } },
    { icon: "if-swallowed", label: { fr: "En cas d'ingestion, consulter un médecin.", ar: "في حال الابتلاع، استشر الطبيب." } }
  ]
};

window.OMI_DATA.didYouKnow = {
  photo: "",
  title: { fr: "Le saviez-vous ?", ar: "هل تعلم؟" },
  text:  { fr: "Nettoyer réduit la propagation des germes, mais certaines bactéries persistent. Désinfecter régulièrement garde la maison plus saine.",
           ar: "التنظيف يقلّل انتشار الجراثيم، لكن بعض البكتيريا تبقى. التطهير المنتظم يحافظ على منزل أكثر صحة." }
};

/* Feature icons that now have a real SVG at assets/<keyword>.svg — rendered
   white via CSS mask on the blue Features band. Add keywords here as you add
   more SVGs (filename must equal the `icon` keyword). */
window.OMI_DATA.iconsReady = ["sparkle-clean", "fast-dry", "air-freshener", "surfaces"];

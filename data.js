/* ============================================================
   OMI — content data  (single source of truth)
   ------------------------------------------------------------
   The homepage product range (Tous + 5 category tabs, one static
   card per variant) renders from this file at runtime by app.js.
   Nothing about the range is hardcoded in index.html.

   The whole site is standardised on 5 categories:
     1. Sols, Surfaces & Vitres
     2. Entretien du Linge      (Lessive)
     3. Eau de Javel
     4. Vaisselle & Cuisine
     5. Hygiène & Soin Personnel (Savon mains + Papiers/Maxiplus)

   MODEL
   -----
   categories[]                      -> one tab each
     ├ name        {fr,ar}
     ├ accent?     "blue"|"gold"|"green"|"lavender"  -> same colour as its
     │                                  card in "L'Excellence" (services
     │                                  section); styles the filter chip
     ├ brandLogo?  "file.webp"        -> shown next to the tab label
     │                                  (e.g. Maxiplus, on category 4)
     ├ products[]  OR  groups[]      -> a category is EITHER a flat
     │                                  product list, OR sub-groups
     │                                  (groups are a data grouping only —
     │                                  rendered as one flat card grid,
     │                                  no sub-heading in the UI).
     │   groups[] : { name:{fr,ar}, products:[...] }
     └ (product)
         ├ name    {fr,ar}           -> card title (shared by all its variants)
         ├ axes?   {scent?,size?,type?}  -> used only to label each variant,
         │     each axis: { label:{fr,ar}, style:"swatch"|"pill",       there is no in-card picker
         │                  values:[ {key,label:{fr,ar},swatch?} ] }
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
            { image: "vaisselle-liquide-citron.webp", alt: "OMI Liquide Vaisselle Multi-Usages 3x1 Citron",
              sub: { fr: "Multi-usages 3×1 · Citron", ar: "متعدد الاستعمالات 3×1 · ليمون" } }
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
      desc: { fr: "Savons et papiers doux pour toute la famille, au quotidien.",
              ar: "صابون وورق ناعم لكل أفراد العائلة، كل يوم." },
      benefits: [
        { fr: "Douceur au quotidien", ar: "نعومة يومية" },
        { fr: "Hydratation et fraîcheur", ar: "ترطيب وانتعاش" },
        { fr: "Formules délicates", ar: "تركيبات لطيفة" },
        { fr: "Pour toute la famille", ar: "لكل أفراد العائلة" }
      ],
      accent: "lavender",
      /* this category carries the Maxiplus paper range — shown as a small
         logo on the category tab itself, not repeated on every card */
      brandLogo: "maxiplus-logo.webp",
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
            }
          },
          variants: [
            { scent: "original",  image: "savon-original.webp",  alt: "OMI Savon Liquide Mains Original",
              sub: { fr: "Hydratation intense · 300 & 500 ml", ar: "ترطيب مكثف · 300 و 500 مل" } },
            { scent: "lavande",   image: "savon-lavande.webp",   alt: "OMI Savon Liquide Mains Lavande",
              sub: { fr: "Parfum lavande · 300 ml", ar: "عطر الخزامة · 300 مل" } },
            { scent: "camomille", image: "savon-camomille.webp", alt: "OMI Savon Liquide Mains Camomille",
              sub: { fr: "Camomille · 300 & 500 ml", ar: "بابونج · 300 و 500 مل" } }
          ]
        },
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

/* ==========================================================================
   ملف الإعدادات المركزي (عدّل بيانات أي مطعم أو كافيه من هنا فقط)
   ========================================================================== */

window.CAFE_CONFIG = {
  brandName: "Velvet Roast Café",
  brandEmoji: "☕",
  statusBadge: "● تحضير طازج مباشر",
  heroTag: "✨ فن القهوة المختصة • تجربة تفاعلية",
  heroTitle: "تذوق اللحظة.. من أول قطرة إسبريسو حتى آخر رشفة",
  heroSubtitle: "اضغط على أي مشروب أو حلى لمشاهدته عن قرب، خصص حجم كوبك ونكهتك، واحصل على فاتورتك الفورية عبر واتساب.",
  whatsappNumber: "967772457941",
  currency: "ريال",
  receiptPrefix: "VR",
  receiptBarcodeText: "* VELVET-ROAST-VIP-ORDER *",
  developerCredit: "Ammar Mofleh",

  // مفاتيح التخزين المحلي (للتجربة قبل ربط قاعدة البيانات)
  storageKey: "velvet_roast_items_v3",
  banksStorageKey: "velvet_roast_bank_accounts",
  adminPassword: "714457365", // غيّر كلمة المرور قبل التسليم للعميل

  // إعدادات قاعدة البيانات السحابية Supabase (اتركها فارغة للتجربة المحلية في VS Code)
   supabaseUrl: "https://wlnpcfggotkxeklugocn.supabase.co",
   receiptsBucket: "receipts",


  // مكتبة الصور المحلية الجاهزة
  imageLibrary: [
    { label: "سبانيش لاتيه ساخن", path: "images/hot-latte.jpg" },
    { label: "كابتشينو", path: "images/cappuccino.jpg" },
    { label: "آيس كراميل ماكياتو", path: "images/iced-macchiato.jpg" },
    { label: "آيس سبانيش لاتيه", path: "images/iced-spanish-latte.jpg" },
    { label: "تشيز كيك", path: "images/cheesecake.jpg" },
    { label: "كيك شوكولاتة", path: "images/chocolate-espresso-cake.jpg" },
    { label: "موهيتو باشن", path: "images/passion-mojito.jpg" },
    { label: "سموذي مانجو وفراولة", path: "images/mango-strawberry-smoothie.jpg" },
    { label: "خلفية الكافيه", path: "images/hero-coffee.jpg" }
  ],
  sizes: [
    { label: "صغير (S)", extra: 0 },
    { label: "وسط (M)", extra: 300 },
    { label: "كبير (L)", extra: 600 }
  ],
  categories: [
    { id: "all", label: "✨ الكل", title: "قائمة الكافيه الكاملة" },
    { id: "hot", label: "☕ قهوة ساخنة", title: "القهوة الساخنة" },
    { id: "iced", label: "🧊 مشروبات باردة", title: "المشروبات الباردة" },
    { id: "desserts", label: "🍰 حلويات وكيك", title: "الحلويات والكيك" },
    { id: "juices", label: "🍹 عصائر وموهيتو", title: "العصائر والموهيتو" }
  ],

  // حسابات بنكية افتراضية (يمكن تعديلها وإضافتها من لوحة الإدارة)
  defaultBanks: [
    { id: 1, bankName: "بنك الكريمي", accountNumber: "3001234567", accountHolder: "Velvet Roast Café" },
    { id: 2, bankName: "محفظة جوالي / ون كاش", accountNumber: "772457941", accountHolder: "Ammar Mofleh" }
  ]
};

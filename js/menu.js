/* ==========================================================================
   Menu Catalog, Interactive Stage, Hidden Admin Entry & Cart Logic
   ========================================================================== */

const CAFE_ITEMS = [
  {
    id: 1,
    name: "سبانيش لاتيه ساخن",
    category: "hot",
    price: 1400,
    badge: "الأكثر طلباً",
    hasSizes: true,
    available: true,
    addons: ["حليب كامل الدسم", "حليب قليل الدسم", "إكسترا شوت إسبريسو (+300)", "سكر وسط"],
    desc: "إسبريسو غني ممزوج بالحليب المبخر والحليب المكثف المحلى برسمة لاتيه آرت.",
    image: "images/hot-latte.jpg"
  },
  {
    id: 2,
    name: "كابتشينو إيطالي كلاسيك",
    category: "hot",
    price: 1200,
    badge: "فاخر",
    hasSizes: true,
    available: true,
    addons: ["رغوة كثيفة + كاكاو", "قرفة ناعمة", "بدون سكر", "حليب لوز (+400)"],
    desc: "شوت إسبريسو فاخر مع رغوة حليب مخملية كثيفة ورشة كاكاو داكن.",
    image: "images/cappuccino.jpg"
  },
  {
    id: 3,
    name: "آيس كراميل ماكياتو",
    category: "iced",
    price: 1600,
    badge: "مميز",
    hasSizes: true,
    available: true,
    addons: ["ثلج عادي + صوص كراميل", "ثلج خفيف", "إكسترا كراميل (+200)", "كريمة مخفوقة (+300)"],
    desc: "حليب بارد مع مكعبات الثلج وشوت إسبريسو طازج مغطى بصوص الكراميل المملح.",
    image: "images/iced-macchiato.jpg"
  },
  {
    id: 4,
    name: "آيس سبانيش لاتيه",
    category: "iced",
    price: 1500,
    badge: "الأكثر مبيعاً",
    hasSizes: true,
    available: true,
    addons: ["حلاوة متوازنة", "حلاوة خفيفة", "إكسترا شوت (+300)", "ثلج إضافي"],
    desc: "مزيج القهوة المختصة المثلجة مع الحليب البارد ولمسة حلاوة كريمية.",
    image: "images/iced-spanish-latte.jpg"
  },
  {
    id: 5,
    name: "تشيز كيك سان سيباستيان",
    category: "desserts",
    price: 2000,
    badge: "طازج يومياً",
    hasSizes: false,
    available: true,
    addons: ["صوص شوكولاتة بلجيكية", "صوص كراميل مملح", "صوص توت أحمر", "بدون صوص"],
    desc: "قطعة تشيز كيك مكرملة من الخارج وكريمية من الداخل تذوب في الفم.",
    image: "images/cheesecake.jpg"
  },
  {
    id: 6,
    name: "كيكة الشوكولاتة والإسبريسو",
    category: "desserts",
    price: 1800,
    badge: "شيف سبيشال",
    hasSizes: false,
    available: true,
    addons: ["تقديم دافئ + آيسكريم (+400)", "صوص جاناش إضافي", "تقديم عادي"],
    desc: "طبقات كيك الشوكولاتة الداكنة الغنية بنكهة الإسبريسو وصوص الجاناش.",
    image: "images/chocolate-espresso-cake.jpg"
  },
  {
    id: 7,
    name: "موهيتو باشن فروت منعش",
    category: "juices",
    price: 1300,
    badge: "منعش",
    hasSizes: true,
    available: true,
    addons: ["سفن أب + نعناع طازج", "مياه غازية (دايت)", "إكسترا باشن فروت (+250)"],
    desc: "نكهة فاكهة الباشن الاستوائية مع أوراق النعناع الطازجة وشرائح الليمون.",
    image: "images/passion-mojito.jpg"
  },
  {
    id: 8,
    name: "سموذي مانجو وفراولة",
    category: "juices",
    price: 1500,
    badge: "طبيعي 100%",
    hasSizes: true,
    available: true,
    addons: ["بدون سكر مضاف", "عسل طبيعي (+300)", "إضافة قطع فواكه"],
    desc: "طبقات من عصير المانجو الطبيعي والفراولة الطازجة بدون أي إضافات صناعية.",
    image: "images/mango-strawberry-smoothie.jpg"
  }
];

const CFG = window.CAFE_CONFIG || {};
let ACTIVE_CAFE_ITEMS = [...CAFE_ITEMS];

let currentCategory = "all";
let searchQuery = "";
window.cafeCart = [];

let activeStageItem = null;
let selectedSizeExtra = 0;
let selectedSizeLabel = (CFG.sizes && CFG.sizes[0]) ? CFG.sizes[0].label : "قياسي";
let selectedAddon = "";

const menuGrid = document.getElementById("menuGrid");
const categoryTitle = document.getElementById("currentCategoryTitle");
const itemsCount = document.getElementById("itemsCount");
const searchInput = document.getElementById("searchInput");

// مدخل سري للإدارة: 3 نقرات متتالية على شعار أو اسم الكافيه
(function setupSecretAdminEntry() {
  const brandEl = document.getElementById("brandLogoTrigger");
  if (!brandEl) return;
  let tapCount = 0;
  let tapTimer = null;
  brandEl.addEventListener("click", () => {
    tapCount += 1;
    clearTimeout(tapTimer);
    if (tapCount >= 3) {
      tapCount = 0;
      window.location.href = "admin.html";
      return;
    }
    tapTimer = setTimeout(() => { tapCount = 0; }, 1400);
  });
})();

function applyBrandConfig() {
  if (!document.getElementById("brandNameTitle")) return;
  document.title = `${CFG.brandName} | المنيو التفاعلي`;
  document.getElementById("brandLogoEmoji").textContent = CFG.brandEmoji;
  document.getElementById("brandNameTitle").textContent = CFG.brandName;
  document.getElementById("brandStatusBadge").textContent = CFG.statusBadge;
  document.getElementById("heroTag").textContent = CFG.heroTag;
  document.getElementById("heroTitle").textContent = CFG.heroTitle;
  document.getElementById("heroSubtitle").textContent = CFG.heroSubtitle;
  document.getElementById("receiptBrandTitle").textContent = (CFG.brandName || "").toUpperCase();
  document.getElementById("receiptLogoEmoji").textContent = CFG.brandEmoji;
  document.getElementById("receiptBarcodeText").textContent = CFG.receiptBarcodeText;
  document.getElementById("footerDevName").textContent = CFG.developerCredit;

  const catContainer = document.getElementById("categoryButtons");
  if (catContainer && CFG.categories) {
    catContainer.innerHTML = CFG.categories.map((cat, idx) => `
      <button class="cat-btn ${idx === 0 ? "active" : ""}" data-category="${cat.id}">${cat.label}</button>
    `).join("");
    catContainer.querySelectorAll(".cat-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        catContainer.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentCategory = btn.dataset.category;
        renderMenu();
      });
    });
  }

  const sizePills = document.getElementById("sizePills");
  if (sizePills && CFG.sizes) {
    sizePills.innerHTML = CFG.sizes.map((s, idx) => `
      <button type="button" class="size-pill ${idx === 0 ? "active" : ""}" data-extra="${s.extra}" data-label="${s.label}">
        ${s.label}${s.extra > 0 ? ` +${s.extra}` : ""}
      </button>
    `).join("");
    sizePills.querySelectorAll(".size-pill").forEach(btn => {
      btn.addEventListener("click", () => {
        sizePills.querySelectorAll(".size-pill").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedSizeExtra = parseInt(btn.dataset.extra, 10) || 0;
        selectedSizeLabel = btn.dataset.label;
        updateStagePrice();
      });
    });
  }
}

window.addEventListener("scroll", () => {
  const bar = document.getElementById("scrollProgress");
  if (!bar) return;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.width = h > 0 ? `${(window.scrollY / h) * 100}%` : "0%";
}, { passive: true });

function getCategoryTitle(catId) {
  const found = (CFG.categories || []).find(c => c.id === catId);
  return found ? found.title : "قائمة الكافيه الكاملة";
}

function renderMenu() {
  if (!menuGrid) return;

  const q = searchQuery.toLowerCase();
  const filtered = ACTIVE_CAFE_ITEMS.filter(item => {
    const matchesCat = currentCategory === "all" || item.category === currentCategory;
    const matchesSearch = item.name.toLowerCase().includes(q) || (item.desc || "").toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  categoryTitle.textContent = getCategoryTitle(currentCategory);
  itemsCount.textContent = `${filtered.length} صنف`;

  if (filtered.length === 0) {
    menuGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:var(--muted); padding:30px;">لا توجد أصناف مطابقة لبحثك حالياً.</p>`;
    return;
  }

  menuGrid.innerHTML = filtered.map(item => {
    const isAvail = item.available !== false;
    return `
      <article class="cafe-card ${isAvail ? "" : "is-unavailable"}" ${isAvail ? `onclick="openProductStage(${item.id})"` : ""}>
        ${!isAvail ? `<span class="soldout-badge">نفد اليوم</span>` : ""}
        <div class="card-floating-img">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
        </div>
        <div class="card-body">
          ${isAvail && item.badge ? `<span class="item-badge">${item.badge}</span>` : ""}
          <h3>${item.name}</h3>
          <p class="item-desc">${item.desc}</p>
          <div class="card-footer">
            <span class="item-price">${Number(item.price).toLocaleString()} ${CFG.currency || "ريال"}</span>
            <button type="button" class="preview-item-btn" ${isAvail ? "" : "disabled"}>
              ${isAvail ? "✨ معاينة وطلب" : "غير متوفر حالياً"}
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  if (typeof gsap !== "undefined") {
    gsap.fromTo(".cafe-card",
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, stagger: 0.05, ease: "power2.out", clearProps: "transform" }
    );
  }
}

function buildStageVisual(item) {
  if (item.category === "hot") {
    return `
      <div class="hot-coffee-showcase">
        <div class="hot-steam"><span></span><span></span><span></span></div>
        <div class="product-orb-showcase" style="--orb-glow: #d99148;">
          <img src="${item.image}" alt="${item.name}">
        </div>
      </div>
      <div class="stage-caption">☕ ${item.name} — يُحضّر طازجاً الآن</div>
    `;
  }

  let caption = "🧊 انتعاش مثلج يحضّر لحظة بطلبك";
  let glowColor = "#38bdf8";

  if (item.category === "desserts") {
    caption = "🍰 يُقدّم طازجاً مع الصوص الغني";
    glowColor = "#d99148";
  } else if (item.category === "juices") {
    caption = "🍹 فواكه طبيعية وانتعاش فوري";
    glowColor = "#10b981";
  }

  return `
    <div class="product-orb-showcase" style="--orb-glow: ${glowColor};">
      <img src="${item.image}" alt="${item.name}">
    </div>
    <div class="stage-caption">${caption}</div>
  `;
}

window.openProductStage = function (id) {
  const item = ACTIVE_CAFE_ITEMS.find(m => m.id === id);
  if (!item || item.available === false) return;

  activeStageItem = item;
  selectedSizeExtra = (CFG.sizes && CFG.sizes[0]) ? CFG.sizes[0].extra : 0;
  selectedSizeLabel = item.hasSizes ? ((CFG.sizes && CFG.sizes[0]) ? CFG.sizes[0].label : "صغير (S)") : "قطعة قياسية";
  selectedAddon = (item.addons && item.addons[0]) || "تحضير قياسي";

  document.getElementById("stageVisual").innerHTML = buildStageVisual(item);
  document.getElementById("stageCategory").textContent = getCategoryTitle(item.category);
  document.getElementById("stageTitle").textContent = item.name;
  document.getElementById("stageDesc").textContent = item.desc;

  const sizeGroup = document.getElementById("sizeOptionGroup");
  sizeGroup.style.display = item.hasSizes ? "block" : "none";

  document.querySelectorAll("#sizePills .size-pill").forEach((btn, idx) => {
    btn.classList.toggle("active", idx === 0);
  });

  const addonPillsEl = document.getElementById("addonPills");
  const addons = item.addons && item.addons.length ? item.addons : ["تحضير قياسي"];
  addonPillsEl.innerHTML = addons.map((addon, i) => `
    <button type="button" class="addon-pill ${i === 0 ? "active" : ""}" data-addon="${addon}">${addon}</button>
  `).join("");

  addonPillsEl.querySelectorAll(".addon-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      addonPillsEl.querySelectorAll(".addon-pill").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedAddon = btn.dataset.addon;
      updateStagePrice();
    });
  });

  updateStagePrice();
  document.getElementById("productStage").classList.add("open");
};

function getAddonExtraPrice(addonText) {
  const match = String(addonText || "").match(/\+(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function updateStagePrice() {
  if (!activeStageItem) return;
  const addonExtra = getAddonExtraPrice(selectedAddon);
  const finalPrice = Number(activeStageItem.price) + selectedSizeExtra + addonExtra;
  document.getElementById("stageFinalPrice").textContent = `${finalPrice.toLocaleString()} ${CFG.currency || "ريال"}`;
}

const closeStageBtn = document.getElementById("closeStageBtn");
if (closeStageBtn) {
  closeStageBtn.addEventListener("click", () => {
    document.getElementById("productStage").classList.remove("open");
  });
}

const productStage = document.getElementById("productStage");
if (productStage) {
  productStage.addEventListener("click", (e) => {
    if (e.target.id === "productStage") productStage.classList.remove("open");
  });
}

const confirmStageAddBtn = document.getElementById("confirmStageAddBtn");
if (confirmStageAddBtn) {
  confirmStageAddBtn.addEventListener("click", () => {
    if (!activeStageItem) return;

    const addonExtra = getAddonExtraPrice(selectedAddon);
    const unitPrice = Number(activeStageItem.price) + selectedSizeExtra + addonExtra;
    const customKey = `${activeStageItem.id}-${selectedSizeLabel}-${selectedAddon}`;

    const existing = window.cafeCart.find(c => c.key === customKey);
    if (existing) {
      existing.qty += 1;
    } else {
      window.cafeCart.push({
        key: customKey,
        name: activeStageItem.name,
        size: selectedSizeLabel,
        addon: selectedAddon,
        price: unitPrice,
        qty: 1
      });
    }

    document.getElementById("productStage").classList.remove("open");
    updateCartUI();
    showToast(`✓ أُضيف "${activeStageItem.name}" إلى فاتورتك`);
  });
}

function showToast(msg) {
  const toast = document.getElementById("toastNotify");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2300);
}

window.changeQty = function (index, delta) {
  if (!window.cafeCart[index]) return;
  window.cafeCart[index].qty += delta;
  if (window.cafeCart[index].qty <= 0) {
    window.cafeCart.splice(index, 1);
  }
  updateCartUI();
};

window.clearCafeCart = function () {
  if (!window.cafeCart.length) return;
  window.cafeCart = [];
  updateCartUI();
  const overlay = document.getElementById("cartOverlay");
  if (overlay) overlay.classList.remove("open");
  showToast("تم إفراغ الفاتورة");
};

window.updateCartUI = function () {
  const floatingBtn = document.getElementById("openCartBtn");
  if (!floatingBtn) return;

  const totalQtyEl = document.getElementById("cartTotalQty");
  const totalAmountEl = document.getElementById("cartTotalAmount");
  const drawerTotalEl = document.getElementById("drawerTotalPrice");
  const rcpTotalItemsEl = document.getElementById("rcpTotalItems");
  const cartListEl = document.getElementById("cartItemsList");

  const totalQty = window.cafeCart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = window.cafeCart.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (totalQty > 0) {
    floatingBtn.style.display = "flex";
    totalQtyEl.textContent = totalQty;
    totalAmountEl.textContent = `${totalPrice.toLocaleString()} ${CFG.currency || "ريال"}`;
  } else {
    floatingBtn.style.display = "none";
  }

  drawerTotalEl.textContent = `${totalPrice.toLocaleString()} ${CFG.currency || "ريال"}`;
  if (rcpTotalItemsEl) rcpTotalItemsEl.textContent = totalQty;

  if (window.cafeCart.length === 0) {
    cartListEl.innerHTML = `<p style="text-align:center; color:#7c685b; padding:20px 0; font-size:13px;">الفاتورة فارغة حالياً.. اختر مشروبك المفضل!</p>`;
    return;
  }

  cartListEl.innerHTML = window.cafeCart.map((item, idx) => `
    <div class="rcp-item-row">
      <div class="rcp-item-meta">
        <h5>${item.name}</h5>
        <small>${item.size} • ${item.addon}</small>
        <strong style="font-size:13px; color:#8c4b18;">${(item.price * item.qty).toLocaleString()} ${CFG.currency || "ريال"}</strong>
      </div>
      <div class="rcp-qty-box">
        <button type="button" class="rcp-qty-btn" onclick="changeQty(${idx}, -1)">-</button>
        <strong>${item.qty}</strong>
        <button type="button" class="rcp-qty-btn" onclick="changeQty(${idx}, 1)">+</button>
      </div>
    </div>
  `).join("");
};

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.trim();
    renderMenu();
  });
}

(async function initMenu() {
  applyBrandConfig();
  if (window.CafeCloud && menuGrid) {
    ACTIVE_CAFE_ITEMS = await window.CafeCloud.fetchMenuItems(CAFE_ITEMS);
  }
  renderMenu();
  updateCartUI();
})();

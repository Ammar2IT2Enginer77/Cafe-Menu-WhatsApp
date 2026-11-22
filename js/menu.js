/* ==========================================================================
   Velvet Roast Café — Interactive Stage, Customizer & Luxury Receipt Logic
   ========================================================================== */

const CAFE_ITEMS = [
  {
    id: 1,
    name: "سبانيش لاتيه ساخن",
    category: "hot",
    price: 1400,
    badge: "الأكثر طلباً",
    hasSizes: true,
    addons: ["حليب كامل الدسم", "حليب قليل الدسم", "إكسترا شوت إسبريسو (+300)", "سكر وسط"],
    desc: "إسبريسو غني ممزوج بالحليب المبخر والحليب المكثف المحلى برسمة لاتيه آرت.",
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 2,
    name: "كابتشينو إيطالي كلاسيك",
    category: "hot",
    price: 1200,
    badge: "فاخر",
    hasSizes: true,
    addons: ["رغوة كثيفة + كاكاو", "قرفة ناعمة", "بدون سكر", "حليب لوز (+400)"],
    desc: "شوت إسبريسو فاخر مع رغوة حليب مخملية كثيفة ورشة كاكاو داكن.",
    image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 3,
    name: "آيس كراميل ماكياتو",
    category: "iced",
    price: 1600,
    badge: "مميز",
    hasSizes: true,
    addons: ["ثلج عادي + صوص كراميل", "ثلج خفيف", "إكسترا كراميل (+200)", "كريمة مخفوقة (+300)"],
    desc: "حليب بارد مع مكعبات الثلج وشوت إسبريسو طازج مغطى بصوص الكراميل المملح.",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 4,
    name: "آيس سبانيش لاتيه",
    category: "iced",
    price: 1500,
    badge: "الأكثر مبيعاً",
    hasSizes: true,
    addons: ["حلاوة متوازنة", "حلاوة خفيفة", "إكسترا شوت (+300)", "ثلج إضافي"],
    desc: "مزيج القهوة المختصة المثلجة مع الحليب البارد ولمسة حلاوة كريمية.",
    image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 5,
    name: "تشيز كيك سان سيباستيان",
    category: "desserts",
    price: 2000,
    badge: "طازج يومياً",
    hasSizes: false,
    addons: ["صوص شوكولاتة بلجيكية", "صوص كراميل مملح", "صوص توت أحمر", "بدون صوص"],
    desc: "قطعة تشيز كيك مكرملة من الخارج وكريمية من الداخل تذوب في الفم.",
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 6,
    name: "كيكة الشوكولاتة والإسبريسو",
    category: "desserts",
    price: 1800,
    badge: "شيف سبيشال",
    hasSizes: false,
    addons: ["تقديم دافئ + آيسكريم (+400)", "صوص جاناش إضافي", "تقديم عادي"],
    desc: "طبقات كيك الشوكولاتة الداكنة الغنية بنكهة الإسبريسو وصوص الجاناش.",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 7,
    name: "موهيتو باشن فروت منعش",
    category: "juices",
    price: 1300,
    badge: "منعش",
    hasSizes: true,
    addons: ["سفن أب + نعناع طازج", "مياه غازية (دايت)", "إكسترا باشن فروت (+250)"],
    desc: "نكهة فاكهة الباشن الاستوائية مع أوراق النعناع الطازجة وشرائح الليمون.",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 8,
    name: "سموذي مانجو وفراولة",
    category: "juices",
    price: 1500,
    badge: "طبيعي 100%",
    hasSizes: true,
    addons: ["بدون سكر مضاف", "عسل طبيعي (+300)", "إضافة قطع فواكه"],
    desc: "طبقات من عصير المانجو الطبيعي والفراولة الطازجة بدون أي إضافات صناعية.",
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=700&q=80"
  }
];

const ACTIVE_CAFE_ITEMS = JSON.parse(localStorage.getItem("velvet_roast_custom_items")) || CAFE_ITEMS;

const CATEGORY_NAMES = {
  all: "قائمة الكافيه الكاملة",
  hot: "القهوة الساخنة",
  iced: "المشروبات الباردة",
  desserts: "الحلويات والكيك",
  juices: "العصائر والموهيتو"
};

let currentCategory = "all";
let searchQuery = "";
window.cafeCart = [];

let activeStageItem = null;
let selectedSizeExtra = 0;
let selectedSizeLabel = "صغير (S)";
let selectedAddon = "";

const menuGrid = document.getElementById("menuGrid");
const categoryTitle = document.getElementById("currentCategoryTitle");
const itemsCount = document.getElementById("itemsCount");
const searchInput = document.getElementById("searchInput");

window.addEventListener("scroll", () => {
  const bar = document.getElementById("scrollProgress");
  if (!bar) return;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.width = h > 0 ? `${(window.scrollY / h) * 100}%` : "0%";
}, { passive: true });

function renderMenu() {
  if (!menuGrid) return;

  const filtered = ACTIVE_CAFE_ITEMS.filter(item => {
    const matchesCat = currentCategory === "all" || item.category === currentCategory;
    const matchesSearch = item.name.includes(searchQuery) || item.desc.includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  categoryTitle.textContent = CATEGORY_NAMES[currentCategory] || "قائمة الكافيه الكاملة";
  itemsCount.textContent = `${filtered.length} صنف`;

  if (filtered.length === 0) {
    menuGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:var(--muted); padding:30px;">لا توجد أصناف مطابقة لبحثك حالياً.</p>`;
    return;
  }

  menuGrid.innerHTML = filtered.map(item => `
    <article class="cafe-card" onclick="openProductStage(${item.id})">
      ${item.badge ? `<span class="item-badge">${item.badge}</span>` : ""}
      <div class="card-floating-img">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
      </div>
      <div class="card-body">
        <h3>${item.name}</h3>
        <p class="item-desc">${item.desc}</p>
        <div class="card-footer">
          <span class="item-price">${item.price.toLocaleString()} ريال</span>
          <button type="button" class="preview-item-btn">✨ معاينة وطلب</button>
        </div>
      </div>
    </article>
  `).join("");

  if (typeof gsap !== "undefined") {
    gsap.fromTo(".cafe-card",
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, stagger: 0.06, ease: "power2.out", clearProps: "transform" }
    );
  }
}

function buildStageVisual(item) {
  if (item.category === "hot") {
    return `
      <div class="hot-coffee-showcase">
        <div class="hot-steam">
          <span></span><span></span><span></span>
        </div>
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
  if (!item) return;

  activeStageItem = item;
  selectedSizeExtra = 0;
  selectedSizeLabel = item.hasSizes ? "صغير (S)" : "قطعة قياسية";
  selectedAddon = item.addons[0] || "";

  document.getElementById("stageVisual").innerHTML = buildStageVisual(item);
  document.getElementById("stageCategory").textContent = CATEGORY_NAMES[item.category];
  document.getElementById("stageTitle").textContent = item.name;
  document.getElementById("stageDesc").textContent = item.desc;

  const sizeGroup = document.getElementById("sizeOptionGroup");
  sizeGroup.style.display = item.hasSizes ? "block" : "none";

  document.querySelectorAll("#sizePills .size-pill").forEach((btn, idx) => {
    btn.classList.toggle("active", idx === 0);
  });

  const addonPillsEl = document.getElementById("addonPills");
  addonPillsEl.innerHTML = item.addons.map((addon, i) => `
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
  const match = addonText.match(/\+(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function updateStagePrice() {
  if (!activeStageItem) return;
  const addonExtra = getAddonExtraPrice(selectedAddon);
  const finalPrice = activeStageItem.price + selectedSizeExtra + addonExtra;
  document.getElementById("stageFinalPrice").textContent = `${finalPrice.toLocaleString()} ريال`;
}

document.querySelectorAll("#sizePills .size-pill").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#sizePills .size-pill").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedSizeExtra = parseInt(btn.dataset.extra, 10) || 0;
    selectedSizeLabel = btn.dataset.label;
    updateStagePrice();
  });
});

const closeStageBtn = document.getElementById("closeStageBtn");
if (closeStageBtn) {
  closeStageBtn.addEventListener("click", () => {
    document.getElementById("productStage").classList.remove("open");
  });
}

const productStage = document.getElementById("productStage");
if (productStage) {
  productStage.addEventListener("click", (e) => {
    if (e.target.id === "productStage") {
      productStage.classList.remove("open");
    }
  });
}

const confirmStageAddBtn = document.getElementById("confirmStageAddBtn");
if (confirmStageAddBtn) {
  confirmStageAddBtn.addEventListener("click", () => {
    if (!activeStageItem) return;

    const addonExtra = getAddonExtraPrice(selectedAddon);
    const unitPrice = activeStageItem.price + selectedSizeExtra + addonExtra;
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
    totalAmountEl.textContent = `${totalPrice.toLocaleString()} ريال`;
  } else {
    floatingBtn.style.display = "none";
  }

  drawerTotalEl.textContent = `${totalPrice.toLocaleString()} ريال`;
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
        <strong style="font-size:13px; color:#8c4b18;">${(item.price * item.qty).toLocaleString()} ريال</strong>
      </div>
      <div class="rcp-qty-box">
        <button type="button" class="rcp-qty-btn" onclick="changeQty(${idx}, -1)">-</button>
        <strong>${item.qty}</strong>
        <button type="button" class="rcp-qty-btn" onclick="changeQty(${idx}, 1)">+</button>
      </div>
    </div>
  `).join("");
};

document.querySelectorAll(".cat-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.dataset.category;
    renderMenu();
  });
});

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.trim();
    renderMenu();
  });
}

renderMenu();
updateCartUI();

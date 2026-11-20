/* ==========================================================================
   Velvet Roast Café — Menu Data, Filtering & Cart Logic
   ========================================================================== */

const CAFE_ITEMS = [
  {
    id: 1,
    name: "سبانيش لاتيه ساخن",
    category: "hot",
    price: 1400,
    badge: "الأكثر طلباً",
    desc: "إسبريسو غني ممزوج بالحليب المبخر والحليب المكثف المحلى بقوام كريمي.",
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 2,
    name: "كابتشينو إيطالي كلاسيك",
    category: "hot",
    price: 1200,
    badge: "",
    desc: "شوت إسبريسو فاخر مع رغوة حليب كثيفة ورشة كاكاو داكن.",
    image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 3,
    name: "آيس كراميل ماكياتو",
    category: "iced",
    price: 1600,
    badge: "مميز",
    desc: "حليب بارد مع الثلج وشوت إسبريسو طازج مغطى بصوص الكراميل المملح.",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 4,
    name: "آيس سبانيش لاتيه",
    category: "iced",
    price: 1500,
    badge: "الأكثر مبيعاً",
    desc: "مزيج القهوة المختصة المثلجة مع الحليب البارد ولمسة حلاوة متوازنة.",
    image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 5,
    name: "تشيز كيك سان سيباستيان",
    category: "desserts",
    price: 2000,
    badge: "طازج يومياً",
    desc: "قطعة تشيز كيك مكرملة من الخارج وكريمية من الداخل تقدم مع صوص الشوكولاتة البلجيكية.",
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 6,
    name: "كيكة الشوكولاتة والإسبريسو",
    category: "desserts",
    price: 1800,
    badge: "شيف سبيشال",
    desc: "طبقات كيك الشوكولاتة الداكنة الغنية بنكهة الإسبريسو وصوص الجاناش الفاخر.",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 7,
    name: "موهيتو باشن فروت منعش",
    category: "juices",
    price: 1300,
    badge: "منعش",
    desc: "نكهة فاكهة الباشن الاستوائية مع أوراق النعناع الطازجة وشرائح الليمون.",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 8,
    name: "سموذي مانجو وفراولة",
    category: "juices",
    price: 1500,
    badge: "طبيعي 100%",
    desc: "طبقات من عصير المانجو الطبيعي والفراولة الطازجة بدون أي إضافات صناعية.",
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=700&q=80"
  }
];

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

const menuGrid = document.getElementById("menuGrid");
const categoryTitle = document.getElementById("currentCategoryTitle");
const itemsCount = document.getElementById("itemsCount");
const searchInput = document.getElementById("searchInput");

function renderMenu() {
  const filtered = CAFE_ITEMS.filter(item => {
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
    <article class="cafe-card">
      <div class="card-img-wrap">
        ${item.badge ? `<span class="item-badge">${item.badge}</span>` : ""}
        <img src="${item.image}" alt="${item.name}" loading="lazy">
      </div>
      <div class="card-body">
        <h3>${item.name}</h3>
        <p class="item-desc">${item.desc}</p>
        <div class="card-footer">
          <span class="item-price">${item.price.toLocaleString()} ريال</span>
          <button class="add-item-btn" onclick="addToCart(${item.id})">+ أضف للطلب</button>
        </div>
      </div>
    </article>
  `).join("");
}

window.addToCart = function (id) {
  const item = CAFE_ITEMS.find(m => m.id === id);
  if (!item) return;

  const existing = window.cafeCart.find(c => c.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    window.cafeCart.push({ ...item, qty: 1 });
  }
  updateCartUI();
};

window.changeQty = function (id, delta) {
  const index = window.cafeCart.findIndex(c => c.id === id);
  if (index === -1) return;

  window.cafeCart[index].qty += delta;
  if (window.cafeCart[index].qty <= 0) {
    window.cafeCart.splice(index, 1);
  }
  updateCartUI();
};

window.updateCartUI = function () {
  const floatingBtn = document.getElementById("openCartBtn");
  const totalQtyEl = document.getElementById("cartTotalQty");
  const totalAmountEl = document.getElementById("cartTotalAmount");
  const drawerTotalEl = document.getElementById("drawerTotalPrice");
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

  if (window.cafeCart.length === 0) {
    cartListEl.innerHTML = `<p style="text-align:center; color:var(--muted); padding:35px 0;">سلة طلباتك فارغة حالياً.</p>`;
    return;
  }

  cartListEl.innerHTML = window.cafeCart.map(item => `
    <div class="cart-item-row">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <span>${(item.price * item.qty).toLocaleString()} ريال</span>
      </div>
      <div class="qty-controls">
        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
        <strong>${item.qty}</strong>
        <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
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

searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value.trim();
  renderMenu();
});

renderMenu();
updateCartUI();
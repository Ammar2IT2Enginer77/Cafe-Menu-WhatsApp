/* ==========================================================================
   Velvet Roast Café — Admin Dashboard & menu.js Exporter
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const ADMIN_PASS = "1234"; // يمكنك تغيير كلمة المرور من هنا
  const STORAGE_KEY = "velvet_roast_custom_items";

  const loginSection = document.getElementById("loginSection");
  const adminDashboard = document.getElementById("adminDashboard");
  const loginBtn = document.getElementById("loginBtn");
  const adminPassInput = document.getElementById("adminPassInput");

  // تحميل الأصناف (إما المحفوظة محلياً أو الافتراضية من menu.js)
  let items = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [...CAFE_ITEMS];

  function saveToLocal() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    renderAdminList();
  }

  // تسجيل الدخول
  function handleLogin() {
    if (adminPassInput.value === ADMIN_PASS) {
      loginSection.style.display = "none";
      adminDashboard.style.display = "block";
      renderAdminList();
    } else {
      alert("رمز المرور غير صحيح!");
    }
  }

  loginBtn.addEventListener("click", handleLogin);
  adminPassInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleLogin();
  });

  // عرض قائمة الأصناف في لوحة الإدارة
  function renderAdminList() {
    const listEl = document.getElementById("adminItemsList");
    document.getElementById("adminTotalCount").textContent = items.length;

    listEl.innerHTML = items.map(item => `
      <div class="admin-item-row">
        <div class="admin-item-info">
          <img src="${item.image}" alt="${item.name}">
          <div>
            <strong style="color: var(--cream); display: block;">${item.name}</strong>
            <span style="color: var(--caramel); font-size: 13.5px; font-weight: 800;">${item.price.toLocaleString()} ريال</span>
            <small style="color: var(--muted); margin-right: 8px;">(${item.category})</small>
          </div>
        </div>
        <div class="admin-actions">
          <button type="button" class="btn-edit" onclick="editAdminItem(${item.id})">✏️ تعديل</button>
          <button type="button" class="btn-del" onclick="deleteAdminItem(${item.id})">🗑️ حذف</button>
        </div>
      </div>
    `).join("");
  }

  // إضافة أو تحديث صنف
  const itemForm = document.getElementById("itemForm");
  itemForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const editId = document.getElementById("editItemId").value;
    const addonsArr = document.getElementById("itemAddons").value
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const itemData = {
      id: editId ? parseInt(editId, 10) : Date.now(),
      name: document.getElementById("itemName").value.trim(),
      category: document.getElementById("itemCategory").value,
      price: parseInt(document.getElementById("itemPrice").value, 10),
      badge: document.getElementById("itemBadge").value.trim(),
      hasSizes: document.getElementById("itemHasSizes").checked,
      addons: addonsArr.length ? addonsArr : ["تحضير قياسي"],
      desc: document.getElementById("itemDesc").value.trim(),
      image: document.getElementById("itemImage").value.trim()
    };

    if (editId) {
      const idx = items.findIndex(i => i.id === parseInt(editId, 10));
      if (idx !== -1) items[idx] = itemData;
    } else {
      items.unshift(itemData);
    }

    resetForm();
    saveToLocal();
    alert("✓ تم حفظ الصنف بنجاح!");
  });

  window.editAdminItem = function (id) {
    const item = items.find(i => i.id === id);
    if (!item) return;

    document.getElementById("editItemId").value = item.id;
    document.getElementById("itemName").value = item.name;
    document.getElementById("itemCategory").value = item.category;
    document.getElementById("itemPrice").value = item.price;
    document.getElementById("itemBadge").value = item.badge || "";
    document.getElementById("itemImage").value = item.image;
    document.getElementById("itemDesc").value = item.desc;
    document.getElementById("itemAddons").value = item.addons.join(", ");
    document.getElementById("itemHasSizes").checked = item.hasSizes;

    document.getElementById("formModeTitle").textContent = `✏️ تعديل: ${item.name}`;
    document.getElementById("saveItemBtn").textContent = "💾 تحديث البيانات";
    document.getElementById("cancelEditBtn").style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.deleteAdminItem = function (id) {
    if (!confirm("هل أنت متأكد من حذف هذا الصنف؟")) return;
    items = items.filter(i => i.id !== id);
    saveToLocal();
  };

  function resetForm() {
    itemForm.reset();
    document.getElementById("editItemId").value = "";
    document.getElementById("formModeTitle").textContent = "➕ إضافة صنف جديد";
    document.getElementById("saveItemBtn").textContent = "💾 حفظ الصنف في المنيو";
    document.getElementById("cancelEditBtn").style.display = "none";
  }

  document.getElementById("cancelEditBtn").addEventListener("click", resetForm);

  document.getElementById("resetDefaultBtn").addEventListener("click", () => {
    if (!confirm("هل تريد استعادة الأصناف الافتراضية ومسح التعديلات المحلية؟")) return;
    localStorage.removeItem(STORAGE_KEY);
    items = [...CAFE_ITEMS];
    renderAdminList();
  });

  // تصدير وتحميل ملف menu.js جاهزاً للرفع على GitHub
  document.getElementById("exportMenuBtn").addEventListener("click", async () => {
    try {
      const res = await fetch("js/menu.js");
      let fullCode = await res.text();
      const updatedArrayStr = `const CAFE_ITEMS = ${JSON.stringify(items, null, 2)};`;
      fullCode = fullCode.replace(/const CAFE_ITEMS = \[[\s\S]*?\];/, updatedArrayStr);

      const blob = new Blob([fullCode], { type: "application/javascript;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "menu.js";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("افتح الصفحة عبر Live Server لتفعيل التصدير التلقائي.");
    }
  });
});
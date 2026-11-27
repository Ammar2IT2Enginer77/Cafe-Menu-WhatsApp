/* ==========================================================================
   Admin Dashboard: Cloud Menu CRUD, Bank Accounts Manager & Table QR Printer
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const CFG = window.CAFE_CONFIG || {
    brandName: "Velvet Roast Café",
    currency: "ريال",
    storageKey: "velvet_roast_custom_items",
    adminPassword: "1234"
  };

  document.title = `لوحة إدارة المنيو | ${CFG.brandName}`;
  const adminBrandTitle = document.getElementById("adminBrandTitle");
  if (adminBrandTitle) adminBrandTitle.textContent = `لوحة إدارة منيو ${CFG.brandName}`;

  const cloudStatusBadge = document.getElementById("cloudStatusBadge");
  if (cloudStatusBadge) {
    if (window.CafeCloud && window.CafeCloud.isCloudEnabled) {
      cloudStatusBadge.textContent = "🟢 متصل بقاعدة البيانات السحابية (التعديل يظهر للجميع فوراً)";
      cloudStatusBadge.style.color = "#4ade80";
    } else {
      cloudStatusBadge.textContent = "🟡 وضع التجربة المحلي (أضف مفاتيح Supabase في config.js للنشر السحابي)";
      cloudStatusBadge.style.color = "#fbbf24";
    }
  }

  const loginSection = document.getElementById("loginSection");
  const adminDashboard = document.getElementById("adminDashboard");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const adminPassInput = document.getElementById("adminPassInput");

  let items = [];
  let banks = [];

  async function loadAllAdminData() {
    if (window.CafeCloud) {
      items = await window.CafeCloud.fetchMenuItems(CAFE_ITEMS);
      banks = await window.CafeCloud.fetchBankAccounts();
    } else {
      items = [...CAFE_ITEMS];
      banks = [...(CFG.defaultBanks || [])];
    }
    renderAdminList();
    renderBanksList();
    generateTableQR();
  }

  function handleLogin() {
    if (adminPassInput.value === CFG.adminPassword) {
      loginSection.style.display = "none";
      adminDashboard.style.display = "block";
      if (logoutBtn) logoutBtn.style.display = "inline-flex";
      adminPassInput.value = "";
      loadAllAdminData();
    } else {
      alert("رمز المرور غير صحيح!");
    }
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      adminDashboard.style.display = "none";
      loginSection.style.display = "block";
      logoutBtn.style.display = "none";
    });
  }

  loginBtn.addEventListener("click", handleLogin);
  adminPassInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleLogin();
  });


  // --------------------------------------------------------------------------
  // مكتبة الصور الجاهزة ورفع صورة من الجهاز
  // --------------------------------------------------------------------------
  const imageLibraryPicker = document.getElementById("imageLibraryPicker");
  const itemImageInput = document.getElementById("itemImage");
  const itemImageUpload = document.getElementById("itemImageUpload");
  const itemImageUploadStatus = document.getElementById("itemImageUploadStatus");

  if (imageLibraryPicker && CFG.imageLibrary) {
    imageLibraryPicker.innerHTML = CFG.imageLibrary.map(img => `
      <button type="button" class="lib-thumb-btn" data-path="${img.path}">
        <img src="${img.path}" alt="${img.label}">
        <span>${img.label}</span>
      </button>
    `).join("");

    imageLibraryPicker.querySelectorAll(".lib-thumb-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        imageLibraryPicker.querySelectorAll(".lib-thumb-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        if (itemImageInput) itemImageInput.value = btn.dataset.path;
        if (itemImageUploadStatus) itemImageUploadStatus.textContent = "✓ تم الاختيار من المكتبة";
      });
    });
  }

  if (itemImageUpload) {
    itemImageUpload.addEventListener("change", async () => {
      const file = itemImageUpload.files && itemImageUpload.files[0];
      if (!file || !window.CafeCloud) return;
      if (itemImageUploadStatus) itemImageUploadStatus.textContent = "⏳ جاري تجهيز الصورة...";
      const res = await window.CafeCloud.uploadMenuImage(file);
      if (res.ok && res.url) {
        if (itemImageInput) itemImageInput.value = res.url;
        if (itemImageUploadStatus) {
          itemImageUploadStatus.textContent = res.mode === "cloud"
            ? "✓ رُفعت الصورة سحابياً"
            : "✓ تم تحميل الصورة محلياً";
        }
      } else {
        if (itemImageUploadStatus) itemImageUploadStatus.textContent = "تعذر الرفع: " + (res.error || "");
      }
    });
  }

  // --------------------------------------------------------------------------
  // إدارة الأصناف
  // --------------------------------------------------------------------------
  function renderAdminList() {
    const listEl = document.getElementById("adminItemsList");
    document.getElementById("adminTotalCount").textContent = items.length;

    listEl.innerHTML = items.map(item => {
      const isAvail = item.available !== false;
      return `
        <div class="admin-item-row" style="${isAvail ? "" : "opacity: 0.6;"}">
          <div class="admin-item-info">
            <img src="${item.image}" alt="${item.name}">
            <div>
              <strong style="color: var(--cream); display: block;">${item.name}</strong>
              <span style="color: var(--caramel); font-size: 13.5px; font-weight: 800;">${Number(item.price).toLocaleString()} ${CFG.currency}</span>
              <small style="color: var(--muted); margin-right: 8px;">(${item.category})</small>
            </div>
          </div>
          <div class="admin-actions">
            <button type="button" class="btn-toggle ${isAvail ? "is-on" : "is-off"}" onclick="toggleItemAvailability(${item.id})">
              ${isAvail ? "✅ متوفر" : "⛔ نفد اليوم"}
            </button>
            <button type="button" class="btn-edit" onclick="editAdminItem(${item.id})">✏️ تعديل</button>
            <button type="button" class="btn-del" onclick="deleteAdminItem(${item.id})">🗑️ حذف</button>
          </div>
        </div>
      `;
    }).join("");
  }

  window.toggleItemAvailability = async function (id) {
    const item = items.find(i => i.id === id);
    if (!item) return;
    item.available = item.available === false ? true : false;
    renderAdminList();
    if (window.CafeCloud) {
      const res = await window.CafeCloud.upsertMenuItem(item, items);
      if (!res.ok) alert("تنبيه: " + res.error);
    }
  };

  const itemForm = document.getElementById("itemForm");
  itemForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const editId = document.getElementById("editItemId").value;
    const addonsArr = document.getElementById("itemAddons").value
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const existingItem = editId ? items.find(i => i.id === parseInt(editId, 10)) : null;

    const itemData = {
      id: editId ? parseInt(editId, 10) : Date.now(),
      name: document.getElementById("itemName").value.trim(),
      category: document.getElementById("itemCategory").value,
      price: parseInt(document.getElementById("itemPrice").value, 10),
      badge: document.getElementById("itemBadge").value.trim(),
      hasSizes: document.getElementById("itemHasSizes").checked,
      available: existingItem ? existingItem.available !== false : true,
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
    renderAdminList();
    if (window.CafeCloud) {
      const res = await window.CafeCloud.upsertMenuItem(itemData, items);
      if (!res.ok) {
        alert("حُفظ محلياً، لكن تعذر الحفظ السحابي: " + res.error);
        return;
      }
    }
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
    document.getElementById("itemAddons").value = (item.addons || []).join(", ");
    document.getElementById("itemHasSizes").checked = item.hasSizes;

    document.getElementById("formModeTitle").textContent = `✏️ تعديل: ${item.name}`;
    document.getElementById("saveItemBtn").textContent = "💾 تحديث البيانات";
    document.getElementById("cancelEditBtn").style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.deleteAdminItem = async function (id) {
    if (!confirm("هل أنت متأكد من حذف هذا الصنف؟")) return;
    items = items.filter(i => i.id !== id);
    renderAdminList();
    if (window.CafeCloud) {
      await window.CafeCloud.deleteMenuItem(id, items);
    }
  };

  function resetForm() {
    itemForm.reset();
    document.getElementById("editItemId").value = "";
    document.getElementById("formModeTitle").textContent = "➕ إضافة صنف جديد";
    document.getElementById("saveItemBtn").textContent = "💾 حفظ الصنف في المنيو";
    document.getElementById("cancelEditBtn").style.display = "none";
  }

  document.getElementById("cancelEditBtn").addEventListener("click", resetForm);

  // --------------------------------------------------------------------------
  // إدارة الحسابات البنكية والمحافظ
  // --------------------------------------------------------------------------
  function renderBanksList() {
    const el = document.getElementById("adminBanksList");
    if (!el) return;
    if (!banks.length) {
      el.innerHTML = `<p style="color:var(--muted); font-size:13px;">لا توجد حسابات بنكية مضافة حالياً.</p>`;
      return;
    }
    el.innerHTML = banks.map(b => `
      <div class="admin-item-row">
        <div>
          <strong style="color:var(--caramel); display:block;">${b.bankName}</strong>
          <span style="color:var(--cream); font-size:13.5px; direction:ltr; display:inline-block;">${b.accountNumber}</span>
          <small style="color:var(--muted); display:block;">${b.accountHolder || ""}</small>
        </div>
        <button type="button" class="btn-del" onclick="deleteAdminBank(${b.id})">🗑️ حذف</button>
      </div>
    `).join("");
  }

  const bankForm = document.getElementById("bankForm");
  if (bankForm) {
    bankForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newBank = {
        id: Date.now(),
        bankName: document.getElementById("bankNameInput").value.trim(),
        accountNumber: document.getElementById("bankAccountInput").value.trim(),
        accountHolder: document.getElementById("bankHolderInput").value.trim()
      };
      banks.push(newBank);
      bankForm.reset();
      renderBanksList();
      if (window.CafeCloud) {
        const res = await window.CafeCloud.upsertBankAccount(newBank, banks);
        if (!res.ok) alert("تعذر الحفظ السحابي للحساب: " + res.error);
      }
    });
  }

  window.deleteAdminBank = async function (id) {
    if (!confirm("حذف هذا الحساب البنكي؟")) return;
    banks = banks.filter(b => b.id !== id);
    renderBanksList();
    if (window.CafeCloud) {
      await window.CafeCloud.deleteBankAccount(id, banks);
    }
  };

  // --------------------------------------------------------------------------
  // مولّد رموز QR للطاولات والمنيو العام
  // --------------------------------------------------------------------------
  const qrBaseUrlInput = document.getElementById("qrBaseUrl");
  const qrTableInput = document.getElementById("qrTableNumber");
  const qrPreviewBox = document.getElementById("qrPreviewBox");
  const qrTargetLink = document.getElementById("qrTargetLink");
  const qrCardTitle = document.getElementById("qrCardTitle");
  const qrCardSubtitle = document.getElementById("qrCardSubtitle");

  if (qrBaseUrlInput) {
    const defaultMenuUrl = window.location.href.replace(/\/[^\/]*(\?.*)?$/, "/index.html");
    qrBaseUrlInput.value = defaultMenuUrl;
  }

  function generateTableQR() {
    if (!qrPreviewBox || !qrBaseUrlInput) return;
    const baseUrl = qrBaseUrlInput.value.trim() || "https://example.com/index.html";
    const tableNum = qrTableInput ? qrTableInput.value.trim() : "";
    const finalUrl = tableNum ? `${baseUrl}?table=${encodeURIComponent(tableNum)}` : baseUrl;

    if (qrTargetLink) {
      qrTargetLink.textContent = finalUrl;
      qrTargetLink.href = finalUrl;
    }
    if (qrCardTitle) qrCardTitle.textContent = CFG.brandName;
    if (qrCardSubtitle) {
      qrCardSubtitle.textContent = tableNum ? `🪑 طاولة رقم ${tableNum}` : "📱 المنيو الإلكتروني العام";
    }

    qrPreviewBox.innerHTML = "";
    if (typeof QRCode !== "undefined") {
      new QRCode(qrPreviewBox, {
        text: finalUrl,
        width: 170,
        height: 170,
        colorDark: "#1b1512",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
    } else {
      qrPreviewBox.innerHTML = `<p style="color:#b91c1c; font-size:12px;">تعذر تحميل مكتبة QR؛ تأكد من الاتصال بالإنترنت.</p>`;
    }
  }

  const genQrBtn = document.getElementById("generateQrBtn");
  if (genQrBtn) genQrBtn.addEventListener("click", generateTableQR);
  if (qrTableInput) qrTableInput.addEventListener("input", generateTableQR);

  const printQrBtn = document.getElementById("printQrBtn");
  if (printQrBtn) {
    printQrBtn.addEventListener("click", () => window.print());
  }
});

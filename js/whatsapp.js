/* ==========================================================================
   Luxury Receipt, Table Auto-Detection, Bank Accounts, Receipt Upload & WhatsApp
   ========================================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  const CFG = window.CAFE_CONFIG || {
    brandName: "Velvet Roast Café",
    whatsappNumber: "967772457941",
    currency: "ريال",
    receiptPrefix: "VR"
  };

  const openCartBtn = document.getElementById("openCartBtn");
  const closeCartBtn = document.getElementById("closeCartBtn");
  const cartOverlay = document.getElementById("cartOverlay");
  const sendWhatsappBtn = document.getElementById("sendWhatsappBtn");
  const clearCartBtn = document.getElementById("clearCartBtn");

  const orderTypeEl = document.getElementById("orderType");
  const customerLocationEl = document.getElementById("customerLocation");
  const tableHeaderBadge = document.getElementById("tableHeaderBadge");

  const paymentMethodEl = document.getElementById("paymentMethod");
  const bankTransferBox = document.getElementById("bankTransferBox");
  const bankAccountsList = document.getElementById("bankAccountsList");
  const selectedBankSelect = document.getElementById("selectedBankSelect");
  const transferRefInput = document.getElementById("transferRefInput");
  const receiptFileInput = document.getElementById("receiptFileInput");
  const receiptFilePreview = document.getElementById("receiptFilePreview");
  const receiptUploadStatus = document.getElementById("receiptUploadStatus");

  let bankAccounts = [];
  if (window.CafeCloud) {
    bankAccounts = await window.CafeCloud.fetchBankAccounts();
  }

  function renderBankAccounts() {
    if (!bankAccountsList || !selectedBankSelect) return;
    if (!bankAccounts.length) {
      bankAccountsList.innerHTML = `<p style="font-size:12px; color:var(--muted);">لم تُضف حسابات بنكية بعد.</p>`;
      selectedBankSelect.innerHTML = `<option value="تحويل بنكي">تحويل بنكي</option>`;
      return;
    }

    bankAccountsList.innerHTML = bankAccounts.map((b, idx) => `
      <div class="bank-account-card">
        <div class="bank-account-meta">
          <strong>${b.bankName}</strong>
          <span>${b.accountNumber}</span>
          <small>${b.accountHolder || CFG.brandName}</small>
        </div>
        <button type="button" class="copy-acc-btn" data-acc="${b.accountNumber}" id="copyAcc_${idx}">📋 نسخ</button>
      </div>
    `).join("");

    bankAccountsList.querySelectorAll(".copy-acc-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(btn.dataset.acc);
          const orig = btn.textContent;
          btn.textContent = "✓ تم النسخ";
          setTimeout(() => { btn.textContent = orig; }, 1600);
        } catch {
          alert(`رقم الحساب: ${btn.dataset.acc}`);
        }
      });
    });

    selectedBankSelect.innerHTML = bankAccounts.map(b =>
      `<option value="${b.bankName}">${b.bankName}</option>`
    ).join("");
  }

  renderBankAccounts();

  if (paymentMethodEl && bankTransferBox) {
    paymentMethodEl.addEventListener("change", () => {
      bankTransferBox.style.display = paymentMethodEl.value === "transfer" ? "block" : "none";
    });
  }

  if (receiptFileInput && receiptFilePreview) {
    receiptFileInput.addEventListener("change", () => {
      const file = receiptFileInput.files && receiptFileInput.files[0];
      if (!file) {
        receiptFilePreview.innerHTML = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        receiptFilePreview.innerHTML = `<img src="${e.target.result}" alt="معاينة سند الإيداع">`;
        if (receiptUploadStatus) {
          receiptUploadStatus.textContent = window.CafeCloud && window.CafeCloud.isCloudEnabled
            ? "✓ جاهز للرفع مع الطلب"
            : "✓ تم اختيار السند (في وضع السحابة يُرفع تلقائياً ويُرسل رابطه)";
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // قراءة رقم الطاولة تلقائياً من رابط الـ QR مثل ?table=5
  const urlParams = new URLSearchParams(window.location.search);
  const scannedTable = urlParams.get("table");

  if (scannedTable && orderTypeEl && customerLocationEl) {
    orderTypeEl.value = "داخل الكافيه (طاولة)";
    customerLocationEl.value = `طاولة رقم ${scannedTable}`;
    if (tableHeaderBadge) {
      tableHeaderBadge.textContent = `🪑 طاولة رقم ${scannedTable}`;
      tableHeaderBadge.style.display = "inline-flex";
    }
  }

  function updateLocationPlaceholder() {
    if (!orderTypeEl || !customerLocationEl) return;
    const val = orderTypeEl.value;
    if (val === "استلام سفري (Takeaway)") {
      customerLocationEl.placeholder = "وقت الاستلام المتوقع (اختياري)";
    } else if (val === "توصيل للمنزل") {
      customerLocationEl.placeholder = "العنوان بالتفصيل أو وصف الموقع";
    } else {
      customerLocationEl.placeholder = "رقم الطاولة (مثال: طاولة 5)";
    }
  }

  if (orderTypeEl) {
    orderTypeEl.addEventListener("change", updateLocationPlaceholder);
    updateLocationPlaceholder();
  }

  function refreshReceiptMeta() {
    const orderNumEl = document.getElementById("receiptOrderNum");
    const dateTimeEl = document.getElementById("receiptDateTime");

    if (orderNumEl && !orderNumEl.dataset.generated) {
      const randomNum = Math.floor(100 + Math.random() * 900);
      orderNumEl.textContent = `#${CFG.receiptPrefix}-${randomNum}`;
      orderNumEl.dataset.generated = "true";
    }

    if (dateTimeEl) {
      const now = new Date();
      dateTimeEl.textContent = now.toLocaleString("ar-YE", {
        dateStyle: "medium",
        timeStyle: "short"
      });
    }
  }

  openCartBtn.addEventListener("click", () => {
    refreshReceiptMeta();
    cartOverlay.classList.add("open");
  });

  closeCartBtn.addEventListener("click", () => {
    cartOverlay.classList.remove("open");
  });

  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", () => {
      if (typeof window.clearCafeCart === "function") window.clearCafeCart();
    });
  }

  cartOverlay.addEventListener("click", (e) => {
    if (e.target === cartOverlay) cartOverlay.classList.remove("open");
  });

  sendWhatsappBtn.addEventListener("click", async () => {
    if (!window.cafeCart || window.cafeCart.length === 0) {
      alert("الفاتورة فارغة! اختر مشروباً أو حلى أولاً.");
      return;
    }

    const orderNum = document.getElementById("receiptOrderNum").textContent;
    const orderType = orderTypeEl.value;
    const customerName = document.getElementById("customerName").value.trim() || "عميل";
    const customerLocation = customerLocationEl.value.trim();
    const orderNotes = document.getElementById("orderNotes").value.trim();
    const paymentType = paymentMethodEl ? paymentMethodEl.value : "cash";

    if (orderType !== "استلام سفري (Takeaway)" && !customerLocation) {
      alert(orderType === "توصيل للمنزل"
        ? "يرجى إدخال عنوان التوصيل لاعتماد الفاتورة."
        : "يرجى إدخال رقم الطاولة لاعتماد الفاتورة.");
      customerLocationEl.focus();
      return;
    }

    let receiptPublicUrl = "";
    const receiptFile = receiptFileInput && receiptFileInput.files && receiptFileInput.files[0];

    if (paymentType === "transfer" && receiptFile && window.CafeCloud) {
      sendWhatsappBtn.disabled = true;
      const origHtml = sendWhatsappBtn.innerHTML;
      sendWhatsappBtn.innerHTML = "<span>⏳ جاري رفع سند الإيداع...</span>";
      const upRes = await window.CafeCloud.uploadReceiptImage(receiptFile);
      sendWhatsappBtn.disabled = false;
      sendWhatsappBtn.innerHTML = origHtml;

      if (upRes.ok && upRes.url) {
        receiptPublicUrl = upRes.url;
      } else if (!upRes.ok && upRes.error) {
        alert("تعذر رفع صورة السند سحابياً: " + upRes.error + " — سيتم فتح واتساب ويمكنك إرفاق الصورة يدوياً.");
      }
    }

    const totalPrice = window.cafeCart.reduce((sum, item) => sum + item.price * item.qty, 0);

    let message = `*🧾 فاتورة طلب (${orderNum}) — ${CFG.brandName}*
`;
    message += `━━━━━━━━━━━━━━━━━━━━
`;
    message += `*👤 الاسم:* ${customerName}
`;
    message += `*📦 طريقة الاستلام:* ${orderType}
`;
    if (customerLocation) {
      const locLabel = orderType === "استلام سفري (Takeaway)" ? "وقت الاستلام" : "الطاولة / العنوان";
      message += `*📍 ${locLabel}:* ${customerLocation}
`;
    }
    if (paymentType === "transfer") {
      const chosenBank = selectedBankSelect ? selectedBankSelect.value : "تحويل بنكي";
      const refNum = transferRefInput ? transferRefInput.value.trim() : "";
      message += `*💳 طريقة الدفع:* تحويل عبر (${chosenBank})
`;
      if (refNum) message += `*🔢 رقم الحوالة/المرجع:* ${refNum}
`;
      if (receiptPublicUrl) {
        message += `*🧾 رابط سند الإيداع:* ${receiptPublicUrl}
`;
      } else {
        message += `*📎 ملاحظة:* مرفق صورة سند الإيداع أدناه
`;
      }
    } else {
      message += `*💵 طريقة الدفع:* نقداً عند الاستلام
`;
    }

    if (orderNotes) {
      message += `*📝 ملاحظات:* ${orderNotes}
`;
    }
    message += `━━━━━━━━━━━━━━━━━━━━
`;
    message += `*☕ تفاصيل الأصناف:*
`;

    window.cafeCart.forEach((item, index) => {
      message += `${index + 1}. *${item.name}* (×${item.qty})
`;
      message += `   └ الحجم: ${item.size} | ${item.addon} — *${(item.price * item.qty).toLocaleString()} ${CFG.currency}*
`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━
`;
    message += `*💰 الإجمالي المستحق: ${totalPrice.toLocaleString()} ${CFG.currency}*
`;
    message += `_تمت الفوترة عبر نظام المنيو التفاعلي_`;

    const whatsappUrl = `https://wa.me/${CFG.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  });
});

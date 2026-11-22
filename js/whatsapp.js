/* ==========================================================================
   Velvet Roast Café — Luxury Receipt Generator & WhatsApp Order Formatter
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const CAFE_WHATSAPP = "967772457941";

  const openCartBtn = document.getElementById("openCartBtn");
  const closeCartBtn = document.getElementById("closeCartBtn");
  const cartOverlay = document.getElementById("cartOverlay");
  const sendWhatsappBtn = document.getElementById("sendWhatsappBtn");

  // تحديث رقم الفاتورة والوقت الحالي عند فتح الدرج
  function refreshReceiptMeta() {
    const orderNumEl = document.getElementById("receiptOrderNum");
    const dateTimeEl = document.getElementById("receiptDateTime");

    if (orderNumEl && !orderNumEl.dataset.generated) {
      const randomNum = Math.floor(100 + Math.random() * 900);
      orderNumEl.textContent = `#VR-${randomNum}`;
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

  cartOverlay.addEventListener("click", (e) => {
    if (e.target === cartOverlay) {
      cartOverlay.classList.remove("open");
    }
  });

  sendWhatsappBtn.addEventListener("click", () => {
    if (!window.cafeCart || window.cafeCart.length === 0) {
      alert("الفاتورة فارغة! اختر مشروباً أو حلى أولاً.");
      return;
    }

    const orderNum = document.getElementById("receiptOrderNum").textContent;
    const orderType = document.getElementById("orderType").value;
    const customerName = document.getElementById("customerName").value.trim() || "عميل";
    const customerLocation = document.getElementById("customerLocation").value.trim();
    const orderNotes = document.getElementById("orderNotes").value.trim();

    if (!customerLocation) {
      alert("يرجى إدخال رقم الطاولة أو عنوان التوصيل لاعتماد الفاتورة.");
      document.getElementById("customerLocation").focus();
      return;
    }

    const totalPrice = window.cafeCart.reduce((sum, item) => sum + item.price * item.qty, 0);

    let message = `*🧾 فاتورة طلب VIP (${orderNum}) — Velvet Roast Café*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*👤 الاسم:* ${customerName}\n`;
    message += `*📦 طريقة الاستلام:* ${orderType}\n`;
    message += `*📍 الطاولة / العنوان:* ${customerLocation}\n`;
    if (orderNotes) {
      message += `*📝 ملاحظات الباريستا:* ${orderNotes}\n`;
    }
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*☕ تفاصيل الأصناف:*\n`;

    window.cafeCart.forEach((item, index) => {
      message += `${index + 1}. *${item.name}* (×${item.qty})\n`;
      message += `   └ الحجم: ${item.size} | ${item.addon} — *${(item.price * item.qty).toLocaleString()} ريال*\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*💰 الإجمالي المستحق: ${totalPrice.toLocaleString()} ريال*\n`;
    message += `_تمت الفوترة عبر نظام المنيو التفاعلي_`;

    const whatsappUrl = `https://wa.me/${CAFE_WHATSAPP}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  });
});
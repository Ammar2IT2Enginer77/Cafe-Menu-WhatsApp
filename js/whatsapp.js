/* ==========================================================================
   Velvet Roast Café — Cart Drawer & WhatsApp Order Formatter
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const CAFE_WHATSAPP = "967772457941";

  const openCartBtn = document.getElementById("openCartBtn");
  const closeCartBtn = document.getElementById("closeCartBtn");
  const cartOverlay = document.getElementById("cartOverlay");
  const sendWhatsappBtn = document.getElementById("sendWhatsappBtn");

  // فتح درج السلة
  openCartBtn.addEventListener("click", () => {
    cartOverlay.classList.add("open");
  });

  // إغلاق درج السلة
  closeCartBtn.addEventListener("click", () => {
    cartOverlay.classList.remove("open");
  });

  // الإغلاق عند الضغط خارج الدرج
  cartOverlay.addEventListener("click", (e) => {
    if (e.target === cartOverlay) {
      cartOverlay.classList.remove("open");
    }
  });

  // تجهيز وإرسال الطلب عبر واتساب
  sendWhatsappBtn.addEventListener("click", () => {
    if (!window.cafeCart || window.cafeCart.length === 0) {
      alert("سلة الطلبات فارغة! اختر مشروباً أو حلى أولاً.");
      return;
    }

    const orderType = document.getElementById("orderType").value;
    const customerName = document.getElementById("customerName").value.trim() || "عميل";
    const customerLocation = document.getElementById("customerLocation").value.trim();
    const orderNotes = document.getElementById("orderNotes").value.trim();

    if (!customerLocation) {
      alert("يرجى إدخال رقم الطاولة أو عنوان التوصيل لإتمام الطلب.");
      document.getElementById("customerLocation").focus();
      return;
    }

    const totalPrice = window.cafeCart.reduce((sum, item) => sum + item.price * item.qty, 0);

    let message = `*☕ طلب جديد — Velvet Roast Café*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*👤 الاسم:* ${customerName}\n`;
    message += `*📦 طريقة الاستلام:* ${orderType}\n`;
    message += `*📍 الطاولة / العنوان:* ${customerLocation}\n`;
    if (orderNotes) {
      message += `*📝 تفضيلات التحضير:* ${orderNotes}\n`;
    }
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*🛍️ تفاصيل الطلب:*\n`;

    window.cafeCart.forEach((item, index) => {
      message += `${index + 1}. ${item.name} (×${item.qty}) — ${(item.price * item.qty).toLocaleString()} ريال\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*💰 الإجمالي النهائي: ${totalPrice.toLocaleString()} ريال*`;

    const whatsappUrl = `https://wa.me/${CAFE_WHATSAPP}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  });
});
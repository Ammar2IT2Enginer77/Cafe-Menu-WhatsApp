/* ==========================================================================
   Cloud Layer: Supabase Database & Receipt Storage (with Local Fallback)
   ========================================================================== */

(function () {
  const CFG = window.CAFE_CONFIG || {};
  const hasCloud = Boolean(CFG.supabaseUrl && CFG.supabaseAnonKey && typeof window.supabase !== "undefined");
  const sb = hasCloud ? window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey) : null;
  const CFG = window.CAFE_CONFIG || {};
  const cleanUrl = (CFG.supabaseUrl || "").trim().replace(/\/+$/, "");
  const cleanKey = (CFG.supabaseAnonKey || "").trim();
  const hasCloud = Boolean(cleanUrl && cleanKey && typeof window.supabase !== "undefined");
  const sb = hasCloud ? window.supabase.createClient(cleanUrl, cleanKey) : null;

  function getSafeExt(file) {
    const raw = (file && file.name ? file.name.split(".").pop() : "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    if (["jpg", "jpeg", "png", "webp", "gif"].includes(raw)) return raw;
    if (file && file.type && file.type.includes("/")) {
      const fromType = file.type.split("/")[1].replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      if (["jpg", "jpeg", "png", "webp", "gif"].includes(fromType)) return fromType;
    }
    return "jpg";
  }
  function getLocalItems(defaults) {
    return JSON.parse(localStorage.getItem(CFG.storageKey)) || [...defaults];
  }

  function saveLocalItems(items) {
    localStorage.setItem(CFG.storageKey, JSON.stringify(items));
  }

  function getLocalBanks() {
    return JSON.parse(localStorage.getItem(CFG.banksStorageKey)) || [...(CFG.defaultBanks || [])];
  }

  function saveLocalBanks(banks) {
    localStorage.setItem(CFG.banksStorageKey, JSON.stringify(banks));
  }

  window.CafeCloud = {
    isCloudEnabled: hasCloud,

    async fetchMenuItems(defaultItems) {
      if (!sb) return getLocalItems(defaultItems);
      try {
        const { data, error } = await sb.from("menu_items").select("*").order("id", { ascending: false });
        if (error) throw error;
        if (!data || data.length === 0) return getLocalItems(defaultItems);
        return data.map(row => ({
          id: row.id,
          name: row.name,
          category: row.category,
          price: Number(row.price),
          badge: row.badge || "",
          hasSizes: row.has_sizes !== false,
          available: row.available !== false,
          addons: Array.isArray(row.addons) ? row.addons : ["تحضير قياسي"],
          desc: row.description || "",
          image: row.image_url || ""
        }));
      } catch (err) {
        console.warn("Supabase fetchMenuItems fallback:", err.message);
        return getLocalItems(defaultItems);
      }
    },

    async upsertMenuItem(item, allItems) {
      saveLocalItems(allItems);
      if (!sb) return { ok: true, mode: "local" };
      try {
        const payload = {
          id: item.id,
          name: item.name,
          category: item.category,
          price: item.price,
          badge: item.badge || "",
          has_sizes: item.hasSizes,
          available: item.available !== false,
          addons: item.addons,
          description: item.desc,
          image_url: item.image
        };
        const { error } = await sb.from("menu_items").upsert(payload);
        if (error) throw error;
        return { ok: true, mode: "cloud" };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },

    async deleteMenuItem(id, remainingItems) {
      saveLocalItems(remainingItems);
      if (!sb) return { ok: true, mode: "local" };
      try {
        const { error } = await sb.from("menu_items").delete().eq("id", id);
        if (error) throw error;
        return { ok: true, mode: "cloud" };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },

    async fetchBankAccounts() {
      if (!sb) return getLocalBanks();
      try {
        const { data, error } = await sb.from("bank_accounts").select("*").order("id", { ascending: true });
        if (error) throw error;
        if (!data || data.length === 0) return getLocalBanks();
        return data.map(b => ({
          id: b.id,
          bankName: b.bank_name,
          accountNumber: b.account_number,
          accountHolder: b.account_holder
        }));
      } catch (err) {
        console.warn("Supabase fetchBankAccounts fallback:", err.message);
        return getLocalBanks();
      }
    },

    async upsertBankAccount(bank, allBanks) {
      saveLocalBanks(allBanks);
      if (!sb) return { ok: true, mode: "local" };
      try {
        const { error } = await sb.from("bank_accounts").upsert({
          id: bank.id,
          bank_name: bank.bankName,
          account_number: bank.accountNumber,
          account_holder: bank.accountHolder
        });
        if (error) throw error;
        return { ok: true, mode: "cloud" };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },

    async deleteBankAccount(id, remainingBanks) {
      saveLocalBanks(remainingBanks);
      if (!sb) return { ok: true, mode: "local" };
      try {
        const { error } = await sb.from("bank_accounts").delete().eq("id", id);
        if (error) throw error;
        return { ok: true, mode: "cloud" };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },


    async uploadMenuImage(file) {
      if (!file) return { ok: false };
      if (!sb) {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve({ ok: true, mode: "local", url: e.target.result });
          reader.readAsDataURL(file);
        });
      }
      try {
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const filePath = `menu/item_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
        const bucket = CFG.receiptsBucket || "receipts";
        const { error: uploadError } = await sb.storage.from(bucket).upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        });
        if (uploadError) throw uploadError;
        const { data } = sb.storage.from(bucket).getPublicUrl(filePath);
        return { ok: true, mode: "cloud", url: data.publicUrl };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },

    async uploadReceiptImage(file) {
      if (!file) return { ok: false, mode: "none" };
      if (!sb) {
        return { ok: true, mode: "local", url: "" };
      }
      try {
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const filePath = `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
        const bucket = CFG.receiptsBucket || "receipts";
        const { error: uploadError } = await sb.storage.from(bucket).upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        });
        if (uploadError) throw uploadError;
        const { data } = sb.storage.from(bucket).getPublicUrl(filePath);
        return { ok: true, mode: "cloud", url: data.publicUrl };
      } catch (err) {
        return { ok: false, mode: "cloud", error: err.message };
      }
    }
  };
})();

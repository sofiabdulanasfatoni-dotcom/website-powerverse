/* ==========================================================================
   POWERVERSE — TOKO KEKUATAN SUPER
   Main Application Logic
   ========================================================================== */

/**
 * 1. DATA PRODUK KEKUATAN SUPER
 */
const POWERS_DATA = [
  {
    id: 1,
    name: "Super Speed",
    category: "Kecepatan",
    price: 150000,
    description: "Berlari secepat kilat dan bergerak melampaui batas manusia.",
    image: "images/super-speed.jpg",
    badge: "🔥 Populer"
  },
  {
    id: 2,
    name: "Invisibility",
    category: "Tubuh",
    price: 250000,
    description: "Menghilang dari pandangan dan bergerak tanpa terlihat.",
    image: "images/invisibility.jpg",
    badge: "💎 Rare"
  },
  {
    id: 3,
    name: "Flight",
    category: "Tubuh",
    price: 300000,
    description: "Terbang bebas di langit dan menjelajahi dunia dari atas.",
    image: "images/flight.jpg",
    badge: "⚡ Favorit"
  },
  {
    id: 4,
    name: "Telekinesis",
    category: "Pikiran",
    price: 450000,
    description: "Menggerakkan benda hanya dengan kekuatan pikiran.",
    image: "images/telekinesis.jpg",
    badge: "🧠 Epic"
  },
  {
    id: 5,
    name: "Fire Control",
    category: "Elemen",
    price: 500000,
    description: "Menciptakan dan mengendalikan api sesuai keinginan.",
    image: "images/fire-control.jpg",
    badge: "🔥 Epic"
  },
  {
    id: 6,
    name: "Teleportation",
    category: "Ruang-Waktu",
    price: 750000,
    description: "Berpindah tempat dalam sekejap tanpa perlu perjalanan.",
    image: "images/teleportation.jpg",
    badge: "🌌 Legendary"
  },
  {
    id: 7,
    name: "Time Control",
    category: "Ruang-Waktu",
    price: 1200000,
    description: "Menghentikan atau memperlambat waktu dalam simulasi.",
    image: "images/time-control.jpg",
    badge: "👑 Mythic"
  },
  {
    id: 8,
    name: "Reality Bending",
    category: "Langka",
    price: 2500000,
    description: "Kekuatan langka untuk mengubah realitas dunia fantasi.",
    image: "images/reality-bending.jpg",
    badge: "✨ Ultimate"
  }
];

// Nomor WhatsApp Toko (tanpa + atau spasi)
const STORE_PHONE_WA = "6288989838533";

/**
 * 2. APP STATE MANAGEMENT
 */
const state = {
  cart: [],
  activeCategory: "Semua",
  searchKeyword: "",
  toastTimer: null
};

/**
 * 3. DOM ELEMENTS CACHE
 */
const DOM = {
  powerGrid: document.getElementById("power-grid"),
  searchInput: document.getElementById("search-input"),
  categoriesContainer: document.getElementById("categories"),
  cartPanel: document.getElementById("cart-panel"),
  overlay: document.getElementById("overlay"),
  cartItems: document.getElementById("cart-items"),
  cartCount: document.getElementById("cart-count"),
  cartTotal: document.getElementById("cart-total"),
  openCartBtn: document.getElementById("open-cart"),
  closeCartBtn: document.getElementById("close-cart"),
  checkoutBtn: document.getElementById("checkout-button"),
  checkoutModal: document.getElementById("checkout-modal"),
  closeCheckoutBtn: document.getElementById("close-checkout"),
  checkoutForm: document.getElementById("checkout-form"),
  checkoutTotal: document.getElementById("checkout-total"),
  toast: document.getElementById("toast")
};

/**
 * 4. HELPER UTILITIES
 */
const formatRupiah = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(amount);
};

const showToast = (message) => {
  if (!DOM.toast) return;
  DOM.toast.textContent = message;
  DOM.toast.classList.add("show");

  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => {
    DOM.toast.classList.remove("show");
  }, 2500);
};

/**
 * 5. PRODUCT RENDERING & FILTERING
 */
function renderPowers() {
  if (!DOM.powerGrid) return;

  const keyword = state.searchKeyword.toLowerCase().trim();

  const filteredPowers = POWERS_DATA.filter((power) => {
    const matchesCategory =
      state.activeCategory === "Semua" || power.category === state.activeCategory;

    const searchableText = `${power.name} ${power.category} ${power.description} ${power.badge}`.toLowerCase();
    const matchesSearch = searchableText.includes(keyword);

    return matchesCategory && matchesSearch;
  });

  if (filteredPowers.length === 0) {
    DOM.powerGrid.innerHTML = `
      <div class="empty-menu">
        <h3>⚡ Kekuatan tidak ditemukan</h3>
        <p>Coba kata kunci atau kategori yang berbeda.</p>
      </div>
    `;
    return;
  }

  DOM.powerGrid.innerHTML = filteredPowers
    .map(
      (power) => `
    <article class="power-card">
      <div class="power-image">
        <img
          src="${power.image}"
          alt="${power.name}"
          loading="lazy"
          onerror="this.style.display='none'"
        >
        <span class="power-badge">${power.badge}</span>
      </div>

      <div class="power-details">
        <span class="power-category">${power.category}</span>
        <h3>${power.name}</h3>
        <p>${power.description}</p>

        <div class="power-bottom">
          <span class="power-price">${formatRupiah(power.price)}</span>

          <button
            class="power-add-button"
            data-add="${power.id}"
            aria-label="Tambahkan ${power.name} ke keranjang"
            title="Tambahkan ke keranjang"
          >+</button>
        </div>
      </div>
    </article>
  `
    )
    .join("");
}

/**
 * 6. CART MANAGEMENT
 */
function addToCart(id) {
  const power = POWERS_DATA.find((item) => item.id === id);
  if (!power) return;

  const existingItem = state.cart.find((item) => item.id === id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    state.cart.push({ ...power, quantity: 1 });
  }

  renderCart();
  showToast(`${power.name} ditambahkan ke keranjang!`);
}

function changeQuantity(id, delta) {
  const item = state.cart.find((power) => power.id === id);
  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    state.cart = state.cart.filter((power) => power.id !== id);
  }

  renderCart();
}

function getCartTotal() {
  return state.cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
}

function getCartCount() {
  return state.cart.reduce((total, item) => total + item.quantity, 0);
}

function renderCart() {
  const total = getCartTotal();
  const totalCount = getCartCount();

  if (DOM.cartCount) DOM.cartCount.textContent = totalCount;
  if (DOM.cartTotal) DOM.cartTotal.textContent = formatRupiah(total);
  if (DOM.checkoutTotal) DOM.checkoutTotal.textContent = formatRupiah(total);

  if (!DOM.cartItems) return;

  if (state.cart.length === 0) {
    DOM.cartItems.innerHTML = `
      <div class="empty-cart">
        <div style="font-size:48px">⚡</div>
        <h3>Keranjang masih kosong</h3>
        <p>Yuk, temukan kekuatan super impianmu!</p>
      </div>
    `;
    return;
  }

  DOM.cartItems.innerHTML = state.cart
    .map(
      (item) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">

      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <p>${formatRupiah(item.price * item.quantity)}</p>

        <div class="quantity-control">
          <button
            data-change="-1"
            data-id="${item.id}"
            aria-label="Kurangi jumlah ${item.name}"
          >−</button>

          <span>${item.quantity}</span>

          <button
            data-change="1"
            data-id="${item.id}"
            aria-label="Tambah jumlah ${item.name}"
          >+</button>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

/**
 * 7. MODALS & DRAWER CONTROLS
 */
function openCart() {
  if (DOM.cartPanel) DOM.cartPanel.classList.add("show");
  if (DOM.overlay) DOM.overlay.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  if (DOM.cartPanel) DOM.cartPanel.classList.remove("show");
  if (DOM.overlay) DOM.overlay.classList.remove("show");
  document.body.style.overflow = "";
}

function openCheckout() {
  if (state.cart.length === 0) {
    showToast("Keranjang kamu masih kosong.");
    return;
  }
  closeCart();
  if (DOM.checkoutModal) DOM.checkoutModal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeCheckout() {
  if (DOM.checkoutModal) DOM.checkoutModal.classList.remove("show");
  document.body.style.overflow = "";
}

/**
 * 8. CHECKOUT & WHATSAPP INTEGRATION
 */
function handleCheckoutSubmit(event) {
  event.preventDefault();

  if (state.cart.length === 0) {
    closeCheckout();
    showToast("Keranjang kamu masih kosong.");
    return;
  }

  const formData = new FormData(DOM.checkoutForm);
  const nama = String(formData.get("name") || "").trim();
  const telepon = String(formData.get("phone") || "").trim();
  const alamat = String(formData.get("address") || "").trim();
  const pembayaran = String(formData.get("payment") || "");

  if (!nama || !telepon || !alamat || !pembayaran) {
    showToast("Lengkapi data pemesanan terlebih dahulu.");
    return;
  }

  const daftarKekuatan = state.cart
    .map(
      (item, index) =>
        `${index + 1}. ${item.name}\n   Jumlah: ${item.quantity}\n   Harga: ${formatRupiah(item.price)}\n   Subtotal: ${formatRupiah(item.price * item.quantity)}`
    )
    .join("\n\n");

  const total = getCartTotal();

  const pesan = `
⚡ *PESANAN BARU — POWERVERSE*

👤 *Data Pelanggan*
Nama: ${nama}
No. HP: ${telepon}
Alamat: ${alamat}

✨ *Detail Kekuatan Super*
${daftarKekuatan}

💰 *Total: ${formatRupiah(total)}*
💳 Pembayaran: ${pembayaran}

Catatan: Ini adalah pesanan simulasi untuk proyek website PowerVerse.
Mohon konfirmasi pesanan saya. Terima kasih!
  `.trim();

  const urlWA = `https://wa.me/${STORE_PHONE_WA}?text=${encodeURIComponent(pesan)}`;

  window.open(urlWA, "_blank", "noopener,noreferrer");

  closeCheckout();
  if (DOM.checkoutForm) DOM.checkoutForm.reset();

  state.cart = [];
  renderCart();

  showToast("Ringkasan pesanan siap dibuka di WhatsApp!");
}

/**
 * 9. EVENT LISTENERS INITIALIZATION
 */
function initEventListeners() {
  // Filter Kategori
  if (DOM.categoriesContainer) {
    DOM.categoriesContainer.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");
      if (!button) return;

      state.activeCategory = button.dataset.category;

      document.querySelectorAll(".category").forEach((btn) => {
        btn.classList.toggle("active", btn === button);
      });

      renderPowers();
    });
  }

  // Input Pencarian
  if (DOM.searchInput) {
    DOM.searchInput.addEventListener("input", (e) => {
      state.searchKeyword = e.target.value;
      renderPowers();
    });
  }

  // Tambah ke Keranjang dari Katalog
  if (DOM.powerGrid) {
    DOM.powerGrid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-add]");
      if (!button) return;
      addToCart(Number(button.dataset.add));
    });
  }

  // Ubah Jumlah Item di Keranjang
  if (DOM.cartItems) {
    DOM.cartItems.addEventListener("click", (event) => {
      const button = event.target.closest("[data-change]");
      if (!button) return;
      changeQuantity(
        Number(button.dataset.id),
        Number(button.dataset.change)
      );
    });
  }

  // Buka / Tutup Keranjang
  if (DOM.openCartBtn) DOM.openCartBtn.addEventListener("click", openCart);
  if (DOM.closeCartBtn) DOM.closeCartBtn.addEventListener("click", closeCart);
  if (DOM.overlay) DOM.overlay.addEventListener("click", closeCart);

  // Buka / Tutup Checkout
  if (DOM.checkoutBtn) DOM.checkoutBtn.addEventListener("click", openCheckout);
  if (DOM.closeCheckoutBtn) DOM.closeCheckoutBtn.addEventListener("click", closeCheckout);

  if (DOM.checkoutModal) {
    DOM.checkoutModal.addEventListener("click", (event) => {
      if (event.target === DOM.checkoutModal) {
        closeCheckout();
      }
    });
  }

  // Form Submit Checkout
  if (DOM.checkoutForm) {
    DOM.checkoutForm.addEventListener("submit", handleCheckoutSubmit);
  }

  // Tombol Escape untuk Tutup Modal / Drawer
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCart();
      closeCheckout();
    }
  });
}

/**
 * 10. INITIALIZATION
 */
document.addEventListener("DOMContentLoaded", () => {
  initEventListeners();
  renderPowers();
  renderCart();
});
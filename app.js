const WHATSAPP = "2347066388889";
const NGN = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});
const A = "assets/";
const products = [
  {
    id: "amala",
    name: "Original Yam Flour",
    category: "Flours",
    price: 2500,
    img: "amala-yam-flour.png",
    tag: "BEST SELLER",
    desc: "Smooth yam flour for rich, traditional Amala.",
  },
  {
    id: "vital",
    name: "Vital Grains",
    category: "Pap & Grains",
    price: 4000,
    img: "vital-grains.png",
    tag: "POPULAR",
    desc: "A nourishing blend of premium grains for the family.",
  },
  {
    id: "mixed",
    name: "Mixed Grain Pap",
    category: "Pap & Grains",
    price: 2000,
    img: "mixed-grain-pap.png",
    tag: "NO ADDED SUGAR",
    desc: "Maize, millet, sorghum and oats — mild and wholesome.",
  },
  {
    id: "fruity",
    name: "Fruity Pap",
    category: "Pap & Grains",
    price: 2000,
    img: "fruity-pap.png",
    tag: "FAMILY FAVOURITE",
    desc: "Maize pap with dried fruit goodness.",
  },
  {
    id: "beans",
    name: "Beans Flour",
    category: "Beans",
    price: 3000,
    img: "beans-flour.png",
    tag: "AKARA & MOIMOI",
    desc: "Carefully milled beans, convenient for Akara and Moimoi.",
  },
  {
    id: "peeled",
    name: "Peeled Beans",
    category: "Beans",
    price: 3000,
    img: "peeled-beans.png",
    tag: "READY TO COOK",
    desc: "Clean, convenient peeled beans without the stress.",
  },
  {
    id: "ewedu",
    name: "Dry Ewedu",
    category: "Vegetables",
    price: 3500,
    img: "dry-ewedu.png",
    tag: "NATURAL",
    desc: "Conveniently dried Ewedu for everyday meals.",
  },

  {
    id: "snails",
    name: "Dried Snails",
    category: "Snails",
    price: 2500,
    img: "dry-snails.png",
    tag: "NATURAL",
    desc: "Conveniently dried Ewedu for everyday meals.",
  },
];
let cart = JSON.parse(localStorage.getItem("folalicious_cart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("folalicious_wishlist") || "[]");
let activeFilter = "All",
  query = "",
  sortMode = "Featured",
  quickProduct = null,
  quickIndex = 0,
  quickQty = 1;

const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
function money(n) {
  return NGN.format(n).replace("NGN", "₦");
}
function saveCart() {
  localStorage.setItem("folalicious_cart", JSON.stringify(cart));
  renderCart();
}
function saveWishlist() {
  localStorage.setItem("folalicious_wishlist", JSON.stringify(wishlist));
}
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(window.__toast);
  window.__toast = setTimeout(() => t.classList.remove("show"), 2200);
}
function gallery(p) {
  const stem = p.img.replace(".png", "");
  return [
    A + p.img,
    A + stem + "-angle-left.jpg",
    A + stem + "-angle-right.jpg",
  ];
}
function filteredProducts() {
  let list = products.filter(
    (p) =>
      (activeFilter === "All" || p.category === activeFilter) &&
      (!query ||
        `${p.name} ${p.category} ${p.desc}`
          .toLowerCase()
          .includes(query.toLowerCase())),
  );
  if (sortMode === "Price low") list.sort((a, b) => a.price - b.price);
  if (sortMode === "Name") list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
}
function renderProducts() {
  const grid = $("#productGrid"),
    list = filteredProducts();
  $("#resultCount").textContent =
    `${list.length} product${list.length === 1 ? "" : "s"}`;
  if (!list.length) {
    grid.innerHTML =
      '<div style="grid-column:1/-1;padding:65px;text-align:center;color:#777">No products found. Try another search.</div>';
    return;
  }
  grid.innerHTML = list
    .map((p) => {
      const g = gallery(p),
        saved = wishlist.includes(p.id);
      return `<article class="product-card" data-product="${p.id}">
    <div class="product-media" data-quick="${p.id}">
      <span class="tag">${p.tag}</span>
      <button class="wish ${saved ? "saved" : ""}" data-wish="${p.id}" aria-label="Wishlist">${saved ? "♥" : "♡"}</button>
      <img class="card-image" data-gallery-img="${p.id}" src="${g[0]}" alt="${p.name}" loading="lazy">
      <div class="gallery-arrows"><button data-card-prev="${p.id}" aria-label="Previous image">‹</button><button data-card-next="${p.id}" aria-label="Next image">›</button></div>
      <span class="gallery-count" data-gallery-count="${p.id}">1 / 3</span>
    </div>
    <div class="product-info"><small>${p.category}</small><h3>${p.name}</h3><p>${p.desc}</p>
      <div class="price-row"><span class="price">${money(p.price)}</span><button class="quick-btn" data-quick="${p.id}">Quick view</button><button class="add" data-add="${p.id}">Add to cart</button></div>
    </div>
  </article>`;
    })
    .join("");
}
const cardIndexes = {};
function cardSet(id, index) {
  const p = products.find((x) => x.id === id);
  if (!p) return;
  const g = gallery(p);
  let i = ((index % g.length) + g.length) % g.length;
  cardIndexes[id] = i;
  const img = document.querySelector(`[data-gallery-img="${id}"]`),
    count = document.querySelector(`[data-gallery-count="${id}"]`);
  if (img) {
    img.src = g[i];
    img.style.transform = i === 0 ? "" : "scale(1.01)";
  }
  if (count) count.textContent = `${i + 1} / ${g.length}`;
}
function addToCart(id, qty = 1) {
  const p = products.find((x) => x.id === id);
  if (!p) return;
  const item = cart.find((x) => x.id === id);
  if (item) item.qty += qty;
  else cart.push({ id, qty });
  saveCart();
  openCart();
  toast(`${p.name} added to cart`);
}
function changeQty(id, delta) {
  const item = cart.find((x) => x.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((x) => x.id !== id);
  saveCart();
}
function subtotal() {
  return cart.reduce((s, i) => {
    const p = products.find((x) => x.id === i.id);
    return s + (p ? p.price * i.qty : 0);
  }, 0);
}
function renderCart() {
  const count = cart.reduce((s, x) => s + x.qty, 0);
  $("#cartCount").textContent = count;
  $("#mobileCartCount").textContent = count;
  $("#cartSubtotal").textContent = money(subtotal());
  $("#checkoutTotal").textContent = money(subtotal());
  const items = $("#cartItems"),
    empty = $("#cartEmpty"),
    summary = $("#cartSummary");
  if (!cart.length) {
    items.innerHTML = "";
    empty.style.display = "grid";
    summary.style.display = "none";
    return;
  }
  empty.style.display = "none";
  summary.style.display = "block";
  items.innerHTML = cart
    .map((i) => {
      const p = products.find((x) => x.id === i.id);
      return `<div class="cart-row"><img src="${A + p.img}" alt="${p.name}"><div><h4>${p.name}</h4><small>${money(p.price)} each</small><div class="qty"><button data-dec="${p.id}">−</button><b>${i.qty}</b><button data-inc="${p.id}">+</button><button class="remove" data-remove="${p.id}">Remove</button></div></div><strong>${money(p.price * i.qty)}</strong></div>`;
    })
    .join("");
}
function openCart() {
  $("#cartDrawer").classList.add("open");
  $("#overlay").classList.add("show");
}
function closeCart() {
  $("#cartDrawer").classList.remove("open");
  $("#overlay").classList.remove("show");
}
function openCheckout() {
  if (!cart.length) {
    toast("Your cart is empty");
    return;
  }
  $("#checkoutTotal").textContent = money(subtotal());
  $("#checkoutModal").classList.add("show");
  document.body.classList.add("modal-open");
}
function closeCheckout() {
  $("#checkoutModal").classList.remove("show");
  document.body.classList.remove("modal-open");
}
function buildWhatsApp(data) {
  const lines = cart
    .map((i) => {
      const p = products.find((x) => x.id === i.id);
      return `• ${p.name} × ${i.qty} — ${money(p.price * i.qty)}`;
    })
    .join("\n");
  return `Hello Folalicious Delight! 👋\n\nI would like to place an order:\n\n${lines}\n\n*Subtotal:* ${money(subtotal())}\n*Name:* ${data.name}\n*Phone:* ${data.phone}\n*Delivery:* ${data.address}\n*Country:* ${data.country}\n*Preferred contact:* ${data.contact}${data.note ? `\n*Note:* ${data.note}` : ""}\n\nPlease confirm delivery fee and payment instructions. Thank you!`;
}
function sendWhatsApp(text) {
  window.open(
    `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`,
    "_blank",
    "noopener",
  );
}
function openQuick(id) {
  const p = products.find((x) => x.id === id);
  if (!p) return;
  quickProduct = p;
  quickIndex = 0;
  quickQty = 1;
  $("#quickView").classList.add("show");
  document.body.classList.add("modal-open");
  renderQuick();
}
function renderQuick() {
  const p = quickProduct,
    g = gallery(p);
  $("#quickCategory").textContent = p.category;
  $("#quickName").textContent = p.name;
  $("#quickDesc").textContent = p.desc;
  $("#quickPrice").textContent = money(p.price);
  $("#quickQty").textContent = quickQty;
  $("#quickCount").textContent = `${quickIndex + 1} / ${g.length}`;
  $("#quickImage").src = g[quickIndex];
  $("#quickImage").alt = p.name;
  $("#quickThumbs").innerHTML = g
    .map(
      (src, i) =>
        `<button class="${i === quickIndex ? "active" : ""}" data-thumb="${i}"><img src="${src}" alt="View ${i + 1}"></button>`,
    )
    .join("");
}
function closeQuick() {
  $("#quickView").classList.remove("show");
  document.body.classList.remove("modal-open");
}
function stepQuick(dir) {
  const g = gallery(quickProduct);
  quickIndex = (quickIndex + dir + g.length) % g.length;
  renderQuick();
}
function quickOrder() {
  if (!quickProduct) return;
  const p = quickProduct;
  sendWhatsApp(
    `Hello Folalicious Delight! 👋\n\nI would like to order:\n• ${p.name} × ${quickQty} — ${money(p.price * quickQty)}\n\nPlease confirm availability, delivery fee and payment instructions.`,
  );
}
document.addEventListener("click", (e) => {
  const add = e.target.closest("[data-add]");
  if (add) {
    addToCart(add.dataset.add);
    return;
  }
  const inc = e.target.closest("[data-inc]");
  if (inc) {
    changeQty(inc.dataset.inc, 1);
    return;
  }
  const dec = e.target.closest("[data-dec]");
  if (dec) {
    changeQty(dec.dataset.dec, -1);
    return;
  }
  const rem = e.target.closest("[data-remove]");
  if (rem) {
    cart = cart.filter((x) => x.id !== rem.dataset.remove);
    saveCart();
    return;
  }
  const wish = e.target.closest("[data-wish]");
  if (wish) {
    const id = wish.dataset.wish;
    if (wishlist.includes(id)) {
      wishlist = wishlist.filter((x) => x !== id);
      wish.classList.remove("saved");
      wish.textContent = "♡";
      toast("Removed from wishlist");
    } else {
      wishlist.push(id);
      wish.classList.add("saved");
      wish.textContent = "♥";
      toast("Saved to wishlist");
    }
    saveWishlist();
    return;
  }
  const filter = e.target.closest("[data-filter]");
  if (filter) {
    e.preventDefault();
    activeFilter = filter.dataset.filter;
    $$("[data-filter]").forEach((b) =>
      b.classList.toggle("active", b.dataset.filter === activeFilter),
    );
    renderProducts();
    $("#shop").scrollIntoView({ behavior: "smooth" });
    return;
  }
  const prev = e.target.closest("[data-card-prev]");
  if (prev) {
    e.stopPropagation();
    cardSet(
      prev.dataset.cardPrev,
      (cardIndexes[prev.dataset.cardPrev] || 0) - 1,
    );
    return;
  }
  const next = e.target.closest("[data-card-next]");
  if (next) {
    e.stopPropagation();
    cardSet(
      next.dataset.cardNext,
      (cardIndexes[next.dataset.cardNext] || 0) + 1,
    );
    return;
  }
  const quick = e.target.closest("[data-quick]");
  if (quick) {
    openQuick(quick.dataset.quick);
    return;
  }
  const thumb = e.target.closest("[data-thumb]");
  if (thumb) {
    quickIndex = Number(thumb.dataset.thumb);
    renderQuick();
    return;
  }
});
$("#cartBtn").onclick = openCart;
$("#mobileCart").onclick = openCart;
$("#closeCart").onclick = closeCart;
$("#overlay").onclick = closeCart;
$("#checkoutBtn").onclick = openCheckout;
$("#closeCheckout").onclick = closeCheckout;
$("#quickPrev").onclick = () => stepQuick(-1);
$("#quickNext").onclick = () => stepQuick(1);
$("#quickMinus").onclick = () => {
  quickQty = Math.max(1, quickQty - 1);
  renderQuick();
};
$("#quickPlus").onclick = () => {
  quickQty++;
  renderQuick();
};
$("#quickAdd").onclick = () => {
  addToCart(quickProduct.id, quickQty);
  closeQuick();
};
$("#quickOrder").onclick = quickOrder;
$("#closeQuickView").onclick = closeQuick;
$("#quickView").addEventListener("click", (e) => {
  if (e.target.id === "quickView") closeQuick();
});
$("#checkoutModal").addEventListener("click", (e) => {
  if (e.target.id === "checkoutModal") closeCheckout();
});
$("#quickImage").addEventListener(
  "touchstart",
  (e) => (window.__touchX = e.changedTouches[0].screenX),
  { passive: true },
);
$("#quickImage").addEventListener(
  "touchend",
  (e) => {
    if (window.__touchX == null) return;
    const dx = e.changedTouches[0].screenX - window.__touchX;
    if (Math.abs(dx) > 35) stepQuick(dx < 0 ? 1 : -1);
    window.__touchX = null;
  },
  { passive: true },
);
$("#searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  query = $("#searchInput").value.trim();
  renderProducts();
  $("#shop").scrollIntoView({ behavior: "smooth" });
});
$("#searchInput").addEventListener("input", (e) => {
  query = e.target.value.trim();
  renderProducts();
});
$("#sortBtn").onclick = () => {
  sortMode =
    sortMode === "Featured"
      ? "Price low"
      : sortMode === "Price low"
        ? "Name"
        : "Featured";
  $("#sortBtn").textContent = sortMode + " ▾";
  renderProducts();
};
$("#wishlistBtn").onclick = () =>
  toast(
    wishlist.length
      ? `${wishlist.length} saved item${wishlist.length > 1 ? "s" : ""}`
      : "Your wishlist is empty",
  );
$("#footerWhatsApp").onclick = (e) => {
  e.preventDefault();
  sendWhatsApp("Hello Folalicious Delight! I would like to make an enquiry.");
};
$("#categoryToggle").onclick = () => {
  $("#shop").scrollIntoView({ behavior: "smooth" });
  toast("Choose a category to browse");
};
$("#mobileMenu").onclick = () => {
  document.querySelector(".category-nav").style.display =
    document.querySelector(".category-nav").style.display === "flex"
      ? "none"
      : "flex";
  toast("Categories are available above");
};
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeCart();
    closeQuick();
    closeCheckout();
  }
});
$("#year").textContent = new Date().getFullYear();
renderProducts();
renderCart();

import { esc, price, priceHtml, onSale, discount, swatch, imgUrl, colorImageIndex, waLink, igLink, igDm, ICON_WA, ICON_IG, type Product } from "./shared";

// Identity emails (invite / password recovery) land on the home page — forward them to the admin panel.
if (/(invite_token|recovery_token|confirmation_token|email_change_token|access_token)=/.test(location.hash)) {
  location.replace("/admin" + location.hash);
}

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const genericMsg = "¡Hola Matrero! Quería hacer una consulta.";

for (const id of ["topWa", "heroWa", "contactWa", "fabWa", "menuWa", "footWa"]) ($(id) as HTMLAnchorElement).href = waLink(genericMsg);
($("contactIg") as HTMLAnchorElement).href = igLink;
($("menuIg") as HTMLAnchorElement).href = igLink;
($("footIg") as HTMLAnchorElement).href = igLink;
($("topIg") as HTMLAnchorElement).href = igLink;
$("fabWa").innerHTML = ICON_WA;
const ICON_CAT = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M8 3 4 5.5 2.5 10l3 1V21h13V11l3-1L20 5.5 16 3c-.5 1.7-2 3-4 3S8.5 4.7 8 3z"/></svg>`;
const ICON_BAG = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="M5 8h14l-1 13H6L5 8z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg>`;
const ICONS: Record<string, string> = { wa: ICON_WA, ig: ICON_IG, cat: ICON_CAT, bag: ICON_BAG };
document.querySelectorAll<HTMLElement>("[data-icon]").forEach((el) => (el.innerHTML = ICONS[el.dataset.icon!] ?? ""));

// Value icons (inspired by the logo)
const VALUE_ICONS: Record<string, string> = {
  shield: `<path d="M12 2.5 4 5.5v6c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10v-6z"/><path d="m9 14 6-6M8.5 9.5l2 2"/>`,
  boot: `<ellipse cx="12" cy="7" rx="3.6" ry="4.5"/><ellipse cx="12" cy="17.5" rx="2.8" ry="3.5"/><path d="M10.5 5h3M10 7.5h4M10.5 10h3M10.8 16.5h2.4M10.8 18.8h2.4"/>`,
  gear: `<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/><circle cx="12" cy="12" r="6.5"/>`,
  wind: `<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8"/>`,
  needle: `<path d="M2 14h20M5 12v4M9 12v4M13 12v4"/><path d="M19 3c-2 4-4 10-5 17 2-3 3.5-6 4.5-9.5S20 5 19 3z"/>`,
};
document.querySelectorAll<HTMLElement>("[data-value]").forEach((el) => {
  el.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${VALUE_ICONS[el.dataset.value!] ?? ""}</svg>`;
});

// Hero: tilt + floating dust
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const hero = document.querySelector<HTMLElement>(".hero")!;
const emblem = $("emblem");
if (!reduceMotion && matchMedia("(pointer: fine)").matches) {
  hero.addEventListener("pointermove", (e) => {
    const r = emblem.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) / r.width;
    const y = (e.clientY - (r.top + r.height / 2)) / r.height;
    emblem.style.setProperty("--ry", `${Math.max(-1, Math.min(1, x)) * 7}deg`);
    emblem.style.setProperty("--rx", `${Math.max(-1, Math.min(1, -y)) * 7}deg`);
  });
  hero.addEventListener("pointerleave", () => {
    emblem.style.setProperty("--rx", "0deg");
    emblem.style.setProperty("--ry", "0deg");
  });
}
if (!reduceMotion) {
  const canvas = $("dust") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;
  type Mote = { x: number; y: number; r: number; vx: number; vy: number; a: number; t: number };
  let motes: Mote[] = [];
  let w = 0, h = 0, raf = 0, visible = true;
  const spawn = (initial: boolean): Mote => ({
    x: Math.random() * w,
    y: initial ? Math.random() * h : h + 10,
    r: Math.random() * 1.6 + 0.4,
    vx: (Math.random() - 0.5) * 0.15,
    vy: -(Math.random() * 0.25 + 0.08),
    a: Math.random() * 0.5 + 0.15,
    t: Math.random() * Math.PI * 2,
  });
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = hero.clientWidth; h = hero.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    motes = Array.from({ length: Math.round(Math.min(90, (w * h) / 14000)) }, () => spawn(true));
  };
  const tick = () => {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < motes.length; i++) {
      const m = motes[i];
      m.t += 0.01; m.x += m.vx + Math.sin(m.t) * 0.12; m.y += m.vy;
      if (m.y < -10) motes[i] = spawn(false);
      ctx.globalAlpha = m.a * (0.6 + 0.4 * Math.sin(m.t * 2));
      ctx.fillStyle = m.r > 1.3 ? "#f2b464" : "#e6cfa2";
      ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2); ctx.fill();
    }
    raf = visible ? requestAnimationFrame(tick) : 0;
  };
  resize();
  addEventListener("resize", resize);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(tick);
  }).observe(hero);
}

// Hero: scroll depth
if (!reduceMotion) {
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const sp = Math.min(1, Math.max(0, scrollY / (hero.offsetHeight || 1)));
      hero.style.setProperty("--sp", sp.toFixed(3));
      ticking = false;
    });
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// Reveal sections on scroll
const revealEls = document.querySelectorAll<HTMLElement>(".reveal");
if (reduceMotion || !("IntersectionObserver" in window)) revealEls.forEach((el) => el.classList.add("in"));
else {
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  }), { threshold: 0.15 });
  revealEls.forEach((el) => io.observe(el));
}

// Hamburger menu
const menuBtn = $("menuBtn");
const menuPanel = $("menuPanel");
const setMenu = (open: boolean) => {
  menuPanel.hidden = !open;
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  menuBtn.classList.toggle("open", open);
};
menuBtn.addEventListener("click", (e) => { e.stopPropagation(); setMenu(Boolean(menuPanel.hidden)); });
menuPanel.querySelectorAll("[data-close]").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("click", (e) => { if (!menuPanel.hidden && !menuPanel.contains(e.target as Node)) setMenu(false); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menuPanel.hidden) { setMenu(false); menuBtn.focus(); } });
$("year").textContent = String(new Date().getFullYear());

let products: Product[] = [];
let active = "Todo";

function renderFilters() {
  const cats = ["Todo", ...new Set(products.map((p) => p.category))];
  if (cats.length <= 2) {
    $("filters").innerHTML = "";
    return;
  }
  $("filters").innerHTML = cats
    .map((c) => `<button role="tab" class="chip${c === active ? " active" : ""}" data-cat="${esc(c)}">${esc(c)}</button>`)
    .join("");
}

function card(p: Product) {
  const img = p.images[0]
    ? `<img src="${imgUrl(p.images[0])}" alt="${esc(p.name)}" loading="lazy" />`
    : `<div class="noimg"><img src="/logo.jpg" alt="" /></div>`;
  return `<button class="card${p.available ? "" : " soldout"}" data-id="${p.id}">
    <div class="card-img">${img}${!p.available ? '<span class="badge">Sin stock</span>' : onSale(p) ? `<span class="badge badge-sale">-${discount(p)}%</span>` : p.featured ? '<span class="badge badge-gold">Destacado</span>' : ""}</div>
    <div class="card-body">
      <span class="card-cat">${esc(p.category)}</span>
      <h3>${esc(p.name)}</h3>
      <div class="card-foot">
        <span class="card-price">${priceHtml(p)}</span>
        ${p.sizes.length ? `<span class="card-sizes">${p.sizes.length > 4 ? `${esc(p.sizes[0])} al ${esc(p.sizes[p.sizes.length - 1])}` : p.sizes.map(esc).join(" · ")}</span>` : ""}
      </div>
      ${p.colors.length ? `<span class="card-colors" aria-label="Colores: ${esc(p.colors.join(", "))}">${p.colors.map((c) => `<i style="--c:${swatch(c)}" title="${esc(c)}"></i>`).join("")}</span>` : ""}
    </div>
  </button>`;
}

function renderGrid() {
  const list = active === "Todo" ? products : products.filter((p) => p.category === active);
  $("grid").innerHTML = list.length
    ? list.map(card).join("")
    : `<div class="empty"><p>Estamos preparando el catálogo.</p><p class="muted">Mientras tanto, escribinos por WhatsApp o seguinos en Instagram.</p></div>`;
}

function openProduct(p: Product) {
  let size = "";
  let color = p.colors.length === 1 ? p.colors[0] : "";
  let current = Math.max(0, colorImageIndex(p, color));
  let qty = 1;
  let sizeError = false;
  let colorError = false;
  const body = $("modalBody");
  const draw = () => {
    const msg = `¡Hola Matrero! Me interesa: ${p.name}${variant(size, color) ? ` (${variant(size, color)})` : ""}${p.price > 0 ? ` - ${price(p.price)}` : ""}. ¿Está disponible?`;
    const main = p.images[current];
    body.innerHTML = `
      <button class="modal-close" aria-label="Cerrar">×</button>
      <div class="gallery">
        <div class="gallery-main">${main ? `<img src="${imgUrl(main)}" alt="${esc(p.name)}" />` : `<div class="noimg"><img src="/logo.jpg" alt="" /></div>`}</div>
        ${p.images.length > 1 ? `<div class="thumbs">${p.images.map((k, i) => `<button class="thumb${i === current ? " active" : ""}" data-i="${i}"><img src="${imgUrl(k)}" alt="" /></button>`).join("")}</div>` : ""}
      </div>
      <div class="detail">
        <span class="card-cat">${esc(p.category)}</span>
        <h2>${esc(p.name)}</h2>
        <p class="detail-price">${priceHtml(p)}${onSale(p) ? ` <span class="sale-tag">-${discount(p)}% OFF</span>` : ""}</p>
        ${p.description ? `<p class="detail-desc">${esc(p.description).replace(/\n/g, "<br>")}</p>` : ""}
        ${p.colors.length ? `<p class="label">Color${color ? `: <b>${esc(color)}</b>` : ""}</p><div class="colors">${p.colors.map((c) => `<button class="color${c === color ? " active" : ""}" data-color="${esc(c)}" style="--c:${swatch(c)}" aria-label="${esc(c)}" aria-pressed="${c === color}" title="${esc(c)}"></button>`).join("")}</div>` : ""}
        ${p.sizes.length ? `<p class="label">Elegí tu talle</p><div class="sizes">${p.sizes.map((s) => `<button class="size${s === size ? " active" : ""}" data-size="${esc(s)}">${esc(s)}</button>`).join("")}</div>` : ""}
        ${p.available
          ? `<div class="detail-actions">
              ${colorError || sizeError ? `<p class="size-error" role="alert">Elegí ${colorError && sizeError ? "color y talle" : colorError ? "un color" : "un talle"} para agregarlo.</p>` : ""}
              <div class="qty-row"><span class="label">Cantidad</span>${qtyControl(qty, "m")}</div>
              <button class="btn btn-primary btn-block" data-add>${ICON_BAG} Agregar al carrito</button>
              <a class="btn btn-ghost btn-block" href="${waLink(msg)}" target="_blank" rel="noopener">${ICON_WA} Consultar por WhatsApp</a>
            </div>`
          : `<p class="soldout-note">Sin stock por el momento.</p><a class="btn btn-ghost btn-block" href="${waLink(`¡Hola Matrero! ¿Va a volver a entrar ${p.name}?`)}" target="_blank" rel="noopener">Avisame cuando vuelva</a>`}
      </div>`;
  };
  body.onclick = (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>("button");
    if (!t) return;
    if (t.classList.contains("modal-close")) return ($("modal") as HTMLDialogElement).close();
    if (t.dataset.color) {
      color = color === t.dataset.color ? "" : t.dataset.color;
      const ci = colorImageIndex(p, color);
      if (ci >= 0) current = ci;
      colorError = false; draw();
    }
    if (t.dataset.size) { size = size === t.dataset.size ? "" : t.dataset.size; sizeError = false; draw(); }
    if (t.dataset.qm) { qty = Math.max(1, Math.min(99, qty + Number(t.dataset.qm))); draw(); }
    if (t.hasAttribute("data-add")) {
      sizeError = Boolean(p.sizes.length && !size);
      colorError = Boolean(p.colors.length && !color);
      if (sizeError || colorError) { draw(); return; }
      addToCart(p, size, color, qty);
      ($("modal") as HTMLDialogElement).close();
      toast(`Agregaste ${qty > 1 ? `${qty} × ` : ""}${p.name} al carrito`);
      bumpCart();
    }
    if (t.dataset.i) {
      current = Number(t.dataset.i);
      if (p.images.length >= p.colors.length && p.colors[current]) { color = p.colors[current]; colorError = false; }
      draw();
    }
  };
  draw();
  ($("modal") as HTMLDialogElement).showModal();
}

$("modal").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) ($("modal") as HTMLDialogElement).close();
});
$("filters").addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>("[data-cat]");
  if (!b) return;
  active = b.dataset.cat!;
  renderFilters();
  renderGrid();
});
$("grid").addEventListener("click", (e) => {
  const c = (e.target as HTMLElement).closest<HTMLElement>("[data-id]");
  const p = c && products.find((x) => x.id === Number(c.dataset.id));
  if (p) openProduct(p);
});

// ---------- Cart ----------
interface CartItem { id: number; name: string; price: number; size: string; color: string; qty: number; image?: string }
const variant = (size: string, color: string) => [color, size && `talle ${size}`].filter(Boolean).join(", ");
const CART_KEY = "matrero-cart";
let cart: CartItem[] = (() => {
  try {
    const v = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(v) ? v.filter((i) => i && typeof i.id === "number" && i.qty > 0).map((i) => ({ ...i, size: i.size ?? "", color: i.color ?? "" })) : [];
  } catch { return []; }
})();
const saveCart = () => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch {} renderCart(); };

function qtyControl(n: number, scope: string, key = "") {
  const attr = scope === "m" ? "data-qm" : "data-cq";
  const k = key ? ` data-key="${esc(key)}"` : "";
  return `<span class="qty"><button ${attr}="-1"${k} aria-label="Restar uno"${n <= 1 && scope === "m" ? " disabled" : ""}>−</button><b>${n}</b><button ${attr}="1"${k} aria-label="Sumar uno">+</button></span>`;
}
const keyOf = (i: { id: number; size: string; color: string }) => `${i.id}|${i.size}|${i.color}`;

function addToCart(p: Product, size: string, color: string, qty: number) {
  const found = cart.find((i) => i.id === p.id && i.size === size && i.color === color);
  if (found) found.qty = Math.min(99, found.qty + qty);
  else cart.push({ id: p.id, name: p.name, price: p.price, size, color, qty, image: p.images[Math.max(0, colorImageIndex(p, color))] });
  saveCart();
}

// Keep cart in sync with the live catalog (prices, names, removed or sold-out items)
function syncCart() {
  const before = cart.length;
  cart = cart.flatMap((i) => {
    const p = products.find((x) => x.id === i.id);
    if (!p || !p.available) return [];
    return [{ ...i, name: p.name, price: p.price, image: p.images[Math.max(0, colorImageIndex(p, i.color))] }];
  });
  saveCart();
  if (cart.length < before) toast("Algunas prendas de tu carrito ya no están disponibles y se quitaron.");
}

const cartCount = () => cart.reduce((n, i) => n + i.qty, 0);

function renderCart() {
  const count = cartCount();
  const badge = $("cartCount");
  badge.textContent = String(count);
  badge.hidden = count === 0;
  $("cartBtn").setAttribute("aria-label", count ? `Ver carrito (${count} ${count === 1 ? "prenda" : "prendas"})` : "Ver carrito");

  const items = $("cartItems");
  $("cartFoot").hidden = !cart.length;
  if (!cart.length) {
    items.innerHTML = `<div class="cart-empty"><span class="ico">${ICON_BAG}</span><p>Tu carrito está vacío.</p><a href="#catalogo" class="btn btn-ghost" data-close-cart>Ver catálogo</a></div>`;
    return;
  }
  items.innerHTML = cart.map((i) => `
    <div class="cart-item">
      ${i.image ? `<img src="${imgUrl(i.image)}" alt="" loading="lazy" />` : `<span class="cart-noimg"><img src="/logo.jpg" alt="" /></span>`}
      <div class="cart-info">
        <strong>${esc(i.name)}</strong>
        <small>${[i.color, i.size && `Talle ${i.size}`].filter(Boolean).map(esc).join(" · ")}${i.color || i.size ? " · " : ""}${price(i.price)}</small>
        ${qtyControl(i.qty, "c", keyOf(i))}
      </div>
      <div class="cart-side">
        <span>${i.price > 0 ? price(i.price * i.qty) : ""}</span>
        <button class="cart-remove" data-remove="${esc(keyOf(i))}" aria-label="Quitar ${esc(i.name)}">Quitar</button>
      </div>
    </div>`).join("");
  const total = cart.reduce((t, i) => t + (i.price > 0 ? i.price * i.qty : 0), 0);
  const hasConsult = cart.some((i) => !(i.price > 0));
  $("cartTotal").textContent = total > 0 ? price(total) : "A consultar";
  $("cartTotalNote").hidden = !hasConsult || total === 0;
}

function orderMessage() {
  const name = ($("cartName") as HTMLInputElement).value.trim();
  const note = ($("cartNote") as HTMLTextAreaElement).value.trim();
  const lines = cart.map((i) => `• ${i.qty} × ${i.name}${variant(i.size, i.color) ? ` (${variant(i.size, i.color)})` : ""} — ${i.price > 0 ? price(i.price * i.qty) : "a consultar"}`);
  const total = cart.reduce((t, i) => t + (i.price > 0 ? i.price * i.qty : 0), 0);
  const hasConsult = cart.some((i) => !(i.price > 0));
  return [
    `¡Hola Matrero!${name ? ` Soy ${name}.` : ""} Quiero hacer este pedido:`,
    "",
    ...lines,
    "",
    total > 0 ? `Total: ${price(total)}${hasConsult ? " + prendas a consultar" : ""}` : "Total: a consultar",
    ...(note ? ["", `Nota: ${note}`] : []),
    "",
    "¿Me confirman disponibilidad y envío? ¡Gracias!",
  ].join("\n");
}

const cartDlg = $("cart") as HTMLDialogElement;
const openCart = () => { renderCart(); cartDlg.showModal(); };
$("cartBtn").addEventListener("click", openCart);
$("cartClose").addEventListener("click", () => cartDlg.close());
cartDlg.addEventListener("click", (e) => {
  if (e.target === cartDlg) return cartDlg.close();
  const t = (e.target as HTMLElement).closest<HTMLElement>("button, a");
  if (!t) return;
  if (t.hasAttribute("data-close-cart")) return cartDlg.close();
  if (t.dataset.remove) { cart = cart.filter((i) => keyOf(i) !== t.dataset.remove); saveCart(); return; }
  if (t.dataset.cq && t.dataset.key) {
    const it = cart.find((i) => keyOf(i) === t.dataset.key);
    if (!it) return;
    it.qty += Number(t.dataset.cq);
    if (it.qty <= 0) cart = cart.filter((i) => i !== it);
    else it.qty = Math.min(99, it.qty);
    saveCart();
  }
});
$("cartClear").addEventListener("click", () => { if (confirm("¿Vaciar el carrito?")) { cart = []; saveCart(); } });
$("sendWa").addEventListener("click", () => {
  window.open(waLink(orderMessage()), "_blank", "noopener");
});
$("sendIg").addEventListener("click", async () => {
  const msg = orderMessage();
  // Copy synchronously first (still inside the click), then open the Instagram chat.
  let copied = false;
  const ta = document.createElement("textarea");
  ta.value = msg; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
  cartDlg.appendChild(ta); ta.select();
  try { copied = document.execCommand("copy"); } catch {}
  ta.remove();
  if (!copied) { try { await navigator.clipboard.writeText(msg); copied = true; } catch {} }
  const win = window.open(igDm, "_blank");
  if (win) win.opener = null;
  toast(copied ? "Pedido copiado. Pegalo en el chat de Instagram y envialo." : "No pudimos copiar el pedido. Escribinos por Instagram @matrero.jp.", !copied);
  if (!win) location.href = igDm;
});

function bumpCart() {
  const b = $("cartBtn");
  b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump");
}

const toastEl = $("toast");
let toastT = 0;
function toast(msg: string, error = false) {
  // Dialogs render in the top layer, so host the toast inside the open one to keep it visible.
  const host = document.querySelector<HTMLDialogElement>("dialog[open]") ?? document.body;
  if (toastEl.parentElement !== host) host.appendChild(toastEl);
  toastEl.textContent = msg;
  toastEl.className = `toast show${error ? " error" : ""}`;
  clearTimeout(toastT);
  toastT = window.setTimeout(() => (toastEl.className = "toast"), 3800);
}
renderCart();

fetch("/api/products")
  .then((r) => (r.ok ? r.json() : Promise.reject()))
  .then((data: Product[]) => {
    products = data;
    renderFilters();
    renderGrid();
    syncCart();
  })
  .catch(() => {
    $("grid").innerHTML = `<div class="empty"><p>No pudimos cargar el catálogo.</p><p class="muted">Probá de nuevo en unos minutos o escribinos por WhatsApp.</p></div>`;
  });

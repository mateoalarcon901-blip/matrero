import {
  login, logout, getUser, handleAuthCallback, acceptInvite, updateUser, requestPasswordRecovery,
  AuthError, MissingIdentityError, type User,
} from "@netlify/identity";
import { esc, priceHtml, swatch, imgUrl, type Product } from "./shared";

const app = document.getElementById("app")!;
const userBox = document.getElementById("userBox")!;
const toastEl = document.getElementById("toast")!;
const COLOR_PRESETS = ["Negro", "Blanco", "Gris", "Azul marino", "Verde", "Beige", "Marrón"];
const SIZE_PRESETS = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "38", "40", "42", "44", "46", "48", "50", "Único"];

let products: Product[] = [];

function toast(msg: string, error = false) {
  toastEl.textContent = msg;
  toastEl.className = `toast show${error ? " error" : ""}`;
  clearTimeout((toast as any).t);
  (toast as any).t = setTimeout(() => (toastEl.className = "toast"), 3500);
}

function authMessage(e: unknown) {
  if (e instanceof MissingIdentityError) return "El inicio de sesión no está disponible todavía en este sitio.";
  if (e instanceof AuthError) {
    if (e.status === 401 || e.status === 400) return "Email o contraseña incorrectos.";
    if (e.status === 422) return "Datos inválidos. La contraseña debe tener al menos 8 caracteres.";
    return e.message;
  }
  return "Ocurrió un error. Probá de nuevo.";
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  await getUser(); // keeps the session cookie fresh
  const res = await fetch(url, { credentials: "same-origin", ...init });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Error ${res.status}`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

/* ---------- Auth screens ---------- */

function showLogin(note = "") {
  userBox.innerHTML = "";
  app.innerHTML = `
    <form class="panel auth" id="loginForm">
      <h1>Ingresar</h1>
      <p class="muted">Accedé para administrar tu catálogo.</p>
      ${note ? `<p class="note">${esc(note)}</p>` : ""}
      <label>Email<input type="email" name="email" required autocomplete="email" /></label>
      <label>Contraseña<input type="password" name="password" required autocomplete="current-password" /></label>
      <p class="form-error" id="err"></p>
      <button class="btn btn-primary btn-block">Ingresar</button>
      <button type="button" class="link" id="forgot">Olvidé mi contraseña</button>
    </form>`;
  const form = document.getElementById("loginForm") as HTMLFormElement;
  form.onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const btn = form.querySelector("button")!;
    btn.disabled = true;
    try {
      await login(String(fd.get("email")), String(fd.get("password")));
      await boot();
    } catch (err) {
      document.getElementById("err")!.textContent = authMessage(err);
    } finally {
      btn.disabled = false;
    }
  };
  document.getElementById("forgot")!.onclick = async () => {
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    if (!email) return (document.getElementById("err")!.textContent = "Escribí tu email arriba y volvé a tocar “Olvidé mi contraseña”.");
    try {
      await requestPasswordRecovery(email);
      toast("Te enviamos un email para restablecer la contraseña.");
    } catch (err) {
      document.getElementById("err")!.textContent = authMessage(err);
    }
  };
}

function showSetPassword(title: string, onSubmit: (pw: string) => Promise<void>) {
  app.innerHTML = `
    <form class="panel auth" id="pwForm">
      <h1>${esc(title)}</h1>
      <label>Nueva contraseña<input type="password" name="pw" minlength="8" required autocomplete="new-password" /></label>
      <p class="form-error" id="err"></p>
      <button class="btn btn-primary btn-block">Guardar</button>
    </form>`;
  const form = document.getElementById("pwForm") as HTMLFormElement;
  form.onsubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(String(new FormData(form).get("pw")));
      history.replaceState(null, "", location.pathname);
      await boot();
    } catch (err) {
      document.getElementById("err")!.textContent = authMessage(err);
    }
  };
}

function renderUserBox(user: User) {
  userBox.innerHTML = `<span class="muted hide-sm">${esc(user.email)}</span><a class="btn btn-sm btn-ghost" href="/" target="_blank">Ver tienda</a><button class="btn btn-sm btn-ghost" id="logout">Salir</button>`;
  document.getElementById("logout")!.onclick = async () => {
    await logout();
    showLogin();
  };
}

/* ---------- Dashboard ---------- */

async function loadProducts() {
  products = await api<Product[]>("/api/products");
  renderList();
}

function renderList() {
  app.innerHTML = `
    <div class="admin-head">
      <div><h1>Tus prendas</h1><p class="muted">${products.length} ${products.length === 1 ? "producto" : "productos"} publicados</p></div>
      <button class="btn btn-primary" id="newBtn">+ Nueva prenda</button>
    </div>
    ${products.length ? `<div class="admin-list">${products.map(row).join("")}</div>`
      : `<div class="panel empty"><p>Todavía no cargaste ninguna prenda.</p><p class="muted">Tocá “Nueva prenda” para publicar la primera.</p></div>`}`;
  document.getElementById("newBtn")!.onclick = () => renderForm();
  app.querySelectorAll<HTMLElement>("[data-edit]").forEach((b) => (b.onclick = () => renderForm(products.find((p) => p.id === Number(b.dataset.edit)))));
  app.querySelectorAll<HTMLElement>("[data-del]").forEach((b) => (b.onclick = () => remove(Number(b.dataset.del))));
}

function row(p: Product) {
  return `<div class="admin-row">
    <div class="admin-thumb">${p.images[0] ? `<img src="${imgUrl(p.images[0])}" alt="" />` : `<img src="/logo.jpg" alt="" class="dim" />`}</div>
    <div class="admin-info">
      <strong>${esc(p.name)}</strong>
      <span class="muted">${esc(p.category)} · ${priceHtml(p)}${p.sizes.length ? ` · ${p.sizes.map(esc).join(", ")}` : ""}${p.colors.length ? ` · ${p.colors.map(esc).join(", ")}` : ""}</span>
      <span class="tags">${p.available ? '<span class="tag ok">Visible con stock</span>' : '<span class="tag">Sin stock</span>'}${p.featured ? '<span class="tag gold">Destacado</span>' : ""}</span>
    </div>
    <div class="admin-actions">
      <button class="btn btn-sm btn-ghost" data-edit="${p.id}">Editar</button>
      <button class="btn btn-sm btn-danger" data-del="${p.id}">Borrar</button>
    </div>
  </div>`;
}

async function remove(id: number) {
  const p = products.find((x) => x.id === id);
  if (!p || !confirm(`¿Borrar “${p.name}”? Esta acción no se puede deshacer.`)) return;
  try {
    await api(`/api/products/${id}`, { method: "DELETE" });
    toast("Prenda borrada.");
    await loadProducts();
  } catch (e) {
    toast((e as Error).message, true);
  }
}

async function resizeImage(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const max = 1600;
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("No se pudo procesar la imagen"))), "image/jpeg", 0.85));
}

function renderForm(p?: Product) {
  const images = [...(p?.images ?? [])];
  const sizes = new Set(p?.sizes ?? []);
  const colors = new Set(p?.colors ?? []);
  const categories = [...new Set(["Camisas", "Pantalones", "Bombachas de campo", "Camperas", "Chalecos", "Buzos", "Remeras", "Chombas", "Calzado", "Gorras", "Accesorios", ...products.map((x) => x.category)])];
  let uploading = 0;

  app.innerHTML = `
    <div class="admin-head">
      <div><button class="link" id="back">← Volver</button><h1>${p ? "Editar prenda" : "Nueva prenda"}</h1></div>
    </div>
    <form class="panel product-form" id="pForm">
      <div class="form-grid">
        <div class="col">
          <label>Nombre *<input name="name" required maxlength="200" value="${esc(p?.name)}" placeholder="Ej: Camisa grafa manga larga" /></label>
          <div class="two">
            <label>Categoría<input name="category" list="cats" maxlength="80" value="${esc(p?.category ?? "")}" placeholder="Ej: Camisas" /></label>
            <label>Precio (ARS)<input name="price" type="number" min="0" step="1" inputmode="numeric" value="${p?.price || ""}" placeholder="Vacío = Consultar" /></label>
          </div>
          <label>Precio anterior (tachado)<input name="comparePrice" type="number" min="0" step="1" inputmode="numeric" value="${p?.comparePrice || ""}" placeholder="Opcional, para mostrar oferta" /></label>
          <datalist id="cats">${categories.map((c) => `<option value="${esc(c)}">`).join("")}</datalist>
          <label>Descripción<textarea name="description" rows="5" maxlength="2000" placeholder="Material, colores disponibles, características…">${esc(p?.description)}</textarea></label>
          <div>
            <p class="label">Talles</p>
            <div class="sizes" id="sizes"></div>
            <div class="add-size"><input id="customSize" placeholder="Otro talle (ej: 52)" maxlength="12" /><button type="button" class="btn btn-sm btn-ghost" id="addSize">Agregar</button></div>
          </div>
          <div>
            <p class="label">Colores</p>
            <div class="admin-colors" id="colors"></div>
            <div class="add-size"><input id="customColor" placeholder="Otro color (ej: Bordó)" maxlength="30" /><button type="button" class="btn btn-sm btn-ghost" id="addColor">Agregar</button></div>
          </div>
          <div class="toggles">
            <label class="check"><input type="checkbox" name="available" ${p?.available === false ? "" : "checked"} /> Hay stock</label>
            <label class="check"><input type="checkbox" name="featured" ${p?.featured ? "checked" : ""} /> Destacar en el catálogo</label>
          </div>
        </div>
        <div class="col">
          <p class="label">Fotos <span class="muted">(la primera es la principal)</span></p>
          <p class="muted hint">Si subís una foto por color, en el mismo orden que los colores, la foto cambia sola cuando el cliente elige el color.</p>
          <div class="img-grid" id="imgs"></div>
          <label class="upload">
            <input type="file" accept="image/*" multiple id="files" hidden />
            <span>+ Subir fotos</span>
          </label>
        </div>
      </div>
      <p class="form-error" id="err"></p>
      <div class="form-actions">
        <button type="button" class="btn btn-ghost" id="cancel">Cancelar</button>
        <button class="btn btn-primary" id="save">${p ? "Guardar cambios" : "Publicar prenda"}</button>
      </div>
    </form>`;

  const form = document.getElementById("pForm") as HTMLFormElement;
  const sizesEl = document.getElementById("sizes")!;
  const imgsEl = document.getElementById("imgs")!;

  const drawSizes = () => {
    const all = [...new Set([...SIZE_PRESETS, ...sizes])];
    sizesEl.innerHTML = all.map((s) => `<button type="button" class="size${sizes.has(s) ? " active" : ""}" data-size="${esc(s)}">${esc(s)}</button>`).join("");
  };
  const drawImgs = () => {
    imgsEl.innerHTML =
      images.map((k, i) => `<div class="img-item${i === 0 ? " main" : ""}">
        <img src="${imgUrl(k)}" alt="" />
        <div class="img-tools">
          ${i > 0 ? `<button type="button" data-main="${i}" title="Usar como principal">★</button>` : "<span>Principal</span>"}
          <button type="button" data-rm="${i}" title="Quitar">×</button>
        </div></div>`).join("") +
      Array.from({ length: uploading }, () => `<div class="img-item loading"><span>Subiendo…</span></div>`).join("");
  };
  const colorsEl = document.getElementById("colors")!;
  const drawColors = () => {
    const all = [...new Set([...COLOR_PRESETS, ...colors])];
    colorsEl.innerHTML = all.map((c) => `<button type="button" class="size${colors.has(c) ? " active" : ""}" data-color="${esc(c)}"><i style="--c:${swatch(c)}"></i>${esc(c)}</button>`).join("");
  };
  drawSizes();
  drawColors();
  drawImgs();
  colorsEl.onclick = (e) => {
    const c = (e.target as HTMLElement).closest<HTMLElement>("[data-color]")?.dataset.color;
    if (!c) return;
    colors.has(c) ? colors.delete(c) : colors.add(c);
    drawColors();
  };
  const addColor = () => {
    const input = document.getElementById("customColor") as HTMLInputElement;
    const v = input.value.trim();
    if (v) { colors.add(v); input.value = ""; drawColors(); }
  };
  document.getElementById("addColor")!.onclick = addColor;
  document.getElementById("customColor")!.onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); addColor(); } };

  sizesEl.onclick = (e) => {
    const s = (e.target as HTMLElement).closest<HTMLElement>("[data-size]")?.dataset.size;
    if (!s) return;
    sizes.has(s) ? sizes.delete(s) : sizes.add(s);
    drawSizes();
  };
  const addCustom = () => {
    const input = document.getElementById("customSize") as HTMLInputElement;
    const v = input.value.trim();
    if (v) { sizes.add(v); input.value = ""; drawSizes(); }
  };
  document.getElementById("addSize")!.onclick = addCustom;
  document.getElementById("customSize")!.onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } };

  imgsEl.onclick = (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>("button");
    if (!b) return;
    if (b.dataset.rm) images.splice(Number(b.dataset.rm), 1);
    if (b.dataset.main) images.unshift(...images.splice(Number(b.dataset.main), 1));
    drawImgs();
  };

  (document.getElementById("files") as HTMLInputElement).onchange = async (e) => {
    const input = e.target as HTMLInputElement;
    const files = [...(input.files ?? [])];
    input.value = "";
    uploading += files.length;
    drawImgs();
    await Promise.all(files.map(async (f) => {
      try {
        const blob = await resizeImage(f);
        const { key } = await api<{ key: string }>("/api/upload", { method: "POST", headers: { "Content-Type": "image/jpeg" }, body: blob });
        images.push(key);
      } catch (err) {
        toast(`No se pudo subir ${f.name}: ${(err as Error).message}`, true);
      } finally {
        uploading--;
        drawImgs();
      }
    }));
  };

  document.getElementById("back")!.onclick = document.getElementById("cancel")!.onclick = () => renderList();

  form.onsubmit = async (e) => {
    e.preventDefault();
    if (uploading) return toast("Esperá a que terminen de subirse las fotos.", true);
    const fd = new FormData(form);
    const payload = {
      name: fd.get("name"),
      category: fd.get("category"),
      price: Number(fd.get("price")) || 0,
      description: fd.get("description"),
      comparePrice: Number(fd.get("comparePrice")) || 0,
      sizes: [...sizes],
      colors: [...colors],
      images,
      available: fd.get("available") === "on",
      featured: fd.get("featured") === "on",
    };
    const btn = document.getElementById("save") as HTMLButtonElement;
    btn.disabled = true;
    try {
      await api(p ? `/api/products/${p.id}` : "/api/products", {
        method: p ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      toast(p ? "Cambios guardados." : "¡Prenda publicada!");
      await loadProducts();
    } catch (err) {
      document.getElementById("err")!.textContent = (err as Error).message;
      btn.disabled = false;
    }
  };
}

/* ---------- Boot ---------- */

async function boot() {
  const user = await getUser();
  if (!user) return showLogin();
  renderUserBox(user);
  if (!user.roles?.includes("admin")) {
    app.innerHTML = `<div class="panel auth"><h1>Sin permisos</h1><p class="muted">La cuenta ${esc(user.email)} no tiene el rol de administrador. Asignale el rol “admin” desde la sección Identity del panel de Netlify y volvé a ingresar.</p></div>`;
    return;
  }
  try {
    await loadProducts();
  } catch (e) {
    app.innerHTML = `<div class="panel empty"><p>No se pudieron cargar las prendas.</p><p class="muted">${esc((e as Error).message)}</p></div>`;
  }
}

(async () => {
  try {
    const result = await handleAuthCallback();
    if (result?.type === "invite" && result.token) {
      const token = result.token;
      return showSetPassword("Creá tu contraseña", async (pw) => { await acceptInvite(token, pw); });
    }
    if (result?.type === "recovery") {
      return showSetPassword("Nueva contraseña", async (pw) => { await updateUser({ password: pw }); });
    }
  } catch (e) {
    return showLogin(authMessage(e));
  }
  await boot();
})();

export const WHATSAPP = "543537301558";
export const INSTAGRAM = "matrero.jp";

export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  comparePrice: number;
  sizes: string[];
  colors: string[];
  images: string[];
  available: boolean;
  featured: boolean;
  createdAt: string;
}

export const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const fmt = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
export const price = (n: number) => (n > 0 ? fmt.format(n) : "Consultar precio");

export const onSale = (p: { price: number; comparePrice?: number }) => p.price > 0 && (p.comparePrice ?? 0) > p.price;
export const discount = (p: { price: number; comparePrice?: number }) => (onSale(p) ? Math.round((1 - p.price / p.comparePrice!) * 100) : 0);
export const priceHtml = (p: { price: number; comparePrice?: number }) =>
  onSale(p) ? `<s class="price-old">${fmt.format(p.comparePrice!)}</s> <span class="price-new">${fmt.format(p.price)}</span>` : price(p.price);

const SWATCHES: Record<string, string> = {
  negro: "#111", blanco: "#f4f1ea", verde: "#3f5a36", "verde oliva": "#5b5b2e", "azul marino": "#1d2a44", azul: "#2c4f8a",
  gris: "#8a8a86", "gris melange": "#9a9893", beige: "#cdb994", marron: "#5a3d26", "marrón": "#5a3d26", rojo: "#8e2a22", bordo: "#5c1c22", caqui: "#a8986a",
};
export const swatch = (c: string) => SWATCHES[c.trim().toLowerCase()] ?? "#6b6257";

export const isStaticImg = (key: string) => /^\/productos\/[\w-]+\.(jpe?g|png|webp)$/.test(key);
export const imgUrl = (key: string) => (isStaticImg(key) ? key : `/img/${encodeURIComponent(key)}`);
/** When there is one photo per color (same order), returns the photo index for a color. */
export const colorImageIndex = (p: { colors: string[]; images: string[] }, color: string) => {
  const i = p.colors.indexOf(color);
  return i >= 0 && p.images.length >= p.colors.length ? i : -1;
};

export const waLink = (text: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
export const igLink = `https://instagram.com/${INSTAGRAM}`;
export const igDm = `https://ig.me/m/${INSTAGRAM}`;

export const ICON_WA = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8zm8.4-18.2A11.8 11.8 0 0 0 1.8 17.9L.1 24l6.3-1.6A11.8 11.8 0 0 0 24 12c0-3.2-1.2-6.1-3.6-8.4z"/></svg>`;
export const ICON_IG = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.2c3.2 0 3.6 0 4.8.1 3.2.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.2 4.4 2.6 6.8 7 7 1.2.1 1.6.1 4.9.1s3.7 0 4.9-.1c4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.2-4.4-2.6-6.8-7-7C15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.9 1.4 1.4 0 0 0 0-2.9z"/></svg>`;

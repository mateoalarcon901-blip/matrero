import { getUser } from "@netlify/identity";

export async function requireAdmin(): Promise<Response | null> {
  const user = await getUser();
  if (!user) return Response.json({ error: "No autorizado" }, { status: 401 });
  if (!user.roles?.includes("admin")) {
    return Response.json({ error: "Tu cuenta no tiene permisos de administrador" }, { status: 403 });
  }
  return null;
}

type Input = Record<string, unknown>;

export function parseProduct(body: Input) {
  const str = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const arr = (v: unknown) =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "").map((x) => x.trim()).slice(0, 30) : [];
  const name = str(body.name, 200);
  if (!name) throw new Error("El nombre es obligatorio");
  const price = Math.max(0, Math.round(Number(body.price) || 0));
  const compare = Math.max(0, Math.round(Number(body.comparePrice) || 0));
  return {
    name,
    description: str(body.description),
    category: str(body.category, 80) || "General",
    price,
    comparePrice: compare > price && price > 0 ? compare : 0,
    sizes: arr(body.sizes),
    colors: arr(body.colors),
    images: arr(body.images).filter((k) => /^[\w-]+$/.test(k) || /^\/productos\/[\w-]+\.(jpe?g|png|webp)$/.test(k)),
    available: body.available !== false,
    featured: body.featured === true,
  };
}

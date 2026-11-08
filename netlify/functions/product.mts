import type { Config, Context } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { getStore } from "@netlify/blobs";
import { db } from "../../db/index.js";
import { products } from "../../db/schema.js";
import { parseProduct, requireAdmin } from "../lib/auth.js";

export default async (req: Request, context: Context) => {
  const id = Number(context.params.id);
  if (!Number.isInteger(id)) return Response.json({ error: "ID inválido" }, { status: 400 });

  const denied = await requireAdmin();
  if (denied) return denied;

  const [existing] = await db.select().from(products).where(eq(products.id, id));
  if (!existing) return Response.json({ error: "Producto no encontrado" }, { status: 404 });
  const store = getStore("product-images");

  if (req.method === "PUT") {
    try {
      const data = parseProduct(await req.json());
      const [row] = await db.update(products).set(data).where(eq(products.id, id)).returning();
      const removed = existing.images.filter((k) => !data.images.includes(k));
      await Promise.all(removed.filter((k) => !k.startsWith("/")).map((k) => store.delete(k)));
      return Response.json(row);
    } catch (e) {
      return Response.json({ error: (e as Error).message }, { status: 400 });
    }
  }

  if (req.method === "DELETE") {
    await db.delete(products).where(eq(products.id, id));
    await Promise.all(existing.images.filter((k) => !k.startsWith("/")).map((k) => store.delete(k)));
    return new Response(null, { status: 204 });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = { path: "/api/products/:id", method: ["PUT", "DELETE"] };

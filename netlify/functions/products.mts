import type { Config } from "@netlify/functions";
import { desc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { products } from "../../db/schema.js";
import { parseProduct, requireAdmin } from "../lib/auth.js";

export default async (req: Request) => {
  if (req.method === "GET") {
    const rows = await db.select().from(products).orderBy(desc(products.featured), desc(products.createdAt));
    return Response.json(rows, { headers: { "Cache-Control": "no-store" } });
  }

  if (req.method === "POST") {
    const denied = await requireAdmin();
    if (denied) return denied;
    try {
      const data = parseProduct(await req.json());
      const [row] = await db.insert(products).values(data).returning();
      return Response.json(row, { status: 201 });
    } catch (e) {
      return Response.json({ error: (e as Error).message }, { status: 400 });
    }
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = { path: "/api/products" };

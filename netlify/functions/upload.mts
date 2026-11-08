import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { requireAdmin } from "../lib/auth.js";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export default async (req: Request) => {
  const denied = await requireAdmin();
  if (denied) return denied;

  const type = req.headers.get("content-type") ?? "";
  if (!ALLOWED.includes(type)) return Response.json({ error: "Formato de imagen no soportado" }, { status: 415 });

  const data = await req.arrayBuffer();
  if (data.byteLength === 0 || data.byteLength > 5 * 1024 * 1024) {
    return Response.json({ error: "La imagen debe pesar menos de 5 MB" }, { status: 413 });
  }

  const key = crypto.randomUUID();
  await getStore("product-images").set(key, data, { metadata: { contentType: type } });
  return Response.json({ key }, { status: 201 });
};

export const config: Config = { path: "/api/upload", method: "POST" };

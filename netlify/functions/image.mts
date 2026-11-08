import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (_req: Request, context: Context) => {
  const key = context.params.key;
  if (!key || !/^[\w-]+$/.test(key)) return new Response("Not found", { status: 404 });

  const result = await getStore("product-images").getWithMetadata(key, { type: "arrayBuffer" });
  if (!result) return new Response("Not found", { status: 404 });

  return new Response(result.data, {
    headers: {
      "Content-Type": String(result.metadata.contentType ?? "image/jpeg"),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};

export const config: Config = { path: "/img/:key", method: "GET" };

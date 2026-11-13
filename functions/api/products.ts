
interface Env {
  DB: D1Database;
}

export async function onRequestGet({ env }: { env: Env }) {
  try {
    const { results } = await env.DB.prepare(
      "SELECT * FROM products ORDER BY created_at DESC"
    ).all();

    return new Response(JSON.stringify({ products: results }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "No se pudieron cargar los productos" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

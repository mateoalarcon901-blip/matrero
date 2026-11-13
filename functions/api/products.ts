export async function onRequestGet() {
  return new Response(
    JSON.stringify({ products: [], message: "Catálogo conectado" }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}

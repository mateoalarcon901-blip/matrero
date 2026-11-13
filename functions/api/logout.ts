export async function onRequestPost() {
  return Response.json(
    { success: true },
    {
      headers: {
        "Set-Cookie":
          "matrero_admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0",
        "Cache-Control": "no-store",
      },
    }
  );
}

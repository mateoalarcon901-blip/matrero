interface Env {
  ADMIN_PASSWORD: string;
}

async function sign(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value)
  );

  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export async function onRequestPost({
  request,
  env,
}: {
  request: Request;
  env: Env;
}) {
  if (!env.ADMIN_PASSWORD) {
    return new Response("Falta configurar la contraseña", { status: 500 });
  }

  try {
    const body = await request.json() as { password?: string };

    if (body.password !== env.ADMIN_PASSWORD) {
      return Response.json(
        { error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    const expires = Date.now() + 8 * 60 * 60 * 1000;
    const value = String(expires);
    const signature = await sign(value, env.ADMIN_PASSWORD);

    return Response.json(
      { success: true },
      {
        headers: {
          "Set-Cookie": `matrero_admin=${value}.${signature}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`,
          "Cache-Control": "no-store",
        },
      }
    );
  } catch {
    return new Response("Solicitud inválida", { status: 400 });
  }
}

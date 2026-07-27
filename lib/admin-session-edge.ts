const COOKIE_NAME = "odonexo_admin";

function getSecret(): string {
  return process.env.ADMIN_SECRET || "odonexo-admin-secret-change-me";
}

export { COOKIE_NAME };

export async function getSessionToken(): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode("admin-session")
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

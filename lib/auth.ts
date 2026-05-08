import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE = "bt_admin";

function secret() {
  return process.env.ADMIN_SESSION_SECRET || "biztreck-default-insecure-secret";
}

export function makeToken() {
  const payload = `admin.${Date.now()}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyToken(token: string | undefined | null) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [role, ts, sig] = parts;
  if (role !== "admin") return false;
  const expected = createHmac("sha256", secret())
    .update(`${role}.${ts}`)
    .digest("hex");
  try {
    return timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export async function isAdmin() {
  const c = await cookies();
  return verifyToken(c.get(COOKIE)?.value);
}

export const ADMIN_COOKIE = COOKIE;

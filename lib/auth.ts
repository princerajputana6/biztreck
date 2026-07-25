import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "crypto";
import { getDb } from "@/lib/mongodb";
import {
  ALL_PERMISSIONS,
  can as canPerm,
  firstAllowedPath,
  type Permission,
  type Role,
  type Session,
} from "@/lib/rbac";

const COOKIE = "bt_admin";
// Subject used for the bootstrap/env-password login (no DB user record).
const ENV_ADMIN = "env-admin";

function secret() {
  return process.env.ADMIN_SESSION_SECRET || "biztreck-default-insecure-secret";
}
function sign(data: string) {
  return createHmac("sha256", secret()).update(data).digest("hex");
}
function safeEq(aHex: string, bHex: string) {
  try {
    return timingSafeEqual(Buffer.from(aHex, "hex"), Buffer.from(bHex, "hex"));
  } catch {
    return false;
  }
}

/** Signed session token carrying the subject (user email or the env admin). */
export function makeToken(sub: string) {
  const subB64 = Buffer.from(sub).toString("base64url");
  const body = `${subB64}.${Date.now()}`;
  return `v2.${body}.${sign(body)}`;
}

/** Verify a token's signature and return its subject, or null. */
export function verifyToken(token: string | undefined | null): { sub: string } | null {
  if (!token) return null;
  const parts = token.split(".");
  // Legacy tokens (admin.<ts>.<sig>) predate RBAC — honour them as the env owner.
  if (parts.length === 3 && parts[0] === "admin") {
    return safeEq(parts[2], sign(`admin.${parts[1]}`)) ? { sub: ENV_ADMIN } : null;
  }
  // v2.<subB64>.<ts>.<sig>
  if (parts.length === 4 && parts[0] === "v2") {
    const body = `${parts[1]}.${parts[2]}`;
    if (!safeEq(parts[3], sign(body))) return null;
    try {
      return { sub: Buffer.from(parts[1], "base64url").toString("utf8") };
    } catch {
      return null;
    }
  }
  return null;
}

function ownerSession(sub: string, email: string, name: string): Session {
  return { sub, email, name, role: "owner", permissions: ALL_PERMISSIONS };
}

/**
 * Resolve the current session from the cookie. Loads the user record each call
 * so permission edits and deactivations take effect immediately (no re-login).
 * Returns null when unauthenticated, deactivated, or deleted.
 *
 * Wrapped in React `cache()` so a single request that resolves the session more
 * than once (e.g. the admin layout mounting Shadow AND the page's requireView)
 * only makes one Mongo lookup instead of two.
 */
export const getSession = cache(async (): Promise<Session | null> => {
  const c = await cookies();
  const v = verifyToken(c.get(COOKIE)?.value);
  if (!v) return null;

  if (v.sub === ENV_ADMIN) {
    return ownerSession(ENV_ADMIN, process.env.ADMIN_EMAIL || "owner", "Owner");
  }

  try {
    const db = await getDb();
    const user = await db.collection("admin_users").findOne({ email: v.sub });
    if (!user || user.active === false) return null;
    // Backward-compat: an admin_users row created before RBAC (no role/permissions)
    // is treated as a full-access owner.
    const hasRbac = Boolean(user.role) || Array.isArray(user.permissions);
    if (!hasRbac) return ownerSession(v.sub, user.email, user.name || user.email);
    const role: Role = user.role === "owner" ? "owner" : "member";
    return {
      sub: v.sub,
      email: user.email,
      name: user.name || user.email,
      role,
      permissions:
        role === "owner"
          ? ALL_PERMISSIONS
          : Array.isArray(user.permissions)
            ? (user.permissions as Permission[])
            : [],
    };
  } catch {
    return null;
  }
});

/** True when any valid session exists (kept for existing call sites). */
export async function isAdmin() {
  return Boolean(await getSession());
}

export function can(session: Session | null, perm: Permission) {
  return canPerm(session, perm);
}

/**
 * Server pages: require a session with permission for `view`. Redirects to login
 * when unauthenticated, or to the user's first permitted module otherwise.
 */
export async function requireView(view: Permission): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session, view)) redirect(firstAllowedPath(session));
  return session;
}

/** API routes: return the session when permitted, else null (caller responds). */
export async function guardPermission(perm: Permission): Promise<Session | null> {
  const session = await getSession();
  if (!session || !can(session, perm)) return null;
  return session;
}

export const ADMIN_COOKIE = COOKIE;
export const ENV_ADMIN_SUB = ENV_ADMIN;

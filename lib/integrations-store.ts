// Persistence for connected integrations. Tokens are encrypted at rest and
// never returned to the client. Google access tokens auto-refresh on read.

import { getDb } from "@/lib/mongodb";
import { decryptSecret, encryptSecret } from "@/lib/crypto";
import { refreshGoogleToken } from "@/lib/google";

async function col() {
  const db = await getDb();
  return db.collection("integrations");
}

export async function saveGoogleTokens(t: {
  email: string;
  refreshToken?: string;
  accessToken: string;
  expiresIn: number;
}) {
  const c = await col();
  const set: Record<string, unknown> = {
    provider: "google",
    connected: true,
    email: t.email,
    accessTokenEnc: encryptSecret(t.accessToken),
    accessExpiry: Date.now() + (t.expiresIn - 60) * 1000,
    updatedAt: new Date().toISOString(),
  };
  // Google only returns a refresh_token on first consent — keep the old one otherwise.
  if (t.refreshToken) set.refreshTokenEnc = encryptSecret(t.refreshToken);
  await c.updateOne({ provider: "google" }, { $set: set }, { upsert: true });
}

/** A valid Google access token (refreshing if expired), or null if not connected. */
export async function getGoogleAccessToken(): Promise<{ accessToken: string; email: string } | null> {
  const c = await col();
  const doc = await c.findOne({ provider: "google", connected: true });
  if (!doc?.accessTokenEnc) return null;

  let accessToken = decryptSecret(doc.accessTokenEnc as string);
  if (Date.now() >= Number(doc.accessExpiry || 0)) {
    if (!doc.refreshTokenEnc) return null;
    const refreshed = await refreshGoogleToken(decryptSecret(doc.refreshTokenEnc as string));
    accessToken = refreshed.access_token;
    await c.updateOne(
      { provider: "google" },
      {
        $set: {
          accessTokenEnc: encryptSecret(accessToken),
          accessExpiry: Date.now() + (refreshed.expires_in - 60) * 1000,
          updatedAt: new Date().toISOString(),
        },
      }
    );
  }
  return { accessToken, email: String(doc.email || "") };
}

export async function disconnectProvider(provider: string) {
  const c = await col();
  await c.updateOne(
    { provider },
    {
      $set: { connected: false, updatedAt: new Date().toISOString() },
      $unset: { config: "", accessTokenEnc: "", refreshTokenEnc: "", accessExpiry: "", email: "" },
    }
  );
}

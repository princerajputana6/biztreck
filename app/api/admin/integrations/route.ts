import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { guardPermission } from "@/lib/auth";
import { PROVIDER_MAP } from "@/lib/integrations";
import { disconnectProvider } from "@/lib/integrations-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function col() {
  const db = await getDb();
  const c = db.collection("integrations");
  c.createIndex({ provider: 1 }, { unique: true }).catch(() => {});
  return c;
}

// GET — connection status only; credentials are never returned to the client.
export async function GET() {
  if (!(await guardPermission("integrations"))) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const docs = await (await col()).find({}).toArray();
  const status: Record<
    string,
    { connected: boolean; updatedAt: string | null; fields: string[]; email: string | null }
  > = {};
  for (const d of docs) {
    status[d.provider] = {
      connected: Boolean(d.connected),
      updatedAt: d.updatedAt || null,
      // Which fields have a stored value (names only, no values).
      fields: d.config ? Object.keys(d.config).filter((k) => d.config[k]) : [],
      email: d.email || null,
    };
  }
  return NextResponse.json({ ok: true, status });
}

export async function POST(req: Request) {
  const session = await guardPermission("integrations");
  if (!session) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const action = String(body?.action || "");
  const provider = String(body?.provider || "");
  const spec = PROVIDER_MAP[provider];
  if (!spec) {
    return NextResponse.json({ ok: false, error: "Unknown provider" }, { status: 400 });
  }
  const c = await col();

  if (action === "connect") {
    // Only persist known fields for this provider; ignore anything else.
    const incoming = body?.config || {};
    const config: Record<string, string> = {};
    for (const f of spec.fields) {
      const v = incoming[f.key];
      if (typeof v === "string" && v.trim()) config[f.key] = v.trim();
    }
    if (!Object.keys(config).length) {
      return NextResponse.json({ ok: false, error: "Enter at least one credential." }, { status: 400 });
    }
    await c.updateOne(
      { provider },
      {
        $set: {
          provider,
          config,
          connected: true,
          updatedAt: new Date().toISOString(),
          updatedBy: session.email,
        },
      },
      { upsert: true }
    );
    return NextResponse.json({ ok: true });
  }

  if (action === "disconnect") {
    // Clears both credential-style config and OAuth token fields (e.g. Google).
    await disconnectProvider(provider);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
}

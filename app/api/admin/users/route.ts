import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongodb";
import { guardPermission } from "@/lib/auth";
import { ALL_PERMISSIONS, isValidPermission, type Permission } from "@/lib/rbac";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanPermissions(input: unknown): Permission[] {
  if (!Array.isArray(input)) return [];
  return Array.from(new Set(input.filter(isValidPermission))) as Permission[];
}

async function usersCollection() {
  const db = await getDb();
  const col = db.collection("admin_users");
  // Best-effort unique index; ignore if it already exists or clashes.
  col.createIndex({ email: 1 }, { unique: true }).catch(() => {});
  return col;
}

function publicUser(u: any) {
  return {
    email: u.email,
    name: u.name || "",
    role: u.role === "owner" ? "owner" : u.role || (u.permissions ? "member" : "owner"),
    permissions: Array.isArray(u.permissions) ? u.permissions : [],
    active: u.active !== false,
    createdAt: u.createdAt || null,
  };
}

export async function GET() {
  const session = await guardPermission("users");
  if (!session) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const col = await usersCollection();
  const users = await col.find({}, { projection: { passwordHash: 0 } }).sort({ createdAt: -1 }).toArray();
  return NextResponse.json({ ok: true, users: users.map(publicUser), me: session.email });
}

export async function POST(req: Request) {
  const session = await guardPermission("users");
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
  const col = await usersCollection();
  const email = String(body?.email || "").trim().toLowerCase();
  const isOwner = session.role === "owner";

  try {
    if (action === "create-user") {
      const name = String(body?.name || "").trim();
      const password = String(body?.password || "");
      const role = body?.role === "owner" ? "owner" : "member";
      const permissions = role === "owner" ? ALL_PERMISSIONS : cleanPermissions(body?.permissions);

      if (!EMAIL_RE.test(email)) {
        return NextResponse.json({ ok: false, error: "Enter a valid email." }, { status: 400 });
      }
      if (!name) {
        return NextResponse.json({ ok: false, error: "Name is required." }, { status: 400 });
      }
      if (password.length < 8) {
        return NextResponse.json({ ok: false, error: "Password must be at least 8 characters." }, { status: 400 });
      }
      // Only an owner can mint another owner or grant the Users module.
      if ((role === "owner" || permissions.includes("users")) && !isOwner) {
        return NextResponse.json(
          { ok: false, error: "Only an owner can grant owner role or the Users module." },
          { status: 403 }
        );
      }
      if (await col.findOne({ email })) {
        return NextResponse.json({ ok: false, error: "A user with that email already exists." }, { status: 409 });
      }
      const now = new Date().toISOString();
      await col.insertOne({
        email,
        name,
        passwordHash: await bcrypt.hash(password, 10),
        role,
        permissions,
        active: true,
        createdAt: now,
        updatedAt: now,
        createdBy: session.email,
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "update-user") {
      const target = await col.findOne({ email });
      if (!target) {
        return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });
      }
      const set: Record<string, unknown> = { updatedAt: new Date().toISOString() };

      if (typeof body.name === "string" && body.name.trim()) set.name = body.name.trim();

      if (body.role !== undefined || body.permissions !== undefined) {
        const role = body.role === "owner" ? "owner" : "member";
        const permissions = role === "owner" ? ALL_PERMISSIONS : cleanPermissions(body.permissions);
        if ((role === "owner" || permissions.includes("users")) && !isOwner) {
          return NextResponse.json(
            { ok: false, error: "Only an owner can grant owner role or the Users module." },
            { status: 403 }
          );
        }
        // Don't let a manager strip an existing owner's powers unless they're an owner.
        if (target.role === "owner" && !isOwner) {
          return NextResponse.json({ ok: false, error: "Only an owner can edit an owner." }, { status: 403 });
        }
        set.role = role;
        set.permissions = permissions;
      }

      if (typeof body.active === "boolean") {
        if (email === session.email && body.active === false) {
          return NextResponse.json({ ok: false, error: "You can't deactivate your own account." }, { status: 400 });
        }
        set.active = body.active;
      }

      await col.updateOne({ email }, { $set: set });
      return NextResponse.json({ ok: true });
    }

    if (action === "reset-password") {
      const password = String(body?.password || "");
      if (password.length < 8) {
        return NextResponse.json({ ok: false, error: "Password must be at least 8 characters." }, { status: 400 });
      }
      const res = await col.updateOne(
        { email },
        { $set: { passwordHash: await bcrypt.hash(password, 10), updatedAt: new Date().toISOString() } }
      );
      if (!res.matchedCount) {
        return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });
      }
      return NextResponse.json({ ok: true });
    }

    if (action === "delete-user") {
      if (email === session.email) {
        return NextResponse.json({ ok: false, error: "You can't delete your own account." }, { status: 400 });
      }
      const target = await col.findOne({ email });
      if (target?.role === "owner" && !isOwner) {
        return NextResponse.json({ ok: false, error: "Only an owner can delete an owner." }, { status: 403 });
      }
      await col.deleteOne({ email });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    console.error("[admin:users]", e);
    return NextResponse.json({ ok: false, error: e?.message || "Operation failed" }, { status: 500 });
  }
}

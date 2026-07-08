import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ADMIN_COOKIE, makeToken } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    const inputPassword = typeof password === "string" ? password : "";

    let valid = false;
    if (normalizedEmail && inputPassword) {
      const db = await getDb();
      const admin = await db.collection("admin_users").findOne({
        email: normalizedEmail,
        active: { $ne: false },
      });
      if (admin?.passwordHash) {
        valid = await bcrypt.compare(inputPassword, admin.passwordHash);
      }
    }

    if (!valid && inputPassword && inputPassword === process.env.ADMIN_PASSWORD) {
      valid = true;
    }

    if (!valid) {
      return NextResponse.json(
        { ok: false, error: "Invalid password" },
        { status: 401 }
      );
    }
    const token = makeToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}

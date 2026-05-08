import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { sendAdminEmail, emailShell, escapeHtml } from "@/lib/resend";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message, company, phone, service, budget } = body ?? {};

    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const doc = {
      name,
      email,
      company: company || "",
      phone: phone || "",
      service: service || "",
      budget: budget || "",
      message,
      ip: req.headers.get("x-forwarded-for") || "",
      userAgent: req.headers.get("user-agent") || "",
      createdAt: new Date(),
    };

    try {
      const db = await getDb();
      await db.collection("contacts").insertOne(doc);
    } catch (e) {
      console.error("[contact] mongo insert failed:", e);
    }

    const body_html = `
      <p style="margin:0 0 12px;color:#fff;font-size:16px;font-weight:600;">New project inquiry</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;color:#cbd5e1;">
        <tr><td style="padding:6px 0;color:#7fa2ff;">Name</td><td style="padding:6px 0;color:#fff;">${escapeHtml(name)}</td></tr>
        <tr><td style="padding:6px 0;color:#7fa2ff;">Email</td><td style="padding:6px 0;color:#fff;">${escapeHtml(email)}</td></tr>
        <tr><td style="padding:6px 0;color:#7fa2ff;">Company</td><td style="padding:6px 0;color:#fff;">${escapeHtml(company || "—")}</td></tr>
        <tr><td style="padding:6px 0;color:#7fa2ff;">Phone</td><td style="padding:6px 0;color:#fff;">${escapeHtml(phone || "—")}</td></tr>
        <tr><td style="padding:6px 0;color:#7fa2ff;">Service</td><td style="padding:6px 0;color:#fff;">${escapeHtml(service || "—")}</td></tr>
        <tr><td style="padding:6px 0;color:#7fa2ff;">Budget</td><td style="padding:6px 0;color:#fff;">${escapeHtml(budget || "—")}</td></tr>
      </table>
      <hr style="border:none;border-top:1px solid rgba(127,162,255,.18);margin:16px 0;"/>
      <div style="white-space:pre-wrap;color:#e2e8f0;">${escapeHtml(message)}</div>
    `;

    sendAdminEmail({
      subject: `🆕 New inquiry from ${name}`,
      html: emailShell("New inquiry", body_html),
      replyTo: email,
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] error:", err);
    return NextResponse.json(
      { ok: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}

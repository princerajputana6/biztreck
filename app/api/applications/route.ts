import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { sendAdminEmail, emailShell, escapeHtml } from "@/lib/resend";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, jobSlug, jobTitle, resumeUrl, portfolio, coverLetter, experience } =
      body ?? {};
    if (!name || !email || !jobSlug || !coverLetter) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }

    const doc = {
      name,
      email,
      phone: phone || "",
      jobSlug,
      jobTitle: jobTitle || "",
      resumeUrl: resumeUrl || "",
      portfolio: portfolio || "",
      experience: experience || "",
      coverLetter,
      status: "new",
      createdAt: new Date(),
    };

    try {
      const db = await getDb();
      await db.collection("applications").insertOne(doc);
    } catch (e) {
      console.error("[applications] mongo insert failed:", e);
    }

    const html = `
      <p style="margin:0 0 12px;color:#fff;font-size:16px;font-weight:600;">New job application</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;color:#cbd5e1;">
        <tr><td style="padding:6px 0;color:#7fa2ff;">Position</td><td style="padding:6px 0;color:#fff;">${escapeHtml(jobTitle || jobSlug)}</td></tr>
        <tr><td style="padding:6px 0;color:#7fa2ff;">Name</td><td style="padding:6px 0;color:#fff;">${escapeHtml(name)}</td></tr>
        <tr><td style="padding:6px 0;color:#7fa2ff;">Email</td><td style="padding:6px 0;color:#fff;">${escapeHtml(email)}</td></tr>
        <tr><td style="padding:6px 0;color:#7fa2ff;">Phone</td><td style="padding:6px 0;color:#fff;">${escapeHtml(phone || "—")}</td></tr>
        <tr><td style="padding:6px 0;color:#7fa2ff;">Experience</td><td style="padding:6px 0;color:#fff;">${escapeHtml(experience || "—")}</td></tr>
        <tr><td style="padding:6px 0;color:#7fa2ff;">Resume</td><td style="padding:6px 0;color:#fff;">${resumeUrl ? `<a href="${escapeHtml(resumeUrl)}" style="color:#7fa2ff;">${escapeHtml(resumeUrl)}</a>` : "—"}</td></tr>
        <tr><td style="padding:6px 0;color:#7fa2ff;">Portfolio</td><td style="padding:6px 0;color:#fff;">${portfolio ? `<a href="${escapeHtml(portfolio)}" style="color:#7fa2ff;">${escapeHtml(portfolio)}</a>` : "—"}</td></tr>
      </table>
      <hr style="border:none;border-top:1px solid rgba(127,162,255,.18);margin:16px 0;"/>
      <div style="color:#7fa2ff;font-size:11px;text-transform:uppercase;letter-spacing:.18em;margin-bottom:6px;">Cover letter</div>
      <div style="white-space:pre-wrap;color:#e2e8f0;">${escapeHtml(coverLetter)}</div>
    `;

    sendAdminEmail({
      subject: `📝 New application: ${jobTitle || jobSlug} — ${name}`,
      html: emailShell("Job application", html),
      replyTo: email,
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}

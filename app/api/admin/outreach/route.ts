import { NextResponse } from "next/server";
import { marked } from "marked";
import { getDb } from "@/lib/mongodb";
import { isAdmin } from "@/lib/auth";
import { generateOutreachEmail } from "@/lib/groq";
import { emailShell, escapeHtml, sendOutreachEmail } from "@/lib/resend";
import { guessEmailFromWebsite } from "@/lib/scraper";

export const runtime = "nodejs";
export const maxDuration = 60;

async function requireAdmin() {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

// Decide the pitch angle from the lead's website, unless the admin overrode it.
function resolveAngle(lead: any, override?: string): "build" | "revamp" {
  if (override === "build" || override === "revamp") return override;
  return lead?.website ? "revamp" : "build";
}

function buildEmailHtml(bodyMarkdown: string, prototypeUrl: string) {
  const bodyHtml = marked.parse(bodyMarkdown, { async: false }) as string;
  const button = prototypeUrl
    ? `<div style="margin:22px 0 4px;">
         <a href="${escapeHtml(prototypeUrl)}" style="display:inline-block;background:linear-gradient(135deg,#2c52c4,#22d3ee);color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px;font-size:14px;">View your prototype →</a>
       </div>`
    : "";
  return emailShell("New business outreach", `${bodyHtml}${button}`);
}

export async function POST(req: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const data = await req.json();
    const action = String(data?.action || "");

    if (action === "generate") {
      const lead = data.lead || {};
      const angle = resolveAngle(lead, data.angle);
      const hasPrototype = Boolean(data.hasPrototype);
      const draft = await generateOutreachEmail(
        {
          title: String(lead.title || "your business"),
          categoryName: String(lead.categoryName || ""),
          city: String(lead.city || ""),
          address: String(lead.address || ""),
          website: String(lead.website || ""),
        },
        { angle, prototype: hasPrototype, senderName: data.senderName }
      );
      return NextResponse.json({
        ok: true,
        angle,
        subject: draft.subject,
        body: draft.body,
        whatsapp: draft.whatsapp,
        suggestedEmail:
          String(lead.email || "").trim() || guessEmailFromWebsite(String(lead.website || "")),
      });
    }

    if (action === "send") {
      const placeId = String(data.placeId || "");
      const to = String(data.to || "").trim();
      const subject = String(data.subject || "").trim();
      const body = String(data.body || "").trim();
      const prototypeUrl = String(data.prototypeUrl || "").trim();
      const angle = data.angle === "build" || data.angle === "revamp" ? data.angle : "build";

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
        return NextResponse.json(
          { ok: false, error: "A valid recipient email is required." },
          { status: 400 }
        );
      }
      if (!subject || !body) {
        return NextResponse.json(
          { ok: false, error: "Subject and body are required." },
          { status: 400 }
        );
      }

      const attachments =
        data.attachment && data.attachment.filename && data.attachment.content
          ? [
              {
                filename: String(data.attachment.filename),
                content: String(data.attachment.content),
              },
            ]
          : undefined;

      const result = await sendOutreachEmail({
        to,
        subject,
        html: buildEmailHtml(body, prototypeUrl),
        attachments,
      });

      const now = new Date();
      const outreach = {
        angle,
        to,
        subject,
        prototypeUrl,
        sentAt: result.ok ? now : null,
        messageId: result.ok ? result.id || "" : "",
        error: result.ok ? "" : result.error || "send failed",
      };

      if (placeId) {
        // Best-effort: never let a DB hiccup mask an email that already sent.
        try {
          const db = await getDb();
          await db.collection("scraped_places").updateOne(
            { placeId },
            {
              $set: {
                email: to,
                outreachStatus: result.ok ? "sent" : "failed",
                outreach,
                updatedAt: now,
              },
            }
          );
        } catch (dbErr) {
          console.error("[admin:outreach] status persist failed", dbErr);
        }
      }

      if (!result.ok) {
        return NextResponse.json(
          { ok: false, error: result.error || "Email failed to send." },
          { status: 502 }
        );
      }
      return NextResponse.json({ ok: true, messageId: result.id || "" });
    }

    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    console.error("[admin:outreach]", e);
    return NextResponse.json(
      { ok: false, error: e?.message || "Outreach operation failed" },
      { status: 500 }
    );
  }
}

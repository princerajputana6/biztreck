import { NextResponse } from "next/server";
import { getLeadByShareToken } from "@/lib/leados/db";
import { buildAuditPdf } from "@/lib/leados/audit-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function slug(name: string): string {
  return (
    String(name || "audit")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "audit"
  );
}

// Public: only resolves for a valid share token whose lead has an audit.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const lead = await getLeadByShareToken(token);
  if (!lead || !lead.audit) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  try {
    const pdf = await buildAuditPdf(lead);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `inline; filename="audit-${slug(lead.businessName)}.pdf"`,
        // Private share link — don't let intermediaries cache it.
        "cache-control": "private, no-store",
      },
    });
  } catch (err: any) {
    console.error("public audit pdf failed", err);
    return NextResponse.json({ ok: false, error: "PDF generation failed" }, { status: 500 });
  }
}

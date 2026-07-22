import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getLeadByKey } from "@/lib/leados/db";
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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ leadKey: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { leadKey } = await params;
  const lead = await getLeadByKey(decodeURIComponent(leadKey));
  if (!lead) {
    return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
  }
  if (!lead.audit) {
    return NextResponse.json({ ok: false, error: "No audit to export" }, { status: 400 });
  }
  try {
    const pdf = await buildAuditPdf(lead);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `inline; filename="audit-${slug(lead.businessName)}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("audit pdf generation failed", err);
    return NextResponse.json(
      { ok: false, error: `PDF generation failed: ${err?.message || "unknown"}` },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { guardPermission } from "@/lib/auth";
import { getDb, ObjectId } from "@/lib/mongodb";
import { buildHrDoc, isHrDocType } from "@/lib/hr-docs";
import { renderHrDoc } from "@/lib/hr-pdf";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  if (!(await guardPermission("team"))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { employeeId } = await params;
  const type = new URL(req.url).searchParams.get("type") || "";
  if (!isHrDocType(type)) {
    return NextResponse.json({ ok: false, error: "Unknown document type" }, { status: 400 });
  }
  if (!ObjectId.isValid(employeeId)) {
    return NextResponse.json({ ok: false, error: "Invalid employee id" }, { status: 400 });
  }
  const db = await getDb();
  const emp = await db.collection("employees").findOne({ _id: new ObjectId(employeeId) });
  if (!emp) {
    return NextResponse.json({ ok: false, error: "Employee not found" }, { status: 404 });
  }

  try {
    const content = buildHrDoc(type, emp as never);
    const pdf = await renderHrDoc(content);
    const safeName = String(emp.name || "employee")
      .toLowerCase()
      .replace(/[^\w.-]+/g, "-")
      .slice(0, 40);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `inline; filename="${safeName}-${content.fileLabel}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("hr-doc pdf generation failed", err);
    return NextResponse.json(
      { ok: false, error: `PDF generation failed: ${err?.message || "unknown error"}` },
      { status: 500 }
    );
  }
}

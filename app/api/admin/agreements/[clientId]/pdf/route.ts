import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import { isAdmin } from "@/lib/auth";
import { getDb, ObjectId } from "@/lib/mongodb";
import { agreementClauses, computeInvoiceTotals } from "@/lib/admin-operations";

export const runtime = "nodejs";

const PURPLE = "#6D28D9";
const PURPLE_DEEP = "#4C1D95";
const PURPLE_SOFT = "#F3EEFF";
const INK = "#1E1B2E";
const MUTED = "#6B6880";
const LINE = "#E6E1F2";

function money(value: number) {
  return `INR ${Number(value || 0).toLocaleString("en-IN")}`;
}

let logoBuffer: Buffer | null | undefined;
function getLogo(): Buffer | null {
  if (logoBuffer !== undefined) return logoBuffer;
  try {
    logoBuffer = fs.readFileSync(path.join(process.cwd(), "public", "logo.png"));
  } catch {
    logoBuffer = null;
  }
  return logoBuffer;
}

function buildAgreementPdf(client: any): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 60, bottom: 70, left: 50, right: 50 },
      bufferPages: true,
    });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(Buffer.from(c)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    const pageW = doc.page.width;
    const pageH = doc.page.height;
    const left = doc.page.margins.left;
    const right = pageW - doc.page.margins.right;
    const contentW = right - left;
    const bottom = pageH - doc.page.margins.bottom;

    const company = {
      name: process.env.COMPANY_NAME || "Biztreck Solutions",
      address:
        process.env.COMPANY_ADDRESS || "Greater Noida, Uttar Pradesh, India",
      gst: process.env.COMPANY_GST || "09HRTPK7815L1ZQ",
      email: process.env.COMPANY_EMAIL || "connect@biztreck.world",
    };
    const party = client.company || client.name || "Client";
    const today = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const drawFooter = () => {
      doc.save();
      doc.rect(0, pageH - 28, pageW, 28).fill(PURPLE);
      doc
        .fillColor("#E9E3FB")
        .font("Helvetica")
        .fontSize(8)
        .text(`${company.name} · Service Agreement · ${company.email}`, left, pageH - 19, {
          width: contentW,
          align: "center",
          lineBreak: false,
        });
      doc.restore();
    };

    // ---- Page 1 header band ----
    const bandH = 120;
    doc.rect(0, 0, pageW, bandH).fill(PURPLE);
    doc.rect(0, bandH, pageW, 5).fill(PURPLE_DEEP);
    const logo = getLogo();
    if (logo) {
      try {
        doc.image(logo, left, 26, { width: 150 });
      } catch {
        doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(22).text(company.name, left, 32);
      }
    } else {
      doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(22).text(company.name, left, 32);
    }
    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .fillColor("#FFFFFF")
      .text("SERVICE AGREEMENT", right - 260, 40, { width: 260, align: "right", lineBreak: false });
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#E9E3FB")
      .text(`Date: ${today}`, right - 260, 74, { width: 260, align: "right" })
      .text(`GSTIN: ${company.gst}`, right - 260, 88, { width: 260, align: "right" });

    // ---- Body starts below the band ----
    doc.x = left;
    doc.y = bandH + 28;

    const ensureSpace = (needed: number) => {
      if (doc.y + needed > bottom) doc.addPage();
    };
    const heading = (text: string) => {
      ensureSpace(40);
      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(PURPLE)
        .text(text, left, doc.y, { width: contentW });
      doc.moveDown(0.3);
    };
    const para = (text: string) => {
      doc
        .font("Helvetica")
        .fontSize(9.5)
        .fillColor(INK)
        .text(text, { width: contentW, align: "justify", lineGap: 2 });
      doc.moveDown(0.6);
    };

    // Intro
    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor(INK)
      .text(
        `This Service Agreement ("Agreement") is entered into on ${today} between ${company.name} ("Service Provider"), ${company.address}, and ${party}${
          client.email ? ` (${client.email})` : ""
        } ("Client") for the project "${client.projectName || "the project"}".`,
        { width: contentW, align: "justify", lineGap: 2 }
      );
    doc.moveDown(0.8);

    // ---- Commercial Summary table ----
    const milestones: any[] = Array.isArray(client.milestones) ? client.milestones : [];
    const totals = computeInvoiceTotals({
      totalCost: Number(client.totalCost || 0),
      milestones,
      discount: Number(client.discountAmount || 0),
      taxRate: Number(client.gstRate || 0),
      gstMode:
        client.gstMode === "none" || client.gstMode === "inclusive"
          ? client.gstMode
          : "exclusive",
    });

    heading("Commercial Summary");
    const rows = milestones.length
      ? milestones.map((m, i) => [
          String(i + 1),
          String(m.title || "Milestone"),
          money(Number(m.amount || 0)),
          m.dueDate || "As scheduled",
        ])
      : [["1", client.projectName || "Project delivery", money(totals.subtotal), "As agreed"]];

    ensureSpace(30 + rows.length * 22 + 60);
    const cNo = left + 6;
    const cDue = right - 110;
    const cAmt = cDue - 110;
    const cTitle = left + 34;
    let ty = doc.y;
    doc.roundedRect(left, ty, contentW, 24, 4).fill(PURPLE);
    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(9);
    doc.text("#", cNo, ty + 8);
    doc.text("MILESTONE", cTitle, ty + 8);
    doc.text("AMOUNT", cAmt, ty + 8, { width: 100, align: "right" });
    doc.text("DUE", cDue, ty + 8, { width: 104, align: "right" });
    ty += 24;
    rows.forEach((r, i) => {
      if (i % 2 === 1) doc.rect(left, ty, contentW, 22).fill(PURPLE_SOFT);
      doc.fillColor(INK).font("Helvetica").fontSize(9);
      doc.text(r[0], cNo, ty + 6);
      doc.text(r[1], cTitle, ty + 6, { width: cAmt - cTitle - 8 });
      doc.text(r[2], cAmt, ty + 6, { width: 100, align: "right" });
      doc.text(r[3], cDue, ty + 6, { width: 104, align: "right" });
      ty += 22;
    });
    doc.moveTo(left, ty).lineTo(right, ty).strokeColor(LINE).lineWidth(1).stroke();
    ty += 8;

    // Totals summary
    const totLines: [string, string][] = [["Subtotal", money(totals.subtotal)]];
    if (totals.discount > 0) totLines.push(["Discount", `- ${money(totals.discount)}`]);
    if (totals.gstMode !== "none" && totals.taxAmount > 0)
      totLines.push([
        `GST (${totals.taxRate}%${totals.gstMode === "inclusive" ? " incl." : ""})`,
        money(totals.taxAmount),
      ]);
    totLines.push(["Total project value", money(totals.total)]);
    doc.font("Helvetica").fontSize(9.5);
    totLines.forEach(([label, value], i) => {
      const strong = i === totLines.length - 1;
      doc.font(strong ? "Helvetica-Bold" : "Helvetica").fillColor(strong ? PURPLE : MUTED);
      doc.text(label, cAmt - 110, ty, { width: 150, align: "right" });
      doc.fillColor(INK).text(value, cAmt + 44, ty, { width: 100 + (right - cAmt - 100), align: "right" });
      ty += 16;
    });
    doc.y = ty + 12;
    doc.x = left;

    // BRD reference
    if (client.brdText && String(client.brdText).trim()) {
      heading("Business Requirement Reference");
      para(String(client.brdText).trim().slice(0, 4000));
    }

    // ---- Clauses ----
    const clauses = agreementClauses({
      name: client.name,
      company: client.company,
      projectName: client.projectName,
    });
    clauses.forEach((clause) => {
      heading(clause.heading);
      clause.body.forEach((p) => para(p));
    });

    // ---- Signatures ----
    ensureSpace(140);
    doc.moveDown(1);
    heading("Acceptance & Signatures");
    para("By signing below, both parties accept and agree to the terms of this Agreement.");
    const sy = doc.y + 24;
    const colW = (contentW - 40) / 2;
    doc.strokeColor(INK).lineWidth(0.8);
    doc.moveTo(left, sy).lineTo(left + colW, sy).stroke();
    doc.moveTo(right - colW, sy).lineTo(right, sy).stroke();
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(INK);
    doc.text(company.name, left, sy + 6, { width: colW });
    doc.text(party, right - colW, sy + 6, { width: colW });
    doc.font("Helvetica").fontSize(8).fillColor(MUTED);
    doc.text("Authorized Signatory", left, sy + 20, { width: colW });
    doc.text("Authorized Signatory", right - colW, sy + 20, { width: colW });

    // Footer on every page (drawn in a post-pass over buffered pages).
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      drawFooter();
    }
    doc.flushPages();

    doc.end();
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { clientId } = await params;
  if (!ObjectId.isValid(clientId)) {
    return NextResponse.json({ ok: false, error: "Invalid client id" }, { status: 400 });
  }
  const db = await getDb();
  const client = await db.collection("clients").findOne({ _id: new ObjectId(clientId) });
  if (!client) {
    return NextResponse.json({ ok: false, error: "Client not found" }, { status: 404 });
  }
  try {
    const pdf = await buildAgreementPdf(client);
    const safeName = String(client.projectName || "service-agreement")
      .replace(/[^\w.-]+/g, "-")
      .slice(0, 60);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `inline; filename="${safeName}-agreement.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("agreement pdf generation failed", err);
    return NextResponse.json(
      { ok: false, error: `PDF generation failed: ${err?.message || "unknown error"}` },
      { status: 500 }
    );
  }
}

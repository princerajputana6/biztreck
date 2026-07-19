import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import { isAdmin } from "@/lib/auth";
import { getDb, ObjectId } from "@/lib/mongodb";

export const runtime = "nodejs";

// Read the brand logo once per lambda. Traced into the function via
// outputFileTracingIncludes in next.config.mjs.
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

function money(value: number) {
  return `INR ${Number(value || 0).toLocaleString("en-IN")}`;
}

// Purple / white creative letterhead palette
const PURPLE = "#6D28D9";
const PURPLE_DEEP = "#4C1D95";
const PURPLE_SOFT = "#F3EEFF";
const INK = "#1E1B2E";
const MUTED = "#6B6880";
const LINE = "#E6E1F2";

type LineItem = { description: string; amount: number };

function buildPdfBuffer(invoice: any) {
  return new Promise<Buffer>((resolve) => {
    const doc = new PDFDocument({ margin: 0, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    const pageW = doc.page.width; // ~595
    const left = 50;
    const right = pageW - 50;
    const contentW = right - left;

    const company = {
      name: process.env.COMPANY_NAME || "Biztreck Solutions",
      address:
        process.env.COMPANY_ADDRESS || "Greater Noida, Uttar Pradesh, India",
      gst: process.env.COMPANY_GST || "09HRTPK7815L1ZQ",
      email: process.env.COMPANY_EMAIL || "connect@biztreck.world",
    };
    const bank = {
      name: process.env.COMPANY_BANK_NAME ,
      account: process.env.COMPANY_BANK_ACCOUNT ,
      ifsc: process.env.COMPANY_BANK_IFSC ,
      branch: process.env.COMPANY_BANK_BRANCH ,
      holder: process.env.COMPANY_BANK_HOLDER ,
      upi: process.env.COMPANY_UPI ,
    };
    const hasBank = Boolean(bank.name || bank.account || bank.upi);

    // Derive line items + totals (backward compatible with milestone invoices)
    const lineItems: LineItem[] =
      Array.isArray(invoice.lineItems) && invoice.lineItems.length
        ? invoice.lineItems.map((li: any) => ({
            description: String(li.description || "Item"),
            amount: Number(li.amount || 0),
          }))
        : [
            {
              description: invoice.milestoneTitle || "Milestone payment",
              amount: Number(invoice.amount || 0),
            },
          ];
    const subtotal =
      invoice.subtotal != null
        ? Number(invoice.subtotal)
        : lineItems.reduce((s, li) => s + li.amount, 0);
    const discount = Number(invoice.discount || 0);
    const taxRate = Number(invoice.taxRate || 0);
    const taxAmount = Number(invoice.taxAmount || 0);
    const gstMode = invoice.gstMode || (taxAmount > 0 ? "exclusive" : "none");
    const total =
      invoice.amount != null
        ? Number(invoice.amount)
        : subtotal - discount + taxAmount;

    // ---- Header band ----
    const bandH = 130;
    doc.rect(0, 0, pageW, bandH).fill(PURPLE);
    doc.rect(0, bandH, pageW, 6).fill(PURPLE_DEEP);

    // Brand logo (white/blue wordmark) sits on the purple band. Falls back to
    // the company name text if the asset can't be read.
    const logo = getLogo();
    if (logo) {
      try {
        doc.image(logo, left, 30, { width: 168 });
      } catch {
        doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(24).text(company.name, left, 34);
      }
    } else {
      doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(24).text(company.name, left, 34);
    }
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#E9E3FB")
      .text(company.address, left, 92)
      .text(`GSTIN: ${company.gst}`, left, 105)
      .text(company.email, left, 118);

    doc
      .font("Helvetica-Bold")
      .fontSize(30)
      .fillColor("#FFFFFF")
      .text("INVOICE", right - 220, 40, { width: 220, align: "right" });
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor("#E9E3FB")
      .text(invoice.invoiceNumber || "", right - 220, 78, {
        width: 220,
        align: "right",
      });

    // ---- Bill to + meta ----
    const metaTop = bandH + 30;
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(PURPLE)
      .text("BILL TO", left, metaTop);
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor(INK)
      .text(invoice.clientCompany || invoice.clientName || "Client", left, metaTop + 16);
    doc.font("Helvetica").fontSize(9.5).fillColor(MUTED);
    let billY = metaTop + 33;
    if (invoice.clientName && invoice.clientCompany) {
      doc.text(invoice.clientName, left, billY);
      billY += 13;
    }
    if (invoice.clientEmail) {
      doc.text(invoice.clientEmail, left, billY);
      billY += 13;
    }
    doc.text(`Project: ${invoice.projectName || ""}`, left, billY);
    billY += 13;
    if (invoice.websiteUrl) {
      doc.text(`Website: ${invoice.websiteUrl}`, left, billY);
    }

    const fmtDate = (d: Date) =>
      d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const invoiceDateObj = new Date(
      invoice.invoiceDate || invoice.createdAt || Date.now()
    );
    // Guarantee the client always sees at least 48h to pay, even on older
    // invoices whose stored due date was empty or too close.
    const dueFloor = new Date(invoiceDateObj.getTime() + 48 * 60 * 60 * 1000);
    let dueDateObj = invoice.dueDate ? new Date(invoice.dueDate) : null;
    if (!dueDateObj || Number.isNaN(dueDateObj.getTime()) || dueDateObj.getTime() < dueFloor.getTime()) {
      dueDateObj = dueFloor;
    }
    const metaX = right - 200;
    const metaRows: [string, string][] = [
      ["Invoice date", fmtDate(invoiceDateObj)],
      ["Due date", fmtDate(dueDateObj)],
      ["Status", String(invoice.status || "draft").toUpperCase()],
    ];
    metaRows.forEach(([label, value], i) => {
      const y = metaTop + i * 16;
      doc.font("Helvetica").fontSize(9.5).fillColor(MUTED).text(label, metaX, y, {
        width: 90,
      });
      doc
        .font("Helvetica-Bold")
        .fontSize(9.5)
        .fillColor(INK)
        .text(value, metaX + 90, y, { width: 110, align: "right" });
    });

    // ---- Line items table ----
    let y = metaTop + 90;
    const amountColW = 110;
    const amountX = right - amountColW;
    doc.roundedRect(left, y, contentW, 30, 5).fill(PURPLE);
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#FFFFFF")
      .text("DESCRIPTION", left + 16, y + 10)
      .text("AMOUNT", amountX, y + 10, {
        width: amountColW - 16,
        align: "right",
      });
    y += 30;

    lineItems.forEach((li, i) => {
      const rowH = 30;
      if (i % 2 === 1) {
        doc.rect(left, y, contentW, rowH).fill(PURPLE_SOFT);
      }
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor(INK)
        .text(li.description, left + 16, y + 9, { width: contentW - amountColW - 24 })
        .text(money(li.amount), amountX, y + 9, {
          width: amountColW - 16,
          align: "right",
        });
      y += rowH;
    });
    doc.moveTo(left, y).lineTo(right, y).strokeColor(LINE).lineWidth(1).stroke();

    // ---- Totals ----
    y += 18;
    const totalsX = right - 240;
    const labelW = 150;
    const valW = 90;
    const totalsRow = (label: string, value: string, opts?: { strong?: boolean }) => {
      doc
        .font(opts?.strong ? "Helvetica-Bold" : "Helvetica")
        .fontSize(opts?.strong ? 10 : 9.5)
        .fillColor(opts?.strong ? INK : MUTED)
        .text(label, totalsX, y, { width: labelW, align: "right" })
        .fillColor(opts?.strong ? INK : INK)
        .text(value, totalsX + labelW, y, { width: valW, align: "right" });
      y += 18;
    };
    totalsRow("Subtotal", money(subtotal), { strong: true });
    if (discount > 0) totalsRow("Discount", `- ${money(discount)}`);
    if (gstMode !== "none" && (taxRate > 0 || taxAmount > 0))
      totalsRow(
        `GST (${taxRate}%${gstMode === "inclusive" ? " incl." : ""})`,
        money(taxAmount)
      );

    // Grand total pill
    y += 6;
    doc.roundedRect(totalsX, y, labelW + valW, 34, 6).fill(PURPLE);
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("#FFFFFF")
      .text("TOTAL PAYABLE", totalsX + 12, y + 12, { width: labelW - 12 })
      .fontSize(13)
      .text(money(total), totalsX + labelW - 12, y + 11, {
        width: valW,
        align: "right",
      });

    // ---- Payment details (bank / UPI) ----
    if (hasBank) {
      const boxY = 660;
      const boxW = 300;
      const rows: [string, string][] = [];
      if (bank.holder) rows.push(["Account name", bank.holder]);
      if (bank.name) rows.push(["Bank", bank.name]);
      if (bank.account) rows.push(["Account no.", bank.account]);
      if (bank.ifsc) rows.push(["IFSC", bank.ifsc]);
      if (bank.upi) rows.push(["UPI", bank.upi]);
      const boxH = 30 + rows.length * 15;
      doc.roundedRect(left, boxY, boxW, boxH, 6).fillAndStroke(PURPLE_SOFT, LINE);
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(PURPLE)
        .text("PAYMENT DETAILS", left + 14, boxY + 12);
      rows.forEach(([label, value], i) => {
        const ry = boxY + 30 + i * 15;
        doc.font("Helvetica").fontSize(9).fillColor(MUTED).text(label, left + 14, ry, { width: 80 });
        doc
          .font("Helvetica-Bold")
          .fontSize(9)
          .fillColor(INK)
          .text(value, left + 94, ry, { width: boxW - 108 });
      });
    }

    // ---- Footer ----
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(MUTED)
      .text(
        `Please pay ${company.name}${hasBank ? " using the payment details above" : " as per the agreed payment terms"} on or before the due date. Thank you for your business.`,
        left,
        780,
        { width: contentW, align: "center" }
      );
    doc.rect(0, 812, pageW, 30).fill(PURPLE);

    doc.end();
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid invoice id" }, { status: 400 });
  }
  const db = await getDb();
  const invoice = await db.collection("invoices").findOne({ _id: new ObjectId(id) });
  if (!invoice) {
    return NextResponse.json({ ok: false, error: "Invoice not found" }, { status: 404 });
  }
  try {
    const pdf = await buildPdfBuffer(invoice);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `inline; filename="${invoice.invoiceNumber || "invoice"}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("invoice pdf generation failed", err);
    return NextResponse.json(
      { ok: false, error: `PDF generation failed: ${err?.message || "unknown error"}` },
      { status: 500 }
    );
  }
}

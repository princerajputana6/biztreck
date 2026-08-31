import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import { guardPermission } from "@/lib/auth";
import { getDb, ObjectId } from "@/lib/mongodb";
import {
  DEFAULT_INVOICE_TERMS,
  TDS_NOTE,
  companyProfile,
  formatMoney,
} from "@/lib/admin-operations";

export const runtime = "nodejs";

// Purple / white creative letterhead palette
const PURPLE = "#6D28D9";
const PURPLE_DEEP = "#4C1D95";
const PURPLE_SOFT = "#F3EEFF";
const INK = "#1E1B2E";
const MUTED = "#6B6880";
const LINE = "#E6E1F2";

type LineItem = { description: string; qty: number; rate: number; amount: number };

// Read the brand logo once per lambda (traced in via next.config outputFileTracingIncludes).
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

let signatureBuffer: Buffer | null | undefined;
function getSignature(): Buffer | null {
  if (signatureBuffer !== undefined) return signatureBuffer;
  try {
    signatureBuffer = fs.readFileSync(path.join(process.cwd(), "public", "signature.png"));
  } catch {
    signatureBuffer = null;
  }
  return signatureBuffer;
}

function buildPdfBuffer(invoice: any): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 45, bottom: 62, left: 45, right: 45 },
      bufferPages: true,
    });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(Buffer.from(c)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    const pageW = doc.page.width;
    const pageH = doc.page.height;
    const left = 45;
    const right = pageW - 45;
    const contentW = right - left;
    const bottom = pageH - 62;

    const co = companyProfile();
    const bank = co.bank;
    const currency = String(invoice.currency || "INR").toUpperCase();
    const money = (v: number) => formatMoney(v, currency);
    const sacCode = String(invoice.sacCode || co.sac || "").trim();

    // ---- Derive line items + totals (backward compatible with old invoices) ----
    const lineItems: LineItem[] =
      Array.isArray(invoice.lineItems) && invoice.lineItems.length
        ? invoice.lineItems.map((li: any) => {
            const amount = Number(li.amount || 0);
            return {
              description: String(li.description || "Item"),
              qty: Number(li.qty) > 0 ? Number(li.qty) : 1,
              rate: Number(li.rate) > 0 ? Number(li.rate) : amount,
              amount,
            };
          })
        : [
            {
              description: invoice.milestoneTitle || "Milestone payment",
              qty: 1,
              rate: Number(invoice.amount || 0),
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
    // Taxable value = the pre-GST base. Holds for both tax modes:
    // exclusive → total = taxable + tax; inclusive → total already includes tax.
    const taxable =
      invoice.taxable != null ? Number(invoice.taxable) : Math.max(0, total - taxAmount);

    // ---- Dates (always give the client >= 48h to pay) ----
    const fmtDate = (d: Date) =>
      d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const invoiceDateObj = new Date(invoice.invoiceDate || invoice.createdAt || Date.now());
    const dueFloor = new Date(invoiceDateObj.getTime() + 48 * 60 * 60 * 1000);
    let dueDateObj = invoice.dueDate ? new Date(invoice.dueDate) : null;
    if (!dueDateObj || Number.isNaN(dueDateObj.getTime()) || dueDateObj.getTime() < dueFloor.getTime()) {
      dueDateObj = dueFloor;
    }
    const paymentTerms = invoice.paymentTerms || "Net 7 days from invoice date";

    const drawFooter = () => {
      doc.save();
      doc.rect(0, pageH - 26, pageW, 26).fill(PURPLE);
      doc
        .fillColor("#E9E3FB")
        .font("Helvetica")
        .fontSize(7.5)
        .text(
          `${co.name} · ${co.website} · ${co.email} · This is a computer-generated invoice.`,
          left,
          pageH - 17,
          { width: contentW, align: "center", lineBreak: false }
        );
      doc.restore();
    };

    const ensureSpace = (needed: number) => {
      if (doc.y + needed > bottom) {
        doc.addPage();
        doc.x = left;
        doc.y = 45;
      }
    };
    const sectionTitle = (text: string) => {
      ensureSpace(34);
      doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor(PURPLE)
        .text(text.toUpperCase(), left, doc.y, { width: contentW, characterSpacing: 0.6 });
      doc.moveDown(0.35);
    };

    // ================= HEADER BAND =================
    const bandH = 112;
    doc.rect(0, 0, pageW, bandH).fill(PURPLE);
    doc.rect(0, bandH, pageW, 5).fill(PURPLE_DEEP);
    const logo = getLogo();
    if (logo) {
      try {
        doc.image(logo, left, 26, { width: 150 });
      } catch {
        doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(22).text(co.name, left, 34);
      }
    } else {
      doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(22).text(co.name, left, 34);
    }
    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor("#E9E3FB")
      .text(co.address, left, 82, { width: 300 });

    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .fillColor("#FFFFFF")
      .text("TAX INVOICE", right - 250, 34, { width: 250, align: "right", lineBreak: false });
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#E9E3FB")
      .text(invoice.invoiceNumber || "", right - 250, 64, { width: 250, align: "right" });

    // ================= COMPANY CONTACT + INVOICE META =================
    let y = bandH + 22;
    const colGap = 24;
    const metaW = 232;
    const metaX = right - metaW;
    const infoW = contentW - metaW - colGap;

    // Left: company contact / tax identity
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor(PURPLE).text("BIZTRECK SOLUTIONS", left, y, { width: infoW, characterSpacing: 0.6 });
    let iy = y + 15;
    const infoRows: [string, string][] = [
      ["Website", co.website],
      ["Email", co.email],
      ["Phone", co.phone],
      ["GST", co.gst],
      ["PAN", co.pan],
    ];
    infoRows.forEach(([k, v]) => {
      doc.font("Helvetica").fontSize(8.5).fillColor(MUTED).text(k, left, iy, { width: 54 });
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(INK).text(v, left + 56, iy, { width: infoW - 56 });
      iy += 13;
    });

    // Right: invoice meta card
    const metaRows: [string, string][] = [
      ["Invoice No", invoice.invoiceNumber || "—"],
      ["Invoice Date", fmtDate(invoiceDateObj)],
      ["Due Date", fmtDate(dueDateObj)],
      ["Currency", currency],
      ...(sacCode ? ([["SAC Code", sacCode]] as [string, string][]) : []),
      ["Payment Terms", paymentTerms],
    ];
    const metaH = 14 + metaRows.length * 14;
    doc.roundedRect(metaX, y - 6, metaW, metaH, 5).fillAndStroke(PURPLE_SOFT, LINE);
    let my = y + 2;
    metaRows.forEach(([k, v]) => {
      doc.font("Helvetica").fontSize(8.5).fillColor(MUTED).text(k, metaX + 12, my, { width: 84 });
      doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor(INK)
        .text(v, metaX + 96, my, { width: metaW - 108, align: "right", lineBreak: false });
      my += 14;
    });

    y = Math.max(iy, y - 6 + metaH) + 16;

    // ================= BILL FROM / BILL TO =================
    doc.y = y;
    const halfW = (contentW - colGap) / 2;
    const billTop = y;

    doc.font("Helvetica-Bold").fontSize(8.5).fillColor(PURPLE).text("BILL FROM", left, billTop, { characterSpacing: 0.6 });
    doc.font("Helvetica-Bold").fontSize(11).fillColor(INK).text(co.name, left, billTop + 14, { width: halfW });
    doc.font("Helvetica").fontSize(8.5).fillColor(MUTED).text(co.address, left, billTop + 29, { width: halfW });
    let fromY = billTop + 29 + doc.heightOfString(co.address, { width: halfW });
    doc.text(`GSTIN: ${co.gst}`, left, fromY + 2, { width: halfW });

    const toX = left + halfW + colGap;
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor(PURPLE).text("BILL TO", toX, billTop, { characterSpacing: 0.6 });
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor(INK)
      .text(invoice.clientCompany || invoice.clientName || "Client", toX, billTop + 14, { width: halfW });
    let ty = billTop + 29;
    doc.font("Helvetica").fontSize(8.5).fillColor(MUTED);
    const toLines = [
      invoice.clientCompany && invoice.clientName ? invoice.clientName : "",
      invoice.billingAddress || "",
      invoice.country || "",
      invoice.clientGstin ? `GSTIN: ${invoice.clientGstin}` : "",
      invoice.clientEmail || "",
      invoice.clientPhone || "",
    ].filter(Boolean);
    toLines.forEach((l: string) => {
      doc.text(String(l), toX, ty, { width: halfW });
      ty += doc.heightOfString(String(l), { width: halfW }) + 2;
    });

    y = Math.max(fromY + 16, ty) + 12;

    // ================= PROJECT =================
    doc.roundedRect(left, y, contentW, 26, 4).fillAndStroke(PURPLE_SOFT, LINE);
    doc.font("Helvetica").fontSize(8.5).fillColor(MUTED).text("Project", left + 12, y + 9, { width: 60 });
    doc
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .fillColor(INK)
      .text(invoice.projectName || "—", left + 66, y + 8, { width: contentW - 80 });
    y += 38;

    // ================= LINE ITEMS =================
    const cQty = left + 268;
    const cRate = left + 330;
    const cAmt = right - 110;
    const qtyW = 50;
    const rateW = 100;
    const amtW = 110;

    doc.roundedRect(left, y, contentW, 26, 4).fill(PURPLE);
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#FFFFFF");
    doc.text("DESCRIPTION", left + 12, y + 9);
    doc.text("QTY", cQty, y + 9, { width: qtyW, align: "right" });
    doc.text("RATE", cRate, y + 9, { width: rateW, align: "right" });
    doc.text("AMOUNT", cAmt, y + 9, { width: amtW - 12, align: "right" });
    y += 26;

    doc.y = y;
    lineItems.forEach((li, i) => {
      const descH = doc.heightOfString(li.description, { width: 250 });
      const sacH = sacCode ? 11 : 0;
      const rowH = Math.max(24, descH + 12 + sacH);
      ensureSpace(rowH + 10);
      const ry = doc.y;
      if (i % 2 === 1) doc.rect(left, ry, contentW, rowH).fill(PURPLE_SOFT);
      doc.font("Helvetica").fontSize(9).fillColor(INK);
      doc.text(li.description, left + 12, ry + 7, { width: 250 });
      if (sacCode)
        doc
          .font("Helvetica")
          .fontSize(7.5)
          .fillColor(MUTED)
          .text(`SAC: ${sacCode}`, left + 12, ry + 7 + descH + 2, { width: 250 });
      doc.font("Helvetica").fontSize(9).fillColor(INK);
      doc.text(String(li.qty), cQty, ry + 7, { width: qtyW, align: "right" });
      doc.text(money(li.rate), cRate, ry + 7, { width: rateW, align: "right" });
      doc.font("Helvetica-Bold").text(money(li.amount), cAmt, ry + 7, { width: amtW - 12, align: "right" });
      doc.y = ry + rowH;
    });
    doc.moveTo(left, doc.y).lineTo(right, doc.y).strokeColor(LINE).lineWidth(1).stroke();

    // ================= TOTALS =================
    doc.y += 12;
    ensureSpace(110);
    const totalsX = right - 250;
    const labelW = 150;
    const valW = 100;
    const totalsRow = (label: string, value: string, strong?: boolean) => {
      doc
        .font(strong ? "Helvetica-Bold" : "Helvetica")
        .fontSize(9)
        .fillColor(strong ? INK : MUTED)
        .text(label, totalsX, doc.y, { width: labelW, align: "right" });
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(INK)
        .text(value, totalsX + labelW, doc.y - 11, { width: valW, align: "right" });
      doc.y += 5;
    };
    const hasGst = gstMode !== "none" && (taxRate > 0 || taxAmount > 0);
    if (discount > 0) {
      totalsRow("Subtotal", money(subtotal));
      totalsRow("Discount", `- ${money(discount)}`);
    }
    // Clear GST-invoice breakdown: Taxable Value + GST = Total Invoice Value.
    totalsRow("Taxable Value", money(taxable), true);
    if (hasGst)
      totalsRow(
        `GST @ ${taxRate}%${gstMode === "inclusive" ? " (incl.)" : ""}`,
        money(taxAmount)
      );

    doc.y += 6;
    const pillY = doc.y;
    doc.roundedRect(totalsX, pillY, labelW + valW, 32, 5).fill(PURPLE);
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("#FFFFFF")
      .text("TOTAL INVOICE VALUE", totalsX + 12, pillY + 12, { width: labelW - 6, lineBreak: false })
      .fontSize(12)
      .text(money(total), totalsX + labelW - 12, pillY + 10, { width: valW, align: "right" });
    doc.y = pillY + 46;
    doc.x = left;

    // ================= PAYMENT DETAILS =================
    const payRows: [string, string][] = [];
    if (bank.name) payRows.push(["Bank", bank.name]);
    if (bank.holder) payRows.push(["Account Holder", bank.holder]);
    if (bank.account) payRows.push(["Account Number", bank.account]);
    if (bank.ifsc) payRows.push(["IFSC", bank.ifsc]);
    if (bank.branch) payRows.push(["Branch", bank.branch]);
    if (bank.swift) payRows.push(["SWIFT", bank.swift]);
    if (bank.upi) payRows.push(["UPI", bank.upi]);
    if (bank.wise) payRows.push(["Wise", bank.wise]);
    if (bank.paypal) payRows.push(["PayPal", bank.paypal]);

    if (payRows.length) {
      const rowsPerCol = Math.ceil(payRows.length / 2);
      const boxH = 26 + rowsPerCol * 14;
      ensureSpace(boxH + 30);
      sectionTitle("Payment Details");
      const by = doc.y;
      doc.roundedRect(left, by, contentW, boxH, 5).fillAndStroke(PURPLE_SOFT, LINE);
      payRows.forEach(([k, v], i) => {
        const col = i < rowsPerCol ? 0 : 1;
        const rowIdx = i - col * rowsPerCol;
        const bx = left + 14 + col * (contentW / 2);
        const byy = by + 13 + rowIdx * 14;
        doc.font("Helvetica").fontSize(8.5).fillColor(MUTED).text(k, bx, byy, { width: 84 });
        doc
          .font("Helvetica-Bold")
          .fontSize(8.5)
          .fillColor(INK)
          .text(v, bx + 86, byy, { width: contentW / 2 - 110 });
      });
      doc.y = by + boxH + 14;
      doc.x = left;
    }

    // ================= NOTES =================
    // Always prints the technical-services / TDS note; the client's typed note
    // (if any) shows above it.
    {
      ensureSpace(70);
      sectionTitle("Notes");
      const customNote = invoice.notes && String(invoice.notes).trim();
      if (customNote) {
        doc
          .font("Helvetica")
          .fontSize(8.5)
          .fillColor(INK)
          .text(String(invoice.notes).trim(), left, doc.y, { width: contentW, lineGap: 1.5 });
        doc.y += 8;
      }
      // TDS note in a soft highlighted box so it stands out to the client.
      const noteH = doc.heightOfString(TDS_NOTE, { width: contentW - 24, lineGap: 1.5 }) + 16;
      ensureSpace(noteH + 6);
      const ny = doc.y;
      doc.roundedRect(left, ny, contentW, noteH, 4).fillAndStroke(PURPLE_SOFT, LINE);
      doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor(PURPLE)
        .text(TDS_NOTE, left + 12, ny + 8, { width: contentW - 24, lineGap: 1.5 });
      doc.y = ny + noteH + 12;
      doc.x = left;
    }

    // ================= TERMS & CONDITIONS =================
    ensureSpace(90);
    sectionTitle("Terms & Conditions");
    doc.font("Helvetica").fontSize(8).fillColor(MUTED);
    DEFAULT_INVOICE_TERMS.forEach((t) => {
      ensureSpace(16);
      doc.text(`•  ${t}`, left, doc.y, { width: contentW, lineGap: 1.5 });
      doc.y += 2;
    });
    doc.y += 12;
    doc.x = left;

    // ================= AUTHORIZED SIGNATURE =================
    ensureSpace(86);
    const sigW = 200;
    const sigX = right - sigW;
    const sy = doc.y + 26;
    const invSig = getSignature();
    if (invSig) {
      try {
        doc.image(invSig, right - 150, sy - 40, { fit: [150, 38], align: "right" });
      } catch {
        /* bad image → blank line */
      }
    }
    doc.moveTo(sigX, sy).lineTo(right, sy).strokeColor(INK).lineWidth(0.8).stroke();
    // Only the handwritten signature above the line — no printed signatory name.
    doc.font("Helvetica").fontSize(8.5).fillColor(MUTED).text(co.signatory.title, sigX, sy + 6, { width: sigW, align: "right" });
    doc.text(co.name, sigX, sy + 18, { width: sigW, align: "right" });
    doc.font("Helvetica").fontSize(8).fillColor(MUTED).text("Authorized Signature", sigX, sy - 14, { width: sigW, align: "right" });

    // Footer on every page (post-pass over buffered pages).
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
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await guardPermission("clients"))) {
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

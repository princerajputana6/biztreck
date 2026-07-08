import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { isAdmin } from "@/lib/auth";
import { getDb, ObjectId } from "@/lib/mongodb";

export const runtime = "nodejs";

function money(value: number) {
  return `INR ${Number(value || 0).toLocaleString("en-IN")}`;
}

function buildPdfBuffer(invoice: any) {
  return new Promise<Buffer>((resolve) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    const company = {
      name: process.env.COMPANY_NAME || "Biztreck Solutions",
      address: process.env.COMPANY_ADDRESS || "Greater Noida, Uttar Pradesh, India",
      gst: process.env.COMPANY_GST || "09HRTPK7815L1ZQ",
      email: process.env.COMPANY_EMAIL || "connect@biztreck.world",
    };

    doc
      .fontSize(22)
      .fillColor("#0f172a")
      .text(company.name, 50, 45)
      .fontSize(9)
      .fillColor("#475569")
      .text(company.address)
      .text(`GSTIN: ${company.gst}`)
      .text(`Email: ${company.email}`);

    doc
      .fontSize(24)
      .fillColor("#2563eb")
      .text("INVOICE", 420, 45, { align: "right" })
      .fontSize(10)
      .fillColor("#475569")
      .text(invoice.invoiceNumber, 420, 78, { align: "right" });

    doc.moveTo(50, 130).lineTo(545, 130).strokeColor("#cbd5e1").stroke();

    doc
      .fontSize(11)
      .fillColor("#0f172a")
      .text("Bill To", 50, 155)
      .fontSize(10)
      .fillColor("#475569")
      .text(invoice.clientCompany || invoice.clientName || "Client", 50, 175)
      .text(`Project: ${invoice.projectName || ""}`, 50, 192);

    const invoiceDate = invoice.createdAt
      ? new Date(invoice.createdAt).toLocaleDateString("en-IN")
      : new Date().toLocaleDateString("en-IN");
    doc
      .fontSize(10)
      .fillColor("#475569")
      .text(`Invoice date: ${invoiceDate}`, 360, 155)
      .text(`Due date: ${invoice.dueDate || "As agreed"}`, 360, 172)
      .text(`Status: ${invoice.status || "draft"}`, 360, 189);

    const tableTop = 250;
    doc.roundedRect(50, tableTop, 495, 32, 4).fill("#eff6ff");
    doc.fillColor("#1e3a8a").fontSize(10).text("Description", 65, tableTop + 11);
    doc.text("Amount", 455, tableTop + 11, { width: 75, align: "right" });

    doc
      .fillColor("#0f172a")
      .fontSize(10)
      .text(invoice.milestoneTitle || "Milestone payment", 65, tableTop + 55, {
        width: 330,
      })
      .text(money(invoice.amount), 455, tableTop + 55, {
        width: 75,
        align: "right",
      });
    doc.moveTo(50, tableTop + 92).lineTo(545, tableTop + 92).strokeColor("#e2e8f0").stroke();

    doc
      .fontSize(11)
      .fillColor("#0f172a")
      .text("Total payable", 355, tableTop + 120, { width: 110, align: "right" })
      .fontSize(14)
      .fillColor("#2563eb")
      .text(money(invoice.amount), 455, tableTop + 116, {
        width: 75,
        align: "right",
      });

    doc
      .fontSize(9)
      .fillColor("#64748b")
      .text(
        "Payment should be made to Biztreck Solutions as per the agreed payment terms. This invoice was generated from the milestone record in the Biztreck admin panel.",
        50,
        690,
        { width: 495 }
      );

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
  const pdf = await buildPdfBuffer(invoice);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${invoice.invoiceNumber || "invoice"}.pdf"`,
    },
  });
}

// PDF rendering for HR documents. Two layouts — a formal letter (offer,
// appointment, internship offer, experience, relieving) on the Biztreck
// letterhead, and a decorative landscape certificate (internship certificate).
// Kept in a lib (not the route) so it can be unit-rendered and reused.

import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import { companyProfile } from "@/lib/admin-operations";
import type { CertificateDoc, HrDoc, LetterDoc } from "@/lib/hr-docs";

const PURPLE = "#6D28D9";
const PURPLE_DEEP = "#4C1D95";
const PURPLE_SOFT = "#F3EEFF";
const GOLD = "#B8892B";
const INK = "#1E1B2E";
const MUTED = "#6B6880";
const LINE = "#E6E1F2";

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

function buildLetterPdf(doc: LetterDoc): Promise<Buffer> {
  return new Promise((resolve) => {
    const pdf = new PDFDocument({
      size: "A4",
      margins: { top: 60, bottom: 70, left: 50, right: 50 },
      bufferPages: true,
    });
    const chunks: Buffer[] = [];
    pdf.on("data", (c) => chunks.push(Buffer.from(c)));
    pdf.on("end", () => resolve(Buffer.concat(chunks)));

    const co = companyProfile();
    const pageW = pdf.page.width;
    const pageH = pdf.page.height;
    const left = pdf.page.margins.left;
    const right = pageW - pdf.page.margins.right;
    const contentW = right - left;
    const bottom = pageH - pdf.page.margins.bottom;

    const drawFooter = () => {
      pdf.save();
      pdf.rect(0, pageH - 28, pageW, 28).fill(PURPLE);
      pdf
        .fillColor("#E9E3FB")
        .font("Helvetica")
        .fontSize(8)
        .text(`${co.name} · ${co.address} · ${co.email} · ${co.phone}`, left, pageH - 19, {
          width: contentW,
          align: "center",
          lineBreak: false,
        });
      pdf.restore();
    };

    const bandH = 108;
    pdf.rect(0, 0, pageW, bandH).fill(PURPLE);
    pdf.rect(0, bandH, pageW, 5).fill(PURPLE_DEEP);
    const logo = getLogo();
    if (logo) {
      try {
        pdf.image(logo, left, 26, { width: 150 });
      } catch {
        pdf.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(22).text(co.name, left, 32);
      }
    } else {
      pdf.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(22).text(co.name, left, 32);
    }
    pdf
      .font("Helvetica-Bold")
      .fontSize(18)
      .fillColor("#FFFFFF")
      .text(doc.docTitle, right - 300, 40, { width: 300, align: "right", lineBreak: false });
    pdf
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#E9E3FB")
      .text(`Date: ${doc.dateLabel}`, right - 300, 70, { width: 300, align: "right" })
      .text(`GSTIN: ${co.gst}`, right - 300, 84, { width: 300, align: "right" });

    pdf.x = left;
    pdf.y = bandH + 26;

    const ensureSpace = (needed: number) => {
      if (pdf.y + needed > bottom) pdf.addPage();
    };

    doc.toBlock.forEach((l, i) => {
      pdf
        .font(i === 0 ? "Helvetica-Bold" : "Helvetica")
        .fontSize(i === 0 ? 10.5 : 9)
        .fillColor(i === 0 ? INK : MUTED)
        .text(l, left, pdf.y, { width: contentW });
    });
    pdf.moveDown(0.8);

    if (doc.subject) {
      pdf.font("Helvetica-Bold").fontSize(10).fillColor(PURPLE).text(`Subject: ${doc.subject}`, { width: contentW });
      pdf.moveDown(0.7);
    }
    if (doc.salutation) {
      pdf.font("Helvetica").fontSize(10).fillColor(INK).text(doc.salutation, { width: contentW });
      pdf.moveDown(0.5);
    }

    const para = (text: string) => {
      ensureSpace(48);
      pdf.font("Helvetica").fontSize(10).fillColor(INK).text(text, { width: contentW, align: "justify", lineGap: 3 });
      pdf.moveDown(0.7);
    };
    doc.body.forEach(para);
    doc.closing.forEach(para);

    ensureSpace(120);
    pdf.moveDown(0.5);
    pdf.font("Helvetica").fontSize(10).fillColor(INK).text("For " + doc.signatory.company + ",", { width: contentW });
    pdf.moveDown(1.6);
    pdf.font("Helvetica-Bold").fontSize(10.5).fillColor(INK).text(doc.signatory.name, { width: contentW });
    pdf.font("Helvetica").fontSize(9).fillColor(MUTED).text(doc.signatory.title, { width: contentW });

    if (doc.acceptance) {
      ensureSpace(90);
      pdf.moveDown(1.8);
      const y = pdf.y;
      const colW = (contentW - 40) / 2;
      pdf.strokeColor(INK).lineWidth(0.8).moveTo(right - colW, y).lineTo(right, y).stroke();
      pdf.font("Helvetica-Bold").fontSize(9.5).fillColor(INK).text("Accepted by", right - colW, y + 6, { width: colW });
      pdf
        .font("Helvetica")
        .fontSize(8.5)
        .fillColor(MUTED)
        .text(`${doc.toBlock[0] || "Candidate"} · Signature & Date`, right - colW, y + 20, { width: colW });
      pdf.x = left;
    }

    const range = pdf.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      pdf.switchToPage(i);
      drawFooter();
    }
    pdf.flushPages();
    pdf.end();
  });
}

function buildCertificatePdf(doc: CertificateDoc): Promise<Buffer> {
  return new Promise((resolve) => {
    const pdf = new PDFDocument({ size: "A4", layout: "landscape", margin: 0, bufferPages: true });
    const chunks: Buffer[] = [];
    pdf.on("data", (c) => chunks.push(Buffer.from(c)));
    pdf.on("end", () => resolve(Buffer.concat(chunks)));

    const co = companyProfile();
    const pageW = pdf.page.width;
    const pageH = pdf.page.height;

    pdf.rect(0, 0, pageW, pageH).fill("#FFFFFF");
    pdf.save();
    pdf.rect(24, 24, pageW - 48, pageH - 48).lineWidth(3).stroke(PURPLE);
    pdf.rect(32, 32, pageW - 64, pageH - 64).lineWidth(1).stroke(GOLD);
    pdf.restore();
    pdf.save().fillColor(PURPLE_SOFT);
    pdf.rect(24, 24, 90, 8).fill();
    pdf.rect(24, 24, 8, 90).fill();
    pdf.rect(pageW - 114, pageH - 32, 90, 8).fill();
    pdf.rect(pageW - 32, pageH - 114, 8, 90).fill();
    pdf.restore();

    const cx = pageW / 2;
    let y = 62;

    const logo = getLogo();
    if (logo) {
      try {
        pdf.image(logo, cx - 80, y, { width: 160 });
        y += 54;
      } catch {
        /* fall through */
      }
    }
    pdf.font("Helvetica-Bold").fontSize(13).fillColor(INK).text(co.name, 0, y, { width: pageW, align: "center" });
    y += 18;
    pdf.font("Helvetica").fontSize(8.5).fillColor(MUTED).text(`${co.address} · ${co.email}`, 0, y, { width: pageW, align: "center" });
    y += 30;

    pdf.font("Helvetica-Bold").fontSize(26).fillColor(PURPLE).text(doc.docTitle, 0, y, { width: pageW, align: "center", characterSpacing: 1 });
    y += 40;
    pdf.moveTo(cx - 70, y).lineTo(cx + 70, y).lineWidth(1.5).stroke(GOLD);
    y += 18;

    pdf.font("Helvetica-Oblique").fontSize(12).fillColor(MUTED).text(doc.eyebrow, 0, y, { width: pageW, align: "center" });
    y += 24;

    pdf.font("Helvetica-Bold").fontSize(28).fillColor(INK).text(doc.name, 0, y, { width: pageW, align: "center" });
    y += 36;
    pdf.moveTo(cx - 150, y).lineTo(cx + 150, y).lineWidth(0.8).stroke(LINE);
    y += 16;

    pdf.font("Helvetica").fontSize(11.5).fillColor(INK);
    const bodyW = pageW - 200;
    doc.body.forEach((p) => {
      pdf.text(p, 100, y, { width: bodyW, align: "center", lineGap: 3 });
      y = pdf.y + 8;
    });

    const baseY = pageH - 120;
    pdf.font("Helvetica").fontSize(9).fillColor(MUTED).text("Date", 90, baseY + 18, { width: 160 });
    pdf.font("Helvetica-Bold").fontSize(10).fillColor(INK).text(doc.dateLabel, 90, baseY + 4, { width: 160 });
    pdf.moveTo(90, baseY).lineTo(230, baseY).lineWidth(0.8).stroke(INK);

    const sigX = pageW - 250;
    pdf.moveTo(sigX, baseY).lineTo(sigX + 160, baseY).lineWidth(0.8).stroke(INK);
    pdf.font("Helvetica-Bold").fontSize(10).fillColor(INK).text(doc.signatory.name, sigX, baseY + 6, { width: 160 });
    pdf.font("Helvetica").fontSize(8.5).fillColor(MUTED).text(`${doc.signatory.title}, ${doc.signatory.company}`, sigX, baseY + 20, { width: 160 });

    pdf.save();
    pdf.circle(cx, baseY + 6, 26).lineWidth(1.2).stroke(GOLD);
    pdf.circle(cx, baseY + 6, 20).lineWidth(0.6).stroke(GOLD);
    pdf.font("Helvetica-Bold").fontSize(6).fillColor(GOLD).text("OFFICIAL SEAL", cx - 26, baseY + 3, { width: 52, align: "center" });
    pdf.restore();

    pdf.end();
  });
}

/** Render any HR document to a branded PDF buffer. */
export function renderHrDoc(doc: HrDoc): Promise<Buffer> {
  return doc.layout === "certificate" ? buildCertificatePdf(doc) : buildLetterPdf(doc);
}

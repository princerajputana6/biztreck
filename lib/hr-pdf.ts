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
    const pageW = pdf.page.width; // 842
    const pageH = pdf.page.height; // 595
    const cx = pageW / 2;
    const CREAM = "#FCFBF7";

    // Background + cream panel
    pdf.rect(0, 0, pageW, pageH).fill("#FFFFFF");
    pdf.rect(20, 20, pageW - 40, pageH - 40).fill(CREAM);

    // Ornate double frame
    pdf.save();
    pdf.roundedRect(22, 22, pageW - 44, pageH - 44, 6).lineWidth(4).stroke(PURPLE);
    pdf.roundedRect(33, 33, pageW - 66, pageH - 66, 4).lineWidth(1).stroke(GOLD);
    pdf.restore();

    // Corner diamonds
    const diamond = (x: number, y: number, r: number) => {
      pdf.save().fillColor(GOLD);
      pdf.moveTo(x, y - r).lineTo(x + r, y).lineTo(x, y + r).lineTo(x - r, y).fill();
      pdf.restore();
    };
    [[46, 46], [pageW - 46, 46], [46, pageH - 46], [pageW - 46, pageH - 46]].forEach(([x, y]) => diamond(x, y, 5));

    let y = 46;
    const logo = getLogo();
    if (logo) {
      try {
        pdf.image(logo, cx - 70, y, { width: 140 });
        y += 46;
      } catch {
        /* fall through */
      }
    }
    pdf.font("Times-Bold").fontSize(13).fillColor(INK).text(co.name, 0, y, { width: pageW, align: "center" });
    y += 16;
    pdf.font("Times-Roman").fontSize(8).fillColor(MUTED).text(`${co.address} · ${co.email} · ${co.phone}`, 0, y, { width: pageW, align: "center" });
    y += 26;

    // Title
    pdf.font("Times-Bold").fontSize(30).fillColor(PURPLE).text(doc.docTitle, 0, y, { width: pageW, align: "center", characterSpacing: 2 });
    y += 42;
    // Gold flourish with centre diamond
    pdf.save().strokeColor(GOLD).lineWidth(1.2);
    pdf.moveTo(cx - 110, y).lineTo(cx - 12, y).stroke();
    pdf.moveTo(cx + 12, y).lineTo(cx + 110, y).stroke();
    pdf.restore();
    diamond(cx, y, 4);
    y += 16;

    // Eyebrow
    pdf.font("Times-Italic").fontSize(12.5).fillColor(MUTED).text(doc.eyebrow, 0, y, { width: pageW, align: "center" });
    y += 20;

    // Name (prominent) + gold underline
    pdf.font("Times-Bold").fontSize(26).fillColor(PURPLE_DEEP).text(doc.name, 0, y, { width: pageW, align: "center" });
    const nameW = Math.min(360, pdf.widthOfString(doc.name) + 40);
    y += 34;
    pdf.save().strokeColor(GOLD).lineWidth(1).moveTo(cx - nameW / 2, y).lineTo(cx + nameW / 2, y).stroke();
    pdf.restore();
    y += 14;

    // Body — fit the font so the whole certificate stays on one page.
    const bodyX = 118;
    const bodyW = pageW - 236;
    const bottomRowY = pageH - 92;
    const avail = bottomRowY - y - 14;
    const measure = (fs: number) => {
      pdf.font("Times-Roman").fontSize(fs);
      let h = 0;
      for (const p of doc.body) h += pdf.heightOfString(p, { width: bodyW, align: "justify", lineGap: 3.5 }) + 9;
      return h;
    };
    let fs = 12;
    while (fs > 9 && measure(fs) > avail) fs -= 0.5;

    pdf.font("Times-Roman").fontSize(fs).fillColor(INK);
    doc.body.forEach((p, i) => {
      const align = i === doc.body.length - 1 ? "center" : "justify";
      pdf.text(p, bodyX, y, { width: bodyW, align, lineGap: 3.5 });
      y = pdf.y + 9;
    });

    // ---- Bottom row: Date · Seal · Signature ----
    const rowY = bottomRowY;
    // Date (left)
    pdf.save().strokeColor(INK).lineWidth(0.8).moveTo(90, rowY).lineTo(240, rowY).stroke();
    pdf.restore();
    pdf.font("Times-Bold").fontSize(10).fillColor(INK).text(doc.dateLabel, 90, rowY - 15, { width: 150 });
    pdf.font("Times-Roman").fontSize(8.5).fillColor(MUTED).text("Date", 90, rowY + 4, { width: 150 });

    // Signature (right)
    const sigX = pageW - 240;
    pdf.save().strokeColor(INK).lineWidth(0.8).moveTo(sigX, rowY).lineTo(sigX + 150, rowY).stroke();
    pdf.restore();
    pdf.font("Times-Bold").fontSize(10).fillColor(INK).text(doc.signatory.name, sigX, rowY - 15, { width: 150 });
    pdf.font("Times-Roman").fontSize(8.5).fillColor(MUTED).text(`${doc.signatory.title}, ${doc.signatory.company}`, sigX, rowY + 4, { width: 150 });

    // Seal (centre)
    const sy = rowY - 8;
    pdf.save();
    pdf.circle(cx, sy, 30).lineWidth(1.4).stroke(GOLD);
    pdf.circle(cx, sy, 23).lineWidth(0.6).stroke(GOLD);
    pdf.font("Times-Bold").fontSize(14).fillColor(GOLD).text("B", cx - 10, sy - 9, { width: 20, align: "center" });
    pdf.font("Times-Bold").fontSize(5.5).fillColor(GOLD).text("OFFICIAL SEAL", cx - 30, sy + 15, { width: 60, align: "center", characterSpacing: 0.5 });
    pdf.restore();

    pdf.end();
  });
}

/** Render any HR document to a branded PDF buffer. */
export function renderHrDoc(doc: HrDoc): Promise<Buffer> {
  return doc.layout === "certificate" ? buildCertificatePdf(doc) : buildLetterPdf(doc);
}

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
      // Writing text below the bottom margin makes pdfkit auto-add a page —
      // drop the bottom margin so the footer stays on the current page.
      pdf.page.margins.bottom = 0;
      pdf.save();
      pdf.rect(0, pageH - 28, pageW, 28).fill(PURPLE);
      pdf
        .fillColor("#E9E3FB")
        .font("Helvetica")
        .fontSize(8)
        .text(`${co.name} · ${co.website.replace(/^https?:\/\//, "")} · ${co.email} · ${co.phone}`, left, pageH - 19, {
          width: contentW,
          align: "center",
          lineBreak: false,
        });
      pdf.restore();
    };

    // Reference no. from the document title, e.g. OFFER LETTER -> BT/OL/2026.
    const refInitials = doc.docTitle.split(/\s+/).map((w) => w[0] || "").join("").toUpperCase().slice(0, 4);
    const refNo = `BT/${refInitials}/${new Date().getFullYear()}`;

    // ---- Header band ----
    const bandH = 100;
    pdf.rect(0, 0, pageW, bandH).fill(PURPLE);
    pdf.rect(0, bandH, pageW, 5).fill(PURPLE_DEEP);
    pdf.rect(0, bandH + 5, pageW, 1.5).fill(GOLD);
    const logo = getLogo();
    if (logo) {
      try {
        pdf.image(logo, left, 24, { width: 150 });
      } catch {
        pdf.fillColor("#FFFFFF").font("Times-Bold").fontSize(22).text(co.name, left, 30);
      }
    } else {
      pdf.fillColor("#FFFFFF").font("Times-Bold").fontSize(22).text(co.name, left, 30);
    }
    pdf
      .font("Times-Bold")
      .fontSize(19)
      .fillColor("#FFFFFF")
      .text(doc.docTitle, right - 320, 38, { width: 320, align: "right", lineBreak: false });
    pdf
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#E9E3FB")
      .text(`Date: ${doc.dateLabel}`, right - 320, 68, { width: 320, align: "right" })
      .text(`GSTIN: ${co.gst}`, right - 320, 82, { width: 320, align: "right" });

    // ---- Letterhead contact strip ----
    const sy = bandH + 13;
    pdf.font("Helvetica-Bold").fontSize(9.5).fillColor(PURPLE).text(co.name.toUpperCase(), left, sy, { width: contentW * 0.6, characterSpacing: 0.4 });
    pdf.font("Helvetica").fontSize(7.5).fillColor(MUTED).text(co.address, left, sy + 12, { width: contentW * 0.6 });
    pdf
      .font("Helvetica")
      .fontSize(7.5)
      .fillColor(MUTED)
      .text(co.email, right - 210, sy, { width: 210, align: "right" })
      .text(co.phone, right - 210, sy + 11, { width: 210, align: "right" })
      .text(co.website.replace(/^https?:\/\//, ""), right - 210, sy + 22, { width: 210, align: "right" });
    const stripBottom = sy + 32;
    pdf.strokeColor(LINE).lineWidth(0.8).moveTo(left, stripBottom).lineTo(right, stripBottom).stroke();

    pdf.x = left;
    pdf.y = stripBottom + 13;

    const ensureSpace = (needed: number) => {
      if (pdf.y + needed > bottom) pdf.addPage();
    };

    // Ref
    pdf.font("Helvetica").fontSize(8.5).fillColor(MUTED).text(`Ref: ${refNo}`, left, pdf.y, { width: contentW });
    pdf.moveDown(0.8);

    // Addressee
    doc.toBlock.forEach((l, i) => {
      pdf
        .font(i === 0 ? "Helvetica-Bold" : "Helvetica")
        .fontSize(i === 0 ? 10.5 : 9)
        .fillColor(i === 0 ? INK : MUTED)
        .text(l, left, pdf.y, { width: contentW });
    });
    pdf.moveDown(0.7);

    // Subject + gold underline
    if (doc.subject) {
      pdf.font("Helvetica-Bold").fontSize(10.5).fillColor(PURPLE_DEEP).text(`Subject: ${doc.subject}`, left, pdf.y, { width: contentW });
      const uy = pdf.y + 2;
      pdf.strokeColor(GOLD).lineWidth(1).moveTo(left, uy).lineTo(left + Math.min(contentW, 250), uy).stroke();
      pdf.moveDown(0.9);
    }

    // Salutation
    if (doc.salutation) {
      pdf.font("Times-Roman").fontSize(10.5).fillColor(INK).text(doc.salutation, left, pdf.y, { width: contentW });
      pdf.moveDown(0.4);
    }

    // Body (serif, justified)
    const para = (text: string) => {
      ensureSpace(44);
      pdf.font("Times-Roman").fontSize(10.5).fillColor(INK).text(text, left, pdf.y, { width: contentW, align: "justify", lineGap: 2.5 });
      pdf.moveDown(0.5);
    };
    doc.body.forEach(para);
    doc.closing.forEach(para);

    // ---- Signature (company left; acceptance right on the same line) ----
    ensureSpace(92);
    pdf.moveDown(0.5);
    pdf.font("Times-Roman").fontSize(10.5).fillColor(INK).text(`For ${doc.signatory.company},`, left, pdf.y, { width: contentW });
    const sigLineY = pdf.y + 30;
    pdf.strokeColor(INK).lineWidth(0.8).moveTo(left, sigLineY).lineTo(left + 200, sigLineY).stroke();
    pdf.font("Helvetica-Bold").fontSize(10.5).fillColor(INK).text(doc.signatory.name, left, sigLineY + 5, { width: 260 });
    pdf.font("Helvetica").fontSize(8.5).fillColor(MUTED).text(`${doc.signatory.title} · Authorized Signatory`, left, sigLineY + 19, { width: 260 });

    if (doc.acceptance) {
      const colW = 200;
      pdf.strokeColor(INK).lineWidth(0.8).moveTo(right - colW, sigLineY).lineTo(right, sigLineY).stroke();
      pdf.font("Helvetica-Bold").fontSize(9.5).fillColor(INK).text("Accepted by", right - colW, sigLineY + 5, { width: colW });
      pdf
        .font("Helvetica")
        .fontSize(8.5)
        .fillColor(MUTED)
        .text(`${doc.toBlock[0] || "Candidate"} · Signature & Date`, right - colW, sigLineY + 19, { width: colW });
    }

    drawFooter();
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

    // Background
    pdf.rect(0, 0, pageW, pageH).fill("#FFFFFF");

    // Offset drop-shadow — gives the frame a lifted / offset look (bottom-right).
    pdf.save().fillOpacity(0.16);
    pdf.roundedRect(31, 31, pageW - 44, pageH - 44, 10).fill("#2A1758");
    pdf.fillOpacity(1).restore();

    // Glossy purple frame — a vertical gradient (light sheen on top → deep at the
    // bottom) reads as a glossy border rather than a flat fill.
    const gloss = (pdf as any).linearGradient(0, 22, 0, pageH - 22);
    gloss.stop(0, "#8B5CF6").stop(0.13, "#A78BFA").stop(0.42, "#6D28D9").stop(1, "#43179A");
    pdf.roundedRect(22, 22, pageW - 44, pageH - 44, 10).fill(gloss);
    // A thin bright keyline just inside the frame edge for extra gloss.
    pdf.roundedRect(25.5, 25.5, pageW - 51, pageH - 51, 8).lineWidth(0.8).stroke("#C4B5FD");

    // Inner cream panel (content sits here)
    pdf.roundedRect(37, 37, pageW - 74, pageH - 74, 6).fill(CREAM);

    // Thin gold inner keyline
    pdf.roundedRect(42, 42, pageW - 84, pageH - 84, 4).lineWidth(1).stroke(GOLD);

    // Corner diamonds on the gold keyline
    const diamond = (x: number, y: number, r: number) => {
      pdf.save().fillColor(GOLD);
      pdf.moveTo(x, y - r).lineTo(x + r, y).lineTo(x, y + r).lineTo(x - r, y).fill();
      pdf.restore();
    };
    [[56, 56], [pageW - 56, 56], [56, pageH - 56], [pageW - 56, pageH - 56]].forEach(([x, y]) => diamond(x, y, 5));

    // Brand chip — the logo is a light wordmark, so place it on a purple chip
    // where it stays visible on the cream certificate.
    let y = 40;
    const logo = getLogo();
    const chipW = 214;
    const chipH = 60;
    pdf.roundedRect(cx - chipW / 2, y, chipW, chipH, 8).fill(PURPLE);
    let logoDrawn = false;
    if (logo) {
      try {
        pdf.image(logo, cx - 66, y + 14, { width: 132 });
        logoDrawn = true;
      } catch {
        logoDrawn = false;
      }
    }
    if (!logoDrawn) {
      pdf.font("Times-Bold").fontSize(20).fillColor("#FFFFFF").text(co.name, cx - chipW / 2, y + 20, { width: chipW, align: "center" });
    }
    y += chipH + 10;
    pdf.font("Times-Roman").fontSize(8).fillColor(MUTED).text(`${co.address} · ${co.email} · ${co.phone}`, 0, y, { width: pageW, align: "center" });
    y += 24;

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

    // Seal (centre) — a clean gold rosette with a star, label beneath the ring.
    const sy = rowY - 6;
    const sr = 28;
    pdf.save();
    pdf.circle(cx, sy, sr).fillOpacity(0.07).fill(GOLD);
    pdf.fillOpacity(1);
    pdf.circle(cx, sy, sr).lineWidth(1.4).stroke(GOLD);
    pdf.circle(cx, sy, sr - 5).lineWidth(0.6).stroke(GOLD);
    // 5-point star in the centre
    pdf.fillColor(GOLD);
    const spikes = 5;
    const outerR = 10;
    const innerR = 4.2;
    const step = Math.PI / spikes;
    let rot = -Math.PI / 2;
    pdf.moveTo(cx + Math.cos(rot) * outerR, sy + Math.sin(rot) * outerR);
    for (let i = 0; i < spikes; i++) {
      rot += step;
      pdf.lineTo(cx + Math.cos(rot) * innerR, sy + Math.sin(rot) * innerR);
      rot += step;
      pdf.lineTo(cx + Math.cos(rot) * outerR, sy + Math.sin(rot) * outerR);
    }
    pdf.closePath().fill();
    pdf.restore();
    pdf.font("Helvetica-Bold").fontSize(6).fillColor(MUTED).text("OFFICIAL SEAL", cx - 50, sy + sr + 5, { width: 100, align: "center", characterSpacing: 1 });

    pdf.end();
  });
}

/** Render any HR document to a branded PDF buffer. */
export function renderHrDoc(doc: HrDoc): Promise<Buffer> {
  return doc.layout === "certificate" ? buildCertificatePdf(doc) : buildLetterPdf(doc);
}

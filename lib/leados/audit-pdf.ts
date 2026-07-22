// LeadOS — render a lead's AI audit as a polished, prospect-facing PDF using
// pdfkit (already a dependency; built-in Helvetica fonts, no external assets).
// Shared by the admin download route and the public share route.

import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import { SITE } from "@/lib/site";
import type { Lead } from "./types";

const NAVY = "#0d1a3a";
const CYAN = "#0891b2";
const INK = "#0f172a";
const MUTED = "#64748b";
const LINE = "#e2e8f0";
const SOFT = "#f0fdff";

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

export function buildAuditPdf(lead: Lead): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const audit = lead.audit;
    if (!audit) {
      reject(new Error("Lead has no audit to render"));
      return;
    }

    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 45, bottom: 60, left: 45, right: 45 },
      bufferPages: true,
    });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(Buffer.from(c)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageW = doc.page.width;
    const pageH = doc.page.height;
    const left = 45;
    const right = pageW - 45;
    const contentW = right - left;
    const bottom = pageH - 60;

    const ensureSpace = (needed: number) => {
      if (doc.y + needed > bottom) {
        doc.addPage();
        doc.x = left;
        doc.y = 50;
      }
    };

    // ---- Header band ----
    const bandH = 96;
    doc.rect(0, 0, pageW, bandH).fill(NAVY);
    doc.rect(0, bandH, pageW, 4).fill(CYAN);
    const logo = getLogo();
    if (logo) {
      try {
        doc.image(logo, left, 24, { width: 130 });
      } catch {
        doc.fillColor("#fff").font("Helvetica-Bold").fontSize(18).text(SITE.name, left, 30);
      }
    } else {
      doc.fillColor("#fff").font("Helvetica-Bold").fontSize(18).text(SITE.name, left, 30);
    }
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#7fa2ff")
      .text("BUSINESS AUDIT", right - 200, 34, { width: 200, align: "right", characterSpacing: 1.5 });
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#cbd5e1")
      .text(new Date(audit.generatedAt).toLocaleDateString(), right - 200, 50, {
        width: 200,
        align: "right",
      });

    // ---- Title ----
    doc.y = bandH + 22;
    doc.font("Helvetica-Bold").fontSize(22).fillColor(INK).text(lead.businessName, left, doc.y, {
      width: contentW,
    });
    doc.moveDown(0.2);
    doc.font("Helvetica").fontSize(11).fillColor(CYAN).text(audit.headline, { width: contentW });
    doc.moveDown(0.4);

    // Score + priority chips
    const chipY = doc.y;
    const chip = (label: string, x: number) => {
      const w = doc.widthOfString(label) + 18;
      doc.roundedRect(x, chipY, w, 18, 9).fillAndStroke(SOFT, LINE);
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(INK).text(label, x + 9, chipY + 5);
      return x + w + 8;
    };
    let cx = chip(`Website score ${audit.websiteScore}/100`, left);
    chip(`Priority: ${String(audit.priority).toUpperCase()}`, cx);
    doc.y = chipY + 30;
    doc.x = left;

    const sectionTitle = (text: string) => {
      ensureSpace(30);
      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(NAVY)
        .text(text, left, doc.y, { width: contentW });
      doc.moveTo(left, doc.y + 2).lineTo(right, doc.y + 2).strokeColor(LINE).lineWidth(1).stroke();
      doc.moveDown(0.5);
    };

    const paragraph = (text: string) => {
      doc.font("Helvetica").fontSize(9.5).fillColor(INK).text(text, left, doc.y, {
        width: contentW,
        lineGap: 2,
      });
      doc.moveDown(0.4);
    };

    const bullets = (points: string[]) => {
      doc.font("Helvetica").fontSize(9.5).fillColor(MUTED);
      for (const p of points) {
        ensureSpace(16);
        doc.text(`•  ${p}`, left + 6, doc.y, { width: contentW - 6, lineGap: 1.5 });
        doc.moveDown(0.15);
      }
    };

    // ---- Executive summary ----
    sectionTitle("Executive Summary");
    paragraph(audit.executiveSummary);
    doc.moveDown(0.3);

    // ---- Sections ----
    for (const s of audit.sections) {
      ensureSpace(50);
      sectionTitle(s.title);
      if (s.summary) paragraph(s.summary);
      if (s.points?.length) bullets(s.points);
      doc.moveDown(0.3);
    }

    // ---- Estimated ROI ----
    ensureSpace(70);
    const roiY = doc.y;
    const roiH = doc.heightOfString(audit.estimatedRoi, { width: contentW - 24 }) + 34;
    doc.roundedRect(left, roiY, contentW, roiH, 6).fillAndStroke(SOFT, "#a5f3fc");
    doc.font("Helvetica-Bold").fontSize(10).fillColor(NAVY).text("Estimated ROI", left + 12, roiY + 10);
    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor(INK)
      .text(audit.estimatedRoi, left + 12, roiY + 24, { width: contentW - 24, lineGap: 2 });
    doc.y = roiY + roiH + 14;
    doc.x = left;

    // ---- Next steps ----
    if (audit.nextSteps?.length) {
      sectionTitle("Recommended Next Steps");
      doc.font("Helvetica").fontSize(9.5).fillColor(INK);
      audit.nextSteps.forEach((n, i) => {
        ensureSpace(16);
        doc.text(`${i + 1}.  ${n}`, left + 6, doc.y, { width: contentW - 6, lineGap: 1.5 });
        doc.moveDown(0.15);
      });
      doc.moveDown(0.4);
    }

    // ---- CTA ----
    ensureSpace(60);
    const ctaY = doc.y;
    const ctaH = doc.heightOfString(audit.callToAction, { width: contentW - 24 }) + 24;
    doc.roundedRect(left, ctaY, contentW, ctaH, 6).fill(CYAN);
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#ffffff")
      .text(audit.callToAction, left + 12, ctaY + 12, { width: contentW - 24, lineGap: 2 });
    doc.y = ctaY + ctaH + 10;

    // ---- Footer on every page ----
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.rect(0, pageH - 24, pageW, 24).fill(NAVY);
      doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor("#cbd5e1")
        .text(
          `${SITE.name} · ${SITE.url.replace(/^https?:\/\//, "")} · ${SITE.email} · Prepared for ${lead.businessName}`,
          left,
          pageH - 16,
          { width: contentW, align: "center", lineBreak: false }
        );
    }
    doc.flushPages();
    doc.end();
  });
}

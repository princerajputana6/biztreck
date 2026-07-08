import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { analyzeClientDocument } from "@/lib/groq";
import mammoth from "mammoth";

export const runtime = "nodejs";
export const maxDuration = 60;

function extractAmount(line: string) {
  const currencyMatch = line.match(/(?:inr|rs\.?|₹)\s*([\d,]+(?:\.\d+)?)/i);
  if (currencyMatch) return Number(currencyMatch[1].replace(/,/g, ""));
  const parts = line.split("|").map((part) => part.trim());
  for (const part of parts) {
    if (/^\d{4,}(?:\.\d+)?$/.test(part.replace(/,/g, ""))) {
      return Number(part.replace(/,/g, ""));
    }
  }
  return 0;
}

function fallbackAnalyze(documentText: string) {
  const lines = documentText
    .replace(/\s+(?=Milestone\s+\d+)/gi, "\n")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const milestoneLines = lines.filter((line) => {
    const lower = line.toLowerCase();
    const hasAmount = /(?:inr|rs\.?|₹)\s*[\d,]+/i.test(line) || /\|\s*[\d,]+\s*\|/.test(line);
    return (
      lower.includes("milestone") ||
      (lower.includes("payment") && hasAmount) ||
      hasAmount
    );
  });

  const milestones = milestoneLines
    .map((line) => {
      const parts = line.split("|").map((part) => part.trim()).filter(Boolean);
      const dateMatch = line.match(/\b(\d{4}-\d{2}-\d{2})\b/);
      const title =
        parts.length >= 2 && /^milestone\s*\d*/i.test(parts[0])
          ? parts[1]
          : parts[0]?.replace(/^milestone\s*\d*[:.-]?\s*/i, "");
      return {
        title: title || line.slice(0, 80),
        amount: extractAmount(line),
        dueDate: dateMatch?.[1] || "",
        notes: line,
      };
    })
    .filter((m) => m.title);

  const brdSummary = lines
    .filter((line) => !milestoneLines.includes(line))
    .join("\n")
    .slice(0, 6000);

  return { brdSummary, milestones };
}

async function extractTextFromRequest(req: Request) {
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    const pastedText = form.get("documentText");
    if (file instanceof File && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const lowerName = file.name.toLowerCase();
      if (lowerName.endsWith(".docx")) {
        const result = await mammoth.extractRawText({ buffer });
        return result.value.trim();
      }
      return buffer.toString("utf8").trim();
    }
    return typeof pastedText === "string" ? pastedText.trim() : "";
  }

  const { documentText } = await req.json();
  return typeof documentText === "string" ? documentText.trim() : "";
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const text = await extractTextFromRequest(req);
    if (text.length < 20) {
      return NextResponse.json(
        { ok: false, error: "Upload a readable DOCX/text file or paste a longer document first" },
        { status: 400 }
      );
    }

    try {
      const result = await analyzeClientDocument(text);
      return NextResponse.json({ ok: true, source: "ai", ...result });
    } catch (e) {
      console.error("[admin:analyze-client-doc] AI failed, using fallback", e);
      return NextResponse.json({
        ok: true,
        source: "fallback",
        ...fallbackAnalyze(text),
      });
    }
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Document analysis failed" },
      { status: 500 }
    );
  }
}

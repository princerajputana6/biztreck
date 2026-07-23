import { NextResponse } from "next/server";
import { guardPermission } from "@/lib/auth";
import { generateJob } from "@/lib/groq";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!(await guardPermission("ai-publishing"))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    if (!body?.role) {
      return NextResponse.json(
        { ok: false, error: "Provide a role" },
        { status: 400 }
      );
    }
    const job = await generateJob(body);
    return NextResponse.json({ ok: true, job });
  } catch (e: any) {
    console.error("[generate:job]", e);
    return NextResponse.json(
      { ok: false, error: e?.message || "Generation failed" },
      { status: 500 }
    );
  }
}

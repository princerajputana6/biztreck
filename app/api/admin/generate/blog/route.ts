import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { generateBlog, coverImageUrl } from "@/lib/groq";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { topic } = await req.json();
    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { ok: false, error: "Provide a topic" },
        { status: 400 }
      );
    }
    const blog = await generateBlog(topic);
    const coverImage = coverImageUrl(blog.coverPrompt);
    return NextResponse.json({ ok: true, blog: { ...blog, coverImage } });
  } catch (e: any) {
    console.error("[generate:blog]", e);
    return NextResponse.json(
      { ok: false, error: e?.message || "Generation failed" },
      { status: 500 }
    );
  }
}

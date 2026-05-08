import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const db = await getDb();
  const [blogs, jobs, applications, contacts, comments] = await Promise.all([
    db
      .collection("blogs")
      .find({}, { projection: { contentMarkdown: 0 } })
      .sort({ createdAt: -1 })
      .toArray(),
    db.collection("jobs").find({}).sort({ createdAt: -1 }).toArray(),
    db
      .collection("applications")
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray(),
    db.collection("contacts").find({}).sort({ createdAt: -1 }).limit(50).toArray(),
    db
      .collection("comments")
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray(),
  ]);
  const norm = (a: any[]) => a.map((x) => ({ ...x, _id: String(x._id) }));
  return NextResponse.json({
    ok: true,
    blogs: norm(blogs),
    jobs: norm(jobs),
    applications: norm(applications),
    contacts: norm(contacts),
    comments: norm(comments),
  });
}

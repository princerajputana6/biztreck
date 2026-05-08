import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import AdminShell from "./AdminShell";

export const dynamic = "force-dynamic";

async function loadStats() {
  try {
    const db = await getDb();
    const [blogs, jobs, applications, contacts, comments] = await Promise.all([
      db
        .collection("blogs")
        .find({}, { projection: { contentMarkdown: 0 } })
        .sort({ createdAt: -1 })
        .toArray(),
      db.collection("jobs").find({}).sort({ createdAt: -1 }).toArray(),
      db.collection("applications").countDocuments(),
      db.collection("contacts").countDocuments(),
      db.collection("comments").countDocuments(),
    ]);
    return {
      blogs: blogs.map((b) => ({ ...b, _id: String(b._id) })),
      jobs: jobs.map((j) => ({ ...j, _id: String(j._id) })),
      applicationsCount: applications,
      contactsCount: contacts,
      commentsCount: comments,
    };
  } catch {
    return {
      blogs: [],
      jobs: [],
      applicationsCount: 0,
      contactsCount: 0,
      commentsCount: 0,
    };
  }
}

export default async function AdminHome() {
  if (!(await isAdmin())) redirect("/admin/login");
  const stats = await loadStats();
  return <AdminShell {...stats} />;
}

import { getDb } from "@/lib/mongodb";
import type { Db } from "mongodb";

export type AdminData = {
  blogs: any[];
  jobs: any[];
  applicationsCount: number;
  contactsCount: number;
  commentsCount: number;
  clients: any[];
  documents: any[];
  invoices: any[];
  employees: any[];
  hiring: any[];
  socialTasks: any[];
  expenses: any[];
};

export type AdminView =
  | "dashboard"
  | "assistant"
  | "ai-publishing"
  | "clients"
  | "invoices"
  | "leados"
  | "people"
  | "team"
  | "content"
  | "submissions"
  | "integrations"
  | "users";

function serializeAdminValue(value: any): any {
  if (value == null) return value;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(serializeAdminValue);
  if (typeof value === "object") {
    if (typeof value.toHexString === "function") return value.toHexString();
    const out: Record<string, any> = {};
    for (const [key, child] of Object.entries(value)) {
      out[key] = serializeAdminValue(child);
    }
    return out;
  }
  return value;
}

const EMPTY: AdminData = {
  blogs: [],
  jobs: [],
  applicationsCount: 0,
  contactsCount: 0,
  commentsCount: 0,
  clients: [],
  documents: [],
  invoices: [],
  employees: [],
  hiring: [],
  socialTasks: [],
  expenses: [],
};

// One query per data slice. Each admin view only pulls the slices it renders, so
// navigating between tabs doesn't re-fetch the entire dataset every time.
const QUERIES: Record<keyof AdminData, (db: Db) => Promise<any>> = {
  blogs: (db) =>
    db
      .collection("blogs")
      .find({}, { projection: { contentMarkdown: 0 } })
      .sort({ createdAt: -1 })
      .toArray(),
  jobs: (db) => db.collection("jobs").find({}).sort({ createdAt: -1 }).toArray(),
  applicationsCount: (db) => db.collection("applications").countDocuments(),
  contactsCount: (db) => db.collection("contacts").countDocuments(),
  commentsCount: (db) => db.collection("comments").countDocuments(),
  clients: (db) => db.collection("clients").find({}).sort({ createdAt: -1 }).limit(50).toArray(),
  documents: (db) =>
    db
      .collection("client_documents")
      .find({}, { projection: { contentMarkdown: 0 } })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray(),
  invoices: (db) => db.collection("invoices").find({}).sort({ createdAt: -1 }).limit(80).toArray(),
  employees: (db) => db.collection("employees").find({}).sort({ createdAt: -1 }).limit(80).toArray(),
  hiring: (db) =>
    db.collection("hiring_pipeline").find({}).sort({ createdAt: -1 }).limit(80).toArray(),
  socialTasks: (db) =>
    db.collection("social_tasks").find({}).sort({ createdAt: -1 }).limit(80).toArray(),
  expenses: (db) => db.collection("expenses").find({}).sort({ createdAt: -1 }).limit(120).toArray(),
};

// The exact slices each view reads. Views not listed here (or with no DB reads,
// like "ai-publishing" and "people") fetch nothing.
const VIEW_NEEDS: Record<AdminView, (keyof AdminData)[]> = {
  dashboard: [
    "blogs",
    "clients",
    "invoices",
    "employees",
    "expenses",
    "applicationsCount",
    "contactsCount",
    "commentsCount",
  ],
  "ai-publishing": [],
  clients: ["clients", "documents"],
  invoices: ["invoices", "clients"],
  people: ["employees", "hiring", "socialTasks", "expenses"],
  leados: [],
  team: ["employees", "hiring", "socialTasks"],
  content: ["blogs", "jobs"],
  submissions: ["applicationsCount", "contactsCount", "commentsCount"],
  assistant: [],
  integrations: [],
  users: [],
};

/**
 * Load only the data the given admin view renders. Always returns the full
 * AdminData shape (unused slices stay at their empty defaults) so AdminShell can
 * consume it unchanged.
 */
export async function loadAdminData(view: AdminView = "dashboard"): Promise<AdminData> {
  try {
    const db = await getDb();
    const out: AdminData = { ...EMPTY };
    const needs = VIEW_NEEDS[view] || [];
    await Promise.all(
      needs.map(async (key) => {
        const raw = await QUERIES[key](db);
        (out as any)[key] = typeof raw === "number" ? raw : (raw as any[]).map(serializeAdminValue);
      })
    );
    return out;
  } catch {
    return { ...EMPTY };
  }
}

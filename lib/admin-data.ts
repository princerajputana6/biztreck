import { getDb } from "@/lib/mongodb";
import type { Db } from "mongodb";

export type AdminData = {
  blogs: any[];
  jobs: any[];
  applications: any[];
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
  users: any[];
  integrationsStatus: Record<string, { connected: boolean; updatedAt: string | null; fields: string[]; email: string | null }>;
};

export type AdminView =
  | "dashboard"
  | "clients"
  | "leados"
  | "team"
  | "content"
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
  applications: [],
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
  users: [],
  integrationsStatus: {},
};

function publicUser(u: any) {
  return {
    email: u.email,
    name: u.name || "",
    role: u.role === "owner" ? "owner" : u.role || (u.permissions ? "member" : "owner"),
    permissions: Array.isArray(u.permissions) ? u.permissions : [],
    active: u.active !== false,
    createdAt: u.createdAt || null,
  };
}

async function integrationsStatusQuery(db: Db) {
  const docs = await db.collection("integrations").find({}).toArray();
  const status: AdminData["integrationsStatus"] = {};
  for (const d of docs) {
    status[d.provider] = {
      connected: Boolean(d.connected),
      updatedAt: d.updatedAt || null,
      fields: d.config ? Object.keys(d.config).filter((k) => d.config[k]) : [],
      email: d.email || null,
    };
  }
  return status;
}

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
  applications: (db) => db.collection("applications").find({}).sort({ createdAt: -1 }).limit(50).toArray(),
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
  users: (db) =>
    db
      .collection("admin_users")
      .find({}, { projection: { passwordHash: 0 } })
      .sort({ createdAt: -1 })
      .toArray()
      .then((docs) => docs.map(publicUser)),
  integrationsStatus: (db) => integrationsStatusQuery(db),
};

// The exact slices each view reads. Views not listed here (or with no DB reads,
// like "leados", which fetches its own data client-side) get nothing.
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
  clients: ["clients", "documents", "invoices"],
  leados: [],
  team: ["employees", "hiring", "socialTasks", "expenses", "applications", "contactsCount", "commentsCount"],
  content: ["blogs", "jobs"],
  integrations: ["integrationsStatus"],
  users: ["users"],
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
        (out as any)[key] =
          typeof raw === "number" ? raw : Array.isArray(raw) ? raw.map(serializeAdminValue) : serializeAdminValue(raw);
      })
    );
    return out;
  } catch {
    return { ...EMPTY };
  }
}

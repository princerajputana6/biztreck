import { getDb } from "@/lib/mongodb";

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

export async function loadAdminData(): Promise<AdminData> {
  try {
    const db = await getDb();
    const [
      blogs,
      jobs,
      applications,
      contacts,
      comments,
      clients,
      documents,
      invoices,
      employees,
      hiring,
      socialTasks,
      expenses,
    ] = await Promise.all([
      db
        .collection("blogs")
        .find({}, { projection: { contentMarkdown: 0 } })
        .sort({ createdAt: -1 })
        .toArray(),
      db.collection("jobs").find({}).sort({ createdAt: -1 }).toArray(),
      db.collection("applications").countDocuments(),
      db.collection("contacts").countDocuments(),
      db.collection("comments").countDocuments(),
      db.collection("clients").find({}).sort({ createdAt: -1 }).limit(50).toArray(),
      db
        .collection("client_documents")
        .find({}, { projection: { contentMarkdown: 0 } })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray(),
      db.collection("invoices").find({}).sort({ createdAt: -1 }).limit(80).toArray(),
      db.collection("employees").find({}).sort({ createdAt: -1 }).limit(80).toArray(),
      db.collection("hiring_pipeline").find({}).sort({ createdAt: -1 }).limit(80).toArray(),
      db.collection("social_tasks").find({}).sort({ createdAt: -1 }).limit(80).toArray(),
      db.collection("expenses").find({}).sort({ createdAt: -1 }).limit(120).toArray(),
    ]);
    const norm = (items: any[]) => items.map((x) => serializeAdminValue(x));
    return {
      blogs: norm(blogs),
      jobs: norm(jobs),
      applicationsCount: applications,
      contactsCount: contacts,
      commentsCount: comments,
      clients: norm(clients),
      documents: norm(documents),
      invoices: norm(invoices),
      employees: norm(employees),
      hiring: norm(hiring),
      socialTasks: norm(socialTasks),
      expenses: norm(expenses),
    };
  } catch {
    return {
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
  }
}

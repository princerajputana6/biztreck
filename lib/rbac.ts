// Role-based access control — the permission model, shared by server and client.
// Kept free of server-only imports (no next/headers, no mongodb) so the admin
// UI can import it too.

export type Permission =
  | "dashboard"
  | "leados"
  | "clients"
  | "content"
  | "team"
  | "integrations"
  | "users";

export type Role = "owner" | "member";

/** A resolved login session. Plain/serializable so it can cross to the client. */
export type Session = {
  sub: string;
  email: string;
  name: string;
  role: Role;
  permissions: Permission[];
};

// Ordered as they appear in the admin nav. `path` is the landing route for the
// module; used both for the sidebar and for redirecting members to their first
// permitted area.
export const PERMISSIONS: {
  key: Permission;
  label: string;
  path: string;
  desc: string;
}[] = [
  { key: "dashboard", label: "Dashboard", path: "/admin", desc: "Company overview & stats" },
  { key: "leados", label: "LeadOS", path: "/admin/leados", desc: "Lead generation, audits & outreach — Shadow assistant for owners" },
  { key: "clients", label: "Clients & billing", path: "/admin/clients", desc: "Clients, agreements, milestones, invoices & payments" },
  { key: "content", label: "Content", path: "/admin/content", desc: "Generate & manage published posts and roles" },
  { key: "team", label: "Team", path: "/admin/team", desc: "Employees, hiring, job posts, submissions & expenses" },
  { key: "integrations", label: "Integrations", path: "/admin/integrations", desc: "Connect Google, GitHub, social accounts" },
  { key: "users", label: "Users & access", path: "/admin/users", desc: "Create users, assign permissions" },
];

export const ALL_PERMISSIONS: Permission[] = PERMISSIONS.map((p) => p.key);

/** Quick-assign templates the admin can pick when creating a user. */
export const PRESETS: { name: string; permissions: Permission[] }[] = [
  { name: "Full access", permissions: ALL_PERMISSIONS },
  { name: "Marketing", permissions: ["dashboard", "leados", "clients", "content"] },
  { name: "Sales", permissions: ["dashboard", "leados", "clients"] },
  { name: "Finance", permissions: ["dashboard", "clients"] },
];

export function can(session: Session | null | undefined, perm: Permission): boolean {
  if (!session) return false;
  if (session.role === "owner") return true;
  return session.permissions.includes(perm);
}

/** The modules a session may access, in nav order. */
export function allowedModules(session: Session) {
  return PERMISSIONS.filter((p) => can(session, p.key));
}

/** Where to send a member who hit a page they can't see: their first module. */
export function firstAllowedPath(session: Session): string {
  const first = PERMISSIONS.find((p) => can(session, p.key));
  return first ? first.path : "/admin/no-access";
}

export function isValidPermission(v: unknown): v is Permission {
  return typeof v === "string" && ALL_PERMISSIONS.includes(v as Permission);
}

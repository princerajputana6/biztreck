import { getDb } from "@/lib/mongodb";
import { SITE } from "@/lib/site";

// Shared tool layer exposed to AI agents over both MCP (/api/mcp) and A2A
// (/api/a2a). Every tool maps to a real, already-public Biztreck capability —
// nothing fabricated. Reads hit MongoDB directly; contact reuses the existing
// /api/contact route so email + validation behaviour stays identical.

export type ToolResult = { text: string };

export type ToolDef = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  run: (args: Record<string, any>) => Promise<ToolResult>;
};

const base = SITE.url;

async function searchBlogs(args: { query?: string }): Promise<ToolResult> {
  const db = await getDb();
  const blogs = await db
    .collection("blogs")
    .find({ published: true }, { projection: { contentMarkdown: 0 } })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();
  const q = (args?.query || "").toLowerCase();
  const matched = blogs.filter(
    (b: any) =>
      !q ||
      `${b.title} ${b.excerpt} ${(b.tags || []).join(" ")}`
        .toLowerCase()
        .includes(q)
  );
  if (!matched.length) return { text: "No matching blog posts found." };
  return {
    text: matched
      .slice(0, 10)
      .map((b: any) => {
        const link = b.slug ? `\n  ${base}/blog/${b.slug}` : "";
        return `- ${b.title} — ${b.excerpt}${link}`;
      })
      .join("\n"),
  };
}

async function getBlog(args: { slug?: string }): Promise<ToolResult> {
  if (!args?.slug) return { text: "Provide a blog 'slug'." };
  const db = await getDb();
  const b: any = await db
    .collection("blogs")
    .findOne({ slug: args.slug, published: true });
  if (!b) return { text: `No published blog found with slug "${args.slug}".` };
  return {
    text: `# ${b.title}\n\n${b.excerpt || ""}\n\n${b.contentMarkdown || ""}\n\nSource: ${base}/blog/${b.slug}`,
  };
}

async function listJobs(): Promise<ToolResult> {
  const db = await getDb();
  const jobs = await db
    .collection("jobs")
    .find({ active: { $ne: false } })
    .sort({ createdAt: -1 })
    .toArray();
  if (!jobs.length) return { text: "No open roles at the moment." };
  return {
    text: jobs
      .map((j: any) => {
        const meta = `${j.department || "Team"}, ${j.location || "Remote"}, ${j.type || "Full-time"}`;
        const link = j.slug ? `\n  ${base}/careers/${j.slug}` : "";
        return `- ${j.title} (${meta})${link}`;
      })
      .join("\n"),
  };
}

async function submitContact(args: Record<string, any>): Promise<ToolResult> {
  if (!args?.name || !args?.email || !args?.message)
    return { text: "Missing required fields: name, email, message." };
  const res = await fetch(`${base}/api/contact`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(args),
  });
  const data = await res.json().catch(() => ({}));
  return {
    text: data?.ok
      ? "Inquiry sent to the Biztreck team — they'll reply by email."
      : `Could not send inquiry: ${data?.error || res.statusText}`,
  };
}

export const TOOLS: ToolDef[] = [
  {
    name: "search_blog",
    description:
      "Search Biztreck Solutions blog articles by keyword. Returns matching titles, excerpts and links.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Keyword(s) to search for" },
      },
    },
    run: searchBlogs,
  },
  {
    name: "get_blog",
    description:
      "Get the full Markdown content of one Biztreck blog article by its slug.",
    inputSchema: {
      type: "object",
      required: ["slug"],
      properties: { slug: { type: "string", description: "Blog post slug" } },
    },
    run: getBlog,
  },
  {
    name: "list_open_roles",
    description:
      "List current open job positions at Biztreck Solutions with location and type.",
    inputSchema: { type: "object", properties: {} },
    run: listJobs,
  },
  {
    name: "contact_biztreck",
    description:
      "Send a project or sales inquiry to Biztreck Solutions. Confirm details with the user before calling.",
    inputSchema: {
      type: "object",
      required: ["name", "email", "message"],
      properties: {
        name: { type: "string" },
        email: { type: "string" },
        message: { type: "string" },
        company: { type: "string" },
        phone: { type: "string" },
        service: { type: "string" },
        budget: { type: "string" },
      },
    },
    run: submitContact,
  },
];

export function findTool(name: string): ToolDef | undefined {
  return TOOLS.find((t) => t.name === name);
}

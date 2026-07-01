import { getDb } from "@/lib/mongodb";
import { SITE } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function md(body: string) {
  return new Response(body, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      vary: "Accept",
      "cache-control": "public, max-age=300, must-revalidate",
    },
  });
}

// Short Markdown stubs for the static marketing pages.
const STATIC_PAGES: Record<string, { title: string; body: string }> = {
  "/": {
    title: SITE.name,
    body: `${SITE.tagline}

Biztreck Solutions builds high-performance websites and apps, revamps existing
platforms, delivers DevOps, boosts SEO rankings and helps startups launch from
zero to one — from ${SITE.shortAddress}.

- About: ${SITE.url}/about
- Blog: ${SITE.url}/blog
- Careers: ${SITE.url}/careers
- Contact: ${SITE.email}`,
  },
  "/about": {
    title: `About ${SITE.name}`,
    body: `Biztreck Solutions is a software studio based in ${SITE.address}.
We design, build, deploy and scale digital products for modern businesses.

Email: ${SITE.email} · Phone: ${SITE.phone}`,
  },
  "/careers": {
    title: "Careers at Biztreck Solutions",
    body: `Open roles are available as JSON at ${SITE.url}/api/jobs.`,
  },
};

export async function GET(req: Request) {
  const path =
    req.headers.get("x-md-path") ||
    new URL(req.url).searchParams.get("path") ||
    "/";

  // Blog post → return the stored Markdown.
  if (path.startsWith("/blog/")) {
    const slug = decodeURIComponent(path.slice("/blog/".length)).replace(
      /\/$/,
      ""
    );
    if (slug) {
      try {
        const db = await getDb();
        const blog = await db
          .collection("blogs")
          .findOne({ slug, published: true });
        if (blog) {
          return md(`# ${blog.title}\n\n${blog.contentMarkdown || ""}`);
        }
      } catch {
        /* fall through to 404 below */
      }
    }
  }

  // Job listing → return the stored Markdown.
  if (path.startsWith("/careers/")) {
    const slug = decodeURIComponent(path.slice("/careers/".length)).replace(
      /\/$/,
      ""
    );
    if (slug) {
      try {
        const db = await getDb();
        const job = await db
          .collection("jobs")
          .findOne({ slug, active: { $ne: false } });
        if (job) {
          return md(`# ${job.title}\n\n${job.descriptionMarkdown || ""}`);
        }
      } catch {
        /* fall through */
      }
    }
  }

  // Static marketing page.
  const page = STATIC_PAGES[path.replace(/\/$/, "") || "/"];
  if (page) {
    return md(`# ${page.title}\n\n${page.body}\n`);
  }

  return new Response(`# Not found\n\nNo Markdown representation for ${path}.\n`, {
    status: 404,
    headers: { "content-type": "text/markdown; charset=utf-8", vary: "Accept" },
  });
}

import { getSkill } from "@/lib/agent-skills";

export const dynamic = "force-static";

// Serves an individual SKILL.md.
// Reached at /.well-known/agent-skills/{name}/SKILL.md via a rewrite.
export function generateStaticParams() {
  return [{ name: "content" }, { name: "contact" }];
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const skill = getSkill(name);
  if (!skill) {
    return new Response("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  return new Response(skill.markdown, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=3600, must-revalidate",
    },
  });
}

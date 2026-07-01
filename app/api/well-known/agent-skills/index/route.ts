import { createHash } from "node:crypto";
import { SITE } from "@/lib/site";
import { AGENT_SKILLS } from "@/lib/agent-skills";

export const dynamic = "force-static";
export const runtime = "nodejs";

// Agent Skills discovery index (Agent Skills Discovery RFC v0.2.0).
// Reached at /.well-known/agent-skills/index.json via a rewrite.
export function GET() {
  const base = SITE.url;
  const index = {
    $schema:
      "https://raw.githubusercontent.com/cloudflare/agent-skills-discovery-rfc/main/schema/index.schema.json",
    version: "0.2.0",
    skills: AGENT_SKILLS.map((s) => ({
      name: s.name,
      type: "skill-md" as const,
      description: s.description,
      url: `${base}/.well-known/agent-skills/${s.name}/SKILL.md`,
      sha256: createHash("sha256").update(s.markdown, "utf8").digest("hex"),
    })),
  };

  return new Response(JSON.stringify(index, null, 2), {
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=3600, must-revalidate",
    },
  });
}

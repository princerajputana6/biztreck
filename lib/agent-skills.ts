import { SITE } from "@/lib/site";

// Real, executable agent skills describing how to use Biztreck's public API.
// These document capabilities the site genuinely exposes — no fabricated
// endpoints. Both the discovery index and the per-skill SKILL.md routes import
// from here so the sha256 digests in the index always match the served bytes.

const base = SITE.url;

export type AgentSkill = {
  name: string;
  description: string;
  markdown: string;
};

export const AGENT_SKILLS: AgentSkill[] = [
  {
    name: "content",
    description:
      "Discover and read Biztreck blog articles and open job listings as JSON or Markdown.",
    markdown: `# Skill: Read Biztreck Content

Fetch ${SITE.name}'s published blog articles and open job listings.

## List blog posts
\`GET ${base}/api/blogs\`

Returns \`{ "ok": true, "blogs": [ ... ] }\`. Each blog has \`title\`, \`slug\`,
\`excerpt\`, \`category\`, \`tags\`, \`createdAt\`. The full article body is omitted
from the list response.

## Read one blog post (Markdown)
Request the human URL with an Accept header:
\`GET ${base}/blog/{slug}\` with header \`Accept: text/markdown\`

Returns the article as \`text/markdown\`. Without the header you get the normal
HTML page.

## List open roles
\`GET ${base}/api/jobs\`

Returns \`{ "ok": true, "jobs": [ ... ] }\` with \`title\`, \`slug\`, \`department\`,
\`location\`, \`type\`, \`experience\`, \`shortDescription\`.

## Notes
- All endpoints are public and require no authentication.
- Content usage preferences are declared in ${base}/robots.txt (Content-Signal).
`,
  },
  {
    name: "contact",
    description:
      "Submit a sales / project inquiry to Biztreck Solutions via the contact API.",
    markdown: `# Skill: Contact Biztreck Solutions

Submit a project or sales inquiry. This reaches the Biztreck team directly.

## Endpoint
\`POST ${base}/api/contact\`
Content-Type: \`application/json\`

## Body
| field    | required | description                                   |
|----------|----------|-----------------------------------------------|
| name     | yes      | Contact person's full name                    |
| email    | yes      | Reply-to email address                        |
| message  | yes      | What the inquirer needs                        |
| company  | no       | Company name                                  |
| phone    | no       | Phone number                                  |
| service  | no       | e.g. "Website", "App", "DevOps", "SEO"        |
| budget   | no       | Indicative budget range                        |

## Example
\`\`\`json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "company": "Analytical Engines",
  "service": "Website",
  "budget": "$5k-$10k",
  "message": "We need a marketing site rebuilt on Next.js."
}
\`\`\`

## Response
\`{ "ok": true }\` on success. Always confirm the human's intent before sending —
this delivers a real email to the Biztreck team.
`,
  },
];

export function getSkill(name: string): AgentSkill | undefined {
  return AGENT_SKILLS.find((s) => s.name === name);
}

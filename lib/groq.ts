// LLM helper — every model call in the app routes through OpenRouter's
// OpenAI-compatible API. Key: OPEN_ROUTE_API_KEY. Model: override with
// OPENROUTER_MODEL, otherwise a capable, cost-effective default.

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const apiKey = process.env.OPEN_ROUTE_API_KEY;
const MODEL = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct";

// A small, fast model for low-latency interactive work (the Shadow voice
// assistant's turn-by-turn planning). Speed matters far more than raw power for
// picking one tool from a short list, so we default to a fast, cheap model.
// Override with OPENROUTER_FAST_MODEL (e.g. "google/gemini-flash-1.5").
export const FAST_MODEL =
  process.env.OPENROUTER_FAST_MODEL || "openai/gpt-4o-mini";

/** The active model id, for provenance labels on generated content. */
export const LLM_MODEL = MODEL;

/** True when an OpenRouter key is configured — callers can pick a fallback. */
export function hasLLM(): boolean {
  return Boolean(apiKey);
}

// Models occasionally wrap JSON in prose or ``` fences; recover the raw object
// so downstream JSON.parse stays reliable across whatever model is configured.
function extractJson(text: string): string {
  let t = text.trim();
  const fence = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fence) t = fence[1].trim();
  if (t.startsWith("{") || t.startsWith("[")) return t;
  const starts = [t.indexOf("{"), t.indexOf("[")].filter((i) => i >= 0);
  if (!starts.length) return t;
  const start = Math.min(...starts);
  const end = Math.max(t.lastIndexOf("}"), t.lastIndexOf("]"));
  return end > start ? t.slice(start, end + 1) : t;
}

export async function complete(
  system: string,
  user: string,
  json = false,
  temperature = 0.75,
  model?: string
): Promise<string> {
  if (!apiKey) throw new Error("OPEN_ROUTE_API_KEY missing");

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 60_000);
  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Optional attribution headers OpenRouter surfaces in its dashboard.
        "HTTP-Referer": "https://www.biztreck.world",
        "X-Title": "Biztreck LeadOS",
      },
      body: JSON.stringify({
        model: model || MODEL,
        temperature,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        ...(json ? { response_format: { type: "json_object" as const } } : {}),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(
        `OpenRouter ${res.status}: ${detail.slice(0, 300) || res.statusText}`
      );
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content?.trim() ?? "";
    return json ? extractJson(content) : content;
  } finally {
    clearTimeout(timer);
  }
}

export type GeneratedBlog = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  readMinutes: number;
  coverPrompt: string;
  contentMarkdown: string;
};

export async function generateBlog(topic: string): Promise<GeneratedBlog> {
  const system = `You are the senior content strategist at Biztreck Solutions, a digital product studio in Greater Noida, India that builds websites, apps, runs DevOps and SEO for clients, and helps startups launch from zero.

Write practical, opinionated, well-structured blog posts. Sound human and confident — not like a generic SEO mill.

Always respond with valid JSON only, matching this exact schema:
{
  "title": string (max 80 chars, punchy),
  "slug": string (lowercase, hyphenated, url-safe, no spaces),
  "excerpt": string (~25-35 words, hooks the reader),
  "category": one of "Web Development" | "Design" | "DevOps" | "SEO" | "Startups" | "Mobile" | "Engineering",
  "tags": string[] (3-6 relevant tags),
  "readMinutes": integer (5-12),
  "coverPrompt": string (a vivid image generation prompt for the cover - mention modern tech, dark navy blue tones, glowing accents, abstract or futuristic),
  "contentMarkdown": string (a 900-1400 word blog post in markdown with: an engaging intro, 4-6 ## H2 sections, sub-bullets, occasional code blocks if relevant, and a conclusion. Do NOT include the H1 title in markdown — the title is rendered separately.)
}

Markdown rules: use ## for sections, ### for subsections, **bold**, lists, and \`inline code\`. Keep paragraphs tight (2-4 sentences).`;

  const user = `Write a complete blog post about: "${topic}"`;
  const raw = await complete(system, user, true);
  const parsed = JSON.parse(raw) as GeneratedBlog;
  parsed.slug = slugify(parsed.slug || parsed.title || `post-${Date.now()}`);
  return parsed;
}

export type GeneratedJob = {
  title: string;
  slug: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  salary: string;
  shortDescription: string;
  descriptionMarkdown: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  benefits: string[];
};

export type AnalyzedClientDocument = {
  brdSummary: string;
  milestones: {
    title: string;
    amount: number;
    dueDate: string;
    notes?: string;
  }[];
};

export async function analyzeClientDocument(
  documentText: string
): Promise<AnalyzedClientDocument> {
  const system = `You extract structured client onboarding data for Biztreck Solutions from combined BRD, proposal, scope, quotation, or milestone documents.

Return valid JSON only in this exact schema:
{
  "brdSummary": string,
  "milestones": [
    {
      "title": string,
      "amount": number,
      "dueDate": string,
      "notes": string
    }
  ]
}

Rules:
- brdSummary should capture business goals, scope, core modules, functional requirements, integrations, assumptions, and exclusions.
- milestones should contain payment/delivery milestones only.
- amount must be a plain number in INR when available; use 0 only if no amount is stated.
- dueDate must be YYYY-MM-DD when a clear date exists; otherwise "".
- Do not invent milestone prices or due dates.
- If the document has separate BRD and milestone sections, preserve that separation.
- If milestones are embedded inside paragraphs or tables, extract them cleanly.`;

  const user = `Analyze this client document and separate BRD requirements from milestones:\n\n${documentText.slice(0, 18000)}`;
  const raw = await complete(system, user, true);
  const parsed = JSON.parse(raw) as AnalyzedClientDocument;
  return {
    brdSummary: String(parsed.brdSummary || "").trim(),
    milestones: Array.isArray(parsed.milestones)
      ? parsed.milestones
          .map((m: any) => ({
            title: String(m?.title || "").trim(),
            amount: Number(m?.amount || 0),
            dueDate: String(m?.dueDate || "").trim(),
            notes: String(m?.notes || "").trim(),
          }))
          .filter((m) => m.title)
      : [],
  };
}

export async function generateJob(brief: {
  role: string;
  notes?: string;
  location?: string;
  type?: string;
  experience?: string;
}): Promise<GeneratedJob> {
  const system = `You are the head of recruiting at Biztreck Solutions (digital product studio in Greater Noida, India — building websites/apps, DevOps, SEO, and helping startups launch).

Generate a complete, attractive job posting from the brief. Sound human, specific, and exciting.

Respond with valid JSON only, matching this schema exactly:
{
  "title": string (clean job title),
  "slug": string (lowercase hyphenated url-safe),
  "department": string (e.g., "Engineering", "Design", "Growth", "Operations"),
  "location": string (default "Greater Noida, Delhi NCR (Hybrid)" if unspecified),
  "type": string ("Full-time" | "Part-time" | "Contract" | "Internship"),
  "experience": string (e.g., "2-4 years"),
  "salary": string (e.g., "₹6 - 12 LPA" — sensible Indian range based on role),
  "shortDescription": string (~30 words; hook for cards),
  "descriptionMarkdown": string (300-500 word "About the role" written in markdown with paragraphs and a section about Biztreck. Do NOT repeat title.),
  "responsibilities": string[] (5-8 specific bullets),
  "requirements": string[] (5-8 must-have bullets),
  "niceToHave": string[] (3-5 bullets),
  "benefits": string[] (5-7 perks — health, learning budget, hybrid, etc.)
}`;

  const user = `Role: ${brief.role}
${brief.location ? `Location: ${brief.location}\n` : ""}${brief.type ? `Type: ${brief.type}\n` : ""}${brief.experience ? `Experience: ${brief.experience}\n` : ""}${brief.notes ? `Additional notes: ${brief.notes}` : ""}`;

  const raw = await complete(system, user, true);
  const parsed = JSON.parse(raw) as GeneratedJob;
  parsed.slug = slugify(parsed.slug || parsed.title || `role-${Date.now()}`);
  return parsed;
}

export type OutreachLead = {
  title: string;
  categoryName?: string;
  city?: string;
  address?: string;
  website?: string;
};

export type GeneratedOutreach = { subject: string; body: string; whatsapp: string };

/**
 * Write a short, personalized cold-outreach email to a scraped business lead,
 * pitching either a new website ("build") or a redesign ("revamp").
 * `body` is returned as light markdown (short paragraphs, optional bullets).
 */
export async function generateOutreachEmail(
  lead: OutreachLead,
  opts: { angle: "build" | "revamp"; prototype?: boolean; senderName?: string }
): Promise<GeneratedOutreach> {
  const sender = opts.senderName || "The Biztreck Solutions team";
  const angleBrief =
    opts.angle === "revamp"
      ? `This business already has a website (${lead.website || "current site"}). Pitch a REVAMP/redesign: their site likely looks dated, is slow, not mobile-first, or converts poorly, and a modern rebuild would win more customers.`
      : `This business has no website (or only a social page). Pitch BUILDING a professional website from scratch so they stop losing customers to competitors who are easy to find and book online.`;
  const protoBrief = opts.prototype
    ? `We have built a custom prototype/mockup specifically for them. Reference it naturally and invite them to take a look — the email will include a button/link to it, so write a sentence that leads into that.`
    : `We have NOT built a prototype yet. Offer to create a free quick mockup/demo if they're interested. Do not claim a prototype already exists.`;

  const system = `You are a senior growth specialist at Biztreck Solutions, a digital product studio (Greater Noida, India) that builds and revamps websites, apps, DevOps, and SEO.

Write a warm, concise, human cold-outreach email to a local business. Rules:
- 90-150 words in the body. Short paragraphs (1-3 sentences). No fluff, no hype, no buzzword salad.
- Personalize using ONLY the facts given (business name, category, city). Never invent details, awards, reviews, or specifics you weren't given.
- Lead with a specific, relevant observation about their type of business and how a great/redesigned website helps them get more customers.
- One clear, low-friction call to action. Friendly, not pushy or salesy. Avoid spammy words ("guarantee", "act now", "limited offer", excessive capitals/exclamations).
- Sign off as "${sender}".
- Do NOT include the recipient email, your signature block with phone/address (that is added separately), or a subject line inside the body.

Respond with valid JSON only:
{
  "subject": string (max 60 chars, specific and non-spammy, references their business or city),
  "body": string (markdown: short paragraphs; you MAY use one short bullet list of 2-3 concrete benefits),
  "whatsapp": string (a SHORT WhatsApp version, 2-3 sentences max, ~300 chars, friendly and casual, first-name-basis tone, no markdown, no subject line. Do NOT paste a link — a prototype link is appended separately.)
}`;

  const user = `Business: ${lead.title}
Category: ${lead.categoryName || "local business"}
City: ${lead.city || ""}
Address: ${lead.address || ""}
Website: ${lead.website || "(none found)"}

Pitch angle: ${opts.angle.toUpperCase()}
${angleBrief}
${protoBrief}

Write the outreach email now.`;

  const raw = await complete(system, user, true);
  const parsed = JSON.parse(raw) as GeneratedOutreach;
  return {
    subject: String(parsed.subject || `A quick idea for ${lead.title}`).trim().slice(0, 120),
    body: String(parsed.body || "").trim(),
    whatsapp: String(parsed.whatsapp || "").trim(),
  };
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function coverImageUrl(prompt: string) {
  const enc = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${enc}?width=1200&height=630&nologo=true&enhance=true`;
}

export type RoleBrief = {
  role: string;
  notes?: string;
  location?: string;
  type?: string;
  experience?: string;
};

/**
 * Ask the model to propose N in-demand role briefs Biztreck should be hiring
 * for right now. Each brief feeds into `generateJob()` to expand into a full
 * job description.
 */
export async function generateInDemandRoles(
  count: number,
  existingTitles: string[] = []
): Promise<RoleBrief[]> {
  const recents = existingTitles
    .slice(0, 40)
    .map((t, i) => `${i + 1}. ${t}`)
    .join("\n");

  const system = `You are the head of recruiting at Biztreck Solutions, a digital product studio in Greater Noida, India that builds websites, apps, runs DevOps and SEO for clients, and helps startups launch.

Propose ${count} in-demand role briefs that Biztreck should consider hiring for RIGHT NOW based on current 2026 hiring trends in Indian product studios. Roles should:
- Span multiple disciplines (engineering, design, growth, operations) — don't propose 5 of the same role.
- Reflect real, currently-hot skill sets (e.g. "Senior React Native Engineer", "Technical SEO Lead", "Platform Engineer", "AI Engineer (LLM Apps)", "Product Designer (B2B SaaS)").
- Be distinct from any role already open at Biztreck (see list below).
- Be realistic for a senior-staffed Indian product studio — no exec or C-suite roles.

Roles ALREADY open (do NOT repeat or paraphrase):
${recents || "(none)"}

Respond with valid JSON ONLY in this exact shape:
{
  "roles": [
    {
      "role": string,        // clean role title
      "notes": string,       // 1-2 sentence brief on what makes this role distinct
      "location": string,    // "Greater Noida, Delhi NCR (Hybrid)" or "Remote, India" etc
      "type": string,        // "Full-time" | "Contract" | "Internship"
      "experience": string   // e.g. "3-6 years"
    }
  ]
}
Exactly ${count} roles. No commentary outside the JSON.`;

  const user = `Propose ${count} fresh, distinct role briefs to publish today.`;
  const raw = await complete(system, user, true);
  const parsed = JSON.parse(raw) as { roles?: RoleBrief[] };
  const arr = Array.isArray(parsed.roles) ? parsed.roles : [];
  return arr
    .filter((r) => r && typeof r.role === "string" && r.role.trim().length > 0)
    .slice(0, count);
}

/**
 * Ask the model to propose N timely blog topics for Biztreck's audience,
 * informed by the current date and a list of recent titles to avoid duplication.
 */
export async function generateTrendingTopics(
  count: number,
  recentTitles: string[] = []
): Promise<string[]> {
  const today = new Date().toISOString().slice(0, 10);
  const recents = recentTitles
    .slice(0, 60)
    .map((t, i) => `${i + 1}. ${t}`)
    .join("\n");

  const system = `You are the senior content strategist at Biztreck Solutions, a digital product studio in Greater Noida, India that builds websites, apps, runs DevOps and SEO for clients, and helps startups launch from zero.

Your job: propose ${count} fresh, timely blog topics that an experienced founder, CTO, or marketing lead would actually want to read RIGHT NOW. Topics must be:
- Specific (not "SEO tips" — instead "How Google's AI Overviews changed e-commerce SEO in 2026").
- Tied to current trends, recent releases, or evergreen-but-underdiscussed angles in: web development (Next.js / React), mobile (React Native / Flutter), DevOps (k8s / AWS / CI-CD / observability), SEO & content, startups & product, design systems, AI/LLMs in production.
- Distinct from any topic already covered (see list below).
- Written with a hook a sophisticated reader would click on.

Today's date is ${today}.

${recents ? `Topics ALREADY published (do NOT repeat or paraphrase any of these):\n${recents}\n` : ""}

Respond with valid JSON ONLY in this exact shape:
{ "topics": [string, string, ...] }
Exactly ${count} topics. No commentary outside the JSON.`;

  const user = `Propose ${count} fresh, distinct blog topics for today.`;
  const raw = await complete(system, user, true);
  const parsed = JSON.parse(raw) as { topics?: string[] };
  const arr = Array.isArray(parsed.topics) ? parsed.topics : [];
  return arr
    .filter((t) => typeof t === "string" && t.trim().length > 0)
    .slice(0, count);
}

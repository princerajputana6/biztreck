import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;

let _groq: Groq | null = null;
function getGroq() {
  if (!apiKey) throw new Error("GROQ_API_KEY missing");
  if (!_groq) _groq = new Groq({ apiKey });
  return _groq;
}

const MODEL = "llama-3.3-70b-versatile";

async function complete(system: string, user: string, json = false) {
  const groq = getGroq();
  const res = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.75,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    ...(json ? { response_format: { type: "json_object" as const } } : {}),
  });
  return res.choices?.[0]?.message?.content?.trim() ?? "";
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
  if (!parsed.slug) parsed.slug = slugify(parsed.title);
  parsed.slug = slugify(parsed.slug);
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
  if (!parsed.slug) parsed.slug = slugify(parsed.title);
  parsed.slug = slugify(parsed.slug);
  return parsed;
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

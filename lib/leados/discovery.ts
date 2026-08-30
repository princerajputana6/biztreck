// LeadOS Phase 5 — decision-maker discovery.
//
// Finds a real named person (founder / CEO / owner) from the lead's OWN website
// — the home page plus a couple of likely About/Team pages. We only read pages
// the business publishes about itself; no LinkedIn or social-platform scraping,
// no third-party people-search API. When no name is confidently found we return
// nothing rather than guessing — a fabricated founder is worse than a blank.

const UA = "Mozilla/5.0 (compatible; BiztreckLeadOS/1.0; +https://www.biztreck.world)";

const ROLE_WORDS =
  "founder|co-?founder|owner|ceo|chief executive|managing director|president|principal|proprietor|director";
const ROLE_RE = new RegExp(`\\b(${ROLE_WORDS})\\b`, "i");

// A person's name: 2–3 capitalized tokens, each allowing an apostrophe,
// hyphen, dot or accent inside (O'Brien, Jean-Luc, A. Khan, José).
const NAME = "[A-ZÀ-Þ][A-Za-zÀ-ÿ'’.\\-]+(?:\\s+[A-ZÀ-Þ][A-Za-zÀ-ÿ'’.\\-]+){1,2}";

// "Jane Doe, Founder" / "Jane Doe — CEO" / "Jane Doe Founder" (tags → space).
// NAME stays case-sensitive (so a lowercase word can't pose as a name); only the
// role is matched case-insensitively via an inline flag group.
const NAME_THEN_ROLE = new RegExp(`(${NAME})\\s*[,–—\\-|()]{0,3}\\s*(?:is\\s+|the\\s+)?((?i:${ROLE_WORDS}))\\b`, "");
// "Founder: Jane Doe" / "CEO — Jane Doe" / "our founder, Jane Doe"
const ROLE_THEN_NAME = new RegExp(`(${ROLE_WORDS})\\s*(?:&\\s*[a-z ]+)?[,:–—\\-|]{1,3}\\s*(${NAME})`, "i");

const NON_NAMES = /\b(About|Our Team|Meet The|Contact Us|Privacy Policy|Terms|Home Page|Get Started|Learn More|Read More|Sign Up|Log In)\b/i;

async function fetchText(url: string, ms: number): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "user-agent": UA, accept: "text/html,*/*" },
    });
    if (!res.ok) return "";
    return await res.text();
  } catch {
    return "";
  } finally {
    clearTimeout(timer);
  }
}

/** Collapse HTML to readable text so names/roles that span tags still match. */
function toText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(role: string): string {
  const r = role.toLowerCase();
  if (r === "ceo") return "CEO";
  if (r === "co-founder" || r === "cofounder") return "Co-Founder";
  return role.replace(/\b\w/g, (c) => c.toUpperCase());
}

function findPerson(text: string): { founderName: string; decisionMakerTitle: string } | null {
  for (const re of [NAME_THEN_ROLE, ROLE_THEN_NAME]) {
    const m = text.match(re);
    if (!m) continue;
    const isNameFirst = re === NAME_THEN_ROLE;
    const name = (isNameFirst ? m[1] : m[2] || "").trim();
    const role = (isNameFirst ? m[2] : m[1] || "").trim();
    if (!name || NON_NAMES.test(name) || name.split(/\s+/).length < 2) continue;
    return { founderName: name, decisionMakerTitle: titleCase(role) };
  }
  return null;
}

export type DecisionMaker = { founderName?: string; decisionMakerTitle?: string };

/**
 * Best-effort decision-maker lookup from the lead's own site.
 * `homeHtml` is the already-fetched home page (avoids a re-fetch); we then try a
 * small set of About/Team paths only if the home page yields nothing.
 */
export async function discoverDecisionMaker(
  finalUrl: string,
  homeHtml?: string
): Promise<DecisionMaker> {
  if (homeHtml) {
    const hit = findPerson(toText(homeHtml));
    if (hit) return hit;
  }
  let origin: string;
  try {
    origin = new URL(finalUrl).origin;
  } catch {
    return {};
  }
  // Common About/Team page paths, fetched in parallel so a lead with no team
  // page costs one ~4s round-trip, not six sequential timeouts. Results are
  // scanned in likelihood order.
  const paths = ["/about", "/about-us", "/team", "/our-team"];
  const pages = await Promise.all(paths.map((path) => fetchText(origin + path, 4000)));
  for (const html of pages) {
    if (!html) continue;
    const hit = findPerson(toText(html));
    if (hit) return hit;
  }
  return {};
}

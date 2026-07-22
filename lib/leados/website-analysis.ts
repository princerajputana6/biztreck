// LeadOS Module 3 — website analysis.
//
// Fetches a lead's homepage plus /robots.txt and /sitemap.xml, then derives the
// signals that tell us whether there is a sellable problem: no HTTPS, no mobile
// viewport, missing SEO basics, no contact path, no chat, dated stack, slow
// response. Everything is inferred from the HTML we actually receive — no
// third-party API, so it runs at zero marginal cost.

import type { WebsiteAnalysis } from "./types";

const UA =
  "Mozilla/5.0 (compatible; BiztreckLeadOS/1.0; +https://www.biztreck.world)";

const SECURITY_HEADERS = [
  "strict-transport-security",
  "content-security-policy",
  "x-content-type-options",
  "x-frame-options",
  "referrer-policy",
];

function normaliseUrl(input: string): string | null {
  const raw = (input || "").trim();
  if (!raw) return null;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const u = new URL(withScheme);
    if (!u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

async function fetchWithTimeout(url: string, ms: number, method = "GET") {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, {
      method,
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "user-agent": UA, accept: "text/html,*/*" },
    });
  } finally {
    clearTimeout(timer);
  }
}

const has = (html: string, ...needles: string[]) =>
  needles.some((n) => html.includes(n));

function attr(html: string, re: RegExp): string {
  const m = html.match(re);
  return m ? (m[1] || "").trim() : "";
}

function detectCms(html: string, headers: Headers): string {
  const powered = (headers.get("x-powered-by") || "").toLowerCase();
  const gen = attr(
    html,
    /<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)["']/i
  ).toLowerCase();

  if (gen.includes("wordpress") || has(html, "/wp-content/", "/wp-includes/"))
    return "WordPress";
  if (gen.includes("wix") || has(html, "wix.com", "wixstatic.com")) return "Wix";
  if (has(html, "cdn.shopify.com", "shopify.com")) return "Shopify";
  if (gen.includes("squarespace") || has(html, "squarespace.com"))
    return "Squarespace";
  if (gen.includes("joomla")) return "Joomla";
  if (gen.includes("drupal") || has(html, "/sites/default/files/"))
    return "Drupal";
  if (has(html, "webflow.com", "wf-domain")) return "Webflow";
  if (has(html, "godaddy.com/websites", "/website-builder/")) return "GoDaddy";
  if (powered.includes("php")) return "PHP (custom)";
  return "";
}

function detectFramework(html: string): string {
  if (has(html, "/_next/", "__NEXT_DATA__")) return "Next.js";
  if (has(html, "/_nuxt/", "__NUXT__")) return "Nuxt";
  if (has(html, "data-reactroot", "react-dom")) return "React";
  if (has(html, "ng-version", "angular")) return "Angular";
  if (has(html, "__svelte", "svelte-")) return "Svelte";
  if (has(html, "gatsby-", "___gatsby")) return "Gatsby";
  return "";
}

/**
 * Score is a deduction model from 100 — every missing fundamental costs points.
 * A low score is a sales signal, not a judgement of the business.
 */
function scoreAnalysis(a: WebsiteAnalysis): { score: number; issues: string[] } {
  let score = 100;
  const issues: string[] = [];
  const hit = (points: number, issue: string) => {
    score -= points;
    issues.push(issue);
  };

  if (!a.reachable) return { score: 0, issues: ["Website is unreachable"] };

  if (!a.https) hit(20, "No HTTPS — browsers flag the site as not secure");
  if (!a.viewportMeta) hit(15, "No mobile viewport — site is not responsive");
  if (a.responseMs != null && a.responseMs > 3000)
    hit(15, `Very slow response (${(a.responseMs / 1000).toFixed(1)}s)`);
  else if (a.responseMs != null && a.responseMs > 1500)
    hit(8, `Slow response (${(a.responseMs / 1000).toFixed(1)}s)`);

  if (!a.title) hit(10, "Missing page title");
  else if (a.titleLength < 20 || a.titleLength > 65)
    hit(3, "Page title length is not SEO-optimal");

  if (!a.metaDescription) hit(8, "Missing meta description");
  if (!a.h1Count) hit(6, "No H1 heading");
  if (!a.canonical) hit(3, "No canonical URL");
  if (!a.schema) hit(6, "No structured data (schema.org)");
  if (!a.openGraph) hit(4, "No Open Graph tags — poor link previews");
  if (!a.favicon) hit(2, "No favicon");

  if (!a.sitemap) hit(5, "No sitemap.xml");
  if (!a.robotsTxt) hit(3, "No robots.txt");

  if (!a.contactForm && !a.emailLink && !a.phoneLink)
    hit(12, "No visible way to make contact");
  else if (!a.contactForm) hit(5, "No contact form");

  if (!a.chatWidget) hit(4, "No chat widget — enquiries wait for email");
  if (!a.bookingSystem) hit(3, "No online booking");
  if (!a.analytics) hit(5, "No analytics installed — no visibility of traffic");

  if (a.securityHeaders.length === 0)
    hit(6, "No security headers configured");
  else if (a.missingSecurityHeaders.length >= 3)
    hit(3, "Most security headers missing");

  if (a.imagesMissingAlt > 5)
    hit(4, `${a.imagesMissingAlt} images missing alt text (accessibility)`);

  if (a.pageBytes != null && a.pageBytes > 900_000)
    hit(5, "Very heavy page payload");

  const dated = ["Wix", "GoDaddy", "Joomla"];
  if (dated.includes(a.cms)) hit(6, `Built on ${a.cms} — limited scalability`);

  return { score: Math.max(0, Math.min(100, Math.round(score))), issues };
}

export async function analyzeWebsite(
  websiteInput: string
): Promise<WebsiteAnalysis> {
  const now = new Date().toISOString();

  const base: WebsiteAnalysis = {
    checkedAt: now,
    reachable: false,
    finalUrl: "",
    statusCode: null,
    responseMs: null,
    https: false,
    validSsl: false,
    securityHeaders: [],
    missingSecurityHeaders: [...SECURITY_HEADERS],
    responsive: false,
    viewportMeta: false,
    title: "",
    titleLength: 0,
    metaDescription: "",
    metaDescriptionLength: 0,
    h1: "",
    h1Count: 0,
    canonical: false,
    openGraph: false,
    schema: false,
    favicon: false,
    language: "",
    sitemap: false,
    robotsTxt: false,
    contactForm: false,
    bookingSystem: false,
    chatWidget: false,
    analytics: false,
    cookieBanner: false,
    phoneLink: false,
    emailLink: false,
    cms: "",
    framework: "",
    technologies: [],
    pageBytes: null,
    imageCount: 0,
    imagesMissingAlt: 0,
    score: 0,
    issues: [],
  };

  const url = normaliseUrl(websiteInput);
  if (!url) {
    return {
      ...base,
      score: 0,
      issues: ["No website"],
      error: "No usable website URL",
    };
  }

  let res: Response;
  const started = Date.now();
  try {
    res = await fetchWithTimeout(url, 12_000);
  } catch (err: any) {
    // Retry once over http:// — plenty of small businesses still have no TLS.
    try {
      const httpUrl = url.replace(/^https:/, "http:");
      res = await fetchWithTimeout(httpUrl, 10_000);
    } catch {
      return {
        ...base,
        score: 0,
        issues: ["Website is unreachable"],
        error: err?.message || "fetch failed",
      };
    }
  }

  const responseMs = Date.now() - started;
  const finalUrl = res.url || url;
  const html = (await res.text().catch(() => "")) || "";
  const lower = html.toLowerCase();

  const presentSecurity = SECURITY_HEADERS.filter((h) => res.headers.has(h));

  const imgTags = html.match(/<img\b[^>]*>/gi) || [];
  const imagesMissingAlt = imgTags.filter(
    (t) => !/\balt\s*=\s*["'][^"']+["']/i.test(t)
  ).length;

  const cms = detectCms(html, res.headers);
  const framework = detectFramework(html);

  const analysis: WebsiteAnalysis = {
    ...base,
    reachable: res.ok || res.status < 500,
    finalUrl,
    statusCode: res.status,
    responseMs,

    https: finalUrl.startsWith("https://"),
    validSsl: finalUrl.startsWith("https://"),
    securityHeaders: presentSecurity,
    missingSecurityHeaders: SECURITY_HEADERS.filter((h) => !res.headers.has(h)),

    viewportMeta: /<meta[^>]+name=["']viewport["']/i.test(html),
    responsive:
      /<meta[^>]+name=["']viewport["']/i.test(html) &&
      has(lower, "@media", "max-width"),

    title: attr(html, /<title[^>]*>([\s\S]*?)<\/title>/i).slice(0, 200),
    metaDescription: attr(
      html,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i
    ).slice(0, 400),
    h1: attr(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i)
      .replace(/<[^>]+>/g, "")
      .slice(0, 200),
    h1Count: (html.match(/<h1\b/gi) || []).length,
    canonical: /<link[^>]+rel=["']canonical["']/i.test(html),
    openGraph: /<meta[^>]+property=["']og:/i.test(html),
    schema:
      has(lower, "application/ld+json") || has(lower, "itemtype=\"http://schema.org"),
    favicon: /<link[^>]+rel=["'][^"']*icon[^"']*["']/i.test(html),
    language: attr(html, /<html[^>]+lang=["']([^"']+)["']/i),

    contactForm:
      /<form\b/i.test(html) &&
      has(lower, "email", "name=", "contact", "message"),
    bookingSystem: has(
      lower,
      "calendly",
      "acuityscheduling",
      "book now",
      "booking",
      "appointment",
      "setmore",
      "squareup.com/appointments"
    ),
    chatWidget: has(
      lower,
      "tawk.to",
      "intercom",
      "drift.com",
      "crisp.chat",
      "livechat",
      "zendesk",
      "hubspot-messages",
      "tidio",
      "freshchat",
      "whatsapp.com/send"
    ),
    analytics: has(
      lower,
      "googletagmanager.com",
      "google-analytics.com",
      "gtag(",
      "plausible.io",
      "posthog",
      "matomo",
      "clarity.ms",
      "segment.com"
    ),
    cookieBanner: has(
      lower,
      "cookieconsent",
      "cookiebot",
      "onetrust",
      "cookie policy",
      "accept cookies"
    ),
    phoneLink: /href=["']tel:/i.test(html),
    emailLink: /href=["']mailto:/i.test(html),

    cms,
    framework,
    technologies: [cms, framework].filter(Boolean),

    pageBytes: html.length || null,
    imageCount: imgTags.length,
    imagesMissingAlt,
  };

  analysis.titleLength = analysis.title.length;
  analysis.metaDescriptionLength = analysis.metaDescription.length;

  // robots.txt / sitemap.xml — cheap HEAD checks, failures are simply "absent".
  try {
    const origin = new URL(finalUrl).origin;
    const [robots, sitemap] = await Promise.all([
      fetchWithTimeout(`${origin}/robots.txt`, 6_000, "HEAD")
        .then((r) => r.ok)
        .catch(() => false),
      fetchWithTimeout(`${origin}/sitemap.xml`, 6_000, "HEAD")
        .then((r) => r.ok)
        .catch(() => false),
    ]);
    analysis.robotsTxt = robots;
    analysis.sitemap = sitemap;
  } catch {
    /* leave both false */
  }

  const { score, issues } = scoreAnalysis(analysis);
  analysis.score = score;
  analysis.issues = issues;
  return analysis;
}

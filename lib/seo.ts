import { SITE } from "@/lib/site";

export type Crumb = { name: string; path: string };

// Canonical + social-safe alternates for a route. Use inside metadata so every
// page declares its own canonical (never inherit the homepage one).
export function pageAlternates(path: string) {
  return { canonical: path };
}

// schema.org BreadcrumbList. The first item is always the homepage.
export function breadcrumbJsonLd(trail: Crumb[]) {
  const items = [{ name: "Home", path: "/" }, ...trail];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE.url}${c.path === "/" ? "" : c.path}`,
    })),
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

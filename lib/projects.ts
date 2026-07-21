// Portfolio projects, categorised by the solution type they demonstrate so the
// homepage tabs and the /portfolio category pages stay in sync with /solutions.

export type Project = {
  name: string;
  slug: string;
  /** Matches a slug in lib/solutions.ts */
  category: string;
  tagline: string;
  description: string;
  logo?: string;
  tags: string[];
  status: string;
  url: string;
  accent: string;
  accentSoft: string;
  glow: string;
};

export const PROJECTS: Project[] = [
  {
    name: "Atithira",
    slug: "atithira",
    category: "erp-development",
    tagline: "Full-fledged ERP for restaurants & hotels",
    description:
      "QR table ordering, kitchen management, billing, inventory, staff and analytics in one operational platform — replacing four disconnected tools.",
    logo: "/assets/brands/atithira.jpeg",
    tags: ["Restaurant ERP", "Inventory", "QR ordering"],
    status: "Live",
    url: "https://atithira.vercel.app",
    accent: "from-cyan-400 to-emerald-500",
    accentSoft: "rgba(34, 211, 238, 0.18)",
    glow: "rgba(34, 211, 238, 0.45)",
  },
  {
    name: "REP",
    slug: "rep",
    category: "erp-development",
    tagline: "Resource planning, reimagined",
    description:
      "Resource and capacity planning with allocation, utilisation tracking and forecasting for services businesses.",
    tags: ["Resource planning", "B2B SaaS", "Dashboards"],
    status: "Live",
    url: "https://biztreck.world",
    accent: "from-blue-400 to-indigo-500",
    accentSoft: "rgba(96, 165, 250, 0.18)",
    glow: "rgba(96, 165, 250, 0.45)",
  },
  {
    name: "Rezulaizer",
    slug: "rezulaizer",
    category: "ai-automation",
    tagline: "Hire smarter with AI intelligence",
    description:
      "AI resume parsing, intelligent candidate matching and automated assessments — screening that took two days now takes minutes.",
    logo: "/assets/brands/rezulaizer.png",
    tags: ["AI / ML", "Document processing", "HR Tech"],
    status: "Live",
    url: "https://rezulaizer.com",
    accent: "from-violet-400 to-fuchsia-500",
    accentSoft: "rgba(167, 139, 250, 0.18)",
    glow: "rgba(167, 139, 250, 0.45)",
  },
  {
    name: "KuddlKin",
    slug: "kuddlkin",
    category: "custom-software",
    tagline: "Premium childcare at your doorstep",
    description:
      "A two-sided marketplace connecting parents with verified childcare professionals, with identity verification, booking and payments built in.",
    logo: "/assets/brands/kuddl-kin.svg",
    tags: ["Marketplace", "Booking", "Verification"],
    status: "Live",
    url: "https://kuddl.co/",
    accent: "from-pink-400 to-rose-500",
    accentSoft: "rgba(244, 114, 182, 0.18)",
    glow: "rgba(244, 114, 182, 0.45)",
  },
  {
    name: "Buildifai",
    slug: "buildifai",
    category: "custom-software",
    tagline: "Construction materials & builders in one place",
    description:
      "Buy construction materials online and book trusted builders — ordering, logistics and contractor management on a single platform.",
    logo: "/assets/brands/buildify-logo.png",
    tags: ["Marketplace", "Construction", "Logistics"],
    status: "Live",
    url: "https://buildifai.vercel.app",
    accent: "from-amber-400 to-orange-500",
    accentSoft: "rgba(251, 146, 60, 0.18)",
    glow: "rgba(251, 146, 60, 0.45)",
  },
  {
    name: "SafarMates",
    slug: "safarmates",
    category: "custom-software",
    tagline: "Ride beyond the horizon",
    description:
      "A travel community platform for discovering rides, planning journeys and connecting riders across regions.",
    tags: ["Community", "Travel", "Mobile"],
    status: "Live",
    url: "https://biztreck.world",
    accent: "from-emerald-400 to-cyan-500",
    accentSoft: "rgba(52, 211, 153, 0.18)",
    glow: "rgba(52, 211, 153, 0.45)",
  },
  {
    name: "TryLinqr",
    slug: "trylinqr",
    category: "customer-portals",
    tagline: "Discover and book premium events",
    description:
      "An event ecosystem with discovery, ticketing and self-service booking — customers book in under two minutes without contacting support.",
    logo: "/assets/brands/trylinqr.webp",
    tags: ["Ticketing", "Self-service", "Payments"],
    status: "Live",
    url: "https://trylinqr.com",
    accent: "from-fuchsia-400 to-pink-500",
    accentSoft: "rgba(232, 121, 249, 0.18)",
    glow: "rgba(232, 121, 249, 0.45)",
  },
  {
    name: "BookMyGuide",
    slug: "bookmyguide",
    category: "customer-portals",
    tagline: "Book verified local guides",
    description:
      "A booking portal connecting travellers with verified local guides, handling availability, booking and payment end to end.",
    tags: ["Booking portal", "Marketplace", "Payments"],
    status: "Live",
    url: "https://biztreck.world",
    accent: "from-sky-400 to-blue-500",
    accentSoft: "rgba(56, 189, 248, 0.18)",
    glow: "rgba(56, 189, 248, 0.45)",
  },
  {
    name: "Angels & Roadsters",
    slug: "angels-and-roadsters",
    category: "website-development",
    tagline: "India's first gender-equal bike club",
    description:
      "A high-performance community website for a 26,000-member club — events, rides and the flagship Trailstorm festival.",
    logo: "/assets/brands/angeles-roadsters.png",
    tags: ["Community site", "Events", "SEO"],
    status: "Live",
    url: "https://angelsandroadsters.com",
    accent: "from-orange-400 to-amber-500",
    accentSoft: "rgba(251, 146, 60, 0.18)",
    glow: "rgba(251, 146, 60, 0.45)",
  },
];

/** Category labels shown on tabs — keyed by solution slug. */
export const PROJECT_CATEGORY_LABELS: Record<string, string> = {
  "custom-software": "Custom Software",
  "ai-automation": "AI Automation",
  "business-automation": "Business Automation",
  "crm-development": "CRM",
  "erp-development": "ERP",
  "customer-portals": "Customer Portals",
  "vendor-portals": "Vendor Portals",
  "dashboard-development": "Dashboards",
  "website-development": "Websites",
};

/** Only categories that actually have projects, in a stable display order. */
export function projectCategories() {
  const order = Object.keys(PROJECT_CATEGORY_LABELS);
  const present = new Set(PROJECTS.map((p) => p.category));
  return order
    .filter((slug) => present.has(slug))
    .map((slug) => ({
      slug,
      label: PROJECT_CATEGORY_LABELS[slug] ?? slug,
      count: PROJECTS.filter((p) => p.category === slug).length,
    }));
}

export function projectsByCategory(slug?: string) {
  if (!slug || slug === "all") return PROJECTS;
  return PROJECTS.filter((p) => p.category === slug);
}

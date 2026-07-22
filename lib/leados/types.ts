// LeadOS — core domain types.
//
// A Lead is the unit of work: a business we may sell to. It accumulates data in
// layers — scraped identity, website analysis, business intelligence, AI
// opportunity detection, scores — each written by a different pipeline stage.

export const TARGET_COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "New Zealand",
  "Singapore",
  "United Arab Emirates",
] as const;

export const TARGET_INDUSTRIES = [
  "Construction",
  "Healthcare",
  "Manufacturing",
  "Finance",
  "Real Estate",
  "Law Firms",
  "Recruitment",
  "Education",
  "Hospitality",
  "Professional Services",
  "Logistics",
] as const;

/** Services Biztreck can sell, used by AI opportunity detection (Module 5). */
export const SELLABLE_SERVICES = [
  "Website Redesign",
  "SEO",
  "CRM",
  "ERP",
  "Customer Portal",
  "Vendor Portal",
  "Inventory System",
  "Booking System",
  "HRMS",
  "Dashboard",
  "Mobile App",
  "AI Chatbot",
  "AI Customer Support",
  "Workflow Automation",
  "Document Automation",
  "API Integration",
  "Cloud Migration",
  "Legacy Modernization",
] as const;

export type SellableService = (typeof SELLABLE_SERVICES)[number];

export type Priority = "hot" | "warm" | "cold" | "ignore";

export const PIPELINE_STAGES = [
  "new",
  "qualified",
  "audit_generated",
  "email_sent",
  "replied",
  "meeting_scheduled",
  "proposal",
  "won",
  "lost",
  "follow_up",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export const STAGE_LABELS: Record<PipelineStage, string> = {
  new: "New lead",
  qualified: "Qualified",
  audit_generated: "Audit generated",
  email_sent: "Email sent",
  replied: "Replied",
  meeting_scheduled: "Meeting scheduled",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
  follow_up: "Follow-up",
};

/** Module 3 — website analysis result. */
export type WebsiteAnalysis = {
  checkedAt: string;
  reachable: boolean;
  finalUrl: string;
  statusCode: number | null;
  /** ms to first byte for the document request */
  responseMs: number | null;

  https: boolean;
  validSsl: boolean;
  securityHeaders: string[];
  missingSecurityHeaders: string[];

  responsive: boolean;
  viewportMeta: boolean;

  title: string;
  titleLength: number;
  metaDescription: string;
  metaDescriptionLength: number;
  h1: string;
  h1Count: number;
  canonical: boolean;
  openGraph: boolean;
  schema: boolean;
  favicon: boolean;
  language: string;

  sitemap: boolean;
  robotsTxt: boolean;

  contactForm: boolean;
  bookingSystem: boolean;
  chatWidget: boolean;
  analytics: boolean;
  cookieBanner: boolean;
  phoneLink: boolean;
  emailLink: boolean;

  cms: string;
  framework: string;
  technologies: string[];

  pageBytes: number | null;
  imageCount: number;
  imagesMissingAlt: number;

  /** 0–100 composite of everything above. */
  score: number;
  /** Human-readable issues, ordered most severe first. */
  issues: string[];
  error?: string;
};

/** Module 4 — business intelligence. */
export type BusinessIntel = {
  estimatedEmployees: string;
  estimatedRevenueBand: string;
  industry: string;
  growthStage: string;
  multipleLocations: boolean;
  hiringActivity: boolean;
  technologyMaturity: "low" | "medium" | "high" | "unknown";
  digitalMaturity: "low" | "medium" | "high" | "unknown";
  likelyDecisionMakers: string[];
  businessComplexity: "low" | "medium" | "high" | "unknown";
};

/** Module 5 — a single AI-detected opportunity. */
export type Opportunity = {
  service: SellableService | string;
  confidence: number; // 0–100
  rationale: string;
};

/** Module 6 — the four independent scores plus the derived priority. */
export type LeadScores = {
  website: number;
  software: number;
  ai: number;
  quality: number;
  priority: Priority;
  /** Weighted 0–100 used for ranking. */
  overall: number;
  signals: string[];
};

/** Module 7 — a single section of the generated business audit. */
export type AuditSection = {
  /** e.g. "Website Analysis", "SEO Analysis", "AI Opportunities". */
  title: string;
  /** 2–4 sentence narrative grounded in the lead's real analysis data. */
  summary: string;
  /** Specific, concrete findings or recommendations. */
  points: string[];
};

/** Module 7 — the full AI business audit report. */
export type LeadAudit = {
  generatedAt: string;
  /** "groq:<model>" when AI-written, "rules" when assembled deterministically. */
  source: string;
  /** One-line hook for the report header. */
  headline: string;
  executiveSummary: string;
  /** Ordered: website, seo, performance, security, ux, conversion, ai,
   *  automation, custom software. Rendered generically. */
  sections: AuditSection[];
  estimatedRoi: string;
  nextSteps: string[];
  callToAction: string;
  /** Mirrors the website analysis score at generation time, for the header. */
  websiteScore: number;
  priority: Priority;
};

/** Module 8 — a single email variant. Body is markdown. */
export type OutreachEmail = { subject: string; body: string };

/** Module 8 — the full AI outreach kit, grounded in the lead's audit. */
export type LeadOutreach = {
  generatedAt: string;
  /** "openrouter:<model>" when AI-written, "rules" when assembled. */
  source: string;
  coldEmail: OutreachEmail;
  followUp1: OutreachEmail;
  followUp2: OutreachEmail;
  /** Short LinkedIn connection / message note. */
  linkedin: string;
  /** Opening lines for a discovery call. */
  discoveryOpener: string;
  /** Tight proposal summary the salesperson can paste into a doc. */
  proposalSummary: string;
};

export type LeadContact = {
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  source?: string;
};

export type TimelineEvent = {
  at: string;
  type: string;
  summary: string;
  meta?: Record<string, unknown>;
};

export type Lead = {
  _id?: unknown;
  /** Stable dedupe key — Google placeId, or `domain:<host>` when absent. */
  leadKey: string;

  // ---- Identity (Module 2)
  businessName: string;
  website: string;
  domain: string;
  googleUrl: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  countryCode: string;
  lat: number | null;
  lng: number | null;
  googleRating: number | null;
  googleReviews: number;
  businessCategory: string;
  categories: string[];
  description: string;
  logo: string;
  imageUrl: string;
  openingHours: { day: string; hours: string }[];
  socials: {
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };

  // ---- Enrichment layers
  analysis?: WebsiteAnalysis;
  intel?: BusinessIntel;
  opportunities?: Opportunity[];
  scores?: LeadScores;
  contacts?: LeadContact[];
  audit?: LeadAudit;
  lastAuditAt?: string | null;
  outreach?: LeadOutreach;
  lastOutreachAt?: string | null;

  // ---- CRM (Module 9)
  stage: PipelineStage;
  owner?: string;
  notes?: string;
  timeline: TimelineEvent[];
  lastContactedAt?: string | null;
  nextFollowUpAt?: string | null;

  // ---- Bookkeeping
  source: string;
  createdAt: string;
  updatedAt: string;
  lastAnalyzedAt?: string | null;
};

export const EMPTY_SCORES: LeadScores = {
  website: 0,
  software: 0,
  ai: 0,
  quality: 0,
  priority: "cold",
  overall: 0,
  signals: [],
};

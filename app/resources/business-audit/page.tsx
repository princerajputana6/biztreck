import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundFX from "@/components/BackgroundFX";
import LeadForm from "@/components/LeadForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free Business Audit — Find What's Holding Your Business Back",
  description:
    "Get a free business audit covering your website, SEO, performance, AI opportunities, automation potential and a custom software roadmap. No obligation.",
  keywords: [
    "free business audit",
    "free website audit",
    "business process audit",
    "AI opportunity assessment",
    "automation audit",
    "digital transformation audit",
  ],
  alternates: { canonical: "/resources/business-audit" },
  openGraph: {
    type: "website",
    title: "Free Business Audit — Biztreck Solutions",
    description:
      "Website, SEO, performance, AI opportunity and automation audit with an estimated development roadmap.",
    url: `${SITE.url}/resources/business-audit`,
  },
};

const deliverables = [
  {
    title: "Website audit",
    desc: "Structure, messaging, conversion paths and what a serious buyer sees when they land.",
  },
  {
    title: "SEO audit",
    desc: "Indexing, technical foundations, and the buyer-intent terms you could realistically rank for.",
  },
  {
    title: "Performance audit",
    desc: "Core Web Vitals and load performance on real devices, with the specific fixes that matter.",
  },
  {
    title: "AI opportunity report",
    desc: "Where AI would genuinely reduce cost in your operation — and where it would not.",
  },
  {
    title: "Automation suggestions",
    desc: "The manual handoffs and re-keying in your workflow that software should be doing.",
  },
  {
    title: "Custom software recommendations",
    desc: "Whether to build, integrate or buy, based on how your business actually operates.",
  },
  {
    title: "Estimated development roadmap",
    desc: "A phased sequence with indicative effort and cost, ordered by payback.",
  },
];

const faqs = [
  {
    q: "Is the audit really free?",
    a: "Yes. We invest a few hours because it is the most honest way to show how we think. There is no obligation and no automatic follow-up sequence.",
  },
  {
    q: "What do you need from us?",
    a: "Your website URL and a short description of how work currently flows. For a deeper audit we may ask a few follow-up questions or request read-only access to a system.",
  },
  {
    q: "How long does it take?",
    a: "We typically return the audit within three to five business days.",
  },
  {
    q: "Will you just tell us to build software?",
    a: "No. A good share of audits conclude that better use of an existing tool, or a small integration, beats building anything. We say so when that is the case.",
  },
];

export default function BusinessAuditPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-950">
      <BackgroundFX />
      <Navbar />

      <section className="relative z-10 container-px pt-32 sm:pt-40">
        <div className="mx-auto max-w-3xl text-center">
          <div className="eyebrow mx-auto">Free business audit</div>
          <h1 className="section-title mt-5 text-white">
            Discover what&apos;s{" "}
            <span className="gradient-text">holding your business back</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-300">
            A practical review of your website, operations and automation
            potential — with a phased roadmap showing what to fix first and what
            it would take. No obligation.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {deliverables.map((d) => (
            <div
              key={d.title}
              className="rounded-3xl border border-navy-700/40 bg-gradient-to-b from-navy-850/60 to-navy-900/40 p-7"
            >
              <Check className="text-accent-cyan" size={22} />
              <h2 className="mt-4 font-display text-lg font-bold text-white">
                {d.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {d.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <h2 className="font-display text-2xl font-bold text-white">
              Frequently asked
            </h2>
            <div className="mt-8 space-y-4">
              {faqs.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-2xl border border-navy-700/40 bg-navy-900/40 p-6"
                >
                  <summary className="cursor-pointer list-none font-display text-base font-semibold text-white">
                    {f.q}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
            <p className="mt-8 text-sm text-slate-400">
              Would rather talk it through first?{" "}
              <Link href="/book-strategy-call" className="text-accent-glow hover:text-white">
                Book a strategy call
              </Link>
              .
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-navy-700/40 bg-gradient-to-b from-navy-850/60 to-navy-900/40 p-8 sm:p-10">
              <h2 className="font-display text-2xl font-bold text-white">
                Request your free audit
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                We&apos;ll send it back within three to five business days.
              </p>
              <div className="mt-8">
                <LeadForm
                  service="Business Audit"
                  submitLabel="Get My Free Audit"
                  messageLabel="What should we look at?"
                  messagePlaceholder="e.g. Our site gets no organic traffic and our ops team runs everything from spreadsheets."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="h-24" />
      </section>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </main>
  );
}

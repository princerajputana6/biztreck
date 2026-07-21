import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundFX from "@/components/BackgroundFX";
import { SITE } from "@/lib/site";
import { SOLUTIONS } from "@/lib/solutions";

export const metadata: Metadata = {
  title: "Solutions — Custom Software, AI Automation & Business Systems",
  description:
    "Custom software, AI automation, business process automation, CRM, ERP, portals and dashboards for growing businesses. Biztreck helps SMBs replace manual work with software.",
  keywords: [
    "custom software development",
    "AI automation services",
    "business process automation",
    "CRM development",
    "ERP development",
    "customer portal development",
  ],
  alternates: { canonical: "/solutions" },
  openGraph: {
    type: "website",
    title: "Solutions — Biztreck Solutions",
    description:
      "Custom software, AI automation and business systems that remove manual work and scale with your business.",
    url: `${SITE.url}/solutions`,
  },
};

export default function SolutionsIndex() {
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: SOLUTIONS.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.name,
      url: `${SITE.url}/solutions/${s.slug}`,
    })),
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-950">
      <BackgroundFX />
      <Navbar />

      <section className="relative z-10 container-px pt-32 sm:pt-40">
        <div className="max-w-3xl">
          <div className="eyebrow">What we build</div>
          <h1 className="section-title mt-5 text-white">
            Software that replaces{" "}
            <span className="gradient-text">manual work</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-300">
            We help growing businesses automate operations, modernise outdated
            systems, and build scalable software that drives measurable growth.
            Every engagement starts with the process that is costing you money —
            not with a technology preference.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/book-strategy-call" className="btn-primary shine">
              Book Strategy Call <ArrowRight size={16} className="ml-1 inline" />
            </Link>
            <Link href="/resources/business-audit" className="btn-ghost">
              Get Free Business Audit
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SOLUTIONS.map((s) => (
            <Link
              key={s.slug}
              href={`/solutions/${s.slug}`}
              className="group rounded-3xl border border-navy-700/40 bg-gradient-to-b from-navy-850/60 to-navy-900/40 p-7 transition-colors hover:border-accent-electric"
            >
              <h2 className="flex items-center gap-1.5 font-display text-xl font-bold text-white">
                {s.name}
                <ArrowUpRight
                  size={18}
                  className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                />
              </h2>
              <p className="mt-4 text-xs uppercase tracking-wider text-slate-500">
                Problem
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-300">
                {s.card.problem}
              </p>
              <p className="mt-3 text-xs uppercase tracking-wider text-slate-500">
                Solution
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-300">
                {s.card.solution}
              </p>
              <p className="mt-3 text-xs uppercase tracking-wider text-accent-cyan">
                Outcome
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-200">
                {s.card.outcome}
              </p>
            </Link>
          ))}
        </div>

        <section className="my-24 rounded-3xl border border-navy-700/40 bg-gradient-to-br from-navy-850/80 to-navy-900/60 p-10 text-center sm:p-14">
          <h2 className="font-display text-3xl font-bold text-white">
            Not sure which one you need?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            That is what the free business audit is for. We look at your current
            systems and workflows, then tell you where software would actually pay
            for itself — and where it would not.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/resources/business-audit" className="btn-primary shine">
              Get My Free Audit
            </Link>
            <Link href="/book-strategy-call" className="btn-ghost">
              Book Strategy Call
            </Link>
          </div>
        </section>
      </section>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
    </main>
  );
}

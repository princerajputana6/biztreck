import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundFX from "@/components/BackgroundFX";
import { SITE } from "@/lib/site";
import { SOLUTIONS } from "@/lib/solutions";

export const metadata: Metadata = {
  title: "Case Studies — Measurable Business Results",
  description:
    "Real projects with real numbers: the business challenge, the solution, the technology, the timeline and the measurable results.",
  keywords: [
    "software development case studies",
    "automation case study",
    "custom software results",
    "ERP implementation case study",
  ],
  alternates: { canonical: "/case-studies" },
  openGraph: {
    type: "website",
    title: "Case Studies — Biztreck Solutions",
    description:
      "Business challenge, solution, technology, timeline and measurable results.",
    url: `${SITE.url}/case-studies`,
  },
};

export default function CaseStudiesPage() {
  // Keep the case study and its parent solution separate — both have a
  // `solution` field and spreading them together would clobber the text.
  const studies = SOLUTIONS.map((s) => ({ cs: s.caseStudy, sol: s }));

  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-950">
      <BackgroundFX />
      <Navbar />

      <section className="relative z-10 container-px pt-32 sm:pt-40">
        <div className="max-w-3xl">
          <div className="eyebrow">Proof, not screenshots</div>
          <h1 className="section-title mt-5 text-white">
            Case studies with{" "}
            <span className="gradient-text">measurable results</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-300">
            Every case study below states the business challenge, what we built,
            the technology, how long it took, and what actually changed. Client
            names are withheld where the work is commercially sensitive.
          </p>
        </div>

        <div className="mt-16 space-y-8">
          {studies.map(({ cs, sol }) => (
            <article
              key={sol.slug}
              className="rounded-3xl border border-navy-700/40 bg-gradient-to-br from-navy-850/70 to-navy-900/50 p-8 sm:p-10"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="eyebrow">{cs.industry}</div>
                <Link
                  href={`/solutions/${sol.slug}`}
                  className="text-sm font-semibold text-accent-glow transition-colors hover:text-white"
                >
                  {sol.name} →
                </Link>
              </div>

              <div className="mt-6 grid gap-8 lg:grid-cols-2">
                <div>
                  <h2 className="font-display text-lg font-bold text-white">
                    Business challenge
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    {cs.challenge}
                  </p>
                  <h3 className="mt-6 font-display text-lg font-bold text-white">
                    Solution
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    {cs.solution}
                  </p>
                  <h3 className="mt-6 font-display text-lg font-bold text-white">
                    Timeline
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    {cs.timeline}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {cs.tech.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-navy-700/60 bg-navy-900/60 px-3 py-1 text-xs text-slate-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-white">
                    Business results
                  </h3>
                  <ul className="mt-3 space-y-3">
                    {cs.results.map((r) => (
                      <li key={r} className="flex items-start gap-3">
                        <Check size={18} className="mt-0.5 shrink-0 text-accent-cyan" />
                        <span className="text-sm leading-relaxed text-slate-300">
                          {r}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>

        <section className="my-24 rounded-3xl border border-navy-700/40 bg-gradient-to-br from-navy-850/80 to-navy-900/60 p-10 text-center sm:p-14">
          <h2 className="font-display text-3xl font-bold text-white">
            Want results like these?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Start with a strategy call. We&apos;ll tell you what is realistic for
            your operation, and what it would take.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/book-strategy-call" className="btn-primary shine">
              Book Strategy Call <ArrowRight size={16} className="ml-1 inline" />
            </Link>
            <Link href="/resources/business-audit" className="btn-ghost">
              Get Free Business Audit
            </Link>
          </div>
        </section>
      </section>

      <Footer />
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowRight, ArrowUpRight, Check, Workflow } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundFX from "@/components/BackgroundFX";
import { SITE } from "@/lib/site";
import { INDUSTRIES, getIndustry } from "@/lib/industries";

export function generateStaticParams() {
  return INDUSTRIES.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ind = getIndustry(slug);
  if (!ind) return { title: "Industry not found" };
  return {
    title: { absolute: ind.metaTitle },
    description: ind.metaDescription,
    keywords: ind.keywords,
    alternates: { canonical: `/industries/${ind.slug}` },
    openGraph: {
      type: "website",
      title: ind.metaTitle,
      description: ind.metaDescription,
      url: `${SITE.url}/industries/${ind.slug}`,
      siteName: SITE.name,
    },
    twitter: {
      card: "summary_large_image",
      title: ind.h1,
      description: ind.metaDescription,
    },
  };
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ind = getIndustry(slug);
  if (!ind) notFound();

  const url = `${SITE.url}/industries/${ind.slug}`;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ind.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Industries", item: `${SITE.url}/industries` },
      { "@type": "ListItem", position: 3, name: ind.name, item: url },
    ],
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-950">
      <BackgroundFX />
      <Navbar />

      <article className="relative z-10 container-px pt-32 sm:pt-40">
        <nav className="mb-6 text-sm text-slate-400" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/industries" className="hover:text-white">Industries</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-300">{ind.name}</span>
        </nav>

        {/* Hero */}
        <header className="max-w-3xl">
          <div className="eyebrow">{ind.tagline}</div>
          <h1 className="section-title mt-5 text-white">{ind.h1}</h1>
          {ind.intro.map((p, i) => (
            <p key={i} className="mt-5 text-lg leading-relaxed text-slate-300">
              {p}
            </p>
          ))}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/book-strategy-call" className="btn-primary shine">
              Book Strategy Call <ArrowRight size={16} className="ml-1 inline" />
            </Link>
            <Link href="/resources/business-audit" className="btn-ghost">
              Get Free Business Audit
            </Link>
          </div>
        </header>

        {/* Industry problems */}
        <section className="mt-20">
          <h2 className="font-display text-2xl font-bold text-white">
            Problems we see in {ind.name.toLowerCase()}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {ind.problems.map((p) => (
              <div
                key={p}
                className="flex items-start gap-3 rounded-2xl border border-navy-700/40 bg-navy-900/40 p-5"
              >
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-accent-glow" />
                <p className="text-sm leading-relaxed text-slate-300">{p}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Common workflows */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold text-white">
            Common workflows we build
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ind.workflows.map((w) => (
              <div
                key={w.title}
                className="rounded-3xl border border-navy-700/40 bg-navy-900/40 p-6"
              >
                <Workflow size={20} className="text-accent-cyan" />
                <h3 className="mt-3 font-display text-lg font-bold text-white">
                  {w.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {w.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Our solutions */}
        <section className="mt-20">
          <h2 className="font-display text-2xl font-bold text-white">
            Our solutions for {ind.name.toLowerCase()}
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ind.solutions.map((s) => (
              <Link
                key={s.title}
                href={`/solutions/${s.slug}`}
                className="group rounded-3xl border border-navy-700/40 bg-gradient-to-b from-navy-850/60 to-navy-900/40 p-7 transition-colors hover:border-accent-electric"
              >
                <h3 className="flex items-center gap-1.5 font-display text-lg font-bold text-white">
                  {s.title}
                  <ArrowUpRight
                    size={16}
                    className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                  />
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {s.desc}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Case study */}
        <section className="mt-20">
          <h2 className="font-display text-2xl font-bold text-white">
            Case study
          </h2>
          <div className="mt-8 rounded-3xl border border-navy-700/40 bg-gradient-to-br from-navy-850/70 to-navy-900/50 p-8 sm:p-10">
            <div className="eyebrow">{ind.name}</div>
            <div className="mt-6 grid gap-8 lg:grid-cols-2">
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  Business challenge
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {ind.caseStudy.challenge}
                </p>
                <h3 className="mt-6 font-display text-lg font-bold text-white">
                  Solution
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {ind.caseStudy.solution}
                </p>
                <h3 className="mt-6 font-display text-lg font-bold text-white">
                  Timeline
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {ind.caseStudy.timeline}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {ind.caseStudy.tech.map((t) => (
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
                  {ind.caseStudy.results.map((r) => (
                    <li key={r} className="flex items-start gap-3">
                      <Check size={18} className="mt-0.5 shrink-0 text-accent-cyan" />
                      <span className="text-sm leading-relaxed text-slate-300">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-20 max-w-3xl">
          <h2 className="font-display text-2xl font-bold text-white">
            Frequently asked questions
          </h2>
          <div className="mt-8 space-y-4">
            {ind.faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-navy-700/40 bg-navy-900/40 p-6"
              >
                <summary className="cursor-pointer list-none font-display text-lg font-semibold text-white">
                  {f.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Other industries */}
        <section className="mt-20">
          <h2 className="font-display text-2xl font-bold text-white">
            Other industries we serve
          </h2>
          <div className="mt-8 flex flex-wrap gap-3">
            {INDUSTRIES.filter((i) => i.slug !== ind.slug).map((i) => (
              <Link
                key={i.slug}
                href={`/industries/${i.slug}`}
                className="rounded-full border border-navy-700/60 bg-navy-900/60 px-4 py-2 text-sm text-slate-200 transition-colors hover:border-accent-electric hover:text-white"
              >
                {i.name}
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="my-24 rounded-3xl border border-navy-700/40 bg-gradient-to-br from-navy-850/80 to-navy-900/60 p-10 text-center sm:p-14">
          <h2 className="font-display text-3xl font-bold text-white">
            Let&apos;s build software that grows your business
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Book a 30-minute call and we will map where software would remove the
            most cost from your {ind.name.toLowerCase()} operation.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/book-strategy-call" className="btn-primary shine">
              Book Strategy Call
            </Link>
            <Link href="/resources/business-audit" className="btn-ghost">
              Request Proposal
            </Link>
          </div>
        </section>
      </article>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowRight, ArrowUpRight, Check, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundFX from "@/components/BackgroundFX";
import { SITE } from "@/lib/site";
import { SOLUTIONS, getSolution } from "@/lib/solutions";

export function generateStaticParams() {
  return SOLUTIONS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sol = getSolution(slug);
  if (!sol) return { title: "Solution not found" };
  return {
    title: { absolute: sol.metaTitle },
    description: sol.metaDescription,
    keywords: sol.keywords,
    alternates: { canonical: `/solutions/${sol.slug}` },
    openGraph: {
      type: "website",
      title: sol.metaTitle,
      description: sol.metaDescription,
      url: `${SITE.url}/solutions/${sol.slug}`,
      siteName: SITE.name,
    },
    twitter: {
      card: "summary_large_image",
      title: sol.h1,
      description: sol.metaDescription,
    },
  };
}

export default async function SolutionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sol = getSolution(slug);
  if (!sol) notFound();

  const url = `${SITE.url}/solutions/${sol.slug}`;

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: sol.name,
    serviceType: sol.serviceType,
    description: sol.metaDescription,
    url,
    provider: { "@type": "Organization", name: SITE.name, url: SITE.url },
    areaServed: [
      { "@type": "Country", name: "United States" },
      { "@type": "Country", name: "United Kingdom" },
      { "@type": "Country", name: "Canada" },
      { "@type": "Country", name: "Australia" },
      { "@type": "Country", name: "New Zealand" },
      { "@type": "Country", name: "Singapore" },
      { "@type": "Country", name: "United Arab Emirates" },
      { "@type": "Country", name: "India" },
    ],
    audience: {
      "@type": "BusinessAudience",
      audienceType: "Small and mid-sized businesses",
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: sol.faqs.map((f) => ({
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
      { "@type": "ListItem", position: 2, name: "Solutions", item: `${SITE.url}/solutions` },
      { "@type": "ListItem", position: 3, name: sol.name, item: url },
    ],
  };

  const related = sol.related
    .map((r) => SOLUTIONS.find((s) => s.slug === r))
    .filter(Boolean) as typeof SOLUTIONS;

  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-950">
      <BackgroundFX />
      <Navbar />

      <article className="relative z-10 container-px pt-32 sm:pt-40">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-slate-400" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/solutions" className="hover:text-white">Solutions</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-300">{sol.name}</span>
        </nav>

        {/* Hero */}
        <header className="max-w-3xl">
          <div className="eyebrow">{sol.tagline}</div>
          <h1 className="section-title mt-5 text-white">{sol.h1}</h1>
          {sol.intro.map((p, i) => (
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

        {/* Problem */}
        <section className="mt-20">
          <h2 className="font-display text-2xl font-bold text-white">
            The problem
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {sol.problems.map((p) => (
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

        {/* Business impact */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold text-white">
            What it costs your business
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {sol.businessImpact.map((b) => (
              <div
                key={b.label}
                className="rounded-3xl border border-navy-700/40 bg-navy-900/40 p-6"
              >
                <TrendingUp size={20} className="text-accent-cyan" />
                <h3 className="mt-3 font-display text-lg font-bold text-white">
                  {b.label}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Our solution */}
        <section className="mt-20 max-w-3xl">
          <h2 className="font-display text-2xl font-bold text-white">
            Our solution
          </h2>
          {sol.approach.map((p, i) => (
            <p key={i} className="mt-5 text-lg leading-relaxed text-slate-300">
              {p}
            </p>
          ))}
        </section>

        {/* Features */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold text-white">
            What you get
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sol.features.map((d) => (
              <div
                key={d.title}
                className="rounded-3xl border border-navy-700/40 bg-gradient-to-b from-navy-850/60 to-navy-900/40 p-7"
              >
                <Check className="text-accent-cyan" size={22} />
                <h3 className="mt-4 font-display text-lg font-bold text-white">
                  {d.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {d.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Process */}
        <section className="mt-20">
          <h2 className="font-display text-2xl font-bold text-white">
            How we work
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {sol.process.map((p, i) => (
              <div
                key={p.step}
                className="rounded-3xl border border-navy-700/40 bg-navy-900/40 p-6"
              >
                <div className="font-display text-3xl font-bold gradient-text">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-white">
                  {p.step}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Technology */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold text-white">
            Technology we use
          </h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {sol.tech.map((t) => (
              <span
                key={t}
                className="rounded-full border border-navy-700/60 bg-navy-900/60 px-4 py-2 text-sm text-slate-200"
              >
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* Business outcomes */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold text-white">
            Business outcomes
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {sol.outcomes.map((o) => (
              <div
                key={o}
                className="flex items-start gap-3 rounded-2xl border border-navy-700/40 bg-navy-900/40 p-5"
              >
                <Check size={18} className="mt-0.5 shrink-0 text-accent-cyan" />
                <p className="text-sm leading-relaxed text-slate-300">{o}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Case study */}
        <section className="mt-20">
          <h2 className="font-display text-2xl font-bold text-white">
            Case study
          </h2>
          <div className="mt-8 rounded-3xl border border-navy-700/40 bg-gradient-to-br from-navy-850/70 to-navy-900/50 p-8 sm:p-10">
            <div className="eyebrow">{sol.caseStudy.industry}</div>
            <div className="mt-6 grid gap-8 lg:grid-cols-2">
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  Business challenge
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {sol.caseStudy.challenge}
                </p>
                <h3 className="mt-6 font-display text-lg font-bold text-white">
                  Solution
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {sol.caseStudy.solution}
                </p>
                <h3 className="mt-6 font-display text-lg font-bold text-white">
                  Timeline
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {sol.caseStudy.timeline}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {sol.caseStudy.tech.map((t) => (
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
                  {sol.caseStudy.results.map((r) => (
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
            {sol.faqs.map((f) => (
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

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-2xl font-bold text-white">
              Related solutions
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/solutions/${r.slug}`}
                  className="group rounded-3xl border border-navy-700/40 bg-navy-900/40 p-6 transition-colors hover:border-accent-electric"
                >
                  <h3 className="flex items-center gap-1.5 font-display text-lg font-bold text-white">
                    {r.name}
                    <ArrowUpRight
                      size={16}
                      className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                    />
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">{r.tagline}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="my-24 rounded-3xl border border-navy-700/40 bg-gradient-to-br from-navy-850/80 to-navy-900/60 p-10 text-center sm:p-14">
          <h2 className="font-display text-3xl font-bold text-white">
            Let&apos;s build software that grows your business
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Book a 30-minute strategy call and we will map where {sol.name.toLowerCase()} would
            remove the most cost from your operation — no obligation, no pitch deck.
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
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

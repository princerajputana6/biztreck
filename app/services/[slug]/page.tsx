import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ArrowRight, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundFX from "@/components/BackgroundFX";
import { SITE } from "@/lib/site";
import { SERVICES, getService } from "@/lib/services";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const svc = getService(slug);
  if (!svc) return { title: "Service not found" };
  return {
    title: { absolute: svc.metaTitle },
    description: svc.metaDescription,
    keywords: svc.keywords,
    alternates: { canonical: `/services/${svc.slug}` },
    openGraph: {
      type: "website",
      title: svc.metaTitle,
      description: svc.metaDescription,
      url: `${SITE.url}/services/${svc.slug}`,
      siteName: SITE.name,
    },
    twitter: {
      card: "summary_large_image",
      title: svc.h1,
      description: svc.metaDescription,
    },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const svc = getService(slug);
  if (!svc) notFound();

  const url = `${SITE.url}/services/${svc.slug}`;

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: svc.name,
    serviceType: svc.serviceType,
    description: svc.metaDescription,
    url,
    provider: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    areaServed: [
      { "@type": "Country", name: "India" },
      { "@type": "AdministrativeArea", name: "Delhi NCR" },
    ],
    audience: { "@type": "BusinessAudience", audienceType: "Businesses and startups" },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: svc.faqs.map((f) => ({
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
      { "@type": "ListItem", position: 2, name: "Services", item: `${SITE.url}/services` },
      { "@type": "ListItem", position: 3, name: svc.name, item: url },
    ],
  };

  const related = svc.related
    .map((r) => SERVICES.find((s) => s.slug === r))
    .filter(Boolean) as typeof SERVICES;

  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-950">
      <BackgroundFX />
      <Navbar />

      <article className="relative z-10 container-px pt-32 sm:pt-40">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-slate-400" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/services" className="hover:text-white">Services</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-300">{svc.name}</span>
        </nav>

        {/* Hero */}
        <header className="max-w-3xl">
          <div className="eyebrow">{svc.tagline}</div>
          <h1 className="section-title mt-5 text-white">{svc.h1}</h1>
          {svc.intro.map((p, i) => (
            <p key={i} className="mt-5 text-lg leading-relaxed text-slate-300">
              {p}
            </p>
          ))}
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="/#contact" className="btn-primary shine">
              Get a free quote <ArrowRight size={16} className="ml-1 inline" />
            </a>
            <a href={`tel:${SITE.phoneRaw}`} className="btn-ghost">
              Call {SITE.phone}
            </a>
          </div>
        </header>

        {/* Deliverables */}
        <section className="mt-20">
          <h2 className="font-display text-2xl font-bold text-white">
            What you get
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {svc.deliverables.map((d) => (
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

        {/* Tech */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold text-white">
            Technology we use
          </h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {svc.tech.map((t) => (
              <span
                key={t}
                className="rounded-full border border-navy-700/60 bg-navy-900/60 px-4 py-2 text-sm text-slate-200"
              >
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* Process */}
        <section className="mt-20">
          <h2 className="font-display text-2xl font-bold text-white">
            How we work
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {svc.process.map((p, i) => (
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

        {/* FAQ */}
        <section className="mt-20 max-w-3xl">
          <h2 className="font-display text-2xl font-bold text-white">
            Frequently asked questions
          </h2>
          <div className="mt-8 space-y-4">
            {svc.faqs.map((f) => (
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
              Related services
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/services/${r.slug}`}
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
            Ready to start your project?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Tell us what you need and get a free, no-obligation quote from a
            senior team based in {SITE.shortAddress}.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="/#contact" className="btn-primary shine">
              Get a free quote
            </a>
            <a href={`mailto:${SITE.email}`} className="btn-ghost">
              Email {SITE.email}
            </a>
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

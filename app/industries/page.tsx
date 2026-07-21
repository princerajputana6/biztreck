import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundFX from "@/components/BackgroundFX";
import { SITE } from "@/lib/site";
import { INDUSTRIES } from "@/lib/industries";

export const metadata: Metadata = {
  title: "Industries — Software & Automation by Sector",
  description:
    "Custom software, AI automation and business systems for healthcare, construction, manufacturing, finance, logistics, education, real estate and professional services.",
  keywords: [
    "industry software development",
    "healthcare software development",
    "construction software",
    "manufacturing software",
    "logistics software development",
  ],
  alternates: { canonical: "/industries" },
  openGraph: {
    type: "website",
    title: "Industries — Biztreck Solutions",
    description:
      "Software and automation built for the way your industry actually operates.",
    url: `${SITE.url}/industries`,
  },
};

export default function IndustriesIndex() {
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: INDUSTRIES.map((i, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: i.name,
      url: `${SITE.url}/industries/${i.slug}`,
    })),
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-950">
      <BackgroundFX />
      <Navbar />

      <section className="relative z-10 container-px pt-32 sm:pt-40">
        <div className="max-w-3xl">
          <div className="eyebrow">Who we work with</div>
          <h1 className="section-title mt-5 text-white">
            Software built for{" "}
            <span className="gradient-text">how your industry works</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-300">
            Every sector has its own workflows, compliance obligations and
            bottlenecks. We build around them rather than forcing a generic
            product to fit — for growing businesses across the US, UK, Canada,
            Australia, New Zealand, Singapore and the UAE.
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

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {INDUSTRIES.map((i) => (
            <Link
              key={i.slug}
              href={`/industries/${i.slug}`}
              className="group rounded-3xl border border-navy-700/40 bg-gradient-to-b from-navy-850/60 to-navy-900/40 p-7 transition-colors hover:border-accent-electric"
            >
              <h2 className="flex items-center gap-1.5 font-display text-xl font-bold text-white">
                {i.name}
                <ArrowUpRight
                  size={18}
                  className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                />
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                {i.blurb}
              </p>
            </Link>
          ))}
        </div>

        <section className="my-24 rounded-3xl border border-navy-700/40 bg-gradient-to-br from-navy-850/80 to-navy-900/60 p-10 text-center sm:p-14">
          <h2 className="font-display text-3xl font-bold text-white">
            Don&apos;t see your industry?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            The underlying problems — manual handoffs, disconnected systems, no
            reporting — are remarkably consistent. Tell us how you operate and
            we&apos;ll tell you honestly whether we can help.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/book-strategy-call" className="btn-primary shine">
              Book Strategy Call
            </Link>
            <Link href="/resources/business-audit" className="btn-ghost">
              Get Free Business Audit
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

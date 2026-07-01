import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundFX from "@/components/BackgroundFX";
import { SITE } from "@/lib/site";
import { SERVICES } from "@/lib/services";

export const metadata: Metadata = {
  title: "Services — Web, App, Custom Software & IT Services",
  description:
    "Biztreck Solutions services: website development, mobile app development, custom software, DevOps, SEO and startup MVPs. One senior team in Greater Noida, Delhi NCR & remote.",
  keywords: [
    "software development services",
    "it services company",
    "website development company",
    "app development company",
    "custom software development",
  ],
  alternates: { canonical: "/services" },
  openGraph: {
    type: "website",
    title: "Services — Biztreck Solutions",
    description:
      "Website development, app development, custom software, DevOps, SEO and startup MVPs from one senior team.",
    url: `${SITE.url}/services`,
  },
};

export default function ServicesIndex() {
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: SERVICES.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.name,
      url: `${SITE.url}/services/${s.slug}`,
    })),
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-950">
      <BackgroundFX />
      <Navbar />

      <section className="relative z-10 container-px pt-32 sm:pt-40">
        <div className="max-w-3xl">
          <div className="eyebrow">What we do</div>
          <h1 className="section-title mt-5 text-white">
            Software, web, app &amp; IT services{" "}
            <span className="gradient-text">under one roof</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-300">
            Biztreck Solutions is a full-service technology partner. From websites
            and mobile apps to custom software, cloud, DevOps and SEO — one senior
            team based in {SITE.shortAddress}, serving clients across India and
            remotely worldwide.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <Link
              key={s.slug}
              href={`/services/${s.slug}`}
              className="group rounded-3xl border border-navy-700/40 bg-gradient-to-b from-navy-850/60 to-navy-900/40 p-7 transition-colors hover:border-accent-electric"
            >
              <h2 className="flex items-center gap-1.5 font-display text-xl font-bold text-white">
                {s.name}
                <ArrowUpRight
                  size={18}
                  className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                />
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                {s.tagline}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
    </main>
  );
}

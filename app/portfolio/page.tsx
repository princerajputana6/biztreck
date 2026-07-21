import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundFX from "@/components/BackgroundFX";
import ProjectsGallery from "@/components/ProjectsGallery";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our Work — Products & Platforms We've Built",
  description:
    "Platforms Biztreck has designed, built and runs — ERP, AI automation, customer portals, marketplaces and websites. Browse our work by solution category.",
  keywords: [
    "software development portfolio",
    "custom software examples",
    "ERP project examples",
    "AI automation projects",
  ],
  alternates: { canonical: "/portfolio" },
  openGraph: {
    type: "website",
    title: "Our Work — Biztreck Solutions",
    description:
      "Products and platforms we've designed, built and run ourselves.",
    url: `${SITE.url}/portfolio`,
  },
};

export default function PortfolioPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-950">
      <BackgroundFX />
      <Navbar />

      <section className="relative z-10 container-px pt-32 sm:pt-40">
        <div className="max-w-3xl">
          <div className="eyebrow">Our work</div>
          <h1 className="section-title mt-5 text-white">
            Products and platforms{" "}
            <span className="gradient-text">we&apos;ve built</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-300">
            These are platforms we designed, engineered and run ourselves —
            filtered by the kind of solution they represent, so you can see work
            closest to what you need.
          </p>
        </div>

        <Suspense fallback={<div className="mt-10 h-12" />}>
          <ProjectsGallery />
        </Suspense>

        <section className="my-24 rounded-3xl border border-navy-700/40 bg-gradient-to-br from-navy-850/80 to-navy-900/60 p-10 text-center sm:p-14">
          <h2 className="font-display text-3xl font-bold text-white">
            Want something like this for your business?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Book a strategy call and we&apos;ll map what it would take — scope,
            sequence and realistic cost.
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

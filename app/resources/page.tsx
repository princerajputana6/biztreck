import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ClipboardCheck, FileText, Newspaper } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundFX from "@/components/BackgroundFX";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Resources — Guides, Blog & Free Business Audit",
  description:
    "Practical resources for business leaders evaluating custom software, AI automation and process improvement — plus a free business audit.",
  keywords: [
    "custom software guides",
    "business automation resources",
    "free business audit",
    "software buying guide",
  ],
  alternates: { canonical: "/resources" },
  openGraph: {
    type: "website",
    title: "Resources — Biztreck Solutions",
    description:
      "Guides, articles and a free business audit for leaders evaluating software and automation.",
    url: `${SITE.url}/resources`,
  },
};

const resources = [
  {
    icon: ClipboardCheck,
    title: "Free Business Audit",
    desc: "Website, SEO, performance, AI opportunity and automation review with an estimated development roadmap.",
    href: "/resources/business-audit",
    cta: "Get my free audit",
  },
  {
    icon: Newspaper,
    title: "Blog",
    desc: "Practical articles on custom software, automation, AI and modernising legacy systems.",
    href: "/blog",
    cta: "Read the blog",
  },
  {
    icon: FileText,
    title: "Case studies",
    desc: "Real projects with the business challenge, solution, timeline and measurable results.",
    href: "/case-studies",
    cta: "View case studies",
  },
];

export default function ResourcesPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-950">
      <BackgroundFX />
      <Navbar />

      <section className="relative z-10 container-px pt-32 sm:pt-40">
        <div className="max-w-3xl">
          <div className="eyebrow">Resources</div>
          <h1 className="section-title mt-5 text-white">
            Decide with{" "}
            <span className="gradient-text">better information</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-300">
            Choosing whether to build, integrate or buy is an expensive decision
            to get wrong. These resources are written to help you make it well —
            including when the answer is to do nothing.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => {
            const Icon = r.icon;
            return (
              <Link
                key={r.href}
                href={r.href}
                className="group rounded-3xl border border-navy-700/40 bg-gradient-to-b from-navy-850/60 to-navy-900/40 p-7 transition-colors hover:border-accent-electric"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-navy-500 to-navy-700 shadow-glow">
                  <Icon className="text-accent-glow" size={22} />
                </div>
                <h2 className="mt-5 flex items-center gap-1.5 font-display text-xl font-bold text-white">
                  {r.title}
                  <ArrowUpRight
                    size={18}
                    className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                  />
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {r.desc}
                </p>
                <span className="mt-5 inline-block text-sm font-semibold text-accent-glow">
                  {r.cta} →
                </span>
              </Link>
            );
          })}
        </div>

        <section className="my-24 rounded-3xl border border-navy-700/40 bg-gradient-to-br from-navy-850/80 to-navy-900/60 p-10 text-center sm:p-14">
          <h2 className="font-display text-3xl font-bold text-white">
            Rather just talk it through?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Book a 30-minute strategy call and get a straight answer on whether
            software would pay for itself in your operation.
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
    </main>
  );
}

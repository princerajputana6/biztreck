import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Compass, Globe, Heart, Target } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundFX from "@/components/BackgroundFX";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Biztreck — Business Growth, AI & Custom Software Partner",
  description:
    "Biztreck helps growing businesses automate operations, modernise legacy systems and build scalable software. Our mission, values, leadership and global delivery model.",
  keywords: [
    "about biztreck solutions",
    "custom software company",
    "AI automation partner",
    "offshore development partner",
  ],
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    title: "About Biztreck Solutions",
    description:
      "A business-first software partner for growing companies worldwide.",
    url: `${SITE.url}/about`,
  },
};

const values = [
  {
    icon: Target,
    title: "Business outcomes first",
    desc: "We measure success in hours saved and revenue enabled, not lines of code shipped.",
  },
  {
    icon: Heart,
    title: "Honest advice",
    desc: "If an off-the-shelf tool solves your problem, we say so — even when it costs us the project.",
  },
  {
    icon: Compass,
    title: "Own the problem",
    desc: "We take responsibility for whether the thing worked, not just whether it was delivered.",
  },
  {
    icon: Globe,
    title: "Long-term partnership",
    desc: "The most valuable work happens after launch, once real usage data arrives.",
  },
];

const process = [
  { step: "Discovery call", desc: "Where work slows down and what growth is blocked by." },
  { step: "Business audit", desc: "Map workflows and systems, then quantify the opportunity." },
  { step: "Solution planning", desc: "Phased roadmap with clear scope, milestones and fixed costs." },
  { step: "UX & architecture", desc: "Screens and data model agreed before production code." },
  { step: "Development", desc: "Short increments with working previews at every milestone." },
  { step: "Testing", desc: "Automated tests, security review and user acceptance." },
  { step: "Launch", desc: "Migration, training and a controlled go-live." },
  { step: "Continuous improvement", desc: "Real usage drives the next iteration." },
];

const markets = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "New Zealand",
  "Singapore",
  "United Arab Emirates",
  "India",
];

export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-950">
      <BackgroundFX />
      <Navbar />

      <article className="relative z-10 container-px pt-32 sm:pt-40">
        <header className="max-w-3xl">
          <div className="eyebrow">About Biztreck</div>
          <h1 className="section-title mt-5 text-white">
            We build software that{" "}
            <span className="gradient-text">removes real work</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-300">
            Biztreck Solutions is a business growth, AI automation and custom
            software partner for growing companies. We work with businesses that
            have outgrown spreadsheets and disconnected tools but are not ready
            to hand their operations to a rigid enterprise platform.
          </p>
        </header>

        {/* Mission & vision */}
        <section className="mt-20 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-navy-700/40 bg-gradient-to-b from-navy-850/60 to-navy-900/40 p-8 sm:p-10">
            <h2 className="font-display text-2xl font-bold text-white">Our mission</h2>
            <p className="mt-4 text-base leading-relaxed text-slate-300">
              To help growing businesses replace manual work with software that
              fits how they actually operate — so their people spend time on
              customers and growth rather than on data entry and chasing.
            </p>
          </div>
          <div className="rounded-3xl border border-navy-700/40 bg-gradient-to-b from-navy-850/60 to-navy-900/40 p-8 sm:p-10">
            <h2 className="font-display text-2xl font-bold text-white">Our vision</h2>
            <p className="mt-4 text-base leading-relaxed text-slate-300">
              A world where a 40-person business can run on software as capable
              as a 4,000-person enterprise — without the licence costs, the
              consultants, or the two-year implementation.
            </p>
          </div>
        </section>

        {/* Why we exist */}
        <section className="mt-20 max-w-3xl">
          <h2 className="font-display text-2xl font-bold text-white">
            Why Biztreck exists
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-300">
            Most growing businesses sit in an awkward middle. Off-the-shelf tools
            cover most of the process and block the rest. Enterprise platforms
            are priced and scoped for organisations ten times their size. So the
            gap gets filled with spreadsheets, shared inboxes and people manually
            moving data between systems.
          </p>
          <p className="mt-5 text-lg leading-relaxed text-slate-300">
            That gap is expensive and it compounds. Every new client adds admin
            load instead of margin. We started Biztreck to close it — building
            software sized and priced for businesses in that middle, delivered in
            phases that pay for themselves rather than as one enormous bet.
          </p>
        </section>

        {/* Values */}
        <section className="mt-20">
          <h2 className="font-display text-2xl font-bold text-white">
            What we value
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="rounded-3xl border border-navy-700/40 bg-navy-900/40 p-6"
                >
                  <Icon size={20} className="text-accent-cyan" />
                  <h3 className="mt-3 font-display text-lg font-bold text-white">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    {v.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Leadership */}
        <section className="mt-20">
          <h2 className="font-display text-2xl font-bold text-white">Leadership</h2>
          <div className="mt-8 rounded-3xl border border-navy-700/40 bg-gradient-to-br from-navy-850/70 to-navy-900/50 p-8 sm:p-10">
            <div className="flex flex-wrap items-center gap-5">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent-electric/40 to-accent-cyan/30 font-display text-xl font-bold text-white">
                PK
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white">
                  Prince Kumar
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Founder, Biztreck Solutions
                </p>
              </div>
            </div>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-slate-300">
              Biztreck is founder-led, which means the person setting your scope
              is accountable for whether it works. Engagements are staffed with
              senior engineers and architects — no juniors learning on your
              budget — and the founder stays involved through delivery rather
              than handing off after the sale.
            </p>
          </div>
        </section>

        {/* Development process */}
        <section className="mt-20">
          <h2 className="font-display text-2xl font-bold text-white">
            How we deliver
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((p, i) => (
              <div
                key={p.step}
                className="rounded-3xl border border-navy-700/40 bg-navy-900/40 p-6"
              >
                <div className="font-display text-3xl font-bold gradient-text">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-3 font-display text-base font-bold text-white">
                  {p.step}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Global delivery */}
        <section className="mt-20">
          <h2 className="font-display text-2xl font-bold text-white">
            Global delivery
          </h2>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-300">
            We are headquartered in {SITE.shortAddress} and deliver remotely for
            clients across eight markets. Engagements run async-first with
            overlapping hours agreed upfront, working previews you can review in
            your own time, and a named point of contact in your timezone window.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {markets.map((m) => (
              <span
                key={m}
                className="rounded-full border border-navy-700/60 bg-navy-900/60 px-4 py-2 text-sm text-slate-200"
              >
                {m}
              </span>
            ))}
          </div>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              "Fixed-scope phases with milestone-based billing",
              "Source code delivered in your own repository",
              "Async-first communication with agreed overlap hours",
              "Senior engineers on every engagement",
            ].map((x) => (
              <li key={x} className="flex items-start gap-3">
                <Check size={18} className="mt-0.5 shrink-0 text-accent-cyan" />
                <span className="text-sm leading-relaxed text-slate-300">{x}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="my-24 rounded-3xl border border-navy-700/40 bg-gradient-to-br from-navy-850/80 to-navy-900/60 p-10 text-center sm:p-14">
          <h2 className="font-display text-3xl font-bold text-white">
            Let&apos;s build software that grows your business
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Start with a 30-minute strategy call. No pitch deck, no obligation.
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
      </article>

      <Footer />
    </main>
  );
}

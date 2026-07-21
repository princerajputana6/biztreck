import type { Metadata } from "next";
import { Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundFX from "@/components/BackgroundFX";
import LeadForm from "@/components/LeadForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Book a Strategy Call — Custom Software & AI Automation",
  description:
    "Book a free 30-minute strategy call with Biztreck. We map where custom software or AI automation would remove the most cost from your operation — no obligation.",
  keywords: [
    "book software consultation",
    "software strategy call",
    "custom software consultation",
    "AI automation consultation",
  ],
  alternates: { canonical: "/book-strategy-call" },
  openGraph: {
    type: "website",
    title: "Book a Strategy Call — Biztreck Solutions",
    description:
      "A free 30-minute call to map where software would remove the most cost from your operation.",
    url: `${SITE.url}/book-strategy-call`,
  },
};

const expect = [
  "A walkthrough of where your current process is losing time or money",
  "An honest view on whether software is the right answer — including when it is not",
  "Rough effort, cost range and sequencing if we would be a fit",
  "A written summary afterwards, whether or not you work with us",
];

const agenda = [
  { step: "Your operation", desc: "How work moves today, and where it breaks down." },
  { step: "The bottleneck", desc: "Which single process is costing the most right now." },
  { step: "Options", desc: "Build, integrate, automate — or do nothing, if that is right." },
  { step: "Next steps", desc: "A clear recommendation and an indicative roadmap." },
];

export default function BookStrategyCallPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-950">
      <BackgroundFX />
      <Navbar />

      <section className="relative z-10 container-px pt-32 sm:pt-40">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="eyebrow">Free 30-minute call</div>
            <h1 className="section-title mt-5 text-white">
              Book a <span className="gradient-text">strategy call</span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-300">
              A focused conversation about where your operation is losing time
              and whether software would actually pay for itself. No pitch deck,
              no obligation.
            </p>

            <h2 className="mt-10 font-display text-xl font-bold text-white">
              What you get
            </h2>
            <ul className="mt-5 space-y-3">
              {expect.map((e) => (
                <li key={e} className="flex items-start gap-3">
                  <Check size={18} className="mt-0.5 shrink-0 text-accent-cyan" />
                  <span className="text-sm leading-relaxed text-slate-300">{e}</span>
                </li>
              ))}
            </ul>

            <h2 className="mt-10 font-display text-xl font-bold text-white">
              How the call runs
            </h2>
            <div className="mt-5 space-y-4">
              {agenda.map((a, i) => (
                <div
                  key={a.step}
                  className="rounded-2xl border border-navy-700/40 bg-navy-900/40 p-5"
                >
                  <div className="font-display text-sm font-bold gradient-text">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-1 font-display text-base font-bold text-white">
                    {a.step}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-300">
                    {a.desc}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-8 text-sm text-slate-400">
              Prefer email? Reach us at{" "}
              <a href={`mailto:${SITE.email}`} className="text-accent-glow hover:text-white">
                {SITE.email}
              </a>
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-navy-700/40 bg-gradient-to-b from-navy-850/60 to-navy-900/40 p-8 sm:p-10">
              <h2 className="font-display text-2xl font-bold text-white">
                Tell us about your business
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Five fields. We&apos;ll come back with times that suit your zone.
              </p>
              <div className="mt-8">
                <LeadForm
                  service="Strategy Call"
                  submitLabel="Book Strategy Call"
                  messageLabel="What would you like to solve?"
                  messagePlaceholder="e.g. Our team re-keys every order into three systems and month-end reporting takes four days."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="h-24" />
      </section>

      <Footer />
    </main>
  );
}

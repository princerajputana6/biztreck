import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundFX from "@/components/BackgroundFX";
import { getDb } from "@/lib/mongodb";
import Link from "next/link";
import { ArrowUpRight, Briefcase, MapPin, Clock, Banknote, Sparkles } from "lucide-react";

import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Careers — Join the Biztreck team",
  description:
    "Open roles at Biztreck Solutions. Build the next generation of websites, apps, DevOps platforms and growth playbooks alongside senior specialists from Greater Noida.",
  keywords: [
    "biztreck careers",
    "software engineer jobs Greater Noida",
    "remote react jobs india",
    "devops jobs",
    "frontend engineer hiring",
  ],
  alternates: { canonical: "/careers" },
  openGraph: {
    type: "website",
    title: "Careers at Biztreck Solutions",
    description: "Senior team, real ownership, no busywork. We're hiring.",
    url: "/careers",
  },
  twitter: {
    card: "summary_large_image",
    title: "Careers at Biztreck Solutions",
    description: "Senior team, real ownership, no busywork.",
  },
};

async function getJobs() {
  try {
    const db = await getDb();
    const all = await db
      .collection("jobs")
      .find({ active: { $ne: false } })
      .sort({ createdAt: -1 })
      .toArray();
    // Filter out malformed legacy docs missing slug/title
    return all.filter((j: any) => j?.slug && j?.title);
  } catch {
    return [];
  }
}

const perks = [
  "Remote-friendly · Hybrid HQ",
  "Senior team, no busywork",
  "Annual learning budget",
  "Health insurance",
  "Macbook + setup budget",
  "Flexible hours",
];

export default async function Careers() {
  const jobs = await getJobs();

  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-950">
      <BackgroundFX />
      <Navbar />

      <section className="relative z-10 pt-36 pb-12 sm:pt-40">
        <div className="container-px">
          <div className="eyebrow">Careers</div>
          <h1 className="mt-5 font-display text-5xl font-extrabold leading-tight text-white sm:text-6xl">
            Build the future of digital — <span className="gradient-text">with us.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            We hire senior, curious, kind people who care about craft. If
            shipping work that matters sounds fun, we&apos;d love to hear from
            you.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {perks.map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-2 rounded-full border border-navy-700/50 bg-navy-800/40 px-3 py-1.5 text-xs font-medium text-slate-200"
              >
                <Sparkles size={11} className="text-accent-glow" /> {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 pb-24">
        <div className="container-px">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold text-white">
              Open roles{" "}
              <span className="text-base font-normal text-slate-400">
                ({jobs.length})
              </span>
            </h2>
          </div>

          {jobs.length === 0 ? (
            <div className="glass rounded-3xl p-10 text-center">
              <Briefcase className="mx-auto mb-4 text-accent-glow" size={32} />
              <p className="text-lg text-slate-300">
                No open roles right now — but we&apos;re always open to
                exceptional talent.
              </p>
              <a
                href="mailto:connect@biztreck.world?subject=General%20application"
                className="btn-ghost mt-6 inline-flex"
              >
                Send us your CV
              </a>
            </div>
          ) : (
            <div className="grid gap-5">
              {jobs.map((j: any) => (
                <Link
                  key={String(j._id)}
                  href={`/careers/${j.slug}`}
                  className="group glass relative flex flex-col gap-4 overflow-hidden rounded-3xl p-6 transition-all hover:border-accent-electric/40 sm:p-8 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-accent-electric/10 blur-3xl transition-all group-hover:bg-accent-cyan/20" />
                  <div className="relative">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-navy-300">
                      {j.department}
                    </div>
                    <div className="mt-2 font-display text-2xl font-bold text-white group-hover:text-accent-glow">
                      {j.title}
                    </div>
                    <p className="mt-2 max-w-2xl text-sm text-slate-400">
                      {j.shortDescription}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-300">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={12} className="text-accent-glow" />{" "}
                        {j.location}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={12} className="text-accent-glow" /> {j.type}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Briefcase size={12} className="text-accent-glow" />{" "}
                        {j.experience}
                      </span>
                      {j.salary && (
                        <span className="inline-flex items-center gap-1.5">
                          <Banknote size={12} className="text-accent-glow" />{" "}
                          {j.salary}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <span className="inline-flex items-center gap-2 rounded-full bg-navy-800/60 px-5 py-2.5 text-sm font-semibold text-white transition-all group-hover:bg-accent-electric">
                      View role <ArrowUpRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

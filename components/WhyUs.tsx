"use client";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Users, Globe, Clock, Award } from "lucide-react";

const reasons = [
  {
    icon: Zap,
    title: "Fast turnarounds",
    desc: "MVPs in 4–8 weeks. Revamps in 2–6. We move fast without compromising quality.",
  },
  {
    icon: ShieldCheck,
    title: "Production-grade",
    desc: "Tested, monitored, secure by default. Every project ships with proper CI/CD.",
  },
  {
    icon: Users,
    title: "Senior team only",
    desc: "No juniors learning on your dime. Senior designers, engineers, and SREs.",
  },
  {
    icon: Globe,
    title: "Global delivery",
    desc: "Clients across India, UAE, US, EU. Async-first communication that respects time zones.",
  },
  {
    icon: Clock,
    title: "Transparent process",
    desc: "Live dashboards, weekly demos, shared Notion roadmap. You always know the status.",
  },
  {
    icon: Award,
    title: "Outcomes, not hours",
    desc: "Fixed-scope quotes, milestone-based billing, and a real focus on business outcomes.",
  },
];

export default function WhyUs() {
  return (
    <section id="why-us" className="relative z-10 py-28 sm:py-32">
      <div className="container-px">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="eyebrow">Why Biztreck</div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="section-title mt-5 text-white"
            >
              An agency that thinks like your{" "}
              <span className="gradient-text">in-house team.</span>
            </motion.h2>
            <p className="mt-6 text-lg text-slate-300">
              We blend product thinking, design, engineering and growth so you
              don&apos;t need to juggle five different vendors. One contract.
              One outcome. One team.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                "ISO-grade processes",
                "NDA-first engagements",
                "Source code ownership",
                "Post-launch support",
              ].map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-navy-700/50 bg-navy-800/40 px-4 py-1.5 text-xs font-medium text-slate-200"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid gap-5 sm:grid-cols-2">
              {reasons.map((r, i) => {
                const Icon = r.icon;
                return (
                  <motion.div
                    key={r.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.07 }}
                    whileHover={{ y: -4 }}
                    className="glass rounded-2xl p-5"
                  >
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-navy-700/60 ring-1 ring-navy-500/40">
                      <Icon size={18} className="text-accent-glow" />
                    </div>
                    <div className="mt-4 font-display text-lg font-semibold text-white">
                      {r.title}
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                      {r.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// Each problem links to the solution page that addresses it.
const problems = [
  { label: "Too many spreadsheets", slug: "custom-software" },
  { label: "Manual approvals", slug: "business-automation" },
  { label: "Disconnected software", slug: "business-automation" },
  { label: "Outdated website", slug: "website-development" },
  { label: "No CRM", slug: "crm-development" },
  { label: "No customer portal", slug: "customer-portals" },
  { label: "Poor reporting", slug: "dashboard-development" },
  { label: "Lost leads", slug: "crm-development" },
  { label: "Slow internal processes", slug: "erp-development" },
  { label: "No automation", slug: "ai-automation" },
];

const card = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.05, ease: "easeOut" as const },
  }),
};

export default function Problems() {
  return (
    <section id="problems" className="relative z-10 py-28 sm:py-32">
      <div className="container-px">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="eyebrow mx-auto"
          >
            Sound familiar?
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="section-title mt-5 text-white"
          >
            Problems <span className="gradient-text">we solve.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-5 text-lg text-slate-300"
          >
            Most growing businesses hit the same set of bottlenecks. Pick the one
            that costs you the most and we&apos;ll show you what fixing it looks
            like.
          </motion.p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {problems.map((p, i) => (
            <motion.div
              key={p.label}
              custom={i}
              variants={card}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
            >
              <Link
                href={`/solutions/${p.slug}`}
                className="group flex h-full items-start justify-between gap-2 rounded-2xl border border-navy-700/40 bg-navy-900/40 p-5 transition-colors hover:border-accent-electric"
              >
                <span className="text-sm font-medium leading-relaxed text-slate-200">
                  {p.label}
                </span>
                <ArrowUpRight
                  size={16}
                  className="mt-0.5 shrink-0 text-slate-600 transition-colors group-hover:text-accent-cyan"
                />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

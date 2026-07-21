"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const industries = [
  { name: "Healthcare", slug: "healthcare" },
  { name: "Construction", slug: "construction" },
  { name: "Manufacturing", slug: "manufacturing" },
  { name: "Finance", slug: "finance" },
  { name: "Logistics", slug: "logistics" },
  { name: "Education", slug: "education" },
  { name: "Real Estate", slug: "real-estate" },
  { name: "Professional Services", slug: "professional-services" },
];

const card = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: "easeOut" as const },
  }),
};

export default function IndustriesGrid() {
  return (
    <section id="industries" className="relative z-10 py-28 sm:py-32">
      <div className="container-px">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="eyebrow mx-auto"
          >
            Who we work with
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="section-title mt-5 text-white"
          >
            Built for your <span className="gradient-text">industry.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-5 text-lg text-slate-300"
          >
            Every sector has its own workflows and compliance obligations. We
            build around them instead of forcing a generic product to fit.
          </motion.p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {industries.map((ind, i) => (
            <motion.div
              key={ind.slug}
              custom={i}
              variants={card}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              whileHover={{ y: -4 }}
            >
              <Link
                href={`/industries/${ind.slug}`}
                className="group flex h-full items-center justify-between gap-2 rounded-2xl border border-navy-700/40 bg-gradient-to-b from-navy-850/60 to-navy-900/40 p-6 transition-colors hover:border-accent-electric"
              >
                <span className="font-display text-base font-bold text-white">
                  {ind.name}
                </span>
                <ArrowUpRight
                  size={16}
                  className="shrink-0 text-slate-600 transition-colors group-hover:text-accent-cyan"
                />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

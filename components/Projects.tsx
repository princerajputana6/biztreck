"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, Boxes } from "lucide-react";
import {
  projectCategories,
  projectsByCategory,
  type Project,
} from "@/lib/projects";

const MAX_VISIBLE = 4;

const card = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: "easeOut" as const },
  }),
};

function ProjectCard({ p, i }: { p: Project; i: number }) {
  return (
    <motion.article
      custom={i}
      variants={card}
      initial="hidden"
      animate="show"
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-3xl border border-navy-700/40 bg-gradient-to-br from-navy-850/70 to-navy-900/50 p-7 shine sm:p-9"
    >
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl transition-all duration-700 group-hover:scale-110"
        style={{ background: p.accentSoft }}
      />

      <div className="relative flex items-start justify-between">
        {p.logo ? (
          <Image
            src={p.logo}
            alt={`${p.name} logo`}
            width={80}
            height={80}
            className="h-20 w-20 object-contain"
          />
        ) : (
          <div
            className={`relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${p.accent} shadow-glow`}
            style={{ boxShadow: `0 0 30px ${p.glow}` }}
          >
            <Boxes className="text-white" size={26} />
            <span className="absolute -inset-1 rounded-2xl border border-white/20" />
          </div>
        )}

        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
          <span className="relative grid h-1.5 w-1.5 place-items-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          {p.status}
        </span>
      </div>

      <h3 className="relative mt-6 font-display text-3xl font-extrabold text-white">
        {p.name}
      </h3>
      <p className="relative mt-1.5 text-sm font-medium uppercase tracking-wider text-navy-300">
        {p.tagline}
      </p>
      <p className="relative mt-4 text-[15px] leading-relaxed text-slate-300">
        {p.description}
      </p>

      <div className="relative mt-6 flex flex-wrap gap-2">
        {p.tags.map((t) => (
          <span
            key={t}
            className="rounded-full border border-navy-700/50 bg-navy-800/50 px-3 py-1 text-[11px] font-medium text-slate-200"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="relative mt-7 flex items-center justify-between">
        <Link
          href={`/portfolio?category=${p.category}`}
          className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-accent-cyan"
        >
          A Biztreck product
        </Link>
        <a
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-navy-800/60 px-4 py-2 text-xs font-semibold text-white transition-all group-hover:bg-accent-electric"
        >
          Launch site <ArrowUpRight size={12} />
        </a>
      </div>
    </motion.article>
  );
}

export default function Projects({ projects }: { projects: Project[] }) {
  const categories = useMemo(() => projectCategories(projects), [projects]);
  const [active, setActive] = useState<string>("all");

  const filtered = projectsByCategory(projects, active);

  // Nothing to show yet (e.g. no clients seeded, or the DB is unreachable) —
  // hide the whole section rather than render an empty grid.
  if (!projects.length) return null;

  const visible = filtered.slice(0, MAX_VISIBLE);
  const hasMore = filtered.length > MAX_VISIBLE;

  // "See all" goes to the category listing; for "all" it goes to the full portfolio.
  const seeAllHref =
    active === "all" ? "/portfolio" : `/portfolio?category=${active}`;

  const tabs = [
    { slug: "all", label: "All", count: projects.length },
    ...categories,
  ];

  return (
    <section id="products" className="relative z-10 py-28 sm:py-32">
      <div className="container-px">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="eyebrow mx-auto"
          >
            Our work
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="section-title mt-5 text-white"
          >
            Products we&apos;ve <span className="gradient-text">built.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-5 text-lg text-slate-300"
          >
            Platforms we designed, built and run ourselves — the same engineering
            we bring to client work.
          </motion.p>
        </div>

        {/* Category tabs */}
        <div className="mt-12 flex flex-wrap justify-center gap-2">
          {tabs.map((t) => {
            const isActive = active === t.slug;
            return (
              <button
                key={t.slug}
                type="button"
                onClick={() => setActive(t.slug)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-accent-cyan/40 bg-accent-cyan/15 text-white"
                    : "border-navy-700/50 bg-navy-900/50 text-slate-300 hover:border-accent-electric hover:text-white"
                }`}
              >
                {t.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] ${
                    isActive
                      ? "bg-accent-cyan/20 text-accent-cyan"
                      : "bg-navy-800/80 text-slate-500"
                  }`}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Cards — max 4 at a time */}
        <div className="mt-12 grid gap-7 lg:grid-cols-2">
          <AnimatePresence mode="wait">
            {visible.map((p, i) => (
              <ProjectCard key={`${active}-${p.slug}`} p={p} i={i} />
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-12 flex justify-center">
          <Link href={seeAllHref} className="btn-ghost inline-flex items-center gap-2">
            See all
            {active !== "all" && ` ${tabs.find((t) => t.slug === active)?.label}`}
            {hasMore ? ` (${filtered.length})` : ""}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

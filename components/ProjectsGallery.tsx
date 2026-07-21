"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { ArrowUpRight, Boxes } from "lucide-react";
import {
  PROJECTS,
  PROJECT_CATEGORY_LABELS,
  projectCategories,
  projectsByCategory,
} from "@/lib/projects";

const card = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: "easeOut" as const },
  }),
};

export default function ProjectsGallery() {
  const router = useRouter();
  const params = useSearchParams();
  const active = params.get("category") || "all";

  const categories = useMemo(() => projectCategories(), []);
  const filtered = projectsByCategory(active);
  const activeLabel =
    active === "all" ? "All work" : PROJECT_CATEGORY_LABELS[active] || active;

  const select = (slug: string) => {
    router.push(slug === "all" ? "/portfolio" : `/portfolio?category=${slug}`, {
      scroll: false,
    });
  };

  const tabs = [
    { slug: "all", label: "All", count: PROJECTS.length },
    ...categories,
  ];

  return (
    <>
      <div className="mt-10 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const isActive = active === t.slug;
          return (
            <button
              key={t.slug}
              type="button"
              onClick={() => select(t.slug)}
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

      <p className="mt-6 text-sm text-slate-400">
        Showing <span className="text-white">{filtered.length}</span>{" "}
        {filtered.length === 1 ? "project" : "projects"} in {activeLabel}.
        {active !== "all" && (
          <>
            {" "}
            Explore the{" "}
            <Link
              href={`/solutions/${active}`}
              className="text-accent-glow hover:text-white"
            >
              {PROJECT_CATEGORY_LABELS[active]} solution
            </Link>
            .
          </>
        )}
      </p>

      <div className="mt-10 grid gap-7 lg:grid-cols-2">
        {filtered.map((p, i) => (
          <motion.article
            key={p.slug}
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
              <Link
                href={`/solutions/${p.category}`}
                className="rounded-full border border-navy-700/50 bg-navy-800/50 px-3 py-1 text-[11px] font-medium text-slate-300 transition-colors hover:border-accent-electric hover:text-white"
              >
                {PROJECT_CATEGORY_LABELS[p.category] || p.category}
              </Link>
            </div>

            <h2 className="relative mt-6 font-display text-3xl font-extrabold text-white">
              {p.name}
            </h2>
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
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                {p.status}
              </span>
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
        ))}
      </div>
    </>
  );
}

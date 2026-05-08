"use client";
import { motion } from "framer-motion";
import {
  RefreshCw,
  Code2,
  ServerCog,
  TrendingUp,
  Rocket,
  Smartphone,
} from "lucide-react";

const services = [
  {
    icon: RefreshCw,
    title: "Website Revamp",
    desc: "Modernise outdated websites with new design systems, faster performance, and conversion-focused UX — without losing your SEO.",
    bullets: ["UI/UX redesign", "Performance audit", "SEO migration"],
  },
  {
    icon: Code2,
    title: "Web Development",
    desc: "Production-grade websites and web apps built with Next.js, React, and modern stacks — pixel-perfect and lightning fast.",
    bullets: ["Next.js / React", "Headless CMS", "API integrations"],
  },
  {
    icon: Smartphone,
    title: "App Development",
    desc: "Native-quality iOS, Android, and cross-platform apps with React Native and Flutter — from MVP to App Store launch.",
    bullets: ["iOS & Android", "React Native", "Cross-platform"],
  },
  {
    icon: ServerCog,
    title: "DevOps Solutions",
    desc: "CI/CD pipelines, container orchestration, cloud architecture, and observability so your team ships safer and faster.",
    bullets: ["AWS / GCP / Azure", "Kubernetes & Docker", "CI/CD automation"],
  },
  {
    icon: TrendingUp,
    title: "SEO & Ranking",
    desc: "Climb Google with technical SEO, content strategy, and link building — measurable growth, transparent reporting.",
    bullets: ["Technical SEO", "Keyword strategy", "Content & backlinks"],
  },
  {
    icon: Rocket,
    title: "Startup Launch (Zero → 1)",
    desc: "From an idea on a napkin to a launched product. Branding, MVP build, infrastructure, and go-to-market — all in one place.",
    bullets: ["MVP in weeks", "Brand & identity", "Go-to-market"],
  },
];

const card = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

export default function Services() {
  return (
    <section id="services" className="relative z-10 py-28 sm:py-32">
      <div className="container-px">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="eyebrow mx-auto"
          >
            What we do
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="section-title mt-5 text-white"
          >
            Six services. <span className="gradient-text">One team.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-5 text-lg text-slate-300"
          >
            End-to-end execution from design and engineering to growth and
            infrastructure — handled by senior specialists who care about your
            outcomes.
          </motion.p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.article
                key={s.title}
                custom={i}
                variants={card}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-3xl border border-navy-700/40 bg-gradient-to-b from-navy-850/60 to-navy-900/40 p-7 shine"
              >
                <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-accent-electric/15 blur-3xl transition-all duration-500 group-hover:bg-accent-cyan/25" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-navy-500 to-navy-700 shadow-glow">
                  <Icon className="text-accent-glow" size={22} />
                </div>
                <h3 className="relative mt-5 font-display text-xl font-bold text-white">
                  {s.title}
                </h3>
                <p className="relative mt-3 text-sm leading-relaxed text-slate-300">
                  {s.desc}
                </p>
                <ul className="relative mt-5 space-y-1.5">
                  {s.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-center gap-2 text-sm text-slate-300"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan" />
                      {b}
                    </li>
                  ))}
                </ul>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

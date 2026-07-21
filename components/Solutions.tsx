"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  Building2,
  Code2,
  Database,
  Globe,
  LayoutDashboard,
  Users,
  UserCheck,
  Workflow,
} from "lucide-react";

// Order matters: custom software, AI and automation lead. Website is an entry
// point, not the hero service.
const solutions = [
  {
    icon: Code2,
    title: "Custom Software",
    slug: "custom-software",
    problem: "Spreadsheets and tools that almost fit.",
    solution: "Software modelled on your real workflows.",
    outcome: "Less manual work, a platform that scales.",
  },
  {
    icon: Bot,
    title: "AI Automation",
    slug: "ai-automation",
    problem: "Hours lost to repetitive reading and replying.",
    solution: "AI assistants wired into your real systems.",
    outcome: "Faster responses, hours returned to the team.",
  },
  {
    icon: Workflow,
    title: "Business Automation",
    slug: "business-automation",
    problem: "Your systems don't talk, so people bridge them.",
    solution: "API integrations and automated approvals.",
    outcome: "Work moves on its own, with no re-keying.",
  },
  {
    icon: Globe,
    title: "Website Development",
    slug: "website-development",
    problem: "A dated site that generates almost no enquiries.",
    solution: "A fast, SEO-ready site built around buyer intent.",
    outcome: "More qualified leads without more ad spend.",
  },
  {
    icon: Users,
    title: "CRM Development",
    slug: "crm-development",
    problem: "Your CRM doesn't match how you actually sell.",
    solution: "A CRM built around your stages and quoting.",
    outcome: "Cleaner pipeline and reporting you can trust.",
  },
  {
    icon: Database,
    title: "ERP Systems",
    slug: "erp-development",
    problem: "A legacy system nobody can safely change.",
    solution: "Modular ERP rolled out one area at a time.",
    outcome: "Modernisation without a risky rip-and-replace.",
  },
  {
    icon: UserCheck,
    title: "Customer Portals",
    slug: "customer-portals",
    problem: "Customers email your team for every update.",
    solution: "A secure portal exposing their data live.",
    outcome: "Lower support load, faster answers.",
  },
  {
    icon: Building2,
    title: "Vendor Portals",
    slug: "vendor-portals",
    problem: "Chasing suppliers for documents and invoices.",
    solution: "Vendors maintain their own data and submit direct.",
    outcome: "Less admin and current compliance documents.",
  },
  {
    icon: LayoutDashboard,
    title: "Business Dashboards",
    slug: "dashboard-development",
    problem: "Reporting means exporting into a spreadsheet.",
    solution: "Live dashboards unifying your source systems.",
    outcome: "Decisions on current numbers, not last month's.",
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

export default function Solutions() {
  return (
    <section id="solutions" className="relative z-10 py-28 sm:py-32">
      <div className="container-px">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="eyebrow mx-auto"
          >
            What we build
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="section-title mt-5 text-white"
          >
            Software that replaces{" "}
            <span className="gradient-text">manual work.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-5 text-lg text-slate-300"
          >
            We help growing businesses automate operations, modernise outdated
            systems, and build scalable software that drives measurable growth.
          </motion.p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((s, i) => {
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
                <p className="relative mt-3 text-sm leading-relaxed text-slate-400">
                  {s.problem}
                </p>
                <p className="relative mt-3 text-sm leading-relaxed text-slate-300">
                  {s.solution}
                </p>
                <p className="relative mt-3 flex items-start gap-2 text-sm leading-relaxed text-slate-200">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-cyan" />
                  {s.outcome}
                </p>
                <Link
                  href={`/solutions/${s.slug}`}
                  className="relative mt-6 inline-flex items-center gap-1 text-sm font-semibold text-accent-glow transition-colors hover:text-white"
                >
                  Explore {s.title}
                  <ArrowUpRight size={14} />
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

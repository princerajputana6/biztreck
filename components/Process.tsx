"use client";
import { motion } from "framer-motion";
import {
  ClipboardCheck,
  Code,
  Compass,
  LayoutGrid,
  LineChart,
  PenTool,
  Rocket,
  SearchCheck,
} from "lucide-react";

const steps = [
  {
    icon: Compass,
    title: "Discovery call",
    desc: "A focused conversation about where work slows down and what growth is blocked by.",
  },
  {
    icon: SearchCheck,
    title: "Business audit",
    desc: "We map your current workflows, systems and data, then quantify the opportunity in hours and cost.",
  },
  {
    icon: LayoutGrid,
    title: "Solution planning",
    desc: "A phased roadmap with clear scope, milestones and fixed costs — sequenced by payback.",
  },
  {
    icon: PenTool,
    title: "UX & architecture",
    desc: "Screens, data model and system architecture agreed before a line of production code.",
  },
  {
    icon: Code,
    title: "Development",
    desc: "Short, reviewable increments with working previews you can use at every milestone.",
  },
  {
    icon: ClipboardCheck,
    title: "Testing",
    desc: "Automated tests, security review and user acceptance against the agreed scope.",
  },
  {
    icon: Rocket,
    title: "Launch",
    desc: "Data migration, training and a controlled go-live — with the old system running alongside where needed.",
  },
  {
    icon: LineChart,
    title: "Continuous improvement",
    desc: "Real usage data drives the next iteration. The highest-value changes appear after launch.",
  },
];

export default function Process() {
  return (
    <section id="process" className="relative z-10 py-28 sm:py-32">
      <div className="container-px">
        <div className="mx-auto max-w-3xl text-center">
          <div className="eyebrow mx-auto">How we work</div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="section-title mt-5 text-white"
          >
            A predictable path from{" "}
            <span className="gradient-text">idea to scale.</span>
          </motion.h2>
        </div>

        <div className="relative mt-20">
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-navy-500/40 to-transparent lg:block" />

          <div className="space-y-10">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const left = i % 2 === 0;
              return (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, x: left ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6 }}
                  className="relative grid items-center gap-6 lg:grid-cols-2"
                >
                  <div
                    className={`glass rounded-3xl p-6 sm:p-8 ${
                      left ? "lg:col-start-1 lg:pr-12" : "lg:col-start-2 lg:pl-12"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-navy-500 to-accent-electric shadow-glow">
                        <Icon size={18} className="text-white" />
                      </div>
                      <div className="font-mono text-xs uppercase tracking-[0.2em] text-navy-300">
                        Step 0{i + 1}
                      </div>
                    </div>
                    <h3 className="mt-4 font-display text-2xl font-bold text-white">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-slate-300">{s.desc}</p>
                  </div>

                  <div className="hidden lg:block" />

                  <motion.div
                    className="absolute left-1/2 hidden h-4 w-4 -translate-x-1/2 rounded-full bg-accent-cyan shadow-glow lg:block"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

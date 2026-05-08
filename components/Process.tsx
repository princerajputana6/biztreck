"use client";
import { motion } from "framer-motion";
import { Compass, PenTool, Code, Rocket, LineChart } from "lucide-react";

const steps = [
  {
    icon: Compass,
    title: "Discovery",
    desc: "We listen, audit, and turn your goals into a clear, prioritised roadmap.",
  },
  {
    icon: PenTool,
    title: "Design",
    desc: "Wireframes, brand-aligned UI and user flows — validated before a line of code.",
  },
  {
    icon: Code,
    title: "Build",
    desc: "Senior engineers ship in weekly sprints with full visibility on Slack & GitHub.",
  },
  {
    icon: Rocket,
    title: "Launch",
    desc: "CI/CD-driven release, infra hardening, and a smooth go-live with zero downtime.",
  },
  {
    icon: LineChart,
    title: "Grow",
    desc: "Monitoring, SEO, A/B testing and iteration — we stay with you after launch.",
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

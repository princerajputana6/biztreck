"use client";
import { motion } from "framer-motion";

const tech = [
  "React",
  "Next.js",
  "Node.js",
  "PostgreSQL",
  "OpenAI",
  "AWS",
  "Cloudflare",
];

export default function TrustStrip() {
  return (
    <section className="relative z-10 border-y border-navy-700/30 py-10">
      <div className="container-px">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs uppercase tracking-[0.18em] text-slate-500"
        >
          Trusted technologies
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
        >
          {tech.map((t) => (
            <span
              key={t}
              className="font-display text-lg font-bold text-slate-400 transition-colors hover:text-white sm:text-xl"
            >
              {t}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

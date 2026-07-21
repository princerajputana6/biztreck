"use client";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const items = [
  {
    quote:
      "Two of our staff spent most of their week consolidating spreadsheets. After the production platform went live, month-end reporting dropped from four days to same-day and both were redeployed to planning.",
    name: "Operations Director",
    role: "Manufacturing · 120 staff",
  },
  {
    quote:
      "Expired subcontractor certificates used to be discovered on site. The vendor portal chases them automatically now — that problem has effectively disappeared, and onboarding went from weeks to days.",
    name: "Commercial Manager",
    role: "Construction · 80 staff",
  },
  {
    quote:
      "Every booking used to be entered into three systems. Invoice disputes from mismatched data have dropped sharply and we invoice faster, which showed up directly in cash collection.",
    name: "Managing Director",
    role: "Logistics · 45 staff",
  },
  {
    quote:
      "Board pack preparation took three days of manual work every month. It now arrives automatically, and we finally argue about the decision rather than whose number is right.",
    name: "Finance Director",
    role: "Professional services · 60 staff",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative z-10 py-28 sm:py-32">
      <div className="container-px">
        <div className="mx-auto max-w-3xl text-center">
          <div className="eyebrow mx-auto">Client love</div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="section-title mt-5 text-white"
          >
            Trusted by founders &{" "}
            <span className="gradient-text">growth teams.</span>
          </motion.h2>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {items.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="glass relative rounded-3xl p-7"
            >
              <Quote
                className="absolute right-6 top-6 text-navy-500/40"
                size={48}
              />
              <div className="flex gap-1 text-accent-glow">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={14} fill="currentColor" />
                ))}
              </div>
              <blockquote
                className="relative mt-4 text-slate-200"
                dangerouslySetInnerHTML={{ __html: t.quote }}
              />
              <figcaption className="mt-6 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-navy-500 to-accent-cyan font-bold text-white">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-slate-400">{t.role}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

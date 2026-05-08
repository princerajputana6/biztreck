"use client";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const items = [
  {
    quote:
      "Biztreck rebuilt our entire e-commerce site in 5 weeks. Page speed jumped 3x and conversions are up 47%. The team felt like part of our company.",
    name: "Aarav Mehta",
    role: "Founder, NovaCart",
  },
  {
    quote:
      "From a Figma sketch to a live mobile app on the App Store in under 8 weeks. Their senior team handled engineering, infra, and our launch flawlessly.",
    name: "Sara Khan",
    role: "CEO, Pulsewell Health",
  },
  {
    quote:
      "Their DevOps team migrated us to AWS and set up CI/CD that cut our deploy time from 40 minutes to 4. Zero downtime through the whole migration.",
    name: "Daniel Rivera",
    role: "CTO, Lumenly",
  },
  {
    quote:
      "We grew organic traffic 5x in 6 months. Biztreck&apos;s SEO process is the most transparent I&apos;ve worked with — every dollar tied to a metric.",
    name: "Priya Iyer",
    role: "Head of Growth, Trillo",
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

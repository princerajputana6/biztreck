"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Baby,
  HardHat,
  BrainCircuit,
  UtensilsCrossed,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  Compass,
  Landmark,
} from "lucide-react";

const products = [
  {
    name: "KuddlKin",
    slug: "kuddlkin",
    tagline: "Premium childcare at your doorstep",
    description:
      "We connect parents with trusted, verified childcare professionals. From spontaneous date nights to regular nanny care, KuddlKin ensures your little ones are in safe, loving hands while having the time of their lives.",
    Icon: Baby,
    logo: "/assets/brands/kuddl-kin.svg",
    tags: ["B2C App", "Marketplace", "Verified pros"],
    status: "Live",
    url: "https://kuddl.co/",
    accent: "from-pink-400 to-rose-500",
    accentSoft: "rgba(244, 114, 182, 0.18)",
    glow: "rgba(244, 114, 182, 0.45)",
  },
  {
    name: "Buildifai",
    slug: "buildifai",
    tagline: "Construction materials & builders, all in one place",
    description:
      "A marketplace where you can buy construction materials online and book trusted builders to get complete project solutions — from bricks to handover.",
    Icon: HardHat,
    logo: "/assets/brands/buildify-logo.png",
    tags: ["Marketplace", "Construction", "Logistics"],
    status: "Live",
    url: "https://buildifai.vercel.app",
    accent: "from-amber-400 to-orange-500",
    accentSoft: "rgba(251, 146, 60, 0.18)",
    glow: "rgba(251, 146, 60, 0.45)",
  },
  {
    name: "Rezulaizer",
    slug: "rezulaizer",
    tagline: "Hire smarter with AI intelligence",
    description:
      "Transform your recruitment with AI-powered resume parsing, intelligent candidate matching, and automated assessments — so you screen 10x faster and hire 3x better.",
    Icon: BrainCircuit,
    logo: "/assets/brands/rezulaizer.png",
    tags: ["AI / ML", "B2B SaaS", "HR Tech"],
    status: "Live",
    url: "https://www.rezulaizer.com",
    accent: "from-violet-400 to-fuchsia-500",
    accentSoft: "rgba(167, 139, 250, 0.18)",
    glow: "rgba(167, 139, 250, 0.45)",
  },
  {
    name: "Atithira",
    slug: "atithira",
    tagline: "Full-fledged ERP for restaurants & hotels",
    description:
      "Customers scan a QR at the table to place orders, and managers get a complete operations stack — kitchen, billing, inventory, staff and analytics — in one tight ERP.",
    Icon: UtensilsCrossed,
    logo: "/assets/brands/atithira.jpeg",
    tags: ["Restaurant", "ERP", "QR ordering"],
    status: "Live",
    url: "https://atithira.vercel.app",
    accent: "from-cyan-400 to-emerald-500",
    accentSoft: "rgba(34, 211, 238, 0.18)",
    glow: "rgba(34, 211, 238, 0.45)",
  },
  {
    name: "REP",
    slug: "rep",
    tagline: "Resource planning, reimagined",
    description:
      "One platform for capacity, allocations, financials, and your whole project portfolio. AI-powered resource matching, predictive 12-month forecasting, and multi-agency networking — so your team runs leaner and every deadline lands.",
    Icon: BarChart3,
    tags: ["AI / ML", "B2B SaaS", "Resource Planning"],
    status: "Live",
    url: "https://rep.vercel.app/",
    accent: "from-blue-400 to-indigo-500",
    accentSoft: "rgba(96, 165, 250, 0.18)",
    glow: "rgba(96, 165, 250, 0.45)",
  },
  {
    name: "SafarMates",
    slug: "safarmates",
    tagline: "Ride beyond the horizon",
    description:
      "Curated motorbike expeditions, scenic bus journeys, and once-in-a-lifetime escapes across the Himalayas, Vietnam, Iceland, and beyond — crafted for travelers who prefer the long way around.",
    Icon: Compass,
    tags: ["Travel", "Adventure", "Marketplace"],
    status: "Live",
    url: "https://safarmates.vercel.app/",
    accent: "from-green-400 to-teal-500",
    accentSoft: "rgba(52, 211, 153, 0.18)",
    glow: "rgba(52, 211, 153, 0.45)",
  },
  {
    name: "BookMyGuide",
    slug: "bookmyguide",
    tagline: "Discover India's heritage with expert local guides",
    description:
      "Connect with verified local guides across 50+ heritage destinations in India. From the ghats of Varanasi to the palaces of Jaipur — compare ratings, book securely, and explore in depth.",
    Icon: Landmark,
    tags: ["Travel", "Heritage", "India"],
    status: "Live",
    url: "https://www.bookmyguide.in/",
    accent: "from-amber-400 to-yellow-500",
    accentSoft: "rgba(251, 191, 36, 0.18)",
    glow: "rgba(251, 191, 36, 0.45)",
  },
];

const card = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

export default function Products() {
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
            <Sparkles size={12} /> Our products
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="section-title mt-5 text-white"
          >
            We don&apos;t just build for clients. <br className="hidden sm:block" />
            <span className="gradient-text">We build for the world.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-5 text-lg text-slate-300"
          >
            A growing portfolio of in-house products solving real problems
            across childcare, construction, hiring, and hospitality.
          </motion.p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {products.map((p, i) => {
            const Icon = p.Icon;
            return (
              <motion.article
                key={p.slug}
                custom={i}
                variants={card}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-3xl border border-navy-700/40 bg-gradient-to-br from-navy-850/70 to-navy-900/50 p-7 shine sm:p-9"
              >
                {/* Glow accent */}
                <div
                  className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl transition-all duration-700 group-hover:scale-110"
                  style={{ background: p.accentSoft }}
                />

                <div className="relative flex items-start justify-between">
                  <div
                    className={`relative grid h-14 w-14 place-items-center rounded-2xl ${p.logo ? 'bg-white' : `bg-gradient-to-br ${p.accent}`} shadow-glow`}
                    style={{ boxShadow: `0 0 30px ${p.glow}` }}
                  >
                    {p.logo ? (
                      <Image
                        src={p.logo}
                        alt={`${p.name} logo`}
                        width={56}
                        height={56}
                        className="h-14 w-14 rounded-2xl object-cover p-2"
                      />
                    ) : (
                      <Icon className="text-white" size={26} />
                    )}
                    <span className="absolute -inset-1 rounded-2xl border border-white/20" />
                  </div>

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
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                    A Biztreck product
                  </span>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 rounded-full bg-navy-800/60 px-4 py-2 text-xs font-semibold text-white transition-all group-hover:bg-accent-electric"
                  >
                    Launch site <ArrowUpRight size={12} />
                  </a>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Footer CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl px-6 py-6 sm:flex-row sm:px-8"
        >
          <div>
            <div className="font-display text-lg font-bold text-white">
              Have an idea you want built like this?
            </div>
            <div className="mt-1 text-sm text-slate-400">
              We&apos;ve done it 7 times for ourselves — we&apos;ll do it for you too.
            </div>
          </div>
          <a href="#contact" className="btn-primary shine whitespace-nowrap">
            Start your product →
          </a>
        </motion.div>
      </div>
    </section>
  );
}

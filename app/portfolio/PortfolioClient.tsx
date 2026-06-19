"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowUpRight,
  Quote,
  Star,
  MapPin,
  Mail,
  Globe,
  Building2,
  Zap,
  ShieldCheck,
  Users,
  RefreshCw,
  Code2,
  Smartphone,
  Server,
  TrendingUp,
  Rocket,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";

/* ─── DATA ─────────────────────────────────────────────────── */

const stats = [
  { num: "120+", label: "Projects shipped" },
  { num: "30+", label: "Startups launched" },
  { num: "98%", label: "Client retention" },
  { num: "5×", label: "Avg. organic uplift" },
];

const highlights = [
  { icon: <Users size={16} />, title: "Senior team only", desc: "No juniors on your project. Senior designers, engineers, and DevOps specialists throughout." },
  { icon: <Zap size={16} />, title: "Fast turnarounds", desc: "MVPs in 4–8 weeks. Website revamps in 2–6 weeks. We move without cutting corners." },
  { icon: <Globe size={16} />, title: "Global delivery", desc: "Clients across India, UAE, US, and EU. Async-first communication that respects time zones." },
  { icon: <ShieldCheck size={16} />, title: "NDA-first & code ownership", desc: "Every engagement begins with an NDA. You own 100% of the code at handover." },
];

const services = [
  { icon: <RefreshCw size={20} />, title: "Website Revamp", desc: "Modernise outdated websites with new design systems, faster performance, and conversion-focused UX — without losing SEO equity.", tags: ["UI/UX redesign", "Performance audit", "SEO migration"], accent: "from-blue-400 to-indigo-500", soft: "rgba(96,165,250,0.12)" },
  { icon: <Code2 size={20} />, title: "Web Development", desc: "Production-grade websites and web apps built with Next.js, React, and modern stacks — pixel-perfect and lightning fast.", tags: ["Next.js / React", "Headless CMS", "API integrations"], accent: "from-cyan-400 to-blue-500", soft: "rgba(34,211,238,0.12)" },
  { icon: <Smartphone size={20} />, title: "App Development", desc: "Native-quality iOS, Android, and cross-platform apps with React Native and Flutter — from MVP to App Store launch.", tags: ["iOS & Android", "React Native", "Flutter"], accent: "from-violet-400 to-fuchsia-500", soft: "rgba(167,139,250,0.12)" },
  { icon: <Server size={20} />, title: "DevOps Solutions", desc: "CI/CD pipelines, container orchestration, cloud architecture, and observability so your team ships safer and faster.", tags: ["AWS / GCP / Azure", "Kubernetes", "CI/CD"], accent: "from-emerald-400 to-cyan-500", soft: "rgba(52,211,153,0.12)" },
  { icon: <TrendingUp size={20} />, title: "SEO & Ranking", desc: "Climb Google with technical SEO, content strategy, and link building. Measurable growth with transparent reporting.", tags: ["Technical SEO", "Keyword strategy", "Link building"], accent: "from-amber-400 to-orange-500", soft: "rgba(251,146,60,0.12)" },
  { icon: <Rocket size={20} />, title: "Startup Launch (0 → 1)", desc: "From an idea on a napkin to a launched product. Branding, MVP, infrastructure, and go-to-market — all in one place.", tags: ["MVP in weeks", "Brand & identity", "Go-to-market"], accent: "from-rose-400 to-pink-500", soft: "rgba(251,113,133,0.12)" },
];

const products = [
  { name: "KuddlKin", cat: "Childcare · B2C Marketplace", desc: "Connects parents with trusted, verified childcare professionals. From spontaneous date nights to regular nanny care — safe, verified, on-demand.", tags: ["B2C App", "Marketplace"], url: "https://kuddl.co", urlLabel: "kuddl.co", logo: "/assets/brands/kuddl-kin.svg", accent: "from-pink-400 to-rose-500", soft: "rgba(244,114,182,0.15)" },
  { name: "Buildifai", cat: "Construction · Marketplace", desc: "Buy construction materials online and book trusted builders — from bricks to handover. One platform for complete construction solutions.", tags: ["Marketplace", "Logistics"], url: "https://buildifai.vercel.app", urlLabel: "buildifai.vercel.app", logo: "/assets/brands/buildify-logo.png", accent: "from-amber-400 to-orange-500", soft: "rgba(251,146,60,0.15)" },
  { name: "Rezulaizer", cat: "HR Tech · AI / ML", desc: "AI-powered resume parsing, intelligent candidate matching, and automated assessments. Screen 10× faster, hire 3× better.", tags: ["AI / ML", "B2B SaaS"], url: "https://rezulaizer.com", urlLabel: "rezulaizer.com", logo: "/assets/brands/rezulaizer.png", accent: "from-violet-400 to-fuchsia-500", soft: "rgba(167,139,250,0.15)" },
  { name: "TryLinqr", cat: "Events · Ticketing", desc: "India's premium event ecosystem. Discover and book India's best events — bike rides, food experiences, workshops, festivals — in under 2 minutes.", tags: ["Events", "Ticketing"], url: "https://trylinqr.com", urlLabel: "trylinqr.com", logo: "/assets/brands/trylinqr.webp", accent: "from-fuchsia-400 to-pink-500", soft: "rgba(232,121,249,0.15)" },
  { name: "Atithira", cat: "Restaurant Tech · ERP", desc: "Full-fledged ERP for restaurants and hotels. QR table ordering, kitchen management, billing, inventory, staff, and analytics in one platform.", tags: ["Restaurant ERP", "QR ordering"], url: "https://atithira.vercel.app", urlLabel: "atithira.vercel.app", logo: "/assets/brands/atithira.jpeg", accent: "from-cyan-400 to-emerald-500", soft: "rgba(34,211,238,0.15)" },
  { name: "Angels & Roadsters", cat: "Community · Motorcycle", desc: "India's first gender-equal bike club — 26,000+ members, 200+ rides across 15+ cities, flagship festival Trailstorm.", tags: ["Community", "India"], url: "https://angelsandroadsters.com", urlLabel: "angelsandroadsters.com", logo: "/assets/brands/angeles-roadsters.png", accent: "from-orange-400 to-amber-500", soft: "rgba(251,146,60,0.15)" },
];

const steps = [
  { n: "01", title: "Discovery", desc: "We listen, audit your existing stack and market position, then turn your goals into a clear roadmap with timelines and a fixed-scope quote." },
  { n: "02", title: "Design", desc: "Wireframes, brand-aligned UI, and user flows — validated with you before a single line of code is written. You approve before we build." },
  { n: "03", title: "Build", desc: "Senior engineers ship in weekly sprints with full visibility on Slack and GitHub. Weekly demos keep you in the loop — no black boxes." },
  { n: "04", title: "Launch", desc: "CI/CD-driven release, infrastructure hardening, and a smooth go-live with zero downtime. We handle the full technical handover checklist." },
  { n: "05", title: "Grow", desc: "Post-launch monitoring, SEO, A/B testing, and iteration — we stay with you after go-live so your product keeps improving over time." },
];

const stack = [
  { label: "Frontend", items: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion"] },
  { label: "Mobile", items: ["React Native", "Flutter", "Expo", "iOS (TestFlight)", "Android (Play)"] },
  { label: "Backend / DB", items: ["Node.js", "Python", "MongoDB Atlas", "PostgreSQL", "Redis"] },
  { label: "Cloud / DevOps", items: ["AWS / GCP / Azure", "Kubernetes", "Docker", "Vercel", "GitHub Actions"] },
];

const testimonials = [
  { quote: "The marketplace was live in under 6 weeks. Parents trust the platform because verification works seamlessly — and the app performance has been flawless since launch.", company: "KuddlKin", category: "Childcare Marketplace", logo: "/assets/brands/kuddl-kin.svg", initials: "KK", color: "from-pink-400 to-rose-500" },
  { quote: "From ordering materials to booking contractors, everything is on one screen now. The logistics integration alone saved us days of back-and-forth every week.", company: "Buildifai", category: "Construction Platform", logo: "/assets/brands/buildify-logo.png", initials: "BF", color: "from-amber-400 to-orange-500" },
  { quote: "Parsing 500 resumes used to take a recruiter two days. Rezulaizer does it in minutes with better matching than manual review. The AI ranking is genuinely accurate.", company: "Rezulaizer", category: "HR Tech · AI Platform", logo: "/assets/brands/rezulaizer.png", initials: "RZ", color: "from-violet-400 to-fuchsia-500" },
  { quote: "QR table ordering cut our order errors to near zero and our staff spends more time with guests now. The kitchen display and billing sync is exactly what we needed.", company: "Atithira", category: "Restaurant ERP", logo: "/assets/brands/atithira.jpeg", initials: "AT", color: "from-cyan-400 to-emerald-500" },
];

const whyCards = [
  { title: "Fast turnarounds", desc: "MVPs in 4–8 weeks. Revamps in 2–6. We move fast without compromising on quality." },
  { title: "Senior team only", desc: "No juniors learning on your dime. Senior designers, engineers, and SREs from day one." },
  { title: "Production-grade", desc: "Tested, monitored, secure by default. Every project ships with CI/CD and proper infra." },
  { title: "Global delivery", desc: "Clients across India, UAE, US, EU. Async-first that respects your time zone." },
  { title: "Transparent process", desc: "Weekly demos, shared roadmap. You always know the status — no black boxes." },
  { title: "Outcomes, not hours", desc: "Fixed-scope quotes, milestone billing, and a real focus on business outcomes." },
];

/* ─── ANIMATION VARIANTS ────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, delay, ease: "easeOut" as const },
});

/* ─── COMPONENT ─────────────────────────────────────────────── */
export default function PortfolioClient() {
  return (
    <div className="relative z-10">

      {/* ── COVER ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pb-24 pt-40 sm:pt-48">
        {/* radial glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-radial-glow opacity-40 blur-3xl" />

        <div className="container-px text-center">
          <motion.div {...fadeUp(0)} className="eyebrow mx-auto">
            <Sparkles size={12} /> Company Portfolio · 2025
          </motion.div>

          <motion.h1
            {...fadeUp(0.1)}
            className="section-title mx-auto mt-6 max-w-3xl text-white"
          >
            We build digital products that move{" "}
            <span className="gradient-text">your business</span> forward.
          </motion.h1>

          <motion.p
            {...fadeUp(0.2)}
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-300"
          >
            Biztreck Solutions is a senior product studio from Greater Noida, Delhi NCR — designing, engineering, and scaling web & mobile products for founders, startups, and growth teams worldwide.
          </motion.p>

          {/* Meta strip */}
          <motion.div
            {...fadeUp(0.3)}
            className="glass mx-auto mt-12 flex flex-wrap justify-center gap-x-10 gap-y-4 rounded-2xl px-8 py-5 sm:w-fit"
          >
            {[
              { icon: <Building2 size={14} />, label: "Studio", val: "Biztreck Solutions" },
              { icon: <MapPin size={14} />, label: "Location", val: "Greater Noida, Delhi NCR" },
              { icon: <Mail size={14} />, label: "Email", val: "connect@biztreck.world" },
              { icon: <Globe size={14} />, label: "Web", val: "biztreck.world" },
            ].map((m) => (
              <div key={m.label} className="flex flex-col items-center gap-1 text-center">
                <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  {m.icon} {m.label}
                </span>
                <span className="text-sm font-medium text-slate-200">{m.val}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────── */}
      <section className="container-px pb-24">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              {...fadeUp(i * 0.08)}
              className="glass rounded-2xl p-6 text-center"
            >
              <div className="font-display text-4xl font-bold text-white sm:text-5xl">{s.num}</div>
              <div className="mt-2 text-xs font-medium uppercase tracking-widest text-slate-400">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ─────────────────────────────────────────────── */}
      <section className="container-px pb-28">
        <div className="mb-12 text-center">
          <div className="eyebrow mx-auto">About Us</div>
          <motion.h2 {...fadeUp(0.05)} className="section-title mt-5 text-white">
            One team. <span className="gradient-text">Every stage.</span>
          </motion.h2>
          <motion.p {...fadeUp(0.1)} className="mx-auto mt-4 max-w-lg text-slate-400">
            We blend product thinking, design, engineering, and growth so you don&apos;t need five vendors.
          </motion.p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <motion.div {...fadeUp(0.1)} className="glass rounded-3xl p-8 text-[15px] leading-relaxed text-slate-300 space-y-4">
            <p>Biztreck Solutions is a senior product studio headquartered in Greater Noida, Delhi NCR. We design, build, deploy, and scale digital products for modern businesses across India, UAE, the US, and Europe.</p>
            <p>Unlike generalist agencies, our team consists exclusively of senior specialists — no juniors learning on your budget. Every engagement runs on fixed-scope quotes, milestone-based billing, and complete source code ownership transferred to you at handover.</p>
            <p>We&apos;ve shipped 120+ projects and launched 30+ startups from scratch — including 9 of our own in-house products now operating live across childcare, construction, hiring, travel, and hospitality.</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {highlights.map((h, i) => (
              <motion.div key={h.title} {...fadeUp(0.1 + i * 0.07)} className="glass rounded-2xl p-5">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-navy-500 to-accent-cyan text-white">
                  {h.icon}
                </div>
                <h4 className="mb-1 text-sm font-semibold text-white">{h.title}</h4>
                <p className="text-xs leading-relaxed text-slate-400">{h.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ──────────────────────────────────────────── */}
      <section className="container-px pb-28">
        <div className="mb-12 text-center">
          <div className="eyebrow mx-auto">What We Do</div>
          <motion.h2 {...fadeUp(0.05)} className="section-title mt-5 text-white">
            Six services. <span className="gradient-text">One team.</span>
          </motion.h2>
          <motion.p {...fadeUp(0.1)} className="mx-auto mt-4 max-w-lg text-slate-400">
            End-to-end execution from design and engineering to growth and infrastructure.
          </motion.p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              {...fadeUp(i * 0.07)}
              whileHover={{ y: -5 }}
              className="group relative overflow-hidden rounded-3xl border border-navy-700/40 bg-navy-900/50 p-7"
            >
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl transition-all duration-700 group-hover:scale-125"
                style={{ background: s.soft }}
              />
              <div className={`relative mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${s.accent} text-white shadow-glow`}>
                {s.icon}
              </div>
              <h3 className="relative mb-2 text-base font-semibold text-white">{s.title}</h3>
              <p className="relative mb-4 text-sm leading-relaxed text-slate-400">{s.desc}</p>
              <div className="relative flex flex-wrap gap-2">
                {s.tags.map((t) => (
                  <span key={t} className="rounded-full border border-navy-700/50 bg-navy-800/50 px-3 py-1 text-[11px] font-medium text-slate-300">
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PRODUCTS ──────────────────────────────────────────── */}
      <section className="container-px pb-28">
        <div className="mb-12 text-center">
          <div className="eyebrow mx-auto"><Sparkles size={12} /> In-House Products</div>
          <motion.h2 {...fadeUp(0.05)} className="section-title mt-5 text-white">
            We don&apos;t just build for clients.{" "}
            <span className="gradient-text">We build for the world.</span>
          </motion.h2>
          <motion.p {...fadeUp(0.1)} className="mx-auto mt-4 max-w-lg text-slate-400">
            9 live products solving real problems — childcare, construction, hiring, travel, events, and more.
          </motion.p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {products.map((p, i) => (
            <motion.article
              key={p.name}
              {...fadeUp(i * 0.07)}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-3xl border border-navy-700/40 bg-gradient-to-br from-navy-850/70 to-navy-900/50 p-7 shine sm:p-8"
            >
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl transition-all duration-700 group-hover:scale-110"
                style={{ background: p.soft }}
              />

              <div className="relative flex items-start justify-between">
                <Image
                  src={p.logo}
                  alt={`${p.name} logo`}
                  width={72}
                  height={72}
                  className="h-16 w-16 rounded-xl object-contain"
                />
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                  <span className="relative grid h-1.5 w-1.5 place-items-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  Live
                </span>
              </div>

              <h3 className="relative mt-5 font-display text-2xl font-extrabold text-white">{p.name}</h3>
              <p className="relative mt-1 text-xs font-medium uppercase tracking-wider text-navy-300">{p.cat}</p>
              <p className="relative mt-3 text-sm leading-relaxed text-slate-300">{p.desc}</p>

              <div className="relative mt-5 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <span key={t} className="rounded-full border border-navy-700/50 bg-navy-800/50 px-3 py-1 text-[11px] font-medium text-slate-200">
                    {t}
                  </span>
                ))}
              </div>

              <div className="relative mt-6 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">A Biztreck product</span>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-navy-800/60 px-4 py-2 text-xs font-semibold text-white transition-all group-hover:bg-accent-electric"
                >
                  {p.urlLabel} <ArrowUpRight size={12} />
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ── PROCESS ───────────────────────────────────────────── */}
      <section className="container-px pb-28">
        <div className="mb-12 text-center">
          <div className="eyebrow mx-auto">How We Work</div>
          <motion.h2 {...fadeUp(0.05)} className="section-title mt-5 text-white">
            A predictable path <span className="gradient-text">from idea to scale.</span>
          </motion.h2>
          <motion.p {...fadeUp(0.1)} className="mx-auto mt-4 max-w-lg text-slate-400">
            Five phases. Full visibility. No surprises.
          </motion.p>
        </div>

        <div className="mx-auto max-w-3xl">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              {...fadeUp(i * 0.08)}
              className="group flex gap-6 border-b border-navy-800 py-7 last:border-0"
            >
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-navy-500 text-sm font-bold text-navy-300 transition-all group-hover:border-accent-cyan group-hover:text-accent-cyan">
                {s.n}
              </div>
              <div>
                <h4 className="mb-1.5 text-base font-semibold text-white">{s.title}</h4>
                <p className="text-sm leading-relaxed text-slate-400">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TECH STACK ────────────────────────────────────────── */}
      <section className="container-px pb-28">
        <div className="mb-12 text-center">
          <div className="eyebrow mx-auto">Tech Stack</div>
          <motion.h2 {...fadeUp(0.05)} className="section-title mt-5 text-white">
            Production-grade tools, <span className="gradient-text">all the way down.</span>
          </motion.h2>
          <motion.p {...fadeUp(0.1)} className="mx-auto mt-4 max-w-lg text-slate-400">
            Battle-tested in production across all our client and in-house projects.
          </motion.p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stack.map((g, i) => (
            <motion.div key={g.label} {...fadeUp(i * 0.08)} className="glass rounded-2xl p-6">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-navy-300">{g.label}</p>
              <ul className="space-y-2">
                {g.items.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 size={13} className="shrink-0 text-accent-cyan" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────── */}
      <section className="container-px pb-28">
        <div className="mb-12 text-center">
          <div className="eyebrow mx-auto">Client Love</div>
          <motion.h2 {...fadeUp(0.05)} className="section-title mt-5 text-white">
            Trusted by the products <span className="gradient-text">we built.</span>
          </motion.h2>
          <motion.p {...fadeUp(0.1)} className="mx-auto mt-4 max-w-lg text-slate-400">
            What teams using our in-house platforms say about the experience.
          </motion.p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.company}
              {...fadeUp(i * 0.08)}
              whileHover={{ y: -4 }}
              className="glass relative rounded-3xl p-7"
            >
              <Quote className="absolute right-6 top-6 text-navy-500/40" size={44} />
              <div className="flex gap-1 text-accent-glow">
                {Array.from({ length: 5 }).map((_, j) => <Star key={j} size={13} fill="currentColor" />)}
              </div>
              <blockquote className="relative mt-4 text-[15px] leading-relaxed text-slate-200">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <div className={`relative h-11 w-11 shrink-0 overflow-hidden rounded-xl`}>
                  <Image
                    src={t.logo}
                    alt={t.company}
                    width={44}
                    height={44}
                    className="h-full w-full object-contain bg-navy-800"
                  />
                </div>
                <div>
                  <div className="font-semibold text-white">{t.company}</div>
                  <div className="text-xs text-slate-400">{t.category}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      {/* ── WHY BIZTRECK ──────────────────────────────────────── */}
      <section className="container-px pb-28">
        <div className="mb-12 text-center">
          <div className="eyebrow mx-auto">Why Biztreck</div>
          <motion.h2 {...fadeUp(0.05)} className="section-title mt-5 text-white">
            An agency that thinks like{" "}
            <span className="gradient-text">your in-house team.</span>
          </motion.h2>
          <motion.p {...fadeUp(0.1)} className="mx-auto mt-4 max-w-lg text-slate-400">
            Six reasons founders and CTOs keep coming back.
          </motion.p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {whyCards.map((w, i) => (
            <motion.div key={w.title} {...fadeUp(i * 0.07)} className="glass rounded-2xl p-6">
              <h4 className="mb-2 text-base font-semibold text-white">{w.title}</h4>
              <p className="text-sm leading-relaxed text-slate-400">{w.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="container-px pb-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="relative overflow-hidden rounded-3xl p-1"
          style={{ background: "linear-gradient(135deg, rgba(44,82,196,0.5), rgba(34,211,238,0.3))" }}
        >
          <div className="relative overflow-hidden rounded-[22px] bg-navy-900/90 px-8 py-16 text-center sm:px-16">
            {/* bg glow */}
            <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-64 w-96 rounded-full bg-radial-glow opacity-30 blur-3xl" />

            <div className="eyebrow mx-auto">Ready to start?</div>
            <h2 className="section-title mx-auto mt-5 max-w-2xl text-white">
              Let&apos;s build something <span className="gradient-text">remarkable.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-slate-400">
              Tell us about your project. We&apos;ll respond within 24 hours with a free, no-obligation proposal and roadmap.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a href="mailto:connect@biztreck.world" className="btn-primary shine">
                connect@biztreck.world
              </a>
              <a href="tel:+918740863229" className="btn-ghost">
                +91 87408 63229
              </a>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-8 border-t border-navy-800 pt-8">
              {[
                { label: "Website", val: "biztreck.world" },
                { label: "Location", val: "Greater Noida, Delhi NCR — 201306" },
              ].map((c) => (
                <div key={c.label} className="text-center">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{c.label}</div>
                  <div className="mt-1 text-sm text-slate-300">{c.val}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}

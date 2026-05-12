import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundFX from "@/components/BackgroundFX";
import {
  ArrowUpRight,
  Sparkles,
  Code2,
  Cpu,
  Globe2,
  Layers,
  Lightbulb,
  Rocket,
  Zap,
  Users,
  BrainCircuit,
  PackageOpen,
  CheckCircle2,
  Mail,
} from "lucide-react";

export const metadata = {
  title: "About · Biztreck Solutions",
  description:
    "Founder & Product Builder at Biztreck — AI Hiring Platform, SaaS, Web & AI Solutions. Turning ideas into scalable digital products.",
};

const skills = [
  { label: "React.js & Next.js", Icon: Code2 },
  { label: "Tailwind CSS & MUI", Icon: Layers },
  { label: "TypeScript", Icon: Code2 },
  { label: "AI / ML Integrations", Icon: Cpu },
  { label: "Performance Optimization", Icon: Zap },
  { label: "Scalable UI Systems", Icon: Globe2 },
  { label: "Product Architecture", Icon: Lightbulb },
  { label: "Business-Driven Dev", Icon: Rocket },
];

const pillars = [
  {
    Icon: BrainCircuit,
    title: "AI-Powered Hiring Systems",
    description:
      "Resume parsing, intelligent candidate matching, AI-driven interviews, and deep analytics — the full hiring stack, automated end-to-end.",
    accent: "from-violet-400 to-fuchsia-500",
    glow: "rgba(167, 139, 250, 0.35)",
  },
  {
    Icon: PackageOpen,
    title: "Custom SaaS Products",
    description:
      "We design, build, and scale SaaS platforms for startups and enterprises — from MVP to production-ready multi-tenant systems.",
    accent: "from-cyan-400 to-blue-500",
    glow: "rgba(34, 211, 238, 0.35)",
  },
  {
    Icon: Globe2,
    title: "Scalable Web Platforms",
    description:
      "Modern stacks, clean architecture, and performance-first engineering — products that hold up under real traffic and real teams.",
    accent: "from-amber-400 to-orange-500",
    glow: "rgba(251, 146, 60, 0.35)",
  },
];

const whatWeDo = [
  {
    Icon: Rocket,
    title: "Build & Launch Products",
    description:
      "We take ideas from whiteboard to deployed product — fast, scalable, and built to last.",
  },
  {
    Icon: Cpu,
    title: "Automate with AI",
    description:
      "We integrate AI into your operations — from hiring and screening to content and workflows.",
  },
  {
    Icon: Users,
    title: "Scale Digital Operations",
    description:
      "We help startups and enterprises modernize hiring, onboarding, and internal tooling.",
  },
];

const openTo = [
  "Collaboration on SaaS & AI products",
  "Product consulting for startups",
  "Startup & founder partnerships",
  "Tech advisory & architecture reviews",
];

export default function About() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-950">
      <BackgroundFX />
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative z-10 pb-16 pt-40 sm:pt-44">
        <div className="container-px">
          <div className="eyebrow mb-6">
            <Sparkles size={12} /> About Biztreck
          </div>
          <h1 className="font-display text-5xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Founder & Product Builder
            <br className="hidden sm:block" />
            <span className="gradient-text"> Turning Ideas into Impact.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            I&apos;m a Founder and Product Engineer building AI-powered
            solutions that help businesses scale smarter. At Biztreck, we
            design, build, and ship digital products that solve real problems
            across industries.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/#contact" className="btn-primary shine">
              Let&apos;s build together <ArrowUpRight size={15} />
            </a>
            <a href="/#products" className="btn-ghost">
              View our products
            </a>
          </div>
        </div>
      </section>

      {/* ── About / Stats ── */}
      <section className="relative z-10 py-20">
        <div className="container-px">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
            <div>
              <div className="eyebrow mb-5">
                <Sparkles size={12} /> Our story
              </div>
              <h2 className="section-title text-white">
                Building platforms that{" "}
                <span className="gradient-text">actually move the needle.</span>
              </h2>
              <div className="mt-6 space-y-5 text-[15px] leading-relaxed text-slate-300">
                <p>
                  Biztreck started with a simple belief — most software is built
                  for the wrong reasons. We build for impact, not demos. Every
                  product we ship is designed to solve a painful, real-world
                  problem with clean code and sharp product thinking.
                </p>
                <p>
                  With 4+ years in frontend engineering, we&apos;ve specialised
                  in React.js, Next.js, Tailwind, and MUI — and evolved into a
                  full product studio that handles everything from architecture
                  to AI integration to deployment.
                </p>
                <p>
                  Today, Biztreck is home to 7+ live products across childcare,
                  construction, hiring, hospitality, travel, and resource
                  management — and we&apos;re just getting started.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 self-start">
              {[
                { value: "7+", label: "Live Products" },
                { value: "4+", label: "Years Building" },
                { value: "50+", label: "Clients Served" },
                { value: "∞", label: "Ideas in Queue" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="glass rounded-2xl p-6 text-center"
                >
                  <div className="font-display text-4xl font-extrabold gradient-text">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Three Pillars ── */}
      <section className="relative z-10 py-20">
        <div className="container-px">
          <div className="eyebrow mb-4">
            <Sparkles size={12} /> What Biztreck builds
          </div>
          <h2 className="section-title mb-12 text-white">
            Three pillars.{" "}
            <span className="gradient-text">One mission.</span>
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map((p) => {
              const Icon = p.Icon;
              return (
                <div
                  key={p.title}
                  className="glass group relative overflow-hidden rounded-3xl p-7"
                >
                  <div
                    className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl"
                    style={{ background: p.glow }}
                  />
                  <div
                    className={`relative mb-5 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${p.accent}`}
                  >
                    <Icon className="text-white" size={22} />
                  </div>
                  <h3 className="relative font-display text-lg font-bold text-white">
                    {p.title}
                  </h3>
                  <p className="relative mt-3 text-sm leading-relaxed text-slate-400">
                    {p.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Expertise / Skills ── */}
      <section className="relative z-10 py-20">
        <div className="container-px">
          <div className="eyebrow mb-4">
            <Sparkles size={12} /> Core expertise
          </div>
          <h2 className="section-title mb-10 text-white">
            The stack we <span className="gradient-text">live in.</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            {skills.map((s) => {
              const Icon = s.Icon;
              return (
                <span
                  key={s.label}
                  className="inline-flex items-center gap-2 rounded-full border border-navy-600/50 bg-navy-800/50 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-accent-electric/50 hover:bg-navy-700/60"
                >
                  <Icon size={13} className="text-accent-glow" />
                  {s.label}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── What we do today ── */}
      <section className="relative z-10 py-20">
        <div className="container-px">
          <div className="eyebrow mb-4">
            <Sparkles size={12} /> What we do today
          </div>
          <h2 className="section-title mb-12 text-white">
            How we help businesses{" "}
            <span className="gradient-text">grow.</span>
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {whatWeDo.map((w) => {
              const Icon = w.Icon;
              return (
                <div key={w.title} className="glass rounded-3xl p-7">
                  <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-navy-700/60 text-accent-glow">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-display text-lg font-bold text-white">
                    {w.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">
                    {w.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Currently Building ── */}
      <section className="relative z-10 py-20">
        <div className="container-px">
          <div className="glass relative overflow-hidden rounded-3xl p-8 sm:p-12">
            <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative">
              <div className="eyebrow mb-5">
                <Sparkles size={12} /> Currently building
              </div>
              <h2 className="section-title text-white">
                An AI recruitment platform that{" "}
                <span className="gradient-text">redefines hiring.</span>
              </h2>
              <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-slate-300">
                We&apos;re building a next-generation recruitment system that
                automates the heaviest parts of hiring — from intelligent resume
                parsing and candidate matching to AI-driven interviews and
                real-time analytics. The goal: help companies hire better, not
                just faster.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  "AI Resume Parsing",
                  "Smart Candidate Matching",
                  "AI Video Interviews",
                  "Hiring Analytics",
                ].map((feat) => (
                  <div
                    key={feat}
                    className="flex items-center gap-2.5 rounded-xl border border-navy-600/40 bg-navy-800/40 px-4 py-3 text-sm text-slate-200"
                  >
                    <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
                    {feat}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Experience ── */}
      <section className="relative z-10 py-20">
        <div className="container-px">
          <div className="eyebrow mb-4">
            <Sparkles size={12} /> Experience
          </div>
          <h2 className="section-title mb-10 text-white">
            Where we&apos;ve been{" "}
            <span className="gradient-text">building.</span>
          </h2>
          <div className="glass relative overflow-hidden rounded-3xl p-8">
            <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-accent-electric/5 blur-3xl" />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:gap-10">
              <div className="shrink-0">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-lg">
                  <Globe2 size={24} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-display text-2xl font-bold text-white">
                    Founder & Product Engineer
                  </h3>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Current
                  </span>
                </div>
                <div className="mt-1 text-sm font-medium text-accent-glow">
                  Biztreck Solutions · 2021 – Present
                </div>
                <ul className="mt-5 space-y-2.5">
                  {[
                    "Leading architecture and delivery of 7+ live SaaS and AI-powered products",
                    "Built a next-gen AI recruitment platform covering resume parsing, candidate matching, and AI interviews",
                    "Designing scalable frontend systems using React.js, Next.js, Tailwind, and MUI",
                    "Integrating OpenAI and ML models into production workflows across multiple products",
                    "Driving end-to-end product ownership — from idea and wireframe to deployment and iteration",
                    "Working with startups and enterprises to modernise hiring, operations, and internal tooling",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-[14px] leading-relaxed text-slate-300"
                    >
                      <CheckCircle2
                        size={14}
                        className="mt-0.5 shrink-0 text-accent-glow"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Open To / CTA ── */}
      <section className="relative z-10 py-20">
        <div className="container-px">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="glass rounded-3xl p-8">
              <div className="eyebrow mb-4">
                <Sparkles size={12} /> Open to
              </div>
              <h2 className="font-display text-2xl font-bold text-white">
                Let&apos;s build{" "}
                <span className="gradient-text">something impactful.</span>
              </h2>
              <ul className="mt-6 space-y-3">
                {openTo.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 text-[14px] text-slate-300"
                  >
                    <CheckCircle2
                      size={14}
                      className="shrink-0 text-emerald-400"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass relative overflow-hidden rounded-3xl p-8">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent-electric/10 blur-3xl" />
              <div className="relative">
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400">
                  <Mail size={20} className="text-white" />
                </div>
                <h3 className="font-display text-xl font-bold text-white">
                  Reach out directly
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  Whether you have an idea, need a technical partner, or just
                  want to chat about products and AI — my inbox is open.
                </p>
                <a
                  href="/#contact"
                  className="btn-primary shine mt-6 inline-flex"
                >
                  Start a conversation <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundFX from "@/components/BackgroundFX";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowUpRight,
  Sparkles,
  Heart,
  Lightbulb,
  Users,
  Target,
  Zap,
  Shield,
  TrendingUp,
  Calendar,
} from "lucide-react";


const values = [
  {
    Icon: Heart,
    title: "Customer First",
    description:
      "Every decision we make starts with one question: does this serve our clients better?",
    accent: "from-pink-400 to-rose-500",
    glow: "rgba(244, 114, 182, 0.25)",
  },
  {
    Icon: Lightbulb,
    title: "Innovation",
    description:
      "We challenge the status quo and embrace new technologies to build tomorrow's solutions today.",
    accent: "from-amber-400 to-orange-500",
    glow: "rgba(251, 146, 60, 0.25)",
  },
  {
    Icon: Users,
    title: "Collaboration",
    description:
      "Great products are built by great teams. We believe in open communication and shared ownership.",
    accent: "from-cyan-400 to-blue-500",
    glow: "rgba(34, 211, 238, 0.25)",
  },
  {
    Icon: Target,
    title: "Excellence",
    description:
      "We don't ship good enough. We ship exceptional — every line of code, every pixel, every interaction.",
    accent: "from-violet-400 to-purple-500",
    glow: "rgba(167, 139, 250, 0.25)",
  },
  {
    Icon: Zap,
    title: "Speed",
    description:
      "In a world that moves fast, we move faster. Agile execution without compromising quality.",
    accent: "from-yellow-400 to-amber-500",
    glow: "rgba(251, 191, 36, 0.25)",
  },
  {
    Icon: Shield,
    title: "Integrity",
    description:
      "We build trust through transparency, honesty, and doing what we say we'll do.",
    accent: "from-emerald-400 to-green-500",
    glow: "rgba(52, 211, 153, 0.25)",
  },
];

const journey = [
  {
    year: "May 2026",
    title: "The Beginning",
    description:
      "Biztreck was founded with a vision to build AI-powered solutions that solve real business problems.",
  },
  {
    year: "Jun 2026",
    title: "First Products Launch",
    description:
      "Launched KuddlKin and Buildifai — our first SaaS products connecting users with trusted professionals.",
  },
  {
    year: "Jul 2026",
    title: "AI Integration",
    description:
      "Integrated cutting-edge AI into Rezulaizer, our recruitment platform with intelligent resume parsing and candidate matching.",
  },
  {
    year: "Aug 2026",
    title: "Portfolio Expansion",
    description:
      "Expanded to 7+ live products across childcare, construction, hiring, hospitality, travel, and resource management.",
  },
  {
    year: "2027",
    title: "Scale & Growth",
    description:
      "Scaling our products globally, serving startups and enterprises with AI-driven digital solutions.",
  },
  {
    year: "Beyond",
    title: "The Future",
    description:
      "Building the next generation of intelligent platforms that redefine how businesses operate.",
  },
];

export default function AboutClient() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-950">
      <BackgroundFX />
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative z-10 pb-20 pt-40 sm:pt-44">
        <div className="container-px text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-display text-5xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            The Biztreck Way
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-slate-400"
          >
            Get a glimpse into who we are, what we do, our values and the
            experiences we&apos;ve had along the way
          </motion.p>
        </div>
      </section>

      {/* ── Who We Are ── */}
      <section className="relative z-10 py-20">
        <div className="container-px">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-4xl"
          >
            <motion.h2
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="section-title text-center text-white"
            >
              Who we are
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 text-center text-lg leading-relaxed text-slate-300"
            >
              We are dreamers, innovators, challengers and fun lovers who happen
              to design and engineer world-class technology solutions. Our magic
              lies in these multi-disciplinary teams working together, imagining
              remarkable solutions and making them a reality.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Our Values ── */}
      <section className="relative z-10 py-20">
        <div className="container-px">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="section-title text-white">Our values</h2>
            <p className="mt-4 text-slate-400">
              Our values are part of everything we build here
            </p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v, i) => {
              const Icon = v.Icon;
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="glass group relative overflow-hidden rounded-3xl p-7 transition-all hover:border-white/20"
                >
                  <div
                    className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl transition-all duration-700 group-hover:scale-110"
                    style={{ background: v.glow }}
                  />
                  <motion.div
                    initial={{ rotate: 0 }}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={`relative mb-5 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${v.accent}`}
                  >
                    <Icon className="text-white" size={22} />
                  </motion.div>
                  <h3 className="relative font-display text-xl font-bold text-white">
                    {v.title}
                  </h3>
                  <p className="relative mt-3 text-sm leading-relaxed text-slate-400">
                    {v.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Our Journey ── */}
      <section className="relative z-10 py-20">
        <div className="container-px">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="section-title text-white">Our Journey</h2>
            <p className="mx-auto mt-4 max-w-3xl text-slate-400">
              Our journey began with a desire to build products that matter.
              Since our beginning, we&apos;ve enabled Startups towards Success,
              Medium-Enterprises towards Scale, and Corporate Giants towards
              Value.
            </p>
          </motion.div>
          <div className="relative mx-auto max-w-4xl">
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute left-8 top-0 h-full w-px origin-top bg-gradient-to-b from-transparent via-accent-electric/40 to-transparent sm:left-1/2"
            />
            <div className="space-y-12">
              {journey.map((j, i) => (
                <motion.div
                  key={j.year}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className={`relative flex flex-col gap-6 sm:flex-row ${
                    i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                  }`}
                >
                  <div className="flex-1" />
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.15 + 0.2 }}
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    className="absolute left-8 top-0 z-10 grid h-16 w-16 place-items-center rounded-full border-4 border-navy-950 bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg sm:left-1/2 sm:-translate-x-1/2"
                  >
                    <Calendar className="text-white" size={24} />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.03, y: -5 }}
                    className="glass flex-1 rounded-3xl p-6 sm:p-8"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15 + 0.3 }}
                      className="mb-2 inline-flex items-center gap-2 rounded-full bg-accent-electric/10 px-3 py-1 text-sm font-bold text-accent-glow"
                    >
                      <TrendingUp size={14} />
                      {j.year}
                    </motion.div>
                    <h3 className="mt-3 font-display text-2xl font-bold text-white">
                      {j.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-400">
                      {j.description}
                    </p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 py-20">
        <div className="container-px">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="glass relative overflow-hidden rounded-3xl p-10 text-center sm:p-16"
          >
            <motion.div
              animate={{
                x: [0, 30, 0],
                y: [0, -30, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl"
            />
            <motion.div
              animate={{
                x: [0, -30, 0],
                y: [0, 30, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl"
            />
            <div className="relative">
              <motion.h2
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="section-title text-white"
              >
                Let&apos;s start something{" "}
                <span className="gradient-text">meaningful together</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mx-auto mt-4 max-w-2xl text-slate-400"
              >
                Whether you&apos;re a startup with a bold idea or an enterprise
                looking to scale — we&apos;d love to hear from you.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-8 flex flex-wrap items-center justify-center gap-4"
              >
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="/#contact"
                  className="btn-primary shine"
                >
                  Connect Now <ArrowUpRight size={15} />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="/#products"
                  className="btn-ghost"
                >
                  View Our Products
                </motion.a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

"use client";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  useMotionTemplate,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowRight, Sparkles } from "lucide-react";

const rotatingWords = ["Business.", "Operations.", "Workflows.", "Team.", "Growth."];

// Heaviest visual: defer to client only and skip on first paint.
const HeroOrb = dynamic(() => import("./HeroOrb"), {
  ssr: false,
  loading: () => <div className="mx-auto aspect-square w-full max-w-md" />,
});

/* ───── Letter-reveal headline ───── */
function AnimatedHeadline() {
  const line1 = "Custom Software & AI".split("");
  const line2 = "Solutions built around".split("");
  const c = {
    hidden: {},
    show: { transition: { staggerChildren: 0.025, delayChildren: 0.15 } },
  };
  const l = {
    hidden: { y: "110%", opacity: 0, rotateX: 90 },
    show: {
      y: "0%",
      opacity: 1,
      rotateX: 0,
      transition: { type: "spring" as const, damping: 14, stiffness: 200 },
    },
  };
  return (
    <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
      <span className="sr-only">
        Custom software and AI solutions built around your business.
      </span>
      <motion.span
        variants={c}
        initial="hidden"
        animate="show"
        className="block overflow-hidden"
        aria-hidden
      >
        {line1.map((ch, i) => (
          <motion.span
            key={i}
            variants={l}
            className="inline-block"
            style={{ whiteSpace: ch === " " ? "pre" : "normal" }}
          >
            {ch}
          </motion.span>
        ))}
      </motion.span>
      <motion.span
        variants={c}
        initial="hidden"
        animate="show"
        className="mt-2 block overflow-hidden"
        aria-hidden
      >
        {line2.map((ch, i) => (
          <motion.span
            key={i}
            variants={l}
            className="inline-block"
            style={{ whiteSpace: ch === " " ? "pre" : "normal" }}
          >
            {ch}
          </motion.span>
        ))}
      </motion.span>
    </h1>
  );
}

/* ───── Rotating cycling word ───── */
function RotatingWord() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % rotatingWords.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="relative inline-flex h-[1.1em] min-w-[5.5ch] overflow-hidden align-baseline">
      <AnimatePresence mode="wait">
        <motion.span
          key={rotatingWords[i]}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="gradient-text inline-block"
        >
          {rotatingWords[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ───── Aurora gradient (SVG, CSS-only animation via transform) ───── */
function Aurora() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-70"
      preserveAspectRatio="none"
      viewBox="0 0 1200 800"
    >
      <defs>
        <radialGradient id="a1" cx="20%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#4f7cf0" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#4f7cf0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="a2" cx="80%" cy="20%" r="40%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="a3" cx="50%" cy="90%" r="60%">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#a1)" />
      <rect width="1200" height="800" fill="url(#a2)" />
      <rect width="1200" height="800" fill="url(#a3)" />
    </svg>
  );
}

/* ───── Particles (lighter, lazy-rendered after mount) ───── */
function Particles({ count = 14 }: { count?: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Defer to next idle slot so it doesn't compete with LCP.
    const id = (window as any).requestIdleCallback
      ? (window as any).requestIdleCallback(() => setMounted(true))
      : window.setTimeout(() => setMounted(true), 600);
    return () => {
      if ((window as any).cancelIdleCallback)
        (window as any).cancelIdleCallback(id);
      else clearTimeout(id);
    };
  }, []);

  const items = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2.5 + 1,
        delay: Math.random() * 5,
        duration: 6 + Math.random() * 8,
      })),
    [count]
  );
  if (!mounted) return null;
  return (
    <div className="pointer-events-none absolute inset-0">
      {items.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-accent-glow"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            boxShadow: "0 0 10px rgba(127,162,255,0.85)",
            animation: `bt-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
}

/* ───── Magnetic button (cached rect, rAF-throttled) ───── */
function MagneticButton({
  children,
  href,
  primary,
}: {
  children: React.ReactNode;
  href: string;
  primary?: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });

  const refreshRect = () => {
    rectRef.current = ref.current?.getBoundingClientRect() ?? null;
  };

  const onEnter = () => refreshRect();

  const onMove = (e: React.MouseEvent) => {
    if (rafRef.current) return;
    const cx = e.clientX;
    const cy = e.clientY;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const r = rectRef.current;
      if (!r) return;
      x.set((cx - (r.left + r.width / 2)) * 0.25);
      y.set((cy - (r.top + r.height / 2)) * 0.35);
    });
  };

  const onLeave = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseEnter={onEnter}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      className={primary ? "btn-primary shine" : "btn-ghost"}
    >
      {children}
    </motion.a>
  );
}

export default function Hero() {
  // Detect coarse pointer (touch) and reduced motion to skip pointer parallax.
  const [parallax, setParallax] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setParallax(fine && !reduce);
  }, []);

  // Mouse-tracking spotlight + tilt
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const tiltX = useSpring(useTransform(my, [0, 1], [10, -10]), {
    stiffness: 60,
    damping: 18,
  });
  const tiltY = useSpring(useTransform(mx, [0, 1], [-15, 15]), {
    stiffness: 60,
    damping: 18,
  });
  const spotX = useTransform(mx, (v) => `${v * 100}%`);
  const spotY = useTransform(my, (v) => `${v * 100}%`);
  const spotlight = useMotionTemplate`radial-gradient(640px circle at ${spotX} ${spotY}, rgba(79,124,240,0.16), transparent 45%)`;

  // Cache section rect, refresh on resize/scroll, rAF-throttle mousemove.
  const sectionRef = useRef<HTMLElement | null>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!parallax) return;
    const refresh = () => {
      rectRef.current = sectionRef.current?.getBoundingClientRect() ?? null;
    };
    refresh();
    window.addEventListener("resize", refresh, { passive: true });
    window.addEventListener("scroll", refresh, { passive: true });
    return () => {
      window.removeEventListener("resize", refresh);
      window.removeEventListener("scroll", refresh);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [parallax]);

  const onMouseMove = (e: React.MouseEvent) => {
    if (!parallax || rafRef.current) return;
    const cx = e.clientX;
    const cy = e.clientY;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const r = rectRef.current;
      if (!r) return;
      mx.set((cx - r.left) / r.width);
      my.set((cy - r.top) / r.height);
    });
  };

  return (
    <section
      id="top"
      ref={sectionRef}
      onMouseMove={onMouseMove}
      className="relative z-10 flex min-h-screen items-center pt-28 sm:pt-32"
      style={{ perspective: 1200 }}
    >
      <Aurora />

      {/* mouse-following spotlight (only when parallax is enabled) */}
      {parallax && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ background: spotlight, willChange: "background" }}
        />
      )}

      <Particles count={14} />

      {/* Marquee strip — pure CSS keyframe */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/3 -z-10 select-none overflow-hidden whitespace-nowrap font-display text-[18vw] font-extrabold leading-none text-white opacity-[0.05]"
      >
        <div className="flex bt-marquee">
          <span className="px-8">BUILD · REVAMP · RANK · SCALE ·&nbsp;</span>
          <span className="px-8">BUILD · REVAMP · RANK · SCALE ·&nbsp;</span>
        </div>
      </div>

      <div className="container-px relative grid items-center gap-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="eyebrow"
          >
            <Sparkles size={14} />
            <span>Business growth · AI automation · Custom software</span>
          </motion.div>

          <div className="mt-6">
            <AnimatedHeadline />
            <div className="mt-2 font-display text-5xl font-extrabold leading-[1.05] sm:text-6xl lg:text-7xl">
              <span className="text-white">your&nbsp;</span>
              <RotatingWord />
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-7 max-w-xl text-lg leading-relaxed text-slate-300"
          >
            We help growing businesses automate operations, modernise outdated
            systems, and build{" "}
            <strong className="text-white">scalable software that drives
            measurable growth</strong>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <MagneticButton href="/book-strategy-call" primary>
              Book Strategy Call <ArrowRight size={18} />
            </MagneticButton>
            <MagneticButton href="/resources/business-audit">
              Get Free Business Audit
            </MagneticButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="mt-10 grid max-w-lg grid-cols-3 gap-4"
          >
            {[
              { k: "120+", v: "Projects shipped" },
              { k: "30+", v: "Startups launched" },
              { k: "98%", v: "Retention rate" },
            ].map((s) => (
              <div
                key={s.v}
                className="glass rounded-2xl px-4 py-4 text-center bt-float-slow"
              >
                <div className="font-display text-2xl font-bold text-white">
                  {s.k}
                </div>
                <div className="mt-1 text-xs text-slate-400">{s.v}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative lg:col-span-5">
          <HeroOrb tiltX={tiltX} tiltY={tiltY} />
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2 text-xs uppercase tracking-[0.25em] text-slate-400">
          <span>Scroll</span>
          <div
            className="h-10 w-[2px] rounded-full bg-gradient-to-b from-accent-cyan via-accent-electric to-transparent"
            style={{
              animation: "bt-pulse 1.8s ease-in-out infinite",
              transformOrigin: "top",
            }}
          />
        </div>
      </div>
    </section>
  );
}

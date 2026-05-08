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
import Image from "next/image";
import {
  ArrowRight,
  Sparkles,
  Code2,
  Cloud,
  Zap,
  Globe2,
  Cpu,
  Layers,
  TerminalSquare,
  Rocket,
  Smartphone,
  RefreshCw,
  TrendingUp,
  ServerCog,
} from "lucide-react";

const rotatingWords = ["Builds.", "Revamps.", "Ranks.", "Scales.", "Launches."];

const ringServices = [
  { Icon: RefreshCw, label: "Revamp", color: "#7fa2ff" },
  { Icon: Code2, label: "Web Dev", color: "#22d3ee" },
  { Icon: Smartphone, label: "Mobile", color: "#60a5fa" },
  { Icon: ServerCog, label: "DevOps", color: "#4f7cf0" },
  { Icon: TrendingUp, label: "SEO", color: "#a78bfa" },
  { Icon: Rocket, label: "Launch", color: "#22d3ee" },
];

const techBadges = [
  { Icon: Code2, label: "Next.js" },
  { Icon: Cloud, label: "AWS" },
  { Icon: Layers, label: "React" },
  { Icon: Cpu, label: "Node" },
  { Icon: Globe2, label: "Edge" },
  { Icon: Zap, label: "Vercel" },
];

/* ───── Letter-reveal headline ───── */
function AnimatedHeadline() {
  const line1 = "We build digital".split("");
  const line2 = "products that".split("");
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
      <span className="sr-only">We build digital products that move your business forward.</span>
      <motion.span variants={c} initial="hidden" animate="show" className="block overflow-hidden" aria-hidden>
        {line1.map((ch, i) => (
          <motion.span key={i} variants={l} className="inline-block" style={{ whiteSpace: ch === " " ? "pre" : "normal" }}>
            {ch}
          </motion.span>
        ))}
      </motion.span>
      <motion.span variants={c} initial="hidden" animate="show" className="mt-2 block overflow-hidden" aria-hidden>
        {line2.map((ch, i) => (
          <motion.span key={i} variants={l} className="inline-block" style={{ whiteSpace: ch === " " ? "pre" : "normal" }}>
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
          initial={{ y: "100%", opacity: 0, filter: "blur(8px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-100%", opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="gradient-text inline-block"
        >
          {rotatingWords[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ───── Aurora gradient SVG ───── */
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
      <motion.rect
        width="1200"
        height="800"
        fill="url(#a1)"
        animate={{ x: [0, 40, -30, 0], y: [0, 30, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.rect
        width="1200"
        height="800"
        fill="url(#a2)"
        animate={{ x: [0, -30, 40, 0], y: [0, 20, -30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.rect
        width="1200"
        height="800"
        fill="url(#a3)"
        animate={{ x: [0, 30, -40, 0], y: [0, -20, 30, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

/* ───── Particles ───── */
function Particles({ count = 32 }: { count?: number }) {
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
  return (
    <div className="pointer-events-none absolute inset-0">
      {items.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-accent-glow"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            boxShadow: "0 0 12px rgba(127,162,255,0.9)",
          }}
          animate={{ y: [0, -50, 0], opacity: [0, 1, 0], scale: [0.6, 1.3, 0.6] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ───── Magnetic button ───── */
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
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set((e.clientX - (r.left + r.width / 2)) * 0.25);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.35);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      className={primary ? "btn-primary shine" : "btn-ghost"}
    >
      {children}
    </motion.a>
  );
}

/* ───── Live-typing terminal ───── */
const TERM_LINES = [
  { p: "$", t: "biztreck init my-startup --stack=next,aws", c: "text-accent-glow" },
  { p: "✓", t: "design system generated", c: "text-emerald-400" },
  { p: "✓", t: "next.js 14 + tailwind scaffolded", c: "text-emerald-400" },
  { p: "✓", t: "ci/cd pipeline online", c: "text-emerald-400" },
  { p: "$", t: "biztreck deploy --prod", c: "text-accent-glow" },
  { p: "→", t: "live at startup.biztreck.world ", c: "text-accent-cyan" },
];

function Terminal() {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    let cancelled = false;
    let i = 0;
    let buffer = "";
    let lineIdx = 0;

    const tick = async () => {
      while (!cancelled) {
        const line = TERM_LINES[lineIdx];
        for (let c = 0; c <= line.t.length; c++) {
          if (cancelled) return;
          buffer = line.t.slice(0, c);
          setTyped(buffer);
          await new Promise((r) => setTimeout(r, 28));
        }
        await new Promise((r) => setTimeout(r, 600));
        i++;
        setStep(i);
        lineIdx = (lineIdx + 1) % TERM_LINES.length;
        if (lineIdx === 0) {
          setStep(0);
          await new Promise((r) => setTimeout(r, 800));
        }
      }
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="font-mono text-[12.5px] leading-relaxed">
      {TERM_LINES.slice(0, step).map((l, i) => (
        <div key={i} className="flex gap-2">
          <span className={`${l.c} font-bold`}>{l.p}</span>
          <span className="text-slate-200">{l.t}</span>
        </div>
      ))}
      {step < TERM_LINES.length && (
        <div className="flex gap-2">
          <span className={`${TERM_LINES[step].c} font-bold`}>
            {TERM_LINES[step].p}
          </span>
          <span className="text-slate-200">
            {typed}
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.9, repeat: Infinity }}
              className="ml-0.5 inline-block h-[1em] w-[7px] -translate-y-[1px] bg-accent-cyan align-middle"
            />
          </span>
        </div>
      )}
    </div>
  );
}

/* ───── Logo orb with revolving services + tilt ───── */
function LogoOrb({ tiltX, tiltY }: { tiltX: any; tiltY: any }) {
  return (
    <motion.div
      style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" }}
      className="relative mx-auto aspect-square w-full max-w-md"
    >
      {/* SVG orbits */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 400" fill="none">
        <defs>
          <linearGradient id="orbitG" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#7fa2ff" stopOpacity="0" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#7fa2ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[180, 142, 104].map((r, i) => (
          <motion.circle
            key={r}
            cx="200"
            cy="200"
            r={r}
            stroke="url(#orbitG)"
            strokeWidth={1.2}
            strokeDasharray="2 8"
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ duration: 22 + i * 8, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "200px 200px" }}
          />
        ))}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x2 = 200 + Math.cos(rad) * 180;
          const y2 = 200 + Math.sin(rad) * 180;
          return (
            <motion.line
              key={deg}
              x1="200"
              y1="200"
              x2={x2}
              y2={y2}
              stroke="#4f7cf0"
              strokeWidth="0.8"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.4, 0] }}
              transition={{ duration: 4, delay: i * 0.4, repeat: Infinity, ease: "easeInOut" }}
            />
          );
        })}
      </svg>

      {/* Pulse rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-12 rounded-full border border-accent-electric/30"
          animate={{ scale: [1, 1.6, 1.6], opacity: [0.6, 0, 0] }}
          transition={{ duration: 3, delay: i * 1, repeat: Infinity, ease: "easeOut" }}
        />
      ))}

      {/* Center logo with conic glow */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 grid place-items-center"
        style={{ transform: "translateZ(60px)" }}
      >
        <div className="relative">
          <motion.div
            className="absolute -inset-8 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, #22d3ee, #4f7cf0, #a78bfa, #22d3ee)",
              filter: "blur(28px)",
              opacity: 0.6,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            whileHover={{ scale: 1.04, rotate: -3 }}
            className="relative grid h-44 w-44 place-items-center rounded-3xl bg-navy-900/80 p-6 shadow-glow-lg ring-1 ring-white/15 backdrop-blur"
          >
            <Image
              src="/logo.png"
              alt="Biztreck Solutions"
              width={140}
              height={140}
              priority
              className="h-full w-full object-contain"
            />
            <motion.div
              className="absolute inset-0 rounded-3xl"
              animate={{ opacity: [0.1, 0.45, 0.1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{
                background:
                  "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)",
              }}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Service ring (outer) */}
      {ringServices.map((node, i) => {
        const radius = 180;
        const start = (360 / ringServices.length) * i;
        return (
          <motion.div
            key={node.label}
            className="absolute left-1/2 top-1/2 h-0 w-0"
            initial={{ rotate: start }}
            animate={{ rotate: start + 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "center" }}
          >
            <motion.div
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: 0, top: -radius }}
            >
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="glass relative flex items-center gap-2 rounded-xl px-3 py-2 shadow-glow"
                style={{ borderColor: `${node.color}55` }}
              >
                <node.Icon size={14} style={{ color: node.color }} />
                <span className="text-xs font-semibold text-white">{node.label}</span>
                <motion.span
                  className="absolute inset-0 rounded-xl"
                  animate={{
                    boxShadow: [
                      `0 0 0px ${node.color}00`,
                      `0 0 22px ${node.color}80`,
                      `0 0 0px ${node.color}00`,
                    ],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        );
      })}

      {/* Tech ring (inner, opposite direction) */}
      {techBadges.map((node, i) => {
        const radius = 110;
        const start = (360 / techBadges.length) * i;
        return (
          <motion.div
            key={node.label}
            className="absolute left-1/2 top-1/2 h-0 w-0"
            initial={{ rotate: start }}
            animate={{ rotate: start - 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "center" }}
          >
            <motion.div
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: 0, top: -radius }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                className="grid h-8 w-8 place-items-center rounded-full border border-navy-500/40 bg-navy-900/60 backdrop-blur"
                title={node.label}
              >
                <node.Icon size={12} className="text-accent-glow" />
              </motion.div>
            </motion.div>
          </motion.div>
        );
      })}

      {/* Floating live cards */}
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, 1, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="glass absolute -left-4 top-2 hidden w-44 rounded-2xl p-3 shadow-glow sm:block"
        style={{ transform: "translateZ(40px)" }}
      >
        <div className="text-[10px] uppercase tracking-wider text-navy-300">
          Lighthouse
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <div className="font-display text-2xl font-bold text-emerald-400">98</div>
          <div className="text-xs text-slate-400">/ 100</div>
        </div>
        <div className="mt-1 text-[11px] text-slate-400">Performance score</div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0], rotate: [0, -1, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="glass absolute -right-2 bottom-6 hidden w-48 rounded-2xl p-3 shadow-glow sm:block"
        style={{ transform: "translateZ(40px)" }}
      >
        <div className="text-[10px] uppercase tracking-wider text-navy-300">
          Deploy status
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="relative grid h-2 w-2 place-items-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-xs font-semibold text-white">Live · prod</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400">23s build · 0 errors</div>
      </motion.div>
    </motion.div>
  );
}

export default function Hero() {
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

  const onMouseMove = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  return (
    <section
      id="top"
      onMouseMove={onMouseMove}
      className="relative z-10 flex min-h-screen items-center pt-28 sm:pt-32"
      style={{ perspective: 1200 }}
    >
      <Aurora />

      {/* mouse-following spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ background: spotlight }}
      />

      <Particles count={36} />

      {/* Marquee strip */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ duration: 2 }}
        className="pointer-events-none absolute inset-x-0 top-1/3 -z-10 select-none whitespace-nowrap font-display text-[18vw] font-extrabold leading-none text-white"
      >
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex"
        >
          <span className="px-8">BUILD · REVAMP · RANK · SCALE ·&nbsp;</span>
          <span className="px-8">BUILD · REVAMP · RANK · SCALE ·&nbsp;</span>
        </motion.div>
      </motion.div>

      <div className="container-px relative grid items-center gap-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="eyebrow"
          >
            <motion.span
              animate={{ rotate: [0, 20, -20, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-flex"
            >
              <Sparkles size={14} />
            </motion.span>
            <span>Greater Noida · Senior product studio</span>
          </motion.div>

          <div className="mt-6">
            <AnimatedHeadline />
            <div className="mt-2 font-display text-5xl font-extrabold leading-[1.05] sm:text-6xl lg:text-7xl">
              <span className="text-white">move you forward —&nbsp;</span>
              <RotatingWord />
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-7 max-w-xl text-lg leading-relaxed text-slate-300"
          >
            Biztreck Solutions revamps tired websites, ships fast new web & app
            experiences, automates infrastructure with DevOps, ranks you on
            Google, and walks startups from{" "}
            <strong className="text-white">idea to launch</strong>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <MagneticButton href="#contact" primary>
              Get in touch <ArrowRight size={18} />
            </MagneticButton>
            <MagneticButton href="#services">Explore services</MagneticButton>
          </motion.div>

          {/* Live terminal preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-10 max-w-md"
          >
            <div className="glass overflow-hidden rounded-2xl">
              <div className="flex items-center gap-2 border-b border-navy-700/50 bg-navy-900/60 px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                <div className="ml-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <TerminalSquare size={11} /> ~/biztreck
                </div>
              </div>
              <div className="bg-navy-950/60 p-4">
                <Terminal />
              </div>
            </div>
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
            ].map((s, i) => (
              <motion.div
                key={s.v}
                whileHover={{ y: -4, scale: 1.03 }}
                animate={{ y: [0, -3, 0] }}
                transition={{
                  duration: 4,
                  delay: i * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="glass rounded-2xl px-4 py-4 text-center"
              >
                <div className="font-display text-2xl font-bold text-white">{s.k}</div>
                <div className="mt-1 text-xs text-slate-400">{s.v}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="relative lg:col-span-5">
          <LogoOrb tiltX={tiltX} tiltY={tiltY} />
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2 text-xs uppercase tracking-[0.25em] text-slate-400">
          <span>Scroll</span>
          <motion.div
            className="h-10 w-[2px] rounded-full bg-gradient-to-b from-accent-cyan via-accent-electric to-transparent"
            animate={{ scaleY: [1, 0.4, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "top" }}
          />
        </div>
      </motion.div>
    </section>
  );
}

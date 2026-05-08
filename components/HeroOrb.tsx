"use client";
import { motion, MotionValue } from "framer-motion";
import Image from "next/image";
import {
  Code2,
  Cloud,
  Zap,
  Globe2,
  Cpu,
  Layers,
  Rocket,
  Smartphone,
  RefreshCw,
  TrendingUp,
  ServerCog,
} from "lucide-react";

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

export default function HeroOrb({
  tiltX,
  tiltY,
}: {
  tiltX: MotionValue<number>;
  tiltY: MotionValue<number>;
}) {
  return (
    <motion.div
      style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d", willChange: "transform" }}
      className="relative mx-auto aspect-square w-full max-w-md"
    >
      {/* SVG orbits — animated via CSS keyframes for free GPU compositing */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 400" fill="none">
        <defs>
          <linearGradient id="orbitG" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#7fa2ff" stopOpacity="0" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#7fa2ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g style={{ transformOrigin: "200px 200px", animation: "spin 26s linear infinite" }}>
          <circle cx="200" cy="200" r="180" stroke="url(#orbitG)" strokeWidth={1.2} strokeDasharray="2 8" />
        </g>
        <g style={{ transformOrigin: "200px 200px", animation: "spin-rev 30s linear infinite" }}>
          <circle cx="200" cy="200" r="142" stroke="url(#orbitG)" strokeWidth={1.2} strokeDasharray="2 8" />
        </g>
        <g style={{ transformOrigin: "200px 200px", animation: "spin 22s linear infinite" }}>
          <circle cx="200" cy="200" r="104" stroke="url(#orbitG)" strokeWidth={1.2} strokeDasharray="2 8" />
        </g>
      </svg>

      {/* Pulse rings (CSS) */}
      <span className="pointer-events-none absolute inset-12 rounded-full border border-accent-electric/30 bt-pulse" />
      <span className="pointer-events-none absolute inset-12 rounded-full border border-accent-electric/30 bt-pulse" style={{ animationDelay: "1s" }} />
      <span className="pointer-events-none absolute inset-12 rounded-full border border-accent-electric/30 bt-pulse" style={{ animationDelay: "2s" }} />

      {/* Center logo with conic glow */}
      <div className="absolute inset-0 grid place-items-center bt-float" style={{ transform: "translateZ(60px)" }}>
        <div className="relative">
          <span
            aria-hidden
            className="absolute -inset-8 rounded-full bt-spin-slow"
            style={{
              background: "conic-gradient(from 0deg, #22d3ee, #4f7cf0, #a78bfa, #22d3ee)",
              filter: "blur(28px)",
              opacity: 0.55,
            }}
          />
          <div className="relative grid h-44 w-44 place-items-center rounded-3xl bg-navy-900/80 p-6 shadow-glow-lg ring-1 ring-white/15 backdrop-blur">
            <Image
              src="/logo.png"
              alt="Biztreck Solutions"
              width={140}
              height={140}
              quality={75}
              priority
              sizes="140px"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Service ring (outer) — CSS rotation */}
      {ringServices.map((node, i) => {
        const radius = 180;
        const start = (360 / ringServices.length) * i;
        return (
          <div
            key={node.label}
            className="absolute left-1/2 top-1/2 h-0 w-0 bt-orbit-30"
            style={{ ["--bt-start" as any]: `${start}deg`, transformOrigin: "center" }}
          >
            <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: 0, top: -radius }}>
              <div
                className="glass relative flex items-center gap-2 rounded-xl px-3 py-2 shadow-glow bt-orbit-counter-30"
                style={{ borderColor: `${node.color}55` }}
              >
                <node.Icon size={14} style={{ color: node.color }} />
                <span className="text-xs font-semibold text-white">{node.label}</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Tech ring (inner, opposite direction) */}
      {techBadges.map((node, i) => {
        const radius = 110;
        const start = (360 / techBadges.length) * i;
        return (
          <div
            key={node.label}
            className="absolute left-1/2 top-1/2 h-0 w-0 bt-orbit-rev-24"
            style={{ ["--bt-start" as any]: `${start}deg`, transformOrigin: "center" }}
          >
            <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: 0, top: -radius }}>
              <div
                className="grid h-8 w-8 place-items-center rounded-full border border-navy-500/40 bg-navy-900/60 backdrop-blur bt-orbit-counter-24"
                title={node.label}
              >
                <node.Icon size={12} className="text-accent-glow" />
              </div>
            </div>
          </div>
        );
      })}

      {/* Floating live cards */}
      <div
        className="glass absolute -left-4 top-2 hidden w-44 rounded-2xl p-3 shadow-glow sm:block bt-float-slow"
        style={{ transform: "translateZ(40px)" }}
      >
        <div className="text-[10px] uppercase tracking-wider text-navy-300">Lighthouse</div>
        <div className="mt-1 flex items-baseline gap-1">
          <div className="font-display text-2xl font-bold text-emerald-400">98</div>
          <div className="text-xs text-slate-400">/ 100</div>
        </div>
        <div className="mt-1 text-[11px] text-slate-400">Performance score</div>
      </div>

      <div
        className="glass absolute -right-2 bottom-6 hidden w-48 rounded-2xl p-3 shadow-glow sm:block bt-float-slow"
        style={{ transform: "translateZ(40px)", animationDelay: "1.2s" }}
      >
        <div className="text-[10px] uppercase tracking-wider text-navy-300">Deploy status</div>
        <div className="mt-1 flex items-center gap-2">
          <span className="relative grid h-2 w-2 place-items-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-xs font-semibold text-white">Live · prod</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400">23s build · 0 errors</div>
      </div>
    </motion.div>
  );
}

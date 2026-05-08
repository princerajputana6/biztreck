"use client";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";

const stats = [
  { value: 120, suffix: "+", label: "Websites & apps shipped" },
  { value: 30, suffix: "+", label: "Startups launched" },
  { value: 4, suffix: "x", label: "Avg. organic traffic uplift" },
  { value: 99.9, suffix: "%", label: "Infra uptime delivered" },
];

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) =>
    to % 1 === 0 ? Math.floor(v).toString() : v.toFixed(1)
  );

  useEffect(() => {
    if (inView) {
      const controls = animate(mv, to, { duration: 1.6, ease: "easeOut" });
      return controls.stop;
    }
  }, [inView, mv, to]);

  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section className="relative z-10 py-16">
      <div className="container-px">
        <div className="glass relative overflow-hidden rounded-3xl px-6 py-10 sm:px-12 sm:py-14">
          <div className="absolute inset-0 -z-0 bg-grid opacity-30" />
          <div className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="font-display text-5xl font-extrabold text-white sm:text-6xl">
                  <span className="gradient-text">
                    <Counter to={s.value} suffix={s.suffix} />
                  </span>
                </div>
                <div className="mt-3 text-sm font-medium uppercase tracking-wider text-slate-400">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

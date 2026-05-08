"use client";
import { motion } from "framer-motion";

export default function BackgroundFX() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-60" />

      <motion.div
        className="glow-orb"
        style={{
          width: 520,
          height: 520,
          top: "-120px",
          left: "-120px",
          background:
            "radial-gradient(circle, rgba(79,124,240,0.55), transparent 60%)",
        }}
        animate={{ y: [0, 40, 0], x: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="glow-orb"
        style={{
          width: 600,
          height: 600,
          top: "30%",
          right: "-200px",
          background:
            "radial-gradient(circle, rgba(34,211,238,0.35), transparent 65%)",
        }}
        animate={{ y: [0, -50, 0], x: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="glow-orb"
        style={{
          width: 480,
          height: 480,
          bottom: "-140px",
          left: "30%",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.45), transparent 60%)",
        }}
        animate={{ y: [0, -30, 0], x: [0, 30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(13,26,58,0.0) 0%, rgba(3,7,17,0.85) 70%)",
        }}
      />
    </div>
  );
}

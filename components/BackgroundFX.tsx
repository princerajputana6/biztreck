"use client";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false });

export default function BackgroundFX() {
  return (
    <>
      <Scene3D />
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
              "radial-gradient(circle, rgba(21,88,203,0.6), transparent 60%)",
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
              "radial-gradient(circle, rgba(212,255,36,0.18), transparent 65%)",
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
              "radial-gradient(circle, rgba(47,111,224,0.5), transparent 60%)",
          }}
          animate={{ y: [0, -30, 0], x: [0, 30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(3,4,7,0) 0%, rgba(3,4,7,0.85) 72%)",
          }}
        />
      </div>
    </>
  );
}

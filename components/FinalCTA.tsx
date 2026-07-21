"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="relative z-10 pb-28 sm:pb-32">
      <div className="container-px">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-navy-700/40 bg-gradient-to-br from-navy-850/80 to-navy-900/60 p-10 text-center sm:p-16"
        >
          <h2 className="section-title text-white">
            Let&apos;s build software that{" "}
            <span className="gradient-text">grows your business.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
            Start with a 30-minute strategy call. We&apos;ll map where software
            would remove the most cost from your operation — and tell you
            honestly if it wouldn&apos;t.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link href="/book-strategy-call" className="btn-primary shine">
              Book Strategy Call
            </Link>
            <Link href="/resources/business-audit" className="btn-ghost">
              Request Proposal
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Loader2, Send, CheckCircle2 } from "lucide-react";

export default function ApplyForm({
  jobSlug,
  jobTitle,
}: {
  jobSlug: string;
  jobTitle: string;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    portfolio: "",
    resumeUrl: "",
    coverLetter: "",
  });
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const update = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.coverLetter) return;
    setStatus("submitting");
    try {
      const r = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, jobSlug, jobTitle }),
      });
      if (!r.ok) throw new Error();
      setStatus("success");
      setForm({
        name: "",
        email: "",
        phone: "",
        experience: "",
        portfolio: "",
        resumeUrl: "",
        coverLetter: "",
      });
    } catch {
      setStatus("error");
    }
  };

  const fieldBase =
    "w-full rounded-xl border border-navy-700/60 bg-navy-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/30";

  return (
    <form onSubmit={submit} className="glass mt-6 rounded-3xl p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name *">
          <input
            required
            className={fieldBase}
            placeholder="Jane Doe"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </Field>
        <Field label="Email *">
          <input
            required
            type="email"
            className={fieldBase}
            placeholder="jane@email.com"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </Field>
        <Field label="Phone">
          <input
            className={fieldBase}
            placeholder="+91 …"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </Field>
        <Field label="Experience">
          <input
            className={fieldBase}
            placeholder="e.g. 3 years"
            value={form.experience}
            onChange={(e) => update("experience", e.target.value)}
          />
        </Field>
        <Field label="Resume URL (Drive / LinkedIn / web)">
          <input
            className={fieldBase}
            placeholder="https://…"
            value={form.resumeUrl}
            onChange={(e) => update("resumeUrl", e.target.value)}
          />
        </Field>
        <Field label="Portfolio / GitHub">
          <input
            className={fieldBase}
            placeholder="https://…"
            value={form.portfolio}
            onChange={(e) => update("portfolio", e.target.value)}
          />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Why are you a fit? *">
          <textarea
            required
            rows={5}
            className={fieldBase + " resize-none"}
            placeholder="Tell us about your background, what excites you about this role, and a project you're proud of."
            value={form.coverLetter}
            onChange={(e) => update("coverLetter", e.target.value)}
          />
        </Field>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          By applying, you agree to our{" "}
          <a className="underline hover:text-white" href="/legal/privacy-policy">
            Privacy Policy
          </a>
          .
        </p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          disabled={status === "submitting"}
          type="submit"
          className="btn-primary shine disabled:opacity-70"
        >
          {status === "submitting" ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Sending…
            </>
          ) : (
            <>
              Submit application <Send size={14} />
            </>
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300"
          >
            <CheckCircle2 size={16} /> Application received! We&apos;ll be in
            touch within a week.
          </motion.div>
        )}
        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-5 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300"
          >
            Something went wrong. Please email connect@biztreck.world.
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
      </div>
      {children}
    </label>
  );
}

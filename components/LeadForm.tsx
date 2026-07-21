"use client";
import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

const budgets = [
  "Not sure yet",
  "Under $10k",
  "$10k – $25k",
  "$25k – $50k",
  "$50k – $100k",
  "$100k+",
];

const timelines = ["Not sure yet", "ASAP", "1–3 months", "3–6 months", "6 months+"];

/**
 * Shared conversion form for the strategy-call and business-audit pages.
 * Keeps required fields minimal (name, email, message) per the lead-gen spec;
 * optional context is appended to the message so nothing is lost server-side.
 */
export default function LeadForm({
  service,
  submitLabel,
  messageLabel = "What are you trying to solve?",
  messagePlaceholder,
}: {
  service: string;
  submitLabel: string;
  messageLabel?: string;
  messagePlaceholder?: string;
}) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    website: "",
    message: "",
    budget: budgets[0],
    timeline: timelines[0],
  });

  const update = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus("submitting");
    try {
      const message = [
        form.message,
        "",
        `Website: ${form.website || "—"}`,
        `Timeline: ${form.timeline}`,
      ].join("\n");
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          company: form.company,
          phone: "",
          service,
          budget: form.budget,
          message,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setForm({
        name: "",
        email: "",
        company: "",
        website: "",
        message: "",
        budget: budgets[0],
        timeline: timelines[0],
      });
    } catch {
      setStatus("error");
    }
  };

  const fieldBase =
    "w-full rounded-xl border border-navy-700/60 bg-navy-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/30";

  if (status === "success") {
    return (
      <div className="rounded-3xl border border-accent-cyan/30 bg-navy-900/60 p-10 text-center">
        <h3 className="font-display text-2xl font-bold text-white">
          Request received
        </h3>
        <p className="mx-auto mt-3 max-w-md text-slate-300">
          Thanks — we&apos;ve got your details and will reply within one business
          day with next steps.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm text-slate-300">
          Name *
          <input
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Jane Cooper"
            className={fieldBase}
          />
        </label>
        <label className="grid gap-1.5 text-sm text-slate-300">
          Work email *
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="jane@company.com"
            className={fieldBase}
          />
        </label>
        <label className="grid gap-1.5 text-sm text-slate-300">
          Company
          <input
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
            placeholder="Company name"
            className={fieldBase}
          />
        </label>
        <label className="grid gap-1.5 text-sm text-slate-300">
          Website
          <input
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
            placeholder="company.com"
            className={fieldBase}
          />
        </label>
      </div>

      <label className="grid gap-1.5 text-sm text-slate-300">
        {messageLabel} *
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder={messagePlaceholder}
          className={`${fieldBase} resize-y`}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm text-slate-300">
          Budget (optional)
          <select
            value={form.budget}
            onChange={(e) => update("budget", e.target.value)}
            className={fieldBase}
          >
            {budgets.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm text-slate-300">
          Timeline (optional)
          <select
            value={form.timeline}
            onChange={(e) => update("timeline", e.target.value)}
            className={fieldBase}
          >
            {timelines.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn-primary shine mt-2 inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <ArrowRight size={16} />
        )}
        {submitLabel}
      </button>

      {status === "error" && (
        <p className="text-sm text-rose-300">
          Something went wrong. Please email us directly and we&apos;ll pick it up.
        </p>
      )}
      <p className="text-xs text-slate-500">
        No obligation, no sales pitch. We reply within one business day.
      </p>
    </form>
  );
}

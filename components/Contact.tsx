"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2 } from "lucide-react";

const services = [
  "Website Revamp",
  "Web Development",
  "App Development",
  "DevOps Solutions",
  "SEO & Ranking",
  "Startup Launch (0 → 1)",
  "Other",
];

const budgets = ["< $2k", "$2k – $5k", "$5k – $15k", "$15k – $50k", "$50k+"];

type Status = "idle" | "submitting" | "success" | "error";

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    service: services[0],
    budget: budgets[1],
    message: "",
  });

  const update = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setForm({
        name: "",
        email: "",
        company: "",
        phone: "",
        service: services[0],
        budget: budgets[1],
        message: "",
      });
    } catch {
      setStatus("error");
    }
  };

  const fieldBase =
    "w-full rounded-xl border border-navy-700/60 bg-navy-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/30";

  return (
    <section id="contact" className="relative z-10 py-28 sm:py-32">
      <div className="container-px">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="eyebrow">Get in touch</div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="section-title mt-5 text-white"
            >
              Let&apos;s build something{" "}
              <span className="gradient-text">remarkable.</span>
            </motion.h2>
            <p className="mt-5 text-lg text-slate-300">
              Tell us about your project. We&apos;ll get back within 24 hours
              with a free, no-obligation proposal and roadmap.
            </p>

            <div className="mt-10 space-y-4">
              {[
                {
                  icon: Mail,
                  label: "Email",
                  value: "connect@biztreck.world",
                  href: "mailto:connect@biztreck.world",
                },
                {
                  icon: Phone,
                  label: "Phone",
                  value: "+91 87408 63229",
                  href: "tel:+918740863229",
                },
                {
                  icon: MapPin,
                  label: "Location",
                  value: "Greater Noida, Delhi NCR (201306)",
                },
              ].map((c, i) => {
                const Icon = c.icon;
                const Wrap: any = c.href ? "a" : "div";
                return (
                  <motion.div
                    key={c.label}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <Wrap
                      {...(c.href ? { href: c.href } : {})}
                      className="glass flex items-center gap-4 rounded-2xl p-4 transition-all hover:border-accent-electric/40"
                    >
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-navy-500 to-accent-electric shadow-glow">
                        <Icon size={18} className="text-white" />
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wider text-navy-300">
                          {c.label}
                        </div>
                        <div className="font-medium text-white">{c.value}</div>
                      </div>
                    </Wrap>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7">
            <motion.form
              onSubmit={onSubmit}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass relative overflow-hidden rounded-3xl p-6 sm:p-10"
            >
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-accent-electric/15 blur-3xl" />

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400">
                    Full name *
                  </label>
                  <input
                    required
                    className={fieldBase}
                    placeholder="Jane Doe"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400">
                    Email *
                  </label>
                  <input
                    required
                    type="email"
                    className={fieldBase}
                    placeholder="jane@company.com"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400">
                    Company
                  </label>
                  <input
                    className={fieldBase}
                    placeholder="Acme Inc."
                    value={form.company}
                    onChange={(e) => update("company", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400">
                    Phone
                  </label>
                  <input
                    className={fieldBase}
                    placeholder="+1 555 000 1234"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400">
                    Service interested in
                  </label>
                  <select
                    className={fieldBase}
                    value={form.service}
                    onChange={(e) => update("service", e.target.value)}
                  >
                    {services.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400">
                    Estimated budget
                  </label>
                  <select
                    className={fieldBase}
                    value={form.budget}
                    onChange={(e) => update("budget", e.target.value)}
                  >
                    {budgets.map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400">
                  Project details *
                </label>
                <textarea
                  required
                  rows={5}
                  className={fieldBase + " resize-none"}
                  placeholder="Tell us about your goals, timeline, and what success looks like."
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                />
              </div>

              <div className="mt-7 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-400">
                  By submitting you agree to our{" "}
                  <a
                    href="#privacy"
                    className="underline decoration-dotted underline-offset-4 hover:text-white"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={status === "submitting"}
                  className="btn-primary shine disabled:opacity-70"
                  type="submit"
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Sending…
                    </>
                  ) : (
                    <>
                      Send message <Send size={16} />
                    </>
                  )}
                </motion.button>
              </div>

              <AnimatePresence>
                {status === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300"
                  >
                    <CheckCircle2 size={18} />
                    Thanks! Your message is in. We&apos;ll reply within 24
                    hours.
                  </motion.div>
                )}
                {status === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-5 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300"
                  >
                    Something went wrong. Please email connect@biztreck.world.
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.form>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Sparkles,
  Loader2,
  ArrowLeft,
  Save,
  RotateCw,
  Plus,
  X,
} from "lucide-react";
import Logo from "@/components/Logo";
import Link from "next/link";

type Generated = {
  title: string;
  slug: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  salary: string;
  shortDescription: string;
  descriptionMarkdown: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  benefits: string[];
};

export default function NewJobClient() {
  const router = useRouter();
  const [brief, setBrief] = useState({
    role: "",
    location: "Greater Noida, Delhi NCR (Hybrid)",
    type: "Full-time",
    experience: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [job, setJob] = useState<Generated | null>(null);

  const generate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!brief.role.trim()) return;
    setLoading(true);
    setError("");
    setJob(null);
    try {
      const r = await fetch("/api/admin/generate/job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brief),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed");
      setJob(d.job);
    } catch (e: any) {
      setError(e?.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!job) return;
    setSaving(true);
    setError("");
    try {
      const r = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...job, active: true }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Save failed");
      router.push(`/careers/${d.slug}`);
    } catch (e: any) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof Generated>(k: K, v: Generated[K]) =>
    setJob((b) => (b ? { ...b, [k]: v } : b));

  const updateList = (
    key: "responsibilities" | "requirements" | "niceToHave" | "benefits",
    i: number,
    v: string
  ) => {
    setJob((b) => {
      if (!b) return b;
      const arr = [...b[key]];
      arr[i] = v;
      return { ...b, [key]: arr };
    });
  };

  const addItem = (key: "responsibilities" | "requirements" | "niceToHave" | "benefits") =>
    setJob((b) => (b ? { ...b, [key]: [...b[key], ""] } : b));

  const removeItem = (
    key: "responsibilities" | "requirements" | "niceToHave" | "benefits",
    i: number
  ) =>
    setJob((b) => {
      if (!b) return b;
      const arr = b[key].filter((_, idx) => idx !== i);
      return { ...b, [key]: arr };
    });

  return (
    <div className="min-h-screen bg-navy-950">
      <header className="border-b border-navy-700/40 bg-navy-950/80 backdrop-blur-xl">
        <div className="container-px flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={48} href="/admin" showWordmark={false} />
            <span className="rounded-full border border-accent-cyan/40 bg-accent-cyan/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent-cyan">
              Admin · New role
            </span>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"
          >
            <ArrowLeft size={14} /> Dashboard
          </Link>
        </div>
      </header>

      <main className="container-px py-10">
        <div className="eyebrow">AI Job description generator</div>
        <h1 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
          Type a role — get a complete job listing.
        </h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Generates the full description, responsibilities, requirements,
          benefits, and salary range — all editable.
        </p>

        <form
          onSubmit={generate}
          className="glass mt-8 grid gap-3 rounded-2xl p-5 sm:grid-cols-2"
        >
          <Field label="Role *">
            <input
              required
              value={brief.role}
              onChange={(e) => setBrief({ ...brief, role: e.target.value })}
              placeholder="Senior Next.js Engineer"
              className="w-full rounded-xl border border-navy-700/60 bg-navy-900/60 px-4 py-3 text-sm text-white outline-none focus:border-accent-electric"
            />
          </Field>
          <Field label="Location">
            <input
              value={brief.location}
              onChange={(e) => setBrief({ ...brief, location: e.target.value })}
              className="w-full rounded-xl border border-navy-700/60 bg-navy-900/60 px-4 py-3 text-sm text-white outline-none focus:border-accent-electric"
            />
          </Field>
          <Field label="Type">
            <select
              value={brief.type}
              onChange={(e) => setBrief({ ...brief, type: e.target.value })}
              className="w-full rounded-xl border border-navy-700/60 bg-navy-900/60 px-4 py-3 text-sm text-white outline-none focus:border-accent-electric"
            >
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
          </Field>
          <Field label="Experience">
            <input
              value={brief.experience}
              onChange={(e) => setBrief({ ...brief, experience: e.target.value })}
              placeholder="e.g. 2-4 years"
              className="w-full rounded-xl border border-navy-700/60 bg-navy-900/60 px-4 py-3 text-sm text-white outline-none focus:border-accent-electric"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Additional notes / must-haves">
              <textarea
                rows={3}
                value={brief.notes}
                onChange={(e) => setBrief({ ...brief, notes: e.target.value })}
                placeholder="Anything specific you want highlighted (tech stack, team size, mission)…"
                className="w-full resize-none rounded-xl border border-navy-700/60 bg-navy-900/60 px-4 py-3 text-sm text-white outline-none focus:border-accent-electric"
              />
            </Field>
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={loading || !brief.role.trim()}
              className="btn-primary shine disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Generate listing
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 grid place-items-center gap-3 rounded-3xl border border-dashed border-navy-700/50 p-12 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles size={28} className="text-accent-glow" />
              </motion.div>
              <p className="text-sm text-slate-400">
                Crafting your job description…
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {job && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 grid gap-6 lg:grid-cols-12"
          >
            <div className="lg:col-span-8 space-y-6">
              <div className="glass rounded-3xl p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider text-navy-300">
                  <Editable
                    value={job.department}
                    onChange={(v) => updateField("department", v)}
                  />
                  <span>·</span>
                  <Editable value={job.type} onChange={(v) => updateField("type", v)} />
                </div>
                <input
                  value={job.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className="mt-3 w-full bg-transparent font-display text-3xl font-bold text-white outline-none"
                />
                <textarea
                  value={job.shortDescription}
                  onChange={(e) => updateField("shortDescription", e.target.value)}
                  rows={2}
                  className="mt-3 w-full resize-none rounded-xl border border-navy-700/40 bg-navy-900/40 p-3 text-sm text-slate-300 outline-none"
                />
              </div>

              <ListEditor
                title="Responsibilities"
                items={job.responsibilities}
                onChange={(i, v) => updateList("responsibilities", i, v)}
                onAdd={() => addItem("responsibilities")}
                onRemove={(i) => removeItem("responsibilities", i)}
              />
              <ListEditor
                title="Requirements"
                items={job.requirements}
                onChange={(i, v) => updateList("requirements", i, v)}
                onAdd={() => addItem("requirements")}
                onRemove={(i) => removeItem("requirements", i)}
              />
              <ListEditor
                title="Nice to have"
                items={job.niceToHave}
                onChange={(i, v) => updateList("niceToHave", i, v)}
                onAdd={() => addItem("niceToHave")}
                onRemove={(i) => removeItem("niceToHave", i)}
              />
              <ListEditor
                title="Benefits"
                items={job.benefits}
                onChange={(i, v) => updateList("benefits", i, v)}
                onAdd={() => addItem("benefits")}
                onRemove={(i) => removeItem("benefits", i)}
              />

              <div className="glass rounded-3xl p-6">
                <div className="text-xs uppercase tracking-wider text-navy-300">
                  Description (markdown)
                </div>
                <textarea
                  value={job.descriptionMarkdown}
                  onChange={(e) => updateField("descriptionMarkdown", e.target.value)}
                  className="mt-3 h-72 w-full resize-y rounded-xl border border-navy-700/40 bg-navy-900/60 p-4 font-mono text-[13px] leading-relaxed text-slate-200 outline-none"
                />
              </div>
            </div>

            <aside className="lg:col-span-4">
              <div className="glass sticky top-24 rounded-3xl p-6">
                <h3 className="font-display text-lg font-semibold text-white">
                  Publish settings
                </h3>
                <div className="mt-4 space-y-4">
                  <Field label="Slug">
                    <input
                      value={job.slug}
                      onChange={(e) => updateField("slug", e.target.value)}
                      className="w-full rounded-xl border border-navy-700/40 bg-navy-900/60 px-3 py-2 text-sm text-white outline-none"
                    />
                  </Field>
                  <Field label="Location">
                    <input
                      value={job.location}
                      onChange={(e) => updateField("location", e.target.value)}
                      className="w-full rounded-xl border border-navy-700/40 bg-navy-900/60 px-3 py-2 text-sm text-white outline-none"
                    />
                  </Field>
                  <Field label="Experience">
                    <input
                      value={job.experience}
                      onChange={(e) => updateField("experience", e.target.value)}
                      className="w-full rounded-xl border border-navy-700/40 bg-navy-900/60 px-3 py-2 text-sm text-white outline-none"
                    />
                  </Field>
                  <Field label="Salary">
                    <input
                      value={job.salary}
                      onChange={(e) => updateField("salary", e.target.value)}
                      className="w-full rounded-xl border border-navy-700/40 bg-navy-900/60 px-3 py-2 text-sm text-white outline-none"
                    />
                  </Field>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => generate()}
                    disabled={loading}
                    className="btn-ghost"
                  >
                    <RotateCw size={14} /> Regenerate
                  </button>
                  <button
                    onClick={save}
                    disabled={saving}
                    className="btn-primary shine disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Saving…
                      </>
                    ) : (
                      <>
                        <Save size={14} /> Publish
                      </>
                    )}
                  </button>
                </div>
              </div>
            </aside>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
      </div>
      {children}
    </label>
  );
}

function Editable({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded bg-transparent text-xs uppercase tracking-wider outline-none focus:bg-navy-900/60"
      style={{ width: `${Math.max(value.length, 6)}ch` }}
    />
  );
}

function ListEditor({
  title,
  items,
  onChange,
  onAdd,
  onRemove,
}: {
  title: string;
  items: string[];
  onChange: (i: number, v: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div className="glass rounded-3xl p-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
        <button
          onClick={onAdd}
          type="button"
          className="inline-flex items-center gap-1 rounded-full border border-navy-700/50 bg-navy-800/40 px-3 py-1 text-xs text-slate-200 hover:border-accent-electric"
        >
          <Plus size={12} /> Add
        </button>
      </div>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={it}
              onChange={(e) => onChange(i, e.target.value)}
              className="flex-1 rounded-xl border border-navy-700/40 bg-navy-900/60 px-3 py-2 text-sm text-white outline-none"
            />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-rose-400/20 bg-rose-400/5 text-rose-300 hover:border-rose-400/50"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

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
  Image as ImageIcon,
} from "lucide-react";
import Logo from "@/components/Logo";
import Link from "next/link";

type Generated = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  readMinutes: number;
  coverPrompt: string;
  coverImage: string;
  contentMarkdown: string;
};

const sampleTopics = [
  "How to migrate a 10-year-old website to Next.js without losing SEO",
  "Why most startup MVPs fail in their first 90 days — and a fix",
  "DevOps for non-DevOps teams: a 5-step starter blueprint",
  "Technical SEO checklist every founder should run quarterly",
  "Designing dashboards that don't drown the user in data",
];

export default function NewBlogClient() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [blog, setBlog] = useState<Generated | null>(null);

  const generate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setBlog(null);
    try {
      const r = await fetch("/api/admin/generate/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed");
      setBlog(d.blog);
    } catch (e: any) {
      setError(e?.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!blog) return;
    setSaving(true);
    setError("");
    try {
      const r = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...blog, published: true }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Save failed");
      router.push(`/blog/${d.slug}`);
    } catch (e: any) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof Generated>(k: K, v: Generated[K]) =>
    setBlog((b) => (b ? { ...b, [k]: v } : b));

  return (
    <div className="min-h-screen bg-navy-950">
      <header className="border-b border-navy-700/40 bg-navy-950/80 backdrop-blur-xl">
        <div className="container-px flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={48} href="/admin" showWordmark={false} />
            <span className="rounded-full border border-accent-cyan/40 bg-accent-cyan/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent-cyan">
              Admin · New blog
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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="eyebrow">AI Blog generator</div>
          <h1 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
            Type a topic — get a publish-ready post.
          </h1>
          <p className="mt-2 max-w-2xl text-slate-400">
            Powered by Groq + Llama 3.3. Generates the full markdown article,
            tags, excerpt, cover image, and SEO slug in one click.
          </p>
        </motion.div>

        <form
          onSubmit={generate}
          className="glass mt-8 flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center"
        >
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. How modern startups should think about DevOps"
            className="flex-1 rounded-xl border border-navy-700/60 bg-navy-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-accent-electric"
          />
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="btn-primary shine disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Generating…
              </>
            ) : (
              <>
                <Sparkles size={16} /> Generate post
              </>
            )}
          </button>
        </form>

        {!blog && !loading && (
          <div className="mt-4 flex flex-wrap gap-2">
            {sampleTopics.map((s) => (
              <button
                key={s}
                onClick={() => setTopic(s)}
                className="rounded-full border border-navy-700/50 bg-navy-800/40 px-3 py-1.5 text-xs text-slate-300 hover:border-accent-electric"
              >
                {s}
              </button>
            ))}
          </div>
        )}

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
                Crafting your blog post… this typically takes 8-15s.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {blog && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 grid gap-6 lg:grid-cols-12"
          >
            <div className="lg:col-span-8">
              <div className="glass overflow-hidden rounded-3xl">
                <div className="relative aspect-[16/8]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={blog.coverImage}
                    alt={blog.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-navy-300">
                    {blog.category} · {blog.readMinutes} min
                  </div>
                  <input
                    value={blog.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    className="mt-3 w-full bg-transparent font-display text-3xl font-bold text-white outline-none"
                  />
                  <textarea
                    value={blog.excerpt}
                    onChange={(e) => updateField("excerpt", e.target.value)}
                    rows={2}
                    className="mt-4 w-full resize-none rounded-xl border border-navy-700/40 bg-navy-900/40 p-3 text-sm text-slate-300 outline-none"
                  />
                </div>
              </div>

              <div className="glass mt-6 rounded-3xl p-6">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-xs uppercase tracking-wider text-navy-300">
                    Markdown content
                  </div>
                  <span className="text-xs text-slate-500">
                    {blog.contentMarkdown.length} chars
                  </span>
                </div>
                <textarea
                  value={blog.contentMarkdown}
                  onChange={(e) => updateField("contentMarkdown", e.target.value)}
                  className="h-[600px] w-full resize-y rounded-xl border border-navy-700/40 bg-navy-900/60 p-4 font-mono text-[13px] leading-relaxed text-slate-200 outline-none"
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
                      value={blog.slug}
                      onChange={(e) => updateField("slug", e.target.value)}
                      className="w-full rounded-xl border border-navy-700/40 bg-navy-900/60 px-3 py-2 text-sm text-white outline-none"
                    />
                  </Field>
                  <Field label="Category">
                    <input
                      value={blog.category}
                      onChange={(e) => updateField("category", e.target.value)}
                      className="w-full rounded-xl border border-navy-700/40 bg-navy-900/60 px-3 py-2 text-sm text-white outline-none"
                    />
                  </Field>
                  <Field label="Tags (comma separated)">
                    <input
                      value={blog.tags.join(", ")}
                      onChange={(e) =>
                        updateField(
                          "tags",
                          e.target.value
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean)
                        )
                      }
                      className="w-full rounded-xl border border-navy-700/40 bg-navy-900/60 px-3 py-2 text-sm text-white outline-none"
                    />
                  </Field>
                  <Field label="Read minutes">
                    <input
                      type="number"
                      value={blog.readMinutes}
                      onChange={(e) =>
                        updateField("readMinutes", Number(e.target.value))
                      }
                      className="w-full rounded-xl border border-navy-700/40 bg-navy-900/60 px-3 py-2 text-sm text-white outline-none"
                    />
                  </Field>
                  <Field label="Cover image URL">
                    <input
                      value={blog.coverImage}
                      onChange={(e) => updateField("coverImage", e.target.value)}
                      className="w-full rounded-xl border border-navy-700/40 bg-navy-900/60 px-3 py-2 text-xs text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const enc = encodeURIComponent(blog.coverPrompt);
                        updateField(
                          "coverImage",
                          `https://image.pollinations.ai/prompt/${enc}?width=1200&height=630&nologo=true&seed=${Math.floor(Math.random() * 1e9)}`
                        );
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-navy-700/50 bg-navy-800/40 px-3 py-1.5 text-xs text-slate-200 hover:border-accent-electric"
                    >
                      <ImageIcon size={12} /> Re-roll image
                    </button>
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

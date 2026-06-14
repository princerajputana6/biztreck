"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Briefcase,
  Mail,
  MessageSquare,
  Users,
  PlusCircle,
  LogOut,
  Trash2,
  ExternalLink,
  Sparkles,
  Loader2,
} from "lucide-react";
import Logo from "@/components/Logo";
import { useState } from "react";

type Stats = {
  blogs: any[];
  jobs: any[];
  applicationsCount: number;
  contactsCount: number;
  commentsCount: number;
};

export default function AdminShell({
  blogs,
  jobs,
  applicationsCount,
  contactsCount,
  commentsCount,
}: Stats) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  type AutoState = {
    busy: boolean;
    result: {
      ok: boolean;
      message: string;
      inserted?: { title: string; slug: string }[];
    } | null;
  };
  const [autoBlogs, setAutoBlogs] = useState<AutoState>({ busy: false, result: null });
  const [autoJobs, setAutoJobs] = useState<AutoState>({ busy: false, result: null });

  async function runAutoPublish(opts: {
    kind: "blogs" | "jobs";
    count: number;
    confirmMsg: string;
    endpoint: string;
    noun: string;
    setState: (s: AutoState) => void;
  }) {
    if (!confirm(opts.confirmMsg)) return;
    opts.setState({ busy: true, result: null });
    try {
      const res = await fetch(opts.endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ count: opts.count }),
      });
      const data = await res.json();
      if (!data.ok) {
        opts.setState({
          busy: false,
          result: { ok: false, message: data.error || "Auto-publish failed" },
        });
        return;
      }
      const n = data.inserted?.length ?? 0;
      const failed = data.failed?.length ?? 0;
      opts.setState({
        busy: false,
        result: {
          ok: true,
          message:
            failed > 0
              ? `Published ${n} ${opts.noun} (${failed} failed). Refreshing…`
              : `Published ${n} ${opts.noun}. Refreshing…`,
          inserted: data.inserted,
        },
      });
      setTimeout(() => router.refresh(), 1200);
    } catch (e: any) {
      opts.setState({
        busy: false,
        result: { ok: false, message: e?.message || "Network error" },
      });
    }
  }

  const autoPublishBlogs = () =>
    runAutoPublish({
      kind: "blogs",
      count: 5,
      confirmMsg:
        "Auto-publish 5 trending blogs?\n\nThis will find 5 trending topics related to your business and generate + publish 5 full blog posts. Takes ~20-40 seconds.",
      endpoint: "/api/admin/auto-publish-blogs",
      noun: "posts",
      setState: setAutoBlogs,
    });

  const autoPublishJobs = () =>
    runAutoPublish({
      kind: "jobs",
      count: 3,
      confirmMsg:
        "Auto-publish 3 in-demand roles?\n\nThis will find 3 in-demand role briefs and generate + publish 3 full job postings. Takes ~15-30 seconds.",
      endpoint: "/api/admin/auto-publish-jobs",
      noun: "roles",
      setState: setAutoJobs,
    });

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.replace("/admin/login");
  };

  const remove = async (kind: "blogs" | "jobs", slug: string) => {
    if (!confirm(`Delete this ${kind === "blogs" ? "post" : "role"}?`)) return;
    setBusy(slug);
    try {
      await fetch(`/api/${kind}/${slug}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  const cards = [
    {
      label: "Posts",
      value: blogs.length,
      icon: FileText,
      href: "/admin/blogs/new",
      cta: "New post",
    },
    {
      label: "Roles",
      value: jobs.length,
      icon: Briefcase,
      href: "/admin/jobs/new",
      cta: "New role",
    },
    {
      label: "Applications",
      value: applicationsCount,
      icon: Users,
      href: "#applications",
      cta: "—",
    },
    {
      label: "Inquiries",
      value: contactsCount,
      icon: Mail,
      href: "#contacts",
      cta: "—",
    },
    {
      label: "Comments",
      value: commentsCount,
      icon: MessageSquare,
      href: "#comments",
      cta: "—",
    },
  ];

  return (
    <div className="min-h-screen bg-navy-950">
      <header className="sticky top-0 z-50 border-b border-navy-700/40 bg-navy-950/80 backdrop-blur-xl">
        <div className="container-px flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={56} href="/admin" showWordmark={false} />
            <span className="rounded-full border border-accent-cyan/40 bg-accent-cyan/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent-cyan">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden text-sm text-slate-300 hover:text-white sm:inline-flex"
            >
              View site →
            </Link>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full border border-navy-700/60 bg-navy-800/50 px-4 py-2 text-sm text-slate-200 hover:border-rose-400/40 hover:text-rose-300"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container-px py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold text-white">
            Welcome back, admin
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Generate AI-powered blog posts and job listings, manage submissions.
          </p>
        </motion.div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-5"
              >
                <div className="flex items-center justify-between">
                  <Icon size={18} className="text-accent-glow" />
                  <span className="text-xs uppercase tracking-wider text-slate-400">
                    {c.label}
                  </span>
                </div>
                <div className="mt-3 font-display text-3xl font-bold text-white">
                  {c.value}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mb-4 flex flex-wrap gap-3">
          <Link
            href="/admin/blogs/new"
            className="btn-primary shine inline-flex items-center gap-2"
          >
            <PlusCircle size={16} /> Generate new blog
          </Link>
          <button
            type="button"
            onClick={autoPublishBlogs}
            disabled={autoBlogs.busy}
            className="btn-ghost inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              borderColor: "rgba(167, 139, 250, 0.5)",
              background: autoBlogs.busy
                ? "rgba(167, 139, 250, 0.18)"
                : "rgba(76, 53, 178, 0.25)",
            }}
            title="Discover 5 trending topics and publish a full blog post for each"
          >
            {autoBlogs.busy ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating 5 blogs… (~20-40s)
              </>
            ) : (
              <>
                <Sparkles size={16} /> Auto-publish 5 trending blogs
              </>
            )}
          </button>
          <Link
            href="/admin/jobs/new"
            className="btn-ghost inline-flex items-center gap-2"
          >
            <PlusCircle size={16} /> Generate new job
          </Link>
          <button
            type="button"
            onClick={autoPublishJobs}
            disabled={autoJobs.busy}
            className="btn-ghost inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              borderColor: "rgba(34, 211, 238, 0.5)",
              background: autoJobs.busy
                ? "rgba(34, 211, 238, 0.18)"
                : "rgba(7, 89, 133, 0.35)",
            }}
            title="Discover 3 in-demand roles and publish a full job posting for each"
          >
            {autoJobs.busy ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating 3 roles… (~15-30s)
              </>
            ) : (
              <>
                <Sparkles size={16} /> Auto-publish 3 in-demand roles
              </>
            )}
          </button>
        </div>

        {(autoBlogs.result || autoJobs.result) && (
          <div className="mb-8 space-y-3">
            {autoBlogs.result && (
              <AutoResultBanner
                result={autoBlogs.result}
                hrefBuilder={(slug) => `/blog/${slug}`}
              />
            )}
            {autoJobs.result && (
              <AutoResultBanner
                result={autoJobs.result}
                hrefBuilder={(slug) => `/careers/${slug}`}
              />
            )}
          </div>
        )}

        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-white">Posts</h2>
            <span className="text-sm text-slate-400">{blogs.length} total</span>
          </div>
          {blogs.length === 0 ? (
            <Empty label="No posts yet — generate your first AI blog." />
          ) : (
            <div className="grid gap-3">
              {blogs.map((b: any) => (
                <div
                  key={b._id}
                  className="glass flex flex-wrap items-center gap-4 rounded-2xl p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-white">{b.title}</div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      /{b.slug} · {b.category} · {new Date(b.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Link
                    href={`/blog/${b.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-full border border-navy-700/60 bg-navy-800/40 px-3 py-1.5 text-xs text-slate-200 hover:border-accent-electric"
                  >
                    <ExternalLink size={12} /> View
                  </Link>
                  <button
                    onClick={() => remove("blogs", b.slug)}
                    disabled={busy === b.slug}
                    className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 text-xs text-rose-300 hover:border-rose-400/60"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-white">
              Open roles
            </h2>
            <span className="text-sm text-slate-400">{jobs.length} total</span>
          </div>
          {jobs.length === 0 ? (
            <Empty label="No roles yet — generate your first AI job description." />
          ) : (
            <div className="grid gap-3">
              {jobs.map((j: any) => (
                <div
                  key={j._id}
                  className="glass flex flex-wrap items-center gap-4 rounded-2xl p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-white">{j.title}</div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      {j.department} · {j.location} · {j.type}
                    </div>
                  </div>
                  <Link
                    href={`/careers/${j.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-full border border-navy-700/60 bg-navy-800/40 px-3 py-1.5 text-xs text-slate-200 hover:border-accent-electric"
                  >
                    <ExternalLink size={12} /> View
                  </Link>
                  <button
                    onClick={() => remove("jobs", j.slug)}
                    disabled={busy === j.slug}
                    className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 text-xs text-rose-300 hover:border-rose-400/60"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-navy-700/40 bg-navy-800/20 p-8 text-center text-sm text-slate-400">
      {label}
    </div>
  );
}

function AutoResultBanner({
  result,
  hrefBuilder,
}: {
  result: {
    ok: boolean;
    message: string;
    inserted?: { title: string; slug: string }[];
  };
  hrefBuilder: (slug: string) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border px-5 py-4 text-sm ${
        result.ok
          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
          : "border-rose-400/40 bg-rose-400/10 text-rose-200"
      }`}
    >
      <div className="font-semibold">{result.message}</div>
      {result.inserted && result.inserted.length > 0 && (
        <ul className="mt-2 space-y-1 text-slate-200/90">
          {result.inserted.map((p) => (
            <li key={p.slug} className="flex items-center gap-2">
              <span className="text-emerald-300">✓</span>
              <Link
                href={hrefBuilder(p.slug)}
                target="_blank"
                className="hover:underline"
              >
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

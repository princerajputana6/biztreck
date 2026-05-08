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

        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            href="/admin/blogs/new"
            className="btn-primary shine inline-flex items-center gap-2"
          >
            <PlusCircle size={16} /> Generate new blog
          </Link>
          <Link
            href="/admin/jobs/new"
            className="btn-ghost inline-flex items-center gap-2"
          >
            <PlusCircle size={16} /> Generate new job
          </Link>
        </div>

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

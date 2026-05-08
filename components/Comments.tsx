"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Loader2, CheckCircle2 } from "lucide-react";

type Comment = {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

export default function Comments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  );

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/blogs/${slug}/comments`, { cache: "no-store" });
      const d = await r.json();
      setComments(d.comments || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [slug]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setStatus("submitting");
    try {
      const r = await fetch(`/api/blogs/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!r.ok) throw new Error();
      setStatus("success");
      setMessage("");
      await load();
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="mt-16 border-t border-navy-700/40 pt-10">
      <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-white">
        <MessageCircle size={20} className="text-accent-glow" /> Comments
        <span className="ml-2 text-sm font-normal text-slate-400">
          ({comments.length})
        </span>
      </h2>

      <form
        onSubmit={submit}
        className="glass mt-6 grid gap-3 rounded-2xl p-5 sm:grid-cols-2"
      >
        <input
          required
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl border border-navy-700/60 bg-navy-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-accent-electric"
        />
        <input
          required
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border border-navy-700/60 bg-navy-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-accent-electric"
        />
        <textarea
          required
          rows={3}
          placeholder="Share your thoughts…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="resize-none rounded-xl border border-navy-700/60 bg-navy-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-accent-electric sm:col-span-2"
        />
        <div className="sm:col-span-2 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Be kind. Off-topic or abusive comments may be removed.
          </p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            disabled={status === "submitting"}
            type="submit"
            className="btn-primary shine"
          >
            {status === "submitting" ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Posting…
              </>
            ) : (
              <>
                Post <Send size={14} />
              </>
            )}
          </motion.button>
        </div>
      </form>

      <AnimatePresence>
        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300"
          >
            <CheckCircle2 size={16} /> Thanks for the comment!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 space-y-4">
        {loading ? (
          <div className="text-sm text-slate-400">Loading…</div>
        ) : comments.length === 0 ? (
          <div className="rounded-2xl border border-navy-700/30 bg-navy-800/20 p-6 text-center text-sm text-slate-400">
            No comments yet. Be the first to share your thoughts.
          </div>
        ) : (
          comments.map((c) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-navy-500 to-accent-cyan font-bold text-white">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-white">{c.name}</div>
                  <div className="text-xs text-slate-500">
                    {new Date(c.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-200">
                {c.message}
              </p>
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
}

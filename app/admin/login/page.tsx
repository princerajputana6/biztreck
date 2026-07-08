"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock, Loader2, Mail } from "lucide-react";
import Logo from "@/components/Logo";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Login failed");
      router.push("/admin");
      router.refresh();
    } catch (e: any) {
      setError(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-navy-950 px-4">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
      <div
        className="glow-orb"
        style={{
          width: 500,
          height: 500,
          left: "-100px",
          top: "-100px",
          background: "radial-gradient(circle, rgba(79,124,240,0.5), transparent 60%)",
        }}
      />
      <div
        className="glow-orb"
        style={{
          width: 500,
          height: 500,
          right: "-100px",
          bottom: "-100px",
          background: "radial-gradient(circle, rgba(34,211,238,0.4), transparent 60%)",
        }}
      />

      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass relative w-full max-w-sm rounded-3xl p-8"
      >
        <div className="flex justify-center">
          <Logo showWordmark={false} size={56} href="" />
        </div>
        <h1 className="mt-5 text-center font-display text-2xl font-bold text-white">
          Admin Access
        </h1>
        <p className="mt-1 text-center text-sm text-slate-400">
          Enter your admin email and password to continue.
        </p>

        <div className="mt-6">
          <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Email
          </label>
          <div className="relative mt-2">
            <Mail
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              autoFocus
              type="email"
              className="w-full rounded-xl border border-navy-700/60 bg-navy-900/60 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-accent-electric"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@biztreck.com"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Password
          </label>
          <div className="relative mt-2">
            <Lock
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              autoFocus
              type="password"
              required
              className="w-full rounded-xl border border-navy-700/60 bg-navy-900/60 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-accent-electric"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-300">
            {error}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          className="btn-primary shine mt-5 w-full disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </motion.button>
      </motion.form>
    </main>
  );
}

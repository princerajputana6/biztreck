"use client";
import { useCallback, useEffect, useState } from "react";
import { Check, ExternalLink, Info, Link2, Loader2, Unplug } from "lucide-react";
import { PROVIDERS, type IntegrationProvider } from "@/lib/integrations";

type Status = Record<
  string,
  { connected: boolean; updatedAt: string | null; fields: string[]; email: string | null }
>;

export default function IntegrationsView() {
  const [status, setStatus] = useState<Status>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; msg: string } | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/integrations");
      const data = await res.json();
      if (data.ok) setStatus(data.status || {});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Show a notice after the Google OAuth redirect lands back here, then
  // strip the query params so a refresh doesn't re-show it.
  useEffect(() => {
    const url = new URL(window.location.href);
    const connected = url.searchParams.get("connected");
    const error = url.searchParams.get("error");
    if (connected) {
      setNotice({ ok: true, msg: `${connected === "google" ? "Google" : connected} connected.` });
    } else if (error) {
      setNotice({ ok: false, msg: `Couldn't connect ${error === "google" ? "Google" : error}. Please try again.` });
    }
    if (connected || error) {
      url.searchParams.delete("connected");
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const startEdit = (p: IntegrationProvider) => {
    setEditing(p.key);
    setForm({});
  };

  const connect = async (p: IntegrationProvider) => {
    setBusy(p.key);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/integrations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "connect", provider: p.key, config: form }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed");
      setNotice({ ok: true, msg: `${p.name} connected.` });
      setEditing(null);
      setForm({});
      await load();
    } catch (e: any) {
      setNotice({ ok: false, msg: e?.message || "Failed" });
    } finally {
      setBusy(null);
    }
  };

  const disconnect = async (p: IntegrationProvider) => {
    if (!window.confirm(`Disconnect ${p.name} and remove its stored credentials?`)) return;
    setBusy(p.key);
    try {
      const res = await fetch("/api/admin/integrations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "disconnect", provider: p.key }),
      });
      const data = await res.json();
      if (data.ok) {
        setNotice({ ok: true, msg: `${p.name} disconnected.` });
        await load();
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-start gap-3 rounded-xl border border-navy-700/40 bg-navy-900/35 p-4 text-sm text-slate-400">
        <Info size={16} className="mt-0.5 shrink-0 text-accent-cyan" />
        <p>
          Google connects via one-click OAuth sign-in and unlocks live Calendar scheduling in the
          assistant. Other providers store a pasted credential — values are saved securely and
          never shown again.
        </p>
      </div>

      {notice && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            notice.ok
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
              : "border-rose-400/30 bg-rose-400/10 text-rose-200"
          }`}
        >
          {notice.msg}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 rounded-xl border border-navy-700/40 bg-navy-900/35 p-8 text-sm text-slate-400">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {PROVIDERS.map((p) => {
            const st = status[p.key];
            const connected = Boolean(st?.connected);
            const isEditing = editing === p.key;
            return (
              <div key={p.key} className="rounded-xl border border-navy-700/40 bg-navy-900/40 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{p.name}</span>
                      <span className="rounded-full border border-navy-700/60 bg-navy-800/60 px-2 py-0.5 text-[10px] text-slate-400">
                        {p.category}
                      </span>
                      {connected && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-300">
                          <Check size={10} /> Connected
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{p.desc}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{p.unlocks}</p>
                    {connected && st?.email && (
                      <p className="mt-1 text-[11px] text-emerald-300/80">Signed in as {st.email}</p>
                    )}
                  </div>
                </div>

                {p.note && (
                  <p className="mt-3 rounded-lg border border-navy-700/40 bg-navy-950/40 p-2 text-[11px] text-slate-500">
                    {p.note}
                  </p>
                )}

                {p.authType === "oauth" ? (
                  <div className="mt-4 flex items-center gap-2">
                    <a
                      href={p.connectPath}
                      className="inline-flex items-center gap-1.5 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1.5 text-xs text-accent-cyan"
                    >
                      <ExternalLink size={12} /> {connected ? "Reconnect" : "Connect with Google"}
                    </a>
                    {connected && (
                      <button
                        type="button"
                        onClick={() => disconnect(p)}
                        disabled={busy === p.key}
                        className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 text-xs text-rose-300 disabled:opacity-60"
                      >
                        <Unplug size={12} /> Disconnect
                      </button>
                    )}
                  </div>
                ) : isEditing ? (
                  <div className="mt-4 space-y-2">
                    {p.fields.map((f) => (
                      <label key={f.key} className="grid gap-1 text-xs text-slate-400">
                        {f.label}
                        <input
                          type={f.secret ? "password" : "text"}
                          value={form[f.key] || ""}
                          placeholder={f.placeholder}
                          onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                          className="rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-white outline-none focus:border-accent-cyan"
                        />
                      </label>
                    ))}
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => connect(p)}
                        disabled={busy === p.key}
                        className="btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs disabled:opacity-60"
                      >
                        {busy === p.key ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(null)}
                        className="rounded-full border border-navy-700/70 bg-navy-800/50 px-3 py-1.5 text-xs text-slate-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1.5 text-xs text-accent-cyan"
                    >
                      <Link2 size={12} /> {connected ? "Update credentials" : "Connect"}
                    </button>
                    {connected && (
                      <button
                        type="button"
                        onClick={() => disconnect(p)}
                        disabled={busy === p.key}
                        className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 text-xs text-rose-300 disabled:opacity-60"
                      >
                        <Unplug size={12} /> Disconnect
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

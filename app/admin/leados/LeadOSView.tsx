"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Columns3,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Flame,
  Globe,
  LayoutGrid,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { PIPELINE_STAGES, STAGE_LABELS } from "@/lib/leados/types";
import {
  CHANNEL_LABEL,
  resolveChannel,
  type ChannelKey,
} from "@/lib/leados/channel";

const CHANNEL_ICON: Record<ChannelKey, typeof Mail> = {
  email: Mail,
  call: Phone,
  linkedin: Linkedin,
  contact_form: Globe,
  google_message: MapPin,
  none: Search,
};

// The recommended next-contact channel for a lead, following the outreach
// waterfall, rendered as a one-click action plus the full availability ladder.
export function ChannelPanel({ lead }: { lead: AnyDoc }) {
  const r = resolveChannel(lead as any);
  const Icon = CHANNEL_ICON[r.channel];
  const actionable = r.channel !== "none";
  return (
    <div className="mt-4 rounded-lg border border-navy-700/40 bg-navy-950/40 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="uppercase tracking-wider">Best channel</span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
              actionable
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                : "border-slate-500/30 bg-slate-400/10 text-slate-300"
            }`}
          >
            <Icon size={12} /> {r.label}
          </span>
        </div>
        <a
          href={r.action.href}
          {...(r.action.external ? { target: "_blank", rel: "noreferrer" } : {})}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
            actionable
              ? "bg-accent-cyan/15 text-accent-cyan hover:bg-accent-cyan/25"
              : "border border-navy-700/70 bg-navy-800/50 text-slate-300 hover:text-white"
          }`}
        >
          <Icon size={12} />
          {r.channel === "email"
            ? "Compose"
            : r.channel === "call"
              ? "Call"
              : r.channel === "none"
                ? "Research"
                : "Open"}
        </a>
      </div>
      <p className="mt-2 text-[11px] text-slate-500">{r.reason}</p>
      {/* Availability ladder */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {r.ladder.map((rung) => {
          const RIcon = CHANNEL_ICON[rung.channel];
          const chosen = rung.channel === r.channel;
          return (
            <span
              key={rung.channel}
              title={rung.hint}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${
                chosen
                  ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                  : rung.available
                    ? "border-navy-700/60 bg-navy-800/50 text-slate-300"
                    : "border-navy-800/60 bg-navy-900/40 text-slate-600 line-through"
              }`}
            >
              <RIcon size={10} /> {rung.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

type AnyDoc = Record<string, any>;

const PRIORITY_TONE: Record<string, string> = {
  hot: "text-rose-300 bg-rose-400/10 border-rose-400/25",
  warm: "text-amber-300 bg-amber-400/10 border-amber-400/25",
  cold: "text-cyan-300 bg-cyan-400/10 border-cyan-400/25",
  ignore: "text-slate-400 bg-slate-400/10 border-slate-500/25",
};

export function ScoreBar({ label, value }: { label: string; value: number }) {
  const tone =
    value >= 70 ? "bg-rose-400" : value >= 45 ? "bg-amber-400" : "bg-cyan-400";
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>{label}</span>
        <span className="text-slate-200">{value}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-navy-800">
        <div className={`h-full ${tone}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

type Counts = { total: number; analysed: number; pending: number; hot: number; audited: number; avgScore: number };

export default function LeadOSView() {
  const [leads, setLeads] = useState<AnyDoc[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; msg: string } | null>(null);
  const [selected, setSelected] = useState<AnyDoc | null>(null);
  const [auditLead, setAuditLead] = useState<AnyDoc | null>(null);
  const [outreachLead, setOutreachLead] = useState<AnyDoc | null>(null);

  const [q, setQ] = useState("");
  const [priority, setPriority] = useState("");
  const [stage, setStage] = useState("");
  const [country, setCountry] = useState("");
  const [flags, setFlags] = useState<Record<string, boolean>>({});

  const [view, setView] = useState<"list" | "board">("list");
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchMax, setSearchMax] = useState(20);
  // Optimistic pipeline-stage moves for the kanban, keyed by leadKey.
  const [stageOverrides, setStageOverrides] = useState<Record<string, string>>({});

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (priority) p.set("priority", priority);
    if (stage) p.set("stage", stage);
    if (country) p.set("country", country);
    Object.entries(flags).forEach(([k, v]) => v && p.set(k, "1"));
    // Show every lead in the database (the header still notes the count).
    p.set("limit", "2000");
    return p.toString();
  }, [q, priority, stage, country, flags]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/leados?${query}`);
      const data = await res.json();
      if (data.ok) {
        setLeads(data.leads);
        setTotal(data.total);
        if (data.counts) setCounts(data.counts);
      }
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const act = async (key: string, payload: AnyDoc, success: string) => {
    setBusy(key);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/leados", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed");
      setNotice({
        ok: true,
        msg:
          typeof data.inserted === "number"
            ? `${success} — ${data.inserted} new, ${data.skipped} already present.`
            : typeof data.analyzed === "number"
              ? `Analysed ${data.analyzed}. ${data.remaining} remaining.`
              : success,
      });
      await load();
      return data;
    } catch (e: any) {
      setNotice({ ok: false, msg: e?.message || "Failed" });
      return null;
    } finally {
      setBusy(null);
    }
  };

  // Prefer the whole-database counts from the API (they cover every matching
  // lead, not just the ≤100 currently loaded). Fall back to counting the loaded
  // page only until the first response arrives.
  const stats = useMemo(() => {
    if (counts) {
      return {
        hot: counts.hot,
        analyzed: counts.analysed,
        audited: counts.audited,
        avg: counts.avgScore,
        pending: counts.pending,
      };
    }
    const hot = leads.filter((l) => l.scores?.priority === "hot").length;
    const analyzed = leads.filter((l) => l.lastAnalyzedAt).length;
    const audited = leads.filter((l) => l.audit).length;
    const avg = leads.length
      ? Math.round(leads.reduce((s, l) => s + (l.scores?.overall || 0), 0) / leads.length)
      : 0;
    return { hot, analyzed, audited, avg, pending: Math.max(0, total - analyzed) };
  }, [counts, leads, total]);

  const toggle = (k: string) => setFlags((f) => ({ ...f, [k]: !f[k] }));

  // Generate (or regenerate) an audit, then open the report modal on success.
  const runAudit = async (lead: AnyDoc) => {
    const data = await act(
      `audit-${lead.leadKey}`,
      { action: "generate-audit", leadKey: lead.leadKey },
      "Audit generated"
    );
    if (data?.audit) setAuditLead({ ...lead, audit: data.audit });
  };

  // Generate (or regenerate) the outreach kit, then open the modal.
  const runOutreach = async (lead: AnyDoc) => {
    const data = await act(
      `outreach-${lead.leadKey}`,
      { action: "generate-outreach", leadKey: lead.leadKey },
      "Outreach kit generated"
    );
    if (data?.outreach) setOutreachLead({ ...lead, outreach: data.outreach });
  };

  // Live Google Places search → import into the lead database.
  const runSearch = async () => {
    if (!searchQuery.trim()) {
      setNotice({ ok: false, msg: "Enter at least one search term." });
      return;
    }
    const data = await act(
      "search",
      {
        action: "search-places",
        query: searchQuery,
        location: searchLocation,
        maxResults: searchMax,
      },
      "Search complete"
    );
    if (data?.ok) setShowSearch(false);
  };

  // Move a lead to a new pipeline stage (optimistic for the kanban).
  const moveStage = async (leadKey: string, next: string) => {
    setStageOverrides((o) => ({ ...o, [leadKey]: next }));
    try {
      const res = await fetch("/api/admin/leados", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "set-stage", leadKey, stage: next }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Could not move lead");
      // Reflect it in the loaded list so counts/filters stay consistent.
      setLeads((prev) =>
        prev.map((l) => (l.leadKey === leadKey ? { ...l, stage: next } : l))
      );
    } catch (e: any) {
      setStageOverrides((o) => {
        const n = { ...o };
        delete n[leadKey];
        return n;
      });
      setNotice({ ok: false, msg: e?.message || "Could not move lead" });
    }
  };

  const stageOf = (l: AnyDoc): string => stageOverrides[l.leadKey] || l.stage || "new";

  return (
    <div className="mt-8 space-y-6">
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

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { icon: Target, label: "Total leads", value: total, hint: `${leads.length} shown` },
          { icon: Flame, label: "Hot leads", value: stats.hot, hint: "priority = hot" },
          { icon: TrendingUp, label: "Avg score", value: stats.avg, hint: "weighted 0–100" },
          { icon: Check, label: "Analysed", value: stats.analyzed, hint: `${stats.pending} pending` },
          { icon: FileText, label: "Audited", value: stats.audited, hint: "AI reports ready" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border border-navy-700/40 bg-navy-900/40 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-slate-500">{s.label}</span>
                <Icon size={16} className="text-accent-cyan" />
              </div>
              <div className="mt-3 font-display text-2xl font-bold text-white">{s.value}</div>
              <div className="mt-1 text-xs text-slate-500">{s.hint}</div>
            </div>
          );
        })}
      </div>

      {/* Pipeline actions */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-navy-700/40 bg-navy-900/35 p-4">
        <button
          type="button"
          onClick={() => setShowSearch((v) => !v)}
          className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
        >
          <Search size={15} /> {showSearch ? "Close search" : "Search Google"}
        </button>
        <button
          type="button"
          onClick={() => act("import", { action: "import-from-scraper", limit: 500 }, "Imported from scraper")}
          disabled={busy === "import"}
          className="inline-flex items-center gap-2 rounded-full border border-navy-700/70 bg-navy-800/50 px-4 py-2 text-sm text-slate-200 disabled:opacity-60"
        >
          {busy === "import" ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          Import from scraper
        </button>
        <button
          type="button"
          onClick={() => act("batch", { action: "analyze-batch", size: 10 }, "Batch analysed")}
          disabled={busy === "batch"}
          className="inline-flex items-center gap-2 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-4 py-2 text-sm text-accent-cyan disabled:opacity-60"
        >
          {busy === "batch" ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
          Analyse next 10
        </button>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 rounded-full border border-navy-700/70 bg-navy-800/50 px-4 py-2 text-sm text-slate-200"
        >
          <RefreshCw size={15} /> Refresh
        </button>
        <span className="text-xs text-slate-500">
          Analysis fetches each site and scores 30+ signals — no external API cost.
        </span>
      </div>

      {/* Live Google Places search */}
      {showSearch && (
        <div className="rounded-xl border border-navy-700/40 bg-navy-900/35 p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <Search size={16} className="text-accent-cyan" /> Search Google Places
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm text-slate-300 md:col-span-2">
              Search terms (one per line)
              <textarea
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                rows={3}
                placeholder={"law firms\ndental clinics\nconstruction companies"}
                className="resize-y rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-accent-cyan"
              />
            </label>
            <label className="grid gap-1 text-sm text-slate-300">
              Location
              <input
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="Manchester, United Kingdom"
                className="rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-white outline-none focus:border-accent-cyan"
              />
            </label>
            <label className="grid gap-1 text-sm text-slate-300">
              Max results per term
              <input
                type="number"
                min={1}
                max={100}
                value={searchMax}
                onChange={(e) => setSearchMax(Number(e.target.value))}
                className="rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-white outline-none focus:border-accent-cyan"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={runSearch}
            disabled={busy === "search"}
            className="btn-primary mt-4 inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === "search" ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Search &amp; import
          </button>
          <p className="mt-3 text-xs text-slate-500">
            Runs the Apify Google Places actor (needs <code className="text-slate-400">APIFY_TOKEN</code>)
            and imports results straight into your lead database.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-xl border border-navy-700/40 bg-navy-900/35 p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search business name"
              className="w-full rounded-lg border border-navy-700/70 bg-navy-950/50 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-accent-cyan"
            />
          </label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-white">
            <option value="">All priorities</option>
            {["hot", "warm", "cold", "ignore"].map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={stage} onChange={(e) => setStage(e.target.value)} className="rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-white">
            <option value="">All stages</option>
            {PIPELINE_STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
          </select>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-white">
            <option value="">All countries</option>
            {["United States", "Canada", "United Kingdom", "Australia", "New Zealand", "Singapore", "United Arab Emirates", "India"].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            ["noWebsite", "No website"],
            ["noSsl", "No SSL"],
            ["noContactForm", "No contact form"],
            ["noChat", "No chat"],
            ["unanalyzed", "Not analysed"],
          ].map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => toggle(k)}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                flags[k]
                  ? "border-accent-cyan/40 bg-accent-cyan/15 text-white"
                  : "border-navy-700/60 bg-navy-900/60 text-slate-300 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* View toggle */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {leads.length} of {total} lead{total === 1 ? "" : "s"}
        </span>
        <div className="inline-flex rounded-lg border border-navy-700/70 bg-navy-950/60 p-0.5">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition ${
              view === "list" ? "bg-accent-cyan/15 text-accent-cyan" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LayoutGrid size={15} /> List
          </button>
          <button
            type="button"
            onClick={() => setView("board")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition ${
              view === "board" ? "bg-accent-cyan/15 text-accent-cyan" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Columns3 size={15} /> Board
          </button>
        </div>
      </div>

      {/* Lead list */}
      {loading ? (
        <div className="flex items-center gap-2 rounded-xl border border-navy-700/40 bg-navy-900/35 p-8 text-sm text-slate-400">
          <Loader2 size={16} className="animate-spin" /> Loading leads…
        </div>
      ) : leads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-navy-700/60 bg-navy-950/25 p-10 text-center text-sm text-slate-500">
          No leads match. Import from the scraper to get started.
        </div>
      ) : view === "board" ? (
        <LeadKanban leads={leads} stageOf={stageOf} onMove={moveStage} />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {leads.map((l) => {
            const s = l.scores;
            const a = l.analysis;
            return (
              <div key={l.leadKey} className="rounded-xl border border-navy-700/40 bg-navy-900/40 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/leados/${encodeURIComponent(l.leadKey)}`}
                      className="flex items-center gap-1.5 truncate font-display text-lg font-bold text-white hover:text-accent-cyan"
                    >
                      <span className="truncate">{l.businessName}</span>
                      <ExternalLink size={13} className="shrink-0 text-slate-500" />
                    </Link>
                    <div className="mt-1 truncate text-xs text-slate-400">
                      {[l.businessCategory, l.city, l.country].filter(Boolean).join(" · ") || "—"}
                    </div>
                    {l.website ? (
                      <a href={l.website} target="_blank" rel="noreferrer" className="mt-1 block truncate text-xs text-accent-glow hover:text-white">
                        {l.domain || l.website}
                      </a>
                    ) : (
                      <span className="mt-1 inline-block rounded-full border border-rose-400/25 bg-rose-400/10 px-2 py-0.5 text-[10px] text-rose-300">
                        No website
                      </span>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${PRIORITY_TONE[s?.priority] || PRIORITY_TONE.ignore}`}>
                      {s?.priority || "unscored"}
                    </span>
                    <div className="mt-2 font-display text-2xl font-bold text-white">{s?.overall ?? "—"}</div>
                  </div>
                </div>

                {s && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <ScoreBar label="Lead quality" value={s.quality} />
                    <ScoreBar label="Software opp." value={s.software} />
                    <ScoreBar label="AI opp." value={s.ai} />
                    <ScoreBar label="Website opp." value={s.website} />
                  </div>
                )}

                {a?.issues?.length > 0 && (
                  <div className="mt-4 space-y-1">
                    {a.issues.slice(0, 3).map((i: string) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                        <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-400" />
                        {i}
                      </div>
                    ))}
                  </div>
                )}

                {l.opportunities?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {l.opportunities.slice(0, 4).map((o: AnyDoc) => (
                      <span key={o.service} className="rounded-full border border-navy-700/60 bg-navy-800/50 px-2.5 py-1 text-[11px] text-slate-200">
                        {o.service} · {o.confidence}%
                      </span>
                    ))}
                  </div>
                )}

                <ChannelPanel lead={l} />

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => act(`a-${l.leadKey}`, { action: "analyze", leadKey: l.leadKey }, "Lead analysed")}
                    disabled={busy === `a-${l.leadKey}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1.5 text-xs text-accent-cyan disabled:opacity-60"
                  >
                    {busy === `a-${l.leadKey}` ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    {l.lastAnalyzedAt ? "Re-analyse" : "Analyse"}
                  </button>
                  <button
                    type="button"
                    onClick={() => (l.audit ? setAuditLead(l) : runAudit(l))}
                    disabled={busy === `audit-${l.leadKey}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1.5 text-xs text-violet-200 disabled:opacity-60"
                  >
                    {busy === `audit-${l.leadKey}` ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
                    {l.audit ? "View audit" : "Generate audit"}
                  </button>
                  <button
                    type="button"
                    onClick={() => (l.outreach ? setOutreachLead(l) : runOutreach(l))}
                    disabled={busy === `outreach-${l.leadKey}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-200 disabled:opacity-60"
                  >
                    {busy === `outreach-${l.leadKey}` ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                    {l.outreach ? "Outreach" : "Generate outreach"}
                  </button>
                  <select
                    value={l.stage}
                    onChange={(e) => act(`s-${l.leadKey}`, { action: "set-stage", leadKey: l.leadKey, stage: e.target.value }, "Stage updated")}
                    className="rounded-lg border border-navy-700/70 bg-navy-950/70 px-2.5 py-1.5 text-xs text-white"
                  >
                    {PIPELINE_STAGES.map((st) => (
                      <option key={st} value={st}>{STAGE_LABELS[st]}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setSelected(selected?.leadKey === l.leadKey ? null : l)}
                    className="rounded-full border border-navy-700/70 bg-navy-800/50 px-3 py-1.5 text-xs text-slate-200"
                  >
                    {selected?.leadKey === l.leadKey ? "Hide" : "Details"}
                  </button>
                </div>

                {selected?.leadKey === l.leadKey && (
                  <div className="mt-4 space-y-3 rounded-lg border border-navy-700/40 bg-navy-950/40 p-4 text-xs text-slate-300">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div><span className="text-slate-500">Email:</span> {l.email || "—"}</div>
                      <div><span className="text-slate-500">Phone:</span> {l.phone || "—"}</div>
                      <div><span className="text-slate-500">Rating:</span> {l.googleRating ?? "—"} ({l.googleReviews} reviews)</div>
                      <div><span className="text-slate-500">CMS:</span> {a?.cms || "—"} {a?.framework ? `· ${a.framework}` : ""}</div>
                    </div>
                    {l.intel && (
                      <div>
                        <div className="mb-1 text-slate-500">Business intelligence</div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div><span className="text-slate-500">Employees:</span> {l.intel.estimatedEmployees}</div>
                          <div><span className="text-slate-500">Revenue band:</span> {l.intel.estimatedRevenueBand}</div>
                          <div><span className="text-slate-500">Growth stage:</span> {l.intel.growthStage}</div>
                          <div><span className="text-slate-500">Multi-location:</span> {l.intel.multipleLocations ? "Yes" : "No"}</div>
                          <div><span className="text-slate-500">Digital maturity:</span> {l.intel.digitalMaturity}</div>
                          <div><span className="text-slate-500">Complexity:</span> {l.intel.businessComplexity}</div>
                        </div>
                        {l.intel.likelyDecisionMakers?.length > 0 && (
                          <div className="mt-1">
                            <span className="text-slate-500">Decision makers:</span> {l.intel.likelyDecisionMakers.join(", ")}
                          </div>
                        )}
                      </div>
                    )}
                    {s?.signals?.length > 0 && (
                      <div>
                        <div className="mb-1 text-slate-500">Scoring signals</div>
                        <ul className="space-y-0.5">
                          {s.signals.map((sig: string) => <li key={sig}>· {sig}</li>)}
                        </ul>
                      </div>
                    )}
                    {l.timeline?.length > 0 && (
                      <div>
                        <div className="mb-1 text-slate-500">Timeline</div>
                        <ul className="space-y-0.5">
                          {l.timeline.slice(-5).reverse().map((t: AnyDoc, i: number) => (
                            <li key={i}>· {t.summary}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {auditLead?.audit && (
        <AuditModal lead={auditLead} onClose={() => setAuditLead(null)} />
      )}

      {outreachLead?.outreach && (
        <OutreachModal
          lead={outreachLead}
          onClose={() => setOutreachLead(null)}
          onRegenerate={() => runOutreach(outreachLead)}
          regenerating={busy === `outreach-${outreachLead.leadKey}`}
        />
      )}
    </div>
  );
}

function auditToHtml(lead: AnyDoc): string {
  const a = lead.audit;
  const esc = (s: unknown) =>
    String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] as string);
  const sections = (a.sections || [])
    .map(
      (s: AnyDoc) => `
      <section>
        <h2>${esc(s.title)}</h2>
        <p>${esc(s.summary)}</p>
        ${
          s.points?.length
            ? `<ul>${s.points.map((p: string) => `<li>${esc(p)}</li>`).join("")}</ul>`
            : ""
        }
      </section>`
    )
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Business Audit — ${esc(lead.businessName)}</title>
  <style>
    body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:760px;margin:0 auto;padding:40px 24px;color:#0f172a;line-height:1.6}
    header{border-bottom:3px solid #06b6d4;padding-bottom:16px;margin-bottom:24px}
    h1{font-size:26px;margin:0 0 6px} .headline{color:#0891b2;font-weight:600;margin:0}
    .meta{color:#64748b;font-size:13px;margin-top:8px}
    h2{font-size:17px;margin:28px 0 6px;color:#0f172a}
    section{border-top:1px solid #e2e8f0;padding-top:12px}
    ul{margin:8px 0 0;padding-left:20px} li{margin:2px 0}
    .box{background:#f0fdff;border:1px solid #a5f3fc;border-radius:10px;padding:16px;margin-top:24px}
    .cta{background:#0891b2;color:#fff;border-radius:10px;padding:16px;margin-top:16px}
    .cta a,.cta{color:#fff}
    footer{margin-top:32px;color:#94a3b8;font-size:12px;text-align:center}
  </style></head><body>
  <header>
    <h1>${esc(lead.businessName)}</h1>
    <p class="headline">${esc(a.headline)}</p>
    <p class="meta">Website score ${esc(a.websiteScore)}/100 · Priority ${esc(a.priority)} · Prepared by Biztreck</p>
  </header>
  <section style="border-top:none"><h2>Executive Summary</h2><p>${esc(a.executiveSummary)}</p></section>
  ${sections}
  <div class="box"><h2 style="margin-top:0">Estimated ROI</h2><p>${esc(a.estimatedRoi)}</p></div>
  <section><h2>Recommended Next Steps</h2><ol>${(a.nextSteps || []).map((n: string) => `<li>${esc(n)}</li>`).join("")}</ol></section>
  <div class="cta"><strong>${esc(a.callToAction)}</strong></div>
  <footer>Generated by Biztreck LeadOS · ${new Date(a.generatedAt).toLocaleDateString()}</footer>
  </body></html>`;
}

export function AuditModal({ lead, onClose }: { lead: AnyDoc; onClose: () => void }) {
  const a = lead.audit;
  const pdfHref = `/api/admin/leados/${encodeURIComponent(lead.leadKey)}/audit-pdf`;
  const [shareToken, setShareToken] = useState<string>(lead.shareToken || "");
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareUrl = shareToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/audit/${shareToken}`
    : "";

  const createShare = async () => {
    setSharing(true);
    try {
      const res = await fetch("/api/admin/leados", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "share-audit", leadKey: lead.leadKey }),
      });
      const data = await res.json();
      if (data.ok && data.token) setShareToken(data.token);
    } finally {
      setSharing(false);
    }
  };
  const revokeShare = async () => {
    setSharing(true);
    try {
      await fetch("/api/admin/leados", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "unshare-audit", leadKey: lead.leadKey }),
      });
      setShareToken("");
    } finally {
      setSharing(false);
    }
  };
  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  };

  const download = () => {
    const blob = new Blob([auditToHtml(lead)], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url;
    el.download = `audit-${String(lead.businessName || "lead").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50)}.html`;
    document.body.appendChild(el);
    el.click();
    el.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="my-8 w-full max-w-3xl overflow-hidden rounded-2xl border border-navy-700/60 bg-navy-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-navy-700/50 p-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-violet-300">
              <FileText size={14} /> AI Business Audit
              <span className="rounded-full border border-navy-700/60 bg-navy-800/60 px-2 py-0.5 text-[10px] text-slate-400">
                {a.source && a.source !== "rules" ? "AI-written" : "rules-based"}
              </span>
            </div>
            <h2 className="mt-1 truncate font-display text-xl font-bold text-white">{lead.businessName}</h2>
            <p className="mt-1 text-sm text-accent-glow">{a.headline}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={pdfHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-navy-700/70 bg-navy-800/50 px-3 py-1.5 text-xs text-slate-200 hover:border-accent-cyan"
              title="Download the audit as a PDF"
            >
              <FileText size={13} /> PDF
            </a>
            <button
              type="button"
              onClick={download}
              className="inline-flex items-center gap-1.5 rounded-full border border-navy-700/70 bg-navy-800/50 px-3 py-1.5 text-xs text-slate-200 hover:border-accent-cyan"
              title="Download a self-contained HTML report"
            >
              <Download size={13} /> HTML
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-navy-700/60 bg-navy-900/60 p-2 text-slate-200 hover:border-rose-400/50 hover:text-rose-300"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6 text-sm">
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="rounded-full border border-navy-700/60 bg-navy-900/60 px-3 py-1 text-slate-300">
              Website score <span className="text-white">{a.websiteScore}/100</span>
            </span>
            <span className="rounded-full border border-navy-700/60 bg-navy-900/60 px-3 py-1 text-slate-300 capitalize">
              Priority <span className="text-white">{a.priority}</span>
            </span>
          </div>

          {/* Public share link */}
          <div className="rounded-xl border border-navy-700/40 bg-navy-900/40 p-4">
            {shareToken ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                  <Globe size={13} /> Public link is live
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    readOnly
                    value={shareUrl}
                    onFocus={(e) => e.currentTarget.select()}
                    className="min-w-0 flex-1 rounded-lg border border-navy-700/70 bg-navy-950/60 px-3 py-2 text-xs text-slate-200 outline-none"
                  />
                  <button
                    type="button"
                    onClick={copyShare}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-accent-cyan/40 bg-accent-cyan/10 px-3 py-2 text-xs text-accent-cyan"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "Copied" : "Copy"}
                  </button>
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-navy-700/70 bg-navy-800/50 px-3 py-2 text-xs text-slate-200 hover:border-accent-cyan"
                  >
                    <ExternalLink size={12} /> Open
                  </a>
                  <button
                    type="button"
                    onClick={revokeShare}
                    disabled={sharing}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-300 disabled:opacity-60"
                  >
                    {sharing ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />} Revoke
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Anyone with this link can view the audit (no login). Revoke to disable it.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-slate-400">
                  Create an unlisted public link to send this audit to the prospect.
                </p>
                <button
                  type="button"
                  onClick={createShare}
                  disabled={sharing}
                  className="inline-flex items-center gap-1.5 rounded-full border border-accent-cyan/40 bg-accent-cyan/10 px-3 py-1.5 text-xs text-accent-cyan disabled:opacity-60"
                >
                  {sharing ? <Loader2 size={12} className="animate-spin" /> : <Globe size={12} />}
                  Create public link
                </button>
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-1 font-semibold text-white">Executive Summary</h3>
            <p className="text-slate-300">{a.executiveSummary}</p>
          </div>

          {(a.sections || []).map((s: AnyDoc) => (
            <div key={s.title} className="border-t border-navy-700/40 pt-4">
              <h3 className="mb-1 font-semibold text-white">{s.title}</h3>
              {s.summary && <p className="text-slate-300">{s.summary}</p>}
              {s.points?.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {s.points.map((p: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-slate-400">
                      <Check size={13} className="mt-0.5 shrink-0 text-accent-cyan" />
                      {p}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <div className="rounded-xl border border-accent-cyan/25 bg-accent-cyan/5 p-4">
            <h3 className="mb-1 font-semibold text-white">Estimated ROI</h3>
            <p className="text-slate-300">{a.estimatedRoi}</p>
          </div>

          {a.nextSteps?.length > 0 && (
            <div>
              <h3 className="mb-1 font-semibold text-white">Recommended Next Steps</h3>
              <ol className="ml-4 list-decimal space-y-1 text-slate-300">
                {a.nextSteps.map((n: string, i: number) => (
                  <li key={i}>{n}</li>
                ))}
              </ol>
            </div>
          )}

          <div className="rounded-xl border border-violet-400/30 bg-violet-400/10 p-4 font-medium text-violet-100">
            {a.callToAction}
          </div>
        </div>
      </div>
    </div>
  );
}

const STAGE_TONE: Record<string, string> = {
  new: "bg-slate-400",
  qualified: "bg-cyan-400",
  audit_generated: "bg-violet-400",
  email_sent: "bg-blue-400",
  replied: "bg-teal-400",
  meeting_scheduled: "bg-indigo-400",
  proposal: "bg-amber-400",
  won: "bg-emerald-400",
  lost: "bg-rose-400",
  follow_up: "bg-fuchsia-400",
};

// Module 9 — drag leads across the 10 pipeline stages.
function LeadKanban({
  leads,
  stageOf,
  onMove,
}: {
  leads: AnyDoc[];
  stageOf: (l: AnyDoc) => string;
  onMove: (leadKey: string, stage: string) => void;
}) {
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);

  const byStage = useMemo(() => {
    const m: Record<string, AnyDoc[]> = {};
    for (const s of PIPELINE_STAGES) m[s] = [];
    for (const l of leads) (m[stageOf(l)] ||= []).push(l);
    return m;
  }, [leads, stageOf]);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {PIPELINE_STAGES.map((s) => {
        const items = byStage[s] || [];
        const over = overStage === s;
        return (
          <div
            key={s}
            onDragOver={(e) => {
              e.preventDefault();
              if (overStage !== s) setOverStage(s);
            }}
            onDragLeave={() => setOverStage((v) => (v === s ? null : v))}
            onDrop={(e) => {
              e.preventDefault();
              const k = e.dataTransfer.getData("text/plain") || dragKey;
              if (k) onMove(k, s);
              setDragKey(null);
              setOverStage(null);
            }}
            className={`flex w-72 shrink-0 flex-col rounded-xl border bg-navy-900/35 transition ${
              over ? "border-accent-cyan/50 bg-navy-900/70" : "border-navy-700/40"
            }`}
          >
            <div className="flex items-center justify-between border-b border-navy-700/40 px-3 py-2.5">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                <span className={`h-2.5 w-2.5 rounded-full ${STAGE_TONE[s] || "bg-slate-400"}`} />
                {STAGE_LABELS[s]}
              </span>
              <span className="rounded-full bg-navy-800/70 px-2 py-0.5 text-[11px] text-slate-400">
                {items.length}
              </span>
            </div>
            <div className="flex min-h-[120px] flex-1 flex-col gap-2 p-2">
              {items.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-navy-700/50 py-6 text-center text-xs text-slate-600">
                  Drop here
                </div>
              ) : (
                items.map((l) => (
                  <div
                    key={l.leadKey}
                    draggable
                    onDragStart={(e) => {
                      setDragKey(l.leadKey);
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", l.leadKey);
                    }}
                    onDragEnd={() => {
                      setDragKey(null);
                      setOverStage(null);
                    }}
                    className={`cursor-grab rounded-lg border border-navy-700/50 bg-navy-950/50 p-3 transition active:cursor-grabbing ${
                      dragKey === l.leadKey ? "opacity-40" : "hover:border-accent-cyan/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/admin/leados/${encodeURIComponent(l.leadKey)}`}
                        className="line-clamp-2 text-sm font-semibold text-white hover:text-accent-cyan"
                      >
                        {l.businessName}
                      </Link>
                      <span className="shrink-0 font-display text-sm font-bold text-white">
                        {l.scores?.overall ?? "—"}
                      </span>
                    </div>
                    <div className="mt-1 truncate text-[11px] text-slate-500">
                      {[l.businessCategory, l.city].filter(Boolean).join(" · ")}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${
                          PRIORITY_TONE[l.scores?.priority] || PRIORITY_TONE.ignore
                        }`}
                      >
                        {l.scores?.priority || "unscored"}
                      </span>
                      {l.audit && <FileText size={11} className="text-violet-300" />}
                      {l.outreach && <Send size={11} className="text-emerald-300" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard blocked — ignore */
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-full border border-navy-700/70 bg-navy-800/50 px-3 py-1.5 text-xs text-slate-200 hover:border-accent-cyan"
    >
      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
      {copied ? "Copied" : label}
    </button>
  );
}

function EmailEditor({
  title,
  value,
  onChange,
  onSend,
  sending,
  sent,
}: {
  title: string;
  value: AnyDoc;
  onChange: (v: AnyDoc) => void;
  onSend: () => void;
  sending: boolean;
  sent: boolean;
}) {
  return (
    <div className="rounded-xl border border-navy-700/40 bg-navy-900/40 p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Mail size={14} className="text-accent-cyan" /> {title}
        </div>
        <div className="flex items-center gap-2">
          <CopyButton text={`${value.subject}\n\n${value.body}`} />
          <button
            type="button"
            onClick={onSend}
            disabled={sending || sent}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-200 hover:border-emerald-400/70 disabled:opacity-50"
          >
            {sending ? <Loader2 size={12} className="animate-spin" /> : sent ? <Check size={12} /> : <Send size={12} />}
            {sent ? "Sent" : "Send"}
          </button>
        </div>
      </div>
      <input
        value={value.subject}
        onChange={(e) => onChange({ ...value, subject: e.target.value })}
        placeholder="Subject"
        className="mb-2 w-full rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-white outline-none focus:border-accent-cyan"
      />
      <textarea
        value={value.body}
        onChange={(e) => onChange({ ...value, body: e.target.value })}
        rows={7}
        className="w-full resize-y rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-white outline-none focus:border-accent-cyan"
      />
    </div>
  );
}

function TextBlock({
  icon: Icon,
  title,
  value,
  onChange,
  extra,
}: {
  icon: typeof Mail;
  title: string;
  value: string;
  onChange: (v: string) => void;
  extra?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-navy-700/40 bg-navy-900/40 p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Icon size={14} className="text-accent-cyan" /> {title}
        </div>
        <div className="flex items-center gap-2">
          {extra}
          <CopyButton text={value} />
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full resize-y rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-white outline-none focus:border-accent-cyan"
      />
    </div>
  );
}

export function OutreachModal({
  lead,
  onClose,
  onRegenerate,
  regenerating,
}: {
  lead: AnyDoc;
  onClose: () => void;
  onRegenerate: () => void;
  regenerating: boolean;
}) {
  const o = lead.outreach;
  const [to, setTo] = useState<string>(lead.email || "");
  const [kit, setKit] = useState<AnyDoc>(() => ({
    coldEmail: { ...o.coldEmail },
    followUp1: { ...o.followUp1 },
    followUp2: { ...o.followUp2 },
    linkedin: o.linkedin,
    discoveryOpener: o.discoveryOpener,
    proposalSummary: o.proposalSummary,
  }));
  const [sending, setSending] = useState<string | null>(null);
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [err, setErr] = useState<string | null>(null);

  // Re-sync editable copy whenever a fresh kit is generated.
  useEffect(() => {
    setKit({
      coldEmail: { ...o.coldEmail },
      followUp1: { ...o.followUp1 },
      followUp2: { ...o.followUp2 },
      linkedin: o.linkedin,
      discoveryOpener: o.discoveryOpener,
      proposalSummary: o.proposalSummary,
    });
    setSent({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [o.generatedAt]);

  const send = async (variant: string, email: AnyDoc) => {
    setErr(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim())) {
      setErr("Enter a valid recipient email to send.");
      return;
    }
    setSending(variant);
    try {
      const res = await fetch("/api/admin/leados", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "send-email",
          leadKey: lead.leadKey,
          to: to.trim(),
          subject: email.subject,
          body: email.body,
          variant,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Send failed");
      setSent((s) => ({ ...s, [variant]: true }));
    } catch (e: any) {
      setErr(e?.message || "Send failed");
    } finally {
      setSending(null);
    }
  };

  const linkedinUrl = lead.socials?.linkedin;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="my-8 w-full max-w-3xl overflow-hidden rounded-2xl border border-navy-700/60 bg-navy-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-navy-700/50 p-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-emerald-300">
              <Send size={14} /> AI Outreach kit
              <span className="rounded-full border border-navy-700/60 bg-navy-800/60 px-2 py-0.5 text-[10px] text-slate-400">
                {o.source && o.source !== "rules" ? "AI-written" : "rules-based"}
              </span>
            </div>
            <h2 className="mt-1 truncate font-display text-xl font-bold text-white">{lead.businessName}</h2>
            <p className="mt-1 text-xs text-slate-500">
              Every message references this lead&apos;s audit findings.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onRegenerate}
              disabled={regenerating}
              className="inline-flex items-center gap-1.5 rounded-full border border-navy-700/70 bg-navy-800/50 px-3 py-1.5 text-xs text-slate-200 hover:border-accent-cyan disabled:opacity-60"
            >
              {regenerating ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              Regenerate
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-navy-700/60 bg-navy-900/60 p-2 text-slate-200 hover:border-rose-400/50 hover:text-rose-300"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="max-h-[72vh] space-y-4 overflow-y-auto p-5">
          {/* Recipient */}
          <div className="rounded-xl border border-navy-700/40 bg-navy-900/40 p-4">
            <label className="grid gap-1 text-xs text-slate-400">
              Recipient email {lead.email ? "" : "(none on file — add one to send)"}
              <input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="owner@theirdomain.com"
                className="rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-white outline-none focus:border-accent-cyan"
              />
            </label>
            <p className="mt-2 text-[11px] text-slate-500">
              Sends via Resend; replies route to your admin inbox. Sending advances the lead to
              &ldquo;Email sent&rdquo; and logs it to the timeline.
            </p>
          </div>

          {err && (
            <div className="rounded-lg border border-rose-400/30 bg-rose-400/10 p-3 text-xs text-rose-200">
              {err}
            </div>
          )}

          <EmailEditor
            title="Cold email"
            value={kit.coldEmail}
            onChange={(v) => setKit((k: AnyDoc) => ({ ...k, coldEmail: v }))}
            onSend={() => send("cold", kit.coldEmail)}
            sending={sending === "cold"}
            sent={Boolean(sent.cold)}
          />
          <EmailEditor
            title="Follow-up 1"
            value={kit.followUp1}
            onChange={(v) => setKit((k: AnyDoc) => ({ ...k, followUp1: v }))}
            onSend={() => send("followup1", kit.followUp1)}
            sending={sending === "followup1"}
            sent={Boolean(sent.followup1)}
          />
          <EmailEditor
            title="Follow-up 2"
            value={kit.followUp2}
            onChange={(v) => setKit((k: AnyDoc) => ({ ...k, followUp2: v }))}
            onSend={() => send("followup2", kit.followUp2)}
            sending={sending === "followup2"}
            sent={Boolean(sent.followup2)}
          />

          <TextBlock
            icon={Linkedin}
            title="LinkedIn message"
            value={kit.linkedin}
            onChange={(v) => setKit((k: AnyDoc) => ({ ...k, linkedin: v }))}
            extra={
              linkedinUrl ? (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-navy-700/70 bg-navy-800/50 px-3 py-1.5 text-xs text-slate-200 hover:border-accent-cyan"
                >
                  <Linkedin size={12} /> Open
                </a>
              ) : undefined
            }
          />
          <TextBlock
            icon={MessageCircle}
            title="Discovery call opener"
            value={kit.discoveryOpener}
            onChange={(v) => setKit((k: AnyDoc) => ({ ...k, discoveryOpener: v }))}
          />
          <TextBlock
            icon={FileText}
            title="Proposal summary"
            value={kit.proposalSummary}
            onChange={(v) => setKit((k: AnyDoc) => ({ ...k, proposalSummary: v }))}
          />
        </div>
      </div>
    </div>
  );
}

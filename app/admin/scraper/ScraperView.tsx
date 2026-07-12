"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckSquare,
  ChevronDown,
  Clock,
  Columns3,
  Download,
  ExternalLink,
  FileDown,
  Globe,
  LayoutGrid,
  Loader2,
  Mail,
  MapPin,
  Phone,
  PlusCircle,
  Search,
  Sparkles,
  Square,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import OutreachPanel from "./OutreachPanel";

type AnyDoc = Record<string, any>;

type Notice = { ok: boolean; message: string } | null;

type LeadStatus = "new" | "sent" | "failed";

// Segregate leads by whether we've already reached out. `outreachStatus` is set
// by the outreach API when an email is sent ("sent") or fails ("failed");
// anything without it is a fresh, un-contacted lead.
function leadStatus(p: AnyDoc): LeadStatus {
  if (p.outreachStatus === "sent") return "sent";
  if (p.outreachStatus === "failed") return "failed";
  return "new";
}

const STATUS_TABS: { key: "all" | LeadStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "Not contacted" },
  { key: "sent", label: "Outreached" },
  { key: "failed", label: "Failed" },
];

// Kanban pipeline stages. `stage` is persisted per lead; leads without one fall
// back to a stage derived from their outreach status (see leadStage).
const STAGE_ORDER = ["new", "contacted", "replied", "negotiation", "won", "lost"] as const;
type Stage = (typeof STAGE_ORDER)[number];

const STAGE_META: Record<
  Stage,
  { label: string; dot: string; chip: string; column: string }
> = {
  new: { label: "New", dot: "bg-slate-400", chip: "border-slate-500/40 text-slate-300", column: "border-slate-500/40" },
  contacted: { label: "Contacted", dot: "bg-accent-cyan", chip: "border-accent-cyan/40 text-accent-cyan", column: "border-accent-cyan/50" },
  replied: { label: "Replied", dot: "bg-violet-400", chip: "border-violet-400/40 text-violet-300", column: "border-violet-400/50" },
  negotiation: { label: "Negotiation", dot: "bg-amber-400", chip: "border-amber-400/40 text-amber-300", column: "border-amber-400/50" },
  won: { label: "Won", dot: "bg-emerald-400", chip: "border-emerald-400/40 text-emerald-300", column: "border-emerald-400/50" },
  lost: { label: "Lost", dot: "bg-rose-400", chip: "border-rose-400/40 text-rose-300", column: "border-rose-400/50" },
};

// Resolve a lead's pipeline stage: explicit `stage` wins, otherwise derive a
// sensible starting point from whether outreach has already gone out.
function leadStage(p: AnyDoc): Stage {
  const s = String(p.stage || "");
  if ((STAGE_ORDER as readonly string[]).includes(s)) return s as Stage;
  return p.outreachStatus === "sent" ? "contacted" : "new";
}

function csvEscape(value: unknown): string {
  const s = value == null ? "" : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Columns exported for each lead. Kept flat and spreadsheet-friendly so the file
// opens cleanly in Excel / Google Sheets.
const CSV_COLUMNS: [string, (p: AnyDoc) => unknown][] = [
  ["Business", (p) => p.title],
  ["Category", (p) => p.categoryName],
  ["Address", (p) => p.address],
  ["City", (p) => p.city],
  ["Postal code", (p) => p.postalCode],
  ["State", (p) => p.state],
  ["Country", (p) => p.countryCode],
  ["Phone", (p) => p.phoneUnformatted || p.phone],
  ["Website", (p) => p.website],
  ["Email", (p) => p.email || p.outreach?.to || ""],
  ["Rating", (p) => (p.totalScore == null ? "" : p.totalScore)],
  ["Reviews", (p) => p.reviewsCount || 0],
  ["Stage", (p) => STAGE_META[leadStage(p)].label],
  ["Outreach status", (p) => leadStatus(p)],
  ["Outreach subject", (p) => p.outreach?.subject || ""],
  ["Sent at", (p) => (p.outreach?.sentAt ? new Date(p.outreach.sentAt).toISOString() : "")],
  ["Google Maps", (p) => p.url],
  ["Search term", (p) => p.searchString],
];

function leadsToCsv(rows: AnyDoc[]): string {
  const header = CSV_COLUMNS.map(([label]) => csvEscape(label)).join(",");
  const body = rows.map((p) => CSV_COLUMNS.map(([, get]) => csvEscape(get(p))).join(","));
  // Prepend a UTF-8 BOM so Excel renders accented business names correctly.
  return "﻿" + [header, ...body].join("\r\n");
}

// A readable one-business brief the admin can hand to a developer as the
// "requirement" for building or revamping that lead's site.
function leadBrief(p: AnyDoc): string {
  const lines: string[] = [];
  const add = (label: string, value: unknown) => {
    const s = value == null ? "" : String(value).trim();
    if (s) lines.push(`${label}: ${s}`);
  };
  lines.push(`BUSINESS REQUIREMENT — ${p.title || "Untitled"}`);
  lines.push("=".repeat(50));
  add("Category", p.categoryName);
  if (Array.isArray(p.categories) && p.categories.length) add("Tags", p.categories.join(", "));
  add("Address", p.address);
  add("Phone", p.phoneUnformatted || p.phone);
  add("Website", p.website || "(none — greenfield build)");
  add("Email", p.email || p.outreach?.to);
  add("Google Maps", p.url);
  if (p.totalScore != null) add("Rating", `${p.totalScore} (${p.reviewsCount || 0} reviews)`);
  add("Suggested engagement", p.website ? "Revamp existing website" : "Build new website");
  add("Pipeline stage", STAGE_META[leadStage(p)].label);
  add("Outreach status", leadStatus(p));
  if (p.outreach?.sentAt) add("Last outreach", new Date(p.outreach.sentAt).toLocaleString());

  const hours: { day: string; hours: string }[] = p.openingHours || [];
  if (hours.length) {
    lines.push("", "Opening hours:");
    for (const h of hours) lines.push(`  ${h.day}: ${h.hours}`);
  }

  const info: Record<string, { label: string; value: boolean }[]> = p.additionalInfo || {};
  const groups = Object.entries(info);
  if (groups.length) {
    lines.push("", "Details & amenities:");
    for (const [group, rows] of groups) {
      const yes = rows.filter((r) => r.value).map((r) => r.label);
      if (yes.length) lines.push(`  ${group}: ${yes.join(", ")}`);
    }
  }

  if (p.description) lines.push("", "Description:", p.description);
  return lines.join("\n");
}

function slugify(value: string): string {
  return (
    String(value || "lead")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "lead"
  );
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function ScraperView({ places }: { places: AnyDoc[] }) {
  const router = useRouter();
  const [category, setCategory] = useState("all");
  const [statusTab, setStatusTab] = useState<"all" | LeadStatus>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AnyDoc | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [showRun, setShowRun] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [showOutreach, setShowOutreach] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "board">("cards");
  // Optimistic stage moves keyed by placeId — applied instantly on drop, then
  // persisted. Kept even after the server refresh (server agrees, so harmless).
  const [stageOverrides, setStageOverrides] = useState<Record<string, Stage>>({});

  // Run form state
  const [searchStrings, setSearchStrings] = useState("restaurant");
  const [location, setLocation] = useState("Berlin, Germany");
  const [maxResults, setMaxResults] = useState(20);

  // Import state
  const [importText, setImportText] = useState("");

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of places) {
      const c = String(p.categoryName || "Uncategorized");
      counts.set(c, (counts.get(c) || 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [places]);

  // Leads matching the category + search filters, before the status tab is
  // applied. The status tabs and their counts operate on top of this.
  const base = useMemo(() => {
    const q = query.trim().toLowerCase();
    return places.filter((p) => {
      if (category !== "all" && String(p.categoryName) !== category) return false;
      if (!q) return true;
      return (
        String(p.title || "").toLowerCase().includes(q) ||
        String(p.address || "").toLowerCase().includes(q) ||
        String(p.categoryName || "").toLowerCase().includes(q) ||
        (Array.isArray(p.categories) &&
          p.categories.some((c: string) => c.toLowerCase().includes(q)))
      );
    });
  }, [places, category, query]);

  const statusCounts = useMemo(() => {
    const counts = { all: base.length, new: 0, sent: 0, failed: 0 };
    for (const p of base) counts[leadStatus(p)] += 1;
    return counts;
  }, [base]);

  const filtered = useMemo(
    () => (statusTab === "all" ? base : base.filter((p) => leadStatus(p) === statusTab)),
    [base, statusTab]
  );

  const pickedLeads = useMemo(
    () => places.filter((p) => picked.has(p.placeId)),
    [places, picked]
  );

  function togglePick(placeId: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(placeId)) next.delete(placeId);
      else next.add(placeId);
      return next;
    });
  }

  function selectAllFiltered() {
    setPicked(new Set(filtered.map((p) => p.placeId)));
  }

  const effectiveStage = (p: AnyDoc): Stage => stageOverrides[p.placeId] ?? leadStage(p);

  async function setStage(placeId: string, stage: Stage) {
    const prev = places.find((p) => p.placeId === placeId);
    if (prev && effectiveStage(prev) === stage) return;
    // Optimistic: move the card immediately, revert if the save fails.
    setStageOverrides((o) => ({ ...o, [placeId]: stage }));
    try {
      const res = await fetch("/api/admin/scraper", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "set-stage", placeId, stage }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Could not move lead");
      router.refresh();
    } catch (e: any) {
      setStageOverrides((o) => {
        const next = { ...o };
        if (prev) next[placeId] = leadStage(prev);
        else delete next[placeId];
        return next;
      });
      setNotice({ ok: false, message: e?.message || "Could not move lead" });
    }
  }

  function exportCsv() {
    if (!filtered.length) {
      setNotice({ ok: false, message: "No leads in this view to export." });
      return;
    }
    const tab = statusTab === "all" ? "all" : statusTab;
    const stamp = new Date().toISOString().slice(0, 10);
    downloadFile(
      `biztreck-leads-${tab}-${stamp}.csv`,
      leadsToCsv(filtered),
      "text/csv;charset=utf-8"
    );
    setNotice({ ok: true, message: `Exported ${filtered.length} lead(s) to CSV.` });
  }

  async function post(payload: AnyDoc, key: string) {
    setBusy(key);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/scraper", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Request failed");
      setNotice({ ok: true, message: data.message || "Done." });
      router.refresh();
      return data;
    } catch (e: any) {
      setNotice({ ok: false, message: e?.message || "Request failed" });
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function runScraper() {
    await post(
      { action: "run-apify", searchStrings, location, maxResults },
      "run"
    );
  }

  async function importJson() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(importText);
    } catch {
      setNotice({ ok: false, message: "That is not valid JSON. Paste the dataset array or upload the file." });
      return;
    }
    const ok = await post({ action: "import-json", items: parsed }, "import");
    if (ok) {
      setImportText("");
      setShowImport(false);
    }
  }

  async function readFile(file: File | null) {
    if (!file) return;
    try {
      const text = await file.text();
      setImportText(text);
      setNotice({ ok: true, message: `Loaded ${file.name}. Click "Import into list" to save.` });
    } catch {
      setNotice({ ok: false, message: "Could not read that file." });
    }
  }

  async function deletePlace(place: AnyDoc) {
    if (!confirm(`Remove "${place.title}" from the list?`)) return;
    await post({ action: "delete-place", placeId: place.placeId }, `del-${place.placeId}`);
    if (selected?.placeId === place.placeId) setSelected(null);
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy-700/40 bg-navy-900/35 p-4">
        <p className="text-sm text-slate-400">
          {places.length} businesses collected. Run the scraper daily or import an Apify dataset.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setShowRun((v) => !v);
              setShowImport(false);
            }}
            className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
          >
            <Sparkles size={16} /> {showRun ? "Close" : "Run scraper"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowImport((v) => !v);
              setShowRun(false);
            }}
            className="btn-ghost inline-flex items-center gap-2 px-4 py-2 text-sm"
          >
            <Upload size={16} /> {showImport ? "Close" : "Import JSON"}
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            title="Download the leads in the current tab as a CSV spreadsheet"
            className="btn-ghost inline-flex items-center gap-2 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {notice && (
        <div
          className={`rounded-xl border px-5 py-4 text-sm ${
            notice.ok
              ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
              : "border-rose-400/40 bg-rose-400/10 text-rose-200"
          }`}
        >
          {notice.message}
        </div>
      )}

      {/* Run scraper form */}
      {showRun && (
        <div className="rounded-xl border border-navy-700/40 bg-navy-900/35 p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles size={16} className="text-accent-cyan" /> Run Apify scraper
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm text-slate-300 md:col-span-2">
              Search terms (one per line)
              <textarea
                value={searchStrings}
                onChange={(e) => setSearchStrings(e.target.value)}
                rows={3}
                placeholder={"restaurant\ncoffee shop\ngym"}
                className="resize-y rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-accent-cyan"
              />
            </label>
            <label className="grid gap-1 text-sm text-slate-300">
              Location
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Berlin, Germany"
                className="rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-white outline-none focus:border-accent-cyan"
              />
            </label>
            <label className="grid gap-1 text-sm text-slate-300">
              Max results per search
              <input
                type="number"
                value={maxResults}
                min={1}
                onChange={(e) => setMaxResults(Number(e.target.value))}
                className="rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-white outline-none focus:border-accent-cyan"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={runScraper}
            disabled={busy === "run"}
            className="btn-primary mt-4 inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === "run" ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Run scraper now
          </button>
          <p className="mt-3 text-xs text-slate-500">
            Requires an <code className="text-slate-400">APIFY_TOKEN</code> in your environment.
            The run may take a minute or two before results appear.
          </p>
        </div>
      )}

      {/* Import form */}
      {showImport && (
        <div className="rounded-xl border border-navy-700/40 bg-navy-900/35 p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <Upload size={16} className="text-accent-cyan" /> Import Apify dataset JSON
          </div>
          <label className="mb-3 grid gap-1 text-sm text-slate-300">
            Upload JSON file
            <input
              type="file"
              accept=".json,application/json"
              onChange={(e) => readFile(e.target.files?.[0] || null)}
              className="rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-slate-300 file:mr-3 file:rounded-full file:border-0 file:bg-accent-cyan/15 file:px-3 file:py-1.5 file:text-accent-cyan"
            />
          </label>
          <label className="grid gap-1 text-sm text-slate-300">
            ...or paste JSON
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={5}
              placeholder='[{ "title": "...", "categoryName": "...", ... }]'
              className="resize-y rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 font-mono text-xs text-white outline-none placeholder:text-slate-600 focus:border-accent-cyan"
            />
          </label>
          <button
            type="button"
            onClick={importJson}
            disabled={busy === "import" || !importText.trim()}
            className="btn-primary mt-4 inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === "import" ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
            Import into list
          </button>
        </div>
      )}

      {/* Status tabs — segregate contacted vs. not contacted (card view only) */}
      {viewMode === "cards" && (
      <div className="flex flex-wrap gap-2 border-b border-navy-700/40 pb-1">
        {STATUS_TABS.map((tab) => {
          const active = statusTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusTab(tab.key)}
              className={`inline-flex items-center gap-2 rounded-t-lg border-b-2 px-4 py-2 text-sm transition ${
                active
                  ? "border-accent-cyan text-white"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] ${
                  active ? "bg-accent-cyan/20 text-accent-cyan" : "bg-navy-800/70 text-slate-400"
                }`}
              >
                {statusCounts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="appearance-none rounded-lg border border-navy-700/70 bg-navy-950/60 py-2 pl-3 pr-9 text-sm text-white outline-none focus:border-accent-cyan"
          >
            <option value="all">All categories ({places.length})</option>
            {categories.map(([name, count]) => (
              <option key={name} value={name}>
                {name} ({count})
              </option>
            ))}
          </select>
          <ChevronDown
            size={15}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
        </div>
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, address, category..."
            className="w-full rounded-lg border border-navy-700/70 bg-navy-950/60 py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-accent-cyan"
          />
        </div>
        <span className="text-sm text-slate-400">
          {(viewMode === "board" ? base.length : filtered.length)} result
          {(viewMode === "board" ? base.length : filtered.length) === 1 ? "" : "s"}
        </span>
        {viewMode === "cards" && filtered.length > 0 && (
          <button
            type="button"
            onClick={selectAllFiltered}
            className="text-sm text-accent-cyan hover:underline"
          >
            Select all
          </button>
        )}
        {/* Card / Board (kanban pipeline) toggle */}
        <div className="ml-auto inline-flex rounded-lg border border-navy-700/70 bg-navy-950/60 p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition ${
              viewMode === "cards" ? "bg-accent-cyan/15 text-accent-cyan" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LayoutGrid size={15} /> Cards
          </button>
          <button
            type="button"
            onClick={() => setViewMode("board")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition ${
              viewMode === "board" ? "bg-accent-cyan/15 text-accent-cyan" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Columns3 size={15} /> Board
          </button>
        </div>
      </div>

      {/* Selection bar */}
      {picked.size > 0 && (
        <div className="sticky top-2 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent-cyan/40 bg-accent-cyan/10 px-4 py-3 backdrop-blur">
          <span className="text-sm font-semibold text-white">
            {picked.size} lead{picked.size === 1 ? "" : "s"} selected
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPicked(new Set())}
              className="rounded-full border border-navy-700/70 bg-navy-900/60 px-4 py-1.5 text-sm text-slate-200 hover:border-slate-400"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setShowOutreach(true)}
              className="btn-primary inline-flex items-center gap-2 px-4 py-1.5 text-sm"
            >
              <Mail size={15} /> AI outreach
            </button>
          </div>
        </div>
      )}

      {/* Kanban board — drag leads across pipeline stages */}
      {viewMode === "board" ? (
        base.length === 0 ? (
          <div className="rounded-lg border border-dashed border-navy-700/60 bg-navy-950/25 p-10 text-center text-sm text-slate-500">
            {places.length === 0
              ? "No businesses yet. Run the scraper or import a JSON dataset to get started."
              : "No businesses match this filter."}
          </div>
        ) : (
          <KanbanBoard
            leads={base}
            stageOf={effectiveStage}
            onMove={setStage}
            onOpen={(p) => setSelected(p)}
          />
        )
      ) : /* Cards */ filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-navy-700/60 bg-navy-950/25 p-10 text-center text-sm text-slate-500">
          {places.length === 0
            ? "No businesses yet. Run the scraper or import a JSON dataset to get started."
            : "No businesses match this filter."}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((place) => (
            <PlaceCard
              key={place.placeId || place._id}
              place={place}
              picked={picked.has(place.placeId)}
              onTogglePick={() => togglePick(place.placeId)}
              onOpen={() => setSelected(place)}
            />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <PlaceDetail
          place={selected}
          onClose={() => setSelected(null)}
          onDelete={() => deletePlace(selected)}
          deleting={busy === `del-${selected.placeId}`}
        />
      )}

      {/* Outreach campaign */}
      {showOutreach && pickedLeads.length > 0 && (
        <OutreachPanel leads={pickedLeads} onClose={() => setShowOutreach(false)} />
      )}
    </div>
  );
}

function KanbanBoard({
  leads,
  stageOf,
  onMove,
  onOpen,
}: {
  leads: AnyDoc[];
  stageOf: (p: AnyDoc) => Stage;
  onMove: (placeId: string, stage: Stage) => void;
  onOpen: (p: AnyDoc) => void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<Stage | null>(null);

  const byStage = useMemo(() => {
    const map: Record<Stage, AnyDoc[]> = {
      new: [],
      contacted: [],
      replied: [],
      negotiation: [],
      won: [],
      lost: [],
    };
    for (const p of leads) map[stageOf(p)].push(p);
    return map;
  }, [leads, stageOf]);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STAGE_ORDER.map((stage) => {
        const meta = STAGE_META[stage];
        const items = byStage[stage];
        const isOver = overStage === stage;
        return (
          <div
            key={stage}
            onDragOver={(e) => {
              e.preventDefault();
              if (overStage !== stage) setOverStage(stage);
            }}
            onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("text/plain") || dragId;
              if (id) onMove(id, stage);
              setDragId(null);
              setOverStage(null);
            }}
            className={`flex w-72 shrink-0 flex-col rounded-xl border bg-navy-900/35 transition ${
              isOver ? `${meta.column} bg-navy-900/70` : "border-navy-700/40"
            }`}
          >
            <div className="flex items-center justify-between gap-2 border-b border-navy-700/40 px-3 py-2.5">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
                {meta.label}
              </span>
              <span className="rounded-full bg-navy-800/70 px-2 py-0.5 text-[11px] text-slate-400">
                {items.length}
              </span>
            </div>
            <div className="flex min-h-[120px] flex-1 flex-col gap-2 p-2">
              {items.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-navy-700/50 py-6 text-center text-xs text-slate-600">
                  Drop leads here
                </div>
              ) : (
                items.map((p) => (
                  <KanbanCard
                    key={p.placeId || p._id}
                    place={p}
                    stage={stage}
                    dragging={dragId === p.placeId}
                    onDragStart={(e) => {
                      setDragId(p.placeId);
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", p.placeId);
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setOverStage(null);
                    }}
                    onMove={onMove}
                    onOpen={() => onOpen(p)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanCard({
  place,
  stage,
  dragging,
  onDragStart,
  onDragEnd,
  onMove,
  onOpen,
}: {
  place: AnyDoc;
  stage: Stage;
  dragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onMove: (placeId: string, stage: Stage) => void;
  onOpen: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`cursor-grab rounded-lg border border-navy-700/50 bg-navy-950/50 p-3 transition active:cursor-grabbing ${
        dragging ? "opacity-40" : "hover:border-accent-cyan/50"
      }`}
    >
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="line-clamp-2 text-sm font-semibold text-white">{place.title}</div>
        <div className="mt-1 truncate text-xs text-slate-500">
          {place.categoryName || "Business"}
          {place.city ? ` · ${place.city}` : ""}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          <Rating score={place.totalScore} reviews={Number(place.reviewsCount || 0)} />
          {place.website && <Globe size={11} className="text-slate-400" />}
          {place.phone && <Phone size={11} className="text-slate-400" />}
          {place.outreachStatus === "sent" && (
            <span className="text-emerald-400">emailed</span>
          )}
        </div>
      </button>
      {/* Fallback / accessible way to move a lead without dragging */}
      <div className="relative mt-2">
        <select
          value={stage}
          onChange={(e) => onMove(place.placeId, e.target.value as Stage)}
          className="w-full appearance-none rounded-md border border-navy-700/60 bg-navy-900/60 py-1 pl-2 pr-6 text-[11px] text-slate-300 outline-none focus:border-accent-cyan"
        >
          {STAGE_ORDER.map((s) => (
            <option key={s} value={s}>
              {STAGE_META[s].label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={12}
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
        />
      </div>
    </div>
  );
}

function Rating({ score, reviews }: { score: number | null; reviews: number }) {
  if (score == null) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-amber-300">
      <Star size={12} className="fill-amber-300 text-amber-300" />
      {score.toFixed(1)}
      <span className="text-slate-500">({reviews.toLocaleString()})</span>
    </span>
  );
}

function PlaceCard({
  place,
  picked,
  onTogglePick,
  onOpen,
}: {
  place: AnyDoc;
  picked: boolean;
  onTogglePick: () => void;
  onOpen: () => void;
}) {
  const sent = place.outreachStatus === "sent";
  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-xl border text-left transition ${
        picked
          ? "border-accent-cyan bg-navy-900/70"
          : "border-navy-700/40 bg-navy-900/35 hover:border-accent-cyan/50 hover:bg-navy-900/60"
      }`}
    >
      {/* Selection checkbox */}
      <button
        type="button"
        onClick={onTogglePick}
        aria-label={picked ? "Deselect lead" : "Select lead"}
        className="absolute right-2 top-2 z-10 rounded-md bg-navy-950/80 p-1 text-accent-cyan backdrop-blur transition hover:scale-110"
      >
        {picked ? <CheckSquare size={20} /> : <Square size={20} className="text-slate-300" />}
      </button>

      <button type="button" onClick={onOpen} className="flex flex-1 flex-col text-left">
      <div className="relative h-36 w-full overflow-hidden bg-navy-950">
        {place.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={place.imageUrl}
            alt={place.title}
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-600">
            <MapPin size={28} />
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-full border border-accent-cyan/30 bg-navy-950/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-cyan">
          {place.categoryName || "Business"}
        </span>
        {sent && (
          <span className="absolute bottom-2 left-2 rounded-full border border-emerald-400/40 bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
            Emailed
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-semibold text-white">{place.title}</h3>
        </div>
        <Rating score={place.totalScore} reviews={Number(place.reviewsCount || 0)} />
        {place.address && (
          <p className="line-clamp-2 flex items-start gap-1.5 text-xs text-slate-400">
            <MapPin size={12} className="mt-0.5 shrink-0" /> {place.address}
          </p>
        )}
        <div className="mt-auto flex flex-wrap gap-2 pt-1 text-[11px] text-slate-500">
          {place.phone && (
            <span className="inline-flex items-center gap-1">
              <Phone size={11} /> {place.phone}
            </span>
          )}
          {place.price && <span className="text-slate-400">{place.price}</span>}
        </div>
      </div>
      </button>
    </div>
  );
}

function PlaceDetail({
  place,
  onClose,
  onDelete,
  deleting,
}: {
  place: AnyDoc;
  onClose: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const info: Record<string, { label: string; value: boolean }[]> =
    place.additionalInfo || {};
  const hours: { day: string; hours: string }[] = place.openingHours || [];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="my-8 w-full max-w-3xl overflow-hidden rounded-2xl border border-navy-700/60 bg-navy-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header image */}
        <div className="relative h-48 w-full bg-navy-900">
          {place.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={place.imageUrl} alt={place.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-700">
              <MapPin size={40} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full border border-navy-700/60 bg-navy-950/80 p-2 text-slate-200 hover:border-rose-400/50 hover:text-rose-300"
          >
            <X size={16} />
          </button>
          <div className="absolute bottom-3 left-4 right-4">
            <span className="rounded-full border border-accent-cyan/30 bg-navy-950/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-cyan">
              {place.categoryName || "Business"}
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold text-white">{place.title}</h2>
            {place.subTitle && <p className="text-sm text-slate-300">{place.subTitle}</p>}
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex flex-wrap items-center gap-4">
            <Rating score={place.totalScore} reviews={Number(place.reviewsCount || 0)} />
            {place.price && <span className="text-sm text-slate-300">{place.price}</span>}
            {place.permanentlyClosed && (
              <span className="rounded-full border border-rose-400/40 bg-rose-400/10 px-2 py-0.5 text-xs text-rose-300">
                Permanently closed
              </span>
            )}
            {place.temporarilyClosed && (
              <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-xs text-amber-300">
                Temporarily closed
              </span>
            )}
          </div>

          {place.description && <p className="text-sm text-slate-300">{place.description}</p>}

          {/* Contact */}
          <div className="grid gap-3 sm:grid-cols-2">
            {place.address && (
              <DetailRow icon={MapPin} label="Address">
                {place.address}
              </DetailRow>
            )}
            {place.phone && (
              <DetailRow icon={Phone} label="Phone">
                <a href={`tel:${place.phoneUnformatted || place.phone}`} className="hover:text-accent-cyan">
                  {place.phone}
                </a>
              </DetailRow>
            )}
            {place.website && (
              <DetailRow icon={Globe} label="Website">
                <a
                  href={place.website}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all hover:text-accent-cyan"
                >
                  {place.website}
                </a>
              </DetailRow>
            )}
            {place.url && (
              <DetailRow icon={ExternalLink} label="Google Maps">
                <a href={place.url} target="_blank" rel="noreferrer" className="hover:text-accent-cyan">
                  Open in Maps
                </a>
              </DetailRow>
            )}
          </div>

          {/* Categories */}
          {Array.isArray(place.categories) && place.categories.length > 0 && (
            <div>
              <SectionTitle>Categories</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {place.categories.map((c: string) => (
                  <span
                    key={c}
                    className="rounded-full border border-navy-700/60 bg-navy-900/60 px-3 py-1 text-xs text-slate-300"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Opening hours */}
          {hours.length > 0 && (
            <div>
              <SectionTitle>
                <Clock size={14} className="text-accent-cyan" /> Opening hours
              </SectionTitle>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {hours.map((h) => (
                  <div
                    key={h.day}
                    className="flex items-center justify-between rounded-md border border-navy-700/40 bg-navy-900/40 px-3 py-1.5 text-xs"
                  >
                    <span className="text-slate-400">{h.day}</span>
                    <span className="text-slate-200">{h.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional info groups */}
          {Object.keys(info).length > 0 && (
            <div className="space-y-4">
              <SectionTitle>Details &amp; amenities</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2">
                {Object.entries(info).map(([group, rows]) => (
                  <div key={group} className="rounded-lg border border-navy-700/40 bg-navy-900/35 p-3">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent-cyan">
                      {group}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {rows.map((row, i) => (
                        <span
                          key={`${row.label}-${i}`}
                          className={`rounded-full px-2 py-0.5 text-[11px] ${
                            row.value
                              ? "bg-emerald-400/10 text-emerald-200"
                              : "bg-navy-800/60 text-slate-500 line-through"
                          }`}
                        >
                          {row.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-navy-700/40 pt-4 text-xs text-slate-500">
            <span>
              {place.searchString ? `Search: "${place.searchString}" · ` : ""}
              {place.scrapedAt ? new Date(place.scrapedAt).toLocaleDateString() : ""}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  downloadFile(
                    `${slugify(place.title)}-requirement.txt`,
                    leadBrief(place),
                    "text/plain;charset=utf-8"
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-full border border-navy-700/70 bg-navy-800/50 px-3 py-1.5 text-slate-200 hover:border-accent-cyan"
                title="Download this business's details as a requirement brief"
              >
                <FileDown size={12} /> Download brief
              </button>
              <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 text-rose-300 hover:border-rose-400/60 disabled:opacity-60"
              >
                {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: any;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-navy-700/40 bg-navy-900/35 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500">
        <Icon size={12} /> {label}
      </div>
      <div className="text-sm text-slate-200">{children}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-white">{children}</div>
  );
}

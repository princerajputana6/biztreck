"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Clock,
  ExternalLink,
  Globe,
  Loader2,
  MapPin,
  Phone,
  PlusCircle,
  Search,
  Sparkles,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";

type AnyDoc = Record<string, any>;

type Notice = { ok: boolean; message: string } | null;

export default function ScraperView({ places }: { places: AnyDoc[] }) {
  const router = useRouter();
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AnyDoc | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [showRun, setShowRun] = useState(false);
  const [showImport, setShowImport] = useState(false);

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

  const filtered = useMemo(() => {
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
          {filtered.length} result{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
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

function PlaceCard({ place, onOpen }: { place: AnyDoc; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex flex-col overflow-hidden rounded-xl border border-navy-700/40 bg-navy-900/35 text-left transition hover:border-accent-cyan/50 hover:bg-navy-900/60"
    >
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

"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  FileText,
  Globe,
  Linkedin,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";
import { PIPELINE_STAGES, STAGE_LABELS } from "@/lib/leados/types";
import {
  AuditModal,
  ChannelPanel,
  OutreachModal,
  ScoreBar,
} from "../LeadOSView";

type AnyDoc = Record<string, any>;

const PRIORITY_TONE: Record<string, string> = {
  hot: "text-rose-300 bg-rose-400/10 border-rose-400/25",
  warm: "text-amber-300 bg-amber-400/10 border-amber-400/25",
  cold: "text-cyan-300 bg-cyan-400/10 border-cyan-400/25",
  ignore: "text-slate-400 bg-slate-400/10 border-slate-500/25",
};

const PREMIUM_TONE: Record<string, string> = {
  PREMIUM: "text-amber-200 bg-amber-400/10 border-amber-400/30",
  STANDARD: "text-cyan-200 bg-cyan-400/10 border-cyan-400/25",
  LOW_VALUE: "text-slate-400 bg-slate-500/10 border-slate-500/25",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-navy-700/40 bg-navy-900/40 p-5">
      <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-slate-300">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className="min-w-0 truncate text-right text-slate-200">{children}</span>
    </div>
  );
}

function Bool({ value }: { value: boolean }) {
  return value ? (
    <span className="text-emerald-300">Yes</span>
  ) : (
    <span className="text-rose-300">No</span>
  );
}

export default function LeadProfileClient({ lead }: { lead: AnyDoc }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; msg: string } | null>(null);
  const [note, setNote] = useState("");
  const [auditOpen, setAuditOpen] = useState(false);
  const [outreachOpen, setOutreachOpen] = useState(false);
  const [fresh, setFresh] = useState<{ audit?: AnyDoc; outreach?: AnyDoc }>({});

  const s = lead.scores;
  const a = lead.analysis;
  const intel = lead.intel;
  const p = lead.prospect;
  const audit = fresh.audit || lead.audit;
  const outreach = fresh.outreach || lead.outreach;

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
      setNotice({ ok: true, msg: success });
      router.refresh();
      return data;
    } catch (e: any) {
      setNotice({ ok: false, msg: e?.message || "Failed" });
      return null;
    } finally {
      setBusy(null);
    }
  };

  const runAudit = async () => {
    if (audit) return setAuditOpen(true);
    const data = await act("audit", { action: "generate-audit", leadKey: lead.leadKey }, "Audit generated");
    if (data?.audit) {
      setFresh((f) => ({ ...f, audit: data.audit }));
      setAuditOpen(true);
    }
  };

  const runOutreach = async () => {
    if (outreach) return setOutreachOpen(true);
    const data = await act("outreach", { action: "generate-outreach", leadKey: lead.leadKey }, "Outreach kit generated");
    if (data?.outreach) {
      setFresh((f) => ({ ...f, outreach: data.outreach }));
      setOutreachOpen(true);
    }
  };

  const addNote = async () => {
    if (!note.trim()) return;
    const data = await act("note", { action: "add-note", leadKey: lead.leadKey, note }, "Note added");
    if (data?.ok) setNote("");
  };

  const socials: [string, string][] = Object.entries(lead.socials || {}).filter(
    ([, v]) => Boolean(v)
  ) as [string, string][];

  return (
    <div className="space-y-6">
      <Link
        href="/admin/leados"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft size={15} /> Back to LeadOS
      </Link>

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

      {/* Header */}
      <div className="rounded-xl border border-navy-700/40 bg-navy-900/40 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold text-white">{lead.businessName}</h1>
            <p className="mt-1 text-sm text-slate-400">
              {[lead.businessCategory, lead.city, lead.country].filter(Boolean).join(" · ") || "—"}
            </p>
            {lead.website ? (
              <a
                href={lead.website}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1.5 text-sm text-accent-glow hover:text-white"
              >
                <Globe size={13} /> {lead.domain || lead.website}
              </a>
            ) : (
              <span className="mt-1 inline-block rounded-full border border-rose-400/25 bg-rose-400/10 px-2 py-0.5 text-[11px] text-rose-300">
                No website
              </span>
            )}
          </div>
          <div className="text-right">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
                PRIORITY_TONE[s?.priority] || PRIORITY_TONE.ignore
              }`}
            >
              {s?.priority || "unscored"}
            </span>
            <div className="mt-2 font-display text-3xl font-bold text-white">{s?.overall ?? "—"}</div>
            <div className="text-[11px] text-slate-500">overall score</div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => act("analyze", { action: "analyze", leadKey: lead.leadKey }, "Lead analysed")}
            disabled={busy === "analyze"}
            className="inline-flex items-center gap-1.5 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1.5 text-xs text-accent-cyan disabled:opacity-60"
          >
            {busy === "analyze" ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            {lead.lastAnalyzedAt ? "Re-analyse" : "Analyse"}
          </button>
          <button
            type="button"
            onClick={runAudit}
            disabled={busy === "audit"}
            className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1.5 text-xs text-violet-200 disabled:opacity-60"
          >
            {busy === "audit" ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
            {audit ? "View audit" : "Generate audit"}
          </button>
          <button
            type="button"
            onClick={runOutreach}
            disabled={busy === "outreach"}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-200 disabled:opacity-60"
          >
            {busy === "outreach" ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
            {outreach ? "Outreach kit" : "Generate outreach"}
          </button>
          <select
            value={lead.stage}
            onChange={(e) =>
              act("stage", { action: "set-stage", leadKey: lead.leadKey, stage: e.target.value }, "Stage updated")
            }
            className="rounded-lg border border-navy-700/70 bg-navy-950/70 px-2.5 py-1.5 text-xs text-white"
          >
            {PIPELINE_STAGES.map((st) => (
              <option key={st} value={st}>
                {STAGE_LABELS[st]}
              </option>
            ))}
          </select>
        </div>

        <ChannelPanel lead={lead} />
      </div>

      {/* Scores */}
      {s && (
        <Section title="Opportunity scores">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ScoreBar label="Lead quality" value={s.quality} />
            <ScoreBar label="Software opp." value={s.software} />
            <ScoreBar label="AI opp." value={s.ai} />
            <ScoreBar label="Website opp." value={s.website} />
          </div>
          {s.signals?.length > 0 && (
            <ul className="mt-4 grid gap-1 text-xs text-slate-400 sm:grid-cols-2">
              {s.signals.map((sig: string) => (
                <li key={sig}>· {sig}</li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {/* Prospecting — buying intent / premium / reachability */}
      {p && (
        <Section title="Prospecting scores">
          <div className="grid gap-4 sm:grid-cols-3">
            <ScoreBar label="Buying intent" value={p.buyingIntentScore} />
            <ScoreBar label="Premium value" value={p.premiumScore} />
            <ScoreBar label="Contactability" value={p.contactabilityScore} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
            <span className={`rounded-full border px-2.5 py-0.5 font-medium ${PREMIUM_TONE[p.premiumTier] || PREMIUM_TONE.LOW_VALUE}`}>
              {p.premiumTier?.replace("_", " ").toLowerCase()}
            </span>
            <span className="rounded-full border border-slate-500/30 bg-slate-500/10 px-2.5 py-0.5 text-slate-300">
              budget: {p.estimatedBudgetCategory}
            </span>
            <span className="rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-2.5 py-0.5 text-accent-cyan">
              {String(p.primaryOpportunity || "—").replace(/_/g, " ").toLowerCase()}
            </span>
            {p.secondaryOpportunities?.map((o: string) => (
              <span key={o} className="rounded-full border border-slate-600/40 bg-slate-700/20 px-2.5 py-0.5 text-slate-400">
                {o.replace(/_/g, " ").toLowerCase()}
              </span>
            ))}
          </div>
          {(p.buyingIntentSignals?.length > 0 || p.premiumSignals?.length > 0) && (
            <ul className="mt-4 grid gap-1 text-xs text-slate-400 sm:grid-cols-2">
              {[...(p.buyingIntentSignals || []), ...(p.premiumSignals || [])].map((sig: string, i: number) => (
                <li key={`${sig}-${i}`}>· {sig}</li>
              ))}
            </ul>
          )}
        </Section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact & overview */}
        <Section title="Overview">
          <Row label="Email">{lead.email || "—"}</Row>
          <Row label="Phone">{lead.phone || "—"}</Row>
          {(lead.founderName || lead.decisionMakerTitle) && (
            <Row label="Decision maker">
              {[lead.founderName, lead.decisionMakerTitle].filter(Boolean).join(" · ") || "—"}
            </Row>
          )}
          {lead.whatsappAvailable && <Row label="WhatsApp"><Bool value={true} /></Row>}
          <Row label="Rating">
            {lead.googleRating ?? "—"} ({lead.googleReviews || 0} reviews)
          </Row>
          <Row label="Address">{lead.address || "—"}</Row>
          <Row label="City / State">{[lead.city, lead.state].filter(Boolean).join(", ") || "—"}</Row>
          <Row label="Postal / Country">
            {[lead.postalCode, lead.country].filter(Boolean).join(", ") || "—"}
          </Row>
          {lead.googleUrl && (
            <Row label="Google Maps">
              <a href={lead.googleUrl} target="_blank" rel="noreferrer" className="text-accent-glow hover:text-white">
                Open
              </a>
            </Row>
          )}
        </Section>

        {/* Website analysis */}
        <Section title="Website analysis">
          {a ? (
            <>
              <Row label="Score">{a.score}/100</Row>
              <Row label="HTTPS"><Bool value={a.https} /></Row>
              <Row label="Mobile viewport"><Bool value={a.viewportMeta} /></Row>
              <Row label="Response">{a.responseMs != null ? `${(a.responseMs / 1000).toFixed(1)}s` : "—"}</Row>
              <Row label="Contact form"><Bool value={a.contactForm} /></Row>
              <Row label="Live chat"><Bool value={a.chatWidget} /></Row>
              <Row label="Online booking"><Bool value={a.bookingSystem} /></Row>
              <Row label="Analytics"><Bool value={a.analytics} /></Row>
              <Row label="Structured data"><Bool value={a.schema} /></Row>
              <Row label="Sitemap / robots">
                <Bool value={a.sitemap} /> / <Bool value={a.robotsTxt} />
              </Row>
              {a.issues?.length > 0 && (
                <div className="mt-3 space-y-1 border-t border-navy-700/40 pt-3">
                  {a.issues.map((i: string) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                      <AlertTriangle size={12} className="mt-0.5 shrink-0 text-amber-400" /> {i}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500">Not analysed yet.</p>
          )}
        </Section>

        {/* Technology */}
        <Section title="Technology">
          <Row label="CMS">{a?.cms || "—"}</Row>
          <Row label="Framework">{a?.framework || "—"}</Row>
          <Row label="Stack">{a?.technologies?.length ? a.technologies.join(", ") : "—"}</Row>
          <Row label="Security headers">
            {a?.securityHeaders?.length ? a.securityHeaders.join(", ") : "none"}
          </Row>
        </Section>

        {/* Business intelligence */}
        <Section title="Business intelligence">
          {intel ? (
            <>
              <Row label="Employees">{intel.estimatedEmployees}</Row>
              <Row label="Revenue band">{intel.estimatedRevenueBand}</Row>
              <Row label="Growth stage">{intel.growthStage}</Row>
              <Row label="Multi-location"><Bool value={intel.multipleLocations} /></Row>
              <Row label="Tech maturity">{intel.technologyMaturity}</Row>
              <Row label="Digital maturity">{intel.digitalMaturity}</Row>
              <Row label="Complexity">{intel.businessComplexity}</Row>
              <div className="mt-2 border-t border-navy-700/40 pt-2 text-sm">
                <div className="text-slate-500">Likely decision makers</div>
                <div className="mt-1 text-slate-200">
                  {intel.likelyDecisionMakers?.join(", ") || "—"}
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">Analyse the lead to generate intelligence.</p>
          )}
        </Section>
      </div>

      {/* Social media */}
      {socials.length > 0 && (
        <Section title="Social media">
          <div className="flex flex-wrap gap-2">
            {socials.map(([k, v]) => (
              <a
                key={k}
                href={v}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-navy-700/60 bg-navy-800/50 px-3 py-1.5 text-xs text-slate-200 hover:border-accent-cyan"
              >
                {k === "linkedin" ? <Linkedin size={12} /> : <Globe size={12} />} {k}
              </a>
            ))}
          </div>
        </Section>
      )}

      {/* Opportunities */}
      {lead.opportunities?.length > 0 && (
        <Section title="Detected opportunities">
          <div className="space-y-2">
            {lead.opportunities.map((o: AnyDoc) => (
              <div key={o.service} className="rounded-lg border border-navy-700/40 bg-navy-950/40 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-white">{o.service}</span>
                  <span className="text-xs text-accent-cyan">{o.confidence}%</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{o.rationale}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Audit / outreach summary */}
      {(audit || outreach) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {audit && (
            <Section title="AI audit">
              <p className="text-sm text-accent-glow">{audit.headline}</p>
              <p className="mt-2 line-clamp-3 text-xs text-slate-400">{audit.executiveSummary}</p>
              <button
                type="button"
                onClick={() => setAuditOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1.5 text-xs text-violet-200"
              >
                <FileText size={12} /> View full audit
              </button>
            </Section>
          )}
          {outreach && (
            <Section title="Outreach kit">
              <p className="text-sm font-medium text-white">{outreach.coldEmail?.subject}</p>
              <p className="mt-2 line-clamp-3 text-xs text-slate-400">{outreach.coldEmail?.body}</p>
              <button
                type="button"
                onClick={() => setOutreachOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-200"
              >
                <Send size={12} /> Open outreach kit
              </button>
            </Section>
          )}
        </div>
      )}

      {/* Notes + timeline */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Notes">
          <div className="flex gap-2">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNote()}
              placeholder="Add a note…"
              className="flex-1 rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-white outline-none focus:border-accent-cyan"
            />
            <button
              type="button"
              onClick={addNote}
              disabled={busy === "note" || !note.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-2 text-xs text-accent-cyan disabled:opacity-50"
            >
              {busy === "note" ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Add
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {(lead.timeline || [])
              .filter((t: AnyDoc) => t.type === "note")
              .slice()
              .reverse()
              .map((t: AnyDoc, i: number) => (
                <div key={i} className="rounded-lg border border-navy-700/40 bg-navy-950/40 p-3 text-sm text-slate-300">
                  {t.summary}
                  <div className="mt-1 text-[10px] text-slate-600">{new Date(t.at).toLocaleString()}</div>
                </div>
              ))}
          </div>
        </Section>

        <Section title="Timeline">
          <div className="space-y-2">
            {(lead.timeline || [])
              .slice()
              .reverse()
              .map((t: AnyDoc, i: number) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-cyan" />
                  <div className="min-w-0">
                    <div className="text-slate-300">{t.summary}</div>
                    <div className="text-[10px] text-slate-600">
                      {t.type} · {new Date(t.at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            {(lead.timeline || []).length === 0 && (
              <p className="text-sm text-slate-500">No activity yet.</p>
            )}
          </div>
        </Section>
      </div>

      {auditOpen && audit && (
        <AuditModal lead={{ ...lead, audit }} onClose={() => setAuditOpen(false)} />
      )}
      {outreachOpen && outreach && (
        <OutreachModal
          lead={{ ...lead, outreach }}
          onClose={() => setOutreachOpen(false)}
          onRegenerate={runOutreach}
          regenerating={busy === "outreach"}
        />
      )}
    </div>
  );
}

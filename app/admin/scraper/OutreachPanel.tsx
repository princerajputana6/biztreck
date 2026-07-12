"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Link2,
  Loader2,
  Mail,
  MessageCircle,
  Paperclip,
  PhoneCall,
  RefreshCw,
  Send,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";

type AnyDoc = Record<string, any>;

type Status = "idle" | "generating" | "ready" | "sending" | "sent" | "error";

type Draft = {
  placeId: string;
  lead: AnyDoc;
  angle: "build" | "revamp";
  to: string;
  subject: string;
  body: string;
  whatsapp: string;
  status: Status;
  error?: string;
  channelNote?: string;
};

// wa.me needs the number as digits only (no +, spaces, or dashes).
function waDigits(lead: AnyDoc): string {
  return String(lead.phoneUnformatted || lead.phone || "").replace(/\D/g, "");
}

type Attachment = { filename: string; content: string } | null;

export default function OutreachPanel({
  leads,
  onClose,
}: {
  leads: AnyDoc[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [prototypeUrl, setPrototypeUrl] = useState("");
  const [attachment, setAttachment] = useState<Attachment>(null);
  const [attachmentName, setAttachmentName] = useState("");
  const [drafts, setDrafts] = useState<Draft[]>(
    leads.map((lead) => ({
      placeId: lead.placeId,
      lead,
      angle: (lead.website ? "revamp" : "build") as "build" | "revamp",
      to: lead.email || "",
      subject: "",
      body: "",
      whatsapp: "",
      status: "idle",
    }))
  );
  const [generatingAll, setGeneratingAll] = useState(false);
  const [sendingAll, setSendingAll] = useState(false);

  const hasPrototype = Boolean(prototypeUrl.trim() || attachment);

  function patch(placeId: string, next: Partial<Draft>) {
    setDrafts((prev) => prev.map((d) => (d.placeId === placeId ? { ...d, ...next } : d)));
  }

  async function readFile(file: File | null) {
    if (!file) {
      setAttachment(null);
      setAttachmentName("");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Please keep the attachment under 5 MB for deliverability.");
      return;
    }
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const base64 = dataUrl.split(",")[1] || "";
    setAttachment({ filename: file.name, content: base64 });
    setAttachmentName(file.name);
  }

  async function generateOne(draft: Draft, angle?: "build" | "revamp") {
    const useAngle = angle || draft.angle;
    patch(draft.placeId, { status: "generating", angle: useAngle, error: "" });
    try {
      const res = await fetch("/api/admin/outreach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          lead: draft.lead,
          angle: useAngle,
          hasPrototype,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Generation failed");
      patch(draft.placeId, {
        status: "ready",
        angle: data.angle,
        subject: data.subject,
        body: data.body,
        whatsapp: data.whatsapp || "",
        to: draft.to || data.suggestedEmail || "",
      });
    } catch (e: any) {
      patch(draft.placeId, { status: "error", error: e?.message || "Generation failed" });
    }
  }

  async function generateAll() {
    setGeneratingAll(true);
    // Sequential to stay within model rate limits and show progress.
    for (const draft of drafts) {
      // Re-read latest draft (email edits) from state via closure-safe lookup.
      await generateOne(draft);
    }
    setGeneratingAll(false);
  }

  async function sendOne(placeId: string, openWhatsApp = true): Promise<boolean> {
    const draft = drafts.find((d) => d.placeId === placeId);
    if (!draft) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.to.trim())) {
      patch(placeId, { status: "error", error: "Enter a valid recipient email first." });
      return false;
    }

    // Open the WhatsApp chat first, synchronously within the click gesture, so
    // the browser doesn't block it as a popup after the async email send.
    const digits = waDigits(draft.lead);
    let channelNote = "";
    if (openWhatsApp && digits) {
      const waText =
        (draft.whatsapp || draft.subject || "") +
        (prototypeUrl.trim() ? `\n\n${prototypeUrl.trim()}` : "");
      window.open(`https://wa.me/${digits}?text=${encodeURIComponent(waText)}`, "_blank");
      channelNote =
        "Emailed + WhatsApp opened. If WhatsApp says they're not registered, use Call instead.";
    } else if (!digits) {
      channelNote = "No phone number on file — sent by email only.";
    }

    patch(placeId, { status: "sending", error: "" });
    try {
      const res = await fetch("/api/admin/outreach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "send",
          placeId,
          to: draft.to.trim(),
          subject: draft.subject,
          body: draft.body,
          angle: draft.angle,
          prototypeUrl: prototypeUrl.trim(),
          attachment,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Send failed");
      patch(placeId, { status: "sent", channelNote });
      return true;
    } catch (e: any) {
      patch(placeId, { status: "error", error: e?.message || "Send failed" });
      return false;
    }
  }

  async function sendAll() {
    setSendingAll(true);
    for (const draft of drafts) {
      if (draft.status === "ready") {
        // Bulk send is email-only — opening a WhatsApp tab per lead would be
        // blocked as popups. Use each lead's Send button for WhatsApp.
        // eslint-disable-next-line no-await-in-loop
        await sendOne(draft.placeId, false);
      }
    }
    setSendingAll(false);
    router.refresh();
  }

  const readyCount = drafts.filter((d) => d.status === "ready").length;
  const sentCount = drafts.filter((d) => d.status === "sent").length;
  const anyGenerated = drafts.some((d) => d.status !== "idle");

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-4xl rounded-2xl border border-navy-700/60 bg-navy-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-navy-700/50 p-5">
          <div className="flex items-center gap-2">
            <Mail size={18} className="text-accent-cyan" />
            <h2 className="font-display text-xl font-bold text-white">
              AI outreach · {drafts.length} lead{drafts.length === 1 ? "" : "s"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-navy-700/60 bg-navy-900/60 p-2 text-slate-200 hover:border-rose-400/50 hover:text-rose-300"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {/* Prototype setup */}
          <div className="rounded-xl border border-navy-700/40 bg-navy-900/35 p-4">
            <div className="mb-3 text-sm font-semibold text-white">Prototype (optional)</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Link2 size={13} className="text-accent-cyan" /> Prototype link
                </span>
                <input
                  value={prototypeUrl}
                  onChange={(e) => setPrototypeUrl(e.target.value)}
                  placeholder="https://your-demo.vercel.app"
                  className="rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-white outline-none focus:border-accent-cyan"
                />
              </label>
              <label className="grid gap-1 text-sm text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Paperclip size={13} className="text-accent-cyan" /> Attach a file (≤ 5 MB)
                </span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  onChange={(e) => readFile(e.target.files?.[0] || null)}
                  className="rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-1.5 text-sm text-slate-300 file:mr-3 file:rounded-full file:border-0 file:bg-accent-cyan/15 file:px-3 file:py-1.5 file:text-accent-cyan"
                />
              </label>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {hasPrototype
                ? "Leads with a website get a revamp pitch, others a build pitch. The prototype link becomes a button in the email; an attached file rides along with each send."
                : "No prototype yet — the AI will offer to create a free mockup. You can still switch each lead between build and revamp below."}
              {attachmentName ? ` · Attached: ${attachmentName}` : ""}
            </p>
          </div>

          {/* Generate all */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={generateAll}
              disabled={generatingAll}
              className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generatingAll ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {anyGenerated ? "Regenerate all drafts" : "Generate drafts"}
            </button>
            {anyGenerated && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">
                  {readyCount} ready · {sentCount} sent
                </span>
                <button
                  type="button"
                  onClick={sendAll}
                  disabled={sendingAll || readyCount === 0}
                  title="Bulk send is email-only. Use each lead's button to also open WhatsApp."
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200 hover:border-emerald-400/70 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sendingAll ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                  Email all ready ({readyCount})
                </button>
              </div>
            )}
          </div>

          {/* Drafts */}
          <div className="space-y-4">
            {drafts.map((draft) => (
              <DraftCard
                key={draft.placeId}
                draft={draft}
                onChange={(next) => patch(draft.placeId, next)}
                onRegenerate={(angle) => generateOne(draft, angle)}
                onSend={() => sendOne(draft.placeId)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status, error }: { status: Status; error?: string }) {
  if (status === "sent")
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-300">
        <CheckCircle2 size={13} /> Sent
      </span>
    );
  if (status === "error")
    return (
      <span className="inline-flex items-center gap-1 text-xs text-rose-300" title={error}>
        <XCircle size={13} /> {error || "Error"}
      </span>
    );
  if (status === "generating")
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
        <Loader2 size={13} className="animate-spin" /> Writing…
      </span>
    );
  if (status === "sending")
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
        <Loader2 size={13} className="animate-spin" /> Sending…
      </span>
    );
  if (status === "ready")
    return <span className="text-xs text-accent-cyan">Ready to send</span>;
  return <span className="text-xs text-slate-500">Not generated</span>;
}

function DraftCard({
  draft,
  onChange,
  onRegenerate,
  onSend,
}: {
  draft: Draft;
  onChange: (next: Partial<Draft>) => void;
  onRegenerate: (angle: "build" | "revamp") => void;
  onSend: () => void;
}) {
  const busy = draft.status === "generating" || draft.status === "sending";
  const phone = String(draft.lead.phone || draft.lead.phoneUnformatted || "");
  const telHref = String(draft.lead.phoneUnformatted || draft.lead.phone || "").replace(
    /[^\d+]/g,
    ""
  );
  return (
    <div className="rounded-xl border border-navy-700/40 bg-navy-900/35 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate font-semibold text-white">{draft.lead.title}</div>
          <div className="text-xs text-slate-500">
            {draft.lead.categoryName}
            {draft.lead.city ? ` · ${draft.lead.city}` : ""}
            {draft.lead.website ? " · has website" : " · no website"}
            {phone ? " · has phone" : " · no phone"}
          </div>
        </div>
        <StatusPill status={draft.status} error={draft.error} />
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="grid gap-1 text-xs text-slate-400">
          Recipient email
          <input
            value={draft.to}
            onChange={(e) => onChange({ to: e.target.value })}
            placeholder="owner@theirdomain.com"
            className="rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-white outline-none focus:border-accent-cyan"
          />
        </label>
        <div className="flex items-center gap-2">
          <select
            value={draft.angle}
            onChange={(e) => onChange({ angle: e.target.value as "build" | "revamp" })}
            className="rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-white outline-none focus:border-accent-cyan"
          >
            <option value="build">Build pitch</option>
            <option value="revamp">Revamp pitch</option>
          </select>
          <button
            type="button"
            onClick={() => onRegenerate(draft.angle)}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-navy-700/70 bg-navy-800/50 px-3 py-2 text-xs text-slate-200 hover:border-accent-cyan disabled:opacity-50"
            title="Generate / regenerate with this angle"
          >
            <RefreshCw size={13} /> {draft.status === "idle" ? "Generate" : "Redo"}
          </button>
        </div>
      </div>

      {(draft.status === "ready" || draft.subject || draft.body) && (
        <div className="mt-3 space-y-2">
          <label className="grid gap-1 text-xs text-slate-400">
            Subject
            <input
              value={draft.subject}
              onChange={(e) => onChange({ subject: e.target.value })}
              className="rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-white outline-none focus:border-accent-cyan"
            />
          </label>
          <label className="grid gap-1 text-xs text-slate-400">
            Email body (markdown)
            <textarea
              value={draft.body}
              onChange={(e) => onChange({ body: e.target.value })}
              rows={6}
              className="resize-y rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-white outline-none focus:border-accent-cyan"
            />
          </label>
          {phone && (
            <label className="grid gap-1 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <MessageCircle size={12} className="text-emerald-400" /> WhatsApp message
              </span>
              <textarea
                value={draft.whatsapp}
                onChange={(e) => onChange({ whatsapp: e.target.value })}
                rows={3}
                placeholder="Short WhatsApp message…"
                className="resize-y rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-white outline-none focus:border-accent-cyan"
              />
            </label>
          )}
          {draft.channelNote && (
            <p className="text-xs text-slate-400">{draft.channelNote}</p>
          )}
          <div className="flex flex-wrap items-center justify-end gap-2">
            {phone && (
              <a
                href={`tel:${telHref}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-navy-700/70 bg-navy-800/50 px-3 py-2 text-xs text-slate-200 hover:border-accent-cyan"
                title="Call this business"
              >
                <PhoneCall size={13} /> Call {phone}
              </a>
            )}
            <button
              type="button"
              onClick={onSend}
              disabled={busy || draft.status === "sent"}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200 hover:border-emerald-400/70 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {draft.status === "sending" ? (
                <Loader2 size={15} className="animate-spin" />
              ) : phone ? (
                <MessageCircle size={14} />
              ) : (
                <Send size={14} />
              )}
              {draft.status === "sent"
                ? "Sent"
                : phone
                ? "Send email + WhatsApp"
                : "Send email"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

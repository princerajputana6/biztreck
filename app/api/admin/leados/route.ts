import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { guardPermission } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { SITE } from "@/lib/site";
import {
  addTimelineEvent,
  ensureLeadIndexes,
  leadFromScrapedPlace,
  leadsCollection,
  setStage,
  upsertLeads,
} from "@/lib/leados/db";
import { enrichLead, mapWithConcurrency } from "@/lib/leados/enrich";
import { CacheNS, cached, invalidate } from "@/lib/cache";
import { FAST_MODEL } from "@/lib/groq";
import { generateAudit } from "@/lib/leados/audit";
import { generateOutreach } from "@/lib/leados/outreach";
import { emailShell, sendOutreachEmail } from "@/lib/resend";
import { recordSentEmail } from "@/lib/leados/sent-log";
import { normalizePlaces, runApifyScraper } from "@/lib/scraper";
import { marked } from "marked";
import type { Lead, PipelineStage } from "@/lib/leados/types";
import { PIPELINE_STAGES } from "@/lib/leados/types";

// Stages considered "before contact" — sending an email advances them, but a
// lead already at replied/meeting/etc. is never dragged backwards.
const PRE_CONTACT_STAGES: PipelineStage[] = ["new", "qualified", "audit_generated"];

// Days after an outreach email before a follow-up task is due.
const FOLLOW_UP_DAYS = 3;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// A live Apify search plus LLM enrichment can run long; give it room.
export const maxDuration = 300;

async function guard() {
  if (!(await guardPermission("leados"))) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  return null;
}

// ---------------------------------------------------------------- GET: search
export async function GET(req: Request) {
  const denied = await guard();
  if (denied) return denied;

  await ensureLeadIndexes();
  const col = await leadsCollection();
  const sp = new URL(req.url).searchParams;

  const filter: Record<string, any> = {};
  const q = sp.get("q")?.trim();
  if (q) filter.businessName = { $regex: escapeRe(q), $options: "i" };

  const eq = (param: string, field = param) => {
    const v = sp.get(param);
    if (v) filter[field] = v;
  };
  eq("country");
  eq("stage");
  eq("priority", "scores.priority");

  const industry = sp.get("industry");
  if (industry) filter.businessCategory = { $regex: escapeRe(industry), $options: "i" };

  const minScore = Number(sp.get("minScore") || 0);
  if (minScore > 0) filter["scores.overall"] = { $gte: minScore };

  // Boolean website signals (Module 12)
  if (sp.get("noWebsite") === "1") filter.website = "";
  if (sp.get("noSsl") === "1") filter["analysis.https"] = false;
  if (sp.get("noContactForm") === "1") filter["analysis.contactForm"] = false;
  if (sp.get("noChat") === "1") filter["analysis.chatWidget"] = false;
  if (sp.get("unanalyzed") === "1") filter.lastAnalyzedAt = null;

  // Contacted = we've sent this lead a cold email (lastContactedAt is set on
  // every send). `{ $ne: null }` matches only real timestamps; `null` also
  // matches leads where the field was never set (never contacted).
  if (sp.get("contacted") === "1") filter.lastContactedAt = { $ne: null };
  if (sp.get("uncontacted") === "1") filter.lastContactedAt = null;

  const limit = Math.min(Number(sp.get("limit") || 50), 2000);
  const sortKey = sp.get("sort") || "score";
  const sort: Record<string, 1 | -1> =
    sortKey === "recent" ? { createdAt: -1 } : { "scores.overall": -1 };

  // True counts across the WHOLE matching set (not just the returned page) so the
  // dashboard KPIs reflect every lead in the database — matching what Shadow
  // reports. One $facet aggregation, cached briefly and busted on any lead write.
  const [leads, facet] = await Promise.all([
    col.find(filter).sort(sort).limit(limit).toArray(),
    cached(CacheNS.leads, `counts:${JSON.stringify(filter)}`, 10_000, () =>
      col
        .aggregate([
          { $match: filter },
          {
            $facet: {
              total: [{ $count: "n" }],
              analysed: [{ $match: { lastAnalyzedAt: { $ne: null } } }, { $count: "n" }],
              contacted: [{ $match: { lastContactedAt: { $ne: null } } }, { $count: "n" }],
              hot: [{ $match: { "scores.priority": "hot" } }, { $count: "n" }],
              audited: [{ $match: { audit: { $exists: true } } }, { $count: "n" }],
              avg: [{ $group: { _id: null, v: { $avg: "$scores.overall" } } }],
            },
          },
        ])
        .toArray()
    ),
  ]);

  const f = facet[0] || {};
  const n = (arr: any[]) => (arr && arr[0] ? Number(arr[0].n) : 0);
  const total = n(f.total);
  const analysed = n(f.analysed);
  const counts = {
    total,
    analysed,
    pending: Math.max(0, total - analysed),
    contacted: n(f.contacted),
    hot: n(f.hot),
    audited: n(f.audited),
    avgScore: f.avg && f.avg[0] ? Math.round(f.avg[0].v || 0) : 0,
  };

  return NextResponse.json({
    ok: true,
    total,
    counts,
    leads: leads.map(serialize),
  });
}

// -------------------------------------------------------------- POST: actions
export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const action = String(body?.action || "");

  // Every POST action mutates lead data — bust the lead + portal caches so the
  // next dashboard / Shadow read recomputes fresh counts.
  invalidate(CacheNS.leads);
  invalidate(CacheNS.portal);

  try {
    // --- Module 1/2: live Google Places search → import as leads -------------
    if (action === "search-places") {
      const searchStringsArray = String(body.query || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      if (!searchStringsArray.length) {
        return NextResponse.json(
          { ok: false, error: "Enter at least one search term (one per line)." },
          { status: 400 }
        );
      }
      const rawItems = await runApifyScraper({
        searchStringsArray,
        locationQuery: String(body.location || "").trim() || undefined,
        maxCrawledPlacesPerSearch: Math.min(Number(body.maxResults) || 20, 100),
      });
      const places = normalizePlaces(rawItems);
      const leads = places
        .map((p) => leadFromScrapedPlace(p, "google-places-search"))
        .filter(Boolean) as Lead[];
      const { inserted, skipped } = await upsertLeads(leads);
      return NextResponse.json({
        ok: true,
        scanned: places.length,
        inserted,
        skipped,
      });
    }

    // --- Import from the existing scraper output -----------------------------
    if (action === "import-from-scraper") {
      const db = await getDb();
      const places = await db
        .collection("scraped_places")
        .find({})
        .sort({ scrapedAt: -1 })
        .limit(Math.min(Number(body.limit || 500), 2000))
        .toArray();

      const leads = places
        .map((p) => leadFromScrapedPlace(p))
        .filter(Boolean) as Lead[];

      const { inserted, skipped } = await upsertLeads(leads);
      return NextResponse.json({
        ok: true,
        scanned: places.length,
        inserted,
        skipped,
      });
    }

    // --- Analyze one lead (website + scoring + opportunities) ----------------
    if (action === "analyze") {
      const leadKey = String(body.leadKey || "");
      if (!leadKey) {
        return NextResponse.json(
          { ok: false, error: "leadKey is required" },
          { status: 400 }
        );
      }
      const col = await leadsCollection();
      const lead = await col.findOne({ leadKey });
      if (!lead) {
        return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
      }

      const { analysis, intel, scores, opportunities, email } = await enrichLead(lead);
      const now = new Date().toISOString();

      await col.updateOne(
        { leadKey },
        {
          $set: {
            analysis,
            intel,
            scores,
            opportunities,
            ...(email ? { email } : {}),
            lastAnalyzedAt: now,
            updatedAt: now,
          },
          $push: {
            timeline: {
              at: now,
              type: "analysis",
              summary: analysis
                ? `Website analysed — score ${analysis.score}/100, priority ${scores.priority}`
                : `Scored without a website — priority ${scores.priority}`,
            },
          },
        } as never
      );

      return NextResponse.json({ ok: true, analysis, intel, scores, opportunities });
    }

    // --- Analyze a batch of not-yet-analyzed leads ---------------------------
    if (action === "analyze-batch") {
      const size = Math.min(Number(body.size || 10), 20);
      const col = await leadsCollection();
      const pending = await col
        .find({ lastAnalyzedAt: null })
        .limit(size)
        .toArray();

      let done = 0;
      // Enrich a few at a time (website fetch + LLM per lead) instead of strictly
      // one-by-one, so a batch finishes in seconds rather than minutes.
      await mapWithConcurrency(pending, 8, async (lead) => {
        try {
          const { analysis, intel, scores, opportunities, email } = await enrichLead(lead, {
            intelModel: FAST_MODEL,
          });
          const now = new Date().toISOString();
          await col.updateOne(
            { leadKey: lead.leadKey },
            {
              $set: {
                analysis,
                intel,
                scores,
                opportunities,
                ...(email ? { email } : {}),
                lastAnalyzedAt: now,
                updatedAt: now,
              },
            }
          );
          done++;
        } catch {
          // Mark as attempted so a permanently broken site doesn't block the queue.
          await col.updateOne(
            { leadKey: lead.leadKey },
            { $set: { lastAnalyzedAt: new Date().toISOString() } }
          );
        }
      });

      const remaining = await col.countDocuments({ lastAnalyzedAt: null });
      return NextResponse.json({ ok: true, analyzed: done, remaining });
    }

    // --- Module 7: generate the AI business audit ----------------------------
    if (action === "generate-audit") {
      const leadKey = String(body.leadKey || "");
      if (!leadKey) {
        return NextResponse.json(
          { ok: false, error: "leadKey is required" },
          { status: 400 }
        );
      }
      const col = await leadsCollection();
      let lead = await col.findOne({ leadKey });
      if (!lead) {
        return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
      }

      // An audit is only as good as the data behind it — analyze first if needed.
      if (!lead.lastAnalyzedAt) {
        const enrich = await enrichLead(lead);
        const now = new Date().toISOString();
        await col.updateOne(
          { leadKey },
          {
            $set: {
              analysis: enrich.analysis,
              intel: enrich.intel,
              scores: enrich.scores,
              opportunities: enrich.opportunities,
              lastAnalyzedAt: now,
              updatedAt: now,
            },
          }
        );
        lead = { ...lead, ...enrich, lastAnalyzedAt: now };
      }

      const audit = await generateAudit(lead);
      const now = new Date().toISOString();
      await col.updateOne(
        { leadKey },
        {
          $set: { audit, lastAuditAt: now, updatedAt: now },
          $push: {
            timeline: {
              at: now,
              type: "audit",
              summary: `Audit generated (${audit.source}) — ${audit.headline}`,
            },
          },
        } as never
      );
      // Auditing a fresh lead advances it to "audit generated" (never regress a
      // lead already deeper in the pipeline).
      if (lead.stage === "new") await setStage(leadKey, "audit_generated");

      return NextResponse.json({ ok: true, audit });
    }

    // --- Module 7: share / unshare the audit as a public link ----------------
    if (action === "share-audit") {
      const leadKey = String(body.leadKey || "");
      if (!leadKey) {
        return NextResponse.json({ ok: false, error: "leadKey is required" }, { status: 400 });
      }
      const col = await leadsCollection();
      const lead = await col.findOne({ leadKey });
      if (!lead) {
        return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
      }
      if (!lead.audit) {
        return NextResponse.json(
          { ok: false, error: "Generate an audit before sharing it." },
          { status: 400 }
        );
      }
      // Reuse an existing token so the link stays stable across re-shares.
      const token = lead.shareToken || randomBytes(16).toString("hex");
      const now = new Date().toISOString();
      await col.updateOne(
        { leadKey },
        { $set: { shareToken: token, sharedAt: now, updatedAt: now } }
      );
      return NextResponse.json({
        ok: true,
        token,
        url: `${SITE.url}/audit/${token}`,
      });
    }

    if (action === "unshare-audit") {
      const leadKey = String(body.leadKey || "");
      if (!leadKey) {
        return NextResponse.json({ ok: false, error: "leadKey is required" }, { status: 400 });
      }
      const col = await leadsCollection();
      await col.updateOne(
        { leadKey },
        { $set: { updatedAt: new Date().toISOString() }, $unset: { shareToken: "", sharedAt: "" } } as never
      );
      return NextResponse.json({ ok: true });
    }

    // --- Module 8: generate the AI outreach kit ------------------------------
    if (action === "generate-outreach") {
      const leadKey = String(body.leadKey || "");
      if (!leadKey) {
        return NextResponse.json({ ok: false, error: "leadKey is required" }, { status: 400 });
      }
      const col = await leadsCollection();
      let lead = await col.findOne({ leadKey });
      if (!lead) {
        return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
      }

      // Outreach references the audit — ensure analysis + audit exist first.
      if (!lead.lastAnalyzedAt) {
        const enrich = await enrichLead(lead);
        const now = new Date().toISOString();
        await col.updateOne(
          { leadKey },
          { $set: { ...enrich, lastAnalyzedAt: now, updatedAt: now } }
        );
        lead = { ...lead, ...enrich, lastAnalyzedAt: now };
      }
      if (!lead.audit) {
        const audit = await generateAudit(lead);
        const now = new Date().toISOString();
        await col.updateOne(
          { leadKey },
          { $set: { audit, lastAuditAt: now, updatedAt: now } }
        );
        lead = { ...lead, audit, lastAuditAt: now };
      }

      const outreach = await generateOutreach(lead);
      const now = new Date().toISOString();
      await col.updateOne(
        { leadKey },
        {
          $set: { outreach, lastOutreachAt: now, updatedAt: now },
          $push: {
            timeline: {
              at: now,
              type: "outreach",
              summary: `Outreach kit generated (${outreach.source})`,
            },
          },
        } as never
      );
      return NextResponse.json({ ok: true, outreach });
    }

    // --- Module 8: send a specific email via Resend --------------------------
    if (action === "send-email") {
      const leadKey = String(body.leadKey || "");
      const to = String(body.to || "").trim();
      const subject = String(body.subject || "").trim();
      const bodyMd = String(body.body || "").trim();
      const variant = String(body.variant || "email");
      if (!leadKey || !subject || !bodyMd) {
        return NextResponse.json(
          { ok: false, error: "leadKey, subject and body are required" },
          { status: 400 }
        );
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
        return NextResponse.json(
          { ok: false, error: "A valid recipient email is required" },
          { status: 400 }
        );
      }
      const col = await leadsCollection();
      const lead = await col.findOne({ leadKey });
      if (!lead) {
        return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
      }

      const html = emailShell(
        "New business outreach",
        marked.parse(bodyMd, { async: false }) as string
      );
      const result = await sendOutreachEmail({ to, subject, html });
      if (!result.ok) {
        return NextResponse.json(
          { ok: false, error: result.error || "Email failed to send" },
          { status: 502 }
        );
      }
      await recordSentEmail({
        to,
        from: "",
        subject,
        leadKey,
        businessName: lead.businessName,
        messageId: result.id,
        transport: result.via,
        sentBy: "admin-ui",
      });

      const now = new Date().toISOString();
      const followUpAt = new Date(
        Date.now() + FOLLOW_UP_DAYS * 24 * 60 * 60 * 1000
      ).toISOString();
      const advance = PRE_CONTACT_STAGES.includes(lead.stage);
      await col.updateOne(
        { leadKey },
        {
          $set: {
            lastContactedAt: now,
            lastEmailedAt: now,
            nextFollowUpAt: followUpAt,
            email: lead.email || to,
            updatedAt: now,
            ...(advance ? { stage: "email_sent" as PipelineStage } : {}),
          },
          $push: {
            timeline: {
              at: now,
              type: "email",
              summary: `Sent ${variant} to ${to}: ${subject}`,
            },
          },
        } as never
      );

      return NextResponse.json({ ok: true, messageId: result.id || "" });
    }

    // --- CRM: stage + notes ---------------------------------------------------
    if (action === "set-stage") {
      const leadKey = String(body.leadKey || "");
      const stage = String(body.stage || "") as PipelineStage;
      if (!leadKey || !PIPELINE_STAGES.includes(stage)) {
        return NextResponse.json(
          { ok: false, error: "Valid leadKey and stage are required" },
          { status: 400 }
        );
      }
      await setStage(leadKey, stage);
      return NextResponse.json({ ok: true });
    }

    // --- CRM: log a phone call (counts as "contacted" alongside email) -------
    if (action === "log-call") {
      const leadKey = String(body.leadKey || "");
      if (!leadKey) {
        return NextResponse.json({ ok: false, error: "leadKey is required" }, { status: 400 });
      }
      const col = await leadsCollection();
      const lead = await col.findOne({ leadKey });
      if (!lead) {
        return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
      }
      const note = String(body.note || "").trim();
      const now = new Date().toISOString();
      await col.updateOne(
        { leadKey },
        {
          // lastContactedAt = generic "last contacted" (drives the Contacted
          // count/filter); lastCalledAt records the phone channel specifically.
          $set: { lastCalledAt: now, lastContactedAt: now, updatedAt: now },
          $push: {
            timeline: {
              at: now,
              type: "call",
              summary: note ? `Logged a call — ${note}` : "Logged a phone call",
            },
          },
        } as never
      );
      return NextResponse.json({ ok: true });
    }

    if (action === "add-note") {
      const leadKey = String(body.leadKey || "");
      const note = String(body.note || "").trim();
      if (!leadKey || !note) {
        return NextResponse.json(
          { ok: false, error: "leadKey and note are required" },
          { status: 400 }
        );
      }
      await addTimelineEvent(leadKey, {
        at: new Date().toISOString(),
        type: "note",
        summary: note,
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("leados action failed", action, err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Operation failed" },
      { status: 500 }
    );
  }
}

function escapeRe(v: string) {
  return v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function serialize(lead: any) {
  return { ...lead, _id: String(lead._id) };
}

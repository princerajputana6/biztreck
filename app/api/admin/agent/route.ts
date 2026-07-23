import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { complete, hasLLM } from "@/lib/groq";
import { runApifyScraper, normalizePlaces } from "@/lib/scraper";
import {
  leadFromScrapedPlace,
  leadsCollection,
  setStage,
  upsertLeads,
} from "@/lib/leados/db";
import { enrichLead } from "@/lib/leados/enrich";
import { generateAudit } from "@/lib/leados/audit";
import { generateOutreach } from "@/lib/leados/outreach";
import { emailShell, sendOutreachEmail } from "@/lib/resend";
import { marked } from "marked";
import type { Lead } from "@/lib/leados/types";
import { createCalendarEvent } from "@/lib/google";
import { getGoogleAccessToken } from "@/lib/integrations-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function escapeRe(v: string) {
  return v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function findLeadByName(name: string): Promise<Lead | null> {
  const col = await leadsCollection();
  const n = String(name || "").trim();
  if (!n) return null;
  return col.findOne({ businessName: { $regex: escapeRe(n), $options: "i" } });
}

// The tools the agent can call, described to the planner LLM.
const TOOLS = `
- search_leads { query: string (business types/keywords, comma-separated), location: string (city/country, or "anywhere"), maxResults?: number } — scrape Google Places and import new leads.
- find_leads { query?: string, priority?: "hot"|"warm"|"cold", noWebsite?: boolean, unanalysed?: boolean, limit?: number } — look up leads already in the database.
- research_leads { limit?: number } — run website analysis + scoring on the next un-analysed leads.
- audit_lead { business: string } — generate the full AI business audit for one lead.
- draft_outreach { business: string } — draft a cold email + follow-ups grounded in that lead's audit.
- send_email { business: string, to?: string } — send the drafted cold email to a lead. REQUIRES the user to confirm; the app shows a confirm button.
- schedule_meeting { with?: string (lead business name or an email address), title?: string, startISO: string (naive local wall-clock ISO, e.g. "2026-07-25T15:00:00" — NOT UTC, no trailing Z), durationMinutes?: number, timeZone?: string (IANA zone, e.g. "Asia/Kolkata") } — books a Google Calendar event if Google is connected (else explains how to connect). REQUIRES the user to confirm.
- get_stats {} — pipeline counts and top leads.`;

type Plan = { reply: string; action: { name: string; args: any } | null };

async function planTurn(messages: { role: string; content: string }[]): Promise<Plan> {
  const defaultTz = process.env.DEFAULT_TIMEZONE || "Asia/Kolkata";
  // Give the model the LOCAL wall-clock date/time directly (day name included) so it
  // doesn't have to convert from UTC itself — that conversion was a source of off-by-
  // one-day errors on relative dates like "tomorrow".
  const localNow = new Intl.DateTimeFormat("en-US", {
    timeZone: defaultTz,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
  const system =
    "You are Shadow, Biztreck's LeadOS voice assistant. You help the owner find, research, audit, " +
    "and reach out to B2B leads by calling tools. Decide ONE tool call per turn, or none if the user " +
    "is just chatting. Keep replies short and natural — they are spoken aloud.\n\n" +
    `Current local date/time: ${localNow}, timezone ${defaultTz}. Use this as "today"/"now" for resolving ` +
    `relative dates. Use timezone ${defaultTz} unless the user names another.\n\n` +
    "Available tools:\n" + TOOLS + "\n\n" +
    "Rules:\n" +
    "- Return STRICT JSON only: {\"reply\": string, \"action\": null | {\"name\": string, \"args\": object}}.\n" +
    "- 'anywhere'/'everywhere' means location = \"anywhere\".\n" +
    "- priority must be exactly one of \"hot\", \"warm\", \"cold\" (map 'high'/'top'->\"hot\").\n" +
    "- 'draft'/'write an email'/'prepare outreach' -> draft_outreach. 'audit'/'analyse the website' -> audit_lead.\n" +
    "- For audit_lead, draft_outreach and send_email, set args.business to the EXACT business name from the " +
    "conversation. If no specific business is clear, DON'T guess — reply asking which one (action null).\n" +
    "- For send_email ALWAYS include the action and phrase reply as a confirmation question " +
    "(e.g. \"Shall I send the outreach email to …?\"). The app requires the user to confirm.\n" +
    "- For schedule_meeting, resolve relative dates/times (e.g. 'tomorrow at 3pm') into startISO using the " +
    "current local date/time above. If the date/time is unclear, DON'T guess — ask (action null). Otherwise " +
    "ALWAYS include the action and phrase the reply as a confirmation question " +
    "(e.g. \"Shall I book a meeting with … on …?\"). The app requires the user to confirm before booking.\n" +
    "- Never invent lead data; use tools to fetch it.";
  const convo = messages.slice(-12);
  const raw = await complete(system, JSON.stringify({ conversation: convo }), true, 0.3);
  const parsed = JSON.parse(raw);
  return {
    reply: String(parsed.reply || "").trim() || "Okay.",
    action:
      parsed.action && typeof parsed.action === "object" && parsed.action.name
        ? { name: String(parsed.action.name), args: parsed.action.args || {} }
        : null,
  };
}

// ---- Tool executors ----------------------------------------------------------

async function execSearch(args: any) {
  const query = String(args.query || "").trim();
  if (!query) return { speak: "What kind of businesses should I search for?" };
  const rawLoc = String(args.location || "").trim();
  const location = /any|every|all/i.test(rawLoc) ? "" : rawLoc;
  const searchStringsArray = query.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
  try {
    const items = await runApifyScraper({
      searchStringsArray,
      locationQuery: location || undefined,
      maxCrawledPlacesPerSearch: Math.min(Number(args.maxResults) || 15, 30),
    });
    const places = normalizePlaces(items);
    const leads = places.map((p) => leadFromScrapedPlace(p, "agent")).filter(Boolean) as Lead[];
    const { inserted, skipped } = await upsertLeads(leads);
    return {
      data: { scanned: places.length, inserted, skipped },
      speak:
        `Found ${places.length} businesses${location ? ` in ${location}` : ""}. ` +
        `Added ${inserted} new lead${inserted === 1 ? "" : "s"}` +
        (skipped ? `, ${skipped} were already in your list` : "") +
        `. Want me to research them?`,
    };
  } catch (e: any) {
    return { speak: `The search failed: ${e?.message || "check your Apify token"}.` };
  }
}

async function execFind(args: any) {
  const col = await leadsCollection();
  const filter: any = {};
  if (args.query) filter.businessName = { $regex: escapeRe(String(args.query)), $options: "i" };
  // Tolerate priority synonyms the model sometimes emits.
  const prioMap: Record<string, string> = {
    hot: "hot", high: "hot", top: "hot", warm: "warm", medium: "warm", cold: "cold", low: "cold", ignore: "ignore",
  };
  const prio = prioMap[String(args.priority || "").toLowerCase()];
  if (prio) filter["scores.priority"] = prio;
  if (args.noWebsite) filter.website = "";
  if (args.unanalysed) filter.lastAnalyzedAt = null;
  const limit = Math.min(Number(args.limit) || 8, 25);
  const leads = await col.find(filter).sort({ "scores.overall": -1 }).limit(limit).toArray();
  const total = await col.countDocuments(filter);
  const list = leads.map(
    (l) => `${l.businessName}${l.city ? ` (${l.city})` : ""}${l.scores?.overall != null ? ` — score ${l.scores.overall}` : ""}`
  );
  return {
    data: { total, leads: leads.map((l) => ({ business: l.businessName, city: l.city, score: l.scores?.overall ?? null, priority: l.scores?.priority ?? null, stage: l.stage })) },
    speak: total ? `${total} lead${total === 1 ? "" : "s"} match. Top: ${list.slice(0, 5).join("; ")}.` : "No leads match that.",
  };
}

async function execResearch(args: any) {
  const col = await leadsCollection();
  const size = Math.min(Number(args.limit) || 10, 15);
  const pending = await col.find({ lastAnalyzedAt: null }).limit(size).toArray();
  let done = 0;
  for (const lead of pending) {
    try {
      const e = await enrichLead(lead);
      const now = new Date().toISOString();
      await col.updateOne({ leadKey: lead.leadKey }, { $set: { ...e, lastAnalyzedAt: now, updatedAt: now } });
      done++;
    } catch {
      await col.updateOne({ leadKey: lead.leadKey }, { $set: { lastAnalyzedAt: new Date().toISOString() } });
    }
  }
  const remaining = await col.countDocuments({ lastAnalyzedAt: null });
  return {
    data: { analyzed: done, remaining },
    speak: `Researched ${done} lead${done === 1 ? "" : "s"} — analysed their websites and scored them.${remaining ? ` ${remaining} still pending.` : ""}`,
  };
}

async function execAudit(args: any) {
  const lead = await findLeadByName(args.business);
  if (!lead) return { speak: `I couldn't find a lead called "${args.business}".` };
  const col = await leadsCollection();
  let full = lead;
  if (!lead.lastAnalyzedAt) {
    const e = await enrichLead(lead);
    const now = new Date().toISOString();
    await col.updateOne({ leadKey: lead.leadKey }, { $set: { ...e, lastAnalyzedAt: now, updatedAt: now } });
    full = { ...lead, ...e, lastAnalyzedAt: now };
  }
  const audit = await generateAudit(full);
  const now = new Date().toISOString();
  await col.updateOne(
    { leadKey: lead.leadKey },
    { $set: { audit, lastAuditAt: now, updatedAt: now }, $push: { timeline: { at: now, type: "audit", summary: `Audit generated via assistant` } } } as never
  );
  if (lead.stage === "new") await setStage(lead.leadKey, "audit_generated");
  return {
    data: { business: lead.businessName, headline: audit.headline, score: audit.websiteScore, priority: audit.priority },
    speak: `Audit ready for ${lead.businessName}. ${audit.headline}`,
  };
}

async function execDraft(args: any) {
  const lead = await findLeadByName(args.business);
  if (!lead) return { speak: `I couldn't find a lead called "${args.business}".` };
  const col = await leadsCollection();
  let full = lead;
  if (!lead.audit) {
    // Ensure analysis + audit exist so the outreach is grounded.
    if (!lead.lastAnalyzedAt) {
      const e = await enrichLead(lead);
      full = { ...lead, ...e };
    }
    const audit = await generateAudit(full);
    full = { ...full, audit };
    const now = new Date().toISOString();
    await col.updateOne({ leadKey: lead.leadKey }, { $set: { analysis: full.analysis, intel: full.intel, scores: full.scores, opportunities: full.opportunities, audit, lastAnalyzedAt: now, lastAuditAt: now, updatedAt: now } });
  }
  const outreach = await generateOutreach(full);
  const now = new Date().toISOString();
  await col.updateOne(
    { leadKey: lead.leadKey },
    { $set: { outreach, lastOutreachAt: now, updatedAt: now } }
  );
  return {
    data: { business: lead.businessName, subject: outreach.coldEmail.subject, hasEmail: Boolean(lead.email) },
    speak:
      `Drafted outreach for ${lead.businessName}. Subject: "${outreach.coldEmail.subject}". ` +
      (lead.email ? `Say "send it" to email ${lead.email}.` : `There's no email on file — tell me the address to send to.`),
  };
}

async function execSend(args: any) {
  const lead = await findLeadByName(args.business);
  if (!lead) return { speak: `I couldn't find a lead called "${args.business}".` };
  const to = String(args.to || lead.email || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return { speak: `I don't have a valid email for ${lead.businessName}. What address should I use?` };
  }
  const col = await leadsCollection();
  let outreach = lead.outreach;
  if (!outreach) {
    // Draft on the fly if the user jumped straight to sending.
    const drafted = await execDraft({ business: lead.businessName });
    const fresh = await col.findOne({ leadKey: lead.leadKey });
    outreach = fresh?.outreach;
    if (!outreach) return { speak: drafted.speak };
  }
  const email = outreach.coldEmail;
  const html = emailShell("New business outreach", marked.parse(email.body, { async: false }) as string);
  const result = await sendOutreachEmail({ to, subject: email.subject, html });
  if (!result.ok) return { speak: `The email failed to send: ${result.error || "unknown error"}.` };
  const now = new Date().toISOString();
  await col.updateOne(
    { leadKey: lead.leadKey },
    {
      $set: { lastContactedAt: now, email: lead.email || to, updatedAt: now, ...(["new", "qualified", "audit_generated"].includes(lead.stage) ? { stage: "email_sent" } : {}) },
      $push: { timeline: { at: now, type: "email", summary: `Sent outreach to ${to} via assistant: ${email.subject}` } },
    } as never
  );
  return { data: { to, subject: email.subject }, speak: `Sent the outreach email to ${to} for ${lead.businessName}.` };
}

async function execSchedule(args: any) {
  const google = await getGoogleAccessToken();
  if (!google) {
    return {
      speak: "I can't schedule meetings yet — connect Google Calendar in the Integrations tab and I'll be able to book them for you.",
    };
  }
  const startISO = String(args.startISO || "").trim();
  const start = startISO ? new Date(startISO) : null;
  if (!start || Number.isNaN(start.getTime())) {
    return { speak: "What date and time should I book the meeting for?" };
  }
  const duration = Math.min(Math.max(Number(args.durationMinutes) || 30, 15), 180);
  const endISO = new Date(start.getTime() + duration * 60000).toISOString().slice(0, 19);
  const timeZone = String(args.timeZone || process.env.DEFAULT_TIMEZONE || "Asia/Kolkata");

  const withWho = String(args.with || "").trim();
  let attendees: string[] = [];
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(withWho)) {
    attendees = [withWho];
  } else if (withWho) {
    const lead = await findLeadByName(withWho);
    if (lead?.email) attendees = [lead.email];
  }

  try {
    await createCalendarEvent(google.accessToken, {
      summary: String(args.title || (withWho ? `Meeting with ${withWho}` : "Meeting")),
      description: "Booked via Biztreck LeadOS assistant.",
      startISO: startISO.slice(0, 19),
      endISO,
      timeZone,
      attendees,
    });
    return {
      data: { attendees },
      speak:
        `Booked${withWho ? ` with ${withWho}` : ""} for ${start.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}.` +
        (withWho && !attendees.length ? " No email on file for them, so no invite was sent." : ""),
    };
  } catch (e: any) {
    return { speak: `Couldn't create the calendar event: ${e?.message || "unknown error"}.` };
  }
}

async function execStats() {
  const col = await leadsCollection();
  const [total, hot, unanalysed, audited] = await Promise.all([
    col.countDocuments({}),
    col.countDocuments({ "scores.priority": "hot" }),
    col.countDocuments({ lastAnalyzedAt: null }),
    col.countDocuments({ audit: { $exists: true } }),
  ]);
  return {
    data: { total, hot, unanalysed, audited },
    speak: `You have ${total} leads: ${hot} hot, ${audited} audited, ${unanalysed} still to research.`,
  };
}

async function execute(name: string, args: any): Promise<{ speak: string; data?: any }> {
  switch (name) {
    case "search_leads":
      return execSearch(args);
    case "find_leads":
      return execFind(args);
    case "research_leads":
      return execResearch(args);
    case "audit_lead":
      return execAudit(args);
    case "draft_outreach":
      return execDraft(args);
    case "send_email":
      return execSend(args);
    case "get_stats":
      return execStats();
    case "schedule_meeting":
      return execSchedule(args);
    default:
      return { speak: "I'm not sure how to do that yet." };
  }
}

export async function POST(req: Request) {
  // Shadow lives inside LeadOS but is owner-only — there's no standalone permission for it.
  const session = await getSession();
  if (!session || session.role !== "owner") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  if (!hasLLM()) {
    return NextResponse.json({
      ok: true,
      reply: "Shadow needs an OpenRouter key (OPEN_ROUTE_API_KEY) configured to understand commands.",
    });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  try {
    // Confirmed side-effect (e.g. sending an email) — execute directly.
    if (body.confirm && body.confirm.name) {
      const out = await execute(String(body.confirm.name), body.confirm.args || {});
      return NextResponse.json({ ok: true, reply: out.speak, data: out.data ?? null });
    }

    const messages = Array.isArray(body.messages) ? body.messages : [];
    const plan = await planTurn(messages);

    if (!plan.action) {
      return NextResponse.json({ ok: true, reply: plan.reply });
    }

    // Side-effectful actions require an explicit confirm from the UI.
    if (plan.action.name === "send_email" || plan.action.name === "schedule_meeting") {
      return NextResponse.json({
        ok: true,
        reply: plan.reply,
        pendingAction: plan.action,
      });
    }

    const out = await execute(plan.action.name, plan.action.args);
    return NextResponse.json({ ok: true, reply: out.speak, action: plan.action.name, data: out.data ?? null });
  } catch (e: any) {
    console.error("[agent]", e);
    return NextResponse.json({ ok: false, error: e?.message || "Agent failed" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { chat, FAST_MODEL, SMART_MODEL, hasLLM, type ChatMessage } from "@/lib/groq";
import { hasAnthropic } from "@/lib/anthropic";
import { safeDbQuery } from "@/lib/leados/db-query";
import { runApifyScraper, normalizePlaces } from "@/lib/scraper";
import {
  leadFromScrapedPlace,
  leadsCollection,
  setStage,
  upsertLeads,
} from "@/lib/leados/db";
import { enrichLead, mapWithConcurrency } from "@/lib/leados/enrich";
import { generateAudit } from "@/lib/leados/audit";
import { generateOutreach } from "@/lib/leados/outreach";
import { emailShell, sendOutreachEmail } from "@/lib/resend";
import { recordSentEmail, listSentEmails } from "@/lib/leados/sent-log";
import { marked } from "marked";
import type { Lead } from "@/lib/leados/types";
import { createCalendarEvent } from "@/lib/google";
import { getGoogleAccessToken } from "@/lib/integrations-store";
import { getDb } from "@/lib/mongodb";
import { appendMessages, clearConversation, getConversation } from "@/lib/shadow-memory";
import { CacheNS, cached, invalidate } from "@/lib/cache";

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
- send_email { business: string, to?: string } — send the drafted cold email to ONE specific named lead. REQUIRES the user to confirm.
- send_outreach_batch { limit?: number (default 30, max 40), priority?: "hot"|"warm"|"cold", onlyUncontacted?: boolean (default true) } — send audit-grounded cold emails to MULTIPLE leads at once. It automatically drafts the audit + outreach for each and ONLY targets leads that have an email address on file. Use whenever the user says to email / reach out to / send cold emails to several / all / "the N" leads. Reports how many were sent and how many remain (the user can say "continue"). REQUIRES the user to confirm.
- schedule_meeting { with?: string (lead business name or an email address), title?: string, startISO: string (naive local wall-clock ISO, e.g. "2026-07-25T15:00:00" — NOT UTC, no trailing Z), durationMinutes?: number, timeZone?: string (IANA zone, e.g. "Asia/Kolkata") } — books a Google Calendar event if Google is connected (else explains how to connect). REQUIRES the user to confirm.
- get_stats {} — LeadOS pipeline counts and top leads only.
- list_sent_emails { limit?: number (default 15) } — the actual log of outreach emails that were SENT: recipient, business, subject, time, and transport (Resend/SMTP). Use this whenever the user asks "did you send…", "what emails did you send", "who did you email", "show/verify sent emails", or where to find them.
- get_portal_overview {} — company-wide snapshot across the WHOLE admin: number of clients, total & paid invoicing (revenue), active team size, blog & job-post counts, job applications received, and lead totals. Use for ANY "how many / how much / what's my …" question about the business (clients, revenue, team, content, applications, leads).
- navigate { to: "dashboard"|"leados"|"clients"|"content"|"team"|"integrations"|"users" } — open/switch the admin to that section for the user (e.g. "open clients", "go to team", "take me to integrations").
- db_query { collection: string, filter?: object, count?: boolean, limit?: number, sort?: object, fields?: string[] } — READ-ONLY database access to answer ANY data question the fixed tools don't cover. Collections: leados_leads (fields: businessName, email, phone, city, country, website, stage, scores.overall, scores.priority, lastContactedAt, lastEmailedAt, lastCalledAt, lastAnalyzedAt, source, createdAt), clients, invoices (amount, status), employees (status), applications, blogs, jobs, sent_emails (to, subject, transport, at), contacts, expenses, scraped_places. Use count:true for "how many", or return rows to inspect. Build a normal MongoDB filter (e.g. {"scores.priority":"hot","city":"London"}). Use this to investigate before answering, exactly like you'd query a database yourself.`;

// What Shadow knows about how this app works, so it can EXPLAIN things (not just
// do them) — e.g. why sent email isn't in Gmail — instead of deflecting.
const KNOWLEDGE = `HOW BIZTRECK WORKS (use this to answer "how/why/where" questions accurately):
- Email sending: outreach is sent through Resend (from ${process.env.RESEND_FROM || "connect@biztreck.world"}), with an SMTP server as fallback. It is NOT sent through the user's Gmail, so sent mail does NOT appear in Gmail's "Sent" folder. It's verifiable in: (a) the "Sent" tab in LeadOS, (b) the sent_emails collection (via db_query or list_sent_emails), and (c) the user's Resend dashboard (delivery status). If a user says emails aren't in Gmail, explain this — they were sent, just not via Gmail.
- Leads live in the leados_leads collection. Each lead can have: website analysis, an AI audit, a drafted outreach kit, scores (website/software/ai/quality/overall + priority hot/warm/cold), a pipeline stage, and a timeline.
- Lead flow: search_leads (Google Places via Apify) → research_leads (website analysis + scoring + Hunter email discovery) → audit_lead → draft_outreach → send_email / send_outreach_batch. Meetings: schedule_meeting (needs Google Calendar connected in Integrations).
- "Contacted" leads = leads we've reached out to by EMAIL or PHONE. lastContactedAt is set on both an email send AND a logged phone call; lastEmailedAt marks email specifically and lastCalledAt marks a phone call. LeadOS has a "Contacted" KPI card + "Contacted"/"Not contacted" filter; contacted leads show a "Cold email sent" and/or "Called" badge in both the list and Kanban, a "Log call" button records a call, and the "Sent" tab lists every email sent. To count contacted leads use db_query on leados_leads with {"lastContactedAt":{"$ne":null}} count:true; for phone-only use {"lastCalledAt":{"$ne":null}}.
- Clients & billing, Content (blogs/jobs), Team (employees/hiring/applications/expenses), Integrations, and Users are the other admin areas — use get_portal_overview or db_query for their data.`;

type AgentAction = { name: string; args: any };
type AgentResult =
  | { kind: "final"; reply: string; steps: string[]; data?: any }
  | { kind: "confirm"; action: AgentAction; reply: string };

// Actions that change the world → require an explicit UI confirmation.
const SIDE_EFFECT = new Set(["send_email", "send_outreach_batch", "schedule_meeting"]);
// Max think→act→observe iterations per user turn (bounds latency + cost).
const MAX_STEPS = 6;

function buildSystem(memory: string): string {
  const defaultTz = process.env.DEFAULT_TIMEZONE || "Asia/Kolkata";
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
  return (
    "You are Shadow, the owner's AI operator for the ENTIRE Biztreck admin portal — LeadOS (leads, audits, " +
    "outreach, meetings), Clients & billing, Content, Team, Integrations, Users. You are a capable agent: you " +
    "investigate with tools, chain multiple steps, reason about the data you get back, and only then answer. " +
    "Replies are spoken aloud, so keep the FINAL answer natural and concise.\n\n" +
    `Current local date/time: ${localNow}, timezone ${defaultTz}. Use this as "today"/"now" for relative dates. ` +
    `Use timezone ${defaultTz} unless the user names another.\n\n` +
    KNOWLEDGE + "\n\n" +
    "Available tools:\n" + TOOLS + "\n\n" +
    "HOW YOU WORK (agent loop):\n" +
    "- Each step, respond with STRICT JSON ONLY: {\"thought\": string, \"action\": null | {\"name\": string, \"args\": object}, \"reply\": string}.\n" +
    "- To use a tool, set `action` (keep `reply` brief). You will then receive that tool's result and can take " +
    "ANOTHER step — investigate further or chain (e.g. search_leads → research_leads → audit_lead → draft_outreach). " +
    "Take as many steps as needed.\n" +
    "- When you have enough to fully answer, or the task is complete, set `action` = null and put your complete, " +
    "natural spoken answer in `reply`.\n" +
    "- Investigate real data with db_query (or the specific tools) before stating any number/fact. NEVER guess or " +
    "invent data — if you're unsure, query it.\n" +
    "- If you genuinely can't do something, explain why and what's needed — do NOT navigate as a fallback.\n\n" +
    "Rules for specific tools:\n" +
    "- priority is exactly \"hot\"|\"warm\"|\"cold\" (map 'high'/'top'->\"hot\").\n" +
    "- audit_lead/draft_outreach/send_email take the EXACT business name from context. send_email is ONE named " +
    "lead; for plural/bulk ('email all my hot leads', 'the 30 new leads') use send_outreach_batch — never invent a " +
    "single name.\n" +
    "- Side-effect tools (send_email, send_outreach_batch, schedule_meeting): set the action and make `reply` a " +
    "confirmation question stating who/how many/when. The app asks the user to confirm; do not re-ask once answered.\n" +
    "- schedule_meeting: resolve 'tomorrow at 3pm' into startISO (naive local, no trailing Z) using the current " +
    "date/time above. If unclear, ask (action null).\n" +
    "- 'did you send / what/who did you email / where are my sent emails' → list_sent_emails (they go via Resend/" +
    "SMTP, never Gmail). General business counts → get_portal_overview or db_query. Open a section → navigate.\n" +
    "- Use long-term memory below for continuity across conversations." +
    (memory ? `\n\nLONG-TERM MEMORY (durable notes from earlier conversations):\n${memory}` : "")
  );
}

function parseStep(raw: string): { thought?: string; action: AgentAction | null; reply: string } {
  const parsed = JSON.parse(raw);
  return {
    thought: parsed.thought,
    reply: String(parsed.reply || "").trim(),
    action:
      parsed.action && typeof parsed.action === "object" && parsed.action.name
        ? { name: String(parsed.action.name), args: parsed.action.args || {} }
        : null,
  };
}

/**
 * Run the agent's think→act→observe loop for one user turn. Read/compute tools
 * execute inline and feed their results back so the model can reason and chain;
 * side-effect tools stop the loop and return for UI confirmation.
 */
async function runAgent(
  convo: { role: string; content: string }[],
  memory: string
): Promise<AgentResult> {
  const working: ChatMessage[] = [
    { role: "system", content: buildSystem(memory) },
    ...convo.slice(-10).map((m) => ({
      role: (m.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
      content: m.content,
    })),
  ];
  const steps: string[] = [];

  for (let i = 0; i < MAX_STEPS; i++) {
    const raw = await chat(working, { json: true, temperature: 0.3, model: SMART_MODEL });
    let step;
    try {
      step = parseStep(raw);
    } catch {
      return { kind: "final", reply: "Sorry, I got tangled up — could you rephrase that?", steps };
    }

    if (!step.action) {
      return { kind: "final", reply: step.reply || "Done.", steps };
    }
    if (SIDE_EFFECT.has(step.action.name)) {
      return { kind: "confirm", action: step.action, reply: step.reply || "Shall I proceed?" };
    }
    // navigate is a client-side action — end the turn and hand the path back so
    // the browser actually switches sections.
    if (step.action.name === "navigate") {
      const out = await execute("navigate", step.action.args);
      return { kind: "final", reply: out.speak || step.reply || "Opening it.", steps, data: out.data ?? null };
    }

    const out = await execute(step.action.name, step.action.args);
    steps.push(step.action.name);
    working.push({ role: "assistant", content: JSON.stringify({ action: step.action }) });
    const observation = out.data !== undefined && out.data !== null ? out.data : out.speak;
    working.push({
      role: "user",
      content: `TOOL_RESULT ${step.action.name}: ${JSON.stringify(observation).slice(0, 4000)}`,
    });
  }

  // Step budget spent — force a final answer with no further tools.
  working.push({
    role: "user",
    content: "Step limit reached. Give your best final spoken answer now with action set to null.",
  });
  try {
    return { kind: "final", reply: parseStep(await chat(working, { json: true, temperature: 0.3 })).reply || "Here's what I found.", steps };
  } catch {
    return { kind: "final", reply: "I ran several steps but couldn't wrap up cleanly — ask me to continue.", steps };
  }
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
  const size = Math.min(Number(args.limit) || 15, 25);
  const pending = await col.find({ lastAnalyzedAt: null }).limit(size).toArray();
  let done = 0;
  // Enrich several leads at once — each is a slow website fetch + LLM call, so
  // running them concurrently turns minutes into ~tens of seconds.
  await mapWithConcurrency(pending, 8, async (lead) => {
    try {
      const e = await enrichLead(lead, { intelModel: FAST_MODEL });
      const now = new Date().toISOString();
      await col.updateOne({ leadKey: lead.leadKey }, { $set: { ...e, lastAnalyzedAt: now, updatedAt: now } });
      done++;
    } catch {
      await col.updateOne({ leadKey: lead.leadKey }, { $set: { lastAnalyzedAt: new Date().toISOString() } });
    }
  });
  const remaining = await col.countDocuments({ lastAnalyzedAt: null });
  return {
    data: { analyzed: done, remaining },
    speak: `Researched ${done} lead${done === 1 ? "" : "s"} — analysed their websites and scored them.${remaining ? ` ${remaining} still pending; say “continue” to do more.` : ""}`,
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

// Ensure a lead has an audit + a fresh outreach kit, persisting both. `model`
// lets bulk callers use the fast model to stay within time limits.
async function draftOutreachForLead(lead: Lead, model?: string): Promise<Lead> {
  const col = await leadsCollection();
  let full: any = lead;
  if (!lead.audit) {
    if (!lead.lastAnalyzedAt) {
      const e = await enrichLead(lead, model ? { intelModel: model } : undefined);
      full = { ...lead, ...e };
    }
    const audit = await generateAudit(full, model);
    full = { ...full, audit };
    const now = new Date().toISOString();
    await col.updateOne(
      { leadKey: lead.leadKey },
      { $set: { analysis: full.analysis, intel: full.intel, scores: full.scores, opportunities: full.opportunities, prospect: full.prospect, audit, lastAnalyzedAt: now, lastAuditAt: now, updatedAt: now } }
    );
  }
  const outreach = await generateOutreach(full, model);
  const now = new Date().toISOString();
  await col.updateOne(
    { leadKey: lead.leadKey },
    { $set: { outreach, lastOutreachAt: now, updatedAt: now } }
  );
  return { ...full, outreach };
}

async function execDraft(args: any) {
  const lead = await findLeadByName(args.business);
  if (!lead) return { speak: `I couldn't find a lead called "${args.business}".` };
  const full = await draftOutreachForLead(lead);
  const outreach = full.outreach!;
  return {
    data: { business: lead.businessName, subject: outreach.coldEmail.subject, hasEmail: Boolean(lead.email) },
    speak:
      `Drafted outreach for ${lead.businessName}. Subject: "${outreach.coldEmail.subject}". ` +
      (lead.email ? `Say "send it" to email ${lead.email}.` : `There's no email on file — tell me the address to send to.`),
  };
}

// Send outreach to one lead, drafting (and auditing/enriching) on the fly if
// needed. Shared by the single send and the bulk send.
async function sendOutreachToLead(
  lead: Lead,
  opts?: { to?: string; model?: string }
): Promise<{ ok: boolean; to?: string; subject?: string; error?: string; code?: string }> {
  const to = String(opts?.to || lead.email || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return { ok: false, error: "no-email", code: "no-email" };
  const col = await leadsCollection();
  let outreach = lead.outreach;
  if (!outreach) {
    const drafted = await draftOutreachForLead(lead, opts?.model);
    outreach = drafted.outreach;
    if (!outreach) return { ok: false, error: "draft-failed", code: "draft-failed" };
  }
  const email = outreach.coldEmail;
  const html = emailShell("New business outreach", marked.parse(email.body, { async: false }) as string);
  const result = await sendOutreachEmail({ to, subject: email.subject, html });
  if (!result.ok) return { ok: false, error: result.error || "send-failed", code: (result as any).code || "other" };
  const now = new Date().toISOString();
  await col.updateOne(
    { leadKey: lead.leadKey },
    {
      $set: { lastContactedAt: now, lastEmailedAt: now, email: lead.email || to, updatedAt: now, ...(["new", "qualified", "audit_generated"].includes(lead.stage) ? { stage: "email_sent" } : {}) },
      $push: { timeline: { at: now, type: "email", summary: `Sent outreach to ${to} via assistant: ${email.subject}` } },
    } as never
  );
  // Log to the verifiable sent-email record (transport + message id included).
  await recordSentEmail({
    to,
    from: "",
    subject: email.subject,
    leadKey: lead.leadKey,
    businessName: lead.businessName,
    messageId: result.id,
    transport: result.via,
    sentBy: "shadow",
  });
  return { ok: true, to, subject: email.subject };
}

async function execSend(args: any) {
  const lead = await findLeadByName(args.business);
  if (!lead) return { speak: `I couldn't find a lead called "${args.business}".` };
  const r = await sendOutreachToLead(lead, { to: args.to });
  if (!r.ok) {
    if (r.code === "no-email") {
      return { speak: `I don't have a valid email for ${lead.businessName}. What address should I use?` };
    }
    if (r.code === "quota") {
      return { speak: "That didn't send — your Resend account has hit its daily email limit (the free plan allows 100 a day). It resets at midnight UTC, or upgrade the Resend plan to send more." };
    }
    if (r.code === "auth") {
      return { speak: "The email was rejected by Resend — the sender domain or API key looks misconfigured. Check the Resend setup in your environment." };
    }
    return { speak: `The email failed to send: ${r.error}.` };
  }
  return { data: { to: r.to, subject: r.subject }, speak: `Sent the outreach email to ${r.to} for ${lead.businessName}.` };
}

async function execSendBatch(args: any) {
  const col = await leadsCollection();
  const prioMap: Record<string, string> = {
    hot: "hot", high: "hot", top: "hot", warm: "warm", medium: "warm", cold: "cold", low: "cold",
  };
  const prio = prioMap[String(args.priority || "").toLowerCase()];
  const uncontactedOnly = args.onlyUncontacted !== false;

  // Only target leads we can ACTUALLY email (a valid address on file). This is
  // what previously made bulk sends do nothing — the top-scored leads often had
  // no email, so every one got skipped.
  const buildFilter = () => {
    const f: any = { email: { $regex: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" } };
    if (prio) f["scores.priority"] = prio;
    if (uncontactedOnly) f.$or = [{ lastContactedAt: { $exists: false } }, { lastContactedAt: null }];
    return f;
  };

  const emailable = await col.countDocuments(buildFilter());
  if (!emailable) {
    const anyUncontacted = await col.countDocuments(
      uncontactedOnly ? { $or: [{ lastContactedAt: { $exists: false } }, { lastContactedAt: null }] } : {}
    );
    return {
      speak: anyUncontacted
        ? "None of those leads have an email address on file yet, so there's nothing I can send to. Research leads that have a website first and I'll find their emails, or add addresses manually."
        : "There are no matching leads to email right now.",
    };
  }

  const limit = Math.min(Math.max(Number(args.limit) || 30, 1), 40);
  const leads = (await col
    .find(buildFilter())
    .sort({ "scores.overall": -1 })
    .limit(limit)
    .toArray()) as unknown as Lead[];

  let sent = 0;
  let failed = 0;
  let stopCode: "quota" | "auth" | null = null; // provider-level stop → abort the rest
  const sentNames: string[] = [];
  // Draft (audit + outreach) and send with LOW concurrency — Resend's free tier
  // rate-limits to a couple of sends per second, so blasting many at once just
  // gets everything 429'd. Fast model keeps the per-lead drafting quick.
  await mapWithConcurrency(leads, 2, async (lead) => {
    if (stopCode) return; // provider quota/auth already failed — don't keep hammering
    try {
      const r = await sendOutreachToLead(lead, { model: FAST_MODEL });
      if (r.ok) {
        sent++;
        sentNames.push(lead.businessName);
      } else if (r.code === "quota" || r.code === "auth") {
        stopCode = r.code;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  });

  const remaining = await col.countDocuments(buildFilter());

  // Provider blocked us (daily quota / bad sender) — say exactly why.
  if (stopCode === "quota") {
    return {
      data: { sent, failed, remaining, stopped: "quota" },
      speak:
        (sent ? `I sent ${sent} before your Resend account hit its daily email limit. ` : "I couldn't send — your Resend account has hit its daily email limit (the free plan allows 100 a day). ") +
        `It resets at midnight UTC, or upgrade your Resend plan to send more. ${remaining} still waiting.`,
    };
  }
  if (stopCode === "auth") {
    return {
      data: { sent, failed, remaining, stopped: "auth" },
      speak: "Resend rejected the send — the sender domain or API key looks misconfigured. Check the Resend setup in your environment.",
    };
  }

  if (!sent) {
    return { data: { sent, failed }, speak: `I couldn't send any of them — ${failed} failed. It may be a temporary Resend or drafting error; try again shortly.` };
  }
  let speak = `Sent outreach to ${sent} lead${sent === 1 ? "" : "s"}`;
  if (sentNames.length) speak += ` — ${sentNames.slice(0, 3).join(", ")}${sentNames.length > 3 ? ` and ${sentNames.length - 3} more` : ""}`;
  speak += ".";
  if (failed) speak += ` ${failed} failed.`;
  if (remaining) speak += ` ${remaining} more have an email waiting — say “continue” to send the next batch.`;
  return { data: { sent, failed, remaining }, speak };
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

async function execDbQuery(args: any) {
  try {
    const result = await safeDbQuery({
      collection: String(args?.collection || ""),
      filter: args?.filter,
      count: Boolean(args?.count),
      limit: Number(args?.limit) || undefined,
      sort: args?.sort,
      fields: Array.isArray(args?.fields) ? args.fields : undefined,
    });
    // The agent loop reads `data` to reason; speak is a terse fallback.
    return { data: result, speak: "" };
  } catch (e: any) {
    return { data: { error: e?.message || "query failed" }, speak: "" };
  }
}

async function execSentEmails(args: any) {
  const limit = Math.min(Math.max(Number(args?.limit) || 15, 1), 50);
  const rows = await listSentEmails(limit);
  if (!rows.length) {
    return {
      data: { sent: [] },
      speak:
        "I have no record of any outreach emails sent yet. When I do send, they go out via Resend (or SMTP) — not your Gmail — so they won't appear in your Gmail Sent folder; you'll see them here and in your Resend dashboard.",
    };
  }
  const fmt = (at: string) => {
    try {
      return new Date(at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
    } catch {
      return at;
    }
  };
  const top = rows
    .slice(0, 5)
    .map((r: any) => `${r.businessName || r.to} (${r.to}) — ${fmt(r.at)}`)
    .join("; ");
  const via = rows[0]?.transport === "smtp" ? "your SMTP server" : "Resend";
  return {
    data: {
      sent: rows.map((r: any) => ({
        to: r.to,
        business: r.businessName || null,
        subject: r.subject,
        at: r.at,
        transport: r.transport || "resend",
        messageId: r.messageId || null,
      })),
    },
    speak:
      `I've sent ${rows.length} outreach email${rows.length === 1 ? "" : "s"} (showing the latest ${Math.min(rows.length, limit)}). ` +
      `Most recent: ${top}. These went out via ${via}, so they're not in your Gmail Sent — you can see the full list on the Sent tab in LeadOS, and delivery status in your Resend dashboard.`,
  };
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

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const NAV_PATHS: Record<string, { path: string; label: string }> = {
  dashboard: { path: "/admin", label: "the dashboard" },
  leados: { path: "/admin/leados", label: "LeadOS" },
  clients: { path: "/admin/clients", label: "Clients and billing" },
  content: { path: "/admin/content", label: "Content" },
  team: { path: "/admin/team", label: "Team" },
  integrations: { path: "/admin/integrations", label: "Integrations" },
  users: { path: "/admin/users", label: "Users and access" },
};

async function execPortalOverview() {
  // Cache the whole-company snapshot briefly (busted on any lead write); it runs
  // 8 count queries, so back-to-back "how's my business" asks stay instant.
  const data = await cached(CacheNS.portal, "overview", 20_000, async () => {
    const db = await getDb();
    const leads = await leadsCollection();
    const [clientsCount, invoices, activeEmployees, blogsCount, jobsCount, applicationsCount, leadsCount, hotLeads] =
      await Promise.all([
        db.collection("clients").countDocuments({}),
        db.collection("invoices").find({}, { projection: { amount: 1, status: 1 } }).toArray(),
        db.collection("employees").countDocuments({ status: { $ne: "inactive" } }),
        db.collection("blogs").countDocuments({}),
        db.collection("jobs").countDocuments({}),
        db.collection("applications").countDocuments({}),
        leads.countDocuments({}),
        leads.countDocuments({ "scores.priority": "hot" }),
      ]);
    const revenue = invoices.reduce((s, i) => s + Number(i.amount || 0), 0);
    const paid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.amount || 0), 0);
    return {
      clients: clientsCount,
      invoicesRaised: revenue,
      invoicesPaid: paid,
      activeTeam: activeEmployees,
      blogs: blogsCount,
      jobs: jobsCount,
      applications: applicationsCount,
      leads: leadsCount,
      hotLeads,
    };
  });

  const { clients: clientsCount, invoicesRaised: revenue, invoicesPaid: paid, activeTeam: activeEmployees, blogs: blogsCount, jobs: jobsCount, applications: applicationsCount, leads: leadsCount, hotLeads } = data;
  return {
    data: {
      clients: clientsCount,
      invoicesRaised: revenue,
      invoicesPaid: paid,
      activeTeam: activeEmployees,
      blogs: blogsCount,
      jobs: jobsCount,
      applications: applicationsCount,
      leads: leadsCount,
      hotLeads,
    },
    speak:
      `You have ${clientsCount} client${clientsCount === 1 ? "" : "s"}, ${leadsCount} leads (${hotLeads} hot), ` +
      `and ${activeEmployees} active team member${activeEmployees === 1 ? "" : "s"}. ` +
      `Invoicing stands at ${inr.format(revenue)} raised, ${inr.format(paid)} paid. ` +
      `Content: ${blogsCount} blog post${blogsCount === 1 ? "" : "s"} and ${jobsCount} open role${jobsCount === 1 ? "" : "s"}, ` +
      `with ${applicationsCount} job application${applicationsCount === 1 ? "" : "s"} received.`,
  };
}

function execNavigate(args: any) {
  const to = String(args.to || "").toLowerCase().trim();
  const dest = NAV_PATHS[to];
  if (!dest) {
    return { speak: "I'm not sure which section you mean. Try dashboard, LeadOS, clients, content, team, integrations, or users." };
  }
  return { data: { navigateTo: dest.path }, speak: `Opening ${dest.label}.` };
}

// Tools that write to lead data — after these run, bust the lead + portal caches
// so the dashboard and future overview calls reflect the change immediately.
const LEAD_MUTATING = new Set([
  "search_leads",
  "research_leads",
  "audit_lead",
  "draft_outreach",
  "send_email",
  "send_outreach_batch",
]);

async function execute(name: string, args: any): Promise<{ speak: string; data?: any }> {
  const run = async () => {
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
      case "send_outreach_batch":
        return execSendBatch(args);
      case "get_stats":
        return execStats();
      case "list_sent_emails":
        return execSentEmails(args);
      case "db_query":
        return execDbQuery(args);
      case "get_portal_overview":
        return execPortalOverview();
      case "navigate":
        return execNavigate(args);
      case "schedule_meeting":
        return execSchedule(args);
      default:
        return { speak: "I'm not sure how to do that yet." };
    }
  };
  const out = await run();
  if (LEAD_MUTATING.has(name)) {
    invalidate(CacheNS.leads);
    invalidate(CacheNS.portal);
  }
  return out;
}

const nowISO = () => new Date().toISOString();

// GET — load the owner's stored conversation so the widget can restore it on mount.
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "owner") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const { messages } = await getConversation(session.email);
  return NextResponse.json({
    ok: true,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });
}

export async function POST(req: Request) {
  // Shadow is owner-only — there's no standalone permission for it.
  const session = await getSession();
  if (!session || session.role !== "owner") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const owner = session.email;
  if (!hasLLM() && !hasAnthropic()) {
    return NextResponse.json({
      ok: true,
      reply: "Shadow needs an AI key configured — set ANTHROPIC_API_KEY (recommended) or OPEN_ROUTE_API_KEY.",
    });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  try {
    // Clear memory ("forget everything" / new conversation).
    if (body.reset) {
      await clearConversation(owner);
      return NextResponse.json({ ok: true, reply: "Okay, I've cleared our conversation history." });
    }

    // Confirmed side-effect (e.g. sending an email) — execute directly, then remember the outcome.
    if (body.confirm && body.confirm.name) {
      const out = await execute(String(body.confirm.name), body.confirm.args || {});
      await appendMessages(owner, [{ role: "assistant", content: out.speak, at: nowISO() }]);
      return NextResponse.json({ ok: true, reply: out.speak, data: out.data ?? null });
    }

    // Accept either a single {message} (preferred) or a legacy {messages:[...]} array.
    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : Array.isArray(body.messages) && body.messages.length
          ? String(body.messages[body.messages.length - 1]?.content || "").trim()
          : "";
    if (!message) {
      return NextResponse.json({ ok: false, error: "Empty message" }, { status: 400 });
    }

    const { summary, messages: history } = await getConversation(owner);
    const userTurn = { role: "user" as const, content: message, at: nowISO() };
    const convo = [...history, userTurn].map((m) => ({ role: m.role, content: m.content }));

    const result = await runAgent(convo, summary);

    // Side-effect pending confirmation — persist the user turn + the question.
    if (result.kind === "confirm") {
      await appendMessages(owner, [
        userTurn,
        { role: "assistant", content: result.reply, at: nowISO() },
      ]);
      return NextResponse.json({ ok: true, reply: result.reply, pendingAction: result.action });
    }

    // Final answer (possibly after several tool steps).
    await appendMessages(owner, [
      userTurn,
      { role: "assistant", content: result.reply, at: nowISO() },
    ]);
    return NextResponse.json({
      ok: true,
      reply: result.reply,
      steps: result.steps,
      data: result.data ?? null,
    });
  } catch (e: any) {
    console.error("[agent]", e);
    return NextResponse.json({ ok: false, error: e?.message || "Agent failed" }, { status: 500 });
  }
}

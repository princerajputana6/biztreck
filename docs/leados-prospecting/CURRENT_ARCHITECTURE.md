# LeadOS — Current Architecture (Audit, Phase 1)

_Snapshot of what exists today, before the "Premium International Client Prospecting Engine" work. No production code was changed to produce this._

## 1. Stack & storage
- **Next.js App Router** admin under `app/admin/leados/*`; API route handlers under `app/api/admin/leados/*` (`runtime=nodejs`, `dynamic=force-dynamic`).
- **MongoDB** (db `biztreck`), primary collection **`leados_leads`**. Also `sent_emails` (outreach log), `scraped_places` (legacy raw scraper data), `clients`/`invoices`/`employees` (other modules).
- **LLM**: OpenRouter (`lib/groq.ts`, `complete`/`chat`, model `meta-llama/llama-3.3-70b-instruct` + `FAST_MODEL`) and Anthropic (`lib/anthropic.ts`, Claude Opus 5 / Haiku 4.5) — native `claude-*` ids route to Anthropic.
- **Cache**: `lib/cache.ts` in-memory TTL + version-namespace invalidation (`CacheNS.leads`, `CacheNS.portal`).
- **Auth/RBAC**: `guardPermission("leados")`; per-user lead ownership (`ownerEmail`) — members see only their own leads, owners see all.

## 2. The Lead model (`lib/leados/types.ts`)
A single rich `Lead` document accumulates layers:
- **Identity**: `businessName, website, domain, googleUrl, email, phone, address, city, state, postalCode, country, countryCode, lat/lng, googleRating, googleReviews, businessCategory, categories[], description, logo, imageUrl, openingHours[], socials{linkedin,facebook,instagram,twitter,youtube}`.
- **Enrichment**: `analysis` (WebsiteAnalysis — 30+ signals), `intel` (BusinessIntel), `opportunities[]` (service + confidence + rationale), `scores` (LeadScores), `contacts[]` (LeadContact), `audit` (LeadAudit) + `shareToken`, `outreach` (LeadOutreach kit).
- **CRM**: `stage` (10-stage pipeline), `notes`, `timeline[]`, `lastContactedAt/lastEmailedAt/lastCalledAt`, `nextFollowUpAt`.
- **Calling & compliance**: `consent{status,basis,capturedAt,source}`, `doNotCall`, `calls[]` (Retell AI voice records) — WIP.
- **Ownership/bookkeeping**: `ownerEmail/ownerName`, `source`, `createdAt/updatedAt/lastAnalyzedAt`.
- **Dedupe key**: `leadKey = placeId || "domain:"+host` (unique).

Targeting constants already exist: `TARGET_COUNTRIES` (US, Canada, UK, Australia, New Zealand, Singapore, UAE), `TARGET_INDUSTRIES` (11), `SELLABLE_SERVICES` (18), `PIPELINE_STAGES` (10).

## 3. Prospect source (single, today)
- **Google Maps** via Apify actor `compass/crawler-google-places` (`lib/scraper.ts` → `runApifyScraper`, `normalizePlaces`, `normalizePlace`, `guessEmailFromWebsite`). Needs `APIFY_TOKEN` (paid per result).
- Import path: `leadFromScrapedPlace(place, source)` → `upsertLeads()`; also an `import-from-scraper` action for the legacy `scraped_places` collection.
- Triggered from the LeadOS UI ("Search Google": terms + location + max results) and from the Shadow agent (`search_leads`).

## 4. Enrichment pipeline
- `lib/leados/enrich.ts` — `enrichLead(lead, {intelModel})` chains: website fetch + analysis → business intel → scoring → opportunities → **Hunter.io** email discovery; `mapWithConcurrency` runs batches (8 at a time).
- `lib/leados/website-analysis.ts` (357 lines) — fetches the site, extracts HTTPS/SSL, headers, viewport/responsive, SEO tags (title/meta/H1/canonical/OG/schema/sitemap/robots), contactForm/booking/chat/analytics/cookie, CMS/framework/technologies, page weight/images, → a 0–100 `score` + ordered `issues[]`.
- `lib/leados/intelligence.ts` — `deriveIntelHeuristic` + `deriveIntel(lead, model)` (LLM overlay): estimatedEmployees/revenue band, growthStage, multipleLocations, hiringActivity, tech/digital maturity, `likelyDecisionMakers` (**role titles only, guessed from category — not real names**), businessComplexity.
- `lib/leados/hunter.ts` — Hunter.io Domain Search (`HUNTER_API_KEY`) → best email for a domain (free tier ~25–50/mo).

## 5. Scoring (`lib/leados/scoring.ts`)
Four independent 0–100 scores, each recording **signals** (so "why hot" is visible):
- `websiteOpportunity` (no site / slow / outdated CMS / no form / no SSL / not mobile / no analytics)
- `softwareOpportunity` (employee band / multi-location / no portal / manual booking / multi-service / complexity)
- `aiOpportunity` (no chat / no FAQ / manual support / high review volume)
- `leadQuality` = **reachability + fit** (business email / decision-maker present / established / socials / phone / target country / rating)
- **Overall** = `quality*0.40 + software*0.25 + ai*0.20 + website*0.15` → **priority** `hot≥70 / warm≥50 / cold≥30 / ignore` (or ignore if quality<25). **Weights are hard-coded.**
- `deriveOpportunities()` — rules baseline mapping analysis → services with confidence + rationale (top 8). LLM audit refines narrative.

## 6. Audit, outreach, sending, calling
- `lib/leados/audit.ts` (+ `audit-pdf.ts`, public share via `shareToken`) — AI business audit (sections, ROI, next steps, CTA).
- `lib/leados/outreach.ts` — grounded kit: **cold email + 2 follow-ups + LinkedIn note + discovery opener + proposal summary** (markdown). Sent via **Resend → SMTP fallback** (`lib/resend.ts`, `lib/smtp.ts`), logged to `sent_emails` (`lib/leados/sent-log.ts`).
- `lib/leados/channel.ts` — `resolveChannel(lead)` → **best channel + reason + one-click action + full availability ladder** (email/call/linkedin/contact_form/google_message/none). Computed at render, **not persisted**.
- `lib/leados/calling.ts` + `compliance.ts` — Retell AI **voice agent** with consent gating + do-not-call. WIP.
- **Shadow agent** (`app/api/admin/agent/route.ts`) can search/find/research/audit/draft/send (single & batch)/`db_query` over the whole portal.

## 7. Persistence, dedup, indexes (`lib/leados/db.ts`)
- Unique index on `leadKey`; plus `scores.overall`, `scores.priority+overall`, `stage+updatedAt`, `country+businessCategory`, `country+state`, `createdAt`, `ownerEmail+createdAt`, `ownerEmail+overall`, `lastAnalyzedAt`, `domain`, `shareToken` (unique/sparse).
- **Dedup is single-key only** (placeId or domain). No cross-source "same company from two sources" merge.

## 8. UI & dashboard
- `LeadOSView.tsx` — **List / Board (Kanban) / Sent** views; filters: q, priority, stage, country, state, owner, boolean flags (noWebsite/noSsl/noContactForm/noChat/unanalysed) + **Contacted/Not contacted**; KPI cards (Total, Hot, **Contacted**, Avg score, Analysed, Audited) from a `$facet` counts aggregation (cached). "Cold email sent / Called" badges. Lead profile page reuses ScoreBar/ChannelPanel/AuditModal/OutreachModal.
- API GET builds filters + counts; POST actions: search-places, import-from-scraper, analyze, analyze-batch, generate-audit, share/unshare-audit, generate-outreach, send-email, set-stage, add-note, log-call.

## 9. External dependencies & cost surface (today)
| Dependency | Use | Cost posture |
|---|---|---|
| Apify (google-places) | Google Maps source | **Paid per result** |
| Hunter.io | Email discovery | Free tier ~25–50/mo |
| OpenRouter / Anthropic | Intel, audit, outreach, agent | **Paid per call** (no tracking) |
| Resend + SMTP (Gmail) | Email sending | Resend free 100/day + Gmail SMTP |
| Retell | AI voice calls | Paid (WIP) |
| Google Calendar | Meeting booking | Free |

**No cost tracking exists.** Caching is used for counts/portal reads only.

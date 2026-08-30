# LeadOS → Premium International Client Prospecting Engine — Gap Analysis

_Plan section numbers reference the brief. Verdicts: ✅ exists (reuse) · 🟡 partial (extend) · ❌ missing (build)._

## A. What already exists (reuse — do NOT rebuild)
| Plan area | Status | Where |
|---|---|---|
| Google Maps source + import | ✅ | `lib/scraper.ts`, `db.leadFromScrapedPlace/upsertLeads` |
| Website analysis (30+ signals) | ✅ | `website-analysis.ts` |
| Technology-need scoring (web/SEO/CMS/CRM/ERP/custom/automation) | ✅ (as opportunities + 3 opp scores) | `scoring.ts`, `deriveOpportunities` |
| Opportunity/need score + rationale | ✅ | `scores`, `opportunities[]` |
| Country + industry targeting (US/UK/AU/CA + more) | ✅ | `TARGET_COUNTRIES/INDUSTRIES` |
| Social fields (IG/LinkedIn/FB/X/YT) | 🟡 schema only | `Lead.socials` (population thin) |
| Best-contact-channel + ladder | ✅ (not persisted) | `channel.ts resolveChannel` |
| Personalized outreach (email/LinkedIn/discovery) | ✅ | `outreach.ts` |
| CRM pipeline (10 stages) + timeline + notes + follow-up | ✅ | `types.ts`, API actions |
| Dashboard KPIs (subset) | 🟡 | `LeadOSView` + counts `$facet` |
| Consent/compliance + do-not-call (for calling) | ✅ | `types.ts`, `compliance.ts` |
| **Outreach safety** (human-review, no mass auto-send, no scraping of restricted platforms) | ✅ **already aligned** | send/confirm flow, calling consent |

## B. What is missing / needs extending (build)
| # | Plan area | § | Verdict | Notes |
|---|---|---|---|---|
| 1 | **Source-adapter architecture** | 3,25 | ❌ | Only Google Maps today. Need `lib/leados/sources/<name>` adapters emitting the normalized prospect; refactor Google Maps into one. |
| 2 | **Buying-intent score** (funding/launch/hiring/expansion/rebrand/active-marketing/founder-building) | 5C,7,29 | ❌ | **The plan's core differentiator.** Not computed today. Needs signal data that Google Maps can't provide → depends on new sources. |
| 3 | **Premium-client score** + PREMIUM/STANDARD/LOW_VALUE | 22 | ❌ | Not computed. |
| 4 | **Configurable scoring weights** | 5,Phase3 | ❌ | Weights hard-coded in `scoring.ts`; move to config (global + per-campaign). |
| 5 | **Schema additions** | 4,29 | 🟡 | Add: `employeeCount(number), foundedYear, fundingStage, fundingAmount, lastFundingDate, growthSignals[], hiringSignals[], launchSignals[], buyingIntentScore, premiumScore, contactabilityScore, primaryOpportunity, secondaryOpportunities[], estimatedBudgetCategory, founderName, decisionMakerTitle, whatsappAvailable, bestContactChannel(persisted)+confidence+reason, personalizationData, generatedMessages{...}, outreachStatus, sources[]`. (Many analogues exist: `socials, contacts, lastContactedAt`.) |
| 6 | **Opportunity classification** (primary + secondary enums) | 6 | 🟡 | Have `opportunities[]` w/ confidence; derive a single `primaryOpportunity` + `secondaryOpportunities[]` from the expanded category enum (WEBSITE_REDESIGN, SAAS_MVP, HRMS, MOBILE_APP, …). |
| 7 | **Real decision-maker discovery** (named founder/CEO) | 8 | 🟡 | Today only guesses **role titles** (`intel.likelyDecisionMakers`). Real named people should come from **source data** (Crunchbase/PH/YC provide founders) + website "About/Team" extraction — **not** LinkedIn scraping. |
| 8 | **Social profile discovery** | 9 | 🟡 | Extend `website-analysis` to extract social links from the site; use source-provided handles. No scraping of restricted platforms. |
| 9 | **Social activity detection** | 11 | ❌ (defer) | No compliant free way to read Instagram/LinkedIn recency → **out of scope** unless a permitted API appears. |
| 10 | **Multi-variant messages** (IG DM ≤500, WhatsApp, form-short) | 13 | 🟡 | Extend `outreach.ts` (have email/LinkedIn/discovery) with IG/WhatsApp/form variants, evidence-grounded. |
| 11 | **Persisted best channel + confidence + reason + personalization points** | 10,Phase6 | 🟡 | `channel.ts` computes at render only; persist + add `contactabilityScore`. |
| 12 | **Campaigns** (reusable, no-code) | 23 | ❌ | New `leados_campaigns` collection + UI (country/industry/size/signals/service/channel) driving scoped searches. |
| 13 | **Cost tracking** (`cost_per_lead/enrichment/analysis/source`, per-100/1000) | 18,19 | ❌ | Nothing tracked. Add a lightweight `usage`/cost ledger keyed by source/action. |
| 14 | **Source-comparison analytics** (leads/hot/replies/meetings by source) | 17 | ❌ | Meaningful only after ≥2 sources. |
| 15 | **Dashboard v2** (high-intent, per-country, per-opportunity, per-channel, avg intent/need, reply/meeting/conversion rate) | 16 | 🟡 | Current KPIs are a subset; extend the `$facet`. |
| 16 | **Cross-source dedup** (Company with `sources[]`) | 24 | 🟡 (defer) | Today single-key dedup. Full "Company + sources[]" merge is invasive → recommend a lighter interim: cross-source match by domain/name/phone → `duplicateOf` link, full merge later. |
| 17 | **Structured AI output for intent/premium** | 29 | 🟡 | Audit/opportunities already JSON; add buying-intent/premium JSON. |

## C. Source feasibility, platform risk & cost
| Source | API? | Feasibility (free/low-cost) | Risk |
|---|---|---|---|
| Google Maps (Apify) | via Apify | ✅ already integrated | Paid per result |
| **Product Hunt** | GraphQL API (free, OAuth token) | ✅ good first new source (launches = intent) | Low |
| **Reddit** | API (free tier, OAuth, rate-limited) | ✅ good intent source (founders asking for dev/help) | Low–med (rate limits, ToS on use) |
| **Y Combinator** | Public company directory (Algolia-backed public endpoint) / OSS datasets | ✅ read-only, founders + batch | Low |
| **Wellfound (AngelList)** | No official public company-search API | 🟡 prefer **CSV import** / user export | Med (scraping restricted) |
| **Crunchbase** | API is **paid/Enterprise**; free tier minimal | 🟡 **CSV import** for funding signals | High cost if API |
| **Clutch / Contra / Indie Hackers** | No suitable public API | 🟡 **CSV import** / manual | Med (scraping restricted) |
| **LinkedIn / Instagram / Facebook** | Automation & scraping **prohibited** | ❌ discovery/activity/auto-DM out of scope; only store links the business/site already exposes; **never auto-message** | High — do not build |
| Hunter.io | API | ✅ integrated (free tier limited) | Low |

**Budget ₹0–₹1,500/mo is achievable** by leaning on: existing free website analysis, free Product Hunt/Reddit/YC APIs, **user CSV imports** for Crunchbase/Wellfound/Clutch funding+startup data, and **capping** paid Apify/Hunter/LLM spend via cost tracking + caching. Every paid dependency stays **behind an adapter** so it can be swapped.

## D. Recommended implementation sequence (adapted to this repo)
| Phase | Scope | Complexity | Depends on |
|---|---|---|---|
| **1. Audit** (this doc) | Architecture + gap | — | done |
| **2. Data model + config** | Extend `Lead` (intent/premium/funding/launch/hiring/primary+secondary opp/persisted channel/personalization/messages/`sources[]`); `leados_campaigns` collection; scoring-weights config; indexes | **M** | 1 |
| **3. Scoring engine v2** | Add `buyingIntentScore`, `premiumScore`, `contactabilityScore`; configurable weights; keep existing 4 scores; opportunity primary/secondary | **M** | 2 |
| **4. Source adapters** | Adapter interface; refactor Google Maps into `sources/googleMaps`; add **Product Hunt** (API) + one of **Reddit/YC**; **CSV-import adapter** (Crunchbase/Wellfound/Clutch) | **L** (each source M) | 2,3 |
| **5. Decision-maker + social enrichment** | Founder from source data + website About/Team + social-link extraction (compliant only) | **M** | 2,4 |
| **6. Best-channel recommendation** | Persist channel + confidence + reason + personalization points; `contactabilityScore` | **M** | 3,5 |
| **7. Message generator** | IG DM / WhatsApp / LinkedIn / email / form variants, evidence-grounded, human-review | **S–M** | 5,6 |
| **8. CRM extensions** | `outreachStatus` per channel, campaign linkage, source on timeline | **S** | 2 |
| **9. Dashboard + source comparison + cost tracking** | Expanded KPIs, source ROI table, cost ledger + per-100/1000 estimates | **M** | 4,13 |
| _(deferred)_ Cross-source dedup merge, social activity detection | | **L / ❌** | later |

## E. Technical risks
- **Buying-intent quality is data-bound**: without funding/launch/hiring feeds, intent scoring degrades to guesses. Prioritise Product Hunt/YC/Crunchbase-CSV to feed it. Never fabricate signals (§28).
- **Restricted platforms**: LinkedIn/IG/FB discovery, activity, and auto-DM are non-compliant → excluded by design; the system **recommends** channels and drafts messages for **manual/compliant** sending.
- **Cost creep**: Apify + Hunter + LLM are the paid surfaces; enforce caching, batch caps, and the cost ledger.
- **Dedup**: multi-source without robust dedup creates duplicates; start with domain/name/phone match + `duplicateOf`, defer full Company merge.
- **Scope**: this is 8 phases; recommend shipping Phase 2–3 + one new source (Phase 4 slice) first to prove value before the long tail.

---
## Progress
- **Phase 2 (data model)** ✅ shipped — `prospect` block + intent/premium/funding/launch/hiring/founder/`sources[]` fields on `Lead`.
- **Phase 3 (scoring v2)** ✅ shipped — `computeProspectScores` (buying-intent / premium+tier / contactability) + `classifyOpportunities`; configurable weights in `scoring-config.ts`. Backfilled onto all existing leads.
- **Phase 4 (source adapters)** 🟡 in progress — adapter interface (`lib/leados/sources/`), Google Maps refactored into an adapter, **Product Hunt** adapter added (first real intent source; needs `PRODUCT_HUNT_TOKEN`). `run-source` API action + UI import buttons. Next: Reddit/YC + CSV-import adapter.
- **Phase 5 (decision-maker + social enrichment)** ✅ shipped — from the lead's OWN site only: social-link extraction (`extractSocialLinks`), country inference (schema/dial/ccTLD via `detectCountry`), WhatsApp-link detection, and named founder/CEO discovery from About/Team pages (`discovery.ts`). Compliant (no LinkedIn/IG scraping, no people-search API); never fabricates — returns blank when unsure. Feeds contactability + premium scores and surfaces in the profile.

_Later phases (6–9: best-channel persistence, message variants, CRM extensions, dashboard + cost tracking) still pending approval._

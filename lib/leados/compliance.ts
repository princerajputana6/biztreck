// LeadOS — calling compliance gate.
//
// Every AI voice call to a lead must pass through `evaluateCall(lead)` first.
// This encodes the rules that keep outbound AI calling lawful — consent, the
// internal do-not-call list, E.164 validity, and local calling-hour windows —
// as a hard gate rather than a checklist a human might forget.
//
// It is deliberately conservative: when in doubt it BLOCKS (hard stop) or WARNS
// (allowed, but surfaced to the operator). None of this is legal advice; the
// thresholds below reflect US TCPA / FCC practice (AI voice = "artificial or
// prerecorded voice" per the FCC's 8 Feb 2024 ruling) plus common mini-TCPA
// state windows, and reasonable defaults for the other target markets.

import type { Lead } from "./types";

export type CallDecision = {
  /** True only when there are zero blocks. Warnings do not stop a call. */
  allowed: boolean;
  /** Hard stops — calling anyway would be a compliance violation. */
  blocks: string[];
  /** Soft flags — allowed, but the operator should know. */
  warnings: string[];
  /** Normalized E.164 number to dial, when derivable. */
  e164: string | null;
  /** Recipient local time used for the window check, for display. */
  localTime?: string;
};

// Markets where we require explicit prior opt-in before an AI voice call.
// The US is strictest (prior express *written* consent for AI/robocalls); we
// apply the same bar to the whole English-speaking target set to stay safe.
const OPT_IN_REQUIRED = new Set([
  "US",
  "CA",
  "GB",
  "UK",
  "AU",
  "NZ",
  "IE",
]);

// Representative IANA timezone per country for the calling-window check. A lead
// may sit in another zone within a large country; treat the window as advisory
// there (we WARN within an hour of the edge rather than hard-block).
const TZ_BY_COUNTRY: Record<string, string> = {
  US: "America/Chicago", // central — middle of the US span
  CA: "America/Toronto",
  GB: "Europe/London",
  UK: "Europe/London",
  IE: "Europe/Dublin",
  AU: "Australia/Sydney",
  NZ: "Pacific/Auckland",
  SG: "Asia/Singapore",
  AE: "Asia/Dubai",
  IN: "Asia/Kolkata",
};

// Allowed local calling window (inclusive start, exclusive end), 24h.
// TCPA is 8:00–21:00 recipient-local; we use 9:00–20:00 as a safer default.
const WINDOW_START = 9;
const WINDOW_END = 20;

/** Strip a phone to E.164-ish and validate shape. Returns null if unusable. */
export function toE164(phone: string, countryCode?: string): string | null {
  if (!phone) return null;
  let s = phone.replace(/[^\d+]/g, "");
  if (!s) return null;
  if (!s.startsWith("+")) {
    // Best-effort: prefix the country dialing code when we recognize it.
    const dial: Record<string, string> = {
      US: "1", CA: "1", GB: "44", UK: "44", IE: "353",
      AU: "61", NZ: "64", SG: "65", AE: "971", IN: "91",
    };
    const cc = (countryCode || "").toUpperCase();
    if (dial[cc]) {
      s = s.replace(/^0+/, ""); // drop trunk zero
      s = `+${dial[cc]}${s}`;
    } else {
      return null; // no country context — refuse to guess
    }
  }
  // E.164: leading +, 8–15 digits.
  return /^\+\d{8,15}$/.test(s) ? s : null;
}

/** Recipient's local hour (0–23) and a display string, or null if unknown zone. */
function localHour(countryCode: string): { hour: number; label: string } | null {
  const tz = TZ_BY_COUNTRY[(countryCode || "").toUpperCase()];
  if (!tz) return null;
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
      weekday: "short",
    });
    const parts = fmt.formatToParts(new Date());
    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "-1");
    return { hour, label: `${fmt.format(new Date())} (${tz})` };
  } catch {
    return null;
  }
}

/**
 * The gate. Call this before every outbound AI call.
 * Blocks stop the call; warnings are advisory.
 */
export function evaluateCall(lead: Lead): CallDecision {
  const blocks: string[] = [];
  const warnings: string[] = [];
  const cc = (lead.countryCode || "").toUpperCase();

  // 1) Internal do-not-call / opt-out — the hardest stop.
  if (lead.doNotCall || lead.consent?.status === "opted_out") {
    blocks.push("Lead is on the do-not-call list (opted out). Never call.");
  }

  // 2) Consent basis for opt-in markets.
  if (OPT_IN_REQUIRED.has(cc)) {
    if (lead.consent?.status !== "opted_in") {
      blocks.push(
        `No prior opt-in on file for ${lead.country || cc}. AI voice calls here ` +
          `require prior express written consent — capture consent first.`
      );
    } else if (!lead.consent.basis) {
      warnings.push("Opted in, but no lawful-basis note recorded. Add one for the audit trail.");
    }
  } else if (lead.consent?.status === "unknown" || !lead.consent) {
    warnings.push(
      `No consent record for ${lead.country || cc || "this lead"}. Confirm a legitimate ` +
        `basis (existing relationship / inbound request) before calling.`
    );
  }

  // 3) A dialable number.
  const e164 = toE164(lead.phone || "", cc);
  if (!e164) {
    blocks.push(
      lead.phone
        ? `Phone "${lead.phone}" is not a valid E.164 number for ${lead.country || cc}.`
        : "No phone number on file."
    );
  }

  // 4) Calling-hour window (recipient local).
  const lt = localHour(cc);
  let localTime: string | undefined;
  if (lt) {
    localTime = lt.label;
    if (lt.hour < WINDOW_START || lt.hour >= WINDOW_END) {
      blocks.push(
        `Outside the ${WINDOW_START}:00–${WINDOW_END}:00 local calling window ` +
          `(recipient is at ${lt.label}).`
      );
    } else if (lt.hour === WINDOW_START || lt.hour === WINDOW_END - 1) {
      warnings.push(`Near the edge of the calling window (recipient at ${lt.label}).`);
    }
  } else if (cc) {
    warnings.push(`Unknown timezone for ${lead.country || cc}; can't verify calling hours.`);
  }

  // 5) Frequency guard — don't hammer a lead.
  const recentCalls = (lead.calls || []).filter((c) => {
    const days = (Date.now() - new Date(c.at).getTime()) / 86_400_000;
    return days < 14;
  });
  if (recentCalls.length >= 3) {
    blocks.push(`Already called ${recentCalls.length}× in the last 14 days. Back off.`);
  } else if (recentCalls.length >= 1) {
    warnings.push(`Called ${recentCalls.length}× in the last 14 days.`);
  }

  return { allowed: blocks.length === 0, blocks, warnings, e164, localTime };
}

/** Record an opt-out (from a call, email, or manual action) and lock the lead. */
export function optOutPatch(source: string): Partial<Lead> {
  const now = new Date().toISOString();
  return {
    doNotCall: true,
    consent: { status: "opted_out", capturedAt: now, source },
    updatedAt: now,
  };
}

/** Record a positive consent basis. */
export function optInPatch(basis: string, source: string): Partial<Lead> {
  const now = new Date().toISOString();
  return {
    consent: { status: "opted_in", basis, capturedAt: now, source },
    updatedAt: now,
  };
}

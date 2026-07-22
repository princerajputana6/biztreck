// LeadOS — best-available outreach channel resolver.
//
// Given a lead, walk the contact waterfall and return the single best channel to
// reach them right now, plus the full ladder so the UI can show what's available
// and what's missing:
//
//   Email → Call → LinkedIn → Contact Form → Google Business → Research More
//
// Pure and side-effect free so it runs in the client card as well as the server.

import type { Lead } from "./types";

export type ChannelKey =
  | "email"
  | "call"
  | "linkedin"
  | "contact_form"
  | "google_message"
  | "none";

export type ChannelAction = {
  /** How the browser should open it. */
  kind: "mailto" | "tel" | "url";
  href: string;
  /** Whether it should open in a new tab (url kinds only). */
  external: boolean;
};

export type LadderRung = {
  channel: ChannelKey;
  label: string;
  available: boolean;
  /** Short detail shown next to the rung (the value, or why it's missing). */
  hint: string;
};

export type ResolvedChannel = {
  channel: ChannelKey;
  label: string;
  /** One line explaining why this channel was chosen. */
  reason: string;
  action: ChannelAction;
  ladder: LadderRung[];
};

export const CHANNEL_LABEL: Record<ChannelKey, string> = {
  email: "Email",
  call: "Call",
  linkedin: "LinkedIn",
  contact_form: "Contact form",
  google_message: "Google Business",
  none: "Research more",
};

function ensureHttp(url: string): string {
  const u = (url || "").trim();
  if (!u) return "";
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

function telHref(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  return cleaned ? `tel:${cleaned}` : "";
}

function researchHref(lead: Lead): string {
  const q = [lead.businessName, lead.city, lead.country].filter(Boolean).join(" ");
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}

/**
 * Resolve the best channel for a lead following the contact waterfall.
 * `contact_form` availability trusts website analysis when the lead has been
 * analysed (a detected form), and falls back to "has a website" when it hasn't.
 */
export function resolveChannel(lead: Lead): ResolvedChannel {
  const email = (lead.email || "").trim();
  const phone = (lead.phone || "").trim();
  const linkedin = ensureHttp(lead.socials?.linkedin || "");
  const website = ensureHttp(lead.website || "");
  const google = ensureHttp(lead.googleUrl || "");

  // If analysed, believe the detector; otherwise a website means "probably has one".
  const formAvailable = lead.analysis
    ? Boolean(lead.analysis.contactForm)
    : Boolean(website);
  const formHint = lead.analysis
    ? lead.analysis.contactForm
      ? "form detected on site"
      : "no form on site"
    : website
      ? "check website"
      : "no website";

  const ladder: LadderRung[] = [
    { channel: "email", label: "Email", available: Boolean(email), hint: email || "no email on file" },
    { channel: "call", label: "Call", available: Boolean(phone), hint: phone || "no phone on file" },
    { channel: "linkedin", label: "LinkedIn", available: Boolean(linkedin), hint: linkedin ? "profile linked" : "no profile" },
    { channel: "contact_form", label: "Contact form", available: formAvailable, hint: formHint },
    { channel: "google_message", label: "Google Business", available: Boolean(google), hint: google ? "profile available" : "no profile" },
  ];

  const pick = (
    channel: ChannelKey,
    reason: string,
    action: ChannelAction
  ): ResolvedChannel => ({ channel, label: CHANNEL_LABEL[channel], reason, action, ladder });

  if (email) {
    const subject = `Quick idea for ${lead.businessName || "your business"}`;
    return pick("email", "Direct email on file — the highest-intent channel.", {
      kind: "mailto",
      href: `mailto:${email}?subject=${encodeURIComponent(subject)}`,
      external: false,
    });
  }
  if (phone) {
    return pick("call", "No email, but a phone number — call them.", {
      kind: "tel",
      href: telHref(phone),
      external: false,
    });
  }
  if (linkedin) {
    return pick("linkedin", "No email or phone — reach out on LinkedIn.", {
      kind: "url",
      href: linkedin,
      external: true,
    });
  }
  if (formAvailable && website) {
    return pick("contact_form", "No direct contact — use their website contact form.", {
      kind: "url",
      href: website,
      external: true,
    });
  }
  if (google) {
    return pick("google_message", "Only a Google Business profile — message them there.", {
      kind: "url",
      href: google,
      external: true,
    });
  }
  return pick("none", "No contact channel found — research the business further.", {
    kind: "url",
    href: researchHref(lead),
    external: true,
  });
}

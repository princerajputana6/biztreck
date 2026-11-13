// Canonical, locked sender address for ALL outgoing mail.
//
// Every email this app sends must come from a @biztreck.com address (the
// verified domain), defaulting to connect@biztreck.com. If an env var is
// missing or points at a different domain, we ignore it and use the default —
// so this app can never send "from" anything unexpected (e.g. a stray
// parking@… address, which is NOT ours). Accepts either a plain "email" or a
// "Display Name <email>" value and preserves the display name when valid.

const ALLOWED_DOMAIN = "@biztreck.com";
export const DEFAULT_FROM = "connect@biztreck.com";

export function safeFrom(raw?: string): string {
  const v = (raw || "").trim();
  if (!v) return DEFAULT_FROM;
  const angle = v.match(/<([^>]+)>/);
  const email = (angle ? angle[1] : v).trim().toLowerCase();
  return email.endsWith(ALLOWED_DOMAIN) ? v : DEFAULT_FROM;
}

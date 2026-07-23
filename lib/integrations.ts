// Integrations catalog — the providers the admin can connect. Client-safe (no
// secrets, no server imports). Actual credentials live in the `integrations`
// Mongo collection and are never sent back to the browser.

export type IntegrationField = {
  key: string;
  label: string;
  secret?: boolean;
  placeholder?: string;
};

export type IntegrationProvider = {
  key: string;
  name: string;
  category: "Productivity" | "Developer" | "Social";
  desc: string;
  /** What connecting it will unlock, shown to the user. */
  unlocks: string;
  /** "oauth" = one-click sign-in via the app's env credentials; "credentials" = paste a token. */
  authType: "oauth" | "credentials";
  /** For oauth: the route that starts the flow. */
  connectPath?: string;
  fields: IntegrationField[];
  /** Honest note about setup requirements / API limits. */
  note?: string;
};

export const PROVIDERS: IntegrationProvider[] = [
  {
    key: "google",
    name: "Google",
    category: "Productivity",
    desc: "Google Calendar",
    unlocks: "Let the assistant schedule meetings on your calendar.",
    authType: "oauth",
    connectPath: "/api/admin/integrations/google/connect",
    fields: [],
    note: "One-click sign-in. Live meeting scheduling works as soon as you connect.",
  },
  {
    key: "github",
    name: "GitHub",
    category: "Developer",
    desc: "Repositories & issues",
    unlocks: "Reference repos and automate dev-related tasks.",
    authType: "credentials",
    fields: [{ key: "token", label: "Personal access token", secret: true, placeholder: "ghp_…" }],
  },
  {
    key: "linkedin",
    name: "LinkedIn",
    category: "Social",
    desc: "Company & profile data",
    unlocks: "Enrich leads and (manually) reach decision-makers.",
    authType: "credentials",
    fields: [{ key: "token", label: "Access token", secret: true }],
    note: "LinkedIn's API is restricted — scraping/auto-messaging is not permitted without approved app review.",
  },
  {
    key: "instagram",
    name: "Instagram",
    category: "Social",
    desc: "Business profiles",
    unlocks: "Pull business profile signals.",
    authType: "credentials",
    fields: [{ key: "token", label: "Access token", secret: true }],
    note: "Requires a Meta app with Instagram Graph permissions and business accounts.",
  },
  {
    key: "twitter",
    name: "X (Twitter)",
    category: "Social",
    desc: "Posts & profiles",
    unlocks: "Post updates and read public signals.",
    authType: "credentials",
    fields: [
      { key: "apiKey", label: "API key" },
      { key: "apiSecret", label: "API secret", secret: true },
    ],
  },
  {
    key: "facebook",
    name: "Facebook",
    category: "Social",
    desc: "Pages & business",
    unlocks: "Read Page data and post updates.",
    authType: "credentials",
    fields: [{ key: "token", label: "Page access token", secret: true }],
  },
  {
    key: "slack",
    name: "Slack",
    category: "Productivity",
    desc: "Notifications",
    unlocks: "Send pipeline alerts to a channel.",
    authType: "credentials",
    fields: [{ key: "webhookUrl", label: "Incoming webhook URL", secret: true, placeholder: "https://hooks.slack.com/…" }],
  },
];

export const PROVIDER_MAP = Object.fromEntries(PROVIDERS.map((p) => [p.key, p]));
export const PROVIDER_KEYS = PROVIDERS.map((p) => p.key);

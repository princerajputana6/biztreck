// Cloudflare Worker entry: the OpenNext-built Next.js app + a cron handler
// that replaces the Vercel crons (vercel.json). Both cron routes authenticate
// with `Authorization: Bearer ${CRON_SECRET}`, so the scheduled handler calls
// them the same way Vercel Cron did.
// @ts-ignore `.open-next/worker.js` is generated at build time
import { default as handler } from "./.open-next/worker.js";

// Maps each wrangler cron expression to the route it should hit.
const CRON_ROUTES: Record<string, string> = {
  "30 0 * * *": "/api/cron/generate-blogs",
  "0 2 * * *": "/api/cron/leados-maintenance",
};

export default {
  fetch: handler.fetch,

  async scheduled(event: ScheduledEvent, env: Record<string, string>, ctx: ExecutionContext) {
    const path = CRON_ROUTES[event.cron];
    if (!path) return;
    const req = new Request(`https://worker.internal${path}`, {
      headers: { Authorization: `Bearer ${env.CRON_SECRET ?? ""}` },
    });
    ctx.waitUntil(handler.fetch(req, env, ctx));
  },
} satisfies ExportedHandler<Record<string, string>>;

// @ts-ignore re-export Durable Objects used by OpenNext (if any are configured)
export * from "./.open-next/worker.js";

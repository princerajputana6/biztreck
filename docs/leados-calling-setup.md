# LeadOS AI Calling — setup & wiring

A prototype outbound AI voice agent (Retell + Claude context) wired into LeadOS.
It gates every call through compliance, dials the lead, and writes the result
back onto the lead (timeline, stage, call history).

## Files

| File | Role |
|------|------|
| `lib/leados/compliance.ts` | The gate — consent, DNC, E.164, calling window, frequency. `evaluateCall(lead)`. |
| `lib/leados/calling.ts` | Retell client — `placeCall(lead)`, per-lead variables, webhook verify. |
| `app/api/admin/leados/[leadKey]/call/route.ts` | `GET` = dry-run gate; `POST` = place call (admin, `leados` perm). |
| `app/api/webhooks/retell/route.ts` | Receives call_started/ended/analyzed; updates the lead. |
| `docs/retell-agent-prompt.md` | The agent brain to paste into Retell + analysis fields. |
| `lib/leados/types.ts` | `LeadConsent`, `CallRecord`, and `consent`/`doNotCall`/`calls` on `Lead`. |

## Environment variables

```bash
RETELL_API_KEY=key_xxxxxxxx          # Retell dashboard → API keys
RETELL_FROM_NUMBER=+14155550123      # a number you own in Retell (E.164)
RETELL_AGENT_ID=agent_xxxxxxxx       # the published "Aria" agent
RETELL_WEBHOOK_SECRET=some-long-random-string   # optional URL guard
LEADOS_BOOKING_LINK=https://biztreck.world/book # optional, spoken/emailed
```

## Wiring in Retell (one-time)

1. Create the agent, paste the System Prompt from `retell-agent-prompt.md`.
2. Add the 8 Custom Analysis Data fields from that doc.
3. Buy/import a phone number, assign the agent as its outbound agent.
4. Set the agent webhook to
   `https://www.biztreck.world/api/webhooks/retell?s=<RETELL_WEBHOOK_SECRET>`.
5. Put the env vars above into Vercel.

## Try it

```bash
# Dry-run the compliance gate for a lead (no call placed):
curl -s https://www.biztreck.world/api/admin/leados/<leadKey>/call \
  -H "Cookie: <your admin cookie>"

# Place the call (only fires if the gate passes):
curl -s -X POST https://www.biztreck.world/api/admin/leados/<leadKey>/call \
  -H "Cookie: <your admin cookie>"
```

A blocked call returns `409` with `decision.blocks` explaining why — e.g. no
consent on file, outside calling hours, or the lead opted out.

## What's stubbed / next

- **Booking**: the agent captures `best_time` + `contact_email`; wiring that into
  a real calendar (Cal.com / Google Calendar) is the next step. Today it lands as
  `meeting_scheduled` + timeline note for a human to confirm.
- **UI button**: the `call` route is ready; add a "Call with AI" button to
  `LeadProfileClient.tsx` that calls `GET` (show the gate) then `POST`.
- **Consent capture**: set `consent.status = "opted_in"` when a lead comes from an
  inbound form; `optInPatch()` / `optOutPatch()` in `compliance.ts` do this.

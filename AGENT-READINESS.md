# Agent Readiness — current state

Scan (Jul 2026): **Level 4 · Agent-Integrated (60)**. Discoverability 3/4,
Content Accessibility 1/1, Bot Access Control 2/2, Protocol Discovery improving.

## Passing (in code)
robots.txt, sitemap.xml, Link headers, Markdown negotiation, AI crawler rules,
Content Signals, API catalog, Agent Skills index + SKILL.md, WebMCP, llms.txt,
health endpoint.

## Added this round — real & functional agent endpoints
Discovery docs backed by **working** endpoints (nothing fabricated):

| Discovery doc (via rewrite) | Backing endpoint | Route |
|---|---|---|
| `/.well-known/mcp/server-card.json` | `/api/mcp` — MCP JSON-RPC 2.0 (initialize, tools/list, tools/call) | `app/api/mcp/route.ts` |
| `/.well-known/agent-card.json` | `/api/a2a` — A2A JSON-RPC 2.0 (message/send) | `app/api/a2a/route.ts` |
| `/auth.md` | honest "no auth required" doc | `app/api/auth-md/route.ts` |

Both MCP and A2A expose the same real tools from `lib/agent-tools.ts`:
`search_blog`, `get_blog`, `list_open_roles`, `contact_biztreck`.

## Left red on purpose — OAuth/OIDC Discovery & OAuth Protected Resource
Your agent APIs are public, so there is no OAuth authorization server to
describe. Publishing that metadata would advertise a token endpoint that doesn't
exist and break any agent that tries the flow. To turn these green truthfully,
stand up a real OAuth 2.0 server (e.g. a client-credentials issuer + JWKS) — only
worth it if you actually gate agent APIs behind tokens.

## Manual: DNS for AI Discovery (DNS-AID) — Discoverability 3/4 → 4/4
DNS config, not code. In **Cloudflare → DNS**, add SVCB records so agents can
discover your entrypoints via DNS, then enable DNSSEC.

```
; name                            TTL   type  priority  target           params
_index._agents.biztreck.world.    3600  SVCB  1         biztreck.world.  alpn="h2" port=443
_mcp._agents.biztreck.world.      3600  SVCB  1         biztreck.world.  alpn="h2" port=443
_a2a._agents.biztreck.world.      3600  SVCB  1         biztreck.world.  alpn="h2" port=443
```

Per record in Cloudflare's UI: Type = **SVCB**, Name = `_index._agents` (then
`_mcp._agents`, `_a2a._agents`), SvcPriority `1`, TargetName `biztreck.world`,
params `alpn=h2` and `port=443`. If only **HTTPS** record type is offered, use
that with the same params.

Then **DNSSEC**: Cloudflare → DNS → Settings → Enable DNSSEC, and add the DS
record it generates at your domain registrar. Re-scan after propagation.

## Note
`SITE.url` in `lib/site.ts` is `https://biztreck.world`. The MCP/A2A/auth.md docs
reference it, so keep it pointing at the host that actually serves the app.

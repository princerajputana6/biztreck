import { NextRequest, NextResponse } from "next/server";

// Single combined Link header (RFC 8288) advertised on the homepage for agent
// discovery. One header with comma-separated values avoids header-dedup issues.
const HOMEPAGE_LINK = [
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</llms.txt>; rel="service-doc"; type="text/plain"',
  '</.well-known/agent-skills/index.json>; rel="describedby"; type="application/json"',
  '</.well-known/mcp/server-card.json>; rel="service-desc"; type="application/json"',
  '</.well-known/agent-card.json>; rel="service-desc"; type="application/json"',
].join(", ");

// Content negotiation: when an agent requests a page with `Accept: text/markdown`
// (and not HTML), rewrite to /api/md which returns a Markdown representation.
// Browsers always send `text/html`, so they are unaffected.
export function middleware(req: NextRequest) {
  const accept = req.headers.get("accept") || "";
  const wantsMarkdown =
    accept.includes("text/markdown") && !accept.includes("text/html");

  if (wantsMarkdown) {
    const url = req.nextUrl.clone();
    url.pathname = "/api/md";
    url.search = "";
    // Pass the original path via a header — req.url inside the rewritten route
    // handler still reflects the original request, not the rewrite target.
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-md-path", req.nextUrl.pathname);
    const res = NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
    res.headers.set("Vary", "Accept");
    return res;
  }

  const res = NextResponse.next();
  res.headers.append("Vary", "Accept");
  if (req.nextUrl.pathname === "/") {
    res.headers.set("Link", HOMEPAGE_LINK);
  }
  return res;
}

export const config = {
  // Run on content pages only: skip API routes, Next internals, the admin area,
  // well-known paths, and anything with a file extension (assets, sitemap, etc.).
  matcher: ["/((?!api|_next/static|_next/image|admin|\\.well-known|.*\\.).*)"],
};

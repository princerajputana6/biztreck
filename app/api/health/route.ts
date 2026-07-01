import { NextResponse } from "next/server";

export const dynamic = "force-static";

// Lightweight status endpoint referenced by /.well-known/api-catalog.
export function GET() {
  return NextResponse.json({ status: "ok", service: "biztreck-solutions" });
}

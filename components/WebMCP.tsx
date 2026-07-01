"use client";

import { useEffect } from "react";

// WebMCP — exposes Biztreck's key actions to in-browser AI agents via
// navigator.modelContext.registerTool(). Feature-detected, so it is a no-op in
// browsers that don't implement the experimental API.
// Spec: https://webmachinelearning.github.io/webmcp/
export default function WebMCP() {
  useEffect(() => {
    const mc: any = (navigator as any).modelContext;
    if (!mc || typeof mc.registerTool !== "function") return;

    const controller = new AbortController();
    const { signal } = controller;
    const text = (t: string) => ({ content: [{ type: "text", text: t }] });

    const register = (def: any) => {
      try {
        mc.registerTool({ ...def, signal });
      } catch {
        /* experimental API shape may vary; ignore */
      }
    };

    register({
      name: "search_biztreck_blog",
      description:
        "Search Biztreck Solutions blog articles by keyword. Returns matching titles, excerpts and links.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Keyword(s) to search for" },
        },
      },
      async execute(args: { query?: string }) {
        const res = await fetch("/api/blogs");
        const data = await res.json();
        const q = (args?.query || "").toLowerCase();
        const blogs = (data?.blogs || []).filter(
          (b: any) =>
            !q ||
            `${b.title} ${b.excerpt} ${(b.tags || []).join(" ")}`
              .toLowerCase()
              .includes(q)
        );
        if (!blogs.length) return text("No matching blog posts found.");
        return text(
          blogs
            .slice(0, 10)
            .map(
              (b: any) =>
                `- ${b.title} — ${b.excerpt}\n  ${location.origin}/blog/${b.slug}`
            )
            .join("\n")
        );
      },
    });

    register({
      name: "list_biztreck_open_roles",
      description:
        "List current open job positions at Biztreck Solutions with location and type.",
      inputSchema: { type: "object", properties: {} },
      async execute() {
        const res = await fetch("/api/jobs");
        const data = await res.json();
        const jobs = data?.jobs || [];
        if (!jobs.length) return text("No open roles at the moment.");
        return text(
          jobs
            .map(
              (j: any) =>
                `- ${j.title} (${j.department}, ${j.location}, ${j.type})\n  ${location.origin}/careers/${j.slug}`
            )
            .join("\n")
        );
      },
    });

    register({
      name: "contact_biztreck",
      description:
        "Send a project or sales inquiry to Biztreck Solutions. Confirm details with the user before calling.",
      inputSchema: {
        type: "object",
        required: ["name", "email", "message"],
        properties: {
          name: { type: "string" },
          email: { type: "string" },
          message: { type: "string" },
          company: { type: "string" },
          phone: { type: "string" },
          service: { type: "string" },
          budget: { type: "string" },
        },
      },
      async execute(args: Record<string, string>) {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(args),
        });
        const data = await res.json().catch(() => ({}));
        return text(
          data?.ok
            ? "Inquiry sent to the Biztreck team. They'll reply by email."
            : `Could not send inquiry: ${data?.error || res.statusText}`
        );
      },
    });

    return () => controller.abort();
  }, []);

  return null;
}

import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: false,
});

/**
 * Render markdown to HTML.
 *
 * IMPORTANT: this content is admin-authored (AI-generated, gated behind
 * /admin login), so we trust it and skip a heavy sanitizer like DOMPurify
 * that pulls in jsdom and breaks Vercel's serverless bundle.
 *
 * Do NOT use this on user-supplied content (comments, applications) — those
 * are rendered as plain text via React's natural escaping.
 */
export function renderMarkdown(md: string): string {
  if (!md) return "";
  try {
    return marked.parse(md, { async: false }) as string;
  } catch (err) {
    console.error("[markdown] render failed:", err);
    return `<p>${escape(md)}</p>`;
  }
}

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

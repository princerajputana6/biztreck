import Link from "next/link";
import { breadcrumbJsonLd, type Crumb } from "@/lib/seo";

// Visible breadcrumb trail + matching BreadcrumbList JSON-LD.
export default function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  const last = trail[trail.length - 1];
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-400">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-ink">Home</Link>
          </li>
          {trail.map((c) => (
            <li key={c.path} className="flex items-center gap-2">
              <span aria-hidden>/</span>
              {c === last ? (
                <span aria-current="page" className="text-slate-300">{c.name}</span>
              ) : (
                <Link href={c.path} className="hover:text-ink">{c.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(trail)) }}
      />
    </>
  );
}

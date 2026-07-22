import { notFound } from "next/navigation";
import { Check, Download } from "lucide-react";
import { getLeadByShareToken } from "@/lib/leados/db";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

// Private share link — keep it out of search indexes.
export const metadata = {
  title: "Business Audit · Biztreck",
  robots: { index: false, follow: false },
};

export default async function PublicAuditPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const lead = await getLeadByShareToken(token);
  if (!lead || !lead.audit) notFound();
  const a = lead.audit;

  return (
    <div className="min-h-screen bg-slate-100 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-3xl px-5">
        {/* Top bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-blue-700 to-cyan-400 font-extrabold text-white">
              B
            </div>
            <div>
              <div className="font-bold leading-tight">{SITE.name}</div>
              <div className="text-[11px] uppercase tracking-widest text-cyan-700">
                Business Audit
              </div>
            </div>
          </div>
          <a
            href={`/audit/${token}/pdf`}
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            <Download size={15} /> Download PDF
          </a>
        </div>

        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Header */}
          <header className="border-b-4 border-cyan-500 px-7 py-7">
            <h1 className="font-serif text-3xl font-bold tracking-tight">{lead.businessName}</h1>
            <p className="mt-2 font-medium text-cyan-700">{a.headline}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                Website score <span className="font-semibold">{a.websiteScore}/100</span>
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 capitalize">
                Priority <span className="font-semibold">{a.priority}</span>
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                Prepared {new Date(a.generatedAt).toLocaleDateString()}
              </span>
            </div>
          </header>

          <div className="space-y-7 px-7 py-7">
            {/* Executive summary */}
            <section>
              <h2 className="mb-2 text-lg font-bold text-slate-900">Executive Summary</h2>
              <p className="leading-relaxed text-slate-700">{a.executiveSummary}</p>
            </section>

            {/* Sections */}
            {a.sections.map((s) => (
              <section key={s.title} className="border-t border-slate-100 pt-6">
                <h2 className="mb-2 text-lg font-bold text-slate-900">{s.title}</h2>
                {s.summary && <p className="leading-relaxed text-slate-700">{s.summary}</p>}
                {s.points?.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {s.points.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-700">
                        <Check size={16} className="mt-0.5 shrink-0 text-cyan-600" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {/* ROI */}
            <section className="rounded-xl border border-cyan-200 bg-cyan-50 p-5">
              <h2 className="mb-1 text-lg font-bold text-slate-900">Estimated ROI</h2>
              <p className="leading-relaxed text-slate-700">{a.estimatedRoi}</p>
            </section>

            {/* Next steps */}
            {a.nextSteps?.length > 0 && (
              <section>
                <h2 className="mb-2 text-lg font-bold text-slate-900">Recommended Next Steps</h2>
                <ol className="ml-5 list-decimal space-y-1 text-slate-700">
                  {a.nextSteps.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ol>
              </section>
            )}

            {/* CTA */}
            <section className="rounded-xl bg-slate-900 p-6 text-white">
              <p className="text-lg font-semibold">{a.callToAction}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-300">
                <a href={`mailto:${SITE.email}`} className="hover:text-cyan-300">
                  {SITE.email}
                </a>
                <a href={`tel:${SITE.phoneRaw}`} className="hover:text-cyan-300">
                  {SITE.phone}
                </a>
              </div>
            </section>
          </div>
        </article>

        <p className="mt-6 text-center text-xs text-slate-400">
          Prepared by {SITE.name} · {SITE.shortAddress}
        </p>
      </div>
    </div>
  );
}

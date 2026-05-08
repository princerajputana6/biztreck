import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundFX from "@/components/BackgroundFX";
import { getDb } from "@/lib/mongodb";
import { notFound } from "next/navigation";
import Link from "next/link";
import { renderMarkdown } from "@/lib/markdown";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  Banknote,
  Check,
} from "lucide-react";
import ApplyForm from "@/components/ApplyForm";

export const dynamic = "force-dynamic";

async function getJob(slug: string) {
  try {
    const db = await getDb();
    return await db.collection("jobs").findOne({ slug });
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const j = await getJob(params.slug);
  if (!j) return { title: "Role not found · Biztreck" };
  return {
    title: `${j.title} · Careers · Biztreck`,
    description: j.shortDescription,
  };
}

export default async function JobPage({
  params,
}: {
  params: { slug: string };
}) {
  const job = await getJob(params.slug);
  if (!job) notFound();

  const html = renderMarkdown(job.descriptionMarkdown || "");

  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-950">
      <BackgroundFX />
      <Navbar />

      <article className="relative z-10 pt-32 pb-20 sm:pt-36">
        <div className="container-px mx-auto max-w-4xl">
          <Link
            href="/careers"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
          >
            <ArrowLeft size={14} /> All open roles
          </Link>

          <div className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-navy-300">
            {job.department}
          </div>
          <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            {job.title}
          </h1>
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-300">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} className="text-accent-glow" /> {job.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} className="text-accent-glow" /> {job.type}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Briefcase size={14} className="text-accent-glow" />{" "}
              {job.experience}
            </span>
            {job.salary && (
              <span className="inline-flex items-center gap-1.5">
                <Banknote size={14} className="text-accent-glow" /> {job.salary}
              </span>
            )}
          </div>

          <div
            className="prose-blog mt-10"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {Array.isArray(job.responsibilities) && job.responsibilities.length > 0 && (
            <Section title="What you&apos;ll do" items={job.responsibilities} />
          )}
          {Array.isArray(job.requirements) && job.requirements.length > 0 && (
            <Section title="What we&apos;re looking for" items={job.requirements} />
          )}
          {Array.isArray(job.niceToHave) && job.niceToHave.length > 0 && (
            <Section title="Nice to have" items={job.niceToHave} />
          )}
          {Array.isArray(job.benefits) && job.benefits.length > 0 && (
            <Section title="Benefits" items={job.benefits} accent />
          )}

          <div id="apply" className="mt-16">
            <h2 className="font-display text-2xl font-bold text-white">
              Apply for this role
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Tell us about yourself. We read every application.
            </p>
            <ApplyForm jobSlug={job.slug} jobTitle={job.title} />
          </div>
        </div>
      </article>
      <Footer />
    </main>
  );
}

function Section({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent?: boolean;
}) {
  return (
    <section className="mt-12">
      <h2
        className="font-display text-2xl font-bold text-white"
        dangerouslySetInnerHTML={{ __html: title }}
      />
      <ul className="mt-5 space-y-2.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-3 text-slate-300">
            <span
              className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                accent ? "bg-accent-cyan/20" : "bg-navy-700/60"
              }`}
            >
              <Check
                size={12}
                className={accent ? "text-accent-cyan" : "text-accent-glow"}
              />
            </span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

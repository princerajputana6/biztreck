import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundFX from "@/components/BackgroundFX";
import { getDb } from "@/lib/mongodb";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clock, Tag } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Blog & Insights · Biztreck Solutions",
  description:
    "Field notes, tutorials, and opinions from the Biztreck product, design, engineering, and growth team.",
};

async function getBlogs() {
  try {
    const db = await getDb();
    const blogs = await db
      .collection("blogs")
      .find({ published: true }, { projection: { contentMarkdown: 0 } })
      .sort({ createdAt: -1 })
      .limit(60)
      .toArray();
    return blogs.filter((b: any) => b?.slug && b?.title);
  } catch {
    return [];
  }
}

export default async function BlogIndex() {
  const blogs = await getBlogs();
  const [featured, ...rest] = blogs;

  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-950">
      <BackgroundFX />
      <Navbar />
      <section className="relative z-10 pt-36 pb-12 sm:pt-40">
        <div className="container-px">
          <div className="eyebrow">Insights</div>
          <h1 className="mt-5 font-display text-5xl font-extrabold leading-tight text-white sm:text-6xl">
            Field notes from the{" "}
            <span className="gradient-text">Biztreck team.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            Practical playbooks on building, revamping, ranking and scaling
            digital products — written by the people doing the work.
          </p>
        </div>
      </section>

      <section className="relative z-10 pb-24">
        <div className="container-px">
          {blogs.length === 0 ? (
            <div className="glass rounded-3xl p-10 text-center">
              <p className="text-lg text-slate-300">
                No posts published yet. Check back soon.
              </p>
            </div>
          ) : (
            <>
              {featured && (
                <Link
                  href={`/blog/${featured.slug}`}
                  className="group glass relative grid overflow-hidden rounded-3xl lg:grid-cols-2"
                >
                  <div className="relative aspect-[16/10] lg:aspect-auto">
                    {featured.coverImage ? (
                      <Image
                        src={featured.coverImage}
                        alt={featured.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-navy-700 to-accent-cyan" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />
                  </div>
                  <div className="flex flex-col justify-center p-8 sm:p-12">
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-navy-300">
                      <Tag size={12} /> {featured.category} · Featured
                    </div>
                    <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
                      {featured.title}
                    </h2>
                    <p className="mt-4 text-slate-300">{featured.excerpt}</p>
                    <div className="mt-6 flex items-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} /> {featured.readMinutes || 6} min read
                      </span>
                      <span>·</span>
                      <span>
                        {new Date(featured.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <span className="mt-8 inline-flex items-center gap-2 self-start rounded-full bg-navy-800/60 px-5 py-2.5 text-sm font-semibold text-white transition-all group-hover:bg-accent-electric">
                      Read article <ArrowUpRight size={14} />
                    </span>
                  </div>
                </Link>
              )}

              {rest.length > 0 && (
                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((b: any) => (
                    <Link
                      key={String(b._id)}
                      href={`/blog/${b.slug}`}
                      className="group glass overflow-hidden rounded-3xl"
                    >
                      <div className="relative aspect-[16/10]">
                        {b.coverImage ? (
                          <Image
                            src={b.coverImage}
                            alt={b.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-navy-700 to-accent-cyan" />
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-navy-300">
                          {b.category}
                        </div>
                        <h3 className="mt-3 font-display text-xl font-semibold text-white group-hover:text-accent-glow">
                          {b.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                          {b.excerpt}
                        </p>
                        <div className="mt-5 flex items-center gap-3 text-xs text-slate-500">
                          <Clock size={12} /> {b.readMinutes || 6} min ·{" "}
                          {new Date(b.createdAt).toLocaleDateString("en-IN")}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

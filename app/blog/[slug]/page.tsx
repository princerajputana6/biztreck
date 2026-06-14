import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundFX from "@/components/BackgroundFX";
import { getDb } from "@/lib/mongodb";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { renderMarkdown } from "@/lib/markdown";
import { Clock, Tag, ArrowLeft } from "lucide-react";
import Comments from "@/components/Comments";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

async function getBlog(slug: string) {
  try {
    const db = await getDb();
    return await db.collection("blogs").findOne({ slug });
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlog(slug);
  if (!blog) return { title: "Post not found" };
  const url = `${SITE.url}/blog/${blog.slug}`;
  const images = blog.coverImage ? [blog.coverImage] : ["/logo.png"];
  return {
    title: blog.title,
    description: blog.excerpt,
    keywords: Array.isArray(blog.tags) ? blog.tags : undefined,
    authors: blog.author ? [{ name: blog.author }] : undefined,
    alternates: { canonical: `/blog/${blog.slug}` },
    openGraph: {
      type: "article",
      title: blog.title,
      description: blog.excerpt,
      url,
      siteName: SITE.name,
      publishedTime: blog.createdAt ? new Date(blog.createdAt).toISOString() : undefined,
      modifiedTime: blog.updatedAt ? new Date(blog.updatedAt).toISOString() : undefined,
      authors: blog.author ? [blog.author] : undefined,
      tags: Array.isArray(blog.tags) ? blog.tags : undefined,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt,
      images,
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlog(slug);
  if (!blog) notFound();

  const html = renderMarkdown(blog.contentMarkdown || "");

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.excerpt,
    image: blog.coverImage ? [blog.coverImage] : [`${SITE.url}/logo.png`],
    author: { "@type": "Person", name: blog.author || "Biztreck Editorial" },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: { "@type": "ImageObject", url: `${SITE.url}/logo.png` },
    },
    datePublished: blog.createdAt ? new Date(blog.createdAt).toISOString() : undefined,
    dateModified: blog.updatedAt ? new Date(blog.updatedAt).toISOString() : undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE.url}/blog/${blog.slug}` },
    keywords: Array.isArray(blog.tags) ? blog.tags.join(", ") : undefined,
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <BackgroundFX />
      <Navbar />

      <article className="relative z-10 pt-32 pb-20 sm:pt-36">
        <div className="container-px mx-auto max-w-4xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
          >
            <ArrowLeft size={14} /> All posts
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-navy-300">
            <span className="inline-flex items-center gap-1.5">
              <Tag size={12} /> {blog.category}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={12} /> {blog.readMinutes || 6} min read
            </span>
            <span>·</span>
            <span>
              {new Date(blog.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            {blog.title}
          </h1>

          <p className="mt-5 text-lg text-slate-300">{blog.excerpt}</p>

          {blog.coverImage && (
            <div className="relative mt-10 overflow-hidden rounded-3xl border border-navy-700/40">
              <div className="relative aspect-[16/8]">
                <Image
                  src={blog.coverImage}
                  alt={blog.title}
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          )}

          <div
            className="prose-blog mt-12"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {Array.isArray(blog.tags) && blog.tags.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2">
              {blog.tags.map((t: string) => (
                <span
                  key={t}
                  className="rounded-full border border-navy-700/50 bg-navy-800/40 px-3 py-1 text-xs text-slate-300"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-12 flex items-center gap-3 rounded-2xl border border-navy-700/40 bg-navy-800/30 p-5">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-navy-500 to-accent-cyan font-bold text-white">
              {(blog.author || "B").charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-white">
                {blog.author || "Biztreck Editorial"}
              </div>
              <div className="text-sm text-slate-400">Biztreck Solutions team</div>
            </div>
          </div>

          <Comments slug={blog.slug} />
        </div>
      </article>
      <Footer />
    </main>
  );
}

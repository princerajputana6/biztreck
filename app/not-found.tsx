import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you are looking for does not exist. Browse Biztreck Solutions services, industries and resources.",
  robots: { index: false, follow: true },
};

const LINKS = [
  { href: "/solutions", label: "Solutions" },
  { href: "/industries", label: "Industries" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/faq", label: "FAQ" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-950">
      <Navbar />
      <section className="container-px relative z-10 pt-40 pb-24 text-center">
        <div className="eyebrow">Error 404</div>
        <h1 className="section-title mt-5 text-ink">This page does not exist</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-300">
          The link may be outdated or mistyped. Start from one of these pages instead.
        </p>
        <nav aria-label="Helpful links" className="mt-10 flex flex-wrap justify-center gap-3">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-full border border-navy-700 px-5 py-2 text-sm text-ink hover:border-accent-cyan">
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href="/" className="mt-10 inline-block text-sm text-accent-cyan underline">Back to home</Link>
      </section>
      <Footer />
    </main>
  );
}

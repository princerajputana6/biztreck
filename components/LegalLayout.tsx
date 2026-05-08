import Navbar from "./Navbar";
import Footer from "./Footer";
import BackgroundFX from "./BackgroundFX";

export default function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-950">
      <BackgroundFX />
      <Navbar />
      <section className="relative z-10 pt-36 pb-20 sm:pt-40">
        <div className="container-px">
          <div className="mx-auto max-w-3xl">
            <div className="eyebrow">Legal</div>
            <h1 className="mt-5 font-display text-4xl font-extrabold text-white sm:text-5xl">
              {title}
            </h1>
            <p className="mt-3 text-sm text-slate-400">Last updated: {updated}</p>
            <div className="prose-legal mt-10 space-y-5 text-slate-300 leading-relaxed">
              {children}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

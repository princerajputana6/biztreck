import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone, Timer } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundFX from "@/components/BackgroundFX";
import LeadForm from "@/components/LeadForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Biztreck — Talk to a Software & Automation Partner",
  description:
    "Get in touch with Biztreck Solutions. Book a strategy call, message us on WhatsApp, or email us — we reply within one business day.",
  keywords: ["contact biztreck", "software development enquiry", "book software consultation"],
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    title: "Contact Biztreck Solutions",
    description: "Book a strategy call, WhatsApp us, or send an email. We reply within one business day.",
    url: `${SITE.url}/contact`,
  },
};

export default function ContactPage() {
  const whatsapp = `https://wa.me/${SITE.phoneRaw.replace("+", "")}`;

  const channels = [
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: SITE.phone,
      href: whatsapp,
      hint: "Fastest for a quick question",
    },
    {
      icon: Mail,
      label: "Email",
      value: SITE.email,
      href: `mailto:${SITE.email}`,
      hint: "Best for detailed requirements",
    },
    {
      icon: Phone,
      label: "Phone",
      value: SITE.phone,
      href: `tel:${SITE.phoneRaw}`,
      hint: "During business hours",
    },
  ];

  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    url: `${SITE.url}/contact`,
    mainEntity: {
      "@type": "Organization",
      name: SITE.name,
      email: SITE.email,
      telephone: SITE.phone,
      address: { "@type": "PostalAddress", addressLocality: SITE.shortAddress, addressCountry: "IN" },
    },
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-950">
      <BackgroundFX />
      <Navbar />

      <section className="relative z-10 container-px pt-32 sm:pt-40">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="eyebrow">Get in touch</div>
            <h1 className="section-title mt-5 text-white">
              Talk to a <span className="gradient-text">real engineer</span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-300">
              No call centre, no qualification gauntlet. Tell us what you&apos;re
              trying to solve and you&apos;ll hear back from someone who can
              actually scope it.
            </p>

            <div className="mt-10 space-y-3">
              {channels.map((c) => {
                const Icon = c.icon;
                return (
                  <a
                    key={c.label}
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel={c.href.startsWith("http") ? "noreferrer" : undefined}
                    className="group flex items-center gap-4 rounded-2xl border border-navy-700/40 bg-navy-900/40 p-5 transition-colors hover:border-accent-electric"
                  >
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-navy-500 to-navy-700 shadow-glow">
                      <Icon size={18} className="text-accent-glow" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white">{c.label}</div>
                      <div className="truncate text-sm text-slate-300">{c.value}</div>
                      <div className="mt-0.5 text-xs text-slate-500">{c.hint}</div>
                    </div>
                  </a>
                );
              })}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-navy-700/40 bg-navy-900/40 p-5">
                <Clock size={18} className="text-accent-cyan" />
                <div className="mt-2 text-sm font-semibold text-white">Business hours</div>
                <p className="mt-1 text-sm text-slate-300">
                  Mon–Fri, 09:00–19:00 IST. Overlap hours arranged for US, UK and
                  AU clients.
                </p>
              </div>
              <div className="rounded-2xl border border-navy-700/40 bg-navy-900/40 p-5">
                <Timer size={18} className="text-accent-cyan" />
                <div className="mt-2 text-sm font-semibold text-white">Response time</div>
                <p className="mt-1 text-sm text-slate-300">
                  Within one business day, usually much sooner.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-navy-700/40 bg-navy-900/40 p-5">
              <MapPin size={18} className="text-accent-cyan" />
              <div className="mt-2 text-sm font-semibold text-white">Head office</div>
              <p className="mt-1 text-sm text-slate-300">{SITE.address}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.address)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm text-accent-glow hover:text-white"
              >
                View on Google Maps →
              </a>
            </div>

            <p className="mt-8 text-sm text-slate-400">
              Prefer a scheduled conversation?{" "}
              <Link href="/book-strategy-call" className="text-accent-glow hover:text-white">
                Book a strategy call
              </Link>
              .
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-navy-700/40 bg-gradient-to-b from-navy-850/60 to-navy-900/40 p-8 sm:p-10">
              <h2 className="font-display text-2xl font-bold text-white">
                Send us a message
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Five fields. We reply within one business day.
              </p>
              <div className="mt-8">
                <LeadForm
                  service="Contact"
                  submitLabel="Send message"
                  messageLabel="How can we help?"
                  messagePlaceholder="Tell us what you're trying to solve, and roughly where you are in the process."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="h-24" />
      </section>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
    </main>
  );
}

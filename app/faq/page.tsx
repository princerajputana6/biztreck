import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundFX from "@/components/BackgroundFX";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ — Pricing, Timelines, Ownership, Security & Support",
  description:
    "Answers to the questions businesses actually ask before commissioning custom software: pricing, timelines, code ownership, maintenance, AI, security, integrations and hosting.",
  keywords: [
    "custom software pricing",
    "software development timeline",
    "software code ownership",
    "software maintenance cost",
    "AI automation security",
  ],
  alternates: { canonical: "/faq" },
  openGraph: {
    type: "website",
    title: "FAQ — Biztreck Solutions",
    description:
      "Pricing, timelines, ownership, maintenance, support, technology, AI, security, process, integrations and hosting.",
    url: `${SITE.url}/faq`,
  },
};

const groups: { title: string; faqs: { q: string; a: string }[] }[] = [
  {
    title: "Pricing",
    faqs: [
      {
        q: "How much does custom software cost?",
        a: "Most focused first releases land between USD 15,000 and USD 60,000 depending on scope, integrations and compliance requirements. Websites typically run USD 5,000–20,000, a single automation or integration USD 5,000–20,000, and a first ERP module USD 25,000–60,000. You get a fixed price for a defined phase after a discovery call.",
      },
      {
        q: "Do you work fixed-price or time and materials?",
        a: "Fixed price per phase. We scope a phase tightly, quote it, and hold that price. If scope changes mid-phase we raise a written change request rather than quietly billing more.",
      },
      {
        q: "Do you require a deposit?",
        a: "Yes, typically an initial milestone payment to begin, then milestone-based billing through delivery. Payment terms are set out in the service agreement before work starts.",
      },
      {
        q: "Are there ongoing licence fees?",
        a: "No. You own what we build, so there is no per-seat or per-year licence to keep using it. Your only ongoing costs are hosting, any third-party services you choose, and optional support.",
      },
      {
        q: "Can we start small to test the relationship?",
        a: "We prefer it. A small first phase that solves one expensive problem is a better test than any sales process, and it means both sides know what they are committing to before the larger work.",
      },
    ],
  },
  {
    title: "Timelines",
    faqs: [
      {
        q: "How long does a project take?",
        a: "Websites typically launch in 4–8 weeks. A useful first release of custom software ships in 8–16 weeks. A first ERP module runs 10–14 weeks. Integrations and automations are usually 3–8 weeks.",
      },
      {
        q: "How quickly can you start?",
        a: "Usually within one to three weeks of agreement, depending on current commitments. We will tell you our real availability rather than promising an immediate start and then queuing you.",
      },
      {
        q: "What causes projects to run late?",
        a: "In our experience, almost always one of three things: delayed client feedback or approvals, third-party dependencies that behave differently than documented, or scope added mid-phase. We flag all three early and track them explicitly.",
      },
      {
        q: "Will we see progress before the end?",
        a: "Yes. You get working previews at every milestone, not a status report. If something is drifting you will see it in the software long before a deadline.",
      },
    ],
  },
  {
    title: "Ownership",
    faqs: [
      {
        q: "Do we own the source code?",
        a: "Yes. On full payment for a milestone you own the source code and custom assets outright, delivered in your own repository. There is no lock-in.",
      },
      {
        q: "What about the tools and libraries you reuse?",
        a: "We retain ownership of our pre-existing internal tooling, libraries and general know-how, and may reuse non-confidential, non-client-specific components elsewhere. This never restricts your ownership of your system.",
      },
      {
        q: "Can we take the project to another developer later?",
        a: "Yes, and we write code on the assumption that you might. Standard frameworks, documented setup, and no proprietary layer you would need us to maintain.",
      },
      {
        q: "Who owns the data?",
        a: "You do, always. We process it to deliver the engagement and nothing else, under a signed agreement.",
      },
    ],
  },
  {
    title: "Maintenance & support",
    faqs: [
      {
        q: "What happens after launch?",
        a: "Every build includes a warranty period covering defects against the agreed scope. Beyond that, most clients keep a support and improvement retainer, because the highest-value changes are the ones you discover once real users are in the system.",
      },
      {
        q: "How much does ongoing support cost?",
        a: "Retainers are sized to the system and the response times you need. Small systems often need only a few hours a month; larger operational platforms need more. We size it from actual usage rather than a standard package.",
      },
      {
        q: "Is support mandatory?",
        a: "No. You own the code and can maintain it yourself or with another team. A retainer is an option, not a condition of the build.",
      },
      {
        q: "What are your support response times?",
        a: "Within one business day for standard requests. Retainer clients with operational systems get agreed response targets for critical issues, defined in the retainer.",
      },
    ],
  },
  {
    title: "Technology",
    faqs: [
      {
        q: "What technology do you build on?",
        a: "Primarily TypeScript across the stack — Next.js and React on the front end, Node.js on the back end, PostgreSQL or MongoDB for data, hosted on AWS, Vercel or Cloudflare. We use Python where the work is data or ML heavy.",
      },
      {
        q: "Why those choices?",
        a: "They are mainstream, well-documented and widely staffed, which matters more than novelty. You should be able to hire for or hand over your system without hunting for a specialist in something obscure.",
      },
      {
        q: "Can you work with our existing stack?",
        a: "Usually yes. Where you already have a working platform we extend or integrate with it rather than proposing a rewrite for our own convenience.",
      },
      {
        q: "Do you build mobile apps?",
        a: "Yes, typically React Native for cross-platform, or a well-built responsive web app where that genuinely serves the use case better and costs less to maintain.",
      },
    ],
  },
  {
    title: "AI",
    faqs: [
      {
        q: "Is our data used to train public AI models?",
        a: "No. We use enterprise API tiers where your data is not used for model training, and can architect for data residency or self-hosted models where regulation or client contracts require it.",
      },
      {
        q: "What if the AI gives a wrong answer?",
        a: "We design for that. Responses are grounded in your own approved content rather than general model knowledge, low-confidence cases route to a human, and anything consequential sits behind human approval by default.",
      },
      {
        q: "Is AI always the right answer?",
        a: "No, and we will tell you when it is not. A well-defined rule or a simple integration is often more reliable and far cheaper than a language model. We recommend the boring option when the boring option wins.",
      },
      {
        q: "How do you measure whether AI automation worked?",
        a: "We agree the metric before the pilot — usually hours saved, first-response time, or documents processed per hour — and instrument the system to report it. If the pilot misses the threshold, we say so.",
      },
    ],
  },
  {
    title: "Security",
    faqs: [
      {
        q: "How do you handle security?",
        a: "Encryption in transit and at rest, role-based access control with authorisation checks on every request, audit logging, dependency scanning, and secrets kept out of source control. Security requirements are scoped during discovery rather than retrofitted.",
      },
      {
        q: "Can you meet HIPAA, GDPR or similar obligations?",
        a: "We design to the relevant controls — access control, encryption, audit trails, retention and data residency. We are engineers rather than your compliance auditor, so we build to the requirements your advisors define.",
      },
      {
        q: "Where is our data hosted?",
        a: "In the region you require. We commonly deploy to US, EU, UK, Australian or Indian regions depending on client and regulatory needs.",
      },
      {
        q: "Do you do penetration testing?",
        a: "We run security review and dependency scanning as standard. For systems handling sensitive data we recommend an independent penetration test, which we can coordinate and then remediate against.",
      },
    ],
  },
  {
    title: "Process",
    faqs: [
      {
        q: "How does an engagement start?",
        a: "A 30-minute discovery call, then a business audit that maps your workflows and quantifies the opportunity. Only after that do we propose scope, cost and sequence — so the proposal is based on evidence rather than assumptions.",
      },
      {
        q: "What do you need from us?",
        a: "A single empowered point of contact, timely feedback on previews, access to the systems in scope, and honesty about how work really happens — including the workarounds.",
      },
      {
        q: "How do you handle changes mid-project?",
        a: "Through a written change request estimating effort, cost and timeline impact, approved before work begins. No silent scope creep in either direction.",
      },
      {
        q: "What if we are not happy with the work?",
        a: "Milestone-based delivery means you are reviewing working software throughout, so problems surface early rather than at the end. If a milestone does not meet the agreed scope, we fix it before it is billed as complete.",
      },
    ],
  },
  {
    title: "Integrations",
    faqs: [
      {
        q: "Can you integrate with our existing systems?",
        a: "Usually yes. We routinely integrate accounting platforms, CRMs, ERPs, payment providers, email, telematics and industry-specific systems via API.",
      },
      {
        q: "What if a system has no API?",
        a: "There are still options: scheduled file import and export, database-level integration, vendor middleware, or a controlled migration. We assess this during the audit before promising anything.",
      },
      {
        q: "What happens when a third-party service goes down?",
        a: "We design for it — queued retries, idempotent writes so nothing double-posts, alerting when something stalls, and a documented reconciliation path. An outage becomes a delay rather than a data-integrity incident.",
      },
    ],
  },
  {
    title: "Hosting",
    faqs: [
      {
        q: "Who hosts the system?",
        a: "Usually you do, in your own cloud account, so you retain full control and the billing relationship. We set it up, document it, and can manage it under a retainer if you prefer.",
      },
      {
        q: "What does hosting cost?",
        a: "For most small and mid-sized systems, typically USD 20–200 per month depending on traffic, data volume and redundancy requirements. We estimate it during solution design so there are no surprises.",
      },
      {
        q: "Do you handle backups and monitoring?",
        a: "Yes. Automated backups, uptime and error monitoring, and alerting are part of a production launch rather than an upsell.",
      },
    ],
  },
];

export default function FaqPage() {
  const allFaqs = groups.flatMap((g) => g.faqs);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-950">
      <BackgroundFX />
      <Navbar />

      <article className="relative z-10 container-px pt-32 sm:pt-40">
        <header className="max-w-3xl">
          <div className="eyebrow">{allFaqs.length} questions answered</div>
          <h1 className="section-title mt-5 text-white">
            Frequently asked <span className="gradient-text">questions</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-300">
            The questions businesses actually ask before commissioning software —
            answered directly, including the ones where the honest answer is
            &ldquo;you probably don&apos;t need us for that&rdquo;.
          </p>
        </header>

        <nav className="mt-10 flex flex-wrap gap-2" aria-label="FAQ topics">
          {groups.map((g) => (
            <a
              key={g.title}
              href={`#${g.title.toLowerCase().replace(/[^a-z]+/g, "-")}`}
              className="rounded-full border border-navy-700/60 bg-navy-900/60 px-4 py-2 text-sm text-slate-200 transition-colors hover:border-accent-electric hover:text-white"
            >
              {g.title}
            </a>
          ))}
        </nav>

        {groups.map((g) => (
          <section
            key={g.title}
            id={g.title.toLowerCase().replace(/[^a-z]+/g, "-")}
            className="mt-16 max-w-3xl scroll-mt-28"
          >
            <h2 className="font-display text-2xl font-bold text-white">
              {g.title}
            </h2>
            <div className="mt-6 space-y-4">
              {g.faqs.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-2xl border border-navy-700/40 bg-navy-900/40 p-6"
                >
                  <summary className="cursor-pointer list-none font-display text-lg font-semibold text-white">
                    {f.q}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ))}

        <section className="my-24 rounded-3xl border border-navy-700/40 bg-gradient-to-br from-navy-850/80 to-navy-900/60 p-10 text-center sm:p-14">
          <h2 className="font-display text-3xl font-bold text-white">
            Still have a question?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Ask it on a 30-minute strategy call. You&apos;ll get a straight
            answer, whether or not it leads to a project.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/book-strategy-call" className="btn-primary shine">
              Book Strategy Call <ArrowRight size={16} className="ml-1 inline" />
            </Link>
            <Link href="/contact" className="btn-ghost">
              Contact us
            </Link>
          </div>
        </section>
      </article>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </main>
  );
}

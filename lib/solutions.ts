// Solution landing-page content. Each entry becomes an indexable page at
// /solutions/<slug> with its own metadata + JSON-LD. Positioning targets growing
// SMBs (10-250 staff, $1M-$50M revenue) in the US, Canada, UK, Australia, NZ,
// Singapore and the UAE looking for custom software, AI and automation partners.

export type Faq = { q: string; a: string };

export type CaseStudy = {
  industry: string;
  challenge: string;
  solution: string;
  tech: string[];
  timeline: string;
  results: string[];
};

export type Solution = {
  slug: string;
  name: string; // short label (nav, cards, schema)
  h1: string; // on-page H1
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  serviceType: string; // schema.org serviceType
  tagline: string;
  /** One-line problem → solution → outcome, used on homepage/index cards. */
  card: { problem: string; solution: string; outcome: string };
  intro: string[];
  problems: string[];
  businessImpact: { label: string; desc: string }[];
  approach: string[];
  features: { title: string; desc: string }[];
  process: { step: string; desc: string }[];
  tech: string[];
  outcomes: string[];
  caseStudy: CaseStudy;
  faqs: Faq[];
  related: string[];
};

export const SOLUTIONS: Solution[] = [
  // ---------------------------------------------------------------- 1
  {
    slug: "custom-software",
    name: "Custom Software Development",
    h1: "Custom Software Development for Growing Businesses",
    metaTitle: "Custom Software Development Company | Biztreck Solutions",
    metaDescription:
      "Biztreck builds custom software for growing businesses in the US, UK, Canada, Australia and UAE — replacing spreadsheets and disconnected tools with software built around how you actually operate.",
    keywords: [
      "custom software development company",
      "bespoke software development",
      "custom business application development",
      "replace spreadsheets with software",
      "custom software for SMB",
      "offshore software development partner",
    ],
    serviceType: "Custom software development",
    tagline: "Software built around your business — not the other way around.",
    card: {
      problem: "Your team runs the business on spreadsheets and off-the-shelf tools that almost fit.",
      solution: "Custom software modelled on your real workflows, integrated with the systems you already use.",
      outcome: "Less manual work, fewer errors, and a platform that scales as you grow.",
    },
    intro: [
      "Most growing businesses outgrow their tools long before they replace them. Work gets held together with spreadsheets, shared inboxes, and a patchwork of SaaS products that were never designed to talk to each other. It works — until headcount, order volume, or compliance requirements make it stop working.",
      "Biztreck builds custom software that models how your business actually operates. Not a generic platform you bend your process around, but a system designed for your workflows, your data, and your team — integrated with the tools you already depend on.",
    ],
    problems: [
      "Critical processes live in spreadsheets that only one person fully understands",
      "Staff re-key the same data into three or four different systems",
      "Off-the-shelf software covers 70% of your process and blocks the other 30%",
      "No single source of truth, so reporting means manual consolidation",
      "Approvals happen over email and get lost or delayed",
      "Growth means hiring more admin staff instead of scaling throughput",
    ],
    businessImpact: [
      { label: "Wasted payroll", desc: "Skilled staff spend hours a week on copy-paste work that software should handle." },
      { label: "Costly errors", desc: "Manual re-entry creates billing, inventory and compliance mistakes that are expensive to unwind." },
      { label: "Slow decisions", desc: "Leadership waits days for numbers that should be available in real time." },
      { label: "Capped growth", desc: "Every new client or order adds admin load, so margins shrink as you scale." },
    ],
    approach: [
      "We start with your process, not our tech stack. A short discovery engagement maps how work actually moves through your business — including the workarounds people have quietly invented — and identifies where software removes the most friction.",
      "Then we build in short, reviewable increments. You see working software early and often, so scope stays honest and the system that ships is the one your team will actually use.",
    ],
    features: [
      { title: "Workflow-accurate design", desc: "Screens and logic modelled on how your team really works, including the exceptions." },
      { title: "Single source of truth", desc: "One authoritative data model, so reporting stops being a reconciliation exercise." },
      { title: "Role-based access", desc: "Granular permissions so staff, managers, clients and vendors each see only what they should." },
      { title: "Integrations", desc: "Connected to your accounting, CRM, email, payments and any API you depend on." },
      { title: "Audit trails", desc: "Every change logged and attributable — essential for finance, healthcare and regulated work." },
      { title: "Built to extend", desc: "Modular architecture so new modules ship without rewriting what already works." },
    ],
    process: [
      { step: "Discovery call", desc: "A focused conversation about where work slows down and what growth is blocked by." },
      { step: "Business audit", desc: "We map current workflows, systems and data, then quantify the opportunity." },
      { step: "Solution design", desc: "Architecture, data model, and a phased roadmap with clear costs and milestones." },
      { step: "Build & review", desc: "Iterative development with working previews at every milestone." },
      { step: "Launch & improve", desc: "Migration, training, and ongoing iteration once real usage data arrives." },
    ],
    tech: ["TypeScript", "Next.js", "React", "Node.js", "PostgreSQL", "MongoDB", "AWS", "Cloudflare"],
    outcomes: [
      "Manual admin work reduced substantially across affected teams",
      "One system of record instead of scattered spreadsheets",
      "Faster, more reliable reporting for leadership",
      "Headcount freed for revenue work instead of data entry",
    ],
    caseStudy: {
      industry: "Manufacturing",
      challenge:
        "A mid-sized manufacturer tracked production scheduling, materials and QA sign-off across six spreadsheets and a shared drive. Two staff spent most of their week consolidating data, and month-end reporting took four days.",
      solution:
        "A custom production management platform with a unified data model covering jobs, materials, machine capacity and QA checkpoints, plus dashboards for shop-floor and management views.",
      tech: ["Next.js", "Node.js", "PostgreSQL", "AWS"],
      timeline: "14 weeks to first production release, phased rollout over 4 months",
      results: [
        "Month-end reporting reduced from four days to same-day",
        "Manual consolidation work largely eliminated",
        "Two full-time staff redeployed from data entry to planning",
        "Full audit trail on QA sign-off for customer compliance",
      ],
    },
    faqs: [
      {
        q: "How much does custom software cost?",
        a: "Most focused first releases land between USD 15,000 and USD 60,000 depending on scope, integrations and compliance needs. Larger platforms run higher. We scope a fixed price for a defined phase after a discovery call, so you are never signing an open-ended contract.",
      },
      {
        q: "How long does it take to build?",
        a: "A useful first release typically ships in 8-16 weeks. We deliberately scope a phase one that solves your most expensive problem first, then extend — rather than disappearing for a year and hoping the requirements held.",
      },
      {
        q: "Do we own the source code?",
        a: "Yes. On full payment for a milestone you own the source code and custom assets outright, delivered in your own repository. There is no lock-in and no licence fee to keep using what we built.",
      },
      {
        q: "Should we build custom or buy off-the-shelf?",
        a: "Buy when your process is genuinely standard — accounting and payroll are good examples. Build when the process is how you compete, or when the off-the-shelf option forces expensive workarounds. We will tell you honestly if a product already solves your problem.",
      },
      {
        q: "Can you integrate with our existing systems?",
        a: "Yes. We routinely integrate with accounting platforms, CRMs, ERPs, payment providers, email, and industry-specific systems via API. Where no API exists we discuss scheduled imports or a migration path.",
      },
      {
        q: "What happens after launch?",
        a: "Every build includes a warranty period for defects. Beyond that most clients keep a support and improvement retainer, because the highest-value changes are the ones you discover after real users are in the system.",
      },
    ],
    related: ["crm-development", "business-automation", "dashboard-development"],
  },

  // ---------------------------------------------------------------- 2
  {
    slug: "ai-automation",
    name: "AI Automation",
    h1: "AI Automation That Removes Real Operational Work",
    metaTitle: "AI Automation Services for Business | Biztreck Solutions",
    metaDescription:
      "AI chatbots, assistants, document processing and workflow automation built into your real systems. Biztreck helps growing businesses cut manual work with practical, measurable AI.",
    keywords: [
      "AI automation services",
      "AI automation for business",
      "AI chatbot development",
      "AI document processing",
      "business AI integration",
      "AI workflow automation company",
    ],
    serviceType: "AI automation",
    tagline: "Practical AI applied to the work that actually costs you money.",
    card: {
      problem: "Your team spends hours on repetitive reading, replying, sorting and summarising.",
      solution: "AI assistants and document pipelines wired into your real systems and data.",
      outcome: "Faster response times and staff hours returned to higher-value work.",
    },
    intro: [
      "Most AI projects fail for an unglamorous reason: they are built as demos rather than as part of an operational workflow. A chatbot that cannot see your order system, or a summariser nobody's process depends on, produces novelty rather than savings.",
      "Biztreck builds AI into the work. We target the specific, repetitive, high-volume tasks that consume your team's hours — support triage, document handling, data extraction, drafting — and connect the AI to your actual systems so the output goes somewhere useful.",
    ],
    problems: [
      "Support agents answer the same questions dozens of times a day",
      "Invoices, POs and forms are read and re-keyed by hand",
      "Enquiries sit unanswered outside business hours and go cold",
      "Staff manually summarise calls, tickets and documents",
      "Data extraction from PDFs and emails is slow and error-prone",
      "Nobody has time to categorise, tag or route the incoming queue",
    ],
    businessImpact: [
      { label: "Slow response", desc: "Leads and tickets that wait hours convert materially worse than those answered in minutes." },
      { label: "Expensive reading", desc: "Skilled staff spend hours extracting data that a document pipeline handles in seconds." },
      { label: "Inconsistent quality", desc: "Answers vary by whoever picks up the ticket, so customer experience is uneven." },
      { label: "Unscalable support", desc: "Volume growth means proportional headcount growth instead of better margins." },
    ],
    approach: [
      "We start by finding where AI is genuinely cheaper and better than the status quo — and by saying so when it is not. Automation of a well-defined rule is often more reliable and far cheaper than a language model.",
      "Where AI does fit, we build it with guardrails: grounded in your own content and data, with confidence thresholds, human review on anything consequential, and logging so you can audit what the system did and why.",
    ],
    features: [
      { title: "AI support assistant", desc: "Answers grounded in your documentation and order data, with clean handover to a human." },
      { title: "Document processing", desc: "Extract structured data from invoices, POs, contracts and forms into your systems." },
      { title: "Internal AI assistants", desc: "Let staff query policies, history and records in plain language instead of hunting." },
      { title: "Drafting & summarisation", desc: "First-draft replies, call summaries and report narratives for humans to approve." },
      { title: "Intelligent routing", desc: "Classify and route incoming enquiries to the right person or queue automatically." },
      { title: "Human-in-the-loop", desc: "Review steps and confidence thresholds so nothing consequential ships unchecked." },
    ],
    process: [
      { step: "Opportunity audit", desc: "We identify which tasks are high-volume, repetitive and safe to automate." },
      { step: "Feasibility & ROI", desc: "An honest estimate of accuracy, cost per run and hours saved before you commit." },
      { step: "Pilot", desc: "A narrow, measurable pilot on one workflow with a clear success threshold." },
      { step: "Integrate", desc: "Wire the proven pilot into your live systems with monitoring and fallbacks." },
      { step: "Measure & expand", desc: "Track accuracy and hours saved, then extend to the next workflow." },
    ],
    tech: ["OpenAI", "Claude", "LangChain", "Python", "Node.js", "Vector databases", "PostgreSQL", "AWS"],
    outcomes: [
      "First-response times cut from hours to seconds on common enquiries",
      "Document handling time reduced dramatically per document",
      "Consistent, policy-accurate answers regardless of who is on shift",
      "Support volume absorbed without proportional hiring",
    ],
    caseStudy: {
      industry: "Professional services",
      challenge:
        "A firm received a high daily volume of client emails requiring document collection and status updates. Two coordinators spent most of each day reading, classifying and replying, and out-of-hours enquiries waited until morning.",
      solution:
        "An AI triage and drafting layer that classifies inbound email, extracts required details, drafts a grounded reply for human approval, and auto-answers status questions from the case system.",
      tech: ["OpenAI", "Node.js", "PostgreSQL", "Vector search"],
      timeline: "7 weeks from pilot to production",
      results: [
        "Out-of-hours enquiries answered immediately instead of next morning",
        "Coordinator time on triage reduced substantially",
        "Consistent replies grounded in current policy documents",
        "Full log of every AI action for compliance review",
      ],
    },
    faqs: [
      {
        q: "Is our data used to train public AI models?",
        a: "No. We use enterprise API tiers where your data is not used for model training, and we can architect for data residency or self-hosted models where regulation or client contracts require it.",
      },
      {
        q: "What if the AI gives a wrong answer?",
        a: "We design for that. Answers are grounded in your own approved content rather than general model knowledge, low-confidence cases route to a human, and anything consequential — money, legal, medical — sits behind human approval by default.",
      },
      {
        q: "How much does AI automation cost?",
        a: "A focused pilot on one workflow typically runs USD 6,000-20,000. Ongoing model usage is usually a modest monthly cost relative to the labour saved. We estimate both before you commit.",
      },
      {
        q: "Do we need to replace our current systems first?",
        a: "No. Most of our AI work layers on top of existing systems through APIs. Replacing core systems is a separate decision, and often not necessary to get value from automation.",
      },
      {
        q: "How do you measure whether it worked?",
        a: "We agree the metric before the pilot — usually hours saved, first-response time, or documents processed per hour — and instrument the system to report it. If the pilot misses the threshold, we say so.",
      },
      {
        q: "Can AI work with our industry's compliance requirements?",
        a: "Often yes, with the right architecture: audit logging, human approval gates, data residency, and retention controls. We scope compliance constraints during discovery rather than discovering them at launch.",
      },
    ],
    related: ["business-automation", "custom-software", "customer-portals"],
  },

  // ---------------------------------------------------------------- 3
  {
    slug: "business-automation",
    name: "Business Process Automation",
    h1: "Business Process Automation & Systems Integration",
    metaTitle: "Business Process Automation Services | Biztreck Solutions",
    metaDescription:
      "Connect disconnected systems and automate manual workflows. Biztreck builds API integrations, approval flows and data synchronisation for growing businesses worldwide.",
    keywords: [
      "business process automation services",
      "workflow automation company",
      "API integration services",
      "CRM ERP integration",
      "systems integration partner",
      "approval workflow automation",
    ],
    serviceType: "Business process automation",
    tagline: "Make your existing systems work as one.",
    card: {
      problem: "Your systems don't talk, so people become the integration layer.",
      solution: "API integrations, automated workflows and reliable data synchronisation.",
      outcome: "Work moves on its own, with fewer handoffs and no re-keying.",
    },
    intro: [
      "Most businesses do not have a software problem so much as a connection problem. The CRM, the accounting system, the project tool and the warehouse system each work fine — but nothing flows between them, so staff move data by hand and errors creep in at every handoff.",
      "Biztreck connects and automates what you already own. We integrate systems through their APIs, automate the approval and notification steps in between, and keep data synchronised so every system shows the same truth.",
    ],
    problems: [
      "The same record is created manually in two or three systems",
      "Approvals sit in inboxes with no visibility or escalation",
      "Finance reconciles spreadsheets against the CRM every month",
      "Handoffs between teams depend on someone remembering to send an email",
      "Data conflicts because two systems disagree and nobody knows which is right",
      "New hires need weeks to learn undocumented manual processes",
    ],
    businessImpact: [
      { label: "Duplicated effort", desc: "Every manual re-entry is paid for twice and introduces a chance of error." },
      { label: "Process delay", desc: "Approvals that should take minutes take days because nobody can see the queue." },
      { label: "Bad data", desc: "Systems that disagree undermine reporting and erode trust in the numbers." },
      { label: "Key-person risk", desc: "Undocumented manual processes leave with the person who ran them." },
    ],
    approach: [
      "We map the end-to-end flow first — including every place a human currently bridges two systems — and then automate the highest-friction steps rather than trying to boil the ocean.",
      "Automation is built to fail safely: retries, alerting, idempotent writes and a clear reconciliation path, so a third-party outage does not quietly corrupt your data.",
    ],
    features: [
      { title: "API integration", desc: "Reliable connections between your CRM, ERP, accounting, support and internal tools." },
      { title: "Approval workflows", desc: "Structured, visible approvals with escalation, reminders and a full audit trail." },
      { title: "Data synchronisation", desc: "Keep records consistent across systems with clear rules on the source of truth." },
      { title: "Automated notifications", desc: "The right person told at the right moment, without anyone remembering to do it." },
      { title: "Scheduled jobs", desc: "Recurring imports, exports, reconciliations and reports that run themselves." },
      { title: "Monitoring & alerts", desc: "Failures surface immediately instead of being discovered at month-end." },
    ],
    process: [
      { step: "Process mapping", desc: "We document how work actually flows today, including the workarounds." },
      { step: "Automation audit", desc: "Rank every step by time cost, error rate and ease of automation." },
      { step: "Integration design", desc: "Define the source of truth, data contracts and failure handling." },
      { step: "Build & test", desc: "Implement with retries, logging and a full dry-run against real data." },
      { step: "Monitor & extend", desc: "Watch it in production, then automate the next-highest-friction step." },
    ],
    tech: ["Node.js", "TypeScript", "REST & GraphQL APIs", "Webhooks", "PostgreSQL", "Redis", "AWS", "Cloudflare Workers"],
    outcomes: [
      "Manual re-keying between systems eliminated",
      "Approval cycle times reduced from days to hours",
      "Consistent data across CRM, finance and operations",
      "Processes documented in software rather than in someone's head",
    ],
    caseStudy: {
      industry: "Logistics",
      challenge:
        "A freight business re-entered every booking into three systems — CRM, operations and accounting. Discrepancies surfaced at invoicing, causing disputes and delayed payment.",
      solution:
        "An integration layer making the operations system the source of truth, syncing bookings to CRM and accounting automatically, with exception alerts where records could not be matched.",
      tech: ["Node.js", "PostgreSQL", "REST APIs", "AWS"],
      timeline: "9 weeks",
      results: [
        "Triple data entry removed from the booking process",
        "Invoice disputes from data mismatches substantially reduced",
        "Faster invoicing and improved cash collection",
        "Exceptions surfaced same-day instead of at month-end",
      ],
    },
    faqs: [
      {
        q: "Do we need to replace our current software?",
        a: "Usually not. Most automation value comes from connecting what you already own. We only recommend replacing a system when it genuinely cannot support the process or lacks any integration capability.",
      },
      {
        q: "What if a system has no API?",
        a: "There are still options: scheduled file imports and exports, database-level integration, vendor middleware, or in some cases a controlled migration. We assess this during the audit before promising anything.",
      },
      {
        q: "How much does process automation cost?",
        a: "A single well-defined integration or workflow typically runs USD 5,000-20,000. Broader programmes are phased so each stage pays for itself before the next begins.",
      },
      {
        q: "What happens when a third-party service goes down?",
        a: "We design for it: queued retries, idempotent writes so nothing double-posts, alerting when something stalls, and a documented reconciliation path. Outages become a delay rather than a data-integrity incident.",
      },
      {
        q: "How long does an integration take?",
        a: "A focused integration between two systems usually takes 3-8 weeks depending on API quality and how much business logic sits between them.",
      },
      {
        q: "Can you automate approvals across departments?",
        a: "Yes. Multi-step, conditional approval flows with delegation, escalation and audit trails are a common request, particularly in finance, procurement and HR processes.",
      },
    ],
    related: ["ai-automation", "crm-development", "erp-development"],
  },

  // ---------------------------------------------------------------- 4
  {
    slug: "crm-development",
    name: "CRM Development",
    h1: "Custom CRM Development for Sales Teams That Outgrew Generic Tools",
    metaTitle: "Custom CRM Development Company | Biztreck Solutions",
    metaDescription:
      "Custom CRM development for growing businesses. Biztreck builds CRMs modelled on your real sales process — with the pipeline, automation and reporting generic tools cannot handle.",
    keywords: [
      "custom CRM development",
      "bespoke CRM software",
      "CRM development company",
      "custom CRM for construction",
      "replace salesforce with custom crm",
      "CRM for SMB",
    ],
    serviceType: "CRM development",
    tagline: "A CRM that matches your sales process exactly.",
    card: {
      problem: "Your CRM forces your team into a pipeline that doesn't match how you actually sell.",
      solution: "A custom CRM built around your stages, data and quoting rules.",
      outcome: "Cleaner pipeline data, fewer lost leads and reporting you can trust.",
    },
    intro: [
      "Generic CRMs are built for a generic sales process. If you quote from a rate card, sell through multi-stage tenders, manage long service relationships, or need job data alongside deal data, you end up paying for seats and then working around the software in spreadsheets anyway.",
      "Biztreck builds CRMs that fit. Your stages, your qualification criteria, your quoting logic, your reporting — with the integrations that keep sales, delivery and finance looking at the same numbers.",
    ],
    problems: [
      "Reps keep a private spreadsheet because the CRM does not fit the process",
      "Quoting happens outside the CRM, so pipeline value is guesswork",
      "Leads arrive from several channels and some are never followed up",
      "Reporting requires exporting and manually reshaping data",
      "Per-seat licensing costs rise faster than the value delivered",
      "No link between a won deal and the job that delivers it",
    ],
    businessImpact: [
      { label: "Lost revenue", desc: "Leads that fall through unowned cracks are the most expensive kind of waste." },
      { label: "Blind forecasting", desc: "If pipeline data is incomplete, forecasts are fiction and hiring decisions suffer." },
      { label: "Low adoption", desc: "A CRM the team works around is a cost centre, not a sales asset." },
      { label: "Disconnected delivery", desc: "Sales promises and delivery reality drift apart without shared data." },
    ],
    approach: [
      "We model your actual pipeline — including the stages that do not fit standard software — and design data capture that reps will realistically complete. Adoption is a design problem, not a training problem.",
      "Then we connect the CRM to quoting, delivery and finance, so a won deal flows straight into the work that fulfils it and the invoice that bills it.",
    ],
    features: [
      { title: "Your pipeline, your stages", desc: "Stages, fields and qualification rules that match how your team really sells." },
      { title: "Quoting & proposals", desc: "Rate cards, templates and approvals so quotes are generated inside the system." },
      { title: "Lead capture", desc: "Website forms, email, phone and marketplace leads captured and assigned automatically." },
      { title: "Automated follow-up", desc: "Task creation, reminders and sequences so no enquiry goes cold unnoticed." },
      { title: "Forecasting & reporting", desc: "Live pipeline, conversion and rep performance without manual exports." },
      { title: "Delivery handover", desc: "Won deals flow into jobs, projects or onboarding with data intact." },
    ],
    process: [
      { step: "Pipeline discovery", desc: "Map your real sales stages, sources and qualification criteria." },
      { step: "Data model design", desc: "Define contacts, accounts, deals, quotes and their relationships." },
      { step: "Build & pilot", desc: "Ship to a small group of reps first and refine based on real usage." },
      { step: "Migrate", desc: "Import and de-duplicate existing CRM and spreadsheet data." },
      { step: "Roll out & tune", desc: "Full rollout, training, then iterate on reporting and automation." },
    ],
    tech: ["Next.js", "React", "Node.js", "PostgreSQL", "Redis", "AWS", "Twilio", "SendGrid"],
    outcomes: [
      "One pipeline everyone actually uses, with no side spreadsheets",
      "Faster quote turnaround and higher follow-up rates",
      "Forecasts based on complete data",
      "Sales and delivery working from the same record",
    ],
    caseStudy: {
      industry: "Construction",
      challenge:
        "A contractor managed tenders in spreadsheets and a generic CRM that could not model multi-stage bids. Estimators duplicated data, and management had no reliable view of the bid pipeline.",
      solution:
        "A custom CRM with a tender-aware pipeline, integrated estimating rate card, document management per bid, and dashboards showing bid volume, win rate and value by stage.",
      tech: ["Next.js", "Node.js", "PostgreSQL", "AWS"],
      timeline: "11 weeks",
      results: [
        "All tenders tracked in one system with no parallel spreadsheets",
        "Bid win-rate reporting available for the first time",
        "Faster estimate turnaround using the built-in rate card",
        "Clear ownership on every bid, reducing missed deadlines",
      ],
    },
    faqs: [
      {
        q: "Why build a CRM instead of using HubSpot or Salesforce?",
        a: "For a standard SaaS sales motion, use them — they are excellent. Custom makes sense when your process is unusual, when per-seat costs are outgrowing the value, or when the CRM must hold operational data that generic tools handle badly.",
      },
      {
        q: "How much does a custom CRM cost?",
        a: "A focused first release typically runs USD 20,000-50,000, with cost driven mostly by quoting logic, integrations and migration complexity. There are no per-seat fees afterwards.",
      },
      {
        q: "Can you migrate our existing CRM data?",
        a: "Yes. Migration, de-duplication and field mapping are part of the project. We run a dry-run migration you review before cutover.",
      },
      {
        q: "How long does it take?",
        a: "Most custom CRMs reach a usable first release in 8-14 weeks, piloted with a small group before full rollout.",
      },
      {
        q: "Will our sales team actually use it?",
        a: "That is the main design constraint. We keep required fields minimal, automate capture wherever possible, and pilot with real reps early. A CRM that is faster than a spreadsheet gets used.",
      },
      {
        q: "Can it integrate with our accounting system?",
        a: "Yes. Linking won deals to invoices in Xero, QuickBooks, Zoho or an ERP is one of the most common integrations we build.",
      },
    ],
    related: ["custom-software", "business-automation", "dashboard-development"],
  },

  // ---------------------------------------------------------------- 5
  {
    slug: "erp-development",
    name: "ERP Development",
    h1: "Custom ERP Development & Legacy System Modernisation",
    metaTitle: "Custom ERP Development Company | Biztreck Solutions",
    metaDescription:
      "Custom ERP development and legacy modernisation for manufacturing, logistics and distribution businesses. Biztreck builds ERP systems that fit your operation without a rip-and-replace.",
    keywords: [
      "custom ERP development",
      "ERP software development company",
      "legacy system modernisation",
      "ERP for manufacturing",
      "custom ERP vs SAP",
      "inventory management system development",
    ],
    serviceType: "ERP development",
    tagline: "Operational software that fits your business, module by module.",
    card: {
      problem: "Your ERP is outdated, oversized, or was never built for how you operate.",
      solution: "Modular ERP built and rolled out one operational area at a time.",
      outcome: "Modern operations without a high-risk rip-and-replace programme.",
    },
    intro: [
      "ERP has a reputation for expensive, multi-year programmes that disrupt the business and land late. That reputation is largely earned — but it comes from monolithic implementations, not from the idea of integrated operational software.",
      "Biztreck takes a modular approach. We build and roll out one operational area at a time — inventory, purchasing, production, dispatch — each delivering value on its own while sharing a common data model. You modernise without betting the business on a single go-live.",
    ],
    problems: [
      "A legacy system nobody can safely modify and few people still understand",
      "Inventory counts on screen do not match the warehouse",
      "Purchasing, production and sales each keep their own version of the numbers",
      "Reporting requires an export and a spreadsheet specialist",
      "The current ERP licence costs more each year for features you never use",
      "New locations or product lines cannot be added without vendor consulting fees",
    ],
    businessImpact: [
      { label: "Working capital tied up", desc: "Inaccurate stock data forces over-ordering and buffer inventory you do not need." },
      { label: "Operational firefighting", desc: "Managers spend the day chasing information instead of improving throughput." },
      { label: "Modernisation risk", desc: "Fear of a big-bang migration keeps you on a system that gets riskier every year." },
      { label: "Vendor lock-in", desc: "Every change requires the vendor, at their price and on their timeline." },
    ],
    approach: [
      "We start with the module where the pain and the payback are highest — usually inventory accuracy or purchasing — and ship that first, running alongside the legacy system rather than replacing it overnight.",
      "Each subsequent module plugs into the same data model. Migration happens gradually, with both systems reconciled during transition, so there is never a single day where the business is betting everything on a cutover.",
    ],
    features: [
      { title: "Inventory & stock control", desc: "Real-time stock positions across locations, with movements, adjustments and counts." },
      { title: "Purchasing & suppliers", desc: "POs, approvals, goods receipt and supplier performance in one place." },
      { title: "Production & jobs", desc: "Scheduling, work orders, materials consumption and QA checkpoints." },
      { title: "Sales & dispatch", desc: "Orders, allocation, picking, dispatch and delivery confirmation." },
      { title: "Finance integration", desc: "Clean handoff to your accounting platform rather than a second ledger." },
      { title: "Operational reporting", desc: "Live dashboards for stock, throughput, margin and on-time delivery." },
    ],
    process: [
      { step: "Operational audit", desc: "Map current systems, data quality and the true cost of today's process." },
      { step: "Module roadmap", desc: "Sequence modules by payback so early phases fund later ones." },
      { step: "Core data model", desc: "Design the shared foundation every module will build on." },
      { step: "Phased build", desc: "Ship one module at a time, running parallel to legacy where needed." },
      { step: "Migrate & decommission", desc: "Move data gradually, reconcile, then retire the legacy system." },
    ],
    tech: ["Next.js", "Node.js", "PostgreSQL", "Redis", "Docker", "AWS", "REST APIs", "Power BI / Metabase"],
    outcomes: [
      "Accurate, real-time stock and operational data",
      "Modernisation delivered without a high-risk big-bang cutover",
      "Reduced licence and vendor-consulting spend",
      "Ability to add locations and product lines in-house",
    ],
    caseStudy: {
      industry: "Distribution",
      challenge:
        "A distributor ran a decade-old system that could not handle a second warehouse. Stock accuracy was poor, causing both stockouts and excess inventory, and the vendor quoted a large fee for multi-location support.",
      solution:
        "A modular ERP starting with multi-location inventory and purchasing, integrated with the existing accounting platform, later extended to dispatch and supplier performance.",
      tech: ["Next.js", "Node.js", "PostgreSQL", "AWS"],
      timeline: "Phase one in 12 weeks, full rollout across 3 phases in 9 months",
      results: [
        "Accurate stock visibility across both warehouses",
        "Reduced buffer inventory and fewer stockouts",
        "Second location supported without vendor fees",
        "Legacy system retired without a disruptive cutover",
      ],
    },
    faqs: [
      {
        q: "Is custom ERP really cheaper than SAP or NetSuite?",
        a: "Not always, and we will say so. Custom tends to win when your operation is unusual, when you need only a few modules, or when licence plus customisation costs on a large platform exceed building what you actually need. We compare honestly during the audit.",
      },
      {
        q: "How risky is replacing our legacy system?",
        a: "Big-bang replacements are risky, which is why we do not do them. Modules run alongside the legacy system and take over one area at a time, with reconciliation during transition.",
      },
      {
        q: "How much does custom ERP cost?",
        a: "A first module typically runs USD 25,000-60,000. Full multi-module programmes are larger but are phased so each stage delivers value and can be paused.",
      },
      {
        q: "Can it work with our accounting software?",
        a: "Yes, and we usually recommend it. Keeping your proven accounting platform and integrating with it is lower risk than rebuilding a general ledger.",
      },
      {
        q: "What about our existing data?",
        a: "Data migration, cleansing and reconciliation are explicit workstreams. Poor legacy data quality is common, and we surface it early rather than at go-live.",
      },
      {
        q: "How long before we see value?",
        a: "The first module is deliberately chosen for fast payback and typically ships in 10-14 weeks, rather than waiting a year for a full programme.",
      },
    ],
    related: ["custom-software", "business-automation", "dashboard-development"],
  },

  // ---------------------------------------------------------------- 6
  {
    slug: "customer-portals",
    name: "Customer Portals",
    h1: "Customer Portal Development That Cuts Support Load",
    metaTitle: "Customer Portal Development Company | Biztreck Solutions",
    metaDescription:
      "Self-service customer portals for orders, documents, tickets and payments. Biztreck builds secure client portals that reduce support volume and improve retention.",
    keywords: [
      "customer portal development",
      "client portal software development",
      "self service portal development",
      "secure document portal",
      "customer portal for service business",
      "client login portal development",
    ],
    serviceType: "Customer portal development",
    tagline: "Let customers self-serve instead of emailing your team.",
    card: {
      problem: "Customers email and call your team for updates, documents and invoices.",
      solution: "A secure self-service portal exposing their data in real time.",
      outcome: "Lower support volume, faster answers and a more professional experience.",
    },
    intro: [
      "A large share of inbound support is customers asking for information you already have: where is my order, can you resend that invoice, what is the status of my case, where do I upload this document. Every one of those emails costs staff time and makes the customer wait.",
      "Biztreck builds customer portals that expose the right data securely and in real time — so customers get instant answers, and your team stops being a lookup service.",
    ],
    problems: [
      "Support answers the same status questions every day",
      "Documents are emailed back and forth with version confusion",
      "Customers cannot see order, job or case progress without asking",
      "Invoices and statements are re-sent manually on request",
      "Sensitive files travel over email with no access control",
      "No record of what was shared with which customer and when",
    ],
    businessImpact: [
      { label: "Support cost", desc: "Routine lookups consume hours that should go to complex, high-value cases." },
      { label: "Slow customer experience", desc: "Waiting hours for information a portal answers instantly damages perception." },
      { label: "Compliance exposure", desc: "Sensitive documents over email are hard to control and harder to audit." },
      { label: "Weak retention", desc: "Clients who cannot see progress feel less engaged and churn more readily." },
    ],
    approach: [
      "We identify the handful of questions that generate most of your inbound volume and design the portal around answering exactly those, well. A focused portal that solves the top five requests beats a sprawling one nobody logs into.",
      "Security is designed in from the start: proper authentication, strict per-account data scoping, encrypted document storage and a full access audit trail.",
    ],
    features: [
      { title: "Secure authentication", desc: "Modern login with MFA, SSO options and strict per-account data scoping." },
      { title: "Live status visibility", desc: "Real-time order, job, case or project status pulled from your systems." },
      { title: "Document exchange", desc: "Controlled upload and download with versioning and access logging." },
      { title: "Invoices & payments", desc: "Self-service invoice access, statements and optional online payment." },
      { title: "Support requests", desc: "Structured ticket raising with history, so context is never lost." },
      { title: "Notifications", desc: "Proactive email or SMS updates so customers do not have to check." },
    ],
    process: [
      { step: "Request analysis", desc: "Identify which inbound questions drive the most support volume." },
      { step: "Portal scope", desc: "Design around those top requests, plus the security model." },
      { step: "Integration", desc: "Connect to the systems holding order, job, case and invoice data." },
      { step: "Build & pen-test", desc: "Develop, then verify authentication and data isolation thoroughly." },
      { step: "Launch & adopt", desc: "Roll out to customers with onboarding, then measure ticket deflection." },
    ],
    tech: ["Next.js", "React", "Node.js", "PostgreSQL", "S3", "Auth0 / Clerk", "Stripe", "AWS"],
    outcomes: [
      "Routine status enquiries substantially deflected from the support queue",
      "Documents exchanged securely with a full audit trail",
      "Faster customer answers without added headcount",
      "A more professional, enterprise-grade client experience",
    ],
    caseStudy: {
      industry: "Healthcare services",
      challenge:
        "A provider handled document collection and appointment status by phone and email. Staff spent significant time re-sending forms, and sensitive documents circulated over unsecured email.",
      solution:
        "A secure patient portal for document upload and download, appointment status, and structured secure messaging, integrated with the existing practice system.",
      tech: ["Next.js", "Node.js", "PostgreSQL", "S3", "AWS"],
      timeline: "10 weeks",
      results: [
        "Document exchange moved off email into an audited, access-controlled channel",
        "Routine status calls significantly reduced",
        "Faster document turnaround before appointments",
        "Clear audit trail supporting compliance requirements",
      ],
    },
    faqs: [
      {
        q: "How secure is a customer portal?",
        a: "Built properly, more secure than the email it replaces. We implement modern authentication with MFA, strict per-account authorisation checks on every request, encryption in transit and at rest, and full access logging.",
      },
      {
        q: "How much does a customer portal cost?",
        a: "A focused portal covering the main self-service requests typically runs USD 15,000-40,000, depending on integrations and how many systems it must read from.",
      },
      {
        q: "Will our customers actually use it?",
        a: "They do when it is genuinely faster than emailing. That means no forced app install, a clean mobile experience, and answering the questions they actually ask. We also help with the launch communication.",
      },
      {
        q: "Can it integrate with our existing systems?",
        a: "Yes — that is the point. The portal is a secure window onto your existing order, job, case or invoice data rather than a second system to maintain.",
      },
      {
        q: "Can customers pay through the portal?",
        a: "Yes. We commonly integrate Stripe or a regional gateway so customers can settle invoices directly, which measurably improves collection times.",
      },
      {
        q: "How long does it take to build?",
        a: "Most portals launch in 8-12 weeks depending on how many systems need integrating and the depth of the security review.",
      },
    ],
    related: ["vendor-portals", "custom-software", "ai-automation"],
  },

  // ---------------------------------------------------------------- 7
  {
    slug: "vendor-portals",
    name: "Vendor Portals",
    h1: "Vendor & Supplier Portal Development",
    metaTitle: "Vendor Portal Development Company | Biztreck Solutions",
    metaDescription:
      "Supplier and vendor portals for onboarding, purchase orders, invoicing and compliance documents. Biztreck builds portals that cut procurement admin and supplier chasing.",
    keywords: [
      "vendor portal development",
      "supplier portal software",
      "supplier onboarding portal",
      "vendor management system development",
      "procurement portal development",
      "supplier compliance document portal",
    ],
    serviceType: "Vendor portal development",
    tagline: "Stop chasing suppliers for documents, prices and invoices.",
    card: {
      problem: "Procurement chases suppliers by email for documents, pricing and invoices.",
      solution: "A vendor portal where suppliers maintain their own data and submit directly.",
      outcome: "Less admin, current compliance documents and cleaner purchase-to-pay.",
    },
    intro: [
      "Supplier administration quietly consumes an enormous amount of procurement and finance time. Insurance certificates expire unnoticed, price lists live in old email threads, invoices arrive in a dozen formats, and onboarding a new vendor means a week of back-and-forth.",
      "Biztreck builds vendor portals that shift that work to the supplier, where it belongs. Vendors maintain their own details, upload compliance documents before they expire, acknowledge purchase orders and submit invoices in a structured format your systems can actually read.",
    ],
    problems: [
      "Compliance certificates expire and nobody notices until an audit",
      "Supplier onboarding takes weeks of email exchange",
      "Price lists are out of date or exist in several conflicting versions",
      "Invoices arrive as PDFs and are re-keyed into accounting by hand",
      "No visibility of PO acknowledgement or expected delivery dates",
      "Supplier performance is discussed anecdotally, not measured",
    ],
    businessImpact: [
      { label: "Compliance risk", desc: "Working with a supplier whose insurance lapsed can void cover and breach contracts." },
      { label: "Procurement admin", desc: "Skilled buyers spend their week chasing paperwork instead of negotiating." },
      { label: "Invoice friction", desc: "Manual invoice handling delays payment, strains relationships and hides errors." },
      { label: "No leverage", desc: "Without performance data you negotiate renewals on anecdote rather than evidence." },
    ],
    approach: [
      "We make the portal the single channel for supplier interaction, then automate the chasing: documents that are close to expiry trigger reminders to the vendor automatically, and onboarding becomes a guided flow rather than an email thread.",
      "Structured submission is the second win. When invoices and pricing arrive as data rather than PDFs, they flow into your finance and purchasing systems without manual re-entry.",
    ],
    features: [
      { title: "Self-service onboarding", desc: "Guided vendor registration with validation and required documentation." },
      { title: "Compliance tracking", desc: "Certificates with expiry dates and automatic reminders before they lapse." },
      { title: "PO acknowledgement", desc: "Suppliers confirm orders and commit delivery dates you can see." },
      { title: "Structured invoicing", desc: "Invoice submission that matches to POs and flows into accounting." },
      { title: "Price list management", desc: "Vendors maintain current pricing with approval before it takes effect." },
      { title: "Performance scorecards", desc: "On-time delivery, quality and responsiveness measured automatically." },
    ],
    process: [
      { step: "Procurement audit", desc: "Map onboarding, compliance and purchase-to-pay as they run today." },
      { step: "Portal design", desc: "Define vendor-facing flows, validation rules and approval steps." },
      { step: "Integration", desc: "Connect to purchasing and accounting so data flows both ways." },
      { step: "Pilot with vendors", desc: "Onboard a small supplier group and refine before wider rollout." },
      { step: "Roll out & measure", desc: "Migrate remaining suppliers and track admin time saved." },
    ],
    tech: ["Next.js", "Node.js", "PostgreSQL", "S3", "Auth0 / Clerk", "REST APIs", "AWS", "SendGrid"],
    outcomes: [
      "Compliance documents current, with expiry chasing automated",
      "Vendor onboarding reduced from weeks to days",
      "Invoices arriving as structured data instead of PDFs",
      "Objective supplier performance data for renewals",
    ],
    caseStudy: {
      industry: "Construction",
      challenge:
        "A contractor managed hundreds of subcontractors, tracking insurance and certification in a spreadsheet. Expired documents were routinely discovered on site, halting work and creating liability exposure.",
      solution:
        "A subcontractor portal with self-service onboarding, document upload with expiry tracking, automated pre-expiry reminders, and a compliance dashboard flagging non-compliant vendors before mobilisation.",
      tech: ["Next.js", "Node.js", "PostgreSQL", "S3", "AWS"],
      timeline: "10 weeks",
      results: [
        "Expired-certificate incidents on site effectively eliminated",
        "Onboarding time cut from weeks to a few days",
        "Compliance status visible before mobilisation rather than after",
        "Procurement admin time materially reduced",
      ],
    },
    faqs: [
      {
        q: "Will our suppliers adopt a portal?",
        a: "Adoption works when the portal is simple and the alternative is removed. Suppliers get faster onboarding and faster payment, which is a genuine incentive. We phase rollout and support vendors during transition.",
      },
      {
        q: "How much does a vendor portal cost?",
        a: "Typically USD 15,000-45,000 depending on how much of purchase-to-pay is in scope and how deep the accounting integration goes.",
      },
      {
        q: "Can it handle compliance document expiry?",
        a: "Yes, and it is usually the highest-value feature. Documents carry expiry dates, vendors are reminded automatically before lapse, and non-compliant suppliers are flagged in your dashboard.",
      },
      {
        q: "Does it replace our purchasing system?",
        a: "Usually not. The portal is the supplier-facing layer on top of your existing purchasing and accounting systems, integrated so data flows without re-entry.",
      },
      {
        q: "Can suppliers submit invoices through it?",
        a: "Yes. Structured invoice submission with automatic PO matching is common and removes most manual invoice handling from finance.",
      },
      {
        q: "How long does implementation take?",
        a: "Most vendor portals launch in 8-12 weeks, followed by a phased supplier onboarding programme.",
      },
    ],
    related: ["customer-portals", "business-automation", "erp-development"],
  },

  // ---------------------------------------------------------------- 8
  {
    slug: "dashboard-development",
    name: "Business Dashboards",
    h1: "Business Intelligence Dashboard Development",
    metaTitle: "Business Dashboard Development Company | Biztreck Solutions",
    metaDescription:
      "Custom business dashboards that unify data from your CRM, ERP, finance and operations systems into live reporting leadership can act on.",
    keywords: [
      "business dashboard development",
      "custom BI dashboard",
      "management reporting dashboard",
      "KPI dashboard development",
      "operational reporting software",
      "data visualization development company",
    ],
    serviceType: "Business intelligence dashboards",
    tagline: "Know how the business is performing without waiting for month-end.",
    card: {
      problem: "Reporting means exporting from several systems into a spreadsheet each month.",
      solution: "Live dashboards unifying CRM, finance and operations data automatically.",
      outcome: "Decisions made on current numbers instead of last month's guesswork.",
    },
    intro: [
      "In most growing businesses, reporting is a person. Someone exports from the CRM, someone else pulls the accounting data, the numbers get reconciled in a spreadsheet, and by the time leadership sees a figure it describes a month that has already ended.",
      "Biztreck builds dashboards that pull directly from your source systems and stay current. The metrics that matter — pipeline, utilisation, margin, on-time delivery, cash — visible live, with the definitions agreed once so everyone argues about the decision rather than the number.",
    ],
    problems: [
      "Monthly reporting takes days of manual export and reconciliation",
      "Different departments quote different numbers for the same metric",
      "Data lives in four systems with no combined view",
      "Problems surface at month-end when it is too late to react",
      "Leadership makes decisions on gut feel because data arrives too slowly",
      "Reporting depends on one person who becomes a bottleneck",
    ],
    businessImpact: [
      { label: "Late reactions", desc: "Margin erosion or utilisation dips discovered weeks after they started cost real money." },
      { label: "Wasted senior time", desc: "Finance and ops leads spend days assembling reports instead of acting on them." },
      { label: "Disputed numbers", desc: "Meetings spent debating whose figure is right rather than what to do about it." },
      { label: "Key-person risk", desc: "If reporting lives in one person's spreadsheet, it leaves when they do." },
    ],
    approach: [
      "We start by agreeing definitions. What exactly counts as an active client, a billable hour, a won deal — because most reporting disputes are definition disputes, not data disputes.",
      "Then we build a pipeline from your source systems into a reporting layer, and design dashboards for specific audiences: a board view, an operational view, a team view. Each answers the questions that audience actually asks.",
    ],
    features: [
      { title: "Unified data pipeline", desc: "Automated extraction from CRM, ERP, finance and operational systems." },
      { title: "Agreed metric definitions", desc: "Each KPI defined once and calculated consistently everywhere." },
      { title: "Role-based dashboards", desc: "Board, management and team views showing what each audience needs." },
      { title: "Drill-down", desc: "Click a number to see the records behind it, so figures can be trusted." },
      { title: "Alerts & thresholds", desc: "Notification when a metric crosses a threshold, not at month-end." },
      { title: "Scheduled reporting", desc: "Automated board packs and team reports delivered on schedule." },
    ],
    process: [
      { step: "Metric definition", desc: "Agree exactly what each KPI means and where its data lives." },
      { step: "Data audit", desc: "Assess source system quality and identify gaps to fix first." },
      { step: "Pipeline build", desc: "Automated, scheduled extraction and transformation into a reporting layer." },
      { step: "Dashboard design", desc: "Build views per audience, validated against known-good figures." },
      { step: "Adopt & extend", desc: "Embed in the management rhythm, then add metrics as questions evolve." },
    ],
    tech: ["Next.js", "React", "Node.js", "PostgreSQL", "Metabase", "Power BI", "REST APIs", "AWS"],
    outcomes: [
      "Month-end reporting effort dramatically reduced",
      "One agreed set of numbers across departments",
      "Issues visible in days rather than at month-end",
      "Reporting that survives the departure of any individual",
    ],
    caseStudy: {
      industry: "Professional services",
      challenge:
        "A consultancy tracked utilisation, pipeline and margin across a time-tracking tool, a CRM and accounting software. Monthly board reporting took three days and figures were frequently disputed in the meeting.",
      solution:
        "An automated data pipeline into a unified reporting layer, with a board dashboard covering utilisation, pipeline coverage and project margin, plus drill-down to the underlying records.",
      tech: ["Node.js", "PostgreSQL", "Metabase", "AWS"],
      timeline: "8 weeks",
      results: [
        "Board pack preparation reduced from three days to automated delivery",
        "Single agreed definition for utilisation and margin",
        "Under-performing projects flagged weeks earlier",
        "Reporting no longer dependent on one analyst",
      ],
    },
    faqs: [
      {
        q: "Can you pull data from all our systems?",
        a: "In most cases yes, via API, database connection or scheduled export. During the data audit we confirm what is reachable and flag anything that needs a different approach before we commit.",
      },
      {
        q: "How much does a dashboard project cost?",
        a: "A focused management dashboard typically runs USD 10,000-30,000, driven mostly by the number of source systems and the state of the underlying data.",
      },
      {
        q: "Should we use Power BI or something custom?",
        a: "If your data is already clean and centralised, an off-the-shelf BI tool is often the right answer and we will build on it. Custom makes sense when the pipeline work is the hard part or when dashboards need to be embedded in your own application.",
      },
      {
        q: "What if our data quality is poor?",
        a: "That is common and we audit for it early. Sometimes the first phase is fixing data capture at source, because a dashboard built on bad data just distributes the problem faster.",
      },
      {
        q: "How current is the data?",
        a: "It depends on the source. Many feeds run near real-time; others sync hourly or nightly where the source system limits access. We make refresh timing explicit on each dashboard so nobody misreads a stale figure.",
      },
      {
        q: "How long does it take?",
        a: "Most dashboard projects deliver a first working version in 5-8 weeks, then expand as new questions emerge.",
      },
    ],
    related: ["custom-software", "erp-development", "business-automation"],
  },

  // ---------------------------------------------------------------- 9
  {
    slug: "website-development",
    name: "Website Development",
    h1: "Website Design & Development That Generates Qualified Leads",
    metaTitle: "Business Website Development Company | Biztreck Solutions",
    metaDescription:
      "Fast, SEO-ready business websites built to generate qualified leads. Biztreck builds high-performance sites on Next.js with technical SEO and Core Web Vitals built in.",
    keywords: [
      "business website development",
      "website redesign company",
      "next.js development agency",
      "lead generation website design",
      "b2b website development",
      "website development for service business",
    ],
    serviceType: "Website development",
    tagline: "A website that sells, not just a brochure that exists.",
    card: {
      problem: "Your website looks dated, loads slowly and generates almost no enquiries.",
      solution: "A fast, SEO-ready site structured around how buyers actually evaluate you.",
      outcome: "More qualified enquiries from search, without more ad spend.",
    },
    intro: [
      "For most B2B businesses the website is the first thing a prospect checks and the last thing anyone invests in. The result is a site that loads slowly, says little about the problems you solve, and gives a serious buyer no reason to get in touch.",
      "Biztreck builds websites as commercial assets. Structured around buyer intent, engineered for speed and technical SEO, and instrumented so you can see which pages actually generate enquiries.",
    ],
    problems: [
      "The site describes what you do but not the problems you solve",
      "Slow load times pushing visitors away and hurting search rankings",
      "No organic traffic because there is nothing worth ranking",
      "A contact form that is the only conversion path on the entire site",
      "Content cannot be updated without a developer",
      "No analytics, so nobody knows which pages generate business",
    ],
    businessImpact: [
      { label: "Invisible in search", desc: "If you do not rank for buyer-intent terms, competitors capture that demand instead." },
      { label: "Wasted ad spend", desc: "Paid traffic sent to a weak site converts poorly, inflating cost per lead." },
      { label: "Lost credibility", desc: "A dated site undermines trust before a prospect ever speaks to you." },
      { label: "No feedback loop", desc: "Without measurement you cannot tell which content is working." },
    ],
    approach: [
      "We structure the site around the questions buyers ask while evaluating a supplier — what problem you solve, proof you have solved it before, how you work, and what it costs — rather than around your internal org chart.",
      "Engineering matters too. Server-rendered pages, optimised images, clean semantic markup and structured data mean the site is fast for users and legible to both search engines and AI answer engines.",
    ],
    features: [
      { title: "Conversion-led structure", desc: "Pages mapped to buyer intent with a clear primary action on each." },
      { title: "Technical SEO built in", desc: "Semantic markup, schema, sitemaps, canonicals and internal linking from day one." },
      { title: "Core Web Vitals", desc: "Engineered for fast loads on real devices and connections, not just lab scores." },
      { title: "Editable content", desc: "Update copy, posts and case studies yourself without developer involvement." },
      { title: "Multiple conversion paths", desc: "Calls, audits, downloads and proposals — not one lonely contact form." },
      { title: "Analytics & tracking", desc: "Conversion tracking so you know which pages and terms produce enquiries." },
    ],
    process: [
      { step: "Positioning & intent", desc: "Define the audience, the problems you solve and the terms they search." },
      { step: "Information architecture", desc: "Structure pages and internal links around buyer journeys." },
      { step: "Design within brand", desc: "Apply your existing visual identity to conversion-focused layouts." },
      { step: "Build & optimise", desc: "Develop with SEO, accessibility and performance verified before launch." },
      { step: "Measure & improve", desc: "Track conversions after launch and iterate on what underperforms." },
    ],
    tech: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Headless CMS", "Vercel", "Cloudflare", "GA4"],
    outcomes: [
      "Meaningfully faster load times and improved Core Web Vitals",
      "Organic visibility for buyer-intent search terms",
      "More qualified enquiries without additional ad spend",
      "Clear visibility of which pages drive business",
    ],
    caseStudy: {
      industry: "Real estate services",
      challenge:
        "A firm's website was slow, produced almost no organic traffic, and offered a single contact form. Nearly all enquiries came from paid ads at a rising cost per lead.",
      solution:
        "A rebuilt Next.js site structured around service and location intent, with technical SEO, a resource section, and multiple conversion paths including a valuation request and a downloadable guide.",
      tech: ["Next.js", "Tailwind CSS", "Headless CMS", "Vercel"],
      timeline: "7 weeks",
      results: [
        "Substantially faster page loads and improved Core Web Vitals",
        "Organic enquiries growing month on month post-launch",
        "Reduced reliance on paid traffic for lead volume",
        "Clear attribution showing which pages convert",
      ],
    },
    faqs: [
      {
        q: "How much does a business website cost?",
        a: "A professional B2B website typically runs USD 5,000-20,000 depending on page count, custom design, CMS and integrations. Larger content and SEO programmes sit above that. You get a fixed quote after a short discovery call.",
      },
      {
        q: "How long does it take?",
        a: "Most business websites launch in 4-8 weeks. Larger sites with substantial content take longer, and we share previews throughout rather than revealing it at the end.",
      },
      {
        q: "Will the site rank on Google?",
        a: "Technical foundations — speed, semantic markup, structured data, clean internal linking — are built in, and that is what makes ranking possible. Actually ranking competitive terms also needs content and time, and we are direct about which terms are realistic.",
      },
      {
        q: "Can we edit content ourselves?",
        a: "Yes. We connect a headless CMS so your team can edit copy, publish posts and add case studies without a developer.",
      },
      {
        q: "Do you redesign existing websites?",
        a: "Frequently. Where the current site has SEO equity we preserve URL structure and redirect carefully so a redesign does not undo years of ranking.",
      },
      {
        q: "What happens after launch?",
        a: "We monitor performance and conversions post-launch. Most clients continue with a content and improvement retainer, since a website compounds only if it keeps being worked on.",
      },
    ],
    related: ["custom-software", "dashboard-development", "ai-automation"],
  },
];

export function getSolution(slug: string) {
  return SOLUTIONS.find((s) => s.slug === slug);
}

/** Core service ordering for nav and homepage — website is deliberately fourth. */
export const CORE_SOLUTION_SLUGS = [
  "custom-software",
  "ai-automation",
  "business-automation",
  "website-development",
];

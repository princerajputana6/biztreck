// Industry landing-page content. Each entry becomes an indexable page at
// /industries/<slug>. Structure mirrors the spec: hero, industry problems,
// common workflows, our solutions, case study, FAQs, CTA.

export type Faq = { q: string; a: string };

export type IndustryCaseStudy = {
  challenge: string;
  solution: string;
  tech: string[];
  timeline: string;
  results: string[];
};

export type Industry = {
  slug: string;
  name: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  tagline: string;
  blurb: string; // short line for grids
  intro: string[];
  problems: string[];
  workflows: { title: string; desc: string }[];
  solutions: { title: string; desc: string; slug: string }[];
  caseStudy: IndustryCaseStudy;
  faqs: Faq[];
};

export const INDUSTRIES: Industry[] = [
  // ------------------------------------------------------------- healthcare
  {
    slug: "healthcare",
    name: "Healthcare",
    h1: "Custom Software & Automation for Healthcare Providers",
    metaTitle: "Healthcare Software Development & Automation | Biztreck",
    metaDescription:
      "Custom software, patient portals and automation for healthcare providers. Biztreck builds secure, auditable systems that cut admin load without disrupting care.",
    keywords: [
      "healthcare software development",
      "patient portal development",
      "medical practice software",
      "healthcare automation",
      "HIPAA compliant software development",
    ],
    tagline: "Less admin. More time with patients.",
    blurb: "Patient portals, intake automation and secure document workflows.",
    intro: [
      "Healthcare providers carry an administrative load that has very little to do with care. Intake forms are printed and re-keyed, documents move over email, appointment queries tie up the front desk, and compliance evidence is assembled by hand when an audit arrives.",
      "Biztreck builds systems that remove that load safely. Secure patient portals, automated intake and document handling, and integrations with the practice systems you already run — designed with access control and audit trails from the start.",
    ],
    problems: [
      "Patient intake collected on paper then manually entered into the practice system",
      "Sensitive documents exchanged over unsecured email",
      "Front desk absorbing high volumes of routine appointment and status calls",
      "No single view of a patient's documents, history and communications",
      "Compliance evidence assembled manually before an audit",
      "Referral and follow-up tracking dependent on someone remembering",
    ],
    workflows: [
      { title: "Patient intake", desc: "Digital forms, consent capture and validation before the appointment." },
      { title: "Document exchange", desc: "Secure upload and download with versioning and full access logs." },
      { title: "Appointment communication", desc: "Automated confirmations, reminders and rescheduling links." },
      { title: "Referral management", desc: "Structured referral tracking with owner, status and follow-up dates." },
      { title: "Billing handoff", desc: "Clean data flow from encounter to billing without re-entry." },
      { title: "Compliance reporting", desc: "Access logs and evidence produced on demand rather than assembled." },
    ],
    solutions: [
      { title: "Patient portals", desc: "Secure self-service for documents, forms and appointment status.", slug: "customer-portals" },
      { title: "Intake automation", desc: "Digital forms flowing straight into your practice system.", slug: "business-automation" },
      { title: "AI document processing", desc: "Extract structured data from referrals, reports and forms.", slug: "ai-automation" },
      { title: "Operational dashboards", desc: "Utilisation, wait times and throughput visible live.", slug: "dashboard-development" },
    ],
    caseStudy: {
      challenge:
        "A multi-site provider handled document collection and appointment status by phone and email. Staff spent significant time re-sending forms, and sensitive documents circulated over unsecured channels.",
      solution:
        "A secure patient portal for document upload and download, appointment status and structured messaging, integrated with the existing practice management system.",
      tech: ["Next.js", "Node.js", "PostgreSQL", "S3", "AWS"],
      timeline: "10 weeks",
      results: [
        "Document exchange moved off email into an audited channel",
        "Routine status calls to the front desk significantly reduced",
        "Faster document turnaround before appointments",
        "Clear audit trail supporting compliance requirements",
      ],
    },
    faqs: [
      {
        q: "Can you build to HIPAA or equivalent standards?",
        a: "Yes. We design for access control, encryption in transit and at rest, audit logging, and data residency requirements. We scope the specific regulatory obligations during discovery rather than retrofitting them.",
      },
      {
        q: "Will this integrate with our practice management system?",
        a: "Usually yes, via API or a supported integration path. Where a system is closed we discuss scheduled data exchange. We confirm feasibility before committing to scope.",
      },
      {
        q: "Do we have to replace our existing systems?",
        a: "No. Most of our healthcare work layers on top of existing clinical systems, adding the patient-facing and administrative capabilities they lack.",
      },
      {
        q: "How do you handle patient data during development?",
        a: "We develop against anonymised or synthetic data. Production data access is restricted, logged, and governed by a signed agreement.",
      },
    ],
  },

  // ------------------------------------------------------------ construction
  {
    slug: "construction",
    name: "Construction",
    h1: "Construction Software: Bids, Subcontractors & Site Compliance",
    metaTitle: "Construction Software Development & Automation | Biztreck",
    metaDescription:
      "Custom CRM, subcontractor portals and compliance tracking for construction firms. Biztreck builds software that keeps bids, documents and site compliance under control.",
    keywords: [
      "construction software development",
      "construction CRM",
      "subcontractor management software",
      "construction compliance tracking software",
      "tender management system",
    ],
    tagline: "Control your bids, your subs and your compliance.",
    blurb: "Tender pipelines, subcontractor portals and certification tracking.",
    intro: [
      "Construction runs on documents and deadlines, and both tend to live in spreadsheets. Tenders are tracked in one file, subcontractor insurance in another, and site compliance is discovered to be out of date at the worst possible moment.",
      "Biztreck builds systems that hold this together: tender-aware pipelines, subcontractor portals with automatic certificate expiry chasing, and dashboards that flag non-compliance before mobilisation rather than after.",
    ],
    problems: [
      "Multi-stage tenders tracked in spreadsheets with no reliable pipeline view",
      "Subcontractor insurance and certifications expiring unnoticed",
      "Estimators duplicating data between takeoff, CRM and job setup",
      "Site documentation scattered across email and shared drives",
      "Variations and change orders agreed verbally then disputed later",
      "No accurate view of bid win rate or margin by project type",
    ],
    workflows: [
      { title: "Tender pipeline", desc: "Multi-stage bid tracking with owner, deadline and value by stage." },
      { title: "Estimating handoff", desc: "Rate cards and takeoff data flowing into quotes without re-entry." },
      { title: "Subcontractor onboarding", desc: "Self-service registration with mandatory compliance documents." },
      { title: "Certificate tracking", desc: "Expiry dates monitored with automated reminders before lapse." },
      { title: "Variation control", desc: "Change orders raised, priced and approved in writing with an audit trail." },
      { title: "Project reporting", desc: "Live view of committed cost, margin and programme status." },
    ],
    solutions: [
      { title: "Construction CRM", desc: "A pipeline that models multi-stage tenders properly.", slug: "crm-development" },
      { title: "Subcontractor portals", desc: "Vendors maintain their own compliance documents.", slug: "vendor-portals" },
      { title: "Project dashboards", desc: "Bid win rate, committed cost and margin in real time.", slug: "dashboard-development" },
      { title: "Workflow automation", desc: "Approvals, notifications and document routing automated.", slug: "business-automation" },
    ],
    caseStudy: {
      challenge:
        "A contractor managed hundreds of subcontractors, tracking insurance and certification in a spreadsheet. Expired documents were routinely discovered on site, halting work and creating liability exposure.",
      solution:
        "A subcontractor portal with self-service onboarding, document upload with expiry tracking, automated pre-expiry reminders, and a compliance dashboard flagging non-compliant vendors before mobilisation.",
      tech: ["Next.js", "Node.js", "PostgreSQL", "S3", "AWS"],
      timeline: "10 weeks",
      results: [
        "Expired-certificate incidents on site effectively eliminated",
        "Subcontractor onboarding cut from weeks to a few days",
        "Compliance status visible before mobilisation",
        "Procurement admin time materially reduced",
      ],
    },
    faqs: [
      {
        q: "Can it handle multi-stage tenders?",
        a: "Yes, and it is one of the main reasons construction firms move off generic CRMs. We model prequalification, shortlist, submission and award as distinct stages with their own data and deadlines.",
      },
      {
        q: "Will subcontractors actually use a portal?",
        a: "They do when onboarding and payment depend on it, and when it is simpler than the email thread it replaces. We phase rollout and support vendors through the transition.",
      },
      {
        q: "Can it integrate with our accounting or estimating software?",
        a: "Yes. Integrations with accounting platforms are standard. Estimating tools vary — we confirm the integration path during discovery.",
      },
      {
        q: "Does it work on site, on mobile?",
        a: "Yes. Site-facing features are built mobile-first and work on typical site connectivity, with offline-tolerant behaviour where it matters.",
      },
    ],
  },

  // ----------------------------------------------------------- manufacturing
  {
    slug: "manufacturing",
    name: "Manufacturing",
    h1: "Manufacturing Software: Production, Inventory & Quality",
    metaTitle: "Manufacturing Software Development & ERP | Biztreck",
    metaDescription:
      "Custom production management, inventory and quality systems for manufacturers. Biztreck modernises operations module by module without a risky rip-and-replace.",
    keywords: [
      "manufacturing software development",
      "production management system",
      "custom ERP for manufacturing",
      "inventory management software development",
      "quality management system software",
    ],
    tagline: "Modernise operations without stopping the line.",
    blurb: "Production scheduling, inventory accuracy and QA traceability.",
    intro: [
      "Manufacturers often run on a mix of an ageing ERP, several spreadsheets, and institutional knowledge. Stock figures do not match the floor, scheduling is a whiteboard exercise, and quality records are only assembled when a customer audit demands them.",
      "Biztreck modernises this one module at a time. Inventory accuracy first, then purchasing, production scheduling and QA — each delivering value on its own while sharing a common data model, so you are never betting the plant on a single cutover.",
    ],
    problems: [
      "On-screen stock levels that do not match physical inventory",
      "Production scheduling done on a whiteboard or in a spreadsheet",
      "Quality records captured on paper and filed manually",
      "No traceability from finished goods back to material batches",
      "Purchasing decisions made on stale or incomplete data",
      "A legacy system that cannot support a second site or product line",
    ],
    workflows: [
      { title: "Inventory control", desc: "Real-time stock by location with movements, adjustments and counts." },
      { title: "Purchasing", desc: "POs, approvals, goods receipt and supplier performance in one place." },
      { title: "Production scheduling", desc: "Work orders against machine and labour capacity with live status." },
      { title: "Materials consumption", desc: "Issue and backflush tied to work orders for accurate costing." },
      { title: "Quality assurance", desc: "Checkpoints, sign-off and non-conformance handling with evidence." },
      { title: "Traceability", desc: "Batch and serial tracking from raw material to despatched goods." },
    ],
    solutions: [
      { title: "Modular ERP", desc: "Operational modules rolled out one at a time.", slug: "erp-development" },
      { title: "Custom production software", desc: "Scheduling and shop-floor tools built to your process.", slug: "custom-software" },
      { title: "Operations dashboards", desc: "Throughput, OTIF and scrap visible live.", slug: "dashboard-development" },
      { title: "Supplier portals", desc: "Vendors confirm orders and delivery dates directly.", slug: "vendor-portals" },
    ],
    caseStudy: {
      challenge:
        "A mid-sized manufacturer tracked production scheduling, materials and QA sign-off across six spreadsheets. Two staff spent most of their week consolidating data, and month-end reporting took four days.",
      solution:
        "A custom production management platform with a unified data model covering jobs, materials, machine capacity and QA checkpoints, plus shop-floor and management dashboards.",
      tech: ["Next.js", "Node.js", "PostgreSQL", "AWS"],
      timeline: "14 weeks to first release, phased rollout over 4 months",
      results: [
        "Month-end reporting reduced from four days to same-day",
        "Manual consolidation work largely eliminated",
        "Two staff redeployed from data entry to production planning",
        "Full audit trail on QA sign-off for customer compliance",
      ],
    },
    faqs: [
      {
        q: "Do we have to replace our whole ERP?",
        a: "No, and we would usually advise against it. We start with the module where the payback is highest, run it alongside the legacy system, and take over more scope only as each phase proves out.",
      },
      {
        q: "Can it work with our machines or PLCs?",
        a: "Where machines expose data we can integrate it for live status and counts. Where they do not, we design efficient manual capture on the floor rather than pretending otherwise.",
      },
      {
        q: "How do you handle traceability requirements?",
        a: "Batch and serial tracking is designed into the data model from the start, so tracing a finished item back to its material batches is a query rather than an investigation.",
      },
      {
        q: "What about barcode or RFID scanning?",
        a: "Commonly included. Scanning for goods receipt, stock movements and despatch is usually the single biggest driver of inventory accuracy.",
      },
    ],
  },

  // ---------------------------------------------------------------- finance
  {
    slug: "finance",
    name: "Finance",
    h1: "Software & Automation for Finance and Professional Firms",
    metaTitle: "Finance Software Development & Automation | Biztreck",
    metaDescription:
      "Client portals, document automation and reporting systems for finance firms. Biztreck builds secure, auditable software for accounting, advisory and lending businesses.",
    keywords: [
      "finance software development",
      "fintech software development company",
      "client portal for accountants",
      "financial reporting automation",
      "document automation finance",
    ],
    tagline: "Secure, auditable systems for regulated work.",
    blurb: "Client portals, document automation and reporting you can audit.",
    intro: [
      "Finance businesses run on documents, deadlines and evidence. Client onboarding involves collecting the same documents repeatedly, reporting means assembling data from several systems, and every action needs to be defensible if a regulator asks.",
      "Biztreck builds software for that reality: secure client portals, automated document collection and processing, and reporting pipelines that produce consistent numbers with a clear trail back to source.",
    ],
    problems: [
      "Client onboarding stalled waiting on documents chased by email",
      "KYC and compliance evidence stored inconsistently across systems",
      "Reporting assembled manually from several sources each period",
      "Sensitive financial documents shared over email attachments",
      "No audit trail showing who accessed or changed what, and when",
      "Advisors spending billable hours on administrative follow-up",
    ],
    workflows: [
      { title: "Client onboarding", desc: "Guided digital onboarding with document checklists and validation." },
      { title: "Document collection", desc: "Automated requests, reminders and secure upload with versioning." },
      { title: "Data extraction", desc: "Structured data pulled from statements, invoices and forms." },
      { title: "Review & approval", desc: "Multi-step approvals with delegation and full audit history." },
      { title: "Client reporting", desc: "Consistent periodic reporting generated from a single data source." },
      { title: "Compliance evidence", desc: "Access and change logs available on demand for audit." },
    ],
    solutions: [
      { title: "Secure client portals", desc: "Document exchange and status without email attachments.", slug: "customer-portals" },
      { title: "AI document processing", desc: "Extract structured data from financial documents.", slug: "ai-automation" },
      { title: "Reporting dashboards", desc: "One agreed set of numbers with drill-down to source.", slug: "dashboard-development" },
      { title: "Process automation", desc: "Approvals, reminders and reconciliation automated.", slug: "business-automation" },
    ],
    caseStudy: {
      challenge:
        "An advisory firm collected client documents by email, chased them manually, and rebuilt the same periodic reports each quarter from three systems. Partners lost billable hours to administrative follow-up.",
      solution:
        "A client portal with automated document request and reminder cycles, plus a reporting pipeline consolidating source systems into consistent, drill-downable client reports.",
      tech: ["Next.js", "Node.js", "PostgreSQL", "S3", "AWS"],
      timeline: "12 weeks",
      results: [
        "Document chasing largely automated",
        "Quarterly reporting effort substantially reduced",
        "All client documents in an access-controlled, audited store",
        "Partner time returned to advisory work",
      ],
    },
    faqs: [
      {
        q: "How do you handle security and data residency?",
        a: "Encryption in transit and at rest, strict role-based access, full audit logging, and hosting in the region your regulator or clients require. Security requirements are scoped during discovery.",
      },
      {
        q: "Can you integrate with our accounting platform?",
        a: "Yes. Integrations with the major accounting and practice platforms are common, both for pulling data into reporting and for pushing records back.",
      },
      {
        q: "Is AI safe to use on financial documents?",
        a: "For extraction and drafting with human review, yes — and it is very effective. We do not put AI in a position to make unreviewed financial determinations, and every action is logged.",
      },
      {
        q: "Can you support our audit requirements?",
        a: "Yes. Immutable audit logging of access and changes is designed in, so producing evidence is a report rather than a project.",
      },
    ],
  },

  // --------------------------------------------------------------- logistics
  {
    slug: "logistics",
    name: "Logistics",
    h1: "Logistics Software: Bookings, Tracking & Systems Integration",
    metaTitle: "Logistics Software Development & Automation | Biztreck",
    metaDescription:
      "Custom logistics software, customer tracking portals and systems integration. Biztreck removes duplicate data entry across booking, operations and accounting systems.",
    keywords: [
      "logistics software development",
      "freight management software",
      "transport management system development",
      "shipment tracking portal",
      "logistics systems integration",
    ],
    tagline: "One booking, entered once.",
    blurb: "Booking flows, tracking portals and integrated operations.",
    intro: [
      "Logistics businesses typically run several systems that each hold part of the truth: a booking system, an operations tool, a telematics feed and an accounting platform. Staff become the integration layer, re-entering the same job repeatedly and reconciling differences at invoicing.",
      "Biztreck connects these systems and fills the gaps. A booking entered once flows through operations to invoicing, customers self-serve their tracking, and exceptions surface the same day instead of at month-end.",
    ],
    problems: [
      "The same booking re-entered into two or three systems",
      "Customers calling for status updates that a portal could answer",
      "Invoice disputes caused by mismatched job data",
      "Proof of delivery captured on paper and chased later",
      "No consolidated view of margin per job, lane or customer",
      "Exceptions discovered at invoicing rather than in operations",
    ],
    workflows: [
      { title: "Booking intake", desc: "Structured capture from web, email or EDI without re-keying." },
      { title: "Job allocation", desc: "Assignment to vehicle, driver or subcontractor with live status." },
      { title: "Customer tracking", desc: "Self-service shipment status and ETA for customers." },
      { title: "Proof of delivery", desc: "Digital POD capture linked to the job record immediately." },
      { title: "Invoicing handoff", desc: "Completed jobs flowing to accounting with matched data." },
      { title: "Margin reporting", desc: "Revenue and cost per job, lane and customer in one view." },
    ],
    solutions: [
      { title: "Systems integration", desc: "One source of truth across booking, ops and finance.", slug: "business-automation" },
      { title: "Customer tracking portals", desc: "Self-service status that deflects phone calls.", slug: "customer-portals" },
      { title: "Custom operations software", desc: "Allocation and dispatch built to your process.", slug: "custom-software" },
      { title: "Margin dashboards", desc: "Profitability by job, lane and customer.", slug: "dashboard-development" },
    ],
    caseStudy: {
      challenge:
        "A freight business re-entered every booking into three systems. Discrepancies surfaced at invoicing, causing disputes and delayed payment.",
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
        q: "Can you integrate with our telematics or tracking provider?",
        a: "In most cases yes. Telematics providers generally expose APIs for position and event data, which we use to drive customer-facing tracking and internal exception alerts.",
      },
      {
        q: "Do you support EDI?",
        a: "Yes. Where larger customers require EDI we build the integration and map it into your internal booking model.",
      },
      {
        q: "Can drivers capture proof of delivery on mobile?",
        a: "Yes. Mobile POD capture with signature and photo, tolerant of poor connectivity and syncing when back online, is a common requirement.",
      },
      {
        q: "Will this replace our transport management system?",
        a: "Often not. Frequently the better outcome is integrating your existing TMS properly and adding the customer-facing and reporting layers it lacks.",
      },
    ],
  },

  // ------------------------------------------------------------- real-estate
  {
    slug: "real-estate",
    name: "Real Estate",
    h1: "Real Estate Software: Leads, Listings & Client Portals",
    metaTitle: "Real Estate Software Development & Automation | Biztreck",
    metaDescription:
      "Custom CRM, lead automation and client portals for real estate and property businesses. Biztreck builds systems that stop leads going cold and cut admin.",
    keywords: [
      "real estate software development",
      "real estate CRM development",
      "property management software development",
      "real estate lead automation",
      "client portal real estate",
    ],
    tagline: "Stop leads going cold. Cut the admin.",
    blurb: "Lead capture, property CRM and client document portals.",
    intro: [
      "Real estate businesses live and die on response speed, yet leads arrive across portals, web forms, phone and email with no single queue. Meanwhile transaction admin — documents, approvals, milestone chasing — quietly consumes the team.",
      "Biztreck builds the systems that fix both ends: unified lead capture with automated follow-up so nothing goes cold, and client portals that handle document exchange and transaction status without a phone call.",
    ],
    problems: [
      "Leads arriving from multiple portals with no single queue or owner",
      "Slow first response losing enquiries to faster competitors",
      "Property and client data duplicated across several tools",
      "Transaction documents exchanged by email with version confusion",
      "Clients calling for status updates at every milestone",
      "No reliable view of pipeline by agent, stage or property type",
    ],
    workflows: [
      { title: "Lead capture", desc: "Portal, web, phone and email leads into one owned queue." },
      { title: "Automated follow-up", desc: "Immediate acknowledgement and task creation so nothing stalls." },
      { title: "Listing management", desc: "Property data maintained once and syndicated outward." },
      { title: "Viewing scheduling", desc: "Bookings, confirmations and reminders handled automatically." },
      { title: "Transaction milestones", desc: "Structured stages with owner, due date and document checklist." },
      { title: "Client updates", desc: "Portal status and proactive notifications instead of calls." },
    ],
    solutions: [
      { title: "Property CRM", desc: "A pipeline built around listings and transactions.", slug: "crm-development" },
      { title: "Client portals", desc: "Document exchange and live transaction status.", slug: "customer-portals" },
      { title: "Lead automation", desc: "Instant capture, routing and follow-up across channels.", slug: "business-automation" },
      { title: "Lead-generating websites", desc: "Search-visible sites built around buyer intent.", slug: "website-development" },
    ],
    caseStudy: {
      challenge:
        "A property firm's website was slow, produced almost no organic traffic, and offered a single contact form. Nearly all enquiries came from paid ads at a rising cost per lead.",
      solution:
        "A rebuilt site structured around service and location intent with technical SEO and multiple conversion paths, plus automated lead routing into an owned follow-up queue.",
      tech: ["Next.js", "Node.js", "PostgreSQL", "Vercel"],
      timeline: "7 weeks",
      results: [
        "Substantially faster page loads and improved Core Web Vitals",
        "Organic enquiries growing month on month post-launch",
        "Every lead assigned an owner and a follow-up task automatically",
        "Reduced reliance on paid traffic for lead volume",
      ],
    },
    faqs: [
      {
        q: "Can you integrate with property portals?",
        a: "Where portals provide a feed or API, yes — both for publishing listings outward and pulling enquiries into a single queue.",
      },
      {
        q: "Should we use a generic CRM instead?",
        a: "If your process is simple, yes. Custom becomes worthwhile when listings, viewings and transaction milestones need to live alongside deal data, which generic CRMs handle poorly.",
      },
      {
        q: "Can clients track their transaction?",
        a: "Yes. A client portal showing milestone status, outstanding documents and next actions is one of the highest-impact features for reducing inbound calls.",
      },
      {
        q: "How quickly can leads be responded to?",
        a: "Automated acknowledgement is immediate, and routing plus task creation happens within seconds — which materially improves conversion compared with manual triage.",
      },
    ],
  },

  // --------------------------------------------------------------- education
  {
    slug: "education",
    name: "Education",
    h1: "Education Software: Admissions, Portals & Administration",
    metaTitle: "Education Software Development & Automation | Biztreck",
    metaDescription:
      "Custom admissions systems, student and parent portals, and administrative automation for education providers. Biztreck cuts paperwork so staff can focus on teaching.",
    keywords: [
      "education software development",
      "student portal development",
      "admissions management system",
      "school management software development",
      "education administration automation",
    ],
    tagline: "Less paperwork. More teaching.",
    blurb: "Admissions workflows, student portals and administrative automation.",
    intro: [
      "Education providers carry heavy administrative overhead: admissions handled on paper and email, parent communication sent manually, and reporting assembled from several disconnected systems each term.",
      "Biztreck builds systems that automate the administration without disrupting teaching — digital admissions with document validation, student and parent portals, and reporting that produces itself.",
    ],
    problems: [
      "Admissions applications collected on paper or unstructured email",
      "Applicant documents chased manually and tracked in spreadsheets",
      "Parent communication sent one message at a time",
      "Student records split across several disconnected systems",
      "Fee and payment tracking reconciled by hand",
      "Term reporting assembled manually from multiple sources",
    ],
    workflows: [
      { title: "Admissions intake", desc: "Structured applications with validation and document checklists." },
      { title: "Application review", desc: "Multi-stage review with scoring, notes and decision records." },
      { title: "Enrolment", desc: "Offer, acceptance and onboarding handled digitally end to end." },
      { title: "Student & parent portal", desc: "Records, documents, progress and announcements in one place." },
      { title: "Fee tracking", desc: "Invoicing, payment status and reminders without manual reconciliation." },
      { title: "Reporting", desc: "Enrolment, attendance and outcome reporting generated automatically." },
    ],
    solutions: [
      { title: "Admissions systems", desc: "Digital applications with review workflow.", slug: "custom-software" },
      { title: "Student & parent portals", desc: "Self-service records, documents and updates.", slug: "customer-portals" },
      { title: "Administrative automation", desc: "Communication, reminders and reconciliation automated.", slug: "business-automation" },
      { title: "Reporting dashboards", desc: "Enrolment and outcome reporting on demand.", slug: "dashboard-development" },
    ],
    caseStudy: {
      challenge:
        "An institution processed admissions through email and spreadsheets. Staff chased documents manually, applicants had no visibility of their status, and reporting on the intake was assembled by hand.",
      solution:
        "A digital admissions platform with structured applications, automated document requests, a multi-stage review workflow, and an applicant portal showing live status.",
      tech: ["Next.js", "Node.js", "PostgreSQL", "S3", "AWS"],
      timeline: "11 weeks",
      results: [
        "Application document chasing largely automated",
        "Applicants able to see status without contacting staff",
        "Intake reporting available live rather than assembled",
        "Administrative time per application substantially reduced",
      ],
    },
    faqs: [
      {
        q: "Can it integrate with our student information system?",
        a: "Where the SIS exposes an API or supported export, yes. We typically add the applicant-facing and workflow layers rather than replacing the system of record.",
      },
      {
        q: "How do you handle student data protection?",
        a: "Role-based access, encryption, audit logging and regional hosting as required. Data protection obligations are scoped during discovery.",
      },
      {
        q: "Can parents and students have different access?",
        a: "Yes. Separate roles with distinct permissions and views are standard, including guardian relationships and consent handling.",
      },
      {
        q: "Can it handle online fee payment?",
        a: "Yes. Payment gateway integration with automated reconciliation and reminders is a common inclusion.",
      },
    ],
  },

  // --------------------------------------------------- professional-services
  {
    slug: "professional-services",
    name: "Professional Services",
    h1: "Software for Professional Services & Consulting Firms",
    metaTitle: "Professional Services Software Development | Biztreck",
    metaDescription:
      "Client portals, utilisation dashboards and workflow automation for consulting, legal and agency businesses. Biztreck helps firms protect billable time.",
    keywords: [
      "professional services software development",
      "consulting firm software",
      "law firm software development",
      "client portal for consultants",
      "utilisation reporting dashboard",
    ],
    tagline: "Protect billable time.",
    blurb: "Client portals, utilisation reporting and matter workflows.",
    intro: [
      "In a professional services firm, every hour spent on administration is an hour not billed. Yet client onboarding, document collection, status updates and internal reporting quietly consume a significant share of senior time.",
      "Biztreck builds the systems that give that time back: client portals that handle document exchange and status, automated matter and project workflows, and utilisation reporting that no longer depends on one analyst and a spreadsheet.",
    ],
    problems: [
      "Senior staff spending billable hours on administrative follow-up",
      "Client documents collected and chased over email",
      "Matter or project status requested by clients constantly",
      "Utilisation and margin reporting assembled manually each month",
      "Time capture inconsistent, so billing leaks",
      "Knowledge and precedent documents scattered and hard to find",
    ],
    workflows: [
      { title: "Client onboarding", desc: "Guided intake with conflict checks and document requirements." },
      { title: "Matter or project setup", desc: "Standardised structure, owners and milestones from templates." },
      { title: "Document collection", desc: "Automated requests, reminders and secure upload." },
      { title: "Time capture", desc: "Low-friction recording so billable work is not lost." },
      { title: "Client status updates", desc: "Portal visibility replacing status emails and calls." },
      { title: "Utilisation reporting", desc: "Live utilisation, realisation and project margin." },
    ],
    solutions: [
      { title: "Client portals", desc: "Secure document exchange and live matter status.", slug: "customer-portals" },
      { title: "Utilisation dashboards", desc: "Live utilisation, realisation and margin.", slug: "dashboard-development" },
      { title: "AI drafting & triage", desc: "First-draft replies and summaries for review.", slug: "ai-automation" },
      { title: "Workflow automation", desc: "Onboarding, approvals and reminders automated.", slug: "business-automation" },
    ],
    caseStudy: {
      challenge:
        "A consultancy tracked utilisation, pipeline and margin across a time-tracking tool, a CRM and accounting software. Monthly board reporting took three days and figures were frequently disputed in the meeting.",
      solution:
        "An automated data pipeline into a unified reporting layer, with a board dashboard covering utilisation, pipeline coverage and project margin, plus drill-down to underlying records.",
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
        q: "Can you integrate with our time and billing system?",
        a: "Yes. Pulling time, billing and cost data into unified reporting is one of the most common engagements, and rarely requires replacing the billing platform.",
      },
      {
        q: "Is a client portal appropriate for confidential matters?",
        a: "Yes, and it is usually far safer than email. Per-client data isolation, MFA, encrypted storage and full access logging are standard.",
      },
      {
        q: "Can AI help without risking confidentiality?",
        a: "Yes, with the right architecture: enterprise API tiers that do not train on your data, grounding in your own documents, and human review before anything reaches a client.",
      },
      {
        q: "How do you improve time capture?",
        a: "Mostly by reducing friction — capture at the point of work, sensible defaults, and prompts based on calendar and system activity rather than relying on memory at week end.",
      },
    ],
  },
];

export function getIndustry(slug: string) {
  return INDUSTRIES.find((i) => i.slug === slug);
}

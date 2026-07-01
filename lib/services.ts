// Service landing-page content. Each entry becomes an indexable page at
// /services/<slug> with its own metadata + JSON-LD, targeting a keyword cluster
// so Google and AI answer engines can rank/cite Biztreck for that intent.

export type Faq = { q: string; a: string };

export type Service = {
  slug: string;
  name: string; // short label (nav, cards, schema)
  h1: string; // on-page H1 (keyword-led)
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  serviceType: string; // schema.org serviceType
  tagline: string;
  intro: string[]; // paragraphs
  deliverables: { title: string; desc: string }[];
  tech: string[];
  process: { step: string; desc: string }[];
  faqs: Faq[];
  related: string[]; // slugs
};

export const SERVICES: Service[] = [
  {
    slug: "website-development",
    name: "Website Development",
    h1: "Website Development Company in India",
    metaTitle: "Website Development Company in India | Biztreck Solutions",
    metaDescription:
      "Biztreck Solutions is a website development company in Greater Noida, Delhi NCR, building fast, SEO-ready business websites and web apps with Next.js & React. Get a quote.",
    keywords: [
      "website development company",
      "website building company",
      "business website development",
      "next.js development agency",
      "react website development india",
      "web development greater noida",
    ],
    serviceType: "Website development",
    tagline: "Fast, SEO-ready websites that convert.",
    intro: [
      "Biztreck Solutions builds production-grade business websites and web applications that load fast, rank on Google, and turn visitors into customers. We engineer on modern stacks — Next.js, React and headless CMS — so your site is fast, secure and easy to grow.",
      "From marketing sites and landing pages to complex web platforms, every build ships with technical SEO, accessibility and Core Web Vitals baked in from day one — not bolted on later.",
    ],
    deliverables: [
      { title: "Custom design & UX", desc: "Conversion-focused, responsive design tailored to your brand and audience." },
      { title: "Next.js / React build", desc: "Server-rendered, lightning-fast front ends with clean, maintainable code." },
      { title: "Headless CMS", desc: "Edit content yourself with a modern CMS — no developer needed for updates." },
      { title: "Technical SEO", desc: "Semantic markup, structured data, sitemaps and Core Web Vitals tuning." },
      { title: "Integrations", desc: "Payments, CRMs, analytics, email and any third-party API you depend on." },
    ],
    tech: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Headless CMS", "Vercel / AWS"],
    process: [
      { step: "Discovery", desc: "We map your goals, audience and required features into a clear scope." },
      { step: "Design", desc: "Wireframes and high-fidelity UI you sign off before a line of code." },
      { step: "Build", desc: "Iterative development with previews you can review at every stage." },
      { step: "Launch & grow", desc: "Performance, SEO and analytics set up so the site keeps improving." },
    ],
    faqs: [
      {
        q: "How much does a website cost in India?",
        a: "A professional business website from Biztreck typically starts around ₹40,000–₹1,50,000 depending on the number of pages, custom design, CMS and integrations. We give a fixed quote after a short discovery call.",
      },
      {
        q: "How long does it take to build a website?",
        a: "Most marketing websites launch in 2–5 weeks. Larger web applications take longer depending on scope. We share a timeline upfront and previews throughout.",
      },
      {
        q: "Will my website rank on Google?",
        a: "Every Biztreck website ships with technical SEO — fast Core Web Vitals, structured data, clean URLs and sitemaps — which is the foundation for ranking. We also offer ongoing SEO to grow rankings over time.",
      },
      {
        q: "Do you redesign existing websites?",
        a: "Yes. Our website revamp service modernises outdated sites with new design and performance while preserving your existing SEO and traffic.",
      },
    ],
    related: ["website-revamp", "app-development", "seo-services"],
  },
  {
    slug: "custom-software-development",
    name: "Custom Software Development",
    h1: "Custom Software Development Company",
    metaTitle: "Custom Software Development Company | Biztreck Solutions",
    metaDescription:
      "Custom software development company in India. Biztreck builds bespoke web apps, internal tools, SaaS platforms and automations tailored to your business. Talk to us.",
    keywords: [
      "custom software development company",
      "custom software building",
      "bespoke software development india",
      "saas development company",
      "internal tools development",
      "business automation software",
    ],
    serviceType: "Custom software development",
    tagline: "Software built around your business — not the other way round.",
    intro: [
      "Biztreck Solutions designs and builds custom software that fits your exact workflow: SaaS products, internal dashboards, customer portals, ERPs and automations that replace spreadsheets and manual work.",
      "We own the full stack — architecture, backend, front end, databases, cloud and security — so you get one accountable team from idea to a maintained, scalable product.",
    ],
    deliverables: [
      { title: "Discovery & architecture", desc: "We translate your processes into a robust, scalable technical design." },
      { title: "Full-stack build", desc: "Secure APIs, databases and polished front ends built to last." },
      { title: "SaaS & multi-tenant", desc: "Subscription billing, roles, permissions and tenant isolation." },
      { title: "Automation & integrations", desc: "Connect the tools you already use and automate repetitive work." },
      { title: "Support & scaling", desc: "Monitoring, maintenance and iteration as your needs grow." },
    ],
    tech: ["Next.js", "Node.js", "TypeScript", "PostgreSQL / MongoDB", "AWS / GCP", "Docker / Kubernetes"],
    process: [
      { step: "Discovery", desc: "Workshops to map requirements, users and success metrics." },
      { step: "Architecture", desc: "A technical plan, data model and milestone roadmap." },
      { step: "Agile build", desc: "Working software shipped in short cycles with your feedback." },
      { step: "Launch & support", desc: "Deployment, training, monitoring and ongoing improvements." },
    ],
    faqs: [
      {
        q: "What is custom software development?",
        a: "Custom software development is building an application tailored to one organisation's specific processes, instead of using off-the-shelf software. Biztreck builds custom web apps, SaaS platforms, internal tools and automations end to end.",
      },
      {
        q: "How much does custom software cost?",
        a: "Custom software projects from Biztreck generally start around ₹2,00,000 and scale with complexity. We scope a fixed first phase (often an MVP) so you can launch and validate before investing further.",
      },
      {
        q: "Do you build SaaS products?",
        a: "Yes. We build multi-tenant SaaS platforms with authentication, role-based access, subscription billing and the cloud infrastructure to scale.",
      },
      {
        q: "Will I own the source code?",
        a: "Yes. You own 100% of the code and IP we build for you, with full repository access.",
      },
    ],
    related: ["app-development", "website-development", "it-services"],
  },
  {
    slug: "app-development",
    name: "App Development",
    h1: "Mobile App Development Company",
    metaTitle: "Mobile App Development Company in India | Biztreck Solutions",
    metaDescription:
      "Mobile app development company building iOS, Android & cross-platform apps with React Native and Flutter — from MVP to App Store launch. Biztreck Solutions, India.",
    keywords: [
      "app development company",
      "mobile app development india",
      "ios app development",
      "android app development",
      "react native development company",
      "cross platform app development",
    ],
    serviceType: "Mobile app development",
    tagline: "Native-quality apps for iOS and Android.",
    intro: [
      "Biztreck Solutions builds mobile apps people love to use — from MVPs to polished, App Store-ready products. We ship cross-platform with React Native and Flutter so you get iOS and Android from one codebase, faster and at lower cost.",
      "Design, development, backend APIs, app-store submission and post-launch support are all handled by one senior team.",
    ],
    deliverables: [
      { title: "UI/UX design", desc: "Intuitive, platform-aware design that feels native on every device." },
      { title: "Cross-platform build", desc: "One React Native / Flutter codebase for iOS and Android." },
      { title: "Backend & APIs", desc: "Secure, scalable backends, auth, push notifications and payments." },
      { title: "App Store launch", desc: "We handle App Store and Play Store submission and review." },
      { title: "Maintenance", desc: "Updates, monitoring and new features after launch." },
    ],
    tech: ["React Native", "Flutter", "TypeScript", "Node.js", "Firebase", "AWS"],
    process: [
      { step: "Discovery", desc: "Define the core flows and an MVP that ships fast." },
      { step: "Design", desc: "Prototype the experience and validate before building." },
      { step: "Build & test", desc: "Develop, test on real devices, and iterate on feedback." },
      { step: "Launch", desc: "Submit to the stores and support the live app." },
    ],
    faqs: [
      {
        q: "How much does it cost to build an app?",
        a: "A mobile app MVP from Biztreck typically starts around ₹2,50,000 and scales with features. Cross-platform development with React Native keeps cost down by covering iOS and Android from one codebase.",
      },
      {
        q: "How long does app development take?",
        a: "A focused MVP usually launches in 6–12 weeks. We prioritise the core features first so you can get to market and gather real user feedback.",
      },
      {
        q: "Should I build native or cross-platform?",
        a: "For most products we recommend cross-platform (React Native or Flutter): you reach iOS and Android with one codebase, faster and cheaper, with near-native performance. We advise native when an app needs heavy device-specific features.",
      },
    ],
    related: ["custom-software-development", "website-development", "startup-launch"],
  },
  {
    slug: "it-services",
    name: "IT Services",
    h1: "IT Services Company for Growing Businesses",
    metaTitle: "IT Services Company in India | Biztreck Solutions",
    metaDescription:
      "Biztreck Solutions is an IT services company offering web & app development, custom software, cloud, DevOps and SEO under one roof. Greater Noida, Delhi NCR & remote.",
    keywords: [
      "it services company",
      "it services india",
      "it solutions company",
      "it consulting greater noida",
      "software development services",
      "cloud and devops services",
    ],
    serviceType: "IT services",
    tagline: "One technology partner for your whole digital stack.",
    intro: [
      "Biztreck Solutions is a full-service IT company: websites, mobile apps, custom software, cloud infrastructure, DevOps and SEO — delivered by one senior team instead of five disconnected vendors.",
      "Whether you're a startup that needs everything or an established business modernising its technology, we plan, build, deploy and maintain it, with clear communication and accountable delivery.",
    ],
    deliverables: [
      { title: "Web & app development", desc: "Marketing sites, web platforms and mobile apps." },
      { title: "Custom software", desc: "Bespoke tools, SaaS and automations for your operations." },
      { title: "Cloud & DevOps", desc: "AWS/GCP/Azure setup, CI/CD, containers and monitoring." },
      { title: "SEO & growth", desc: "Technical SEO and content to grow qualified traffic." },
      { title: "Maintenance & support", desc: "Ongoing updates, security and reliability." },
    ],
    tech: ["Next.js", "React Native", "Node.js", "AWS / GCP / Azure", "Kubernetes", "PostgreSQL / MongoDB"],
    process: [
      { step: "Consult", desc: "We understand your business and recommend the right approach." },
      { step: "Plan", desc: "A roadmap, scope and transparent quote." },
      { step: "Deliver", desc: "We build and ship in iterative, reviewable milestones." },
      { step: "Support", desc: "Ongoing maintenance and a partner you can call." },
    ],
    faqs: [
      {
        q: "What IT services does Biztreck offer?",
        a: "Biztreck offers website development, mobile app development, custom software, cloud and DevOps, and SEO — a complete IT services stack from one team based in Greater Noida, Delhi NCR, serving clients across India and remotely worldwide.",
      },
      {
        q: "Do you work with startups and small businesses?",
        a: "Yes. We work with startups, SMEs and established companies. For early-stage teams we often start with an MVP or a single high-impact project and grow from there.",
      },
      {
        q: "Do you provide ongoing IT support?",
        a: "Yes. We offer maintenance, monitoring, security updates and feature development as ongoing retainers so your systems stay reliable.",
      },
    ],
    related: ["custom-software-development", "devops-solutions", "website-development"],
  },
  {
    slug: "website-revamp",
    name: "Website Revamp",
    h1: "Website Revamp & Redesign Services",
    metaTitle: "Website Revamp & Redesign Services | Biztreck Solutions",
    metaDescription:
      "Modernise your outdated website with Biztreck. New design, faster performance and better UX — without losing your existing SEO or traffic. Get a redesign quote.",
    keywords: [
      "website revamp",
      "website redesign company",
      "website modernization",
      "redesign without losing seo",
      "website performance optimization",
    ],
    serviceType: "Website redesign",
    tagline: "A modern, fast website — without losing your rankings.",
    intro: [
      "If your website looks dated, loads slowly or no longer converts, Biztreck revamps it with a modern design system, faster performance and conversion-focused UX — while carefully preserving the SEO and traffic you've already earned.",
      "We audit, redesign and re-platform with safe SEO migration so your search rankings carry over to the new site.",
    ],
    deliverables: [
      { title: "UX & design refresh", desc: "A modern, on-brand design that builds trust and converts." },
      { title: "Performance overhaul", desc: "Faster load times and strong Core Web Vitals." },
      { title: "Safe SEO migration", desc: "Redirects, structured data and audits to protect rankings." },
      { title: "CMS upgrade", desc: "Move to a modern stack you can update easily." },
    ],
    tech: ["Next.js", "React", "Tailwind CSS", "Headless CMS", "Lighthouse / Core Web Vitals"],
    process: [
      { step: "Audit", desc: "We assess design, speed, SEO and conversion gaps." },
      { step: "Redesign", desc: "New UI and improved user journeys." },
      { step: "Migrate", desc: "Rebuild with redirects and SEO preserved." },
      { step: "Launch", desc: "Go live and monitor rankings and performance." },
    ],
    faqs: [
      {
        q: "Will a website redesign hurt my Google rankings?",
        a: "Not when it's done correctly. Biztreck handles SEO migration — preserving URLs or adding redirects, keeping structured data and content — so your rankings transfer to the new site. Done well, a faster, better site usually improves rankings.",
      },
      {
        q: "How much does a website revamp cost?",
        a: "A redesign typically starts around ₹50,000 depending on the size of the site and how much is rebuilt. We quote after auditing your current site.",
      },
    ],
    related: ["website-development", "seo-services", "app-development"],
  },
  {
    slug: "devops-solutions",
    name: "DevOps Solutions",
    h1: "DevOps & Cloud Infrastructure Services",
    metaTitle: "DevOps & Cloud Services | Biztreck Solutions",
    metaDescription:
      "DevOps services from Biztreck: CI/CD pipelines, Kubernetes, Docker, cloud architecture and observability on AWS, GCP and Azure so your team ships faster and safer.",
    keywords: [
      "devops services",
      "devops consulting company",
      "kubernetes consulting",
      "ci/cd pipeline setup",
      "cloud infrastructure services",
      "aws gcp azure consulting",
    ],
    serviceType: "DevOps and cloud services",
    tagline: "Ship faster and safer with automated infrastructure.",
    intro: [
      "Biztreck sets up the cloud infrastructure and automation that let your team deploy with confidence: CI/CD pipelines, containers, Kubernetes, infrastructure-as-code and observability across AWS, GCP and Azure.",
      "We reduce downtime, cut cloud costs and make releases boring — in the best way.",
    ],
    deliverables: [
      { title: "CI/CD automation", desc: "Automated build, test and deploy pipelines." },
      { title: "Containers & Kubernetes", desc: "Docker and orchestrated, scalable deployments." },
      { title: "Cloud architecture", desc: "Well-architected, cost-efficient AWS/GCP/Azure setups." },
      { title: "Observability", desc: "Monitoring, logging and alerting so you catch issues early." },
    ],
    tech: ["AWS", "GCP", "Azure", "Kubernetes", "Docker", "Terraform", "GitHub Actions"],
    process: [
      { step: "Assess", desc: "Review current infrastructure and pain points." },
      { step: "Design", desc: "Plan the pipeline, cloud and security architecture." },
      { step: "Implement", desc: "Automate deployments and harden the environment." },
      { step: "Operate", desc: "Monitoring and ongoing optimisation." },
    ],
    faqs: [
      {
        q: "What does a DevOps service include?",
        a: "Biztreck's DevOps service includes CI/CD pipeline setup, containerisation with Docker, Kubernetes orchestration, infrastructure-as-code, cloud architecture on AWS/GCP/Azure, and observability (monitoring, logging, alerting).",
      },
      {
        q: "Can you reduce our cloud costs?",
        a: "Often, yes. We right-size resources, optimise architecture and add cost monitoring, which commonly reduces cloud bills while improving reliability.",
      },
    ],
    related: ["it-services", "custom-software-development", "website-development"],
  },
  {
    slug: "seo-services",
    name: "SEO & Ranking",
    h1: "SEO Services & Google Ranking",
    metaTitle: "SEO Services Company in India | Biztreck Solutions",
    metaDescription:
      "Climb Google with Biztreck's SEO services — technical SEO, content strategy and link building with transparent reporting. Greater Noida, Delhi NCR & remote.",
    keywords: [
      "seo services company",
      "seo agency india",
      "technical seo services",
      "google ranking services",
      "local seo greater noida",
      "content and link building",
    ],
    serviceType: "Search engine optimization",
    tagline: "Measurable growth in search rankings and traffic.",
    intro: [
      "Biztreck grows your visibility on Google — and increasingly in AI answer engines — with technical SEO, content strategy and quality link building, backed by transparent reporting you can actually understand.",
      "We fix the foundations (speed, structure, indexing), build content that targets buyer intent, and earn the authority that moves rankings.",
    ],
    deliverables: [
      { title: "Technical SEO audit", desc: "Fix crawlability, speed, structured data and indexing." },
      { title: "Keyword & content strategy", desc: "Target the searches your customers actually make." },
      { title: "On-page optimisation", desc: "Titles, structure, internal links and schema." },
      { title: "Link building & authority", desc: "Earn quality backlinks that grow rankings." },
      { title: "Reporting", desc: "Clear monthly reports on rankings, traffic and leads." },
    ],
    tech: ["Google Search Console", "Core Web Vitals", "Schema.org", "Analytics", "Ahrefs / SEMrush"],
    process: [
      { step: "Audit", desc: "Technical and content audit of your current SEO." },
      { step: "Strategy", desc: "Keyword map and content plan by buyer intent." },
      { step: "Execute", desc: "On-page, technical fixes, content and links." },
      { step: "Report", desc: "Track rankings and iterate every month." },
    ],
    faqs: [
      {
        q: "How long does SEO take to show results?",
        a: "SEO is a medium-term investment. Technical fixes can help within weeks, but meaningful ranking and traffic growth typically appears over 3–6 months and compounds from there.",
      },
      {
        q: "Do you do local SEO?",
        a: "Yes. We optimise Google Business Profiles, local citations and location pages so businesses rank in their city — for example for searches in Greater Noida and Delhi NCR.",
      },
      {
        q: "Can you help my site get recommended by AI tools?",
        a: "Yes. We structure your content with clear, factual, well-marked-up information (structured data, FAQs, llms.txt) that AI answer engines like ChatGPT, Perplexity and Google AI Overviews can read and cite.",
      },
    ],
    related: ["website-development", "website-revamp", "it-services"],
  },
  {
    slug: "startup-launch",
    name: "Startup Launch (0 → 1)",
    h1: "Startup MVP Development & Launch",
    metaTitle: "Startup MVP Development & Launch | Biztreck Solutions",
    metaDescription:
      "From idea to launched product. Biztreck builds startup MVPs fast — branding, product, infrastructure and go-to-market in one place. Launch your zero-to-one with us.",
    keywords: [
      "mvp development company",
      "startup launch services",
      "zero to one product build",
      "build an mvp india",
      "product studio for startups",
    ],
    serviceType: "MVP development and startup launch",
    tagline: "From idea to launched product — fast.",
    intro: [
      "Biztreck helps founders go from zero to one: we turn an idea into a real, launched product with branding, an MVP build, the infrastructure to run it, and a go-to-market plan — all from one team.",
      "We focus ruthlessly on the core that proves your idea, so you launch quickly, learn from real users and raise or grow on evidence.",
    ],
    deliverables: [
      { title: "Product & scope", desc: "Define the smallest product that proves the idea." },
      { title: "Brand & identity", desc: "Name, logo, and a brand that earns trust." },
      { title: "MVP build", desc: "A real, shippable product in weeks, not months." },
      { title: "Infrastructure", desc: "Cloud, analytics and the basics to run and measure it." },
      { title: "Go-to-market", desc: "Launch assets and a plan to get first users." },
    ],
    tech: ["Next.js", "React Native", "Node.js", "AWS / Vercel", "Stripe", "Analytics"],
    process: [
      { step: "Shape", desc: "Pin down the problem, users and MVP scope." },
      { step: "Design", desc: "Brand and product design to validate fast." },
      { step: "Build", desc: "Ship the MVP in focused weekly sprints." },
      { step: "Launch", desc: "Go live, measure, and iterate with real feedback." },
    ],
    faqs: [
      {
        q: "How fast can you build an MVP?",
        a: "Biztreck typically ships a startup MVP in 4–10 weeks by focusing on the core features that validate your idea, then iterating after launch.",
      },
      {
        q: "Do you work for equity?",
        a: "We primarily work on a fixed-fee or retainer basis, and consider hybrid cash-plus-equity arrangements for the right early-stage partnerships.",
      },
    ],
    related: ["app-development", "custom-software-development", "website-development"],
  },
];

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

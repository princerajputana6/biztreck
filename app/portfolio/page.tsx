import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Company Portfolio 2025 — Biztreck Solutions",
  description:
    "Biztreck Solutions portfolio — 120+ projects shipped, 9 live in-house products, and a senior team delivering web, mobile, DevOps, and SEO for founders worldwide.",
  alternates: { canonical: "/portfolio" },
  openGraph: {
    type: "website",
    title: "Biztreck Solutions · Company Portfolio 2025",
    description:
      "Senior product studio from Greater Noida — designing, engineering, and scaling digital products for startups and growth teams worldwide.",
  },
};

export default function PortfolioPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;700&display=swap');

        .bpf-root *, .bpf-root *::before, .bpf-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .bpf-root {
          --ink: #0E0F10;
          --ink2: #3A3C40;
          --ink3: #717480;
          --surface: #FFFFFF;
          --surface2: #F7F8F9;
          --surface3: #F0F1F3;
          --accent: #1A4EDB;
          --accent2: #0D35A8;
          --accent-soft: #EEF2FF;
          --gold: #C9942A;
          --gold-soft: #FDF6E7;
          --border: #E4E6EB;
          --page-w: 900px;
          --sans: 'Inter', system-ui, sans-serif;
          --serif: 'Playfair Display', Georgia, serif;
          font-family: var(--sans);
          background: #ECEEF2;
          color: var(--ink);
          line-height: 1.65;
          -webkit-font-smoothing: antialiased;
          min-height: 100vh;
          padding: 40px 16px;
        }

        .bpf-page {
          max-width: var(--page-w);
          margin: 0 auto;
          background: var(--surface);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 40px rgba(0,0,0,0.12);
        }

        /* COVER */
        .bpf-cover {
          background: var(--ink);
          padding: 70px 64px 64px;
          position: relative;
          overflow: hidden;
        }
        .bpf-cover::before {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 360px; height: 360px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 50%;
        }
        .bpf-cover::after {
          content: '';
          position: absolute;
          top: -20px; right: -20px;
          width: 220px; height: 220px;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 50%;
        }
        .bpf-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 100px;
          padding: 5px 14px;
          margin-bottom: 36px;
        }
        .bpf-badge span { color: #6EE7B7; }
        .bpf-cover h1 {
          font-family: var(--serif);
          font-size: 52px;
          font-weight: 700;
          color: #FFFFFF;
          line-height: 1.08;
          letter-spacing: -0.02em;
          margin-bottom: 20px;
          max-width: 620px;
        }
        .bpf-cover h1 em {
          font-style: normal;
          color: #93C5FD;
        }
        .bpf-cover-sub {
          font-size: 15px;
          color: rgba(255,255,255,0.55);
          max-width: 480px;
          line-height: 1.7;
          margin-bottom: 52px;
        }
        .bpf-cover-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 40px;
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 32px;
        }
        .bpf-cover-meta-item label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          display: block;
          margin-bottom: 4px;
        }
        .bpf-cover-meta-item span {
          font-size: 14px;
          color: rgba(255,255,255,0.85);
          font-weight: 500;
        }

        /* SECTION */
        .bpf-section {
          padding: 56px 64px;
          border-bottom: 1px solid var(--border);
        }
        .bpf-section:last-child { border-bottom: none; }
        .bpf-section--alt { background: var(--surface2); }

        .bpf-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 8px;
        }
        .bpf-title {
          font-family: var(--serif);
          font-size: 30px;
          font-weight: 700;
          color: var(--ink);
          line-height: 1.2;
          margin-bottom: 6px;
          letter-spacing: -0.01em;
        }
        .bpf-sub {
          font-size: 14px;
          color: var(--ink3);
          max-width: 540px;
          line-height: 1.7;
          margin-bottom: 36px;
        }

        /* STATS */
        .bpf-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
        }
        .bpf-stat {
          background: var(--surface);
          padding: 28px 24px;
          text-align: center;
        }
        .bpf-stat-num {
          font-family: var(--serif);
          font-size: 38px;
          font-weight: 700;
          color: var(--ink);
          line-height: 1;
          margin-bottom: 6px;
        }
        .bpf-stat-num sup { font-size: 20px; vertical-align: super; font-weight: 400; }
        .bpf-stat-label { font-size: 12px; color: var(--ink3); font-weight: 500; }

        /* ABOUT */
        .bpf-about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: start;
        }
        .bpf-about-text p {
          font-size: 15px;
          color: var(--ink2);
          line-height: 1.75;
          margin-bottom: 16px;
        }
        .bpf-about-text p:last-child { margin-bottom: 0; }
        .bpf-highlights { display: flex; flex-direction: column; gap: 16px; }
        .bpf-highlight {
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 20px 22px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .bpf-hi-icon {
          width: 36px; height: 36px;
          background: var(--accent-soft);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          font-size: 17px;
        }
        .bpf-highlight h4 { font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 2px; }
        .bpf-highlight p { font-size: 12.5px; color: var(--ink3); line-height: 1.5; }

        /* SERVICES */
        .bpf-services {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .bpf-service {
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 24px 22px;
          transition: border-color 0.2s;
        }
        .bpf-service:hover { border-color: var(--accent); }
        .bpf-service-icon { font-size: 22px; margin-bottom: 12px; display: block; }
        .bpf-service h3 { font-size: 14px; font-weight: 600; color: var(--ink); margin-bottom: 8px; }
        .bpf-service p { font-size: 13px; color: var(--ink3); line-height: 1.6; margin-bottom: 14px; }
        .bpf-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .bpf-tag {
          font-size: 11px; font-weight: 500;
          color: var(--accent2); background: var(--accent-soft);
          border-radius: 100px; padding: 3px 10px;
        }

        /* PRODUCTS */
        .bpf-products {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .bpf-product {
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 22px 24px;
          position: relative;
        }
        .bpf-live {
          position: absolute; top: 16px; right: 16px;
          font-size: 10px; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: #065F46; background: #D1FAE5;
          padding: 3px 9px; border-radius: 100px;
        }
        .bpf-product h3 { font-size: 15px; font-weight: 600; color: var(--ink); margin-bottom: 4px; padding-right: 60px; }
        .bpf-product-cat { font-size: 12px; color: var(--ink3); margin-bottom: 10px; }
        .bpf-product p { font-size: 13px; color: var(--ink2); line-height: 1.6; margin-bottom: 14px; }
        .bpf-product-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .bpf-ptag {
          font-size: 11px; font-weight: 500;
          color: var(--gold); background: var(--gold-soft);
          border-radius: 100px; padding: 3px 9px;
        }
        .bpf-product-url {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 12px; color: var(--accent);
          text-decoration: none; margin-top: 10px; font-weight: 500;
        }

        /* PROCESS */
        .bpf-steps { display: flex; flex-direction: column; }
        .bpf-step {
          display: grid;
          grid-template-columns: 48px 1fr;
          gap: 20px;
          align-items: start;
          padding: 24px 0;
          border-bottom: 1px solid var(--border);
        }
        .bpf-step:last-child { border-bottom: none; }
        .bpf-step-num {
          width: 40px; height: 40px;
          border: 1.5px solid var(--accent);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 600;
          color: var(--accent); flex-shrink: 0; margin-top: 2px;
        }
        .bpf-step h4 { font-size: 15px; font-weight: 600; color: var(--ink); margin-bottom: 4px; }
        .bpf-step p { font-size: 13.5px; color: var(--ink2); line-height: 1.65; }

        /* STACK */
        .bpf-stack {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .bpf-stack-group {
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 18px 16px;
        }
        .bpf-stack-group label {
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--ink3); display: block; margin-bottom: 10px;
        }
        .bpf-stack-item {
          font-size: 13px; color: var(--ink2);
          padding: 4px 0;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; gap: 6px;
        }
        .bpf-stack-item:last-child { border-bottom: none; }
        .bpf-dot { width: 5px; height: 5px; background: var(--accent); border-radius: 50%; flex-shrink: 0; }

        /* TESTIMONIALS */
        .bpf-testimonials {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .bpf-testimonial {
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 24px;
        }
        .bpf-testimonial-text {
          font-size: 14px; color: var(--ink2);
          line-height: 1.7; margin-bottom: 18px;
          font-style: italic;
        }
        .bpf-testimonial-text::before { content: '\\201C'; }
        .bpf-testimonial-text::after { content: '\\201D'; }
        .bpf-testimonial-author { display: flex; align-items: center; gap: 12px; }
        .bpf-logo-box {
          width: 44px; height: 44px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--surface);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.03em;
          color: var(--ink);
          overflow: hidden;
        }
        .bpf-company-name { font-size: 13px; font-weight: 600; color: var(--ink); }
        .bpf-company-cat { font-size: 12px; color: var(--ink3); }

        /* WHY */
        .bpf-why {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .bpf-why-card {
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 22px;
        }
        .bpf-why-card h4 { font-size: 14px; font-weight: 600; color: var(--ink); margin-bottom: 6px; }
        .bpf-why-card p { font-size: 13px; color: var(--ink3); line-height: 1.6; }

        /* CTA */
        .bpf-cta {
          background: var(--ink);
          padding: 56px 64px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .bpf-cta::before {
          content: '';
          position: absolute;
          bottom: -100px; left: 50%;
          transform: translateX(-50%);
          width: 500px; height: 500px;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 50%;
        }
        .bpf-cta h2 {
          font-family: var(--serif);
          font-size: 36px; color: #FFFFFF;
          margin-bottom: 14px; letter-spacing: -0.01em;
        }
        .bpf-cta p {
          font-size: 15px; color: rgba(255,255,255,0.55);
          margin-bottom: 36px; max-width: 440px;
          margin-left: auto; margin-right: auto;
        }
        .bpf-cta-links {
          display: flex; justify-content: center;
          flex-wrap: wrap; gap: 32px; margin-bottom: 36px;
        }
        .bpf-cta-link { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .bpf-cta-link label {
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(255,255,255,0.35);
        }
        .bpf-cta-link a {
          font-size: 15px; color: rgba(255,255,255,0.85);
          text-decoration: none; font-weight: 500;
        }
        .bpf-cta-link a:hover { color: #93C5FD; }
        .bpf-cta-footer {
          font-size: 12px; color: rgba(255,255,255,0.25);
          letter-spacing: 0.05em;
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 28px; margin-top: 8px;
        }

        @media (max-width: 700px) {
          .bpf-cover { padding: 48px 24px 40px; }
          .bpf-cover h1 { font-size: 34px; }
          .bpf-section { padding: 40px 24px; }
          .bpf-stats { grid-template-columns: repeat(2, 1fr); }
          .bpf-about-grid { grid-template-columns: 1fr; }
          .bpf-services { grid-template-columns: 1fr; }
          .bpf-products { grid-template-columns: 1fr; }
          .bpf-stack { grid-template-columns: repeat(2, 1fr); }
          .bpf-testimonials { grid-template-columns: 1fr; }
          .bpf-why { grid-template-columns: 1fr 1fr; }
          .bpf-cta { padding: 40px 24px; }
          .bpf-cta h2 { font-size: 26px; }
        }
      `}</style>

      <div className="bpf-root">
        <div className="bpf-page">

          {/* COVER */}
          <div className="bpf-cover">
            <div className="bpf-badge"><span>●</span> Company Portfolio · 2025</div>
            <h1>We build digital products that move <em>your business</em> forward.</h1>
            <p className="bpf-cover-sub">Biztreck Solutions is a senior product studio from Greater Noida, Delhi NCR — designing, engineering, and scaling web & mobile products for founders, startups, and growth teams worldwide.</p>
            <div className="bpf-cover-meta">
              <div className="bpf-cover-meta-item"><label>Studio</label><span>Biztreck Solutions</span></div>
              <div className="bpf-cover-meta-item"><label>Location</label><span>Greater Noida, Delhi NCR</span></div>
              <div className="bpf-cover-meta-item"><label>Contact</label><span>connect@biztreck.world</span></div>
              <div className="bpf-cover-meta-item"><label>Website</label><span>biztreck.world</span></div>
            </div>
          </div>

          {/* STATS */}
          <div className="bpf-section" style={{ paddingTop: 48, paddingBottom: 48 }}>
            <div className="bpf-stats">
              <div className="bpf-stat"><div className="bpf-stat-num">120<sup>+</sup></div><div className="bpf-stat-label">Projects shipped</div></div>
              <div className="bpf-stat"><div className="bpf-stat-num">30<sup>+</sup></div><div className="bpf-stat-label">Startups launched</div></div>
              <div className="bpf-stat"><div className="bpf-stat-num">98<sup>%</sup></div><div className="bpf-stat-label">Client retention rate</div></div>
              <div className="bpf-stat"><div className="bpf-stat-num">5<sup>x</sup></div><div className="bpf-stat-label">Avg. organic uplift</div></div>
            </div>
          </div>

          {/* ABOUT */}
          <div className="bpf-section">
            <div className="bpf-eyebrow">About Us</div>
            <div className="bpf-title">One team. Every stage.</div>
            <p className="bpf-sub">We blend product thinking, design, engineering, and growth so you don't need five vendors.</p>
            <div className="bpf-about-grid">
              <div className="bpf-about-text">
                <p>Biztreck Solutions is a senior product studio headquartered in Greater Noida, Delhi NCR. We design, build, deploy and scale digital products for modern businesses across India, UAE, the US, and Europe.</p>
                <p>Unlike generalist agencies, our team consists exclusively of senior specialists — no juniors learning on your budget. Every engagement runs on fixed-scope quotes, milestone-based billing, and complete source code ownership transferred to you at handover.</p>
                <p>We've shipped 120+ projects and launched 30+ startups from scratch — including 9 of our own in-house products now operating live across childcare, construction, hiring, travel, and hospitality.</p>
              </div>
              <div className="bpf-highlights">
                {[
                  { icon: "🏗️", title: "Senior team only", desc: "No juniors on your project. Senior designers, engineers, and DevOps specialists throughout." },
                  { icon: "⚡", title: "Fast turnarounds", desc: "MVPs in 4–8 weeks. Website revamps in 2–6 weeks. We move without cutting corners." },
                  { icon: "🌐", title: "Global delivery", desc: "Clients across India, UAE, US, and EU. Async-first communication that respects time zones." },
                  { icon: "🔒", title: "NDA-first & source code ownership", desc: "Every engagement begins with an NDA. You own 100% of the code at handover." },
                ].map((h) => (
                  <div className="bpf-highlight" key={h.title}>
                    <div className="bpf-hi-icon">{h.icon}</div>
                    <div><h4>{h.title}</h4><p>{h.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SERVICES */}
          <div className="bpf-section bpf-section--alt">
            <div className="bpf-eyebrow">What We Do</div>
            <div className="bpf-title">Six services. One team.</div>
            <p className="bpf-sub">End-to-end execution from design and engineering to growth and infrastructure.</p>
            <div className="bpf-services">
              {[
                { icon: "🔄", title: "Website Revamp", desc: "Modernise outdated websites with new design systems, faster performance, and conversion-focused UX — without losing SEO equity.", tags: ["UI/UX redesign", "Performance audit", "SEO migration"] },
                { icon: "💻", title: "Web Development", desc: "Production-grade websites and web apps built with Next.js, React, and modern stacks — pixel-perfect and lightning fast.", tags: ["Next.js / React", "Headless CMS", "API integrations"] },
                { icon: "📱", title: "App Development", desc: "Native-quality iOS, Android, and cross-platform apps with React Native and Flutter — from MVP to App Store launch.", tags: ["iOS & Android", "React Native", "Flutter"] },
                { icon: "⚙️", title: "DevOps Solutions", desc: "CI/CD pipelines, container orchestration, cloud architecture, and observability so your team ships safer and faster.", tags: ["AWS / GCP / Azure", "Kubernetes", "CI/CD"] },
                { icon: "📈", title: "SEO & Ranking", desc: "Climb Google with technical SEO, content strategy, and link building. Measurable growth with transparent reporting.", tags: ["Technical SEO", "Keyword strategy", "Link building"] },
                { icon: "🚀", title: "Startup Launch (0 → 1)", desc: "From an idea on a napkin to a launched product. Branding, MVP, infrastructure, and go-to-market — all in one place.", tags: ["MVP in weeks", "Brand & identity", "Go-to-market"] },
              ].map((s) => (
                <div className="bpf-service" key={s.title}>
                  <span className="bpf-service-icon">{s.icon}</span>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  <div className="bpf-tags">{s.tags.map((t) => <span className="bpf-tag" key={t}>{t}</span>)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* IN-HOUSE PRODUCTS */}
          <div className="bpf-section">
            <div className="bpf-eyebrow">In-House Products</div>
            <div className="bpf-title">We don't just build for clients. We build for the world.</div>
            <p className="bpf-sub">9 live products solving real problems — childcare, construction, hiring, travel, events, and more.</p>
            <div className="bpf-products">
              {[
                { name: "KuddlKin", cat: "Childcare · B2C Marketplace", desc: "Connects parents with trusted, verified childcare professionals. From spontaneous date nights to regular nanny care — safe, verified, on-demand.", tags: ["B2C App", "Marketplace", "Verified pros"], url: "https://kuddl.co", urlLabel: "kuddl.co ↗" },
                { name: "Buildifai", cat: "Construction · Marketplace", desc: "Buy construction materials online and book trusted builders — from bricks to handover. One platform for complete construction project solutions.", tags: ["Marketplace", "Construction", "Logistics"], url: "https://buildifai.vercel.app", urlLabel: "buildifai.vercel.app ↗" },
                { name: "Rezulaizer", cat: "HR Tech · AI / ML", desc: "AI-powered resume parsing, intelligent candidate matching, and automated assessments. Screen 10x faster, hire 3x better.", tags: ["AI / ML", "B2B SaaS", "HR Tech"], url: "https://rezulaizer.com", urlLabel: "rezulaizer.com ↗" },
                { name: "TryLinqr", cat: "Events · Ticketing", desc: "India's premium event ecosystem. Discover and book India's best events — bike rides, food experiences, workshops, festivals — in under 2 minutes.", tags: ["Events", "Ticketing", "B2C App"], url: "https://trylinqr.com", urlLabel: "trylinqr.com ↗" },
                { name: "Atithira", cat: "Restaurant Tech · ERP", desc: "Full-fledged ERP for restaurants and hotels. QR table ordering, kitchen management, billing, inventory, staff, and analytics in one platform.", tags: ["Restaurant", "ERP", "QR ordering"], url: "https://atithira.vercel.app", urlLabel: "atithira.vercel.app ↗" },
                { name: "Angels & Roadsters", cat: "Community · Motorcycle", desc: "India's first gender-equal bike club — 26,000+ members, 200+ rides across 15+ cities, flagship festival Trailstorm.", tags: ["Community", "India", "Gender-equal"], url: "https://angelsandroadsters.com", urlLabel: "angelsandroadsters.com ↗" },
              ].map((p) => (
                <div className="bpf-product" key={p.name}>
                  <span className="bpf-live">Live</span>
                  <h3>{p.name}</h3>
                  <div className="bpf-product-cat">{p.cat}</div>
                  <p>{p.desc}</p>
                  <div className="bpf-product-tags">{p.tags.map((t) => <span className="bpf-ptag" key={t}>{t}</span>)}</div>
                  <a className="bpf-product-url" href={p.url} target="_blank" rel="noopener noreferrer">{p.urlLabel}</a>
                </div>
              ))}
            </div>
          </div>

          {/* PROCESS */}
          <div className="bpf-section bpf-section--alt">
            <div className="bpf-eyebrow">How We Work</div>
            <div className="bpf-title">A predictable path from idea to scale.</div>
            <p className="bpf-sub">Five phases. Full visibility. No surprises.</p>
            <div className="bpf-steps">
              {[
                { n: "01", title: "Discovery", desc: "We listen, audit your existing stack and market position, and turn your goals into a clear, prioritised roadmap with timelines and a fixed-scope quote." },
                { n: "02", title: "Design", desc: "Wireframes, brand-aligned UI, and user flows — validated with you before a single line of code is written. You approve before we build." },
                { n: "03", title: "Build", desc: "Senior engineers ship in weekly sprints with full visibility on Slack and GitHub. Weekly demos keep you in the loop; no black boxes." },
                { n: "04", title: "Launch", desc: "CI/CD-driven release, infrastructure hardening, and a smooth go-live with zero downtime. We handle the technical handover checklist end-to-end." },
                { n: "05", title: "Grow", desc: "Post-launch monitoring, SEO, A/B testing, and iteration — we stay with you after go-live so your product keeps improving over time." },
              ].map((s) => (
                <div className="bpf-step" key={s.n}>
                  <div className="bpf-step-num">{s.n}</div>
                  <div><h4>{s.title}</h4><p>{s.desc}</p></div>
                </div>
              ))}
            </div>
          </div>

          {/* TECH STACK */}
          <div className="bpf-section">
            <div className="bpf-eyebrow">Tech Stack</div>
            <div className="bpf-title">Production-grade tools, all the way down.</div>
            <p className="bpf-sub">Battle-tested in production across all our client and in-house projects.</p>
            <div className="bpf-stack">
              {[
                { label: "Frontend", items: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion"] },
                { label: "Mobile", items: ["React Native", "Flutter", "Expo", "iOS (TestFlight)", "Android (Play)"] },
                { label: "Backend / DB", items: ["Node.js", "Python", "MongoDB Atlas", "PostgreSQL", "Redis"] },
                { label: "Cloud / DevOps", items: ["AWS / GCP / Azure", "Kubernetes", "Docker", "Vercel", "GitHub Actions"] },
              ].map((g) => (
                <div className="bpf-stack-group" key={g.label}>
                  <label>{g.label}</label>
                  {g.items.map((i) => <div className="bpf-stack-item" key={i}><div className="bpf-dot" />{i}</div>)}
                </div>
              ))}
            </div>
          </div>

          {/* TESTIMONIALS */}
          <div className="bpf-section bpf-section--alt">
            <div className="bpf-eyebrow">Client Love</div>
            <div className="bpf-title">Trusted by the products we built.</div>
            <p className="bpf-sub">Here's what teams using our in-house platforms say about the experience.</p>
            <div className="bpf-testimonials">
              {[
                {
                  text: "The marketplace was live in under 6 weeks. Parents trust the platform because verification works seamlessly — and the app performance has been flawless since launch.",
                  logo: "KK",
                  logoColor: "#1A4EDB",
                  company: "KuddlKin",
                  category: "Childcare Marketplace",
                },
                {
                  text: "From ordering materials to booking contractors, everything is on one screen now. The logistics integration alone saved us days of back-and-forth every week.",
                  logo: "BF",
                  logoColor: "#065F46",
                  company: "Buildifai",
                  category: "Construction Platform",
                },
                {
                  text: "Parsing 500 resumes used to take a recruiter two days. Rezulaizer does it in minutes with better matching than manual review. The AI ranking is genuinely accurate.",
                  logo: "RZ",
                  logoColor: "#7C3AED",
                  company: "Rezulaizer",
                  category: "HR Tech · AI Platform",
                },
                {
                  text: "QR table ordering cut our order errors to near zero and our staff spends more time with guests now. The kitchen display and billing sync is exactly what we needed.",
                  logo: "AT",
                  logoColor: "#B45309",
                  company: "Atithira",
                  category: "Restaurant ERP",
                },
              ].map((t) => (
                <div className="bpf-testimonial" key={t.company}>
                  <p className="bpf-testimonial-text">{t.text}</p>
                  <div className="bpf-testimonial-author">
                    <div className="bpf-logo-box" style={{ background: t.logoColor, color: "#fff", fontSize: 11 }}>{t.logo}</div>
                    <div>
                      <div className="bpf-company-name">{t.company}</div>
                      <div className="bpf-company-cat">{t.category}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WHY BIZTRECK */}
          <div className="bpf-section">
            <div className="bpf-eyebrow">Why Biztreck</div>
            <div className="bpf-title">An agency that thinks like your in-house team.</div>
            <p className="bpf-sub">Six reasons founders and CTOs keep coming back.</p>
            <div className="bpf-why">
              {[
                { title: "⚡ Fast turnarounds", desc: "MVPs in 4–8 weeks. Revamps in 2–6. We move fast without compromising on quality." },
                { title: "🏆 Senior team only", desc: "No juniors learning on your dime. Senior designers, engineers, and SREs from day one." },
                { title: "🔧 Production-grade", desc: "Tested, monitored, secure by default. Every project ships with CI/CD and proper infra." },
                { title: "🌏 Global delivery", desc: "Clients across India, UAE, US, EU. Async-first communication that respects your time zone." },
                { title: "📊 Transparent process", desc: "Live dashboards, weekly demos, shared Notion roadmap. You always know the status." },
                { title: "🎯 Outcomes, not hours", desc: "Fixed-scope quotes, milestone billing, and a real focus on business outcomes — not billable hours." },
              ].map((w) => (
                <div className="bpf-why-card" key={w.title}>
                  <h4>{w.title}</h4>
                  <p>{w.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bpf-cta">
            <h2>Let&apos;s build something remarkable.</h2>
            <p>Tell us about your project. We&apos;ll respond within 24 hours with a free, no-obligation proposal and roadmap.</p>
            <div className="bpf-cta-links">
              <div className="bpf-cta-link"><label>Email</label><a href="mailto:connect@biztreck.world">connect@biztreck.world</a></div>
              <div className="bpf-cta-link"><label>Phone</label><a href="tel:+918740863229">+91 87408 63229</a></div>
              <div className="bpf-cta-link"><label>Website</label><a href="https://biztreck.world" target="_blank" rel="noopener noreferrer">biztreck.world</a></div>
              <div className="bpf-cta-link"><label>Location</label><a>Greater Noida, Delhi NCR — 201306</a></div>
            </div>
            <div className="bpf-cta-footer">
              © 2025 Biztreck Solutions. Greater Noida, India · biztreck.world · @biztreck
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

#!/usr/bin/env node
/**
 * Seed the companies shown on the website into the admin `clients` collection.
 *
 * The homepage and /portfolio read from this collection (see lib/showcase.ts),
 * so this is what puts the currently-shown companies "into admin" and keeps the
 * site driven by admin data instead of a hardcoded list.
 *
 * Idempotent:
 *   - KuddlKin already exists as a client, so we attach the showcase block to
 *     the existing record (matched by name/company) instead of duplicating it.
 *   - Every other company is matched by `showcase.slug`, so re-running updates
 *     in place rather than inserting duplicates.
 *
 * Contact/billing fields (contact name, email, phone, GST, billing address,
 * milestones, …) are left blank — only what's tied to the website (company
 * name, website URL, and the display block) is set.
 *
 * Run:
 *   npm run seed:clients
 */
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is required");
  process.exit(1);
}

// order = display order on the site. `matchExisting` (KuddlKin only) attaches
// the showcase block to the client already in the collection.
const COMPANIES = [
  {
    order: 1,
    company: "Atithira",
    websiteUrl: "https://atithira.vercel.app",
    showcase: {
      slug: "atithira",
      category: "erp-development",
      tagline: "Full-fledged ERP for restaurants & hotels",
      description:
        "QR table ordering, kitchen management, billing, inventory, staff and analytics in one operational platform — replacing four disconnected tools.",
      logo: "/assets/brands/atithira.jpeg",
      tags: ["Restaurant ERP", "Inventory", "QR ordering"],
    },
  },
  {
    order: 2,
    company: "REP",
    websiteUrl: "https://biztreck.world",
    showcase: {
      slug: "rep",
      category: "erp-development",
      tagline: "Resource planning, reimagined",
      description:
        "Resource and capacity planning with allocation, utilisation tracking and forecasting for services businesses.",
      tags: ["Resource planning", "B2B SaaS", "Dashboards"],
    },
  },
  {
    order: 3,
    company: "Rezulaizer",
    websiteUrl: "https://rezulaizer.com",
    showcase: {
      slug: "rezulaizer",
      category: "ai-automation",
      tagline: "Hire smarter with AI intelligence",
      description:
        "AI resume parsing, intelligent candidate matching and automated assessments — screening that took two days now takes minutes.",
      logo: "/assets/brands/rezulaizer.png",
      tags: ["AI / ML", "Document processing", "HR Tech"],
    },
  },
  {
    order: 4,
    company: "KuddlKin",
    websiteUrl: "https://kuddl.co/",
    matchExisting: /kuddl/i,
    showcase: {
      slug: "kuddlkin",
      category: "custom-software",
      tagline: "Premium childcare at your doorstep",
      description:
        "A two-sided marketplace connecting parents with verified childcare professionals, with identity verification, booking and payments built in.",
      logo: "/assets/brands/kuddl-kin.svg",
      tags: ["Marketplace", "Booking", "Verification"],
    },
  },
  {
    order: 5,
    company: "Buildifai",
    websiteUrl: "https://buildifai.vercel.app",
    showcase: {
      slug: "buildifai",
      category: "custom-software",
      tagline: "Construction materials & builders in one place",
      description:
        "Buy construction materials online and book trusted builders — ordering, logistics and contractor management on a single platform.",
      logo: "/assets/brands/buildify-logo.png",
      tags: ["Marketplace", "Construction", "Logistics"],
    },
  },
  {
    order: 6,
    company: "SafarMates",
    websiteUrl: "https://biztreck.world",
    showcase: {
      slug: "safarmates",
      category: "custom-software",
      tagline: "Ride beyond the horizon",
      description:
        "A travel community platform for discovering rides, planning journeys and connecting riders across regions.",
      tags: ["Community", "Travel", "Mobile"],
    },
  },
  {
    order: 7,
    company: "TryLinqr",
    websiteUrl: "https://trylinqr.com",
    showcase: {
      slug: "trylinqr",
      category: "customer-portals",
      tagline: "Discover and book premium events",
      description:
        "An event ecosystem with discovery, ticketing and self-service booking — customers book in under two minutes without contacting support.",
      logo: "/assets/brands/trylinqr.webp",
      tags: ["Ticketing", "Self-service", "Payments"],
    },
  },
  {
    order: 8,
    company: "BookMyGuide",
    websiteUrl: "https://biztreck.world",
    showcase: {
      slug: "bookmyguide",
      category: "customer-portals",
      tagline: "Book verified local guides",
      description:
        "A booking portal connecting travellers with verified local guides, handling availability, booking and payment end to end.",
      tags: ["Booking portal", "Marketplace", "Payments"],
    },
  },
  {
    order: 9,
    company: "Angels & Roadsters",
    websiteUrl: "https://angelsandroadsters.com",
    showcase: {
      slug: "angels-and-roadsters",
      category: "website-development",
      tagline: "India's first gender-equal bike club",
      description:
        "A high-performance community website for a 26,000-member club — events, rides and the flagship Trailstorm festival.",
      logo: "/assets/brands/angeles-roadsters.png",
      tags: ["Community site", "Events", "SEO"],
    },
  },
];

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db("biztreck");
  const clients = db.collection("clients");
  const now = new Date();

  let inserted = 0;
  let updated = 0;

  for (const c of COMPANIES) {
    const showcase = { show: true, order: c.order, status: "Live", ...c.showcase };

    // Find an existing record: the seeded slug, or (KuddlKin) the client that
    // was already added by hand.
    const or = [{ "showcase.slug": showcase.slug }];
    if (c.matchExisting) {
      or.push({ company: { $regex: c.matchExisting } });
      or.push({ name: { $regex: c.matchExisting } });
    }
    const existing = await clients.findOne({ $or: or });

    if (existing) {
      // Attach/refresh only the website-facing bits. Never touch billing,
      // milestones, invoices, or contact fields already on the record.
      await clients.updateOne(
        { _id: existing._id },
        {
          $set: {
            showcase,
            websiteUrl: existing.websiteUrl?.trim() || c.websiteUrl,
            company: existing.company?.trim() || c.company,
            updatedAt: now,
          },
        }
      );
      updated++;
      console.log(`updated  ${c.company}  (${existing._id})`);
    } else {
      // Fresh showcase-only client. Contact/billing fields stay blank.
      await clients.insertOne({
        name: "",
        company: c.company,
        email: "",
        phone: "",
        status: "active",
        projectName: "",
        websiteUrl: c.websiteUrl,
        billingAddress: "",
        country: "",
        clientGstin: "",
        reportsTo: "",
        theirContact: "",
        contactEmail: "",
        contactPhone: "",
        projectValue: 0,
        totalCost: 0,
        currency: "INR",
        paymentTerms: "",
        invoiceNotes: "",
        gstRate: 0,
        gstMode: "none",
        brdText: "",
        milestones: [],
        showcase,
        createdAt: now,
        updatedAt: now,
      });
      inserted++;
      console.log(`inserted ${c.company}`);
    }
  }

  console.log(`\nDone. Inserted ${inserted}, updated ${updated}.`);
} finally {
  await client.close();
}

import { ObjectId } from "@/lib/mongodb";

export type ClientMilestone = {
  title: string;
  qty: number;
  rate: number;
  amount: number;
  dueDate?: string;
  status: "planned" | "completed" | "invoiced" | "paid";
  invoiceId?: string;
};

export const CURRENCIES = ["INR", "USD", "GBP", "EUR", "AED"] as const;

/** `INR 1,80,000` / `GBP 1,800.00` — currency code prefix keeps the PDF font-safe. */
export function formatMoney(value: number, currency = "INR") {
  const n = Number(value || 0);
  const isInr = currency === "INR";
  return `${currency} ${n.toLocaleString(isInr ? "en-IN" : "en-US", {
    minimumFractionDigits: isInr ? 0 : 2,
    maximumFractionDigits: isInr ? 0 : 2,
  })}`;
}

export function toObjectId(id: string) {
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid id");
  }
  return new ObjectId(id);
}

export function parseMilestones(input: unknown): ClientMilestone[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((m: any) => {
      // Qty/rate are optional. When both are given they drive the amount;
      // otherwise the line is a single unit priced at its amount.
      const rawQty = Number(m?.qty);
      const rawRate = Number(m?.rate);
      const hasQty = Number.isFinite(rawQty) && rawQty > 0;
      const hasRate = Number.isFinite(rawRate) && rawRate > 0;
      const amount =
        hasQty && hasRate ? rawQty * rawRate : Number(m?.amount || 0);
      const qty = hasQty ? rawQty : 1;
      const rate = hasRate ? rawRate : amount;
      return {
        title: String(m?.title || "").trim(),
        qty,
        rate,
        amount,
        dueDate: m?.dueDate ? String(m.dueDate) : "",
        status: (m?.status || "planned") as ClientMilestone["status"],
        invoiceId: m?.invoiceId ? String(m.invoiceId) : "",
      };
    })
    .filter((m) => m.title && Number.isFinite(m.amount) && m.amount > 0);
}

export function nextInvoiceNumber(count: number) {
  const year = new Date().getFullYear();
  return `BT-${year}-${String(count + 1).padStart(4, "0")}`;
}

/**
 * Company identity, tax IDs, banking rails, and boilerplate used on invoices.
 * Every value is env-overridable so nothing sensitive is pinned to the code.
 */
export function companyProfile() {
  return {
    name: process.env.COMPANY_NAME || "Biztreck Solutions",
    address:
      process.env.COMPANY_ADDRESS ||
      "Khas-502, Devla, Noida 201306, Greater Noida, Uttar Pradesh, India",
    website: process.env.COMPANY_WEBSITE || "https://www.biztreck.world",
    email: process.env.COMPANY_EMAIL || "connect@biztreck.world",
    phone: process.env.COMPANY_PHONE || "+91 81307 38333",
    gst: process.env.COMPANY_GST || "09HRTPK7815L1ZQ",
    pan: process.env.COMPANY_PAN || "HRTPK7815L",
    // SAC (Services Accounting Code) for GST on the services rendered.
    // 998314 = IT design & development services (websites/software).
    sac: process.env.COMPANY_SAC_CODE || "998314",
    bank: {
      name: process.env.COMPANY_BANK_NAME || "Kotak Mahindra Bank",
      holder: process.env.COMPANY_BANK_HOLDER || process.env.COMPANY_NAME || "Biztreck Solutions",
      account: process.env.COMPANY_BANK_ACCOUNT || "0549633882",
      ifsc: process.env.COMPANY_BANK_IFSC || "KKBK0000180",
      branch: process.env.COMPANY_BANK_BRANCH || "Noida - Sector 63",
      swift: process.env.COMPANY_BANK_SWIFT || "",
      upi: process.env.COMPANY_UPI || "8740863229@kotakbank",
      wise: process.env.COMPANY_WISE || "",
      paypal: process.env.COMPANY_PAYPAL || "",
    },
    signatory: {
      name: process.env.COMPANY_SIGNATORY_NAME || "Prince Kumar",
      title: process.env.COMPANY_SIGNATORY_TITLE || "Founder",
    },
  };
}

export const DEFAULT_INVOICE_TERMS = [
  "Payment is due on or before the due date stated on this invoice.",
  "Work, deployment, and support may pause on overdue accounts until payment is cleared.",
  "Source code, deployable assets, and documentation are handed over after the corresponding payment is cleared.",
  "All amounts are in the currency stated above. Bank transfer charges, if any, are borne by the sender.",
  "Please quote the invoice number in your payment reference.",
];

// Printed on every invoice: flags the work as a technical service so the client
// applies the technical-services TDS rate (1–2%) rather than a higher one.
// Override the wording with COMPANY_TDS_NOTE in env if needed.
export const TDS_NOTE =
  process.env.COMPANY_TDS_NOTE ||
  "The services rendered under this invoice are in the nature of technical services. Any TDS, where applicable, may be deducted at the applicable rate for technical services (1–2%) under the Income-tax Act, 2025. Please share the TDS certificate for our records.";

const MS_PER_HOUR = 60 * 60 * 1000;

/**
 * Return an invoice due date (YYYY-MM-DD) that always gives the client at least
 * `minHours` (default 48h) to pay. A requested/milestone date is honoured only
 * when it already clears that floor; otherwise we fall back to `defaultDays`
 * from the invoice date.
 */
export function computeDueDate(
  from: Date,
  requested?: string,
  opts?: { minHours?: number; defaultDays?: number }
): string {
  const minHours = opts?.minHours ?? 48;
  const defaultDays = opts?.defaultDays ?? 7;
  const floor = new Date(from.getTime() + minHours * MS_PER_HOUR);
  let due = new Date(from.getTime() + defaultDays * 24 * MS_PER_HOUR);
  if (requested) {
    const r = new Date(requested);
    if (!Number.isNaN(r.getTime()) && r.getTime() >= floor.getTime()) due = r;
  }
  if (due.getTime() < floor.getTime()) due = floor;
  return due.toISOString().slice(0, 10);
}

export type InvoiceLineItem = { description: string; amount: number };

export type GstMode = "none" | "exclusive" | "inclusive";

export type InvoiceTotals = {
  subtotal: number;
  discount: number;
  taxable: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  gstMode: GstMode;
};

export function normalizeGstMode(value: unknown): GstMode {
  return value === "none" || value === "inclusive" ? value : "exclusive";
}

/**
 * Compute the money breakdown for a client-level (full project) invoice.
 * `subtotal` is the dedicated total website cost when set, otherwise the sum of
 * milestone amounts.
 *   - exclusive: GST is added on top of the post-discount amount.
 *   - inclusive: the post-discount amount already contains GST (we back it out).
 *   - none: no GST applied.
 */
export function computeInvoiceTotals(input: {
  totalCost?: number;
  milestones?: ClientMilestone[];
  discount?: number;
  taxRate?: number;
  gstMode?: GstMode;
}): InvoiceTotals {
  const milestoneSum = Array.isArray(input.milestones)
    ? input.milestones.reduce((sum, m) => sum + Number(m.amount || 0), 0)
    : 0;
  const subtotal =
    Number(input.totalCost || 0) > 0 ? Number(input.totalCost) : milestoneSum;
  const discount = Math.min(Math.max(0, Number(input.discount || 0)), subtotal);
  const net = Math.max(0, subtotal - discount);
  const taxRate = Math.max(0, Number(input.taxRate || 0));
  const gstMode = normalizeGstMode(input.gstMode);

  if (gstMode === "none" || taxRate <= 0) {
    return { subtotal, discount, taxable: net, taxRate, taxAmount: 0, total: net, gstMode };
  }
  if (gstMode === "inclusive") {
    // net already includes GST — extract the embedded tax.
    const taxable = Math.round(net / (1 + taxRate / 100));
    const taxAmount = net - taxable;
    return { subtotal, discount, taxable, taxRate, taxAmount, total: net, gstMode };
  }
  // exclusive
  const taxAmount = Math.round(net * (taxRate / 100));
  return { subtotal, discount, taxable: net, taxRate, taxAmount, total: net + taxAmount, gstMode };
}

export type AgreementClause = { heading: string; body: string[] };

/**
 * The full standard clause set for a Biztreck service agreement. Every client
 * gets the same legal body; only the client-specific values (party name,
 * project, payment window) are substituted in.
 */
export function agreementClauses(client: {
  name: string;
  company?: string;
  projectName: string;
  paymentDays?: number;
}): AgreementClause[] {
  const party = client.company || client.name;
  const company = process.env.COMPANY_NAME || "Biztreck Solutions";
  const days = client.paymentDays || 7;
  const project = client.projectName || "the project";

  return [
    {
      heading: "1. Scope of Services",
      body: [
        `${company} ("Service Provider") will plan, design, develop, test, and deliver the work described for the project "${project}" for ${party} ("Client"), in line with the mutually approved Business Requirement Document (BRD), product backlog, and accepted milestone list.`,
        "Any work, feature, or deliverable not explicitly covered in the BRD or the accepted milestone list is out of scope and will be estimated separately through a written change request.",
      ],
    },
    {
      heading: "2. Commercials & Milestones",
      body: [
        "The total project cost, applicable taxes, and milestone-wise commercials are set out in the Commercial Summary table above and form part of this Agreement.",
        "Invoices are raised milestone-wise or against the total project value as agreed. All amounts are exclusive of applicable government taxes unless explicitly stated as inclusive.",
      ],
    },
    {
      heading: "3. Payment Terms",
      body: [
        `Payments are due within ${days} days from the invoice date unless otherwise agreed in writing.`,
        "Delayed payments beyond the due date may pause development, deployment, or support activity, and may attract a late-payment follow-up. Source code, deployable assets, and documentation are handed over only after the corresponding milestone payment is cleared.",
      ],
    },
    {
      heading: "4. Timeline & Delivery",
      body: [
        "Delivery timelines depend on timely Client feedback, access, content, approvals, and third-party dependencies (hosting, domains, payment gateways, API providers, and similar).",
        "Delays caused by pending Client inputs or third-party services extend the delivery schedule by an equivalent period without penalty to the Service Provider.",
      ],
    },
    {
      heading: "5. Client Responsibilities",
      body: [
        "The Client will provide accurate requirements, brand assets, content, credentials, and approvals needed for the work, and will nominate a single point of contact empowered to review and sign off deliverables.",
      ],
    },
    {
      heading: "6. Change Requests",
      body: [
        "Changes to agreed scope, design, or functionality will be handled through a written change request. Each change request will be estimated for effort, cost, and timeline impact, and requires Client approval before work begins.",
      ],
    },
    {
      heading: "7. Intellectual Property",
      body: [
        "Upon receipt of full payment for the relevant milestone or the project, the Client owns the final delivered source code and custom assets created specifically for the project.",
        "The Service Provider retains ownership of its pre-existing tools, libraries, frameworks, and general know-how, and may reuse non-confidential, non-Client-specific components in other work.",
      ],
    },
    {
      heading: "8. Confidentiality",
      body: [
        "Both parties will protect confidential business, product, technical, and customer information shared during the project and will not disclose it to third parties without prior written consent, except where required by law.",
      ],
    },
    {
      heading: "9. Warranties & Support",
      body: [
        "The Service Provider warrants that deliverables will substantially conform to the accepted requirements for a period of 30 days after delivery of each milestone, and will fix reported defects in that window at no additional cost.",
        "Beyond the warranty period, support, maintenance, and enhancements are available under a separate agreed engagement.",
      ],
    },
    {
      heading: "10. Limitation of Liability",
      body: [
        "The Service Provider's total liability under this Agreement is limited to the fees actually paid by the Client for the specific deliverable giving rise to the claim. Neither party is liable for indirect, incidental, or consequential losses, including loss of profit or data.",
      ],
    },
    {
      heading: "11. Term & Termination",
      body: [
        "Either party may terminate this Agreement with written notice if the other party materially breaches it and fails to cure the breach within 15 days of written notice.",
        "On termination, the Client will pay for all work completed and in progress up to the termination date, and the Service Provider will hand over paid deliverables.",
      ],
    },
    {
      heading: "12. Force Majeure",
      body: [
        "Neither party is liable for delays or failure to perform caused by events beyond reasonable control, including natural disasters, outages, government action, or internet/infrastructure failures.",
      ],
    },
    {
      heading: "13. Governing Law",
      body: [
        "This Agreement is governed by the laws of India, and the courts at the Service Provider's registered location have exclusive jurisdiction over any dispute arising out of it.",
      ],
    },
    {
      heading: "14. Entire Agreement",
      body: [
        "This Agreement, together with the BRD, accepted milestones, and any signed change requests, is the entire understanding between the parties and supersedes prior discussions. Amendments must be in writing.",
      ],
    },
  ];
}

export function buildAgreementMarkdown(client: {
  name: string;
  company?: string;
  email?: string;
  projectName: string;
  brdText?: string;
  milestones: ClientMilestone[];
}) {
  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const party = client.company || client.name;
  const scope =
    client.brdText?.trim().slice(0, 5000) ||
    "Scope will follow the mutually approved business requirement document, product backlog, and written change requests.";
  const milestoneRows = client.milestones.length
    ? client.milestones
        .map(
          (m, i) =>
            `| ${i + 1} | ${m.title} | INR ${m.amount.toLocaleString("en-IN")} | ${m.dueDate || "As scheduled"} |`
        )
        .join("\n")
    : "| 1 | Project kickoff | As agreed | On approval |";

  const company = process.env.COMPANY_NAME || "Biztreck Solutions";
  const clauses = agreementClauses({
    name: client.name,
    company: client.company,
    projectName: client.projectName,
  })
    .map((c) => `## ${c.heading}\n\n${c.body.join("\n\n")}`)
    .join("\n\n");

  return `# Service Agreement

Date: ${today}

This Service Agreement is entered between ${company} and ${party}${
    client.email ? ` (${client.email})` : ""
  } for the project "${client.projectName}".

## BRD Reference

${scope}

## Commercial Summary

| # | Milestone | Amount | Due |
|---|---|---:|---|
${milestoneRows}

${clauses}

## Acceptance & Signatures

By signing below, both parties accept the terms of this Agreement.

${company}

Authorized Signatory: ______________________

${party}

Authorized Signatory: ______________________
`;
}

export function buildInvoiceMarkdown(invoice: {
  invoiceNumber: string;
  clientName: string;
  clientCompany?: string;
  projectName: string;
  milestoneTitle: string;
  amount: number;
  dueDate?: string;
}) {
  const company = {
    name: process.env.COMPANY_NAME || "Biztreck Solutions",
    address:
      process.env.COMPANY_ADDRESS ||
      "Greater Noida, Uttar Pradesh, India",
    gst: process.env.COMPANY_GST || "09HRTPK7815L1ZQ",
    logo: process.env.COMPANY_LOGO_URL || "",
    email: process.env.COMPANY_EMAIL || "connect@biztreck.world",
  };
  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const due =
    invoice.dueDate ||
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return `${company.logo ? `![${company.name} Logo](${company.logo})\n\n` : ""}# Invoice ${invoice.invoiceNumber}

From: ${company.name}

Address: ${company.address}

GSTIN: ${company.gst}

Email: ${company.email}

Invoice Date: ${today}

Bill To: ${invoice.clientCompany || invoice.clientName}

Project: ${invoice.projectName}

| Description | Amount |
|---|---:|
| ${invoice.milestoneTitle} | INR ${invoice.amount.toLocaleString("en-IN")} |

Total Payable: INR ${invoice.amount.toLocaleString("en-IN")}

Due Date: ${due}

Payment should be made to Biztreck Solutions as per the agreed payment terms.

Note: ${TDS_NOTE}`;
}

export function buildProjectInvoiceMarkdown(invoice: {
  invoiceNumber: string;
  clientName: string;
  clientCompany?: string;
  clientEmail?: string;
  projectName: string;
  websiteUrl?: string;
  currency?: string;
  lineItems: InvoiceLineItem[];
  totals: InvoiceTotals;
  dueDate?: string;
  // Custom / back-dated invoices set this so the printed "Invoice Date" reflects
  // the chosen date rather than today. Accepts an ISO or YYYY-MM-DD string.
  invoiceDate?: string;
  // SAC (Services Accounting Code) for GST; defaults to the company profile.
  sacCode?: string;
}) {
  const company = {
    name: process.env.COMPANY_NAME || "Biztreck Solutions",
    address:
      process.env.COMPANY_ADDRESS || "Greater Noida, Uttar Pradesh, India",
    gst: process.env.COMPANY_GST || "09HRTPK7815L1ZQ",
    logo: process.env.COMPANY_LOGO_URL || "",
    email: process.env.COMPANY_EMAIL || "connect@biztreck.world",
  };
  const sac = invoice.sacCode || companyProfile().sac;
  const inr = (v: number) => formatMoney(v, invoice.currency || "INR");
  const dateSource = invoice.invoiceDate ? new Date(invoice.invoiceDate) : new Date();
  const today = (Number.isNaN(dateSource.getTime()) ? new Date() : dateSource).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const due =
    invoice.dueDate ||
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const t = invoice.totals;
  const rows = invoice.lineItems
    .map((li) => `| ${li.description} | ${inr(li.amount)} |`)
    .join("\n");

  return `${company.logo ? `![${company.name} Logo](${company.logo})\n\n` : ""}# Invoice ${invoice.invoiceNumber}

From: ${company.name}

Address: ${company.address}

GSTIN: ${company.gst}

Email: ${company.email}

Invoice Date: ${today}

Bill To: ${invoice.clientCompany || invoice.clientName}${
    invoice.clientEmail ? `\n\nEmail: ${invoice.clientEmail}` : ""
  }

Project: ${invoice.projectName}${
    invoice.websiteUrl ? `\n\nWebsite: ${invoice.websiteUrl}` : ""
  }

SAC Code: ${sac}

| Description | Amount |
|---|---:|
${rows}

${t.discount > 0 ? `Subtotal: ${inr(t.subtotal)}\n\nDiscount: -${inr(t.discount)}\n\n` : ""}${
    t.gstMode === "none" || t.taxAmount <= 0
      ? `Taxable Value: ${inr(t.taxable)}\n`
      : `Taxable Value: ${inr(t.taxable)}\n\nGST @ ${t.taxRate}%: ${inr(t.taxAmount)}\n`
  }
Total Invoice Value: ${inr(t.total)}

Due Date: ${due}

Payment should be made to Biztreck Solutions as per the agreed payment terms.

Note: ${TDS_NOTE}`;
}

import { ObjectId } from "@/lib/mongodb";

export type ClientMilestone = {
  title: string;
  amount: number;
  dueDate?: string;
  status: "planned" | "completed" | "invoiced" | "paid";
  invoiceId?: string;
};

export function toObjectId(id: string) {
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid id");
  }
  return new ObjectId(id);
}

export function parseMilestones(input: unknown): ClientMilestone[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((m: any) => ({
      title: String(m?.title || "").trim(),
      amount: Number(m?.amount || 0),
      dueDate: m?.dueDate ? String(m.dueDate) : "",
      status: (m?.status || "planned") as ClientMilestone["status"],
      invoiceId: m?.invoiceId ? String(m.invoiceId) : "",
    }))
    .filter((m) => m.title && Number.isFinite(m.amount) && m.amount > 0);
}

export function nextInvoiceNumber(count: number) {
  const year = new Date().getFullYear();
  return `BT-${year}-${String(count + 1).padStart(4, "0")}`;
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

  return `# Service Agreement

Date: ${today}

This Service Agreement is entered between Biztreck Solutions and ${party}${
    client.email ? ` (${client.email})` : ""
  } for the project "${client.projectName}".

## Project Scope

Biztreck Solutions will plan, design, develop, and support the work described in the BRD summary below.

### BRD Reference

${scope}

## Milestones and Commercials

| # | Milestone | Amount | Due |
|---|---|---:|---|
${milestoneRows}

## Delivery Terms

- Delivery timelines depend on timely client feedback, access, content, approvals, and third-party dependencies.
- Any scope not covered in the BRD or accepted milestone list will be estimated separately through a written change request.
- Source code, deployable assets, and documentation will be handed over after the corresponding milestone payment is cleared.

## Payment Terms

- Invoices are raised milestone-wise.
- Payments are due within 7 days from the invoice date unless otherwise agreed in writing.
- Delayed payments may pause delivery, deployment, or support activity.

## Confidentiality

Both parties will protect confidential business, product, technical, and customer information shared during the project.

## Acceptance

The client will review each milestone deliverable within 5 working days. If no written issues are shared in that window, the milestone may be treated as accepted.

## Signatures

Biztreck Solutions

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

Payment should be made to Biztreck Solutions as per the agreed payment terms.`;
}

export function buildProjectInvoiceMarkdown(invoice: {
  invoiceNumber: string;
  clientName: string;
  clientCompany?: string;
  clientEmail?: string;
  projectName: string;
  websiteUrl?: string;
  lineItems: InvoiceLineItem[];
  totals: InvoiceTotals;
  dueDate?: string;
}) {
  const company = {
    name: process.env.COMPANY_NAME || "Biztreck Solutions",
    address:
      process.env.COMPANY_ADDRESS || "Greater Noida, Uttar Pradesh, India",
    gst: process.env.COMPANY_GST || "09HRTPK7815L1ZQ",
    logo: process.env.COMPANY_LOGO_URL || "",
    email: process.env.COMPANY_EMAIL || "connect@biztreck.world",
  };
  const inr = (v: number) => `INR ${Number(v || 0).toLocaleString("en-IN")}`;
  const today = new Date().toLocaleDateString("en-IN", {
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

| Description | Amount |
|---|---:|
${rows}

Subtotal: ${inr(t.subtotal)}
${t.discount > 0 ? `\nDiscount: -${inr(t.discount)}\n` : ""}${
    t.gstMode === "none"
      ? ""
      : `\nGST (${t.taxRate}%${t.gstMode === "inclusive" ? " incl." : ""}): ${inr(t.taxAmount)}\n`
  }
Total Payable: ${inr(t.total)}

Due Date: ${due}

Payment should be made to Biztreck Solutions as per the agreed payment terms.`;
}

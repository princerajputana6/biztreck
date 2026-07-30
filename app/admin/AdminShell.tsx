"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Briefcase,
  Building2,
  CalendarClock,
  Download,
  ExternalLink,
  FileSignature,
  FileText,
  IndianRupee,
  Loader2,
  LogOut,
  Mail,
  Megaphone,
  PlusCircle,
  Plug,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserPlus,
  Target,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Logo from "@/components/Logo";
import { FormEvent, useMemo, useState } from "react";
import { can, type Session } from "@/lib/rbac";

const LeadOSView = dynamic(() => import("./leados/LeadOSView"), {
  loading: () => <ViewSkeleton />,
});
const UsersView = dynamic(() => import("./users/UsersView"), {
  loading: () => <ViewSkeleton />,
});
const IntegrationsView = dynamic(() => import("./integrations/IntegrationsView"), {
  loading: () => <ViewSkeleton />,
});

function ViewSkeleton() {
  return (
    <div className="mt-8 flex items-center gap-2 rounded-xl border border-navy-700/40 bg-navy-900/35 p-8 text-sm text-slate-400">
      <Loader2 size={16} className="animate-spin" /> Loading…
    </div>
  );
}

type AnyDoc = Record<string, any>;

type Stats = {
  view?: AdminView;
  blogs: AnyDoc[];
  jobs: AnyDoc[];
  applications: AnyDoc[];
  applicationsCount: number;
  contactsCount: number;
  commentsCount: number;
  clients: AnyDoc[];
  documents: AnyDoc[];
  invoices: AnyDoc[];
  employees: AnyDoc[];
  hiring: AnyDoc[];
  socialTasks: AnyDoc[];
  expenses: AnyDoc[];
  users: AnyDoc[];
  integrationsStatus: Record<string, { connected: boolean; updatedAt: string | null; fields: string[]; email: string | null }>;
  session: Session;
};

type AdminView =
  | "dashboard"
  | "clients"
  | "leados"
  | "team"
  | "content"
  | "integrations"
  | "users";

type AutoState = {
  busy: boolean;
  result: {
    ok: boolean;
    message: string;
    inserted?: { title: string; slug: string }[];
  } | null;
};

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function clientFinancials(client: AnyDoc) {
  const milestoneSum = Array.isArray(client.milestones)
    ? client.milestones.reduce((sum: number, m: any) => sum + Number(m.amount || 0), 0)
    : 0;
  // Dedicated total website cost takes precedence over the milestone sum.
  const gross =
    Number(client.totalCost || 0) > 0
      ? Number(client.totalCost)
      : milestoneSum || Number(client.projectValue || 0);
  const discount = Math.min(Number(client.discountAmount || 0), gross);
  const netBase = Math.max(0, gross - discount);
  const taxRate = Number(client.gstRate || 0);
  const gstMode =
    client.gstMode === "none" || client.gstMode === "inclusive"
      ? client.gstMode
      : "exclusive";
  let tax = 0;
  let net = netBase;
  if (taxRate > 0 && gstMode === "exclusive") {
    tax = Math.round(netBase * (taxRate / 100));
    net = netBase + tax;
  } else if (taxRate > 0 && gstMode === "inclusive") {
    tax = netBase - Math.round(netBase / (1 + taxRate / 100));
    net = netBase;
  }
  const paid = Array.isArray(client.payments)
    ? client.payments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0)
    : 0;
  return { gross, discount, taxRate, tax, gstMode, paid, net, left: Math.max(0, net - paid) };
}

export default function AdminShell(props: Stats) {
  const {
    blogs,
    jobs,
    applications,
    applicationsCount,
    contactsCount,
    commentsCount,
    clients,
    documents,
    invoices,
    employees,
    hiring,
    socialTasks,
    expenses,
    users,
    integrationsStatus,
  } = props;
  const view = props.view || "dashboard";
  const session = props.session;
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [operationBusy, setOperationBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(null);
  const [autoBlogs, setAutoBlogs] = useState<AutoState>({ busy: false, result: null });
  const [autoJobs, setAutoJobs] = useState<AutoState>({ busy: false, result: null });
  const [milestonesText, setMilestonesText] = useState("");
  const [brdText, setBrdText] = useState("");
  const [showClientForm, setShowClientForm] = useState(false);
  const [clientsTab, setClientsTab] = useState<"roster" | "billing">("roster");
  const [editingClient, setEditingClient] = useState<AnyDoc | null>(null);
  const [selectedClient, setSelectedClient] = useState<AnyDoc | null>(null);
  const [teamTab, setTeamTab] = useState<
    "dashboard" | "employees" | "hiring" | "submissions" | "social" | "expenses"
  >("dashboard");
  const [teamFormOpen, setTeamFormOpen] = useState(false);

  const finance = useMemo(() => {
    const invoiceTotal = invoices.reduce((sum, i) => sum + Number(i.amount || 0), 0);
    const paidTotal = invoices
      .filter((i) => i.status === "paid")
      .reduce((sum, i) => sum + Number(i.amount || 0), 0);
    const salaryTotal = employees
      .filter((e) => e.status !== "inactive")
      .reduce((sum, e) => sum + Number(e.salaryMonthly || 0), 0);
    const expenseTotal = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    return { invoiceTotal, paidTotal, salaryTotal, expenseTotal };
  }, [employees, expenses, invoices]);

  async function runAutoPublish(opts: {
    count: number;
    confirmMsg: string;
    endpoint: string;
    noun: string;
    setState: (s: AutoState) => void;
  }) {
    if (!confirm(opts.confirmMsg)) return;
    opts.setState({ busy: true, result: null });
    try {
      const res = await fetch(opts.endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ count: opts.count }),
      });
      const data = await res.json();
      if (!data.ok) {
        opts.setState({
          busy: false,
          result: { ok: false, message: data.error || "Auto-publish failed" },
        });
        return;
      }
      const n = data.inserted?.length ?? 0;
      const failed = data.failed?.length ?? 0;
      opts.setState({
        busy: false,
        result: {
          ok: true,
          message:
            failed > 0
              ? `Published ${n} ${opts.noun} (${failed} failed). Refreshing...`
              : `Published ${n} ${opts.noun}. Refreshing...`,
          inserted: data.inserted,
        },
      });
      setTimeout(() => router.refresh(), 1200);
    } catch (e: any) {
      opts.setState({
        busy: false,
        result: { ok: false, message: e?.message || "Network error" },
      });
    }
  }

  const autoPublishBlogs = () =>
    runAutoPublish({
      count: 5,
      confirmMsg:
        "Auto-publish 5 trending blogs?\n\nThis will find 5 trending topics related to your business and generate + publish 5 full blog posts.",
      endpoint: "/api/admin/auto-publish-blogs",
      noun: "posts",
      setState: setAutoBlogs,
    });

  const autoPublishJobs = () =>
    runAutoPublish({
      count: 3,
      confirmMsg:
        "Auto-publish 3 in-demand roles?\n\nThis will find 3 in-demand role briefs and generate + publish 3 full job postings.",
      endpoint: "/api/admin/auto-publish-jobs",
      noun: "roles",
      setState: setAutoJobs,
    });

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.replace("/admin/login");
  };

  const remove = async (kind: "blogs" | "jobs", slug: string) => {
    if (!confirm(`Delete this ${kind === "blogs" ? "post" : "role"}?`)) return;
    setBusy(slug);
    try {
      await fetch(`/api/${kind}/${slug}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  const submitOperation = async (
    key: string,
    payload: AnyDoc,
    success: string,
    form?: HTMLFormElement
  ) => {
    if (operationBusy) return false;
    setOperationBusy(key);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/operations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Operation failed");
      setNotice({ ok: true, message: success });
      form?.reset();
      router.refresh();
      return true;
    } catch (e: any) {
      setNotice({ ok: false, message: e?.message || "Operation failed" });
      return false;
    } finally {
      setOperationBusy(null);
    }
  };

  // Submit a Team form, then collapse the add panel on success.
  const submitTeam = async (
    key: string,
    payload: AnyDoc,
    success: string,
    form: HTMLFormElement
  ) => {
    const ok = await submitOperation(key, payload, success, form);
    if (ok) setTeamFormOpen(false);
  };

  const updateEmployeeStatus = async (employee: AnyDoc, status: string) => {
    await submitOperation(
      `employee-status-${employee._id}`,
      { action: "update-employee", employeeId: employee._id, status },
      "Employee updated."
    );
  };

  const deleteEmployee = async (employee: AnyDoc) => {
    if (!confirm(`Remove ${employee.name} from the team?`)) return;
    await submitOperation(
      `delete-employee-${employee._id}`,
      { action: "delete-employee", employeeId: employee._id },
      "Employee removed."
    );
  };

  const createClient = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (operationBusy === "client") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const milestones = milestonesText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        // Title | amount | dueDate | qty | rate  (qty/rate optional)
        const [title, amount, dueDate, qty, rate] = line.split("|").map((x) => x.trim());
        return {
          title,
          amount: Number(amount || 0),
          dueDate,
          qty: qty ? Number(qty) : undefined,
          rate: rate ? Number(rate) : undefined,
        };
      });

    const ok = await submitOperation(
      "client",
      {
        action: editingClient ? "update-client" : "create-client",
        clientId: editingClient?._id,
        name: data.get("name"),
        company: data.get("company"),
        email: data.get("email"),
        phone: data.get("phone"),
        status: data.get("status"),
        projectName: data.get("projectName"),
        websiteUrl: data.get("websiteUrl"),
        billingAddress: data.get("billingAddress"),
        country: data.get("country"),
        clientGstin: data.get("clientGstin"),
        reportsTo: data.get("reportsTo"),
        theirContact: data.get("theirContact"),
        contactEmail: data.get("contactEmail"),
        contactPhone: data.get("contactPhone"),
        totalCost: data.get("totalCost"),
        currency: data.get("currency"),
        paymentTerms: data.get("paymentTerms"),
        invoiceNotes: data.get("invoiceNotes"),
        gstRate: data.get("gstRate"),
        gstMode: data.get("gstMode"),
        brdText,
        milestones,
      },
      editingClient
        ? "Client updated."
        : "Client added. Agreement generated. Invoices will be created when milestones are completed.",
      form
    );
    if (ok) {
      setMilestonesText("");
      setBrdText("");
      setEditingClient(null);
      setShowClientForm(false);
    }
  };

  const startEditClient = (client: AnyDoc) => {
    setEditingClient(client);
    setShowClientForm(true);
    setSelectedClient(client);
    setBrdText(client.brdText || "");
    setMilestonesText(
      Array.isArray(client.milestones)
        ? client.milestones
            .map((m: any) => {
              const parts = [
                m.title,
                Number(m.amount || 0) > 0 ? Number(m.amount || 0) : "",
                m.dueDate || "",
              ];
              // Only round-trip qty/rate when they carry real information.
              if (Number(m.qty) > 1) parts.push(Number(m.qty), Number(m.rate || 0));
              return parts.filter((part) => part !== "").join(" | ");
            })
            .join("\n")
        : ""
    );
  };

  const deleteClient = async (client: AnyDoc) => {
    if (!confirm(`Delete ${client.company || client.name}? This also deletes related invoices and documents.`)) return;
    await submitOperation(
      `delete-client-${client._id}`,
      { action: "delete-client", clientId: client._id },
      "Client deleted."
    );
  };

  const updateMilestoneStatus = async (
    client: AnyDoc,
    milestoneIndex: number,
    status: string
  ) => {
    await submitOperation(
      `milestone-${client._id}-${milestoneIndex}`,
      {
        action: "update-milestone-status",
        clientId: client._id,
        milestoneIndex,
        status,
      },
      status === "paid" ? "Milestone marked paid." : "Milestone invoiced."
    );
  };

  const updateClientDiscount = async (client: AnyDoc, form: HTMLFormElement) => {
    const data = new FormData(form);
    await submitOperation(
      `discount-${client._id}`,
      {
        action: "update-client-discount",
        clientId: client._id,
        discountAmount: data.get("discountAmount"),
      },
      "Discount updated.",
      form
    );
  };

  const addClientPayment = async (client: AnyDoc, form: HTMLFormElement) => {
    const data = new FormData(form);
    await submitOperation(
      `payment-${client._id}`,
      {
        action: "add-client-payment",
        clientId: client._id,
        amount: data.get("amount"),
        method: data.get("method"),
        receivedOn: data.get("receivedOn"),
        milestoneIndex: data.get("milestoneIndex"),
        note: data.get("note"),
      },
      "Payment recorded.",
      form
    );
  };

  const generateClientInvoice = async (client: AnyDoc) => {
    const ok = await submitOperation(
      `generate-invoice-${client._id}`,
      {
        action: "generate-client-invoice",
        clientId: client._id,
      },
      "Invoice generated. Download it from the Invoices page or the button below."
    );
    if (ok) router.refresh();
  };

  const deleteDocument = async (doc: AnyDoc) => {
    if (!confirm(`Delete ${doc.title}?`)) return;
    await submitOperation(
      `delete-document-${doc._id}`,
      { action: "delete-document", documentId: doc._id },
      "Document deleted."
    );
  };

  // Create a standalone custom invoice (can be back-dated for a past payment,
  // with optional tax inclusive/exclusive). Returns success so the form resets.
  const createCustomInvoice = async (payload: AnyDoc) => {
    return submitOperation(
      "create-custom-invoice",
      { action: "create-custom-invoice", ...payload },
      "Custom invoice created."
    );
  };

  const deleteInvoice = async (invoice: AnyDoc) => {
    if (!confirm(`Delete invoice ${invoice.invoiceNumber}? This cannot be undone.`)) return;
    await submitOperation(
      `delete-invoice-${invoice._id}`,
      { action: "delete-invoice", invoiceId: invoice._id },
      "Invoice deleted."
    );
  };

  const cards = [
    { label: "Posts", value: blogs.length, icon: FileText },
    { label: "Clients", value: clients.length, icon: Building2 },
    { label: "Invoices", value: money.format(finance.invoiceTotal), icon: ReceiptText },
    { label: "Team", value: employees.length, icon: Users },
    { label: "Monthly payroll", value: money.format(finance.salaryTotal), icon: IndianRupee },
    { label: "Expenses", value: money.format(finance.expenseTotal), icon: Banknote },
  ];

  const navItems: { href: string; label: string; icon: any; view: AdminView }[] = [
    { href: "/admin", label: "Dashboard", icon: Building2, view: "dashboard" },
    { href: "/admin/leados", label: "LeadOS", icon: Target, view: "leados" },
    { href: "/admin/clients", label: "Clients & billing", icon: FileSignature, view: "clients" },
    { href: "/admin/content", label: "Content", icon: FileText, view: "content" },
    { href: "/admin/team", label: "Team", icon: Users, view: "team" },
    { href: "/admin/integrations", label: "Integrations", icon: Plug, view: "integrations" },
    { href: "/admin/users", label: "Users & access", icon: ShieldCheck, view: "users" },
  ];
  // Only show modules this session is permitted to open.
  const visibleNav = navItems.filter((item) => can(session, item.view));

  const pageCopy: Record<AdminView, { title: string; description: string }> = {
    dashboard: {
      title: "Company dashboard",
      description: "A quick view of company stats and recent activity.",
    },
    clients: {
      title: "Clients & billing",
      description: "Add clients, generate agreements, record payments, and manage invoices — all in one place.",
    },
    leados: {
      title: "LeadOS",
      description: "Find, analyse, score and work international B2B leads. Owners get Shadow, the voice assistant.",
    },
    team: {
      title: "Team",
      description: "Employees, hiring, job posts, submissions, social, and expenses — the whole team in one place.",
    },
    content: {
      title: "Content",
      description: "Generate and manage published blogs and open roles.",
    },
    integrations: {
      title: "Integrations",
      description: "Connect Google, GitHub, and social accounts to power scheduling, outreach, and more.",
    },
    users: {
      title: "Users & access",
      description: "Create team members and assign exactly which modules each can access.",
    },
  };

  return (
    <div className="min-h-screen bg-navy-950 lg:flex">
      <AdminSidebar navItems={visibleNav} activeView={view} logout={logout} session={session} />

      <div className="min-w-0 flex-1 lg:pl-72">
        <header className="sticky top-0 z-50 border-b border-navy-700/40 bg-navy-950/85 backdrop-blur-xl lg:hidden">
          <div className="flex h-16 items-center justify-between px-5">
            <div className="flex items-center gap-3">
              <Logo size={48} href="/admin" showWordmark={false} />
              <span className="rounded-full border border-accent-cyan/40 bg-accent-cyan/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent-cyan">
                Admin
              </span>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full border border-navy-700/60 bg-navy-800/50 px-4 py-2 text-sm text-slate-200 hover:border-rose-400/40 hover:text-rose-300"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
          <MobileAdminNav navItems={visibleNav} activeView={view} />
        </header>

        <main className="mx-auto w-full max-w-[1500px] px-5 py-8 sm:px-8 lg:py-10">
        <motion.div
          id="overview"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 scroll-mt-28 lg:scroll-mt-8"
        >
          <div className="mb-5 hidden items-center justify-between gap-4 lg:flex">
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-accent-cyan/40 bg-accent-cyan/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent-cyan">
                Admin
              </span>
            </div>
            <Link href="/" className="text-sm text-slate-300 hover:text-white">
              View site
            </Link>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">
            {pageCopy[view].title}
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-400">
            {pageCopy[view].description}
          </p>
        </motion.div>

        {view === "dashboard" && (
          <>
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-xl p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <Icon size={18} className="text-accent-glow" />
                  <span className="text-right text-xs uppercase tracking-wider text-slate-400">
                    {c.label}
                  </span>
                </div>
                <div className="mt-3 break-words font-display text-2xl font-bold text-white">
                  {c.value}
                </div>
              </motion.div>
            );
          })}
        </div>
            <div className="grid gap-8 xl:grid-cols-3">
              <Panel title="Recent clients" icon={Building2}>
                <ListEmpty show={clients.length === 0} label="No clients yet." />
                <div className="space-y-3">
                  {clients.slice(0, 5).map((client) => (
                    <RecordRow
                      key={client._id}
                      title={client.company || client.name}
                      meta={`${client.projectName || "Project"} | ${money.format(clientFinancials(client).gross)}`}
                    />
                  ))}
                </div>
              </Panel>
              <Panel title="Recent invoices" icon={ReceiptText}>
                <ListEmpty show={invoices.length === 0} label="No invoices yet." />
                <div className="space-y-3">
                  {invoices.slice(0, 5).map((invoice) => (
                    <RecordRow
                      key={invoice._id}
                      title={invoice.invoiceNumber}
                      meta={`${invoice.clientCompany || invoice.clientName} | ${money.format(Number(invoice.amount || 0))} | ${invoice.status}`}
                    />
                  ))}
                </div>
              </Panel>
              <Panel title="Recent activity" icon={CalendarClock}>
                <div className="grid gap-3">
                  <Metric label="Applications" value={applicationsCount} />
                  <Metric label="Inquiries" value={contactsCount} />
                  <Metric label="Comments" value={commentsCount} />
                </div>
              </Panel>
            </div>
          </>
        )}

        {notice && (
          <div
            className={`mb-8 rounded-xl border px-5 py-4 text-sm ${
              notice.ok
                ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                : "border-rose-400/40 bg-rose-400/10 text-rose-200"
            }`}
          >
            {notice.message}
          </div>
        )}

        {view === "clients" && (
          <div className="mt-2">
            <TabBar
              tabs={[
                { key: "roster", label: "Clients", icon: FileSignature },
                { key: "billing", label: "Billing", icon: ReceiptText },
              ]}
              active={clientsTab}
              onChange={setClientsTab}
            />
            {clientsTab === "roster" && (
              <div className="mt-6 space-y-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy-700/40 bg-navy-900/35 p-4">
              <p className="text-sm text-slate-400">Manage clients, documents, milestones, and milestone invoices.</p>
              <button
                type="button"
                onClick={() => {
                  setShowClientForm((open) => !open);
                  if (showClientForm) {
                    setEditingClient(null);
                    setBrdText("");
                    setMilestonesText("");
                  }
                }}
                className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
              >
                <PlusCircle size={16} />
                {showClientForm ? "Close form" : "Add client"}
              </button>
            </div>

            {showClientForm && (
              <Panel id="clients-documents" title={editingClient ? "Edit client" : "Add client"} icon={FileSignature}>
                <form key={editingClient?._id || "new-client"} onSubmit={createClient} className="grid gap-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field name="name" label="Client name" defaultValue={editingClient?.name || ""} required />
                    <Field name="company" label="Company" defaultValue={editingClient?.company || ""} />
                    <Field name="email" label="Email" type="email" defaultValue={editingClient?.email || ""} />
                    <Field name="phone" label="Phone" defaultValue={editingClient?.phone || ""} />
                    <Field name="projectName" label="Project name" defaultValue={editingClient?.projectName || ""} required />
                    <Select
                      name="status"
                      label="Status"
                      defaultValue={editingClient?.status || "active"}
                      options={["active", "lead", "paused", "completed"]}
                    />
                    <Field
                      name="websiteUrl"
                      label="Website URL"
                      placeholder="https://client-site.com"
                      defaultValue={editingClient?.websiteUrl || ""}
                    />
                    <Field
                      name="totalCost"
                      label="Total website cost (INR)"
                      type="number"
                      defaultValue={editingClient?.totalCost || ""}
                    />
                    <Field
                      name="gstRate"
                      label="GST %"
                      type="number"
                      defaultValue={editingClient?.gstRate ?? 18}
                    />
                    <Select
                      name="gstMode"
                      label="GST treatment"
                      defaultValue={editingClient?.gstMode || "exclusive"}
                      options={[
                        { value: "exclusive", label: "GST added on top (exclusive)" },
                        { value: "inclusive", label: "GST included in total (inclusive)" },
                        { value: "none", label: "No GST" },
                      ]}
                    />
                    <Field
                      name="reportsTo"
                      label="Whom we report to"
                      placeholder="Client-side stakeholder"
                      defaultValue={editingClient?.reportsTo || ""}
                    />
                    <Field
                      name="theirContact"
                      label="Whom they contact (our POC)"
                      placeholder="Our point of contact"
                      defaultValue={editingClient?.theirContact || ""}
                    />
                    <Field
                      name="contactEmail"
                      label="Contact person email"
                      type="email"
                      defaultValue={editingClient?.contactEmail || ""}
                    />
                    <Field
                      name="contactPhone"
                      label="Contact person phone"
                      defaultValue={editingClient?.contactPhone || ""}
                    />
                    <Field
                      name="country"
                      label="Country (billing)"
                      placeholder="United Kingdom"
                      defaultValue={editingClient?.country || ""}
                    />
                    <Field
                      name="clientGstin"
                      label="Client GSTIN (optional)"
                      placeholder="07AAMCT1251B1ZO"
                      defaultValue={editingClient?.clientGstin || ""}
                    />
                    <Select
                      name="currency"
                      label="Invoice currency"
                      defaultValue={editingClient?.currency || "INR"}
                      options={["INR", "USD", "GBP", "EUR", "AED"]}
                    />
                    <Field
                      name="paymentTerms"
                      label="Payment terms"
                      placeholder="Net 7 days from invoice date"
                      defaultValue={editingClient?.paymentTerms || ""}
                    />
                  </div>
                  <Textarea
                    name="billingAddress"
                    label="Billing address (appears under Bill To)"
                    placeholder={"Unit 4, Riverside Park\nLondon, SE1 7TP"}
                    compact
                    defaultValue={editingClient?.billingAddress || ""}
                  />
                  <Textarea
                    name="invoiceNotes"
                    label="Invoice notes (optional)"
                    placeholder="Anything you want printed in the Notes section of the invoice."
                    compact
                    defaultValue={editingClient?.invoiceNotes || ""}
                  />
                  <Textarea
                    name="milestones"
                    label="Invoice line items / milestones (optional)"
                    placeholder={"Title | amount | dueDate | qty | rate   (qty & rate optional)\n\nUI Design | 25000 | 2026-07-20\nFrontend | 60000 | 2026-08-15\nSupport retainer | 60000 | 2026-09-01 | 3 | 20000"}
                    value={milestonesText}
                    onChange={setMilestonesText}
                  />
                  <Textarea
                    name="brdText"
                    label="BRD (optional)"
                    placeholder="Business requirement summary, scope, and notes for the agreement."
                    value={brdText}
                    onChange={setBrdText}
                  />
                  <SubmitButton
                    busy={operationBusy === "client"}
                    label={editingClient ? "Save client changes" : "Add client and generate agreement"}
                    icon={FileSignature}
                  />
                </form>
              </Panel>
            )}

            <div className="grid gap-8 xl:grid-cols-[minmax(0,3fr)_minmax(360px,2fr)]">
              <section>
                <Panel id="client-records" title="All clients" icon={Building2}>
                  <ListEmpty show={clients.length === 0} label="No clients yet." />
                  <div className="max-h-[720px] space-y-3 overflow-auto pr-1">
                    {clients.map((client) => (
                      <div key={client._id} className="rounded-lg border border-navy-700/40 bg-navy-950/35 p-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-white">{client.company || client.name}</div>
                            <div className="mt-1 text-xs text-slate-400">{client.name} | {client.email || "No email"}</div>
                          </div>
                          <span className="rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-2 py-1 text-[11px] uppercase tracking-wider text-accent-cyan">
                            {client.status || "active"}
                          </span>
                        </div>
                        {(() => {
                          const f = clientFinancials(client);
                          return (
                            <div className="mt-3 grid gap-2 text-xs text-slate-300 sm:grid-cols-3">
                              <div><span className="text-slate-500">Project:</span> {client.projectName || "Project"}</div>
                              <div><span className="text-slate-500">Paid:</span> {money.format(f.paid)}</div>
                              <div><span className="text-slate-500">Left:</span> {money.format(f.left)}</div>
                            </div>
                          );
                        })()}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button type="button" onClick={() => setSelectedClient(client)} className="rounded-full border border-navy-700/70 bg-navy-800/50 px-3 py-1.5 text-xs text-slate-200 hover:border-accent-cyan">View</button>
                          <button type="button" onClick={() => startEditClient(client)} className="rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1.5 text-xs text-accent-cyan">Edit</button>
                          <button type="button" onClick={() => deleteClient(client)} disabled={operationBusy === `delete-client-${client._id}`} className="rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 text-xs text-rose-300 disabled:opacity-60">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>

                {selectedClient && (
                  <Panel title="Client details" icon={Users}>
                    <div className="space-y-4">
                      <RecordRow title={selectedClient.company || selectedClient.name} meta={`${selectedClient.projectName || "Project"} | ${selectedClient.email || "No email"}`} />
                      {(selectedClient.websiteUrl ||
                        selectedClient.reportsTo ||
                        selectedClient.theirContact ||
                        selectedClient.contactEmail ||
                        selectedClient.contactPhone) && (
                        <div className="grid gap-2 rounded-lg border border-navy-700/40 bg-navy-950/35 p-3 text-xs text-slate-300 sm:grid-cols-2">
                          {selectedClient.websiteUrl && (
                            <div>
                              <span className="text-slate-500">Website:</span>{" "}
                              <a href={selectedClient.websiteUrl} target="_blank" rel="noreferrer" className="text-accent-cyan hover:underline">
                                {selectedClient.websiteUrl}
                              </a>
                            </div>
                          )}
                          {selectedClient.reportsTo && (
                            <div><span className="text-slate-500">We report to:</span> {selectedClient.reportsTo}</div>
                          )}
                          {selectedClient.theirContact && (
                            <div><span className="text-slate-500">Their POC (us):</span> {selectedClient.theirContact}</div>
                          )}
                          {selectedClient.contactEmail && (
                            <div><span className="text-slate-500">Contact email:</span> {selectedClient.contactEmail}</div>
                          )}
                          {selectedClient.contactPhone && (
                            <div><span className="text-slate-500">Contact phone:</span> {selectedClient.contactPhone}</div>
                          )}
                        </div>
                      )}
                      {(() => {
                        const f = clientFinancials(selectedClient);
                        return (
                          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                            <Metric label="Total cost" value={money.format(f.gross)} />
                            <Metric label="Discount" value={money.format(f.discount)} />
                            <Metric label={`GST ${f.taxRate}%`} value={money.format(f.tax)} />
                            <Metric label="Payable" value={money.format(f.net)} />
                            <Metric label="Paid" value={money.format(f.paid)} />
                            <Metric label="Left" value={money.format(f.left)} />
                          </div>
                        );
                      })()}
                      <div className="rounded-lg border border-navy-700/40 bg-navy-950/35 p-3">
                        <div className="mb-2 text-xs uppercase tracking-wider text-slate-500">BRD summary</div>
                        <div className="max-h-44 overflow-auto whitespace-pre-wrap text-sm text-slate-300">{selectedClient.brdText || "No BRD saved."}</div>
                      </div>
                      <div className="space-y-3">
                        <div className="text-sm font-semibold text-white">Milestones</div>
                        <ListEmpty show={!selectedClient.milestones?.length} label="No milestones saved." />
                        {selectedClient.milestones?.map((m: any, index: number) => (
                          <div key={`${m.title}-${index}`} className="rounded-lg border border-navy-700/40 bg-navy-950/35 p-3">
                            <div className="font-semibold text-white">{m.title}</div>
                            <div className="mt-1 text-xs text-slate-400">{money.format(Number(m.amount || 0))} | {m.dueDate || "No due date"} | {m.status || "planned"}</div>
                          </div>
                        ))}
                      </div>
                      <p className="rounded-lg border border-accent-cyan/25 bg-accent-cyan/5 p-3 text-xs text-slate-400">
                        Record payments and generate invoices from the{" "}
                        <span className="font-semibold text-accent-cyan">Payment &amp; Invoice</span> page.
                      </p>
                    </div>
                  </Panel>
                )}
              </section>

              <aside>
                <Panel id="agreements" title="Documents" icon={FileSignature}>
                  <ListEmpty show={documents.length === 0} label="No agreements yet." />
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <RecordRow
                        key={doc._id}
                        title={doc.title}
                        meta={`${doc.type || "document"} | ${dateLabel(doc.createdAt)}`}
                        action={
                          <div className="flex gap-2">
                            {doc.clientId && (
                              <a href={`/api/admin/agreements/${doc.clientId}/pdf`} target="_blank" rel="noreferrer" className="rounded-full border border-navy-700/70 bg-navy-800/50 p-2 text-slate-200 hover:border-accent-cyan" title="Download agreement PDF"><Download size={14} /></a>
                            )}
                            <button type="button" onClick={() => deleteDocument(doc)} className="rounded-full border border-rose-400/30 bg-rose-400/10 p-2 text-rose-300 hover:border-rose-400/60" title="Delete document"><Trash2 size={14} /></button>
                          </div>
                        }
                      />
                    ))}
                  </div>
                </Panel>
              </aside>
            </div>
              </div>
            )}
            {clientsTab === "billing" && <BillingTab
              clients={clients}
              invoices={invoices}
              finance={finance}
              selectedClient={selectedClient}
              setSelectedClient={setSelectedClient}
              operationBusy={operationBusy}
              submitOperation={submitOperation}
              updateClientDiscount={updateClientDiscount}
              addClientPayment={addClientPayment}
              generateClientInvoice={generateClientInvoice}
              updateMilestoneStatus={updateMilestoneStatus}
              createCustomInvoice={createCustomInvoice}
              deleteInvoice={deleteInvoice}
            />}
          </div>
        )}

        {view === "leados" && <LeadOSView />}

        {view === "integrations" && (
          <IntegrationsView initialStatus={integrationsStatus} />
        )}

        {view === "users" && <UsersView session={session} initialUsers={users as any} />}

        {view === "team" && (() => {
          const activeEmployees = employees.filter((e) => e.status !== "inactive");
          const openRoles = hiring.filter((h) => h.stage !== "closed");
          const queuedSocial = socialTasks.filter((s) => s.status !== "posted");
          const tabs = [
            { key: "dashboard" as const, label: "Dashboard", icon: Building2, count: employees.length },
            { key: "employees" as const, label: "Employees", icon: Users, count: employees.length },
            { key: "hiring" as const, label: "Hiring", icon: UserPlus, count: hiring.length },
            { key: "submissions" as const, label: "Submissions", icon: Mail, count: applications.length },
            { key: "social" as const, label: "Social", icon: Megaphone, count: socialTasks.length },
            { key: "expenses" as const, label: "Expenses", icon: Banknote, count: expenses.length },
          ];
          const noun: Record<string, string> = { employees: "employee", hiring: "role", social: "task", expenses: "expense" };
          const busyKeyMap: Record<string, string> = { employees: "employee", hiring: "hiring", social: "social", expenses: "expense" };
          const canAdd = teamTab === "employees" || teamTab === "hiring" || teamTab === "social" || teamTab === "expenses";
          const activeTab = tabs.find((t) => t.key === teamTab)!;

          return (
            <div className="mt-8 space-y-6">
              {/* KPI tiles */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatTile icon={Users} tone="cyan" label="Team members" value={employees.length} hint={`${activeEmployees.length} active · ${money.format(finance.salaryTotal)}/mo payroll`} />
                <StatTile icon={UserPlus} tone="violet" label="Open roles" value={openRoles.length} hint={`${hiring.length} in pipeline`} />
                <StatTile icon={Mail} tone="slate" label="Applications" value={applications.length} hint={`${contactsCount} inquiries · ${commentsCount} comments`} />
                <StatTile icon={Wallet} tone="amber" label="Monthly expenses" value={money.format(finance.expenseTotal)} hint={`${expenses.length} entries logged`} />
              </div>

              <TabBar tabs={tabs} active={teamTab} onChange={setTeamTab} />

              {/* Active section */}
              <div className="rounded-xl border border-navy-700/40 bg-navy-900/35 p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <activeTab.icon size={18} className="text-accent-cyan" />
                    <h2 className="font-display text-lg font-bold text-white">{activeTab.label}</h2>
                    <span className="rounded-full bg-navy-800/80 px-2 py-0.5 text-xs text-slate-400">{activeTab.count}</span>
                  </div>
                  {canAdd && (
                    <button
                      type="button"
                      onClick={() => setTeamFormOpen((o) => !o)}
                      className="btn-primary inline-flex items-center gap-2 px-3.5 py-2 text-sm"
                    >
                      {teamFormOpen ? <X size={15} /> : <PlusCircle size={15} />}
                      {teamFormOpen ? "Close" : `Add ${noun[teamTab]}`}
                    </button>
                  )}
                </div>

                {/* Add form (collapsed by default) */}
                {canAdd && teamFormOpen && (
                  <motion.form
                    key={teamTab}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={(event) => {
                      event.preventDefault();
                      const form = event.currentTarget;
                      const data = new FormData(form);
                      if (teamTab === "employees") {
                        submitTeam("employee", { action: "add-employee", name: data.get("name"), role: data.get("role"), email: data.get("email"), salaryMonthly: data.get("salaryMonthly"), status: data.get("status"), joiningDate: data.get("joiningDate") }, "Employee added.", form);
                      } else if (teamTab === "hiring") {
                        submitTeam("hiring", { action: "add-hiring", title: data.get("title"), department: data.get("department"), stage: data.get("stage"), candidateName: data.get("candidateName"), notes: data.get("notes") }, "Hiring item added.", form);
                      } else if (teamTab === "social") {
                        submitTeam("social", { action: "add-social-task", title: data.get("title"), channel: data.get("channel"), status: data.get("status"), scheduledFor: data.get("scheduledFor"), notes: data.get("notes") }, "Social task added.", form);
                      } else {
                        submitTeam("expense", { action: "add-expense", title: data.get("title"), category: data.get("category"), amount: data.get("amount"), paidOn: data.get("paidOn"), recurring: data.get("recurring") === "on", notes: data.get("notes") }, "Expense added.", form);
                      }
                    }}
                    className="mb-5 rounded-xl border border-accent-cyan/20 bg-navy-950/40 p-4"
                  >
                    {teamTab === "employees" && (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <Field name="name" label="Name" required />
                        <Field name="role" label="Role" />
                        <Field name="email" label="Email" type="email" />
                        <Field name="salaryMonthly" label="Monthly salary" type="number" />
                        <Field name="joiningDate" label="Joining date" type="date" />
                        <Select name="status" label="Status" options={["active", "contract", "intern", "inactive"]} />
                      </div>
                    )}
                    {teamTab === "hiring" && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field name="title" label="Role title" required />
                        <Field name="department" label="Department" />
                        <Select name="stage" label="Stage" options={["open", "screening", "interview", "offer", "closed"]} />
                        <Field name="candidateName" label="Candidate" />
                        <div className="sm:col-span-2"><Textarea name="notes" label="Notes" compact /></div>
                      </div>
                    )}
                    {teamTab === "social" && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field name="title" label="Task title" required />
                        <Select name="channel" label="Channel" options={["LinkedIn", "Instagram", "X", "YouTube", "Blog"]} />
                        <Select name="status" label="Status" options={["planned", "drafting", "scheduled", "posted"]} />
                        <Field name="scheduledFor" label="Scheduled for" type="date" />
                        <div className="sm:col-span-2"><Textarea name="notes" label="Notes" compact /></div>
                      </div>
                    )}
                    {teamTab === "expenses" && (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <Field name="title" label="Expense title" required />
                        <Field name="category" label="Category" />
                        <Field name="amount" label="Amount" type="number" required />
                        <Field name="paidOn" label="Paid on" type="date" />
                        <label className="flex items-center gap-2 self-end pb-2.5 text-sm text-slate-300">
                          <input name="recurring" type="checkbox" className="h-4 w-4 rounded border-navy-700 bg-navy-950" />
                          Recurring
                        </label>
                      </div>
                    )}
                    <SubmitButton busy={operationBusy === busyKeyMap[teamTab]} label={`Save ${noun[teamTab]}`} icon={PlusCircle} compact />
                  </motion.form>
                )}

                {/* Dashboard */}
                {teamTab === "dashboard" && (
                  <div className="grid gap-8 xl:grid-cols-2">
                    <div>
                      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Team</h3>
                      <ListEmpty show={employees.length === 0} label="No employees yet." />
                      <div className="grid gap-3 md:grid-cols-2">
                        {employees.slice(0, 10).map((employee) => (
                          <RecordRow
                            key={employee._id}
                            title={employee.name}
                            meta={`${employee.role || "Team"} | ${money.format(Number(employee.salaryMonthly || 0))}/mo | ${employee.status}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-5">
                      <div>
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Hiring</h3>
                        <ListEmpty show={hiring.length === 0} label="No hiring items yet." />
                        <div className="space-y-3">
                          {hiring.slice(0, 6).map((item) => (
                            <RecordRow key={item._id} title={item.title} meta={`${item.department || "Team"} | ${item.stage}`} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Social</h3>
                        <ListEmpty show={socialTasks.length === 0} label="No social tasks yet." />
                        <div className="space-y-3">
                          {socialTasks.slice(0, 6).map((item) => (
                            <RecordRow key={item._id} title={item.title} meta={`${item.channel} | ${item.status} | ${item.scheduledFor || "unscheduled"}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Employees */}
                {teamTab === "employees" && (
                  <>
                    <ListEmpty show={employees.length === 0} label="No employees yet. Add your first team member." />
                    <div className="grid gap-3 md:grid-cols-2">
                      {employees.map((emp) => (
                        <div key={emp._id} className="rounded-xl border border-navy-700/40 bg-navy-950/35 p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent-cyan/30 to-violet-500/30 text-sm font-bold text-white">{initials(emp.name)}</div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate font-semibold text-white">{emp.name}</div>
                              <div className="mt-0.5 truncate text-xs text-slate-400">{emp.role || "Team"}{emp.email ? ` · ${emp.email}` : ""}</div>
                            </div>
                            <div className="shrink-0 text-sm font-semibold text-white">{money.format(Number(emp.salaryMonthly || 0))}<span className="text-xs font-normal text-slate-500">/mo</span></div>
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <select
                              value={emp.status || "active"}
                              onChange={(e) => updateEmployeeStatus(emp, e.target.value)}
                              className="flex-1 rounded-lg border border-navy-700/70 bg-navy-950/70 px-2 py-1.5 text-xs text-white"
                            >
                              {["active", "contract", "intern", "inactive"].map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => deleteEmployee(emp)}
                              disabled={operationBusy === `delete-employee-${emp._id}`}
                              className="rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 text-xs text-rose-300 disabled:opacity-60"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Hiring */}
                {teamTab === "hiring" && (
                  <>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent-cyan/20 bg-accent-cyan/5 p-3">
                      <p className="text-xs text-slate-400">
                        Public job posts live in Content. {jobs.length} open role{jobs.length === 1 ? "" : "s"} published.
                      </p>
                      <Link
                        href="/admin/jobs/new"
                        className="inline-flex items-center gap-1.5 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1.5 text-xs text-accent-cyan"
                      >
                        <PlusCircle size={12} /> Create a job post
                      </Link>
                    </div>
                    <ListEmpty show={hiring.length === 0} label="No open roles yet. Add a position to track." />
                    <div className="grid gap-3 md:grid-cols-2">
                      {hiring.map((item) => (
                        <div key={item._id} className="rounded-xl border border-navy-700/40 bg-navy-950/35 p-3.5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate font-semibold text-white">{item.title}</div>
                              <div className="mt-0.5 truncate text-xs text-slate-400">{item.department || "Team"}{item.candidateName ? ` · ${item.candidateName}` : ""}</div>
                            </div>
                            <StatusBadge value={item.stage} />
                          </div>
                          {item.notes && <p className="mt-2 line-clamp-2 text-xs text-slate-500">{item.notes}</p>}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Submissions */}
                {teamTab === "submissions" && (
                  <>
                    <ListEmpty show={applications.length === 0} label="No applications yet." />
                    <div className="grid gap-3 md:grid-cols-2">
                      {applications.map((app) => (
                        <div key={app._id} className="rounded-xl border border-navy-700/40 bg-navy-950/35 p-3.5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate font-semibold text-white">{app.name}</div>
                              <div className="mt-0.5 truncate text-xs text-slate-400">{app.jobTitle || "General application"}{app.email ? ` · ${app.email}` : ""}</div>
                            </div>
                            <StatusBadge value={app.status} />
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                            {app.phone && <span>{app.phone}</span>}
                            <span>{dateLabel(app.createdAt)}</span>
                          </div>
                          {(app.resumeUrl || app.portfolio) && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {app.resumeUrl && (
                                <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="rounded-full border border-navy-700/70 bg-navy-800/50 px-2.5 py-1 text-[11px] text-slate-200 hover:border-accent-cyan">Resume</a>
                              )}
                              {app.portfolio && (
                                <a href={app.portfolio} target="_blank" rel="noreferrer" className="rounded-full border border-navy-700/70 bg-navy-800/50 px-2.5 py-1 text-[11px] text-slate-200 hover:border-accent-cyan">Portfolio</a>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {teamTab === "social" && (
                  <>
                    <ListEmpty show={socialTasks.length === 0} label="No social tasks yet. Plan your first post." />
                    <div className="grid gap-3 md:grid-cols-2">
                      {socialTasks.map((item) => (
                        <div key={item._id} className="rounded-xl border border-navy-700/40 bg-navy-950/35 p-3.5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate font-semibold text-white">{item.title}</div>
                              <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                                <span className="rounded bg-navy-800/80 px-1.5 py-0.5 text-[11px] text-slate-300">{item.channel}</span>
                                <span className="inline-flex items-center gap-1"><CalendarClock size={12} />{item.scheduledFor || "unscheduled"}</span>
                              </div>
                            </div>
                            <StatusBadge value={item.status} />
                          </div>
                          {item.notes && <p className="mt-2 line-clamp-2 text-xs text-slate-500">{item.notes}</p>}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {teamTab === "expenses" && (
                  <>
                    <ListEmpty show={expenses.length === 0} label="No expenses logged yet." />
                    <div className="grid gap-3 md:grid-cols-2">
                      {expenses.map((item) => (
                        <div key={item._id} className="flex items-center justify-between gap-3 rounded-xl border border-navy-700/40 bg-navy-950/35 p-3.5">
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-white">{item.title}</div>
                            <div className="mt-0.5 flex items-center gap-2 truncate text-xs text-slate-400">
                              <span>{item.category || "General"}</span>
                              <span>· {item.paidOn || "—"}</span>
                              {item.recurring && <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-1.5 py-0.5 text-[10px] text-amber-300">recurring</span>}
                            </div>
                          </div>
                          <div className="shrink-0 font-display text-base font-bold text-white">{money.format(Number(item.amount || 0))}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })()}

        {view === "content" && (
        <div id="content" className="mt-8 space-y-8">
          <section className="scroll-mt-28 rounded-xl border border-navy-700/40 bg-navy-900/35 p-5 lg:scroll-mt-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold text-white">Generate</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Vercel cron calls /api/cron/generate-blogs daily at 00:30 UTC.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/admin/blogs/new" className="btn-primary shine inline-flex items-center gap-2">
                  <PlusCircle size={16} /> Generate blog
                </Link>
                <button
                  type="button"
                  onClick={autoPublishBlogs}
                  disabled={autoBlogs.busy}
                  className="btn-ghost inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {autoBlogs.busy ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  Auto-publish 5 blogs
                </button>
                <Link href="/admin/jobs/new" className="btn-ghost inline-flex items-center gap-2">
                  <PlusCircle size={16} /> Generate job
                </Link>
                <button
                  type="button"
                  onClick={autoPublishJobs}
                  disabled={autoJobs.busy}
                  className="btn-ghost inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {autoJobs.busy ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  Auto-publish 3 roles
                </button>
              </div>
            </div>
            {(autoBlogs.result || autoJobs.result) && (
              <div className="space-y-3">
                {autoBlogs.result && (
                  <AutoResultBanner result={autoBlogs.result} hrefBuilder={(slug) => `/blog/${slug}`} />
                )}
                {autoJobs.result && (
                  <AutoResultBanner result={autoJobs.result} hrefBuilder={(slug) => `/careers/${slug}`} />
                )}
              </div>
            )}
          </section>

          <div className="grid scroll-mt-28 gap-8 xl:grid-cols-2 lg:scroll-mt-8">
            <ContentList title="Posts" items={blogs} kind="blogs" remove={remove} busy={busy} />
            <ContentList title="Open roles" items={jobs} kind="jobs" remove={remove} busy={busy} />
          </div>
        </div>
        )}
        </main>
      </div>
    </div>
  );
}

function TabBar<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: T; label: string; icon: any; count?: number }[];
  active: T;
  onChange: (key: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 rounded-xl border border-navy-700/40 bg-navy-900/40 p-1.5">
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "border border-accent-cyan/30 bg-accent-cyan/15 text-white"
                : "border border-transparent text-slate-400 hover:bg-navy-800/60 hover:text-white"
            }`}
          >
            <Icon size={16} className={isActive ? "text-accent-cyan" : "text-slate-500"} />
            {t.label}
            {t.count != null && (
              <span className={`rounded-full px-2 py-0.5 text-[11px] ${isActive ? "bg-accent-cyan/20 text-accent-cyan" : "bg-navy-800/80 text-slate-500"}`}>
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function BillingTab({
  clients,
  invoices,
  finance,
  selectedClient,
  setSelectedClient,
  operationBusy,
  submitOperation,
  updateClientDiscount,
  addClientPayment,
  generateClientInvoice,
  updateMilestoneStatus,
  createCustomInvoice,
  deleteInvoice,
}: {
  clients: AnyDoc[];
  invoices: AnyDoc[];
  finance: { invoiceTotal: number; paidTotal: number; salaryTotal: number; expenseTotal: number };
  selectedClient: AnyDoc | null;
  setSelectedClient: (c: AnyDoc | null) => void;
  operationBusy: string | null;
  submitOperation: (key: string, payload: AnyDoc, success: string, form?: HTMLFormElement) => Promise<boolean>;
  updateClientDiscount: (client: AnyDoc, form: HTMLFormElement) => Promise<void>;
  addClientPayment: (client: AnyDoc, form: HTMLFormElement) => Promise<void>;
  generateClientInvoice: (client: AnyDoc) => Promise<void>;
  updateMilestoneStatus: (client: AnyDoc, index: number, status: string) => Promise<void>;
  createCustomInvoice: (payload: AnyDoc) => Promise<boolean>;
  deleteInvoice: (invoice: AnyDoc) => Promise<void>;
}) {
  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
      <section className="space-y-6">
        <Panel id="payment-invoice" title="Record payment & generate invoice" icon={ReceiptText}>
          <label className="grid gap-1 text-sm text-slate-300">
            Select client
            <select
              value={selectedClient?._id || ""}
              onChange={(e) =>
                setSelectedClient(
                  clients.find((c) => String(c._id) === e.target.value) || null
                )
              }
              className="rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-white outline-none focus:border-accent-cyan"
            >
              <option value="">Select a client…</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {(c.company || c.name) + (c.projectName ? ` — ${c.projectName}` : "")}
                </option>
              ))}
            </select>
          </label>

          {!selectedClient && (
            <p className="mt-4 text-sm text-slate-400">
              Pick a client to see totals, record payments, and generate a branded invoice PDF.
            </p>
          )}

          {selectedClient && (
            <div className="mt-5 space-y-4">
              {(() => {
                const f = clientFinancials(selectedClient);
                const clientInvoices = invoices.filter(
                  (inv) => String(inv.clientId) === String(selectedClient._id)
                );
                const latestInvoice = clientInvoices[0];
                return (
                  <>
                    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                      <Metric label="Total cost" value={money.format(f.gross)} />
                      <Metric label="Discount" value={money.format(f.discount)} />
                      <Metric label={`GST ${f.taxRate}%`} value={money.format(f.tax)} />
                      <Metric label="Payable" value={money.format(f.net)} />
                      <Metric label="Paid" value={money.format(f.paid)} />
                      <Metric label="Left" value={money.format(f.left)} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-accent-cyan/25 bg-accent-cyan/5 p-3">
                      <button
                        type="button"
                        onClick={() => generateClientInvoice(selectedClient)}
                        disabled={operationBusy === `generate-invoice-${selectedClient._id}`}
                        className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <ReceiptText size={16} />
                        Generate full invoice
                      </button>
                      {latestInvoice && (
                        <a
                          href={`/api/admin/invoices/${latestInvoice._id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-navy-700/70 bg-navy-800/50 px-4 py-2 text-sm text-slate-200 hover:border-accent-cyan"
                        >
                          <Download size={14} />
                          Download {latestInvoice.invoiceNumber}
                        </a>
                      )}
                      <span className="text-xs text-slate-400">
                        Uses the total website cost, discount, and GST from the client record.
                      </span>
                    </div>
                  </>
                );
              })()}

              <div className="grid gap-4 lg:grid-cols-2">
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    updateClientDiscount(selectedClient, event.currentTarget);
                  }}
                  className="rounded-lg border border-navy-700/40 bg-navy-950/35 p-3"
                >
                  <div className="mb-3 text-sm font-semibold text-white">Discount</div>
                  <Field
                    name="discountAmount"
                    label="Discount amount"
                    type="number"
                    defaultValue={selectedClient.discountAmount || 0}
                  />
                  <SubmitButton
                    busy={operationBusy === `discount-${selectedClient._id}`}
                    label="Save discount"
                    icon={IndianRupee}
                    compact
                  />
                </form>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    addClientPayment(selectedClient, event.currentTarget);
                  }}
                  className="rounded-lg border border-navy-700/40 bg-navy-950/35 p-3"
                >
                  <div className="mb-3 text-sm font-semibold text-white">Record payment</div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field name="amount" label="Amount received" type="number" required />
                    <Select
                      name="method"
                      label="Method"
                      options={["cash", "upi", "bank transfer", "card", "cheque", "other"]}
                    />
                    <Field
                      name="receivedOn"
                      label="Received on"
                      type="date"
                      defaultValue={new Date().toISOString().slice(0, 10)}
                    />
                    <Select
                      name="milestoneIndex"
                      label="Milestone"
                      options={[
                        "",
                        ...(selectedClient.milestones || []).map(
                          (m: any, i: number) => `${i}:${m.title}`
                        ),
                      ]}
                    />
                  </div>
                  <Textarea name="note" label="Payment note" compact />
                  <SubmitButton
                    busy={operationBusy === `payment-${selectedClient._id}`}
                    label="Record payment"
                    icon={Banknote}
                    compact
                  />
                </form>
              </div>

              <div className="rounded-lg border border-navy-700/40 bg-navy-950/35 p-3">
                <div className="mb-3 text-sm font-semibold text-white">Payment history</div>
                <ListEmpty
                  show={!selectedClient.payments?.length}
                  label="No payments recorded yet."
                />
                <div className="space-y-2">
                  {selectedClient.payments?.map((payment: any, index: number) => (
                    <div
                      key={`${payment.createdAt || payment.receivedOn}-${index}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-navy-700/40 bg-navy-900/40 px-3 py-2 text-xs text-slate-300"
                    >
                      <span>{money.format(Number(payment.amount || 0))}</span>
                      <span>{payment.method || "payment"}</span>
                      <span>{payment.receivedOn || dateLabel(payment.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-semibold text-white">Milestone invoices</div>
                <ListEmpty show={!selectedClient.milestones?.length} label="No milestones saved." />
                {selectedClient.milestones?.map((m: any, index: number) => (
                  <div key={`${m.title}-${index}`} className="rounded-lg border border-navy-700/40 bg-navy-950/35 p-3">
                    <div className="font-semibold text-white">{m.title}</div>
                    <div className="mt-1 text-xs text-slate-400">{money.format(Number(m.amount || 0))} | {m.dueDate || "No due date"} | {m.status || "planned"}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={() => updateMilestoneStatus(selectedClient, index, "completed")} disabled={Boolean(m.invoiceId)} className="rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1.5 text-xs text-accent-cyan disabled:cursor-not-allowed disabled:opacity-50">Complete & generate invoice</button>
                      <button type="button" onClick={() => updateMilestoneStatus(selectedClient, index, "paid")} className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-300">Mark paid</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>

        <CustomInvoiceForm
          clients={clients}
          operationBusy={operationBusy}
          createCustomInvoice={createCustomInvoice}
        />
      </section>

      <aside className="space-y-8">
        <Panel id="invoices" title="All invoices" icon={ReceiptText}>
          <div className="mb-3 grid grid-cols-2 gap-3 text-sm">
            <Metric label="Total raised" value={money.format(finance.invoiceTotal)} />
            <Metric label="Paid" value={money.format(finance.paidTotal)} />
          </div>
          <ListEmpty show={invoices.length === 0} label="No invoices yet." />
          <div className="space-y-3">
            {invoices.slice(0, 12).map((invoice) => (
              <div key={invoice._id} className="rounded-lg border border-navy-700/40 bg-navy-950/35 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-white">{invoice.invoiceNumber}</div>
                    <div className="mt-1 text-xs text-slate-400">
                      {invoice.clientCompany || invoice.clientName} |{" "}
                      {invoice.type === "project"
                        ? "Full project invoice"
                        : invoice.type === "custom"
                          ? invoice.projectName || "Custom invoice"
                          : invoice.milestoneTitle}
                    </div>
                    <div className="mt-1 text-xs text-slate-300">{money.format(Number(invoice.amount || 0))}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <a
                      href={`/api/admin/invoices/${invoice._id}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-navy-700/70 bg-navy-800/50 p-2 text-slate-200 hover:border-accent-cyan"
                      title="Download invoice PDF"
                    >
                      <Download size={14} />
                    </a>
                    <button
                      type="button"
                      onClick={() => deleteInvoice(invoice)}
                      disabled={operationBusy === `delete-invoice-${invoice._id}`}
                      className="rounded-full border border-rose-400/30 bg-rose-400/10 p-2 text-rose-300 hover:border-rose-400/60 disabled:opacity-50"
                      title="Delete invoice"
                    >
                      {operationBusy === `delete-invoice-${invoice._id}` ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
                <select
                  value={invoice.status || "draft"}
                  onChange={(e) =>
                    submitOperation(
                      `invoice-${invoice._id}`,
                      {
                        action: "update-invoice-status",
                        invoiceId: invoice._id,
                        status: e.target.value,
                      },
                      "Invoice status updated."
                    )
                  }
                  className="mt-3 w-full rounded-lg border border-navy-700/70 bg-navy-950/70 px-3 py-2 text-sm text-white"
                >
                  {["draft", "sent", "paid", "overdue"].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </Panel>
      </aside>
    </div>
  );
}

// A standalone custom-invoice builder: any bill-to (or a linked client),
// multiple line items, a tax rate that can be added on top / already included /
// off, a custom invoice date (which may be in the PAST for recording an earlier
// payment), and a status you can set straight to "paid". Shows a live total.
function CustomInvoiceForm({
  clients,
  operationBusy,
  createCustomInvoice,
}: {
  clients: AnyDoc[];
  operationBusy: string | null;
  createCustomInvoice: (payload: AnyDoc) => Promise<boolean>;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const inputCls =
    "rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-accent-cyan";

  const [items, setItems] = useState<{ description: string; amount: string }[]>([
    { description: "", amount: "" },
  ]);
  const [clientId, setClientId] = useState("");
  const [billTo, setBillTo] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientGstin, setClientGstin] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [country, setCountry] = useState("");
  const [projectName, setProjectName] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [sac, setSac] = useState("998314");
  const [taxRate, setTaxRate] = useState("18");
  const [gstMode, setGstMode] = useState<"none" | "exclusive" | "inclusive">("exclusive");
  const [invoiceDate, setInvoiceDate] = useState(today);
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("paid");
  const [notes, setNotes] = useState("");

  const busy = operationBusy === "create-custom-invoice";

  const fmt = (v: number) => {
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: (currency || "INR").toUpperCase(),
        maximumFractionDigits: 2,
      }).format(v);
    } catch {
      return `${(currency || "INR").toUpperCase()} ${Math.round(v).toLocaleString()}`;
    }
  };

  // Live totals — mirrors the server's computeInvoiceTotals so the preview matches.
  const subtotal = items.reduce((s, it) => s + Math.max(0, Number(it.amount) || 0), 0);
  const rate = Math.max(0, Number(taxRate) || 0);
  let taxAmount = 0;
  let total = subtotal;
  if (gstMode !== "none" && rate > 0) {
    if (gstMode === "inclusive") {
      taxAmount = subtotal - subtotal / (1 + rate / 100);
    } else {
      taxAmount = subtotal * (rate / 100);
      total = subtotal + taxAmount;
    }
  }

  const setItem = (i: number, key: "description" | "amount", val: string) =>
    setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)));
  const addItem = () => setItems((arr) => [...arr, { description: "", amount: "" }]);
  const removeItem = (i: number) =>
    setItems((arr) => (arr.length > 1 ? arr.filter((_, idx) => idx !== i) : arr));

  const onClientSelect = (id: string) => {
    setClientId(id);
    const c = clients.find((cl) => String(cl._id) === id);
    if (c) {
      setBillTo(c.company || c.name || "");
      setClientEmail(c.email || "");
      setClientPhone(c.contactPhone || c.phone || "");
      setClientGstin(c.clientGstin || "");
      setBillingAddress(c.billingAddress || "");
      setCountry(c.country || "");
      setProjectName((p) => p || c.projectName || "");
      if (c.currency) setCurrency(String(c.currency).toUpperCase());
    }
  };

  const canSubmit = Boolean(billTo.trim()) && subtotal > 0 && !busy;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const lineItems = items
      .map((it) => ({ description: it.description.trim(), amount: Math.max(0, Number(it.amount) || 0) }))
      .filter((it) => it.amount > 0);
    const ok = await createCustomInvoice({
      billTo: billTo.trim(),
      clientId: clientId || undefined,
      clientEmail: clientEmail.trim(),
      clientPhone: clientPhone.trim(),
      clientGstin: clientGstin.trim(),
      billingAddress: billingAddress.trim(),
      country: country.trim(),
      projectName: projectName.trim(),
      currency: currency.trim() || "INR",
      sacCode: sac.trim(),
      lineItems,
      taxRate: rate,
      gstMode,
      invoiceDate,
      dueDate: dueDate || undefined,
      status,
      notes: notes.trim(),
    });
    if (ok) {
      setItems([{ description: "", amount: "" }]);
      setClientId("");
      setBillTo("");
      setClientEmail("");
      setClientPhone("");
      setClientGstin("");
      setBillingAddress("");
      setCountry("");
      setProjectName("");
      setSac("998314");
      setTaxRate("18");
      setGstMode("exclusive");
      setInvoiceDate(today);
      setDueDate("");
      setStatus("paid");
      setNotes("");
    }
  };

  return (
    <Panel id="custom-invoice" title="Create custom invoice" icon={ReceiptText}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-xs text-slate-400">
          Build a one-off invoice for anyone — link a client or type a bill-to, back-date it for a past
          payment, set its status, and choose whether tax is added on top or already included.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm text-slate-300">
            Link a client (optional)
            <select value={clientId} onChange={(e) => onClientSelect(e.target.value)} className={inputCls}>
              <option value="">— None (type bill-to below) —</option>
              {clients.map((c) => (
                <option key={String(c._id)} value={String(c._id)}>
                  {(c.company || c.name) + (c.projectName ? ` — ${c.projectName}` : "")}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm text-slate-300">
            Bill to <span className="text-rose-300">*</span>
            <input value={billTo} onChange={(e) => setBillTo(e.target.value)} placeholder="Client or company name" className={inputCls} />
          </label>
          <label className="grid gap-1 text-sm text-slate-300">
            Email (optional)
            <input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="billing@theirco.com" className={inputCls} />
          </label>
          <label className="grid gap-1 text-sm text-slate-300">
            Description / project (optional)
            <input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g. March retainer" className={inputCls} />
          </label>
          <label className="grid gap-1 text-sm text-slate-300">
            Client phone (optional)
            <input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+91 98xxxxxxx" className={inputCls} />
          </label>
          <label className="grid gap-1 text-sm text-slate-300">
            Client GSTIN (optional)
            <input value={clientGstin} onChange={(e) => setClientGstin(e.target.value)} placeholder="07AAMCT1251B1ZO" className={inputCls} />
          </label>
          <label className="grid gap-1 text-sm text-slate-300">
            Country (optional)
            <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="India" className={inputCls} />
          </label>
          <label className="grid gap-1 text-sm text-slate-300 sm:col-span-2">
            Billing address (appears under Bill To)
            <textarea
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              rows={2}
              placeholder={"Suit D 400-A, 4th Floor, 12 Ajit Singh House\nYusuf Sarai Commercial Complex, Delhi 110016"}
              className={`${inputCls} resize-y`}
            />
          </label>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Line items</span>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1.5 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1.5 text-xs text-accent-cyan"
            >
              <PlusCircle size={14} /> Add item
            </button>
          </div>
          {items.map((it, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={it.description}
                onChange={(e) => setItem(i, "description", e.target.value)}
                placeholder="Description"
                className={`${inputCls} min-w-0 flex-1`}
              />
              <input
                value={it.amount}
                onChange={(e) => setItem(i, "amount", e.target.value)}
                type="number"
                min="0"
                step="0.01"
                placeholder="Amount"
                className={`${inputCls} w-32 shrink-0`}
              />
              <button
                type="button"
                onClick={() => removeItem(i)}
                disabled={items.length <= 1}
                title="Remove line"
                className="shrink-0 rounded-full border border-navy-700/70 bg-navy-800/50 p-2 text-slate-300 hover:border-rose-400/50 hover:text-rose-300 disabled:opacity-40"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1 text-sm text-slate-300">
            Currency
            <input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} placeholder="INR" className={inputCls} />
          </label>
          <label className="grid gap-1 text-sm text-slate-300">
            SAC code
            <input value={sac} onChange={(e) => setSac(e.target.value)} placeholder="998314" className={inputCls} />
          </label>
          <label className="grid gap-1 text-sm text-slate-300">
            Tax rate %
            <input value={taxRate} onChange={(e) => setTaxRate(e.target.value)} type="number" min="0" step="0.1" className={inputCls} />
          </label>
          <label className="grid gap-1 text-sm text-slate-300">
            Tax treatment
            <select value={gstMode} onChange={(e) => setGstMode(e.target.value as any)} className={inputCls}>
              <option value="exclusive">Add on top (exclusive)</option>
              <option value="inclusive">Already included (inclusive)</option>
              <option value="none">No tax</option>
            </select>
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1 text-sm text-slate-300">
            Invoice date
            <input value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} type="date" className={inputCls} />
            <span className="text-[11px] text-slate-500">Can be in the past.</span>
          </label>
          <label className="grid gap-1 text-sm text-slate-300">
            Due date (optional)
            <input value={dueDate} onChange={(e) => setDueDate(e.target.value)} type="date" className={inputCls} />
          </label>
          <label className="grid gap-1 text-sm text-slate-300">
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
              {["paid", "draft", "sent", "overdue"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-1 text-sm text-slate-300">
          Notes (optional)
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Anything to print in the Notes section." className={`${inputCls} resize-y`} />
        </label>

        <div className="grid grid-cols-3 gap-3 rounded-lg border border-navy-700/40 bg-navy-950/40 p-3 text-sm">
          <div>
            <div className="text-xs text-slate-500">Subtotal</div>
            <div className="font-semibold text-white">{fmt(subtotal)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">
              Tax {gstMode === "none" || rate <= 0 ? "" : `(${rate}%${gstMode === "inclusive" ? " incl." : ""})`}
            </div>
            <div className="font-semibold text-white">{fmt(taxAmount)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Total</div>
            <div className="font-bold text-accent-cyan">{fmt(total)}</div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <ReceiptText size={16} />}
          Create invoice
        </button>
      </form>
    </Panel>
  );
}

function AdminSidebar({
  navItems,
  activeView,
  logout,
  session,
}: {
  navItems: { href: string; label: string; icon: any; view: AdminView }[];
  activeView: AdminView;
  logout: () => void;
  session: Session;
}) {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-72 border-r border-navy-700/45 bg-navy-950/95 px-4 py-5 backdrop-blur-xl max-lg:hidden lg:flex lg:flex-col">
      <div className="flex items-center gap-3 px-2">
        <Logo size={52} href="/admin" showWordmark={false} />
      </div>

      <nav className="mt-8 flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.view === activeView;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "border border-accent-cyan/30 bg-accent-cyan/10 text-white"
                  : "text-slate-300 hover:bg-navy-800/70 hover:text-white"
              }`}
            >
              <Icon size={17} className="text-accent-glow" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-navy-700/40 pt-4">
        <div className="flex items-center gap-2 px-3 py-1 text-xs text-slate-400">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent-cyan/15 text-[11px] font-bold uppercase text-accent-cyan">
            {(session.name || session.email).slice(0, 2)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-slate-200">{session.name || session.email}</span>
            <span className="capitalize text-slate-500">{session.role}</span>
          </span>
        </div>
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-navy-800/70 hover:text-white"
        >
          <ExternalLink size={17} className="text-accent-cyan" />
          View site
        </Link>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg border border-rose-400/25 bg-rose-400/10 px-3 py-2.5 text-sm font-medium text-rose-200 transition hover:border-rose-400/50"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
}

function MobileAdminNav({
  navItems,
  activeView,
}: {
  navItems: { href: string; label: string; icon: any; view: AdminView }[];
  activeView: AdminView;
}) {
  return (
    <nav className="flex gap-2 overflow-x-auto border-t border-navy-700/35 px-5 py-3">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = item.view === activeView;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${
              active
                ? "border-accent-cyan/40 bg-accent-cyan/15 text-white"
                : "border-navy-700/60 bg-navy-900/60 text-slate-200"
            }`}
          >
            <Icon size={14} className="text-accent-cyan" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Panel({
  id,
  title,
  icon: Icon,
  children,
}: {
  id?: string;
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-xl border border-navy-700/40 bg-navy-900/35 p-5 lg:scroll-mt-8"
    >
      <div className="mb-5 flex items-center gap-3">
        <Icon size={18} className="text-accent-cyan" />
        <h2 className="font-display text-xl font-bold text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  defaultValue,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1 text-sm text-slate-300">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-accent-cyan"
      />
    </label>
  );
}

function Select({
  name,
  label,
  options,
  defaultValue,
}: {
  name: string;
  label: string;
  options: (string | { value: string; label: string })[];
  defaultValue?: string;
}) {
  return (
    <label className="grid gap-1 text-sm text-slate-300">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-white outline-none focus:border-accent-cyan"
      >
        {options.map((option) => {
          const value = typeof option === "string" ? option : option.value;
          const text = typeof option === "string" ? option : option.label;
          return (
            <option key={value} value={value}>
              {text}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function Textarea({
  name,
  label,
  placeholder,
  required,
  compact,
  value,
  defaultValue,
  onChange,
}: {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  compact?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-sm text-slate-300">
      {label}
      <textarea
        name={name}
        required={required}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        rows={compact ? 2 : 5}
        className="resize-y rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-accent-cyan"
      />
    </label>
  );
}

function SubmitButton({
  busy,
  label,
  icon: Icon,
  compact,
}: {
  busy: boolean;
  label: string;
  icon: any;
  compact?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={busy}
      className={`btn-primary mt-2 inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60 ${
        compact ? "px-4 py-2 text-sm" : ""
      }`}
    >
      {busy ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />}
      {label}
    </button>
  );
}

function initials(name: string) {
  return (name || "?")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const TONES: Record<string, string> = {
  cyan: "text-cyan-300 bg-cyan-400/10 border-cyan-400/25",
  violet: "text-violet-300 bg-violet-400/10 border-violet-400/25",
  emerald: "text-emerald-300 bg-emerald-400/10 border-emerald-400/25",
  amber: "text-amber-300 bg-amber-400/10 border-amber-400/25",
  slate: "text-slate-300 bg-slate-400/10 border-slate-500/25",
};

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  tone = "cyan",
}: {
  icon: any;
  label: string;
  value: string | number;
  hint?: string;
  tone?: keyof typeof TONES | string;
}) {
  return (
    <div className="rounded-xl border border-navy-700/40 bg-navy-900/40 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-slate-500">{label}</span>
        <span className={`grid h-9 w-9 place-items-center rounded-lg border ${TONES[tone] || TONES.cyan}`}>
          <Icon size={16} />
        </span>
      </div>
      <div className="mt-3 font-display text-2xl font-bold text-white">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

function StatusBadge({ value }: { value?: string }) {
  const v = (value || "").toLowerCase();
  const toneByStatus: Record<string, keyof typeof TONES> = {
    active: "emerald",
    posted: "emerald",
    offer: "emerald",
    contract: "cyan",
    scheduled: "cyan",
    open: "cyan",
    screening: "violet",
    intern: "violet",
    interview: "amber",
    drafting: "amber",
    planned: "slate",
    closed: "slate",
    inactive: "slate",
  };
  const tone = toneByStatus[v] || "slate";
  return (
    <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${TONES[tone]}`}>
      {value || "—"}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-navy-700/40 bg-navy-950/35 p-4">
      <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-2 break-words font-display text-xl font-bold text-white">{value}</div>
    </div>
  );
}

function RecordRow({
  title,
  meta,
  action,
}: {
  title: string;
  meta: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-navy-700/40 bg-navy-950/35 p-3">
      <div className="min-w-0">
        <div className="truncate font-semibold text-white">{title}</div>
        <div className="mt-1 text-xs text-slate-400">{meta}</div>
      </div>
      {action}
    </div>
  );
}

function ListEmpty({ show, label }: { show: boolean; label: string }) {
  if (!show) return null;
  return (
    <div className="rounded-lg border border-dashed border-navy-700/60 bg-navy-950/25 p-5 text-center text-sm text-slate-500">
      {label}
    </div>
  );
}

function ContentList({
  title,
  items,
  kind,
  remove,
  busy,
}: {
  title: string;
  items: AnyDoc[];
  kind: "blogs" | "jobs";
  remove: (kind: "blogs" | "jobs", slug: string) => void;
  busy: string | null;
}) {
  return (
    <Panel title={title} icon={kind === "blogs" ? FileText : Briefcase}>
      <ListEmpty show={items.length === 0} label={`No ${kind === "blogs" ? "posts" : "roles"} yet.`} />
      <div className="space-y-3">
        {items.slice(0, 8).map((item) => (
          <div
            key={item._id}
            className="grid gap-3 rounded-lg border border-navy-700/40 bg-navy-950/35 p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold text-white">{item.title}</div>
              <div className="mt-0.5 text-xs text-slate-400">
                {kind === "blogs"
                  ? `/${item.slug} | ${item.category || "Engineering"} | ${dateLabel(item.createdAt)}`
                  : `${item.department} | ${item.location} | ${item.type}`}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:contents">
              <Link
                href={kind === "blogs" ? `/blog/${item.slug}` : `/careers/${item.slug}`}
                target="_blank"
                className="inline-flex w-fit items-center gap-1.5 rounded-full border border-navy-700/60 bg-navy-800/40 px-3 py-1.5 text-xs text-slate-200 hover:border-accent-electric"
              >
                <ExternalLink size={12} /> View
              </Link>
              <button
                onClick={() => remove(kind, item.slug)}
                disabled={busy === item.slug}
                className="inline-flex w-fit items-center gap-1.5 rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 text-xs text-rose-300 hover:border-rose-400/60"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function AutoResultBanner({
  result,
  hrefBuilder,
}: {
  result: {
    ok: boolean;
    message: string;
    inserted?: { title: string; slug: string }[];
  };
  hrefBuilder: (slug: string) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border px-5 py-4 text-sm ${
        result.ok
          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
          : "border-rose-400/40 bg-rose-400/10 text-rose-200"
      }`}
    >
      <div className="font-semibold">{result.message}</div>
      {result.inserted && result.inserted.length > 0 && (
        <ul className="mt-2 space-y-1 text-slate-200/90">
          {result.inserted.map((p) => (
            <li key={p.slug} className="flex items-center gap-2">
              <span className="text-emerald-300">OK</span>
              <Link href={hrefBuilder(p.slug)} target="_blank" className="hover:underline">
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

function dateLabel(value: any) {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";
  return date.toLocaleDateString();
}


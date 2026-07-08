"use client";
import { motion } from "framer-motion";
import Link from "next/link";
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
  MessageSquare,
  PlusCircle,
  ReceiptText,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import Logo from "@/components/Logo";
import { FormEvent, useMemo, useState } from "react";

type AnyDoc = Record<string, any>;

type Stats = {
  view?: AdminView;
  blogs: AnyDoc[];
  jobs: AnyDoc[];
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
};

type AdminView =
  | "dashboard"
  | "ai-publishing"
  | "clients"
  | "invoices"
  | "people"
  | "team"
  | "content"
  | "submissions";

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
  const gross = Array.isArray(client.milestones)
    ? client.milestones.reduce((sum: number, m: any) => sum + Number(m.amount || 0), 0)
    : Number(client.projectValue || 0);
  const discount = Number(client.discountAmount || 0);
  const paid = Array.isArray(client.payments)
    ? client.payments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0)
    : 0;
  const net = Math.max(0, gross - discount);
  return { gross, discount, paid, net, left: Math.max(0, net - paid) };
}

export default function AdminShell(props: Stats) {
  const {
    blogs,
    jobs,
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
  } = props;
  const view = props.view || "dashboard";
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [operationBusy, setOperationBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(null);
  const [autoBlogs, setAutoBlogs] = useState<AutoState>({ busy: false, result: null });
  const [autoJobs, setAutoJobs] = useState<AutoState>({ busy: false, result: null });
  const [combinedClientDoc, setCombinedClientDoc] = useState("");
  const [combinedClientFile, setCombinedClientFile] = useState<File | null>(null);
  const [milestonesText, setMilestonesText] = useState("");
  const [brdText, setBrdText] = useState("");
  const [analysisBusy, setAnalysisBusy] = useState(false);
  const [analysisSource, setAnalysisSource] = useState<string | null>(null);
  const [showClientForm, setShowClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState<AnyDoc | null>(null);
  const [selectedClient, setSelectedClient] = useState<AnyDoc | null>(null);

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
        const [title, amount, dueDate] = line.split("|").map((x) => x.trim());
        return { title, amount: Number(amount || 0), dueDate };
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
        brdText,
        milestones,
      },
      editingClient
        ? "Client updated."
        : "Client added. Agreement generated. Invoices will be created when milestones are completed.",
      form
    );
    if (ok) {
      setCombinedClientDoc("");
      setCombinedClientFile(null);
      setMilestonesText("");
      setBrdText("");
      setAnalysisSource(null);
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
            .map((m: any) =>
              [m.title, Number(m.amount || 0) > 0 ? Number(m.amount || 0) : "", m.dueDate || ""]
                .filter((part) => part !== "")
                .join(" | ")
            )
            .join("\n")
        : ""
    );
    setCombinedClientDoc("");
    setCombinedClientFile(null);
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

  const deleteDocument = async (doc: AnyDoc) => {
    if (!confirm(`Delete ${doc.title}?`)) return;
    await submitOperation(
      `delete-document-${doc._id}`,
      { action: "delete-document", documentId: doc._id },
      "Document deleted."
    );
  };

  const analyzeClientDoc = async (opts?: { file?: File | null; text?: string }) => {
    const fileToAnalyze = opts?.file === undefined ? combinedClientFile : opts.file;
    const textToAnalyze = opts?.text === undefined ? combinedClientDoc : opts.text;
    if (!textToAnalyze.trim() && !fileToAnalyze) {
      setNotice({ ok: false, message: "Paste or upload a combined BRD/milestone document first." });
      return;
    }
    setAnalysisBusy(true);
    setNotice(null);
    try {
      const body = fileToAnalyze
        ? (() => {
            const form = new FormData();
            form.append("file", fileToAnalyze);
            if (textToAnalyze.trim() && !textToAnalyze.startsWith("DOCX uploaded:")) {
              form.append("documentText", textToAnalyze);
            }
            return form;
          })()
        : JSON.stringify({ documentText: textToAnalyze });
      const res = await fetch("/api/admin/analyze-client-doc", {
        method: "POST",
        ...(fileToAnalyze ? {} : { headers: { "content-type": "application/json" } }),
        body,
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Could not analyze document");
      const milestoneLines = Array.isArray(data.milestones)
        ? data.milestones
            .map((m: any) =>
              [m.title, Number(m.amount || 0) > 0 ? Number(m.amount || 0) : "", m.dueDate || ""]
                .filter((part) => part !== "")
                .join(" | ")
            )
            .join("\n")
        : "";
      setBrdText(String(data.brdSummary || ""));
      setMilestonesText(milestoneLines);
      setAnalysisSource(data.source || "analysis");
      setNotice({
        ok: true,
        message: `Document analyzed. Review the separated BRD and milestones before generating docs.`,
      });
    } catch (e: any) {
      setNotice({ ok: false, message: e?.message || "Document analysis failed" });
    } finally {
      setAnalysisBusy(false);
    }
  };

  const readCombinedDocFile = async (file: File | null) => {
    if (!file) return;
    setCombinedClientFile(file);
    if (file.name.toLowerCase().endsWith(".docx")) {
      const label = `DOCX uploaded: ${file.name}`;
      setCombinedClientDoc(label);
      setNotice({
        ok: true,
        message: "DOCX loaded. Analyzing it now...",
      });
      analyzeClientDoc({ file, text: label });
      return;
    }
    try {
      const text = await file.text();
      setCombinedClientFile(null);
      setCombinedClientDoc(text);
      setNotice({
        ok: true,
        message: "Document loaded. Analyzing it now...",
      });
      analyzeClientDoc({ file: null, text });
    } catch {
      setNotice({
        ok: false,
        message: "Could not read this file. Please upload a text/markdown document or paste the content.",
      });
    }
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
    { href: "/admin/ai-publishing", label: "AI publishing", icon: Sparkles, view: "ai-publishing" },
    { href: "/admin/clients", label: "Clients & docs", icon: FileSignature, view: "clients" },
    { href: "/admin/invoices", label: "Invoices", icon: ReceiptText, view: "invoices" },
    { href: "/admin/people", label: "People ops", icon: Users, view: "people" },
    { href: "/admin/team", label: "Team", icon: UserPlus, view: "team" },
    { href: "/admin/content", label: "Content", icon: FileText, view: "content" },
    { href: "/admin/submissions", label: "Submissions", icon: Mail, view: "submissions" },
  ];

  const pageCopy: Record<AdminView, { title: string; description: string }> = {
    dashboard: {
      title: "Company dashboard",
      description: "A quick view of company stats and recent activity.",
    },
    "ai-publishing": {
      title: "AI publishing",
      description: "Generate blogs and job posts manually, while daily blog cron keeps running.",
    },
    clients: {
      title: "Clients and documents",
      description: "Add clients, generate agreements from BRDs, and review generated documents.",
    },
    invoices: {
      title: "Invoices",
      description: "Review milestone invoices, download invoice drafts, and update payment status.",
    },
    people: {
      title: "People operations",
      description: "Add employees, hiring items, social tasks, and company expenses.",
    },
    team: {
      title: "Team overview",
      description: "Review employees, hiring pipeline, and social work at a glance.",
    },
    content: {
      title: "Content",
      description: "Manage published blogs and open roles.",
    },
    submissions: {
      title: "Submissions",
      description: "Track applications, inquiries, and comments.",
    },
  };

  return (
    <div className="min-h-screen bg-navy-950 lg:flex">
      <AdminSidebar navItems={navItems} activeView={view} logout={logout} />

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
          <MobileAdminNav navItems={navItems} activeView={view} />
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
                      meta={`${client.projectName || "Project"} | ${money.format(Number(client.projectValue || 0))}`}
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

        {view === "ai-publishing" && (
        <section
          id="ai-publishing"
          className="mb-8 scroll-mt-28 rounded-xl border border-navy-700/40 bg-navy-900/35 p-5 lg:scroll-mt-8"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-white">AI publishing</h2>
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
          <>
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
                    setCombinedClientDoc("");
                    setCombinedClientFile(null);
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
                  </div>
                  <Textarea
                    name="combinedClientDoc"
                    label="Combined BRD + milestone document"
                    placeholder="Paste the full client document here. It can include scope, requirements, pricing, timelines, and milestones together."
                    value={combinedClientDoc}
                    onChange={(value) => {
                      setCombinedClientDoc(value);
                      setCombinedClientFile(null);
                    }}
                  />
                  <label className="grid gap-1 text-sm text-slate-300">
                    Upload combined document
                    <input
                      type="file"
                      accept=".docx,.txt,.md,.csv,.json"
                      onChange={(event) => readCombinedDocFile(event.target.files?.[0] || null)}
                      className="rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-slate-300 file:mr-3 file:rounded-full file:border-0 file:bg-accent-cyan/15 file:px-3 file:py-1.5 file:text-accent-cyan"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => analyzeClientDoc()}
                    disabled={analysisBusy}
                    className="btn-ghost inline-flex w-fit items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {analysisBusy ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    Analyze document
                  </button>
                  {(brdText || milestonesText) && (
                    <div className="rounded-lg border border-accent-cyan/25 bg-accent-cyan/10 p-4 text-sm text-slate-200">
                      <div className="font-semibold text-white">
                        Separated document output{analysisSource ? ` (${analysisSource})` : ""}
                      </div>
                      <div className="mt-2 grid gap-3 md:grid-cols-2">
                        <div>
                          <div className="text-xs uppercase tracking-wider text-accent-cyan">Milestones</div>
                          <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded-md bg-navy-950/60 p-3 text-xs text-slate-300">
                            {milestonesText || "No milestones found yet."}
                          </pre>
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-wider text-accent-cyan">BRD</div>
                          <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded-md bg-navy-950/60 p-3 text-xs text-slate-300">
                            {brdText || "No BRD summary found yet."}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                  <Textarea
                    name="milestones"
                    label="Milestones extracted for invoices"
                    placeholder={"Discovery | 25000 | 2026-07-20\nMVP delivery | 75000 | 2026-08-15"}
                    value={milestonesText}
                    onChange={setMilestonesText}
                    required
                  />
                  <Textarea
                    name="brdText"
                    label="BRD summary extracted for agreement"
                    placeholder="The extracted BRD summary will appear here after analysis. You can edit it before generating docs."
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
                      {(() => {
                        const f = clientFinancials(selectedClient);
                        return (
                          <div className="grid gap-3 sm:grid-cols-4">
                            <Metric label="Total" value={money.format(f.gross)} />
                            <Metric label="Discount" value={money.format(f.discount)} />
                            <Metric label="Paid" value={money.format(f.paid)} />
                            <Metric label="Left" value={money.format(f.left)} />
                          </div>
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
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button type="button" onClick={() => updateMilestoneStatus(selectedClient, index, "completed")} disabled={Boolean(m.invoiceId)} className="rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1.5 text-xs text-accent-cyan disabled:cursor-not-allowed disabled:opacity-50">Complete & generate invoice</button>
                              <button type="button" onClick={() => updateMilestoneStatus(selectedClient, index, "paid")} className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-300">Mark paid</button>
                            </div>
                          </div>
                        ))}
                      </div>
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
                            <button type="button" onClick={() => downloadText(`${doc.title || "agreement"}.md`, doc.contentMarkdown || "")} className="rounded-full border border-navy-700/70 bg-navy-800/50 p-2 text-slate-200 hover:border-accent-cyan" title="Download agreement markdown"><Download size={14} /></button>
                            <button type="button" onClick={() => deleteDocument(doc)} className="rounded-full border border-rose-400/30 bg-rose-400/10 p-2 text-rose-300 hover:border-rose-400/60" title="Delete document"><Trash2 size={14} /></button>
                          </div>
                        }
                      />
                    ))}
                  </div>
                </Panel>
              </aside>
            </div>
          </>
        )}

        {(view === "people" || view === "invoices") && (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
          <section className="space-y-8">
            {view === "people" && (
            <Panel id="people-ops" title="People, hiring, social, and expenses" icon={Users}>
              <div className="grid gap-5 lg:grid-cols-2">
                <MiniForm
                  title="Add employee"
                  icon={Users}
                  busy={operationBusy === "employee"}
                  onSubmit={(form, data) =>
                    submitOperation(
                      "employee",
                      {
                        action: "add-employee",
                        name: data.get("name"),
                        role: data.get("role"),
                        email: data.get("email"),
                        salaryMonthly: data.get("salaryMonthly"),
                        status: data.get("status"),
                        joiningDate: data.get("joiningDate"),
                      },
                      "Employee added.",
                      form
                    )
                  }
                >
                  <Field name="name" label="Name" required />
                  <Field name="role" label="Role" />
                  <Field name="email" label="Email" type="email" />
                  <Field name="salaryMonthly" label="Monthly salary" type="number" />
                  <Field name="joiningDate" label="Joining date" type="date" />
                  <Select name="status" label="Status" options={["active", "contract", "intern", "inactive"]} />
                </MiniForm>

                <MiniForm
                  title="Hiring pipeline"
                  icon={UserPlus}
                  busy={operationBusy === "hiring"}
                  onSubmit={(form, data) =>
                    submitOperation(
                      "hiring",
                      {
                        action: "add-hiring",
                        title: data.get("title"),
                        department: data.get("department"),
                        stage: data.get("stage"),
                        candidateName: data.get("candidateName"),
                        notes: data.get("notes"),
                      },
                      "Hiring item added.",
                      form
                    )
                  }
                >
                  <Field name="title" label="Role title" required />
                  <Field name="department" label="Department" />
                  <Select name="stage" label="Stage" options={["open", "screening", "interview", "offer", "closed"]} />
                  <Field name="candidateName" label="Candidate" />
                  <Textarea name="notes" label="Notes" compact />
                </MiniForm>

                <MiniForm
                  title="Social task"
                  icon={Megaphone}
                  busy={operationBusy === "social"}
                  onSubmit={(form, data) =>
                    submitOperation(
                      "social",
                      {
                        action: "add-social-task",
                        title: data.get("title"),
                        channel: data.get("channel"),
                        status: data.get("status"),
                        scheduledFor: data.get("scheduledFor"),
                        notes: data.get("notes"),
                      },
                      "Social task added.",
                      form
                    )
                  }
                >
                  <Field name="title" label="Task title" required />
                  <Select name="channel" label="Channel" options={["LinkedIn", "Instagram", "X", "YouTube", "Blog"]} />
                  <Select name="status" label="Status" options={["planned", "drafting", "scheduled", "posted"]} />
                  <Field name="scheduledFor" label="Scheduled for" type="date" />
                  <Textarea name="notes" label="Notes" compact />
                </MiniForm>

                <MiniForm
                  title="Expense"
                  icon={Banknote}
                  busy={operationBusy === "expense"}
                  onSubmit={(form, data) =>
                    submitOperation(
                      "expense",
                      {
                        action: "add-expense",
                        title: data.get("title"),
                        category: data.get("category"),
                        amount: data.get("amount"),
                        paidOn: data.get("paidOn"),
                        recurring: data.get("recurring") === "on",
                        notes: data.get("notes"),
                      },
                      "Expense added.",
                      form
                    )
                  }
                >
                  <Field name="title" label="Expense title" required />
                  <Field name="category" label="Category" />
                  <Field name="amount" label="Amount" type="number" required />
                  <Field name="paidOn" label="Paid on" type="date" />
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input name="recurring" type="checkbox" className="h-4 w-4 rounded border-navy-700 bg-navy-950" />
                    Recurring
                  </label>
                  <Textarea name="notes" label="Notes" compact />
                </MiniForm>
              </div>
            </Panel>
            )}
          </section>

          <aside className="space-y-8">
            {view === "invoices" && (
            <Panel id="invoices" title="Invoices" icon={ReceiptText}>
              <div className="mb-3 grid grid-cols-2 gap-3 text-sm">
                <Metric label="Total raised" value={money.format(finance.invoiceTotal)} />
                <Metric label="Paid" value={money.format(finance.paidTotal)} />
              </div>
              <ListEmpty show={invoices.length === 0} label="No invoices yet." />
              <div className="space-y-3">
                {invoices.slice(0, 8).map((invoice) => (
                  <div key={invoice._id} className="rounded-lg border border-navy-700/40 bg-navy-950/35 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-white">{invoice.invoiceNumber}</div>
                        <div className="mt-1 text-xs text-slate-400">
                          {invoice.clientCompany || invoice.clientName} | {invoice.milestoneTitle}
                        </div>
                        <div className="mt-1 text-xs text-slate-300">{money.format(Number(invoice.amount || 0))}</div>
                      </div>
                      <Link
                        href={`/api/admin/invoices/${invoice._id}/pdf`}
                        className="rounded-full border border-navy-700/70 bg-navy-800/50 p-2 text-slate-200 hover:border-accent-cyan"
                        title="Download invoice PDF"
                      >
                        <Download size={14} />
                      </Link>
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
            )}
          </aside>
        </div>
        )}

        {view === "team" && (
        <div className="mt-8 grid gap-8 xl:grid-cols-2">
          <Panel id="team" title="Team overview" icon={Users}>
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
          </Panel>

          <Panel id="hiring-social" title="Hiring and social" icon={CalendarClock}>
            <div className="grid gap-5 md:grid-cols-2">
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
          </Panel>
        </div>
        )}

        {view === "content" && (
        <div id="content" className="mt-8 grid scroll-mt-28 gap-8 xl:grid-cols-2 lg:scroll-mt-8">
          <ContentList title="Posts" items={blogs} kind="blogs" remove={remove} busy={busy} />
          <ContentList title="Open roles" items={jobs} kind="jobs" remove={remove} busy={busy} />
        </div>
        )}

        {view === "submissions" && (
        <div id="submissions" className="mt-8 grid scroll-mt-28 gap-4 sm:grid-cols-3 lg:scroll-mt-8">
          <Metric label="Applications" value={applicationsCount} />
          <Metric label="Inquiries" value={contactsCount} />
          <Metric label="Comments" value={commentsCount} />
        </div>
        )}
        </main>
      </div>
    </div>
  );
}

function AdminSidebar({
  navItems,
  activeView,
  logout,
}: {
  navItems: { href: string; label: string; icon: any; view: AdminView }[];
  activeView: AdminView;
  logout: () => void;
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

function MiniForm({
  title,
  icon: Icon,
  busy,
  onSubmit,
  children,
}: {
  title: string;
  icon: any;
  busy: boolean;
  onSubmit: (form: HTMLFormElement, data: FormData) => void;
  children: React.ReactNode;
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(event.currentTarget, new FormData(event.currentTarget));
      }}
      className="rounded-lg border border-navy-700/40 bg-navy-950/30 p-4"
    >
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
        <Icon size={16} className="text-accent-glow" />
        {title}
      </div>
      <div className="grid gap-3">{children}</div>
      <SubmitButton busy={busy} label="Save" icon={PlusCircle} compact />
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
}) {
  return (
    <label className="grid gap-1 text-sm text-slate-300">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-white outline-none focus:border-accent-cyan"
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
  options: string[];
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
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
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
  onChange,
}: {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  compact?: boolean;
  value?: string;
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

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.replace(/[^\w.-]+/g, "-");
  anchor.click();
  URL.revokeObjectURL(url);
}

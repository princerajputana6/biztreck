import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isAdmin } from "@/lib/auth";
import {
  buildAgreementMarkdown,
  buildInvoiceMarkdown,
  buildProjectInvoiceMarkdown,
  computeDueDate,
  computeInvoiceTotals,
  normalizeGstMode,
  nextInvoiceNumber,
  parseMilestones,
  toObjectId,
} from "@/lib/admin-operations";

export const runtime = "nodejs";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function requireAdmin() {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  return null;
}

export async function POST(req: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const data = await req.json();
    const action = String(data?.action || "");
    const db = await getDb();
    const now = new Date();

    if (action === "create-client") {
      const name = String(data.name || "").trim();
      const company = String(data.company || "").trim();
      const email = String(data.email || "").trim().toLowerCase();
      const projectName = String(data.projectName || "").trim();
      if (!name || !projectName) {
        return NextResponse.json(
          { ok: false, error: "Client name and project name are required" },
          { status: 400 }
        );
      }

      const duplicateFilters: any[] = [];
      if (company) {
        duplicateFilters.push({
          company: { $regex: `^${escapeRegExp(company)}$`, $options: "i" },
          projectName: { $regex: `^${escapeRegExp(projectName)}$`, $options: "i" },
        });
      }
      if (email) {
        duplicateFilters.push({
          email,
          projectName: { $regex: `^${escapeRegExp(projectName)}$`, $options: "i" },
        });
      }
      if (duplicateFilters.length) {
        const duplicate = await db.collection("clients").findOne({
          $or: duplicateFilters,
        });
        if (duplicate) {
          return NextResponse.json(
            {
              ok: false,
              error:
                "This client/project already exists. Check the clients list before adding it again.",
            },
            { status: 409 }
          );
        }
      }

      const milestones = parseMilestones(data.milestones);
      const client = {
        name,
        company,
        email,
        phone: String(data.phone || "").trim(),
        status: String(data.status || "active"),
        projectName,
        websiteUrl: String(data.websiteUrl || "").trim(),
        reportsTo: String(data.reportsTo || "").trim(),
        theirContact: String(data.theirContact || "").trim(),
        contactEmail: String(data.contactEmail || "").trim(),
        contactPhone: String(data.contactPhone || "").trim(),
        projectValue: milestones.reduce((sum, m) => sum + m.amount, 0),
        totalCost: Math.max(0, Number(data.totalCost || 0)),
        gstRate: Math.max(0, Number(data.gstRate || 0)),
        gstMode: normalizeGstMode(data.gstMode),
        brdText: String(data.brdText || "").trim(),
        milestones,
        createdAt: now,
        updatedAt: now,
      };

      const insertedClient = await db.collection("clients").insertOne(client);
      const clientId = insertedClient.insertedId;
      const agreementMarkdown = buildAgreementMarkdown(client);
      await db.collection("client_documents").insertOne({
        clientId,
        type: "agreement",
        title: `${projectName} Service Agreement`,
        contentMarkdown: agreementMarkdown,
        source: "auto-generated",
        createdAt: now,
        updatedAt: now,
      });

      return NextResponse.json({
        ok: true,
        clientId: String(clientId),
        invoicesCreated: 0,
      });
    }

    if (action === "update-client") {
      const clientId = String(data.clientId || "");
      const name = String(data.name || "").trim();
      const company = String(data.company || "").trim();
      const email = String(data.email || "").trim().toLowerCase();
      const projectName = String(data.projectName || "").trim();
      if (!clientId || !name || !projectName) {
        return NextResponse.json(
          { ok: false, error: "Client id, name and project are required" },
          { status: 400 }
        );
      }
      const milestones = parseMilestones(data.milestones);
      const existing = await db.collection("clients").findOne({ _id: toObjectId(clientId) });
      if (!existing) {
        return NextResponse.json({ ok: false, error: "Client not found" }, { status: 404 });
      }
      await db.collection("clients").updateOne(
        { _id: toObjectId(clientId) },
        {
          $set: {
            name,
            company,
            email,
            phone: String(data.phone || "").trim(),
            status: String(data.status || "active"),
            projectName,
            websiteUrl: String(data.websiteUrl || "").trim(),
            reportsTo: String(data.reportsTo || "").trim(),
            theirContact: String(data.theirContact || "").trim(),
            contactEmail: String(data.contactEmail || "").trim(),
            contactPhone: String(data.contactPhone || "").trim(),
            projectValue: milestones.reduce((sum, m) => sum + m.amount, 0),
            totalCost: Math.max(0, Number(data.totalCost || 0)),
            gstRate: Math.max(0, Number(data.gstRate || 0)),
            gstMode: normalizeGstMode(data.gstMode),
            brdText: String(data.brdText || "").trim(),
            milestones,
            updatedAt: now,
          },
        }
      );
      return NextResponse.json({ ok: true });
    }

    if (action === "delete-client") {
      const clientId = String(data.clientId || "");
      if (!clientId) {
        return NextResponse.json({ ok: false, error: "Client id required" }, { status: 400 });
      }
      const _id = toObjectId(clientId);
      await Promise.all([
        db.collection("clients").deleteOne({ _id }),
        db.collection("client_documents").deleteMany({ clientId: _id }),
        db.collection("invoices").deleteMany({ clientId: _id }),
      ]);
      return NextResponse.json({ ok: true });
    }

    if (action === "delete-document") {
      const documentId = String(data.documentId || "");
      if (!documentId) {
        return NextResponse.json({ ok: false, error: "Document id required" }, { status: 400 });
      }
      await db.collection("client_documents").deleteOne({ _id: toObjectId(documentId) });
      return NextResponse.json({ ok: true });
    }

    if (action === "update-milestone-status") {
      const clientId = String(data.clientId || "");
      const milestoneIndex = Number(data.milestoneIndex);
      const status = String(data.status || "");
      if (
        !clientId ||
        !Number.isInteger(milestoneIndex) ||
        !["planned", "completed", "invoiced", "paid"].includes(status)
      ) {
        return NextResponse.json(
          { ok: false, error: "Valid client, milestone, and status are required" },
          { status: 400 }
        );
      }

      const client = await db.collection("clients").findOne({ _id: toObjectId(clientId) });
      const milestone = client?.milestones?.[milestoneIndex];
      if (!client || !milestone) {
        return NextResponse.json(
          { ok: false, error: "Milestone not found" },
          { status: 404 }
        );
      }

      let invoiceId = milestone.invoiceId || "";
      if ((status === "completed" || status === "invoiced" || status === "paid") && !invoiceId) {
        const invoiceNumber = nextInvoiceNumber(await db.collection("invoices").countDocuments());
        const dueDate = computeDueDate(now, milestone.dueDate);
        const invoiceDoc = {
          invoiceNumber,
          invoiceDate: now,
          clientId: client._id,
          clientName: client.name,
          clientCompany: client.company,
          projectName: client.projectName,
          milestoneTitle: milestone.title,
          milestoneIndex,
          amount: Number(milestone.amount || 0),
          status: status === "paid" ? "paid" : "draft",
          dueDate,
          contentMarkdown: buildInvoiceMarkdown({
            invoiceNumber,
            clientName: client.name,
            clientCompany: client.company,
            projectName: client.projectName,
            milestoneTitle: milestone.title,
            amount: Number(milestone.amount || 0),
            dueDate,
          }),
          createdAt: now,
          updatedAt: now,
        };
        const inserted = await db.collection("invoices").insertOne(invoiceDoc);
        invoiceId = String(inserted.insertedId);
      }

      await db.collection("clients").updateOne(
        { _id: toObjectId(clientId) },
        {
          $set: {
            [`milestones.${milestoneIndex}.status`]: status,
            [`milestones.${milestoneIndex}.invoiceId`]: invoiceId,
            updatedAt: now,
          },
        }
      );

      if (invoiceId && status === "paid") {
        await db
          .collection("invoices")
          .updateOne({ _id: toObjectId(invoiceId) }, { $set: { status: "paid", updatedAt: now } });
      }

      return NextResponse.json({ ok: true, invoiceId });
    }

    if (action === "update-client-discount") {
      const clientId = String(data.clientId || "");
      const discountAmount = Number(data.discountAmount || 0);
      if (!clientId || !Number.isFinite(discountAmount) || discountAmount < 0) {
        return NextResponse.json(
          { ok: false, error: "Valid client id and discount amount are required" },
          { status: 400 }
        );
      }
      await db
        .collection("clients")
        .updateOne(
          { _id: toObjectId(clientId) },
          { $set: { discountAmount, updatedAt: now } }
        );
      return NextResponse.json({ ok: true });
    }

    if (action === "add-client-payment") {
      const clientId = String(data.clientId || "");
      const amount = Number(data.amount || 0);
      const method = String(data.method || "cash").trim();
      if (!clientId || !Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json(
          { ok: false, error: "Valid client id and payment amount are required" },
          { status: 400 }
        );
      }
      const payment = {
        amount,
        method,
        receivedOn: String(data.receivedOn || new Date().toISOString().slice(0, 10)),
        note: String(data.note || "").trim(),
        milestoneIndex:
          data.milestoneIndex === "" || data.milestoneIndex == null
            ? null
            : Number.parseInt(String(data.milestoneIndex), 10),
        createdAt: now,
      };
      await db
        .collection("clients")
        .updateOne(
          { _id: toObjectId(clientId) },
          { $push: { payments: payment }, $set: { updatedAt: now } } as never
        );
      return NextResponse.json({ ok: true });
    }

    if (action === "generate-client-invoice") {
      const clientId = String(data.clientId || "");
      if (!clientId) {
        return NextResponse.json(
          { ok: false, error: "Client id is required" },
          { status: 400 }
        );
      }
      const client = await db
        .collection("clients")
        .findOne({ _id: toObjectId(clientId) });
      if (!client) {
        return NextResponse.json(
          { ok: false, error: "Client not found" },
          { status: 404 }
        );
      }

      const milestones = Array.isArray(client.milestones)
        ? client.milestones
        : [];
      const totals = computeInvoiceTotals({
        totalCost: Number(client.totalCost || 0),
        milestones,
        discount: Number(client.discountAmount || 0),
        taxRate: Number(client.gstRate || 0),
        gstMode: normalizeGstMode(client.gstMode),
      });

      if (totals.subtotal <= 0) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Set a total website cost or add milestones before generating an invoice.",
          },
          { status: 400 }
        );
      }

      const lineItems =
        milestones.length && Number(client.totalCost || 0) <= 0
          ? milestones.map((m: any) => ({
              description: String(m.title || "Project milestone"),
              amount: Number(m.amount || 0),
            }))
          : [
              {
                description: `${client.projectName || "Website development"} — full project`,
                amount: totals.subtotal,
              },
            ];

      const invoiceNumber = nextInvoiceNumber(
        await db.collection("invoices").countDocuments()
      );
      const dueDate = computeDueDate(now);
      const invoiceDoc = {
        invoiceNumber,
        type: "project",
        invoiceDate: now,
        clientId: client._id,
        clientName: client.name,
        clientCompany: client.company,
        clientEmail: client.email,
        projectName: client.projectName,
        websiteUrl: client.websiteUrl || "",
        lineItems,
        subtotal: totals.subtotal,
        discount: totals.discount,
        taxRate: totals.taxRate,
        taxAmount: totals.taxAmount,
        gstMode: totals.gstMode,
        amount: totals.total,
        status: "draft",
        dueDate,
        contentMarkdown: buildProjectInvoiceMarkdown({
          invoiceNumber,
          clientName: client.name,
          clientCompany: client.company,
          clientEmail: client.email,
          projectName: client.projectName,
          websiteUrl: client.websiteUrl || "",
          lineItems,
          totals,
          dueDate,
        }),
        createdAt: now,
        updatedAt: now,
      };
      const inserted = await db.collection("invoices").insertOne(invoiceDoc);
      return NextResponse.json({
        ok: true,
        invoiceId: String(inserted.insertedId),
      });
    }

    if (action === "update-invoice-status") {
      const invoiceId = String(data.invoiceId || "");
      const status = String(data.status || "");
      if (!invoiceId || !["draft", "sent", "paid", "overdue"].includes(status)) {
        return NextResponse.json(
          { ok: false, error: "Valid invoice id and status are required" },
          { status: 400 }
        );
      }
      await db
        .collection("invoices")
        .updateOne({ _id: toObjectId(invoiceId) }, { $set: { status, updatedAt: now } });
      return NextResponse.json({ ok: true });
    }

    if (action === "add-employee") {
      const name = String(data.name || "").trim();
      if (!name) {
        return NextResponse.json(
          { ok: false, error: "Employee name is required" },
          { status: 400 }
        );
      }
      await db.collection("employees").insertOne({
        name,
        role: String(data.role || "").trim(),
        email: String(data.email || "").trim(),
        salaryMonthly: Number(data.salaryMonthly || 0),
        status: String(data.status || "active"),
        joiningDate: String(data.joiningDate || ""),
        createdAt: now,
        updatedAt: now,
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "add-hiring") {
      const title = String(data.title || "").trim();
      if (!title) {
        return NextResponse.json(
          { ok: false, error: "Hiring role title is required" },
          { status: 400 }
        );
      }
      await db.collection("hiring_pipeline").insertOne({
        title,
        department: String(data.department || "").trim(),
        stage: String(data.stage || "open"),
        candidateName: String(data.candidateName || "").trim(),
        notes: String(data.notes || "").trim(),
        createdAt: now,
        updatedAt: now,
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "add-social-task") {
      const title = String(data.title || "").trim();
      if (!title) {
        return NextResponse.json(
          { ok: false, error: "Social task title is required" },
          { status: 400 }
        );
      }
      await db.collection("social_tasks").insertOne({
        title,
        channel: String(data.channel || "LinkedIn"),
        status: String(data.status || "planned"),
        scheduledFor: String(data.scheduledFor || ""),
        notes: String(data.notes || "").trim(),
        createdAt: now,
        updatedAt: now,
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "add-expense") {
      const title = String(data.title || "").trim();
      const amount = Number(data.amount || 0);
      if (!title || !Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json(
          { ok: false, error: "Expense title and amount are required" },
          { status: 400 }
        );
      }
      await db.collection("expenses").insertOne({
        title,
        category: String(data.category || "General"),
        amount,
        paidOn: String(data.paidOn || new Date().toISOString().slice(0, 10)),
        recurring: Boolean(data.recurring),
        notes: String(data.notes || "").trim(),
        createdAt: now,
        updatedAt: now,
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { ok: false, error: "Unknown action" },
      { status: 400 }
    );
  } catch (e: any) {
    console.error("[admin:operations]", e);
    return NextResponse.json(
      { ok: false, error: e?.message || "Operation failed" },
      { status: 500 }
    );
  }
}

"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Check,
  KeyRound,
  Loader2,
  Pencil,
  PlusCircle,
  ShieldCheck,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import {
  PERMISSIONS,
  PRESETS,
  type Permission,
  type Session,
} from "@/lib/rbac";

type AnyUser = {
  email: string;
  name: string;
  role: "owner" | "member";
  permissions: Permission[];
  active: boolean;
  createdAt: string | null;
};

const empty = {
  email: "",
  name: "",
  password: "",
  role: "member" as "owner" | "member",
  permissions: new Set<Permission>(),
};

export default function UsersView({
  session,
  initialUsers,
}: {
  session: Session;
  initialUsers?: AnyUser[];
}) {
  const isOwner = session.role === "owner";
  const [users, setUsers] = useState<AnyUser[]>(initialUsers || []);
  const [me, setMe] = useState(session.email);
  const [loading, setLoading] = useState(!initialUsers);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; msg: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...empty, permissions: new Set<Permission>() });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.ok) {
        setUsers(data.users);
        setMe(data.me);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Already have SSR-fetched data for first paint — skip the redundant refetch.
    if (!initialUsers) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  const resetForm = () => {
    setForm({ ...empty, permissions: new Set<Permission>() });
    setEditing(null);
    setShowForm(false);
  };

  const startCreate = () => {
    setForm({ ...empty, permissions: new Set<Permission>() });
    setEditing(null);
    setShowForm(true);
  };

  const startEdit = (u: AnyUser) => {
    setForm({
      email: u.email,
      name: u.name,
      password: "",
      role: u.role,
      permissions: new Set(u.permissions),
    });
    setEditing(u.email);
    setShowForm(true);
  };

  const togglePerm = (p: Permission) =>
    setForm((f) => {
      const next = new Set(f.permissions);
      next.has(p) ? next.delete(p) : next.add(p);
      return { ...f, permissions: next };
    });

  const applyPreset = (perms: Permission[]) =>
    setForm((f) => ({ ...f, role: "member", permissions: new Set(perms) }));

  const post = async (key: string, payload: any, success: string) => {
    setBusy(key);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed");
      setNotice({ ok: true, msg: success });
      await load();
      return true;
    } catch (e: any) {
      setNotice({ ok: false, msg: e?.message || "Failed" });
      return false;
    } finally {
      setBusy(null);
    }
  };

  const submit = async () => {
    const permissions = Array.from(form.permissions);
    if (editing) {
      const ok = await post(
        "save",
        { action: "update-user", email: editing, name: form.name, role: form.role, permissions },
        "User updated."
      );
      if (ok) resetForm();
    } else {
      const ok = await post(
        "save",
        {
          action: "create-user",
          email: form.email,
          name: form.name,
          password: form.password,
          role: form.role,
          permissions,
        },
        "User created."
      );
      if (ok) resetForm();
    }
  };

  const resetPassword = async (email: string) => {
    const pw = window.prompt(`Set a new password for ${email} (min 8 chars):`);
    if (pw == null) return;
    await post(`pw-${email}`, { action: "reset-password", email, password: pw }, "Password reset.");
  };

  const toggleActive = (u: AnyUser) =>
    post(`act-${u.email}`, { action: "update-user", email: u.email, active: !u.active }, "Updated.");

  const remove = async (u: AnyUser) => {
    if (!window.confirm(`Delete ${u.name || u.email}? This cannot be undone.`)) return;
    post(`del-${u.email}`, { action: "delete-user", email: u.email }, "User deleted.");
  };

  const ownerFieldsDisabled = !isOwner;

  return (
    <div className="mt-8 space-y-6">
      {notice && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            notice.ok
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
              : "border-rose-400/30 bg-rose-400/10 text-rose-200"
          }`}
        >
          {notice.msg}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy-700/40 bg-navy-900/35 p-4">
        <p className="text-sm text-slate-400">
          Create team members and control exactly which modules each can access.
        </p>
        <button
          type="button"
          onClick={showForm ? resetForm : startCreate}
          className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
        >
          {showForm ? <X size={16} /> : <UserPlus size={16} />}
          {showForm ? "Close" : "Add user"}
        </button>
      </div>

      {/* Create / edit form */}
      {showForm && (
        <div className="rounded-xl border border-navy-700/40 bg-navy-900/35 p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            {editing ? <Pencil size={16} className="text-accent-cyan" /> : <UserPlus size={16} className="text-accent-cyan" />}
            {editing ? `Edit ${editing}` : "New user"}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm text-slate-300">
              Full name
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-white outline-none focus:border-accent-cyan"
              />
            </label>
            <label className="grid gap-1 text-sm text-slate-300">
              Email
              <input
                type="email"
                value={form.email}
                disabled={Boolean(editing)}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-white outline-none focus:border-accent-cyan disabled:opacity-60"
              />
            </label>
            {!editing && (
              <label className="grid gap-1 text-sm text-slate-300">
                Temporary password
                <input
                  type="text"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="min 8 characters"
                  className="rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-white outline-none focus:border-accent-cyan"
                />
              </label>
            )}
            <label className="grid gap-1 text-sm text-slate-300">
              Role
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as "owner" | "member" }))}
                className="rounded-lg border border-navy-700/70 bg-navy-950/50 px-3 py-2 text-sm text-white outline-none focus:border-accent-cyan"
              >
                <option value="member">Member (assigned modules)</option>
                <option value="owner" disabled={ownerFieldsDisabled}>
                  Owner (full access)
                </option>
              </select>
              {ownerFieldsDisabled && (
                <span className="text-[11px] text-slate-500">Only an owner can grant owner role.</span>
              )}
            </label>
          </div>

          {form.role === "member" && (
            <>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500">Quick assign:</span>
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p.permissions)}
                    className="rounded-full border border-navy-700/60 bg-navy-800/50 px-3 py-1 text-xs text-slate-200 hover:border-accent-cyan"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {PERMISSIONS.map((p) => {
                  const checked = form.permissions.has(p.key);
                  const locked = p.key === "users" && !isOwner;
                  return (
                    <label
                      key={p.key}
                      className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
                        checked ? "border-accent-cyan/40 bg-accent-cyan/5" : "border-navy-700/50 bg-navy-950/40"
                      } ${locked ? "opacity-50" : "cursor-pointer"}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={locked}
                        onChange={() => togglePerm(p.key)}
                        className="mt-0.5 h-4 w-4 rounded border-navy-700 bg-navy-950"
                      />
                      <span>
                        <span className="font-medium text-white">{p.label}</span>
                        <span className="block text-[11px] text-slate-500">{p.desc}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={busy === "save"}
            className="btn-primary mt-4 inline-flex items-center gap-2 disabled:opacity-60"
          >
            {busy === "save" ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
            {editing ? "Save changes" : "Create user"}
          </button>
        </div>
      )}

      {/* User list */}
      {loading ? (
        <div className="flex items-center gap-2 rounded-xl border border-navy-700/40 bg-navy-900/35 p-8 text-sm text-slate-400">
          <Loader2 size={16} className="animate-spin" /> Loading users…
        </div>
      ) : (
        <div className="space-y-3">
          {users.length === 0 && (
            <div className="rounded-xl border border-dashed border-navy-700/60 bg-navy-950/25 p-8 text-center text-sm text-slate-500">
              No users yet. The owner (env login) always has full access — add members here.
            </div>
          )}
          {users.map((u) => (
            <div key={u.email} className="rounded-xl border border-navy-700/40 bg-navy-900/40 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{u.name || u.email}</span>
                    {u.role === "owner" && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] text-amber-300">
                        <ShieldCheck size={10} /> Owner
                      </span>
                    )}
                    {!u.active && (
                      <span className="rounded-full border border-rose-400/30 bg-rose-400/10 px-2 py-0.5 text-[10px] text-rose-300">
                        Inactive
                      </span>
                    )}
                    {u.email === me && (
                      <span className="rounded-full border border-navy-700/60 bg-navy-800/60 px-2 py-0.5 text-[10px] text-slate-400">
                        You
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">{u.email}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {u.role === "owner" ? (
                      <span className="rounded-full bg-navy-800/60 px-2 py-0.5 text-[10px] text-slate-300">
                        All modules
                      </span>
                    ) : u.permissions.length ? (
                      u.permissions.map((p) => (
                        <span key={p} className="rounded-full bg-navy-800/60 px-2 py-0.5 text-[10px] text-slate-300">
                          {PERMISSIONS.find((x) => x.key === p)?.label || p}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-600">No modules assigned</span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(u)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-navy-700/70 bg-navy-800/50 px-3 py-1.5 text-xs text-slate-200 hover:border-accent-cyan"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => resetPassword(u.email)}
                    disabled={busy === `pw-${u.email}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-navy-700/70 bg-navy-800/50 px-3 py-1.5 text-xs text-slate-200 hover:border-accent-cyan disabled:opacity-60"
                  >
                    <KeyRound size={12} /> Password
                  </button>
                  {u.email !== me && (
                    <button
                      type="button"
                      onClick={() => toggleActive(u)}
                      disabled={busy === `act-${u.email}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-navy-700/70 bg-navy-800/50 px-3 py-1.5 text-xs text-slate-200 hover:border-accent-cyan disabled:opacity-60"
                    >
                      {busy === `act-${u.email}` ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                      {u.active ? "Deactivate" : "Activate"}
                    </button>
                  )}
                  {u.email !== me && (
                    <button
                      type="button"
                      onClick={() => remove(u)}
                      disabled={busy === `del-${u.email}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 text-xs text-rose-300 hover:border-rose-400/60 disabled:opacity-60"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

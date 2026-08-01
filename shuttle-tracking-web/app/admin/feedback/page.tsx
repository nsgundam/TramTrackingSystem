"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArchiveRestore, Loader2, RefreshCw, ShieldAlert, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";

type FeedbackStatus = "new" | "acknowledged" | "investigating" | "resolved" | "duplicate" | "rejected";
type DeleteReason = "privacy_request" | "duplicate_submission" | "abusive_content" | "policy_violation" | "administrative_error";

interface FeedbackCase {
  id: string;
  type: string | null;
  vehicle: { id: string; name: string } | null;
  message: string | null;
  status: FeedbackStatus;
  assignedTo: { id: string; username: string; role: string } | null;
  internalNote: string | null;
  createdAt: string;
  deletedAt: string | null;
  deletionReason: DeleteReason | null;
  restoreExpiresAt: string | null;
}

const nextStatuses: Record<FeedbackStatus, FeedbackStatus[]> = {
  new: ["acknowledged", "duplicate", "rejected"],
  acknowledged: ["investigating"],
  investigating: ["resolved"],
  resolved: [],
  duplicate: [],
  rejected: [],
};

const statusStyle: Record<FeedbackStatus, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  acknowledged: "bg-violet-50 text-violet-700 border-violet-200",
  investigating: "bg-amber-50 text-amber-700 border-amber-200",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  duplicate: "bg-slate-100 text-slate-700 border-slate-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

const reasonLabels: Record<DeleteReason, string> = {
  privacy_request: "Privacy request",
  duplicate_submission: "Duplicate submission",
  abusive_content: "Abusive content",
  policy_violation: "Policy violation",
  administrative_error: "Administrative error",
};

export default function FeedbackInboxPage() {
  const { user, reauthenticate } = useAuth();
  const [cases, setCases] = useState<FeedbackCase[]>([]);
  const [deletedCases, setDeletedCases] = useState<FeedbackCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [confirmation, setConfirmation] = useState<{ action: "delete" | "restore"; caseItem: FeedbackCase } | null>(null);
  const [password, setPassword] = useState("");
  const [deleteReason, setDeleteReason] = useState<DeleteReason>("privacy_request");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [activeResponse, deletedResponse] = await Promise.all([
        api.get("admin/feedback"),
        api.get("admin/feedback/deleted"),
      ]);
      setCases(activeResponse.data as FeedbackCase[]);
      setDeletedCases(deletedResponse.data as FeedbackCase[]);
    } catch {
      setError("Unable to load the feedback inbox.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "DEV")) return;
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [user]);

  const updateCase = async (caseItem: FeedbackCase, status?: FeedbackStatus) => {
    try {
      const internalNote = noteDrafts[caseItem.id];
      const body: { status?: FeedbackStatus; internalNote?: string } = {};
      if (status) body.status = status;
      if (internalNote?.trim()) body.internalNote = internalNote.trim();
      if (Object.keys(body).length === 0) return;
      await api.patch(`admin/feedback/${caseItem.id}`, body);
      setNoteDrafts((current) => ({ ...current, [caseItem.id]: "" }));
      await load();
    } catch {
      setError("The feedback case could not be updated.");
    }
  };

  const confirmSensitiveAction = async (event: FormEvent) => {
    event.preventDefault();
    if (!confirmation || !password) return;
    setSubmitting(true);
    setError(null);
    try {
      await reauthenticate(password);
      if (confirmation.action === "delete") {
        await api.post(`admin/feedback/${confirmation.caseItem.id}/delete`, { reason: deleteReason });
      } else {
        await api.post(`admin/feedback/${confirmation.caseItem.id}/restore`);
      }
      setConfirmation(null);
      setPassword("");
      await load();
    } catch {
      setError("Recent authentication or the requested feedback action failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const canUseInbox = user?.role === "SUPER_ADMIN" || user?.role === "DEV";

  if (!canUseInbox) {
    return <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">Feedback triage is restricted to Super Admin and Dev roles.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Feedback Inbox</h1>
          <p className="text-sm text-slate-500">Anonymous, one-way submissions. Review happens on business days; this is not an emergency channel.</p>
        </div>
        <button onClick={() => void load()} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw size={16} /> Refresh</button>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">Do not add rider contact data or copy feedback content into external tools. Feedback/case data is retained for at most 180 days; deletion is recoverable for 30 days.</div>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-12 text-slate-500"><Loader2 className="animate-spin" size={18} /> Loading inbox…</div>
      ) : cases.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">No active feedback cases.</div>
      ) : (
        <div className="space-y-4">
          {cases.map((caseItem) => (
            <article key={caseItem.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><span className={`rounded-full border px-2.5 py-1 text-xs font-bold uppercase ${statusStyle[caseItem.status]}`}>{caseItem.status}</span><span className="font-mono text-xs text-slate-400">{caseItem.id}</span></div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-800">{caseItem.message}</p>
                  <p className="mt-3 text-xs text-slate-500">{caseItem.type || "other"} · {caseItem.vehicle ? `${caseItem.vehicle.name} (${caseItem.vehicle.id})` : "No vehicle"} · received {new Date(caseItem.createdAt).toLocaleString()}</p>
                  {caseItem.assignedTo && <p className="mt-1 text-xs text-slate-500">Responsible: {caseItem.assignedTo.username}</p>}
                </div>
                <button onClick={() => { setConfirmation({ action: "delete", caseItem }); setPassword(""); }} className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"><Trash2 size={15} /> Delete</button>
              </div>
              <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 lg:grid-cols-[1fr_auto]">
                <textarea value={noteDrafts[caseItem.id] ?? caseItem.internalNote ?? ""} onChange={(event) => setNoteDrafts((current) => ({ ...current, [caseItem.id]: event.target.value }))} maxLength={2000} rows={2} placeholder="Bounded internal case note" className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none" />
                <div className="flex flex-wrap items-start gap-2">
                  <button onClick={() => void updateCase(caseItem)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Save note</button>
                  {nextStatuses[caseItem.status].map((status) => <button key={status} onClick={() => void updateCase(caseItem, status)} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">Mark {status}</button>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold text-slate-900">Recoverable deletions</h2>
        <p className="mt-1 text-sm text-slate-500">Restore is available only before the recorded 30-day deadline and requires recent re-authentication.</p>
        <div className="mt-4 space-y-3">
          {deletedCases.length === 0 ? <p className="text-sm text-slate-500">No feedback is awaiting purge.</p> : deletedCases.map((caseItem) => (
            <div key={caseItem.id} className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm"><p className="font-mono text-xs text-slate-400">{caseItem.id}</p><p className="mt-1 text-slate-700">{caseItem.deletionReason ? reasonLabels[caseItem.deletionReason] : "Deletion recorded"}</p><p className="text-xs text-slate-500">Restore until {caseItem.restoreExpiresAt ? new Date(caseItem.restoreExpiresAt).toLocaleString() : "unavailable"}</p></div>
              <button onClick={() => { setConfirmation({ action: "restore", caseItem }); setPassword(""); }} className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"><ArchiveRestore size={15} /> Restore</button>
            </div>
          ))}
        </div>
      </section>

      {confirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <form onSubmit={(event) => void confirmSensitiveAction(event)} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-slate-900"><ShieldAlert className="text-amber-600" /><h2 className="text-lg font-bold">Recent authentication required</h2></div>
            <p className="mt-3 text-sm text-slate-600">Confirm your current password to {confirmation.action} this feedback case. The refreshed authorization is valid for 15 minutes.</p>
            {confirmation.action === "delete" && <label className="mt-4 block text-sm font-medium text-slate-700">Deletion reason<select value={deleteReason} onChange={(event) => setDeleteReason(event.target.value as DeleteReason)} className="mt-1 w-full rounded-lg border border-slate-200 p-3">{Object.entries(reasonLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>}
            <label className="mt-4 block text-sm font-medium text-slate-700">Current password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required className="mt-1 w-full rounded-lg border border-slate-200 p-3" /></label>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setConfirmation(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button><button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{submitting && <Loader2 className="animate-spin" size={15} />}{confirmation.action === "delete" ? "Delete" : "Restore"}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}

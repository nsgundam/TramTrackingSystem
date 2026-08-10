"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  ArchiveRestore,
  Inbox,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import AdminFormModal from "@/components/admin/AdminFormModal";
import {
  AdminButton,
  AdminNotice,
  AdminResourcePage,
  AdminResourcePanel,
  AdminResourceState,
  AdminStatusBadge,
} from "@/components/admin/AdminResourcePage";

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

const statusTone: Record<
  FeedbackStatus,
  "info" | "warning" | "positive" | "neutral" | "danger"
> = {
  new: "info",
  acknowledged: "info",
  investigating: "warning",
  resolved: "positive",
  duplicate: "neutral",
  rejected: "danger",
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [confirmation, setConfirmation] = useState<{
    action: "delete" | "restore";
    caseItem: FeedbackCase;
  } | null>(null);
  const [password, setPassword] = useState("");
  const [deleteReason, setDeleteReason] = useState<DeleteReason>("privacy_request");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [activeResponse, deletedResponse] = await Promise.all([
        api.get<FeedbackCase[]>("admin/feedback"),
        api.get<FeedbackCase[]>("admin/feedback/deleted"),
      ]);
      setCases(activeResponse.data);
      setDeletedCases(deletedResponse.data);
    } catch {
      setLoadError("Unable to load the feedback inbox.");
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
    setActionError(null);
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
      setActionError("The feedback case could not be updated.");
    }
  };

  const confirmSensitiveAction = async (event: FormEvent) => {
    event.preventDefault();
    if (!confirmation || !password) return;
    setSubmitting(true);
    setActionError(null);
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
      setActionError("Recent authentication or the requested feedback action failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const canUseInbox = user?.role === "SUPER_ADMIN" || user?.role === "DEV";

  if (!canUseInbox) {
    return (
      <div className="admin-access-denied" role="alert">
        <ShieldAlert size={20} aria-hidden="true" />
        <span>Feedback triage is restricted to Super Admin and Dev roles.</span>
      </div>
    );
  }

  return (
    <AdminResourcePage
      resource="feedback"
      eyebrow="Support casework"
      title="Feedback Inbox"
      description="Review anonymous one-way submissions on business days; this is not an emergency channel."
      actionLabel={loading ? "Refreshing…" : "Refresh"}
      actionIcon={<RefreshCw size={18} aria-hidden="true" />}
      actionTone="secondary"
      actionBusy={loading}
      onAction={() => void load()}
    >
      <AdminNotice
        kind="privacy"
        title="Privacy and retention boundary"
        icon={<ShieldCheck size={19} />}
      >
        Do not add rider contact data or copy feedback content into external tools. Feedback/case
        data is retained for at most 180 days; deletion is recoverable for 30 days.
      </AdminNotice>

      {actionError && (
        <div className="admin-inline-alert" role="alert">
          <ShieldAlert size={18} aria-hidden="true" />
          <span>{actionError}</span>
        </div>
      )}

      {loading ? (
        <AdminResourcePanel>
          <AdminResourceState state="loading" message="Loading inbox…" />
        </AdminResourcePanel>
      ) : loadError ? (
        <AdminResourcePanel>
          <AdminResourceState
            state="error"
            title="Feedback queues are unverified"
            message={loadError}
            retryLabel="Retry loading feedback"
            onRetry={() => void load()}
          />
        </AdminResourcePanel>
      ) : (
        <>
          <AdminResourcePanel>
            <section className="admin-feedback-section" aria-labelledby="active-feedback-title">
              <header className="admin-feedback-section__header">
                <div>
                  <p className="admin-resource__eyebrow">Active queue</p>
                  <h2 id="active-feedback-title" className="admin-feedback-section__title">
                    Cases requiring review
                  </h2>
                </div>
                <span className="admin-feedback-section__count">{cases.length} active</span>
              </header>

              {cases.length === 0 ? (
                <AdminResourceState state="empty" message="No active feedback cases." />
              ) : (
                <div
                  className="admin-operations-ledger admin-feedback-ledger"
                  data-admin-operations-ledger="feedback"
                >
                  {cases.map((caseItem) => (
                    <article
                      key={caseItem.id}
                      className="admin-operation-record admin-feedback-case"
                      data-admin-signal={caseItem.status}
                    >
                      <header className="admin-operation-record__header">
                        <div className="admin-operation-record__identity">
                          <span className="admin-operation-record__icon" aria-hidden="true">
                            <Inbox size={18} />
                          </span>
                          <div>
                            <p className="admin-operation-record__eyebrow">Feedback case</p>
                            <h3 className="admin-operation-record__title admin-operation-record__title--mono">
                              {caseItem.id}
                            </h3>
                          </div>
                        </div>
                        <AdminStatusBadge label={caseItem.status} tone={statusTone[caseItem.status]} />
                      </header>

                      <p className="admin-feedback-case__message">{caseItem.message}</p>
                      <dl className="admin-operation-facts admin-feedback-case__facts">
                        <div>
                          <dt>Category</dt>
                          <dd>{caseItem.type || "other"}</dd>
                        </div>
                        <div>
                          <dt>Vehicle</dt>
                          <dd>{caseItem.vehicle ? `${caseItem.vehicle.name} (${caseItem.vehicle.id})` : "No vehicle"}</dd>
                        </div>
                        <div>
                          <dt>Received</dt>
                          <dd>{new Date(caseItem.createdAt).toLocaleString()}</dd>
                        </div>
                        <div>
                          <dt>Responsible</dt>
                          <dd>{caseItem.assignedTo ? caseItem.assignedTo.username : "Unassigned"}</dd>
                        </div>
                      </dl>

                      <div className="admin-feedback-case__work">
                        <label className="admin-field">
                          <span className="admin-field__label">Internal note for feedback {caseItem.id}</span>
                          <textarea
                            aria-label={`Internal note for feedback ${caseItem.id}`}
                            value={noteDrafts[caseItem.id] ?? caseItem.internalNote ?? ""}
                            onChange={(event) => setNoteDrafts((current) => ({
                              ...current,
                              [caseItem.id]: event.target.value,
                            }))}
                            maxLength={2000}
                            rows={2}
                            placeholder="Bounded internal case note"
                            className="admin-form-control admin-feedback-case__note"
                          />
                        </label>
                        <div className="admin-feedback-case__actions">
                          <AdminButton onClick={() => void updateCase(caseItem)}>Save note</AdminButton>
                          {nextStatuses[caseItem.status].map((status) => (
                            <AdminButton
                              key={status}
                              tone="primary"
                              onClick={() => void updateCase(caseItem, status)}
                            >
                              Mark {status}
                            </AdminButton>
                          ))}
                          <AdminButton
                            tone="danger"
                            icon={<Trash2 size={16} aria-hidden="true" />}
                            aria-label={`Delete feedback ${caseItem.id}`}
                            onClick={() => {
                              setConfirmation({ action: "delete", caseItem });
                              setPassword("");
                            }}
                          >
                            Delete
                          </AdminButton>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </AdminResourcePanel>

          <section className="admin-panel admin-feedback-recovery" aria-labelledby="recoverable-feedback-title">
            <header className="admin-panel__header">
              <div>
                <p className="admin-panel__eyebrow">Protected recovery</p>
                <h2 id="recoverable-feedback-title" className="admin-panel__title">
                  Recoverable deletions
                </h2>
                <p className="admin-panel__description">
                  Restore is available only before the recorded 30-day deadline and requires recent re-authentication.
                </p>
              </div>
            </header>
            {deletedCases.length === 0 ? (
              <p className="admin-feedback-recovery__empty">No feedback is awaiting purge.</p>
            ) : (
              <div className="admin-feedback-recovery__list">
                {deletedCases.map((caseItem) => (
                  <article
                    key={caseItem.id}
                    className="admin-feedback-recovery__item"
                    data-admin-signal="deleted"
                  >
                    <div>
                      <p className="admin-resource-id">{caseItem.id}</p>
                      <p className="admin-feedback-recovery__reason">
                        {caseItem.deletionReason
                          ? reasonLabels[caseItem.deletionReason]
                          : "Deletion recorded"}
                      </p>
                      <p className="admin-feedback-recovery__deadline">
                        Restore until {caseItem.restoreExpiresAt
                          ? new Date(caseItem.restoreExpiresAt).toLocaleString()
                          : "unavailable"}
                      </p>
                    </div>
                    <AdminButton
                      icon={<ArchiveRestore size={16} aria-hidden="true" />}
                      aria-label={`Restore feedback ${caseItem.id}`}
                      onClick={() => {
                        setConfirmation({ action: "restore", caseItem });
                        setPassword("");
                      }}
                    >
                      Restore
                    </AdminButton>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <AdminFormModal
        active={Boolean(confirmation)}
        kind="feedback-confirmation"
        titleId="feedback-confirmation-title"
        title="Recent authentication required"
        description={confirmation
          ? `Confirm your current password to ${confirmation.action} this feedback case. The refreshed authorization is valid for 15 minutes.`
          : undefined}
        closeLabel="Close feedback confirmation"
        onClose={() => setConfirmation(null)}
        closeDisabled={submitting}
        leading={<ShieldAlert size={20} aria-hidden="true" />}
        showCloseButton={false}
      >
        {confirmation && (
          <form onSubmit={(event) => void confirmSensitiveAction(event)} className="admin-form admin-confirmation-form">
            {confirmation.action === "delete" && (
              <label htmlFor="feedback-delete-reason" className="admin-field">
                <span className="admin-field__label">Deletion reason</span>
                <select
                  id="feedback-delete-reason"
                  value={deleteReason}
                  onChange={(event) => setDeleteReason(event.target.value as DeleteReason)}
                  className="admin-form-control"
                >
                  {Object.entries(reasonLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
            )}
            <label htmlFor="feedback-current-password" className="admin-field">
              <span className="admin-field__label">Current password</span>
              <input
                id="feedback-current-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="admin-form-control"
              />
            </label>
            <footer className="admin-modal__footer">
              <AdminButton
                type="button"
                onClick={() => setConfirmation(null)}
                disabled={submitting}
                data-modal-initial-focus
              >
                Cancel
              </AdminButton>
              <AdminButton type="submit" tone="primary" disabled={submitting}>
                {submitting && <Loader2 className="admin-resource-state__spinner" size={16} aria-hidden="true" />}
                {confirmation.action === "delete" ? "Delete" : "Restore"}
              </AdminButton>
            </footer>
          </form>
        )}
      </AdminFormModal>
    </AdminResourcePage>
  );
}

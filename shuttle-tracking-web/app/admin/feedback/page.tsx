"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ArchiveRestore,
  Inbox,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { isAdminRole, useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { formatAdminTimestamp } from "@/utils/admin-timestamp";
import AdminFormModal from "@/components/admin/AdminFormModal";
import {
  AdminMutationFeedback,
  adminMutationErrorMessage,
} from "@/components/admin/AdminMutationFeedback";
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

type PendingCaseAction =
  | { kind: "note" }
  | { kind: "status"; status: FeedbackStatus };

interface CaseMutationNotice {
  caseId: string;
  tone: "success" | "error";
  title: string;
  message: string;
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

const SCOPE_ALL = "all";
const SCOPE_GENERAL = "general";
const VEHICLE_SCOPE_PREFIX = "vehicle:";

const reasonLabels: Record<DeleteReason, string> = {
  privacy_request: "Privacy request",
  duplicate_submission: "Duplicate submission",
  abusive_content: "Abusive content",
  policy_violation: "Policy violation",
  administrative_error: "Administrative error",
};

export default function FeedbackInboxPage() {
  const { user, isLoading, reauthenticate } = useAuth();
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
  const [pendingCaseActions, setPendingCaseActions] = useState<
    Record<string, PendingCaseAction>
  >({});
  const [caseMutationNotices, setCaseMutationNotices] = useState<
    Record<string, CaseMutationNotice>
  >({});
  const [selectedScope, setSelectedScope] = useState<string>(SCOPE_ALL);
  const caseUpdatesInFlight = useRef(new Set<string>());

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
    if (isLoading || !user || !isAdminRole(user.role)) return;
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isLoading, user]);

  const vehicleOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    for (const c of [...cases, ...deletedCases]) {
      if (c.vehicle && c.vehicle.id) {
        map.set(c.vehicle.id, c.vehicle);
      }
    }
    return Array.from(map.values()).sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));
  }, [cases, deletedCases]);

  const filteredCases = useMemo(() => {
    if (selectedScope === SCOPE_ALL) return cases;
    if (selectedScope === SCOPE_GENERAL) return cases.filter((c) => !c.vehicle);
    if (selectedScope.startsWith(VEHICLE_SCOPE_PREFIX)) {
      const vehicleId = selectedScope.slice(VEHICLE_SCOPE_PREFIX.length);
      return cases.filter((c) => c.vehicle?.id === vehicleId);
    }
    return cases.filter((c) => c.vehicle?.id === selectedScope);
  }, [cases, selectedScope]);

  const filteredDeletedCases = useMemo(() => {
    if (selectedScope === SCOPE_ALL) return deletedCases;
    if (selectedScope === SCOPE_GENERAL) return deletedCases.filter((c) => !c.vehicle);
    if (selectedScope.startsWith(VEHICLE_SCOPE_PREFIX)) {
      const vehicleId = selectedScope.slice(VEHICLE_SCOPE_PREFIX.length);
      return deletedCases.filter((c) => c.vehicle?.id === vehicleId);
    }
    return deletedCases.filter((c) => c.vehicle?.id === selectedScope);
  }, [deletedCases, selectedScope]);

  const selectedScopeLabel = useMemo(() => {
    if (selectedScope === SCOPE_ALL) return "All feedback";
    if (selectedScope === SCOPE_GENERAL) return "General feedback";
    if (selectedScope.startsWith(VEHICLE_SCOPE_PREFIX)) {
      const vehicleId = selectedScope.slice(VEHICLE_SCOPE_PREFIX.length);
      const found = vehicleOptions.find((v) => v.id === vehicleId);
      return found ? `${found.name} (${found.id})` : vehicleId;
    }
    const found = vehicleOptions.find((v) => v.id === selectedScope);
    return found ? `${found.name} (${found.id})` : selectedScope;
  }, [selectedScope, vehicleOptions]);

  const isReadOnly = user?.role === "ADMIN";
  const canMutate = user?.role === "SUPER_ADMIN" || user?.role === "DEV";
  const canUseInbox = user && isAdminRole(user.role);

  const updateCase = async (caseItem: FeedbackCase, status?: FeedbackStatus) => {
    const internalNote = noteDrafts[caseItem.id];
    const body: { status?: FeedbackStatus; internalNote?: string } = {};
    if (status) body.status = status;
    if (internalNote?.trim()) body.internalNote = internalNote.trim();
    if (Object.keys(body).length === 0 || caseUpdatesInFlight.current.has(caseItem.id)) return;

    caseUpdatesInFlight.current.add(caseItem.id);
    const pendingAction: PendingCaseAction = status
      ? { kind: "status", status }
      : { kind: "note" };
    setPendingCaseActions((current) => ({ ...current, [caseItem.id]: pendingAction }));
    setCaseMutationNotices((current) => {
      const next = { ...current };
      delete next[caseItem.id];
      return next;
    });
    setActionError(null);
    try {
      await api.patch(`admin/feedback/${caseItem.id}`, body);
      setNoteDrafts((current) => ({ ...current, [caseItem.id]: "" }));
      setCaseMutationNotices((current) => ({
        ...current,
        [caseItem.id]: {
          caseId: caseItem.id,
          tone: "success",
          title: status ? `Feedback marked ${status}` : "Feedback note saved",
          message: `Feedback ${caseItem.id} was updated.`,
        },
      }));
      await load();
    } catch (error) {
      setCaseMutationNotices((current) => ({
        ...current,
        [caseItem.id]: {
          caseId: caseItem.id,
          tone: "error",
          title: "Unable to update feedback",
          message: adminMutationErrorMessage(
            error,
            "The feedback case could not be updated. Try again.",
          ),
        },
      }));
    } finally {
      caseUpdatesInFlight.current.delete(caseItem.id);
      setPendingCaseActions((current) => {
        const next = { ...current };
        delete next[caseItem.id];
        return next;
      });
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

  if (isLoading || !user) {
    return (
      <AdminResourcePanel>
        <AdminResourceState state="loading" message="Verifying feedback access…" />
      </AdminResourcePanel>
    );
  }

  if (!canUseInbox) {
    return (
      <div className="admin-access-denied" role="alert">
        <ShieldAlert size={20} aria-hidden="true" />
        <span>Feedback triage is restricted to Admin, Super Admin, and Dev roles.</span>
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

      {isReadOnly && (
        <AdminNotice
          kind="read-only"
          title="Read-only access"
          icon={<ShieldCheck size={19} />}
        >
          Admin role has read-only access. Saving internal notes, changing case status, and deleting or restoring cases require Super Admin or Dev permissions.
        </AdminNotice>
      )}

      {Object.values(caseMutationNotices).map((notice) => (
        <AdminMutationFeedback
          key={notice.caseId}
          tone={notice.tone}
          title={notice.title}
          message={notice.message}
          onDismiss={() => setCaseMutationNotices((current) => {
            const next = { ...current };
            delete next[notice.caseId];
            return next;
          })}
          dismissLabel={`Dismiss feedback ${notice.caseId} mutation notice`}
        />
      ))}

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
            <div className="admin-feedback-toolbar">
              <label htmlFor="feedback-scope-filter" className="admin-field" style={{ margin: 0, maxWidth: "20rem" }}>
                <span className="admin-field__label">Feedback scope</span>
                <select
                  id="feedback-scope-filter"
                  value={selectedScope}
                  onChange={(event) => setSelectedScope(event.target.value)}
                  className="admin-form-control"
                  aria-label="Feedback scope"
                >
                  <option value={SCOPE_ALL}>All feedback</option>
                  <option value={SCOPE_GENERAL}>General feedback</option>
                  {vehicleOptions.map((v) => (
                    <option key={v.id} value={`${VEHICLE_SCOPE_PREFIX}${v.id}`}>
                      {v.name} ({v.id})
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <section className="admin-feedback-section" aria-labelledby="active-feedback-title">
              <header className="admin-feedback-section__header">
                <div>
                  <p className="admin-resource__eyebrow">Active queue</p>
                  <h2 id="active-feedback-title" className="admin-feedback-section__title">
                    Cases requiring review
                  </h2>
                </div>
                <span className="admin-feedback-section__count">{filteredCases.length} active</span>
              </header>

              {filteredCases.length === 0 ? (
                <AdminResourceState
                  state="empty"
                  message={
                    selectedScope === SCOPE_ALL
                      ? "No active feedback cases."
                      : `No active feedback cases for ${selectedScopeLabel}.`
                  }
                />
              ) : (
                <div
                  className="admin-operations-ledger admin-feedback-ledger"
                  data-admin-operations-ledger="feedback"
                >
                  {filteredCases.map((caseItem) => {
                    const pendingAction = pendingCaseActions[caseItem.id];
                    const casePending = Boolean(pendingAction);
                    return (
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
                          <dd>{formatAdminTimestamp(caseItem.createdAt) ?? "unavailable"}</dd>
                        </div>
                        <div>
                          <dt>Responsible</dt>
                          <dd>{caseItem.assignedTo ? caseItem.assignedTo.username : "Unassigned"}</dd>
                        </div>
                        {caseItem.internalNote && (
                          <div>
                            <dt>Internal note</dt>
                            <dd>{caseItem.internalNote}</dd>
                          </div>
                        )}
                      </dl>

                      {canMutate && (
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
                              disabled={casePending}
                            />
                          </label>
                          <div className="admin-feedback-case__actions">
                            <AdminButton
                              onClick={() => void updateCase(caseItem)}
                              disabled={casePending}
                              aria-busy={pendingAction?.kind === "note"}
                            >
                              {pendingAction?.kind === "note" ? "Saving note…" : "Save note"}
                            </AdminButton>
                            {nextStatuses[caseItem.status].map((status) => (
                              <AdminButton
                                key={status}
                                tone="primary"
                                onClick={() => void updateCase(caseItem, status)}
                                disabled={casePending}
                                aria-busy={pendingAction?.kind === "status" && pendingAction.status === status}
                              >
                                {pendingAction?.kind === "status" && pendingAction.status === status
                                  ? `Marking ${status}…`
                                  : `Mark ${status}`}
                              </AdminButton>
                            ))}
                            <AdminButton
                              tone="danger"
                              icon={<Trash2 size={16} aria-hidden="true" />}
                              aria-label={`Delete feedback ${caseItem.id}`}
                              disabled={casePending}
                              onClick={() => {
                                setConfirmation({ action: "delete", caseItem });
                               setPassword("");
                              }}
                            >
                              Delete
                            </AdminButton>
                          </div>
                        </div>
                      )}
                      </article>
                    );
                  })}
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
            {filteredDeletedCases.length === 0 ? (
              <p className="admin-feedback-recovery__empty">
                {selectedScope === SCOPE_ALL
                  ? "No feedback is awaiting purge."
                  : `No feedback is awaiting purge for ${selectedScopeLabel}.`}
              </p>
            ) : (
              <div className="admin-feedback-recovery__list">
                {filteredDeletedCases.map((caseItem) => (
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
                          ? formatAdminTimestamp(caseItem.restoreExpiresAt) ?? "unavailable"
                          : "unavailable"}
                      </p>
                    </div>
                    {canMutate && (
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
                    )}
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

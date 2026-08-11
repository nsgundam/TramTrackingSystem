"use client";

import { CheckCircle2, Loader2, Trash2, TriangleAlert, X } from "lucide-react";
import AdminFormModal from "@/components/admin/AdminFormModal";
import { AdminButton } from "@/components/admin/AdminResourcePage";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord => (
  typeof value === "object" && value !== null
);

export const adminMutationErrorMessage = (error: unknown, fallback: string): string => {
  if (!isRecord(error) || !isRecord(error.response) || !isRecord(error.response.data)) {
    return fallback;
  }

  const serverMessage = error.response.data.error;
  if (typeof serverMessage !== "string") return fallback;
  const normalizedMessage = serverMessage.trim();
  return normalizedMessage.length > 0 ? normalizedMessage : fallback;
};

interface AdminMutationFeedbackProps {
  tone: "success" | "error";
  title: string;
  message: string;
  onDismiss?: () => void;
  dismissLabel?: string;
}

export function AdminMutationFeedback({
  tone,
  title,
  message,
  onDismiss,
  dismissLabel = "Dismiss notification",
}: AdminMutationFeedbackProps) {
  const Icon = tone === "success" ? CheckCircle2 : TriangleAlert;

  return (
    <div
      className="admin-mutation-feedback"
      data-tone={tone}
      data-admin-mutation-feedback={tone}
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "success" ? "polite" : undefined}
      aria-atomic="true"
    >
      <span className="admin-mutation-feedback__icon" aria-hidden="true">
        <Icon size={19} />
      </span>
      <div className="admin-mutation-feedback__body">
        <p className="admin-mutation-feedback__title">{title}</p>
        <p className="admin-mutation-feedback__message">{message}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="admin-mutation-feedback__dismiss"
          aria-label={dismissLabel}
          data-admin-control
        >
          <X size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export type AdminMutationAction = "created" | "updated" | "deleted";

interface AdminMutationReceiptProps {
  resource: string;
  target: string;
  action: AdminMutationAction;
  onDismiss: () => void;
}

export function AdminMutationReceipt({
  resource,
  target,
  action,
  onDismiss,
}: AdminMutationReceiptProps) {
  return (
    <AdminMutationFeedback
      tone="success"
      title={`${resource} ${action}`}
      message={`${target} was ${action}.`}
      onDismiss={onDismiss}
      dismissLabel={`Dismiss ${resource.toLowerCase()} ${action} confirmation`}
    />
  );
}

interface AdminDeleteConfirmationProps {
  active: boolean;
  titleId: string;
  resource: string;
  target: string;
  targetId: string;
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function AdminDeleteConfirmation({
  active,
  titleId,
  resource,
  target,
  targetId,
  busy,
  error,
  onCancel,
  onConfirm,
}: AdminDeleteConfirmationProps) {
  return (
    <AdminFormModal
      active={active}
      kind="mutation-confirmation"
      titleId={titleId}
      title={`Delete ${resource.toLowerCase()}?`}
      description={`Confirm deletion of ${resource.toLowerCase()} ${target} (ID ${targetId}) before this request is sent.`}
      closeLabel={`Close ${resource.toLowerCase()} deletion confirmation`}
      onClose={onCancel}
      closeDisabled={busy}
      leading={<Trash2 size={19} aria-hidden="true" />}
      showCloseButton={false}
    >
      <div className="admin-delete-confirmation">
        <div className="admin-delete-confirmation__target">
          <p className="admin-delete-confirmation__label">Selected {resource.toLowerCase()}</p>
          <p className="admin-delete-confirmation__name">{target}</p>
          <p className="admin-resource-id">ID {targetId}</p>
        </div>

        {error && (
          <AdminMutationFeedback
            tone="error"
            title={`Unable to delete ${resource.toLowerCase()}`}
            message={error}
          />
        )}

        <footer className="admin-modal__footer">
          <AdminButton
            type="button"
            onClick={onCancel}
            disabled={busy}
            data-modal-initial-focus
          >
            Cancel
          </AdminButton>
          <AdminButton
            type="button"
            tone="danger"
            onClick={onConfirm}
            disabled={busy}
            aria-busy={busy}
          >
            {busy && (
              <Loader2
                className="admin-resource-state__spinner"
                size={17}
                aria-hidden="true"
              />
            )}
            {busy ? "Deleting…" : "Delete"}
          </AdminButton>
        </footer>
      </div>
    </AdminFormModal>
  );
}

"use client";

import type { ReactNode } from "react";
import { Loader2, RefreshCw } from "lucide-react";

interface AdminResourcePageProps {
  resource: "vehicles" | "routes" | "stops";
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
  actionIcon: ReactNode;
  onAction: () => void;
  children: ReactNode;
}

export function AdminResourcePage({
  resource,
  eyebrow,
  title,
  description,
  actionLabel,
  actionIcon,
  onAction,
  children,
}: AdminResourcePageProps) {
  return (
    <section className="admin-resource" data-admin-resource={resource}>
      <header className="admin-resource__header">
        <div>
          <p className="admin-resource__eyebrow">{eyebrow}</p>
          <h1 className="admin-resource__title">{title}</h1>
          <p className="admin-resource__description">{description}</p>
        </div>
        <button
          type="button"
          onClick={onAction}
          className="admin-primary-action"
          data-admin-resource-action
        >
          {actionIcon}
          {actionLabel}
        </button>
      </header>
      {children}
    </section>
  );
}

export function AdminResourcePanel({ children }: { children: ReactNode }) {
  return (
    <div className="admin-resource-panel" data-admin-resource-panel>
      {children}
    </div>
  );
}

type AdminResourceStateProps =
  | { state: "loading"; message: string }
  | { state: "empty"; message: string }
  | {
    state: "error";
    message: string;
    retryLabel: string;
    onRetry: () => void;
  };

export function AdminResourceState(props: AdminResourceStateProps) {
  if (props.state === "loading") {
    return (
      <div className="admin-resource-state" role="status" aria-live="polite">
        <Loader2 className="admin-resource-state__spinner" size={20} aria-hidden="true" />
        <span>{props.message}</span>
      </div>
    );
  }

  if (props.state === "error") {
    return (
      <div className="admin-resource-state admin-resource-state--error" role="alert">
        <div>
          <p className="admin-resource-state__title">Unable to verify this list</p>
          <p className="admin-resource-state__message">{props.message}</p>
        </div>
        <button
          type="button"
          onClick={props.onRetry}
          className="admin-secondary-action"
          aria-label={props.retryLabel}
          data-admin-resource-action
        >
          <RefreshCw size={17} aria-hidden="true" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="admin-resource-state admin-resource-state--empty" role="status">
      {props.message}
    </div>
  );
}

interface AdminIconButtonProps {
  label: string;
  tone?: "neutral" | "primary" | "danger";
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
}

export function AdminIconButton({
  label,
  tone = "neutral",
  onClick,
  children,
  disabled = false,
}: AdminIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="admin-icon-action"
      data-tone={tone}
      data-admin-resource-action
    >
      {children}
    </button>
  );
}

export function AdminStatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "positive" | "warning" | "neutral";
}) {
  return (
    <span className="admin-status-badge" data-tone={tone}>
      {label}
    </span>
  );
}

"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2, RefreshCw } from "lucide-react";

interface AdminResourcePageProps {
  resource: "vehicles" | "routes" | "stops" | "source-health" | "feedback";
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
  actionIcon: ReactNode;
  onAction: () => void;
  actionTone?: "primary" | "secondary";
  actionBusy?: boolean;
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
  actionTone = "primary",
  actionBusy = false,
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
          disabled={actionBusy}
          aria-busy={actionBusy}
          className={actionTone === "primary" ? "admin-primary-action" : "admin-secondary-action"}
          data-admin-resource-action
        >
          {actionBusy
            ? <Loader2 className="admin-resource-state__spinner" size={18} aria-hidden="true" />
            : actionIcon}
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
    title?: string;
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
          <p className="admin-resource-state__title">{props.title ?? "Unable to verify this list"}</p>
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
  tone: "positive" | "warning" | "neutral" | "info" | "danger";
}) {
  return (
    <span className="admin-status-badge" data-tone={tone}>
      {label}
    </span>
  );
}

interface AdminNoticeProps {
  kind: "read-only" | "privacy";
  title: string;
  icon: ReactNode;
  children: ReactNode;
}

export function AdminNotice({ kind, title, icon, children }: AdminNoticeProps) {
  return (
    <aside className="admin-notice" data-admin-notice={kind} role="note">
      <span className="admin-notice__icon" aria-hidden="true">{icon}</span>
      <div>
        <p className="admin-notice__title">{title}</p>
        <p className="admin-notice__text">{children}</p>
      </div>
    </aside>
  );
}

interface AdminButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  tone?: "primary" | "secondary" | "danger";
  icon?: ReactNode;
}

export function AdminButton({
  tone = "secondary",
  icon,
  children,
  type = "button",
  ...buttonProps
}: AdminButtonProps) {
  return (
    <button
      {...buttonProps}
      type={type}
      className="admin-button"
      data-tone={tone}
      data-admin-control
    >
      {icon}
      {children}
    </button>
  );
}

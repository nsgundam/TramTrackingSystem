"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { useModalFocus } from "@/hooks/useModalFocus";

interface AdminFormModalProps {
  active: boolean;
  kind: "form" | "route-stops" | "feedback-confirmation";
  titleId: string;
  title: string;
  description?: string;
  closeLabel: string;
  onClose: () => void;
  closeDisabled?: boolean;
  size?: "default" | "wide";
  leading?: ReactNode;
  showCloseButton?: boolean;
  children: ReactNode;
}

export default function AdminFormModal({
  active,
  kind,
  titleId,
  title,
  description,
  closeLabel,
  onClose,
  closeDisabled = false,
  size = "default",
  leading,
  showCloseButton = true,
  children,
}: AdminFormModalProps) {
  const dialogRef = useModalFocus<HTMLDivElement>({
    active,
    onClose: () => {
      if (!closeDisabled) onClose();
    },
    closeOnEscape: !closeDisabled,
    initialFocusSelector: "[data-modal-initial-focus]",
  });

  if (!active) return null;

  return (
    <div className="admin-modal-backdrop">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? `${titleId}-description` : undefined}
        tabIndex={-1}
        className="admin-modal"
        data-size={size}
        data-admin-dialog={kind}
      >
        <header className="admin-modal__header">
          <div className="admin-modal__heading">
            {leading && <span className="admin-modal__leading">{leading}</span>}
            <div>
              <h2 id={titleId} className="admin-modal__title">{title}</h2>
              {description && (
                <p id={`${titleId}-description`} className="admin-modal__description">
                  {description}
                </p>
              )}
            </div>
          </div>
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              disabled={closeDisabled}
              aria-label={closeLabel}
              data-modal-initial-focus
              data-admin-control
              className="admin-modal__close"
            >
              <X size={20} aria-hidden="true" />
            </button>
          )}
        </header>
        {children}
      </div>
    </div>
  );
}

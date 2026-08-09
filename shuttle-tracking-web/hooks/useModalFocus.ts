"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

interface ModalFocusOptions {
  active: boolean;
  onClose: () => void;
  closeOnEscape?: boolean;
  initialFocusSelector?: string;
  restoreFocus?: boolean;
}

const getFocusableElements = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      element.getAttribute("aria-hidden") !== "true"
      && !element.closest("[inert]")
      && element.getClientRects().length > 0,
  );

export function useModalFocus<T extends HTMLElement>({
  active,
  onClose,
  closeOnEscape = true,
  initialFocusSelector,
  restoreFocus = true,
}: ModalFocusOptions): RefObject<T | null> {
  const containerRef = useRef<T>(null);
  const onCloseRef = useRef(onClose);
  const closeOnEscapeRef = useRef(closeOnEscape);

  useEffect(() => {
    onCloseRef.current = onClose;
    closeOnEscapeRef.current = closeOnEscape;
  }, [closeOnEscape, onClose]);

  useEffect(() => {
    if (!active) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const container = containerRef.current;
    if (!container) return;

    const focusInitialControl = () => {
      const requestedControl = initialFocusSelector
        ? container.querySelector<HTMLElement>(initialFocusSelector)
        : null;
      const firstControl = getFocusableElements(container)[0];
      (requestedControl ?? firstControl ?? container).focus({ preventScroll: true });
    };

    const animationFrame = window.requestAnimationFrame(focusInitialControl);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && closeOnEscapeRef.current) {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const controls = getFocusableElements(container);
      if (controls.length === 0) {
        event.preventDefault();
        container.focus({ preventScroll: true });
        return;
      }

      const firstControl = controls[0];
      const lastControl = controls[controls.length - 1];
      const activeElement = document.activeElement;
      if (event.shiftKey && (activeElement === firstControl || !container.contains(activeElement))) {
        event.preventDefault();
        lastControl.focus({ preventScroll: true });
      } else if (!event.shiftKey && activeElement === lastControl) {
        event.preventDefault();
        firstControl.focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.removeEventListener("keydown", handleKeyDown, true);
      if (restoreFocus && previouslyFocused?.isConnected) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [active, initialFocusSelector, restoreFocus]);

  return containerRef;
}

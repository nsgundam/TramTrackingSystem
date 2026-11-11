"use client";
import { memo, useState, useRef, useEffect, useCallback } from "react";
import { Settings } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "./LanguageSelector";
import FeedbackButton from "./FeedbackButton";

interface SettingsMenuProps {
  onFeedbackClick: () => void;
}

function SettingsMenu({ onFeedbackClick }: SettingsMenuProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const toggleSettings = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeSettings = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        closeSettings();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSettings();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeSettings]);

  const handleFeedback = useCallback(() => {
    closeSettings();
    onFeedbackClick();
  }, [closeSettings, onFeedbackClick]);

  return (
    <div className="relative flex flex-col items-end">
      {/* Settings Gear Button: only icon rotates, button card stays fixed */}
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleSettings}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={t("settings") || "Settings"}
        data-testid="settings-toggle-btn"
        className="rsu-settings-btn glass-panel backdrop-blur-sm rounded-full w-10 h-10 md:w-11 md:h-11 flex items-center justify-center text-on-surface shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] hover:bg-white/40! transition-all duration-300 cursor-pointer border border-outline-variant/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary hover:scale-105 active:scale-95"
      >
        <Settings
          size={20}
          className={`text-on-surface transition-transform duration-300 ${
            isOpen ? "rotate-90 text-primary" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Compact Popover: width 44 (176px), only 2 items, no X button */}
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label={t("settings") || "Settings"}
          className="absolute top-12 right-0 mt-1 w-44 glass-panel backdrop-blur-md rounded-2xl p-2 shadow-xl border border-outline-variant/30 flex flex-col gap-2 z-50 animate-in fade-in zoom-in-95 duration-150 select-none"
        >
          <LanguageSelector />
          <FeedbackButton onClick={handleFeedback} />
        </div>
      )}
    </div>
  );
}

export default memo(SettingsMenu);

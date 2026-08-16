"use client";
import { memo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

function LanguageSelector() {
  const { locale, changeLanguage } = useLanguage();

  return (
    <div className="glass-panel backdrop-blur-sm rounded-full p-1 flex gap-1 w-full border border-outline-variant/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
      <button
        type="button"
        onClick={() => changeLanguage("th")}
        aria-label="Thai"
        aria-pressed={locale === "th"}
        className={`flex-1 py-1.5 text-[12px] md:text-[13px] rounded-full transition-all duration-300 font-bold cursor-pointer border-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
          locale === "th"
            ? "bg-primary text-white shadow-md active:scale-95"
            : "text-on-surface-variant hover:bg-white/20 hover:text-on-surface bg-transparent"
        }`}
      >
        TH
      </button>
      <button
        type="button"
        onClick={() => changeLanguage("en")}
        aria-label="English"
        aria-pressed={locale === "en"}
        className={`flex-1 py-1.5 text-[12px] md:text-[13px] rounded-full transition-all duration-300 font-bold cursor-pointer border-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
          locale === "en"
            ? "bg-primary text-white shadow-md active:scale-95"
            : "text-on-surface-variant hover:bg-white/20 hover:text-on-surface bg-transparent"
        }`}
      >
        EN
      </button>
    </div>
  );
}

export default memo(LanguageSelector);

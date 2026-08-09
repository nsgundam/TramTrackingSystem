"use client";
import { useState, memo } from "react";
import ReactDOM from "react-dom";
import { Stop } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";

interface StopInfoCardProps {
  targetStop: Stop | null;
  eta: number | null;
}

const MODAL_OVERLAY_STYLE: React.CSSProperties = {
  position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.8)", display: "flex", justifyContent: "center", alignItems: "center",
  zIndex: 99999, backdropFilter: "blur(3px)"
};

const MODAL_CONTENT_STYLE: React.CSSProperties = {
  position: "relative", maxWidth: "90vw", maxHeight: "85vh",
  backgroundColor: "#fff", padding: "6px", borderRadius: "16px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column"
};

const CLOSE_BTN_STYLE: React.CSSProperties = {
  position: "absolute", top: "-15px", right: "-15px",
  backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "50%",
  width: "40px", height: "40px", fontSize: "24px", fontWeight: "bold",
  cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.3)", zIndex: 10,
  display: "flex", justifyContent: "center", alignItems: "center"
};

function StopInfoCard({ targetStop, eta }: StopInfoCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { locale, t } = useLanguage();

  if (!targetStop) return null;

  const stopName = locale === "th"
    ? (targetStop.nameTh || targetStop.name || "")
    : (targetStop.nameEn || targetStop.nameTh || targetStop.name || "");

  let statusText = t("calculating");
  let statusClass = "bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.2)]";
  
  if (eta === null) {
    statusText = t("noTramsOnRoute");
    statusClass = "bg-rose-500 shadow-[0_0_0_3px_rgba(244,63,94,0.2)]";
  } else if (eta === 0) {
    statusText = t("arriving");
    statusClass = "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]";
  } else {
    statusText = t("enRoute");
    statusClass = "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]";
  }

  const imgUrl = targetStop.imageUrl;

  return (
    <div className="glass-panel backdrop-blur-sm rounded-xl p-3 sm:p-4 flex flex-col gap-2 w-full select-none">
      {/* --- ส่วนของ Modal รูปภาพ --- */}
      {isModalOpen && imgUrl && typeof document !== "undefined" && ReactDOM.createPortal(
        <div onClick={() => setIsModalOpen(false)} style={MODAL_OVERLAY_STYLE}>
          <div onClick={(e) => e.stopPropagation()} style={MODAL_CONTENT_STYLE}>
            <button onClick={() => setIsModalOpen(false)} style={CLOSE_BTN_STYLE} title={t("closeImage")}>×</button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={imgUrl} 
              alt={stopName || t("closeImage")}
              style={{ maxWidth: "100%", maxHeight: "calc(85vh - 12px)", objectFit: "contain", borderRadius: "10px" }} 
            />
          </div>
        </div>,
        document.body
      )}

      {imgUrl && (
        <div 
          className="w-full h-21.25 sm:h-30 rounded-lg overflow-hidden bg-surface-dim/30 cursor-pointer" 
          onClick={() => setIsModalOpen(true)} 
          title={t("clickToEnlarge")}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgUrl} alt={stopName} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex flex-col gap-1">
        <span className="font-label-caps text-[10px] sm:text-label-caps text-on-surface-variant">{t("selectedStation")}</span>
        <h2 className="font-headline-md text-[16px] sm:text-headline-md text-on-surface leading-tight font-semibold">
          {stopName}
        </h2>
      </div>

      <div className="rsu-stop-eta-box flex justify-between items-center">
        <div className="flex flex-col">
          <span className="font-label-caps text-label-caps text-on-surface-variant">{t("estimatedWaitingTime")}</span>
          <div className="flex items-baseline gap-1 mt-1">
            {eta !== null ? (
              <>
                <span className="font-headline-lg text-headline-lg text-on-surface leading-none font-bold">
                  {eta === 0 ? "< 1" : eta}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{t("minSuffix")}</span>
              </>
            ) : (
              <span className="font-headline-lg text-headline-lg text-on-surface-variant leading-none font-bold">-</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-4 py-1 rounded-full border border-white/10">
          <span className={`w-2.5 h-2.5 rounded-full inline-block ${statusClass}`} />
          <span className="font-label-caps text-label-caps text-on-surface font-bold">{statusText}</span>
        </div>
      </div>
    </div>
  );
}

export default memo(StopInfoCard);

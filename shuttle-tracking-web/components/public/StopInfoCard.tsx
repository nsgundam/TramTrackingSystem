"use client";
import { useState, memo } from "react";
import ReactDOM from "react-dom";
import { useModalFocus } from "@/hooks/useModalFocus";
import { Stop } from "@/types";
import {
  getPublicEtaPresentation,
  type AvailabilityTone,
  type PublicAvailabilityReason,
} from "@/utils/truthful-ui-state";

interface StopInfoCardProps {
  targetStop: Stop | null;
  eta: number | null;
  availabilityReason: PublicAvailabilityReason;
}

const ETA_STATUS_CLASSES: Record<AvailabilityTone, string> = {
  live: "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]",
  warning: "bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.2)]",
  unavailable: "bg-slate-500 shadow-[0_0_0_3px_rgba(100,116,139,0.2)]",
  neutral: "bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.2)]",
};

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

function StopInfoCard({ targetStop, eta, availabilityReason }: StopInfoCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dialogRef = useModalFocus<HTMLDivElement>({
    active: isModalOpen,
    onClose: () => setIsModalOpen(false),
    initialFocusSelector: "[data-modal-initial-focus]",
  });

  if (!targetStop) return null;

  const etaPresentation = getPublicEtaPresentation(eta, availabilityReason);

  const imgUrl = targetStop.imageUrl;

  return (
    <div
      className="glass-panel backdrop-blur-sm rounded-xl p-3 sm:p-4 flex flex-col gap-2 w-full select-none"
      data-testid="stop-info-card"
    >
      {/* --- ส่วนของ Modal รูปภาพ --- */}
      {isModalOpen && imgUrl && typeof document !== "undefined" && ReactDOM.createPortal(
        <div onClick={() => setIsModalOpen(false)} style={MODAL_OVERLAY_STYLE}>
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`รูปขยาย ${targetStop.nameTh || targetStop.name}`}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            style={MODAL_CONTENT_STYLE}
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              style={CLOSE_BTN_STYLE}
              aria-label="ปิดรูปภาพ"
              data-modal-initial-focus
            >
              <span aria-hidden="true">×</span>
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={imgUrl} 
              alt={targetStop.nameTh || "รูปขยายป้ายรถเมล์"} 
              style={{ maxWidth: "100%", maxHeight: "calc(85vh - 12px)", objectFit: "contain", borderRadius: "10px" }} 
            />
          </div>
        </div>,
        document.body
      )}

      {imgUrl && (
        <button
          type="button"
          className="block w-full h-21.25 sm:h-30 rounded-lg overflow-hidden bg-surface-dim/30 cursor-pointer border-0 p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={() => setIsModalOpen(true)}
          aria-haspopup="dialog"
          aria-label={`ขยายรูป ${targetStop.nameTh || targetStop.name}`}
          title="คลิกเพื่อขยายรูป"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgUrl} alt={targetStop.nameTh || "รูปป้าย"} className="w-full h-full object-cover" />
        </button>
      )}

      <div className="flex flex-col gap-1">
        <span className="font-label-caps text-[10px] sm:text-label-caps text-on-surface-variant">Selected Station</span>
        <h2 className="font-headline-md text-[16px] sm:text-headline-md text-on-surface leading-tight font-semibold">
          {targetStop.nameTh || targetStop.name}
        </h2>
      </div>

      <div className="rsu-stop-eta-box flex justify-between items-center">
        <div className="flex flex-col">
          <span className="font-label-caps text-label-caps text-on-surface-variant">Estimated Waiting Time</span>
          <div className="flex items-baseline gap-1 mt-1">
            {etaPresentation.value !== null ? (
              <>
                <span className="font-headline-lg text-headline-lg text-on-surface leading-none font-bold">
                  {etaPresentation.value === 0 ? "< 1" : etaPresentation.value}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">min</span>
              </>
            ) : (
              <span className="font-headline-lg text-headline-lg text-on-surface-variant leading-none font-bold">-</span>
            )}
          </div>
        </div>
        <div
          className="flex max-w-[62%] items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 sm:px-4"
          role="status"
          aria-live="polite"
        >
          <span
            className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${ETA_STATUS_CLASSES[etaPresentation.tone]}`}
            aria-hidden="true"
          />
          <span className="font-label-caps text-center text-[10px] font-bold leading-tight text-on-surface sm:text-label-caps">
            {etaPresentation.statusText}
          </span>
        </div>
      </div>
    </div>
  );
}

export default memo(StopInfoCard);

import { useState } from "react";
import ReactDOM from "react-dom";
import { Stop } from "@/types";

interface StopInfoCardProps {
  targetStop: Stop | null;
  eta: number | null;
  onFindNearest: () => void;
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

export default function StopInfoCard({ targetStop, eta }: Omit<StopInfoCardProps, 'onFindNearest'>) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!targetStop) return null;

  let statusText = "กำลังคำนวณ...";
  let statusClass = "bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.2)]";
  
  if (eta === null) { 
    statusText = "ยังไม่มีรถในสายนี้"; 
    statusClass = "bg-rose-500 shadow-[0_0_0_3px_rgba(244,63,94,0.2)]"; 
  } else if (eta === 0) { 
    statusText = "กำลังมาถึง!"; 
    statusClass = "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]"; 
  } else { 
    statusText = "กำลังเดินทาง"; 
    statusClass = "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]"; 
  }

  const imgUrl = targetStop.imageUrl;

  return (
    <div className="glass-panel rounded-xl p-3 sm:p-md flex flex-col gap-sm w-full select-none">
      {/* --- ส่วนของ Modal รูปภาพ --- */}
      {isModalOpen && imgUrl && typeof document !== "undefined" && ReactDOM.createPortal(
        <div onClick={() => setIsModalOpen(false)} style={MODAL_OVERLAY_STYLE}>
          <div onClick={(e) => e.stopPropagation()} style={MODAL_CONTENT_STYLE}>
            <button onClick={() => setIsModalOpen(false)} style={CLOSE_BTN_STYLE} title="ปิดรูปภาพ">×</button>
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
        <div 
          className="w-full h-[85px] sm:h-[120px] rounded-lg overflow-hidden bg-surface-dim/30 cursor-pointer" 
          onClick={() => setIsModalOpen(true)} 
          title="คลิกเพื่อขยายรูป"
        >
          <img src={imgUrl} alt={targetStop.nameTh || "รูปป้าย"} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex flex-col gap-xs">
        <span className="font-label-caps text-[10px] sm:text-label-caps text-on-surface-variant">Selected Station</span>
        <h2 className="font-headline-md text-[16px] sm:text-headline-md text-on-surface leading-tight font-semibold">
          {targetStop.nameTh || targetStop.name}
        </h2>
      </div>

      <div className="flex justify-between items-center bg-black/20 backdrop-blur-sm rounded-lg p-sm border border-white/10">
        <div className="flex flex-col">
          <span className="font-label-caps text-label-caps text-on-surface-variant">Estimated Waiting Time</span>
          <div className="flex items-baseline gap-xs mt-xs">
            {eta !== null ? (
              <>
                <span className="font-headline-lg text-headline-lg text-on-surface leading-none font-bold">
                  {eta === 0 ? "< 1" : eta}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">min</span>
              </>
            ) : (
              <span className="font-headline-lg text-headline-lg text-on-surface-variant leading-none font-bold">-</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-sm bg-white/10 px-md py-xs rounded-full border border-white/10">
          <span className={`w-2.5 h-2.5 rounded-full inline-block ${statusClass}`} />
          <span className="font-label-caps text-label-caps text-on-surface font-bold">{statusText}</span>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle2, MessageSquarePlus, Loader2 } from "lucide-react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVehicleId?: string | null;
  apiOrigin?: string;
}

interface ActiveVehicle {
  id: string;
  name: string;
  route?: {
    name: string;
    color: string;
  } | null;
}

export default function FeedbackModal({
  isOpen,
  onClose,
  initialVehicleId,
  apiOrigin,
}: FeedbackModalProps) {
  const [type, setType] = useState<string>("suggestion");
  const [vehicleId, setVehicleId] = useState<string>(initialVehicleId || "");
  const [message, setMessage] = useState<string>("");
  const [vehicles, setVehicles] = useState<ActiveVehicle[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Setup the backend API base url
  const baseOrigin =
    apiOrigin ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/?$/, "") ||
    "http://localhost:3001";

  // Fetch active vehicles on modal open
  useEffect(() => {
    const fetchVehicles = async () => {
      setIsLoadingVehicles(true);
      try {
        const res = await fetch(`${baseOrigin}/api/public/active-vehicles`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = (await res.json()) as ActiveVehicle[];
        setVehicles(data);

        // If no vehicle was preselected and we got active vehicles, default to the first one
        if (!initialVehicleId && data.length > 0) {
          setVehicleId(data[0].id);
        }
      } catch (err) {
        console.error("Failed to load active vehicles for feedback:", err);
        // Fallback static list if API fails
        const fallbackList = [
          { id: "VH001", name: "Tram R01 (VH001)" },
          { id: "VH002", name: "Tram R02 (VH002)" },
        ];
        setVehicles(fallbackList);
        if (!initialVehicleId) {
          setVehicleId("VH002");
        }
      } finally {
        setIsLoadingVehicles(false);
      }
    };

    fetchVehicles();
  }, [initialVehicleId, baseOrigin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !vehicleId || !message.trim()) {
      setErrorMsg("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await fetch(`${baseOrigin}/api/public/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          vehicleId,
          message: message.trim(),
        }),
      });

      const result = await response.json() as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "เกิดข้อผิดพลาดในการส่งข้อเสนอแนะ");
      }

      setIsSuccess(true);
      // Auto close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: unknown) {
      console.error("Feedback submit error:", err);
      const error = err as Error;
      setErrorMsg(error.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ในขณะนี้");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white text-slate-800 shadow-2xl transition-all border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="text-primary" size={22} />
            <h3 className="text-lg font-bold text-slate-800">ส่งข้อเสนอแนะ / แจ้งปัญหา</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center p-10 text-center animate-scale-up">
            <CheckCircle2 className="text-green-500 mb-4 animate-pulse-dot" size={64} />
            <h4 className="text-xl font-bold text-slate-800 mb-2">ส่งข้อมูลสำเร็จ!</h4>
            <p className="text-slate-500 text-sm">
              ขอบคุณสำหรับข้อเสนอแนะของคุณ ระบบได้บันทึกข้อมูลเรียบร้อยแล้ว
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
            {errorMsg && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Selection for Type with Emojis */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                ประเภทการติดต่อ
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "suggestion", label: "ข้อเสนอแนะ"},
                  { id: "complaint", label: "แจ้งปัญหา / ร้องเรียน"},
                  { id: "praise", label: "ชื่นชมการบริการ"},
                  { id: "other", label: "เรื่องอื่นๆ"},
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id)}
                    className={`flex items-center gap-2 p-3 text-sm rounded-xl border text-left transition-all cursor-pointer ${
                      type === item.id
                        ? "border-primary bg-primary/5 text-primary font-semibold shadow-sm"
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <span className="text-lg"></span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Vehicle selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                เลือกหมายเลขรถรถราง
              </label>
              {isLoadingVehicles ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
                  <Loader2 size={16} className="animate-spin" />
                  <span>กำลังโหลดข้อมูลรถ...</span>
                </div>
              ) : (
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                >
                  <option value="" disabled>-- เลือกหมายเลขรถราง --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name || v.id} {v.route ? `(${v.route.name})` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Feedback message */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                รายละเอียดข้อเสนอแนะ / ปัญหาที่พบ
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="กรุณาระบุรายละเอียดข้อความของคุณ..."
                rows={4}
                required
                className="w-full p-3 rounded-xl border border-slate-200 text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none"
              />
            </div>

            {/* Footer buttons */}
            <div className="pt-2 border-t border-slate-100 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-semibold cursor-pointer text-center"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl bg-primary text-white hover:bg-primary-container hover:shadow-lg active:scale-[0.98] transition-all text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>กำลังส่งข้อมูล...</span>
                  </>
                ) : (
                  <span>ส่งข้อมูล</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

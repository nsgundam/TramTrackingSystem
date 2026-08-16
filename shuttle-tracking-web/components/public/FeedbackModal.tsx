"use client";
import { useCallback, useEffect, useState, memo } from "react";
import { X, CheckCircle2, MessageSquarePlus, Loader2, RefreshCw, TriangleAlert } from "lucide-react";
import { backendConnection } from "@/config/backend";
import { useLanguage } from "@/contexts/LanguageContext";
import { useModalFocus } from "@/hooks/useModalFocus";
import { resolveVerifiedFeedbackVehicleId } from "@/utils/truthful-ui-state";

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

type VehicleLoadState = "loading" | "ready" | "error";

const isActiveVehicle = (value: unknown): value is ActiveVehicle => {
  if (typeof value !== "object" || value === null) return false;
  const vehicle = value as { id?: unknown; name?: unknown };
  return typeof vehicle.id === "string" && typeof vehicle.name === "string";
};

const FEEDBACK_TYPES = [
  { id: "suggestion", labelKey: "suggestionType" },
  { id: "complaint", labelKey: "complaintType" },
  { id: "praise", labelKey: "praiseType" },
  { id: "other", labelKey: "otherType" },
];

function FeedbackModal({
  isOpen,
  onClose,
  initialVehicleId,
}: FeedbackModalProps) {
  const { t } = useLanguage();
  const [type, setType] = useState<string>("suggestion");
  const [vehicleId, setVehicleId] = useState<string>(initialVehicleId || "");
  const [message, setMessage] = useState<string>("");
  const [vehicles, setVehicles] = useState<ActiveVehicle[]>([]);
  const [vehicleLoadState, setVehicleLoadState] = useState<VehicleLoadState>("loading");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const dialogRef = useModalFocus<HTMLDivElement>({
    active: isOpen,
    onClose,
    initialFocusSelector: "[data-modal-initial-focus]",
  });

  const loadVehicles = useCallback(async (signal?: AbortSignal) => {
    setVehicleLoadState("loading");
    setVehicles([]);
    setVehicleId("");

    try {
      const res = await fetch(`${backendConnection.apiBaseUrl}/public/active-vehicles`, { signal });
      if (!res.ok) throw new Error("ACTIVE_VEHICLES_UNAVAILABLE");

      const payload: unknown = await res.json();
      if (!Array.isArray(payload) || !payload.every(isActiveVehicle)) {
        throw new Error("ACTIVE_VEHICLES_INVALID");
      }
      if (signal?.aborted) return;

      setVehicles(payload);
      setVehicleId(resolveVerifiedFeedbackVehicleId(initialVehicleId, payload));
      setVehicleLoadState("ready");
    } catch (error) {
      if (signal?.aborted || (error instanceof DOMException && error.name === "AbortError")) return;
      setVehicles([]);
      setVehicleId("");
      setVehicleLoadState("error");
    }
  }, [initialVehicleId]);

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) void loadVehicles(controller.signal);
    });
    return () => controller.abort();
  }, [loadVehicles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (vehicleLoadState !== "ready") {
      setErrorMsg(t("vehicleVerificationFailed"));
      return;
    }
    if (!type || !vehicleId || !message.trim()) {
      setErrorMsg(t("fillAllFields"));
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await fetch(`${backendConnection.apiBaseUrl}/public/feedback`, {
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

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || t("submitError"));
      }

      setIsSuccess(true);
      // Auto close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: unknown) {
      console.error("Feedback submit error:", err);
      const error = err as Error;
      setErrorMsg(error.message || t("serverConnectionError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-dialog-title"
        tabIndex={-1}
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white text-slate-800 shadow-2xl transition-all border border-slate-100 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="text-primary" size={22} aria-hidden="true" />
            <h3 id="feedback-dialog-title" className="text-lg font-bold text-slate-800">{t("reportIssueTitle")}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("closeFeedbackDialog")}
            data-modal-initial-focus
            className="p-1.5 text-muted-on-light hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center p-10 text-center animate-scale-up" role="status" aria-live="polite">
            <CheckCircle2 className="text-green-500 mb-4 animate-pulse-dot" size={64} aria-hidden="true" />
            <h4 className="text-xl font-bold text-slate-800 mb-2">{t("submitSuccess")}</h4>
            <p className="text-slate-500 text-sm">
              {t("feedbackReceivedNotice")}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
            {errorMsg && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100" role="alert">
                ⚠️ {errorMsg}
              </div>
            )}

            <aside className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-900">
              {t("feedbackPrivacyNotice")}
            </aside>

            {/* Selection for Type with Emojis */}
            <fieldset>
              <legend className="block text-xs font-bold uppercase tracking-wider text-muted-on-light mb-2">
                {t("contactType")}
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {FEEDBACK_TYPES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id)}
                    aria-pressed={type === item.id}
                    className={`flex items-center gap-2 p-3 text-sm rounded-xl border text-left transition-all cursor-pointer ${
                      type === item.id
                        ? "border-primary bg-primary/5 text-primary font-semibold shadow-sm"
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <span>{t(item.labelKey)}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Vehicle selection */}
            <div>
              <label htmlFor="feedback-vehicle" className="block text-xs font-bold uppercase tracking-wider text-muted-on-light mb-1.5">
                {t("selectTram")}
              </label>
              {vehicleLoadState === "loading" ? (
                <div className="flex items-center gap-2 text-muted-on-light text-sm py-2" role="status">
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  <span>{t("loadingTramData")}</span>
                </div>
              ) : vehicleLoadState === "error" ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
                  <div className="flex items-start gap-2">
                    <TriangleAlert className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
                    <p>{t("vehicleListUnavailable")}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void loadVehicles()}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 font-semibold text-red-800 transition-colors hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                  >
                    <RefreshCw size={15} aria-hidden="true" />
                    {t("retryVehicleList")}
                  </button>
                </div>
              ) : vehicles.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700" role="status">
                  <p>{t("noVehicleAvailable")}</p>
                  <button
                    type="button"
                    onClick={() => void loadVehicles()}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                  >
                    <RefreshCw size={15} aria-hidden="true" />
                    {t("retryVehicleList")}
                  </button>
                </div>
              ) : (
                <select
                  id="feedback-vehicle"
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                >
                  <option value="" disabled>{t("selectTramPlaceholder")}</option>
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
              <label htmlFor="feedback-message" className="block text-xs font-bold uppercase tracking-wider text-muted-on-light mb-1.5">
                {t("feedbackDetails")}
              </label>
              <textarea
                id="feedback-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("feedbackPlaceholder")}
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
                {t("cancelBtn")}
              </button>
              <button
                type="submit"
                disabled={
                  isSubmitting
                  || vehicleLoadState !== "ready"
                  || !vehicleId
                  || !message.trim()
                }
                className="flex-1 py-3 px-4 rounded-xl bg-primary text-white hover:bg-primary-container hover:shadow-lg active:scale-[0.98] transition-all text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    <span>{t("submittingBtn")}</span>
                  </>
                ) : (
                  <span>{t("submitBtn")}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default memo(FeedbackModal);

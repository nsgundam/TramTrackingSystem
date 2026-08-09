"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useModalFocus } from "@/hooks/useModalFocus";
import { Stop } from "@/types/stop";

interface StopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Stop>) => void;
  initialData?: Stop | null;
}

export default function StopModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: StopModalProps) {
  const [formData, setFormData] = useState({
    id: "",
    nameTh: "",
    nameEn: "",
    lat: "", 
    lng: "",
    imageUrl: "",
  });
  const dialogRef = useModalFocus<HTMLDivElement>({
    active: isOpen,
    onClose,
    initialFocusSelector: "[data-modal-initial-focus]",
  });

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        id: initialData.id,
        nameTh: initialData.nameTh,
        nameEn: initialData.nameEn || "",
        lat: initialData.lat.toString(),
        lng: initialData.lng.toString(),
        imageUrl: initialData.imageUrl || "",
      });
    } else {
      setFormData({
        id: "",
        nameTh: "",
        nameEn: "",
        lat: "",
        lng: "",
        imageUrl: "",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="stop-dialog-title"
        tabIndex={-1}
        className="bg-white/95 backdrop-blur-lg border border-slate-200/50 rounded-2xl shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 id="stop-dialog-title" className="text-xl font-bold text-slate-900 font-display">
            {initialData ? "Edit Stop" : "Add New Stop"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close stop dialog"
            data-modal-initial-focus
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* ID Input */}
            <div>
              <label htmlFor="stop-id" className="block text-sm font-medium text-slate-700 mb-1">Stop ID</label>
              <input
                id="stop-id"
                required
                disabled={!!initialData}
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-700 disabled:bg-slate-100 "
                placeholder="e.g. ST001"
              />
            </div>

            {/* Name TH */}
            <div>
              <label htmlFor="stop-name-th" className="block text-sm font-medium text-slate-700 mb-1">Name (TH)</label>
              <input
                id="stop-name-th"
                required
                type="text"
                value={formData.nameTh}
                onChange={(e) => setFormData({ ...formData, nameTh: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-700"
                placeholder="e.g. ป้ายหน้ามอ"
              />
            </div>

            {/* Name EN */}
            <div>
              <label htmlFor="stop-name-en" className="block text-sm font-medium text-slate-700 mb-1">Name (EN)</label>
              <input
                id="stop-name-en"
                type="text"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-700"
                placeholder="e.g. Main Gate"
              />
            </div>

            {/* Latitude */}
            <div>
              <label htmlFor="stop-latitude" className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
              <input
                id="stop-latitude"
                required
                type="number"
                step="any"
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm text-slate-700"
                placeholder="13.7365"
              />
            </div>

            {/* Longitude */}
            <div>
              <label htmlFor="stop-longitude" className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
              <input
                id="stop-longitude"
                required
                type="number"
                step="any"
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm text-slate-700"
                placeholder="100.5332"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              {initialData ? "Save Changes" : "Create Stop"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

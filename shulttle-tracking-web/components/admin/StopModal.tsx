"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
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

  useEffect(() => {
    if (initialData) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? "Edit Stop" : "Add New Stop"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* ID Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stop ID</label>
              <input
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Name (TH)</label>
              <input
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Name (EN)</label>
              <input
                type="text"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-700"
                placeholder="e.g. Main Gate"
              />
            </div>

            {/* Latitude */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
              <input
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
              <input
                required
                type="number"
                step="any"
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm text-slate-700"
                placeholder="100.5332"
              />
            </div>
            
            <div className="col-span-2 text-xs text-slate-500 bg-blue-50 p-2 rounded-lg">
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
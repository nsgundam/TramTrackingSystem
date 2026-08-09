"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useModalFocus } from "@/hooks/useModalFocus";
import { Vehicle } from "@/types/vehicle";

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Vehicle>) => void;
  initialData?: Vehicle | null; 
  routes: { id: string; name: string }[];
}

export default function VehicleModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  routes,
}: VehicleModalProps) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    type: "Bus",
    status: "active",
    assignedRouteId: "",
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
        name: initialData.name,
        type: initialData.type,
        status: initialData.status,
        assignedRouteId: initialData.assignedRouteId || "",
      });
    } else {
      setFormData({
        id: "",
        name: "",
        type: "Bus",
        status: "active",
        assignedRouteId: "",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="vehicle-dialog-title"
        tabIndex={-1}
        className="bg-white/95 backdrop-blur-lg border border-slate-200/50 rounded-2xl shadow-xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 id="vehicle-dialog-title" className="text-xl font-bold text-slate-900 font-display">
            {initialData ? "Edit Vehicle" : "Add New Vehicle"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close vehicle dialog"
            data-modal-initial-focus
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(formData as Partial<Vehicle>);
          }}
          className="space-y-4"
        >
          {/* ID Input */}
          <div>
            <label htmlFor="vehicle-id" className="block text-sm font-medium text-slate-700 mb-1">Vehicle ID</label>
            <input
              id="vehicle-id"
              required
              disabled={!!initialData} 
              type="text"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 text-slate-700 disabled:text-slate-400"
              placeholder="e.g. VH001"
            />
          </div>

          {/* Name Input */}
          <div>
            <label htmlFor="vehicle-name" className="block text-sm font-medium text-slate-700 mb-1">Vehicle Name</label>
            <input
              id="vehicle-name"
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-700"
              placeholder="e.g. Red Bus 01"
            />
          </div>

          {/* Type Select */}
          <div>
            <label htmlFor="vehicle-type" className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <input
              id="vehicle-type"
              required
              type="text"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-700"
              placeholder="e.g. รถราง (Tram),รถตู้ (Van), etc."
            />
          </div>

          {/* Status Select */}
          <div>
            <label htmlFor="vehicle-status" className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              id="vehicle-status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-700"
            >
              <option value="active">Active (ใช้งานปกติ)</option>
              <option value="inactive">Inactive (หยุดวิ่ง)</option>
              <option value="maintenance">Maintenance (ซ่อมบำรุง)</option>
            </select>
          </div>

          {/* Route Select */}
          <div>
            <label htmlFor="vehicle-route" className="block text-sm font-medium text-slate-700 mb-1">Assign Route</label>
            <select
              id="vehicle-route"
              value={formData.assignedRouteId}
              onChange={(e) => setFormData({ ...formData, assignedRouteId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-700"
            >
              <option value="">-- No Route Assigned --</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.name}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
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
              {initialData ? "Save Changes" : "Create Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

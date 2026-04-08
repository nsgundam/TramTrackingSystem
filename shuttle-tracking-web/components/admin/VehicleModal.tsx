"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? "Edit Vehicle" : "Add New Vehicle"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle ID</label>
            <input
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Name</label>
            <input
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <input
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Assign Route</label>
            <select
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
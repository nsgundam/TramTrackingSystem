"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Route } from "@/types/route";

interface RouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Route>) => void;
  initialData?: Route | null; 
}

export default function RouteModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: RouteModalProps) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    color: "#3B82F6",
    status: "active",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name,
        color: initialData.color,
        status: initialData.status,
      });
    } else {
      setFormData({
        id: "",
        name: "",
        color: "#3B82F6",
        status: "active",
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
            {initialData ? "Edit Route" : "Add New Route"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24}/>
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(formData as Partial<Route>);
          }}
          className="space-y-4"
        >

          {/*ID Input*/}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Route ID</label>
            <input
            required
            disabled={!!initialData}
              type="text"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 text-slate-700 disabled:text-slate-400"
              placeholder="e.g. R01"
            />
          </div>

          {/* Route Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Route Name</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-700"
              placeholder="e.g. วนภายในมหาวิทยาลัย"
            />
          </div>

          {/* Route Color */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Route Color</label>
            <div className="flex items-center gap-3">
              <input
                required
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="h-10 w-20 p-1 border border-slate-300 rounded-lg cursor-pointer"
              />
              <span className="text-sm font-mono text-slate-500 uppercase">{formData.color}</span>
            </div>
          </div>

          {/* Route Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-700"
            >
              <option value="active">Active (เปิดให้บริการ)</option>
              <option value="inactive">Inactive (ปิดปรับปรุง)</option>
            </select>
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
              {initialData ? "Save Changes" : "Create Route"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
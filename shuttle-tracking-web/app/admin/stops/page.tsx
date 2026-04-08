"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Plus, Pencil, Trash2, RefreshCw, MapPin } from "lucide-react";
import { Stop } from "@/types/stop";
import StopModal from "@/components/admin/StopModal";

export default function StopsPage() {
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<Stop | null>(null);

  const fetchStops = async () => {
    try {
      setLoading(true);
      const res = await api.get("admin/stops");
      setStops(res.data);
    } catch (error) {
      console.error("Failed to fetch stops:", error);
      alert("Failed to connect to backend!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStops();
  }, []);

  const handleSave = async (data: Partial<Stop>) => {
    try {
      if (editingStop) {
        await api.put(`admin/stops/${editingStop.id}`, data);
      } else {
        await api.post("admin/stops", data);
      }
      setIsModalOpen(false);
      fetchStops();
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save stop");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this stop?")) return;
    try {
      await api.delete(`admin/stops/${id}`);
      fetchStops();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting stop");
    }
  };

  const openAddModal = () => {
    setEditingStop(null);
    setIsModalOpen(true);
  };

  const openEditModal = (stop: Stop) => {
    setEditingStop(stop);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Stops Management</h1>
          <p className="text-slate-500">Manage bus stops and their coordinates</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Stop
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex justify-center items-center gap-2">
            <RefreshCw className="animate-spin" /> Loading...
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-sm font-semibold text-slate-600">ID</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Name (TH / EN)</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Coordinates</th>
                <th className="p-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stops.map((stop) => (
                <tr key={stop.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-mono text-sm text-slate-500">{stop.id}</td>
                  <td className="p-4">
                    <p className="font-medium text-slate-900">{stop.nameTh}</p>
                    {stop.nameEn && <p className="text-xs text-slate-500">{stop.nameEn}</p>}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg w-fit">
                      <MapPin size={16} className="text-blue-500" />
                      <span className="font-mono text-xs">
                        {stop.lat.toFixed(5)}, {stop.lng.toFixed(5)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(stop)}
                      className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(stop.id)}
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {!loading && stops.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            No stops found. Click &ldquo;Add Stop&rdquo; to start.
          </div>
        )}
      </div>

      <StopModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        initialData={editingStop}
      />
    </div>
  );
}

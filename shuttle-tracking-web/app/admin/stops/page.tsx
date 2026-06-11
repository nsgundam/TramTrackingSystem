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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Stops Management</h1>
          <p className="text-slate-500">Manage bus stops and their coordinates</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
        >
          <Plus size={20} />
          Add Stop
        </button>
      </div>

      {/* Table & Card Section */}
      <div className="bg-transparent lg:bg-white lg:rounded-xl lg:shadow-xs lg:border lg:border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 flex justify-center items-center gap-2 shadow-xs">
            <RefreshCw className="animate-spin text-blue-600" /> Loading...
          </div>
        ) : (
          <>
            {/* Card View for Mobile/Tablet */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
              {stops.map((stop) => (
                <div
                  key={stop.id}
                  className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                        {stop.id}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-2 font-display">
                        {stop.nameTh}
                      </h3>
                      {stop.nameEn && (
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                          {stop.nameEn}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100/80 px-2.5 py-1.5 rounded-lg border border-slate-200/50">
                      <MapPin size={14} className="text-blue-500" />
                      <span className="font-mono text-[10px] font-bold">
                        {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(stop)}
                        className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors inline-flex items-center justify-center border border-blue-200/40"
                        title="Edit Stop"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(stop.id)}
                        className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors inline-flex items-center justify-center border border-red-200/40"
                        title="Delete Stop"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Table View for Desktop */}
            <div className="hidden lg:block overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead className="bg-slate-55 border-b border-slate-200">
                  <tr>
                    <th className="p-4 text-sm font-bold text-slate-700 uppercase tracking-wider">ID</th>
                    <th className="p-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Name (TH / EN)</th>
                    <th className="p-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Coordinates</th>
                    <th className="p-4 text-sm font-bold text-slate-700 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stops.map((stop) => (
                    <tr
                      key={stop.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="p-4 font-mono text-sm font-semibold text-slate-500">
                        {stop.id}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900 font-display">{stop.nameTh}</p>
                        {stop.nameEn && <p className="text-xs text-slate-500 font-medium mt-0.5">{stop.nameEn}</p>}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg w-fit border border-slate-200/40">
                          <MapPin size={16} className="text-blue-500" />
                          <span className="font-mono text-xs font-semibold">
                            {stop.lat.toFixed(5)}, {stop.lng.toFixed(5)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(stop)}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors inline-flex items-center justify-center hover:scale-105"
                          title="Edit Stop"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(stop.id)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors inline-flex items-center justify-center hover:scale-105"
                          title="Delete Stop"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && stops.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 font-medium shadow-xs">
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

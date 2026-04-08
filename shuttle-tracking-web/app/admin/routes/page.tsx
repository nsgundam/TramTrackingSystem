"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import { Route } from "@/types/route";
import RouteModal from "@/components/admin/RouteModal";

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("admin/routes");
      setRoutes(res.data);
    } catch (error) {
      console.error("Failed to fetch routes:", error);
      alert("Failed to connect to backend!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (data: Partial<Route>) => {
    try {
      if (editingRoute) {
        // UPDATE
        await api.put(`admin/routes/${editingRoute.id}`, data);
      } else {
        // CREATE
        await api.post("admin/routes", data);
      }

      setIsModalOpen(false);
      setEditingRoute(null);
      fetchData();
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save route");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this route?")) return;
    try {
      await api.delete(`admin/routes/${id}`);
      fetchData();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete route");
    }
  };

  const openAddModal = () => {
    setEditingRoute(null);
    setIsModalOpen(true);
  };

  const openEditModal = (route: Route) => {
    setEditingRoute(route);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Routes Management
          </h1>
          <p className="text-slate-500">
            Manage your tram routes and assignments
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Route
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex justify-center items-center gap-2">
            <RefreshCw className="animate-spin" /> Loading...
          </div>
        ) : (
          <table className="w-full table-auto border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-sm font-semibold text-slate-600">ID</th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  Name
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  Color
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  Status
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr
                  key={route.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="p-4 font-mono text-sm text-slate-500">
                    {route.id}
                  </td>
                  <td className="p-4 font-medium text-slate-900">
                    {route.name}
                  </td>
                  <td className="p-4">
                    <span
                      className="inline-block w-4 h-4 rounded-full"
                      style={{ backgroundColor: route.color }}
                    ></span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        route.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {route.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(route)}
                      className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(route.id)}
                      className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && routes.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            No routes found. Click &ldquo;Add Route&rdquo; to start.
          </div>
        )}
      </div>

      <RouteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRoute(null);
        }}
        onSubmit={handleSave}
        initialData={editingRoute}
      />
    </div>
  );
}

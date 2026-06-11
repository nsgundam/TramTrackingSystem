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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
        >
          <Plus size={20} />
          Add Route
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
              {routes.map((route) => (
                <div
                  key={route.id}
                  className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                        {route.id}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-2 font-display">
                        {route.name}
                      </h3>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        route.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {route.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-4 h-4 rounded-full shadow-xs"
                        style={{ backgroundColor: route.color }}
                      ></span>
                      <span className="font-mono text-xs text-slate-500 uppercase">{route.color}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(route)}
                        className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors inline-flex items-center justify-center border border-blue-200/40"
                        title="Edit Route"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(route.id)}
                        className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors inline-flex items-center justify-center border border-red-200/40"
                        title="Delete Route"
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
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="bg-slate-55 border-b border-slate-200">
                  <tr>
                    <th className="p-4 text-sm font-bold text-slate-700 uppercase tracking-wider">ID</th>
                    <th className="p-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Name</th>
                    <th className="p-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Color</th>
                    <th className="p-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-sm font-bold text-slate-700 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {routes.map((route) => (
                    <tr
                      key={route.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="p-4 font-mono text-sm font-semibold text-slate-500">
                        {route.id}
                      </td>
                      <td className="p-4 font-bold text-slate-900 font-display">
                        {route.name}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block w-4 h-4 rounded-full shadow-xs"
                            style={{ backgroundColor: route.color }}
                          ></span>
                          <span className="font-mono text-xs text-slate-500 uppercase">{route.color}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            route.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {route.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(route)}
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center justify-center shadow-xs transition-colors hover:scale-105"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(route.id)}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center justify-center shadow-xs transition-colors hover:scale-105"
                        >
                          <Trash2 size={16} />
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
        {!loading && routes.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 font-medium shadow-xs">
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

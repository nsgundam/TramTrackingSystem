"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import { Vehicle } from "@/types/vehicle";
import VehicleModal from "@/components/admin/VehicleModal";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vehiclesRes, routesRes] = await Promise.all([
        api.get("/admin/vehicles"),
        api.get("/admin/routes"),
      ]);

      setVehicles(vehiclesRes.data);
      setRoutes(routesRes.data);
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
      alert("Failed to connect to backend!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (data: Partial<Vehicle>) => {
    try {
      if (editingVehicle) {
        // UPDATE
        await api.put(`/admin/vehicles/${editingVehicle.id}`, data);
      } else {
        // CREATE
        await api.post("/admin/vehicles", data);
      }

      setIsModalOpen(false);
      setEditingVehicle(null);
      fetchData();
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save vehicle");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await api.delete(`/admin/vehicles/${id}`);
      fetchData();
    } catch (error) {
      alert("Error deleting vehicle: " + error);
    }
  };

  const openAddModal = () => {
    setEditingVehicle(null);
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Vehicles Management
          </h1>
          <p className="text-slate-500">Manage your fleet and assignments</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Vehicle
        </button>
      </div>

      {/* Table Section */}
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
                <th className="p-4 text-sm font-semibold text-slate-600">
                  Name
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  Type
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  Route
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
              {vehicles.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="p-4 font-mono text-sm text-slate-500">
                    {vehicle.id}
                  </td>
                  <td className="p-4 font-medium text-slate-900">
                    {vehicle.name}
                  </td>
                  <td className="p-4 text-slate-600">{vehicle.type}</td>
                  <td className="p-4">
                    {vehicle.route ? (
                      <span
                        className="px-2 py-1 rounded-md text-xs font-medium text-white"
                        style={{ backgroundColor: vehicle.route.color }}
                      >
                        {vehicle.route.name}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        vehicle.status === "active"
                          ? "bg-green-100 text-green-700"
                          : vehicle.status === "maintenance"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {vehicle.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(vehicle)}
                      className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle.id)}
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

        {/* Empty State */}
        {!loading && vehicles.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            No vehicles found. Click &ldquo;Add Vehicle&rdquo; to start.
          </div>
        )}
      </div>

      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        initialData={editingVehicle}
        routes={routes}
      />
    </div>
  );
}

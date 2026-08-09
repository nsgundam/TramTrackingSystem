"use client";

import { useEffect, useState } from "react";
import { ListOrdered, Pencil, Plus, Trash2 } from "lucide-react";
import api from "@/services/api";
import { Route } from "@/types/route";
import RouteModal from "@/components/admin/RouteModal";
import RouteStopsModal from "@/components/admin/RouteStopsModal";
import { normalizeHexColor } from "@/utils/colorContrast";
import {
  AdminIconButton,
  AdminResourcePage,
  AdminResourcePanel,
  AdminResourceState,
  AdminStatusBadge,
} from "@/components/admin/AdminResourcePage";

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [managingStopsFor, setManagingStopsFor] = useState<Route | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await api.get<Route[]>("admin/routes");
      setRoutes(response.data);
    } catch (error) {
      console.error("Failed to fetch routes:", error);
      setLoadError("Unable to load routes. Check the connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchData();
  }, []);

  const handleSave = async (data: Partial<Route>) => {
    try {
      if (editingRoute) {
        await api.put(`admin/routes/${editingRoute.id}`, data);
      } else {
        await api.post("admin/routes", data);
      }
      setIsModalOpen(false);
      setEditingRoute(null);
      await fetchData();
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save route");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this route?")) return;
    try {
      await api.delete(`admin/routes/${id}`);
      await fetchData();
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

  const actionsFor = (route: Route) => (
    <div className="admin-resource-actions">
      <AdminIconButton
        label={`Manage stops for ${route.name}`}
        onClick={() => setManagingStopsFor(route)}
      >
        <ListOrdered size={17} aria-hidden="true" />
      </AdminIconButton>
      <AdminIconButton
        label={`Edit ${route.name}`}
        tone="primary"
        onClick={() => openEditModal(route)}
      >
        <Pencil size={17} aria-hidden="true" />
      </AdminIconButton>
      <AdminIconButton
        label={`Delete ${route.name}`}
        tone="danger"
        onClick={() => void handleDelete(route.id)}
      >
        <Trash2 size={17} aria-hidden="true" />
      </AdminIconButton>
    </div>
  );

  const colorFor = (route: Route) => (
    <div className="admin-resource-meta">
      <span
        className="admin-route-color"
        style={{ backgroundColor: normalizeHexColor(route.color) }}
        aria-hidden="true"
      />
      <span className="admin-resource-detail">{route.color.toUpperCase()}</span>
    </div>
  );

  return (
    <AdminResourcePage
      resource="routes"
      eyebrow="Network definition"
      title="Routes Management"
      description="Maintain route identity, service status, color, and published stop order."
      actionLabel="Add Route"
      actionIcon={<Plus size={18} aria-hidden="true" />}
      onAction={openAddModal}
    >
      <AdminResourcePanel>
        {loading ? (
          <AdminResourceState state="loading" message="Loading routes…" />
        ) : loadError ? (
          <AdminResourceState
            state="error"
            message={loadError}
            retryLabel="Retry loading routes"
            onRetry={() => void fetchData()}
          />
        ) : routes.length === 0 ? (
          <AdminResourceState
            state="empty"
            message={'No routes found. Click "Add Route" to start.'}
          />
        ) : (
          <>
            <div className="admin-resource-card-view" data-admin-view="cards">
              {routes.map((route) => (
                <article key={route.id} className="admin-resource-card">
                  <div className="admin-resource-card__header">
                    <div>
                      <span className="admin-resource-id">{route.id}</span>
                      <h2 className="admin-resource-name">{route.name}</h2>
                    </div>
                    <AdminStatusBadge
                      label={route.status}
                      tone={route.status === "active" ? "positive" : "neutral"}
                    />
                  </div>
                  <div className="admin-resource-card__footer">
                    {colorFor(route)}
                    {actionsFor(route)}
                  </div>
                </article>
              ))}
            </div>

            <div className="admin-resource-table-view" data-admin-view="table">
              <table className="admin-resource-table">
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Name</th>
                    <th scope="col">Color</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="admin-resource-table__actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map((route) => (
                    <tr key={route.id}>
                      <td><span className="admin-resource-id">{route.id}</span></td>
                      <td className="admin-resource-table__name">{route.name}</td>
                      <td>{colorFor(route)}</td>
                      <td>
                        <AdminStatusBadge
                          label={route.status}
                          tone={route.status === "active" ? "positive" : "neutral"}
                        />
                      </td>
                      <td className="admin-resource-table__actions">{actionsFor(route)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </AdminResourcePanel>

      <RouteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRoute(null);
        }}
        onSubmit={handleSave}
        initialData={editingRoute}
      />
      <RouteStopsModal
        route={managingStopsFor}
        onClose={() => setManagingStopsFor(null)}
        onSaved={() => void fetchData()}
      />
    </AdminResourcePage>
  );
}

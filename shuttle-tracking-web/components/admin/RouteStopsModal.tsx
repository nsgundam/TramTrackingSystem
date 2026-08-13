"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ListOrdered, Loader2, Plus, Trash2 } from "lucide-react";
import AdminFormModal from "@/components/admin/AdminFormModal";
import {
  AdminMutationFeedback,
  adminMutationErrorMessage,
} from "@/components/admin/AdminMutationFeedback";
import api from "@/services/api";
import { Route } from "@/types/route";
import { Stop } from "@/types/stop";

interface RouteStopResponse extends Stop {
  stopOrder: number;
}

interface AdminStop extends Stop {
  status: string;
}

interface RouteStopsModalProps {
  route: Route | null;
  onClose: () => void;
  onSaved: (route: Route) => void;
}

interface RouteStopsError {
  title: string;
  message: string;
}

export default function RouteStopsModal({ route, onClose, onSaved }: RouteStopsModalProps) {
  const [allStops, setAllStops] = useState<AdminStop[]>([]);
  const [orderedStops, setOrderedStops] = useState<Stop[]>([]);
  const [selectedStopId, setSelectedStopId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<RouteStopsError | null>(null);
  const publishInFlight = useRef(false);

  useEffect(() => {
    if (!route) return;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      setSelectedStopId("");
      try {
        const [stopsResponse, routeStopsResponse] = await Promise.all([
          api.get<AdminStop[]>("admin/stops"),
          api.get<RouteStopResponse[]>(`admin/route-stops/${route.id}`),
        ]);
        if (cancelled) return;
        setAllStops(stopsResponse.data);
        setOrderedStops(
          [...routeStopsResponse.data]
            .sort((left, right) => left.stopOrder - right.stopOrder)
            .map(({ id, nameTh, nameEn, lat, lng, imageUrl }) => ({
              id,
              nameTh,
              ...(nameEn ? { nameEn } : {}),
              lat: Number(lat),
              lng: Number(lng),
              ...(imageUrl ? { imageUrl } : {}),
            })),
        );
      } catch (loadError) {
        if (!cancelled) {
          setError({
            title: "Unable to load route stops",
            message: adminMutationErrorMessage(loadError, "Unable to load route stops."),
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [route]);

  const availableStops = useMemo(
    () => allStops.filter(
      (stop) => stop.status === "active" && !orderedStops.some((selected) => selected.id === stop.id),
    ),
    [allStops, orderedStops],
  );

  const moveStop = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= orderedStops.length) return;
    setOrderedStops((current) => {
      const next = [...current];
      const [moved] = next.splice(index, 1);
      if (!moved) return current;
      next.splice(target, 0, moved);
      return next;
    });
  };

  const addStop = () => {
    const stop = availableStops.find((candidate) => candidate.id === selectedStopId);
    if (!stop) return;
    setOrderedStops((current) => [...current, stop]);
    setSelectedStopId("");
  };

  const guardedClose = () => {
    if (publishInFlight.current) return;
    onClose();
  };

  const save = async () => {
    if (!route || publishInFlight.current) return;
    const completedRoute = route;
    const body = { stopIds: orderedStops.map((stop) => stop.id) };
    publishInFlight.current = true;
    setSaving(true);
    setError(null);
    try {
      await api.put(`admin/route-stops/${completedRoute.id}`, body);
      onSaved(completedRoute);
      onClose();
    } catch (saveError) {
      setError({
        title: "Unable to publish route stop order",
        message: adminMutationErrorMessage(saveError, "Unable to publish route stops. Try again."),
      });
    } finally {
      publishInFlight.current = false;
      setSaving(false);
    }
  };

  if (!route) return null;

  return (
    <AdminFormModal
      active
      kind="route-stops"
      titleId="route-stops-dialog-title"
      title="Route stops"
      description={`Arrange the published stop order for ${route.name} (${route.id}).`}
      closeLabel="Close route stops manager"
      onClose={guardedClose}
      closeDisabled={saving}
      size="wide"
      leading={<ListOrdered size={18} aria-hidden="true" />}
    >
      {loading ? (
        <div className="admin-route-stops__loading" role="status">
          <Loader2 className="admin-resource-state__spinner" size={20} aria-hidden="true" />
          Loading route stops…
        </div>
      ) : (
        <>
          <div className="admin-route-stops__add">
            <label htmlFor="route-stop-selection" className="admin-field__label">
              Add active stop
              <select
                id="route-stop-selection"
                value={selectedStopId}
                onChange={(event) => setSelectedStopId(event.target.value)}
                className="admin-form-control"
                data-admin-control
                disabled={saving}
              >
                <option value="">Select a stop</option>
                {availableStops.map((stop) => (
                  <option key={stop.id} value={stop.id}>
                    {stop.nameTh}{stop.nameEn ? ` — ${stop.nameEn}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={addStop}
              disabled={!selectedStopId || saving}
              className="admin-button"
              data-tone="primary"
              data-admin-control
            >
              <Plus size={17} aria-hidden="true" />
              Add
            </button>
          </div>

          {error && (
            <AdminMutationFeedback
              tone="error"
              title={error.title}
              message={error.message}
            />
          )}

          <ol className="admin-route-stops__list" aria-label="Published stop order">
            {orderedStops.map((stop, index) => (
              <li key={stop.id} className="admin-route-stops__item">
                <span className="admin-route-stops__order">{index + 1}</span>
                <span className="admin-route-stops__name">
                  {stop.nameTh}{stop.nameEn ? ` — ${stop.nameEn}` : ""}
                </span>
                <div className="admin-resource-actions">
                  <button
                    type="button"
                    onClick={() => moveStop(index, -1)}
                    disabled={index === 0 || saving}
                    aria-label={`Move ${stop.nameTh} up`}
                    className="admin-icon-action"
                    data-admin-control
                  >
                    <ArrowUp size={17} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStop(index, 1)}
                    disabled={index === orderedStops.length - 1 || saving}
                    aria-label={`Move ${stop.nameTh} down`}
                    className="admin-icon-action"
                    data-admin-control
                  >
                    <ArrowDown size={17} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderedStops(
                      (current) => current.filter((item) => item.id !== stop.id),
                    )}
                    disabled={saving}
                    aria-label={`Remove ${stop.nameTh}`}
                    className="admin-icon-action"
                    data-tone="danger"
                    data-admin-control
                  >
                    <Trash2 size={17} aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ol>

          {orderedStops.length === 0 && (
            <p className="admin-route-stops__empty">
              No stops are published for this route yet.
            </p>
          )}

          <footer className="admin-modal__footer">
            <button
              type="button"
              onClick={guardedClose}
              disabled={saving}
              className="admin-button"
              data-tone="secondary"
              data-admin-control
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving || loading}
              aria-busy={saving}
              className="admin-button"
              data-tone="primary"
              data-admin-control
            >
              {saving && <Loader2 className="admin-resource-state__spinner" size={17} aria-hidden="true" />}
              {saving ? "Publishing order…" : "Publish order"}
            </button>
          </footer>
        </>
      )}
    </AdminFormModal>
  );
}

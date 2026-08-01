"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ListOrdered, Loader2, Plus, Trash2, X } from "lucide-react";
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
  onSaved: () => void;
}

const messageForError = (error: unknown, fallback: string): string =>
  typeof error === "object" && error !== null && "response" in error
    ? (() => {
      const response = (error as { response?: { data?: { error?: unknown } } }).response;
      return typeof response?.data?.error === "string" ? response.data.error : fallback;
    })()
    : fallback;

export default function RouteStopsModal({ route, onClose, onSaved }: RouteStopsModalProps) {
  const [allStops, setAllStops] = useState<AdminStop[]>([]);
  const [orderedStops, setOrderedStops] = useState<Stop[]>([]);
  const [selectedStopId, setSelectedStopId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        if (!cancelled) setError(messageForError(loadError, "Unable to load route stops."));
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

  const save = async () => {
    if (!route) return;
    setSaving(true);
    setError(null);
    try {
      await api.put(`admin/route-stops/${route.id}`, {
        stopIds: orderedStops.map((stop) => stop.id),
      });
      onSaved();
      onClose();
    } catch (saveError) {
      setError(messageForError(saveError, "Unable to publish route stops."));
    } finally {
      setSaving(false);
    }
  };

  if (!route) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-700">
              <ListOrdered size={20} aria-hidden="true" />
              <h2 className="text-xl font-bold text-slate-900">Route stops</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Arrange the published stop order for {route.name} ({route.id}).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close route stops manager"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center gap-2 text-slate-500">
            <Loader2 className="animate-spin text-blue-600" size={20} aria-hidden="true" />
            Loading route stops…
          </div>
        ) : (
          <>
            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex sm:items-end sm:gap-3">
              <label className="block flex-1 text-sm font-medium text-slate-700">
                Add active stop
                <select
                  value={selectedStopId}
                  onChange={(event) => setSelectedStopId(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
                disabled={!selectedStopId}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:mt-0 sm:w-auto"
              >
                <Plus size={18} aria-hidden="true" />
                Add
              </button>
            </div>

            {error && (
              <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <ol className="space-y-2" aria-label="Published stop order">
              {orderedStops.map((stop, index) => (
                <li key={stop.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 font-medium text-slate-800">
                    {stop.nameTh}{stop.nameEn ? ` — ${stop.nameEn}` : ""}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveStop(index, -1)}
                      disabled={index === 0 || saving}
                      aria-label={`Move ${stop.nameTh} up`}
                      className="rounded-md p-2 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
                    >
                      <ArrowUp size={17} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveStop(index, 1)}
                      disabled={index === orderedStops.length - 1 || saving}
                      aria-label={`Move ${stop.nameTh} down`}
                      className="rounded-md p-2 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
                    >
                      <ArrowDown size={17} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderedStops((current) => current.filter((item) => item.id !== stop.id))}
                      disabled={saving}
                      aria-label={`Remove ${stop.nameTh}`}
                      className="rounded-md p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-red-300"
                    >
                      <Trash2 size={17} aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ol>

            {orderedStops.length === 0 && (
              <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
                No stops are published for this route yet.
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-lg bg-slate-100 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving || loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {saving && <Loader2 className="animate-spin" size={18} aria-hidden="true" />}
                Publish order
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";

export function useGeolocation(mapRef: React.RefObject<L.Map | null>) {
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos: GeolocationPosition) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLoc(coords);
        if (!mapRef.current) return;

        if (!userMarkerRef.current) {
          const userIcon = L.divIcon({
            className: "user-loc-marker",
            html: `<div class="user-pulse"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });
          userMarkerRef.current = L.marker(coords, { icon: userIcon }).addTo(mapRef.current);
        } else {
          userMarkerRef.current.setLatLng(coords);
        }
      },
      (err) => console.log("GPS Error:", err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [mapRef]);

  return { userLoc, userMarkerRef };
}
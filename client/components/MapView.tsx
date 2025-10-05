        import React, { useEffect, useRef } from "react";
import { useAlert } from "@/state/AlertContext";

declare global {
  interface Window {
    L?: any;
  }
}

function loadLeaflet(): Promise<void> {
  // load CSS
  if (!document.getElementById("leaflet-css")) {
    const link = document.createElement("link");
    link.id = "leaflet-css";
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }

  // load script
  return new Promise((resolve, reject) => {
    if ((window as any).L) return resolve();
    const existing = document.querySelector('script[data-leaflet]');
    if (existing) return resolve();
    const s = document.createElement("script");
    s.setAttribute("data-leaflet", "1");
    s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = (e) => reject(e);
    document.head.appendChild(s);
  });
}

export default function MapView({ className }: { className?: string }) {
  const { location: pos, isTracking, nearby } = useAlert();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const nearbyMarkersRef = useRef<any[]>([]);

  // compute destination point given start lat/lon, distance (km) and bearing (deg)
  function destinationPoint(lat: number, lon: number, distanceKm: number, bearingDeg: number) {
    const R = 6371; // Earth's radius in km
    const bearing = (bearingDeg * Math.PI) / 180;
    const lat1 = (lat * Math.PI) / 180;
    const lon1 = (lon * Math.PI) / 180;
    const dByR = distanceKm / R;
    const lat2 = Math.asin(Math.sin(lat1) * Math.cos(dByR) + Math.cos(lat1) * Math.sin(dByR) * Math.cos(bearing));
    const lon2 = lon1 + Math.atan2(Math.sin(bearing) * Math.sin(dByR) * Math.cos(lat1), Math.cos(dByR) - Math.sin(lat1) * Math.sin(lat2));
    return { lat: (lat2 * 180) / Math.PI, lng: (lon2 * 180) / Math.PI };
  }

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        await loadLeaflet();
        if (cancelled) return;
        if (!mapRef.current) return;

        const L = (window as any).L;
        if (!mapInstanceRef.current) {
          mapInstanceRef.current = L.map(mapRef.current, { zoomControl: true }).setView(pos ? [pos.lat, pos.lng] : [0, 0], 13);
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
          }).addTo(mapInstanceRef.current);
        }

        if (!markerRef.current) {
          markerRef.current = L.marker(pos ? [pos.lat, pos.lng] : [0, 0], { title: "You" }).addTo(mapInstanceRef.current);
          markerRef.current.bindPopup("You (your current location)");
        }

        if (pos) {
        markerRef.current.setLatLng([pos.lat, pos.lng]);
          mapInstanceRef.current.setView([pos.lat, pos.lng], 13);

          // create or update nearby markers based on alert.nearby
        try {
          const list = Array.isArray(nearby) ? nearby : [];

          // remove extra markers if nearby size decreased
          while (nearbyMarkersRef.current.length > list.length) {
            const m = nearbyMarkersRef.current.pop();
            if (m && m.remove) m.remove();
          }

          list.forEach((u: any, idx: number) => {
            const bearing = (idx * 360) / Math.max(list.length, 6);
            const dist = Math.max(0.01, u.distanceKm);
            const p = destinationPoint(pos.lat, pos.lng, dist, bearing);

            const existing = nearbyMarkersRef.current[idx];
            if (existing) {
              existing.setLatLng([p.lat, p.lng]);
              existing.setPopupContent(`${u.name} (${u.distanceKm} km) - ${u.status}`);
            } else {
              const m = L.marker([p.lat, p.lng], { title: u.name });
              m.addTo(mapInstanceRef.current);
              m.bindPopup(`${u.name} (${u.distanceKm} km) - ${u.status}`);
              nearbyMarkersRef.current[idx] = m;
            }
          });
        } catch (e) {
          // ignore marker errors
          console.warn('MapView: error updating nearby markers', e);
          }
        }
      } catch (e) {
        console.error("Failed to load Leaflet", e);
      }
    };

    init();

    return () => {
      cancelled = true;
      // do not remove global leaflet script/css; just clean map
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
          nearbyMarkersRef.current.forEach((m) => m && m.remove && m.remove());
          nearbyMarkersRef.current = [];
      } catch (e) {}
    };
  }, [pos, nearby]);

  return (
    <div className={className}>
      <div className="mb-2">
        <div className="text-sm text-muted-foreground">{isTracking ? "Tracking: Active" : "Tracking: Inactive"}</div>
      </div>
      <div ref={mapRef} className="w-full h-full min-h-[12rem] rounded-md leaflet-container" />
    </div>
  );
}

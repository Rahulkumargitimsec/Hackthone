import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";

export default function Map() {
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (e) => setError(e.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
    );

    return () => navigator.geolocation.clearWatch(id);
  }, []);

  return (
    <Layout>
      <div className="min-h-[80vh] py-12">
        <div className="container mx-auto px-6 lg:px-20">
          <h2 className="text-3xl font-extrabold text-primary">Live Map</h2>
          <p className="mt-2 text-muted-foreground">
            Your current location (demo). Allow location permission to see live
            updates.
          </p>

          <div className="mt-6 bg-[hsl(var(--card))] rounded-lg shadow p-6 border border-[hsl(var(--border))]">
            {error && <div className="text-sm text-rose-400">{error}</div>}
            {!pos && !error && (
              <div className="text-sm text-muted-foreground">
                Waiting for location…
              </div>
            )}

            {pos && (
              <div className="mt-4">
                <div className="text-sm text-muted-foreground">
                  Latitude: {pos.lat.toFixed(6)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Longitude: {pos.lng.toFixed(6)}
                </div>

                <div className="mt-4 h-72 bg-[hsl(var(--sidebar-accent))]/40 rounded-lg flex items-center justify-center">
                  <div className="text-sm text-muted-foreground">
                    Map preview (demo). Integrate Google Maps / Leaflet for full
                    map features.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

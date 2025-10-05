import React, { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

type NearbyUser = { id: string; name: string; distanceKm: number; status: "idle" | "notified" | "responding" };

type AlertState = {
  active: boolean;
  startedAt: number | null;
  location: { lat: number; lng: number } | null;
  isTracking: boolean;
  nearby: NearbyUser[];
  safetyScore: number;
  sendSOS: () => Promise<void>;
  resolveSOS: () => void;
  notifyUser: (id: string) => void;
  startLocationTracking: () => void;
  stopLocationTracking: () => void;
};

const defaultNearby: NearbyUser[] = [
  { id: "u1", name: "John Doe", distanceKm: 0.2, status: "idle" },
  { id: "u2", name: "Jane Smith", distanceKm: 0.4, status: "idle" },
  { id: "u3", name: "Mike Johnson", distanceKm: 0.6, status: "idle" },
];

const AlertContext = createContext<AlertState | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [active, setActive] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearby, setNearby] = useState<NearbyUser[]>(defaultNearby);
  const [safetyScore, setSafetyScore] = useState(85);
  const [isTracking, setIsTracking] = useState(false);
  const watcherRef = React.useRef<number | null>(null);

  useEffect(() => {
    // load any persisted state (demo)
    try {
      const raw = localStorage.getItem("alert:v1");
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj.active) {
          setActive(true);
          setStartedAt(obj.startedAt);
          setLocation(obj.location || null);
        }
        // restore tracking if previously enabled
        if (obj && obj.isTracking) setIsTracking(true);
      }
      // start tracking on every load if geolocation is available (prompt permission)
      try {
        if (navigator.geolocation) {
          setIsTracking(true);
          // trigger a one-time permission prompt without waiting for result
          navigator.geolocation.getCurrentPosition(
            () => {},
            () => {},
            { enableHighAccuracy: true, timeout: 5000 },
          );
        }
      } catch (e) {
        // ignore
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("alert:v1", JSON.stringify({ active, startedAt, location, isTracking }));
  }, [active, startedAt, location, isTracking]);

  // Start watching position when isTracking true
  useEffect(() => {
    if (!isTracking) {
      // clear existing watcher
      if (watcherRef.current !== null) {
        navigator.geolocation.clearWatch(watcherRef.current);
        watcherRef.current = null;
      }
      return;
    }

    if (!navigator.geolocation) {
      setLocation(null);
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (p) => setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (e) => {
        console.warn("Geolocation error:", e);
        setLocation(null);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
    );

    watcherRef.current = id;

    return () => {
      if (watcherRef.current !== null) {
        navigator.geolocation.clearWatch(watcherRef.current);
        watcherRef.current = null;
      }
    };
  }, [isTracking]);

  const sendSOS = async () => {
    // try to get location
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error("Geolocation unsupported"));
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000 });
      });
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setLocation({ lat, lng });
    } catch (e) {
      setLocation(null);
    }

    setActive(true);
    setStartedAt(Date.now());

  // optionally start tracking location when SOS is sent
  setIsTracking(true);

    // simulate notifying nearby users
    setNearby((n) => n.map((u, i) => ({ ...u, status: i === 1 ? "responding" : "notified" })));

    // lower safety score slightly when an alert is active
    setSafetyScore((s) => Math.max(40, s - 5));

    // store a sample report in local storage so Alerts page can show it
    try {
      const reports = JSON.parse(localStorage.getItem("reports:v1") || "[]");
      reports.unshift({ id: Date.now().toString(), title: "SOS sent", desc: "Emergency SOS activated.", time: new Date().toLocaleString() });
      localStorage.setItem("reports:v1", JSON.stringify(reports));
    } catch (e) {}

    // attempt to notify guardians via server email route (if configured)
    try {
      const raw = localStorage.getItem("guardians:v1");
      const guardians = raw ? JSON.parse(raw) : [];
      if (Array.isArray(guardians) && guardians.length > 0) {
        // POST guardians and location to server and await response
        try {
          const res = await fetch("/api/send-sos-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ guardians, location }),
          });

          if (!res.ok) {
            const txt = await res.text();
            console.warn("send-sos-email failed:", res.status, txt);
            toast({ title: "SOS notifications failed", description: `Server returned ${res.status}` });
          } else {
            const data = await res.json();
            // show transport results in a concise toast
            const parts: string[] = [];
            if (data.results) {
              for (const k of Object.keys(data.results)) {
                const r = data.results[k];
                parts.push(`${k}:${r && r.ok ? 'ok' : 'fail'}`);
              }
            }
            toast({ title: "SOS notifications", description: parts.join(' • ') || 'Attempted' });
          }
        } catch (err) {
          console.warn("send-sos-email error", err);
          toast({ title: "SOS notification error", description: String(err) });
        }
      } else {
        toast({ title: "No guardians configured", description: "Add guardians so we can notify them during SOS" });
      }
    } catch (e) {
      console.warn("Could not read guardians to notify", e);
    }
  };

  const resolveSOS = () => {
    setActive(false);
    setStartedAt(null);
    setNearby(defaultNearby.map((u) => ({ ...u, status: "idle" })));
    setSafetyScore(85);
  };

  const notifyUser = (id: string) => {
    setNearby((n) => n.map((u) => (u.id === id ? { ...u, status: u.status === "responding" ? "idle" : "responding" } : u)));
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      setLocation(null);
      setIsTracking(false);
      return;
    }
    setIsTracking(true);
  };

  const stopLocationTracking = () => {
    setIsTracking(false);
    setLocation(null);
  };

  const value: AlertState = { active, startedAt, location, isTracking, nearby, safetyScore, sendSOS, resolveSOS, notifyUser, startLocationTracking, stopLocationTracking };

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlert must be used inside AlertProvider");
  return ctx;
}

import React, { createContext, useContext, useEffect, useState } from "react";

type NearbyUser = { id: string; name: string; distanceKm: number; status: "idle" | "notified" | "responding" };

type AlertState = {
  active: boolean;
  startedAt: number | null;
  location: { lat: number; lng: number } | null;
  nearby: NearbyUser[];
  safetyScore: number;
  sendSOS: () => Promise<void>;
  resolveSOS: () => void;
  notifyUser: (id: string) => void;
};

const defaultNearby: NearbyUser[] = [
  { id: "u1", name: "John Doe", distanceKm: 0.2, status: "idle" },
  { id: "u2", name: "Jane Smith", distanceKm: 0.4, status: "idle" },
  { id: "u3", name: "Mike Johnson", distanceKm: 0.6, status: "idle" },
];

const AlertContext = createContext<AlertState | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearby, setNearby] = useState<NearbyUser[]>(defaultNearby);
  const [safetyScore, setSafetyScore] = useState(85);

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
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("alert:v1", JSON.stringify({ active, startedAt, location }));
  }, [active, startedAt, location]);

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

  const value: AlertState = { active, startedAt, location, nearby, safetyScore, sendSOS, resolveSOS, notifyUser };

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlert must be used inside AlertProvider");
  return ctx;
}

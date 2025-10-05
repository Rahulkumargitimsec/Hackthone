import React, { useState } from "react";
import Layout from "@/components/Layout";
import SOSButton from "@/components/SOSButton";
import { useToast } from "@/components/ui/use-toast";
import { useAlert } from "@/state/AlertContext";

export default function SOS() {
  const [shareLocation, setShareLocation] = useState(true);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();
  const alert = useAlert();

  const handleTestSOS = async () => {
    setTesting(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      await alert.sendSOS();
      toast({
        title: "Test SOS",
        description: "Test alert simulated and nearby users notified (demo).",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12">
        <div className="w-full max-w-4xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="bg-gradient-to-br from-destructive/10 to-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-extrabold text-destructive">
                Emergency / SOS
              </h2>
              <p className="mt-2 text-muted-foreground">
                Press the big SOS button to alert nearby helpers, notify
                guardians and optionally send SMS/call fallbacks to emergency
                contacts.
              </p>

              <div className="mt-8 flex items-center gap-4">
                <SOSButton />
                <button
                  onClick={handleTestSOS}
                  disabled={testing}
                  className="px-4 py-2 rounded-md bg-slate-800 text-white hover:bg-slate-900"
                >
                  {testing ? "Testing..." : "Test SOS"}
                </button>
              </div>

              <div className="mt-6">
                <label className="inline-flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={shareLocation}
                    onChange={(e) => setShareLocation(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-muted-foreground">
                    Share live location with responders
                  </span>
                </label>
              </div>

              <div className="mt-6 text-sm text-muted-foreground">
                <div>
                  Background services:{" "}
                  <span className="font-medium">Enabled</span>
                </div>
                <div>
                  Microphone listener:{" "}
                  <span className="font-medium">Enabled</span>
                </div>
                <div>
                  FCM Push:{" "}
                  <span className="font-medium">Configured (demo)</span>
                </div>
              </div>
            </div>

            <div className="bg-[hsl(var(--card))] rounded-2xl shadow-lg p-6 border border-[hsl(var(--border))]">
              <h3 className="font-semibold text-[hsl(var(--foreground))]">
                Recent Alerts
              </h3>
              <div className="mt-4 space-y-3">
                {JSON.parse(localStorage.getItem("reports:v1") || "[]")
                  .slice(0, 5)
                  .map((r: any) => (
                    <div className="p-3 border rounded-md" key={r.id}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{r.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {r.time}
                          </div>
                        </div>
                        <div>
                          <a className="text-destructive underline" href="#">
                            View
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}

                <div className="mt-4 text-xs text-muted-foreground">
                  This is a demo feed. In production this will show real alert
                  history and responder status.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 text-sm text-muted-foreground">
            Pro tip: On mobile, allow location, microphone and notifications for
            the best experience.
          </div>

          {alert.active && (
            <div className="mt-8 p-4 bg-rose-50 border border-rose-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-rose-700">
                    EMERGENCY ALERT ACTIVE
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Alert started at{" "}
                    {new Date(alert.startedAt!).toLocaleString()}
                  </div>
                </div>
                <div>
                  <button
                    onClick={alert.resolveSOS}
                    className="px-3 py-2 bg-rose-600 text-white rounded-md"
                  >
                    Resolve Alert
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-2 bg-[hsl(var(--card))] p-4 rounded-lg border border-[hsl(var(--border))]">
                  <h4 className="font-semibold text-primary">Your Location</h4>
                  <div className="text-sm text-muted-foreground mt-2">
                    {alert.location
                      ? `${alert.location.lat.toFixed(6)}, ${alert.location.lng.toFixed(6)}`
                      : "Location not available"}
                  </div>
                </div>

                <div className="bg-[hsl(var(--card))] p-4 rounded-lg border border-[hsl(var(--border))]">
                  <h4 className="font-semibold text-primary">
                    Guardians Notified
                  </h4>
                  <div className="text-sm text-muted-foreground mt-2">
                    {localStorage.getItem("guardians:v1")
                      ? JSON.parse(localStorage.getItem("guardians:v1") || "[]")
                          .length
                      : 0}{" "}
                    guardians
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold text-primary">Nearby Users</h4>
                <div className="mt-2 space-y-2">
                  {alert.nearby.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-2 border rounded-md bg-[hsl(var(--card))]"
                    >
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {u.distanceKm} km away
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`px-2 py-1 rounded text-xs ${u.status === "responding" ? "bg-emerald-100 text-emerald-800" : "bg-sky-100 text-sky-700"}`}
                        >
                          {u.status === "responding"
                            ? "Responding"
                            : "Notified"}
                        </div>
                        <button
                          onClick={() => alert.notifyUser(u.id)}
                          className="text-sm text-muted-foreground"
                        >
                          Toggle
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

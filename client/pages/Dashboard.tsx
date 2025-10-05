import React, { useMemo } from "react";
import Layout from "@/components/Layout";
import MapView from "@/components/MapView";
import SOSButton from "@/components/SOSButton";
import { useAlert } from "@/state/AlertContext";

function Timer({ startedAt }: { startedAt: number | null }) {
  const now = Date.now();
  const elapsed = startedAt ? Math.floor((now - startedAt) / 1000) : 0;
  const mm = Math.floor(elapsed / 60);
  const ss = elapsed % 60;
  return (
    <div className="text-2xl font-semibold text-rose-600">
      {mm}:{ss.toString().padStart(2, "0")}
    </div>
  );
}

export default function Dashboard() {
  const alert = useAlert();

  const nearbyCount = useMemo(() => alert.nearby.length, [alert.nearby]);

  return (
    <Layout>
      <div className="min-h-[80vh] py-12">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-extrabold text-primary">
                Welcome back, user
              </h2>
              <p className="mt-2 text-muted-foreground">
                Your safety dashboard is ready. Stay connected and stay safe.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <SOSButton />
              <a
                href="/sos"
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground"
              >
                Open SOS
              </a>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-[hsl(var(--card))] rounded-lg shadow border border-[hsl(var(--border))]">
              <div className="text-sm text-muted-foreground">Location Status</div>
              <div className="mt-2 font-semibold text-primary">
                {alert.isTracking ? "Active" : "Inactive"}
              </div>
              <div className="mt-3">
                <div className="text-xs text-muted-foreground">Location tracking starts automatically on first load.</div>
              </div>
            </div>
            <div className="p-4 bg-[hsl(var(--card))] rounded-lg shadow border border-[hsl(var(--border))]">
              <div className="text-sm text-muted-foreground">Nearby Users</div>
              <div className="mt-2 font-semibold text-primary">
                {nearbyCount}
              </div>
            </div>
            <div className="p-4 bg-[hsl(var(--card))] rounded-lg shadow border border-[hsl(var(--border))]">
              <div className="text-sm text-muted-foreground">Safety Score</div>
              <div className="mt-2 font-semibold text-primary">
                {alert.safetyScore}%
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-4 bg-[hsl(var(--card))] rounded-lg shadow border border-[hsl(var(--border))]">
              <h4 className="font-semibold mb-2">Live Location</h4>
              <MapView className="w-full h-64" />
            </div>

            <div className="p-4 bg-[hsl(var(--card))] rounded-lg shadow border border-[hsl(var(--border))]">
              <h4 className="font-semibold">Quick Actions</h4>
              <div className="mt-3">
                <button className="px-3 py-2 bg-primary text-primary-foreground rounded-md">Share Location</button>
              </div>
            </div>
          </div>

          {alert.active && (
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-[hsl(var(--accent))]/10 border border-[hsl(var(--accent))]/20 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-[hsl(var(--destructive))] font-semibold">
                      Emergency Alert Active
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Alert sent at{" "}
                      {new Date(alert.startedAt!).toLocaleTimeString()}
                    </div>
                  </div>

                  <div>
                    <Timer startedAt={alert.startedAt} />
                    <div className="mt-2">
                      <button
                        onClick={alert.resolveSOS}
                        className="px-3 py-2 bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] rounded-md"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-sm text-muted-foreground">
                    This will notify your guardians and nearby users. Stay safe
                    and wait for responders.
                  </p>
                </div>
              </div>

              <div className="bg-[hsl(var(--card))] rounded-lg shadow p-4 border border-[hsl(var(--border))]">
                <h4 className="font-semibold text-primary">Nearby Users</h4>
                <div className="mt-3 space-y-2">
                  {alert.nearby.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-2 border rounded-md"
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

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-primary">
              Recent Activity
            </h3>
            <div className="mt-4 space-y-3">
              {JSON.parse(localStorage.getItem("reports:v1") || "[]")
                .slice(0, 3)
                .map((r: any) => (
                  <div
                    key={r.id}
                    className="p-3 bg-[hsl(var(--card))] rounded-md border border-[hsl(var(--border))]"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{r.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.time}
                        </div>
                      </div>
                      <div className="text-sm text-emerald-600">Resolved</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

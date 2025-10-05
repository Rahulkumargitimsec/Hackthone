import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";

type Report = { id: string; title: string; desc: string; time: string };

export default function Alerts() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("reports:v1");
      if (raw) setReports(JSON.parse(raw));
    } catch (e) {}
  }, []);

  return (
    <Layout>
      <div className="min-h-[80vh] py-12">
        <div className="container mx-auto px-6 lg:px-20">
          <h2 className="text-3xl font-extrabold text-primary">
            Alerts & Reports
          </h2>
          <p className="mt-2 text-muted-foreground">
            All alerts and incident reports (local demo store).
          </p>

          <div className="mt-6 space-y-4">
            {reports.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No reports yet. Use "Report incident" to create one.
              </div>
            )}

            {reports.map((r) => (
              <div
                key={r.id}
                className="p-4 bg-[hsl(var(--card))] rounded-lg shadow border border-[hsl(var(--border))]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-primary">{r.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {r.desc}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">{r.time}</div>
                  </div>
                  <div>
                    <a href="#" className="text-primary underline">
                      View
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

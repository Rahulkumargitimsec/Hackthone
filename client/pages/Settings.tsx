import React, { useState } from "react";
import Layout from "@/components/Layout";

export default function Settings() {
  const [autoShare, setAutoShare] = useState(true);
  const [voiceListener, setVoiceListener] = useState(true);

  return (
    <Layout>
      <div className="min-h-[80vh] py-12">
        <div className="container mx-auto px-6 lg:px-20">
          <h2 className="text-3xl font-extrabold text-primary">Settings</h2>
          <p className="mt-2 text-muted-foreground">
            Control background services and notification preferences.
          </p>

          <div className="mt-6 w-full max-w-2xl bg-[hsl(var(--card))] p-6 rounded-lg shadow space-y-4 border border-[hsl(var(--border))]">
            <label className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Auto share location during SOS
              </span>
              <input
                type="checkbox"
                checked={autoShare}
                onChange={(e) => setAutoShare(e.target.checked)}
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Enable voice listener
              </span>
              <input
                type="checkbox"
                checked={voiceListener}
                onChange={(e) => setVoiceListener(e.target.checked)}
              />
            </label>

            <div className="pt-4 text-sm text-muted-foreground">
              Note: These settings are stored locally in this demo. Connect a
              backend for cross-device sync.
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

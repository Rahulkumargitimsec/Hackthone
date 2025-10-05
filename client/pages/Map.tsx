import React from "react";
import Layout from "@/components/Layout";
import MapView from "@/components/MapView";
import ShareLocationButton from "@/components/ShareLocationButton";

export default function Map() {
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
            <div className="flex items-center justify-end mb-4">
              <ShareLocationButton />
            </div>
            <MapView className="w-full h-72" />
          </div>
        </div>
      </div>
    </Layout>
  );
}

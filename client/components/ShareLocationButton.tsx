import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAlert } from "@/state/AlertContext";

export default function ShareLocationButton({ label = "Share location" }: { label?: string }) {
  const { location } = useAlert();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const buildWhatsappUrl = (lat: number, lng: number) => {
    const maps = `https://maps.google.com/?q=${lat},${lng}`;
    const text = encodeURIComponent(`I'm here: ${maps}`);
    // use whatsapp web deep link for web apps
    return `https://wa.me/?text=${text}`;
  };

  const handleShare = async () => {
    setLoading(true);
    try {
      if (!location) {
        toast({ title: "No location", description: "Location unavailable. Enable tracking or send an SOS to capture location." });
        setLoading(false);
        return;
      }

      const url = buildWhatsappUrl(location.lat, location.lng);

      // Try to open WhatsApp in a new window/tab
      const opened = window.open(url, "_blank");

      // Copy to clipboard as fallback
      try {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copied", description: "WhatsApp link copied to clipboard." });
      } catch (e) {
        // ignore clipboard failures
      }

      if (!opened) {
        toast({ title: "Share ready", description: "WhatsApp link copied. Paste it into your chat." });
      }
    } catch (e) {
      console.error("ShareLocation error", e);
      toast({ title: "Share failed", description: "Could not create share link." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition ${loading ? 'opacity-70' : ''}`}
      aria-label="Share location via WhatsApp"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.5a8.38 8.38 0 01-.9 3.8l1.1 3.9-4-1.1a8.5 8.5 0 11.8-7.2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11.37a2 2 0 11-2.99-2.74" />
      </svg>
      {label}
    </button>
  );
}

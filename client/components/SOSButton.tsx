import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAlert } from "@/state/AlertContext";

export default function SOSButton() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const alert = useAlert();

  const handleSOS = async () => {
    setLoading(true);
    try {
      await alert.sendSOS();
      toast({
        title: "SOS Sent",
        description: "Nearby users and your guardians were notified (demo).",
      });
    } catch (e) {
      toast({ title: "Error", description: "Could not activate SOS." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="w-40 h-40 rounded-full bg-destructive/20 blur-lg opacity-40 pulse-ring" />
      </div>

      <button
        onClick={handleSOS}
        className="inline-flex items-center gap-3 px-6 py-4 rounded-full bg-gradient-to-br from-destructive to-[hsl(var(--accent))] text-destructive-foreground font-bold shadow-2xl transform transition hover:scale-105 active:scale-95"
        aria-label="Send SOS"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 ${loading ? "animate-pulse" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {loading ? "Sending..." : "SOS"}
      </button>
    </div>
  );
}

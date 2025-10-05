import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAlert } from "@/state/AlertContext";
import emailjs from "@emailjs/browser";

export default function SOSButton() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const alert = useAlert();

  const handleSOS = async () => {
    setLoading(true);
    try {
      await alert.sendSOS();

      // Prefer using env vars (add these to your .env file):
      // VITE_EMAILJS_SERVICE_ID=service_0bcmfmf
      // VITE_EMAILJS_TEMPLATE_ID=template_yyyikhp
      // VITE_EMAILJS_PUBLIC_KEY=3Lh-U3mJKvA0PwoL8
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_0bcmfmf";
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_yyyikhp";
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "3Lh-U3mJKvA0PwoL8";

      // Fixed target recipient
      const TARGET_EMAIL = "sv5927918@gmail.com";

      if (serviceId && templateId && publicKey) {
        try {
          const loc = alert.location ? `${alert.location.lat},${alert.location.lng}` : "Unavailable";
          await emailjs.send(
            serviceId,
            templateId,
            {
              // Ensure your EmailJS template has matching fields (e.g. {{subject}}, {{message}}, {{location}}, {{timestamp}}, {{to_email}})
              to_email: TARGET_EMAIL,
              subject: "Emergency SOS Triggered",
              message: "An SOS alert was triggered from the app.",
              location: loc,
              timestamp: new Date().toLocaleString(),
            },
            { publicKey },
          );
        } catch (emailErr) {
          console.warn("EmailJS send failed", emailErr);
          toast({ title: "Email send failed", description: "Could not send SOS email." });
        }
      } else {
        console.warn("EmailJS env vars missing; skipping email send.");
      }

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

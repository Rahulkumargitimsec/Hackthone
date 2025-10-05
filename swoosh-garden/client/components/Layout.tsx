import React from "react";
import NavBar from "./NavBar";
import Footer from "./Footer";
import SOSButton from "./SOSButton";
import { motion, AnimatePresence } from "framer-motion";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <NavBar />
      <AnimatePresence mode="wait">
        <motion.main
          key={typeof window !== "undefined" ? window.location.pathname : "/"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.45, ease: [0.2, 0.9, 0.2, 1] }}
          className="flex-1"
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {/* Floating quick actions */}
      <div className="fixed right-6 bottom-6 z-50">
        <div className="flex flex-col items-end gap-3">
          <a
            href="/sos"
            className="inline-flex items-center gap-3 px-4 py-3 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg transform transition hover:scale-105"
          >
            Open SOS
          </a>
          <div className="relative">
            <div className="absolute -inset-1 rounded-full pulse-ring bg-[rgba(255,255,255,0.03)]"></div>
            <SOSButton />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

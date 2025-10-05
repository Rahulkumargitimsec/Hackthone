import React from "react";

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t">
      <div className="container mx-auto px-6 lg:px-20 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="font-bold text-slate-800">RAAH-SETU</div>
          <div className="text-sm text-slate-600 mt-1">Your safety, our path</div>
        </div>

        <div className="text-sm text-slate-600">© {new Date().getFullYear()} Raah-Rakshak. All rights reserved.</div>
      </div>
    </footer>
  );
}

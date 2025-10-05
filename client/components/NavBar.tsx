import React, { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import ReportModal from "./ReportModal";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const t = localStorage.getItem("theme");
      if (t === "dark" || t === "light") return t as "light" | "dark";
      // Default to light for production-ready professional theme
      return "light";
    } catch (e) {
      return "light";
    }
  });
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {}
  }, [theme]);

  const linkClass = (isActive: boolean) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive ? "bg-gradient-to-r from-primary/10 to-secondary/10 text-primary shadow-inner" : "text-muted-foreground hover:text-primary hover:scale-105"}`;

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const handleReportSubmit = (title: string, desc: string) => {
    const reports = JSON.parse(localStorage.getItem("reports:v1") || "[]");
    const r = {
      id: Date.now().toString(),
      title,
      desc,
      time: new Date().toLocaleString(),
    };
    reports.unshift(r);
    localStorage.setItem("reports:v1", JSON.stringify(reports));
    alert("Report submitted (demo)");
  };

  return (
    <>
      <header className="bg-[hsl(var(--sidebar-background))] border-b border-[hsl(var(--sidebar-border))] shadow-sm">
        <div className="container mx-auto px-6 lg:px-20 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              R
            </div>
            <div>
              <div className="font-bold text-primary">RAAH-SETU</div>
              <div className="text-xs text-muted-foreground">
                YOUR SAFETY, OUR PATH
              </div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => linkClass(isActive)}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/map"
              className={({ isActive }) => linkClass(isActive)}
            >
              Live Map
            </NavLink>
            <NavLink
              to="/alerts"
              className={({ isActive }) => linkClass(isActive)}
            >
              Alerts
            </NavLink>
            <NavLink
              to="/guardians"
              className={({ isActive }) => linkClass(isActive)}
            >
              Guardians
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) => linkClass(isActive)}
              title="Profile"
              aria-label="Profile"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) => linkClass(isActive)}
            >
              Settings
            </NavLink>

            <div className="flex items-center gap-3">
              {typeof window !== "undefined" && localStorage.getItem("user") ? (
                <>
                  <div className="text-sm text-muted-foreground">
                    {JSON.parse(localStorage.getItem("user") || "{}").name ||
                      JSON.parse(localStorage.getItem("user") || "{}").email}
                  </div>
                  <button
                    onClick={() => {
                      localStorage.removeItem("user");
                      localStorage.removeItem("token");
                      window.location.reload();
                    }}
                    className="px-3 py-2 rounded-md border"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <NavLink
                  to="/login"
                  className={({ isActive }) => linkClass(isActive)}
                >
                  Login
                </NavLink>
              )}
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="px-3 py-2 rounded-md bg-accent text-accent-foreground font-medium"
            >
              Report incident
            </button>

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="ml-4 p-2 rounded-md bg-[hsl(var(--card))] border border-[hsl(var(--border))]"
            >
              {theme === "dark" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-amber-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m8.66-10h-1M4.34 12h-1M18.36 5.64l-.7.7M6.34 17.66l-.7.7M18.36 18.36l-.7-.7M6.34 6.34l-.7-.7"
                  />
                  <circle cx="12" cy="12" r="3" className="text-amber-300" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-slate-700"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                  />
                </svg>
              )}
            </button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setModalOpen(true)}
              className="px-3 py-2 rounded-md bg-accent text-accent-foreground font-medium"
            >
              Report
            </button>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-md bg-[hsl(var(--card))] border border-[hsl(var(--border))]"
            >
              {theme === "dark" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-amber-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m8.66-10h-1M4.34 12h-1M18.36 5.64l-.7.7M6.34 17.66l-.7.7M18.36 18.36l-.7-.7M6.34 6.34l-.7-.7"
                  />
                  <circle cx="12" cy="12" r="3" className="text-amber-300" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-slate-700"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                  />
                </svg>
              )}
            </button>

            <button
              onClick={() => setOpen((s) => !s)}
              className="p-2 rounded-md bg-[hsl(var(--card))] border border-[hsl(var(--border))]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden bg-[hsl(var(--card))] border-t border-[hsl(var(--border))]">
            <div className="px-4 pt-2 pb-4 space-y-1">
              <NavLink
                to="/dashboard"
                className={({ isActive }) => linkClass(isActive)}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/map"
                className={({ isActive }) => linkClass(isActive)}
              >
                Live Map
              </NavLink>
              <NavLink
                to="/alerts"
                className={({ isActive }) => linkClass(isActive)}
              >
                Alerts
              </NavLink>
              <NavLink
                to="/guardians"
                className={({ isActive }) => linkClass(isActive)}
              >
                Guardians
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) => linkClass(isActive)}
                title="Profile"
                aria-label="Profile"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) => linkClass(isActive)}
              >
                Settings
              </NavLink>
              <NavLink
                to="/login"
                className={({ isActive }) => linkClass(isActive)}
              >
                Login
              </NavLink>

              <div className="pt-2 border-t border-[hsl(var(--border))]">
                <button
                  onClick={toggleTheme}
                  className="w-full text-left px-3 py-2 rounded-md"
                >
                  Toggle theme
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {modalOpen && (
        <ReportModal
          onClose={() => setModalOpen(false)}
          onSubmit={handleReportSubmit}
        />
      )}
    </>
  );
}

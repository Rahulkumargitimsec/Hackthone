import React from "react";
import Layout from "@/components/Layout";
import SOSButton from "@/components/SOSButton";

export default function Index() {
  return (
    <Layout>
      <main className="min-h-[80vh]">
        <section className="bg-gradient-to-b from-sky-50 to-white py-20">
          <div className="container mx-auto px-6 lg:px-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-primary">
                  RAAH-SETU
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  YOUR SAFETY, OUR PATH — Instant SOS alerts, live location
                  sharing, and trusted guardians to keep you safe 24/7.
                </p>

                <div className="mt-8 flex items-center gap-4">
                  <SOSButton />
                  <a
                    href="/login"
                    className="inline-flex items-center justify-center px-5 py-3 rounded-md bg-white border border-slate-200 text-slate-800 shadow-sm hover:shadow-md"
                  >
                    Sign in / Register
                  </a>
                </div>

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-[hsl(var(--card))] rounded-lg shadow animate-fade-up">
                    <h3 className="font-semibold text-primary">
                      Live Location
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Share live location with nearby users and guardians.
                    </p>
                  </div>
                  <div
                    className="p-4 bg-[hsl(var(--card))] rounded-lg shadow animate-fade-up"
                    style={{ animationDelay: "80ms" }}
                  >
                    <h3 className="font-semibold text-primary">
                      Instant Alerts
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Push notifications & SMS/call fallbacks for emergencies.
                    </p>
                  </div>
                  <div
                    className="p-4 bg-[hsl(var(--card))] rounded-lg shadow animate-fade-up"
                    style={{ animationDelay: "160ms" }}
                  >
                    <h3 className="font-semibold text-primary">
                      Trusted Contacts
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Quick contact list for immediate help and escalation.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="h-96 bg-gradient-to-br from-slate-100 to-white flex items-center justify-center">
                    <div className="text-center text-slate-500">
                      <svg
                        width="180"
                        height="120"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                          stroke="#0ea5e9"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        />
                        <circle cx="12" cy="9" r="2.2" fill="#0ea5e9" />
                      </svg>
                      <p className="mt-4">Live location map preview (demo)</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="font-semibold">Ready-to-use</h4>
                    <p className="text-sm text-slate-600 mt-2">
                      Big SOS button, live map, guardian panel and background
                      services to ensure continuous protection.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

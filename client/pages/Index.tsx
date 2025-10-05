import Layout from "@/components/Layout";
import SOSButton from "@/components/SOSButton";
import MapView from "@/components/MapView";



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
                <MapView className="w-full h-64" />
              </div>
            </div>

            {/* <section className="mt-16">
              <h2 className="text-2xl font-semibold text-slate-800">Team</h2>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="p-4 bg-white rounded shadow text-center">
                  <div className="font-bold">RAGHAV AGARWAL</div>
                  <div className="text-sm text-slate-600">Leader</div>
                </div>
                <div className="p-4 bg-white rounded shadow text-center">
                  <div className="font-bold">YASH MISHRA</div>
                </div>
                <div className="p-4 bg-white rounded shadow text-center">
                  <div className="font-bold">ARADHYA SINGH</div>
                </div>
                <div className="p-4 bg-white rounded shadow text-center">
                  <div className="font-bold">HARSHITA SHRIVASTAVA</div>
                </div>
                <div className="p-4 bg-white rounded shadow text-center">
                  <div className="font-bold">PARITOSH CHAUHAN</div>
                </div>
                <div className="p-4 bg-white rounded shadow text-center">
                  <div className="font-bold">RAHUL KASHYAP</div>
                </div>
              </div>
            </section> */}
          </div>
        </section>
      </main>
    </Layout>
  );
}

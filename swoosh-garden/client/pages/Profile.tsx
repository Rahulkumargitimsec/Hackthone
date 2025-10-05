import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";

export default function Profile() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("profile:v1");
      if (raw) {
        const p = JSON.parse(raw);
        setName(p.name || "");
        setPhone(p.phone || "");
      }
    } catch (e) {}
  }, []);

  const save = () => {
    localStorage.setItem("profile:v1", JSON.stringify({ name, phone }));
    alert("Profile saved (demo)");
  };

  return (
    <Layout>
      <div className="min-h-[80vh] py-12">
        <div className="container mx-auto px-6 lg:px-20">
          <h2 className="text-3xl font-extrabold text-primary">Profile</h2>
          <p className="mt-2 text-muted-foreground">
            Your account and emergency contact preferences.
          </p>

          <div className="mt-6 w-full max-w-lg bg-[hsl(var(--card))] p-6 rounded-lg shadow border border-[hsl(var(--border))]">
            <label className="block text-sm text-muted-foreground">
              Full name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-2 px-3 py-2 rounded-md bg-transparent border"
            />

            <label className="block text-sm text-muted-foreground mt-4">
              Phone
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full mt-2 px-3 py-2 rounded-md bg-transparent border"
            />

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={save}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setName("");
                  setPhone("");
                }}
                className="px-4 py-2 border rounded-md text-muted-foreground"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

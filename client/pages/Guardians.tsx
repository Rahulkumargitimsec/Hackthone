import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useToast } from "@/components/ui/use-toast";

type Guardian = { id: string; name: string; phone: string; email?: string; primary?: boolean };

export default function Guardians() {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("guardians:v1");
      if (raw) setGuardians(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("guardians:v1", JSON.stringify(guardians));
  }, [guardians]);

  const addGuardian = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return toast({ title: "Missing fields", description: "Please enter name and phone" });

    if (!email || !email.includes("@")) return toast({ title: "Missing/invalid email", description: "Please enter a valid email for the guardian" });

    const g: Guardian = { id: Date.now().toString(), name, phone, email };
    setGuardians((s) => [g, ...s]);
    setName("");
    setPhone("");
    setEmail("");
    toast({ title: "Guardian added", description: `${g.name} was added to your trusted contacts.` });
  };

  const removeGuardian = (id: string) => {
    setGuardians((s) => s.filter((g) => g.id !== id));
    toast({ title: "Removed", description: "Guardian removed" });
  };

  const togglePrimary = (id: string) => {
    setGuardians((s) => s.map((g) => ({ ...g, primary: g.id === id ? !g.primary : g.primary })));
  };

  return (
    <Layout>
      <div className="min-h-[80vh] py-12">
        <div className="container mx-auto px-6 lg:px-20">
          <h2 className="text-3xl font-extrabold text-slate-800">Guardians</h2>
          <p className="mt-2 text-slate-600">Manage your trusted contacts who receive alerts during emergencies.</p>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="font-semibold">Your Guardians</h3>
                <div className="mt-4 space-y-3">
                  {guardians.length === 0 && <div className="text-sm text-slate-500">No guardians yet. Add trusted contacts to be notified during emergencies.</div>}

                  {guardians.map((g) => (
                    <div key={g.id} className="p-3 border rounded-md flex items-center justify-between">
                      <div>
                        <div className="font-medium">{g.name} {g.primary && <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Primary</span>}</div>
                          <div className="text-xs text-slate-500">{g.phone} {g.email && <span className="ml-2">• {g.email}</span>}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <a className="text-sky-600 hover:underline" href={`tel:${g.phone}`}>Call</a>
                        <a className="text-sky-600 hover:underline" href={`sms:${g.phone}`}>SMS</a>
                        <button onClick={() => togglePrimary(g.id)} className="text-sm text-slate-700">{g.primary ? 'Unset' : 'Set as primary'}</button>
                        <button onClick={() => removeGuardian(g.id)} className="text-sm text-rose-600">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 text-sm text-slate-500">Tip: Mark one guardian as primary so emergency calls and SMS fallback use that contact first.</div>
            </div>

            <aside>
              <div className="bg-gradient-to-br from-primary/10 to-white rounded-2xl p-6 shadow">
                <h4 className="font-semibold">Add Guardian</h4>
                <form onSubmit={addGuardian} className="mt-4 space-y-3">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full px-3 py-2 border rounded-md" />
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (e.g. +91...)" className="w-full px-3 py-2 border rounded-md" />
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (guardian@example.com)" className="w-full px-3 py-2 border rounded-md" />
                  <div className="flex items-center justify-between">
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">Add</button>
                    <button type="button" onClick={() => { setName(""); setPhone(""); }} className="text-sm text-muted-foreground">Clear</button>
                  </div>
                </form>

                <div className="mt-6 text-xs text-muted-foreground">Guardians stored locally in this demo. Connect a backend to persist across devices.</div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  );
}

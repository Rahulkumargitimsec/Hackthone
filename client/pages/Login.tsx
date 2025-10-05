import React, { useState } from "react";
import Layout from "@/components/Layout";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, phone, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Register failed");
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        toast({
          title: "Registered",
          description: `Welcome ${data.user.name || data.user.email}`,
        });
        nav("/dashboard");
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        toast({
          title: "Signed in",
          description: `Welcome back ${data.user.name || data.user.email}`,
        });
        nav("/dashboard");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center py-12">
        <div className="w-full max-w-md bg-white rounded-xl shadow p-8">
          <h2 className="text-2xl font-bold text-slate-800">
            {mode === "login" ? "Sign in to SafePath" : "Create your account"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login"
              ? "Login with email & password"
              : "Register to use SafePath features"}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "register" && (
              <div>
                <label className="text-sm text-muted-foreground">
                  Full name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="mt-1 w-full px-4 py-2 border rounded-md"
                />
              </div>
            )}

            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Optional phone"
                className="mt-1 w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a strong password"
                className="mt-1 w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                disabled={loading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md shadow"
              >
                {mode === "login" ? "Sign in" : "Create account"}
              </button>
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="text-sm text-muted-foreground underline"
              >
                {mode === "login"
                  ? "Create account"
                  : "Have an account? Sign in"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-xs text-muted-foreground">
            By using this demo you accept that credentials are stored in a local
            JSON file on the server for demonstration purposes.
          </div>
        </div>
      </div>
    </Layout>
  );
}

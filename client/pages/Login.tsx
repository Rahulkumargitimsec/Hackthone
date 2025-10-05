import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

declare global {
  interface Window {
    google?: any;
  }
}

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const nav = useNavigate();

  // ✅ Replace this with your Google Client ID
  const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

  // Load Google Identity script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Handle Google sign-in success
  const handleGoogleResponse = async (response: any) => {
    try {
      const credential = response.credential;
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credential }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Google Sign-in failed");

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      toast({
        title: "Signed in with Google",
        description: `Welcome ${data.user.name || data.user.email}`,
      });
      nav("/dashboard");
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Google Sign-in Error",
        description: err.message || "Something went wrong",
      });
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
      });
      return;
    }
    if (password.length < 6) {
      toast({
        title: "Weak password",
        description: "Password must be at least 6 characters",
      });
      return;
    }

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

          {/* Google Sign-In Button */}
          <div className="mt-6 flex justify-center">
            {/* <div
              id="google-signin-btn"
              className="g_id_signin"
              data-type="standard"
              data-size="large"
              data-theme="outline"
              data-text="continue_with"
              data-shape="rectangular"
              data-logo_alignment="left"
            ></div> */}
          </div>


          <form onSubmit={submit} className="mt-4 space-y-4">
            {mode === "register" && (
              <div className="relative">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  id="name"
                  placeholder=" "
                  className="peer block w-full rounded-md border px-3 py-2 bg-transparent focus:outline-none"
                />
                <label
                  htmlFor="name"
                  className="absolute left-2 -top-2 text-xs bg-white px-1 text-muted-foreground
                             peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs transition-all"
                >
                  Full name
                </label>
              </div>
            )}

            <div className="relative">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                placeholder=" "
                className="peer block w-full rounded-md border px-3 py-2 bg-transparent focus:outline-none"
              />
              <label
                htmlFor="email"
                className="absolute left-2 -top-2 text-xs bg-white px-1 text-muted-foreground
                           peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs transition-all"
              >
                Email
              </label>
            </div>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                className="peer block w-full rounded-md border px-3 py-2 bg-transparent pr-10 focus:outline-none"
              />
              <label
                htmlFor="password"
                className="absolute left-2 -top-2 text-xs bg-white px-1 text-muted-foreground
                           peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs transition-all"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <button
                disabled={loading}
                className="w-full md:w-auto px-6 py-2 bg-primary text-primary-foreground rounded-md shadow"
              >
                {mode === "login" ? "Sign in" : "Create account"}
              </button>
              <button
                type="button"
                onClick={() =>
                  setMode(mode === "login" ? "register" : "login")
                }
                className="text-sm text-muted-foreground underline ml-4"
              >
                {mode === "login"
                  ? "Create account"
                  : "Have an account? Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

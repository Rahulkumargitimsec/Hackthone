import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

type ClerkComponents = {
  ClerkProvider: any;
  SignIn: any;
  SignUp: any;
  SignedIn: any;
  SignedOut: any;
} | null;

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

  const clerkKey = (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY;
  const [clerkComponents, setClerkComponents] = useState<ClerkComponents>(null);

  useEffect(() => {
    if (!clerkKey) return;
    let mounted = true;
    // Build the package name at runtime so Vite cannot statically analyze it.
    // @ts-ignore - dynamic import may not have types in this repo
    const clerkPkg = "@clerk" + "/clerk-react";
    import(/* @vite-ignore */ clerkPkg)
      .then((m: any) => {
        if (!mounted) return;
        setClerkComponents({ 
          ClerkProvider: m.ClerkProvider, 
          SignIn: m.SignIn, 
          SignUp: m.SignUp, 
          SignedIn: m.SignedIn, 
          SignedOut: m.SignedOut 
        });
      })
      .catch(() => {
        // Clerk not installed or failed to load; fallback to local auth
      });
    return () => { mounted = false; };
  }, [clerkKey]);

  // Attempt programmatic Google sign-in via Clerk if available
  const signInWithGoogle = async () => {
    if (!clerkKey) {
      toast({ 
        title: "Clerk not configured", 
        description: "Enable Clerk to use Google Sign-in." 
      });
      return;
    }
    try {
      const clerkPkg = "@clerk" + "/clerk-react";
      // @ts-ignore
      const mod: any = await import(/* @vite-ignore */ clerkPkg);
      // Clerk may expose a redirect helper - try to use it safely
      if (typeof mod.redirectToSignIn === "function") {
        await mod.redirectToSignIn({ strategy: "oauth_google" });
        return;
      }
      // Fallback: render SignIn UI (the SignIn component will be visible on the page)
      toast({ 
        title: "Open Google sign-in", 
        description: "Use the Sign-in panel to choose Google." 
      });
    } catch (e: any) {
      toast({ 
        title: "Google signin failed", 
        description: e?.message || "Could not start Google sign-in" 
      });
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // simple client-side validation
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast({ 
        title: "Invalid email", 
        description: "Please enter a valid email address" 
      });
      return;
    }
    if (password.length < 6) {
      toast({ 
        title: "Weak password", 
        description: "Password must be at least 6 characters" 
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
          description: `Welcome ${data.user.name || data.user.email}` 
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
          description: `Welcome back ${data.user.name || data.user.email}` 
        });
        nav("/dashboard");
      }
    } catch (err: any) {
      toast({ 
        title: "Error", 
        description: err.message || "An error occurred" 
      });
    } finally {
      setLoading(false);
    }
  };

  // Two-column Clerk-style layout: left = Clerk social sign-in, right = fallback form
  if (clerkKey && clerkComponents) {
    const { ClerkProvider, SignIn, SignUp, SignedIn, SignedOut } = clerkComponents;
    return (
      <ClerkProvider publishableKey={clerkKey}>
        <Layout>
          <div className="min-h-[70vh] flex items-center justify-center py-12">
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow p-8 flex flex-col">
                <h2 className="text-2xl font-bold text-slate-800">Sign in</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Quick sign in with social providers (Google, Apple) configured in Clerk
                </p>
                <div className="mt-6">
                  <SignedOut>
                    <div className="space-y-4">
                      {/* Primary Google button - large, modern style */}
                      <button 
                        type="button" 
                        onClick={signInWithGoogle} 
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-md shadow-sm hover:shadow-md"
                      >
                        <span className="sr-only">Sign in with Google</span>
                        <svg 
                          width="20" 
                          height="20" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="w-5 h-5"
                        >
                          <path d="M21.6 12.227c0-.78-.07-1.53-.2-2.254H12v4.26h5.58c-.24 1.3-.98 2.4-2.1 3.135v2.595h3.39c1.98-1.82 3.13-4.5 3.13-7.735z" fill="#4285F4" />
                          <path d="M12 22c2.7 0 4.98-.9 6.64-2.45l-3.39-2.59c-.95.64-2.17 1.02-3.25 1.02-2.5 0-4.62-1.68-5.38-3.945H2.99v2.48C4.64 19.9 8.04 22 12 22z" fill="#34A853" />
                          <path d="M6.62 13.03A6.99 6.99 0 0 1 6.4 12c0-.33.03-.66.06-.98V8.54H2.99A10.98 10.98 0 0 0 2 12c0 1.77.42 3.44 1.16 4.94l2.46-3.91z" fill="#FBBC05" />
                          <path d="M12 6.5c1.47 0 2.8.5 3.85 1.47l2.88-2.88C16.98 3.58 14.7 2.5 12 2.5 8.04 2.5 4.64 4.6 2.99 7.86l3.47 2.54C7.38 8.18 9.5 6.5 12 6.5z" fill="#EA4335" />
                        </svg>
                        <span className="text-sm font-medium">Continue with Google</span>
                      </button>

                      <div className="text-center text-xs text-muted-foreground">or</div>

                      {/* Clerk SignIn component (small) */}
                      <div className="rounded-md border p-3">
                        <SignIn suppressFirstRenderFallback />
                      </div>

                      <div className="mt-2">
                        <SignUp />
                      </div>
                    </div>
                  </SignedOut>
                  <SignedIn>
                    <div className="text-sm">You are signed in.</div>
                  </SignedIn>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-8">
                <h3 className="text-lg font-semibold">Or use email and password</h3>
                <p className="text-xs text-muted-foreground">
                  Local fallback - works without Clerk
                </p>
                <form onSubmit={submit} className="mt-4 space-y-4">
                  {mode === "register" && (
                    <div className="relative">
                      <input 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        id="name" 
                        placeholder=" " 
                        className="peer block w-full appearance-none rounded-md border px-3 py-2 bg-transparent focus:outline-none" 
                      />
                      <label 
                        htmlFor="name" 
                        className="absolute left-2 -top-2 text-xs bg-white px-1 text-muted-foreground peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs transition-all"
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
                      className="peer block w-full appearance-none rounded-md border px-3 py-2 bg-transparent focus:outline-none" 
                      aria-invalid={email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)} 
                    />
                    <label 
                      htmlFor="email" 
                      className="absolute left-2 -top-2 text-xs bg-white px-1 text-muted-foreground peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs transition-all"
                    >
                      Email
                    </label>
                  </div>

                  <div className="relative">
                    <input 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      id="phone" 
                      placeholder=" " 
                      className="peer block w-full appearance-none rounded-md border px-3 py-2 bg-transparent focus:outline-none" 
                    />
                    <label 
                      htmlFor="phone" 
                      className="absolute left-2 -top-2 text-xs bg-white px-1 text-muted-foreground peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs transition-all"
                    >
                      Phone
                    </label>
                  </div>

                  <div className="relative">
                    <input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder=" " 
                      className="peer block w-full appearance-none rounded-md border px-3 py-2 bg-transparent pr-10 focus:outline-none" 
                      aria-invalid={password && password.length < 6} 
                    />
                    <label 
                      htmlFor="password" 
                      className="absolute left-2 -top-2 text-xs bg-white px-1 text-muted-foreground peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs transition-all"
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
                      onClick={() => setMode(mode === "login" ? "register" : "login")} 
                      className="text-sm text-muted-foreground underline ml-4"
                    >
                      {mode === "login" ? "Create account" : "Have an account? Sign in"}
                    </button>
                  </div>
                </form>

                <div className="mt-6 text-xs text-muted-foreground">
                  By using this demo you accept that credentials are stored in a local JSON file on the server for demonstration purposes.
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </ClerkProvider>
    );
  }

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center py-12">
        <div className="w-full max-w-md bg-white rounded-xl shadow p-8">
          <h2 className="text-2xl font-bold text-slate-800">
            {mode === "login" ? "Sign in to SafePath" : "Create your account"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login" ? "Login with email & password" : "Register to use SafePath features"}
          </p>
          <div className="space-y-4 mt-6">
            <button 
              type="button" 
              onClick={signInWithGoogle} 
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-md shadow-sm hover:shadow-md"
            >
              <span className="sr-only">Sign in with Google</span>
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-5 h-5"
              >
                <path d="M21.6 12.227c0-.78-.07-1.53-.2-2.254H12v4.26h5.58c-.24 1.3-.98 2.4-2.1 3.135v2.595h3.39c1.98-1.82 3.13-4.5 3.13-7.735z" fill="#4285F4" />
                <path d="M12 22c2.7 0 4.98-.9 6.64-2.45l-3.39-2.59c-.95.64-2.17 1.02-3.25 1.02-2.5 0-4.62-1.68-5.38-3.945H2.99v2.48C4.64 19.9 8.04 22 12 22z" fill="#34A853" />
                <path d="M6.62 13.03A6.99 6.99 0 0 1 6.4 12c0-.33.03-.66.06-.98V8.54H2.99A10.98 10.98 0 0 0 2 12c0 1.77.42 3.44 1.16 4.94l2.46-3.91z" fill="#FBBC05" />
                <path d="M12 6.5c1.47 0 2.8.5 3.85 1.47l2.88-2.88C16.98 3.58 14.7 2.5 12 2.5 8.04 2.5 4.64 4.6 2.99 7.86l3.47 2.54C7.38 8.18 9.5 6.5 12 6.5z" fill="#EA4335" />
              </svg>
              <span className="text-sm font-medium">Continue with Google</span>
            </button>

            <div className="text-center text-xs text-muted-foreground">or</div>

            <form onSubmit={submit} className="mt-0 space-y-4">
              {mode === "register" && (
                <div className="relative">
                  <input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    id="name_fallback" 
                    placeholder=" " 
                    className="peer block w-full appearance-none rounded-md border px-3 py-2 bg-transparent focus:outline-none" 
                  />
                  <label 
                    htmlFor="name_fallback" 
                    className="absolute left-2 -top-2 text-xs bg-white px-1 text-muted-foreground peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs transition-all"
                  >
                    Full name
                  </label>
                </div>
              )}

              <div className="relative">
                <input 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  id="email_fallback" 
                  placeholder=" " 
                  className="peer block w-full appearance-none rounded-md border px-3 py-2 bg-transparent focus:outline-none" 
                />
                <label 
                  htmlFor="email_fallback" 
                  className="absolute left-2 -top-2 text-xs bg-white px-1 text-muted-foreground peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs transition-all"
                >
                  Email
                </label>
              </div>

              <div className="relative">
                <input 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  id="phone_fallback" 
                  placeholder=" " 
                  className="peer block w-full appearance-none rounded-md border px-3 py-2 bg-transparent focus:outline-none" 
                />
                <label 
                  htmlFor="phone_fallback" 
                  className="absolute left-2 -top-2 text-xs bg-white px-1 text-muted-foreground peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs transition-all"
                >
                  Phone
                </label>
              </div>

              <div className="relative">
                <input 
                  id="password_fallback" 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder=" " 
                  className="peer block w-full appearance-none rounded-md border px-3 py-2 bg-transparent pr-10 focus:outline-none" 
                />
                <label 
                  htmlFor="password_fallback" 
                  className="absolute left-2 -top-2 text-xs bg-white px-1 text-muted-foreground peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs transition-all"
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
                  onClick={() => setMode(mode === "login" ? "register" : "login")} 
                  className="text-sm text-muted-foreground underline ml-4"
                >
                  {mode === "login" ? "Create account" : "Have an account? Sign in"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
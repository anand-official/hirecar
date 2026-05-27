"use client";

import { useState } from "react";
import { ShieldCheck, User, Store, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<"customer" | "vendor" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function signIn() {
    if (!selectedRole) {
      setError("Please select how you want to use Carhire.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const supabase = createClient();
    
    // Determine the next route based on the selected role
    const nextRoute = selectedRole === "vendor" ? "/vendor/dashboard" : "/";
    
    // Store the role in sessionStorage just in case client-side components need it
    sessionStorage.setItem("auth_intended_role", selectedRole);

    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextRoute)}`,
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (signInError) {
      setError(signInError.message);
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      {/* Premium Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-[1000px] h-[1000px] rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute -bottom-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-slate-900/5 blur-[100px]" />
      </div>

      <section className="relative w-full max-w-3xl glass rounded-3xl p-8 sm:p-12 animate-slide-up border-white/40 shadow-2xl z-10">
        <div className="text-center mb-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg mb-6">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Welcome to Carhire
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            How would you like to use our platform today?
          </p>
        </div>

        {/* Role Selection Grid */}
        <div className="grid gap-6 sm:grid-cols-2 mb-10">
          {/* Customer Option */}
          <button
            type="button"
            onClick={() => setSelectedRole("customer")}
            className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 p-8 text-center transition-all duration-300 ${
              selectedRole === "customer"
                ? "border-slate-950 bg-slate-950/5 shadow-md scale-[1.02]"
                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg card-lift"
            }`}
          >
            <div className={`flex h-16 w-16 items-center justify-center rounded-full mb-4 transition-colors ${
              selectedRole === "customer" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
            }`}>
              <User className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">I am a Customer</h2>
            <p className="text-sm text-slate-500">
              I want to discover, compare, and rent vehicles.
            </p>
            {selectedRole === "customer" && (
              <div className="absolute top-4 right-4 text-slate-950">
                <ShieldCheck className="h-6 w-6" />
              </div>
            )}
          </button>

          {/* Vendor Option */}
          <button
            type="button"
            onClick={() => setSelectedRole("vendor")}
            className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 p-8 text-center transition-all duration-300 ${
              selectedRole === "vendor"
                ? "border-amber-500 bg-amber-50 shadow-md scale-[1.02]"
                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg card-lift"
            }`}
          >
            <div className={`flex h-16 w-16 items-center justify-center rounded-full mb-4 transition-colors ${
              selectedRole === "vendor" ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
            }`}>
              <Store className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">I am a Vendor</h2>
            <p className="text-sm text-slate-500">
              I want to list my fleet and receive leads.
            </p>
            {selectedRole === "vendor" && (
              <div className="absolute top-4 right-4 text-amber-500">
                <ShieldCheck className="h-6 w-6" />
              </div>
            )}
          </button>
        </div>

        {error ? <p className="mb-6 text-center text-sm font-medium text-red-600 animate-fade-in">{error}</p> : null}

        <div className="flex justify-center">
          <button
            onClick={signIn}
            disabled={!selectedRole || isSubmitting}
            className={`group flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold text-white transition-all duration-300 ${
              selectedRole
                ? "bg-slate-950 hover:bg-slate-800 shadow-xl hover:shadow-slate-900/20 hover:-translate-y-1"
                : "bg-slate-300 cursor-not-allowed"
            } w-full sm:w-auto min-w-[280px]`}
          >
            {isSubmitting ? "Connecting..." : "Continue with Google"}
            {!isSubmitting && <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />}
          </button>
        </div>
        
        <p className="mt-8 text-center text-xs text-slate-500">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </section>
    </main>
  );
}

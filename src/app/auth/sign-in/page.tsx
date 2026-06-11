"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  User,
  Store,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Users,
  MessageCircle,
  BadgeDollarSign,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  defaultDashboardForRole,
  isValidRedirectForRole,
} from "@/lib/routing";

function SignInContent() {
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<"customer" | "vendor" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom");
  const plan = searchParams.get("plan");
  const mfaRequired = searchParams.get("reason") === "mfa-required";

  function resolveNextRoute(role: "customer" | "vendor") {
    const fallback = defaultDashboardForRole(role, plan);
    if (redirectedFrom && isValidRedirectForRole(redirectedFrom, role)) {
      return redirectedFrom;
    }
    return fallback;
  }

  async function signIn() {
    if (!selectedRole) {
      setError("Please select how you want to use Hire Car.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const supabase = createClient();

    const nextRoute = resolveNextRoute(selectedRole);
    sessionStorage.setItem("auth_intended_role", selectedRole);

    const callbackParams = new URLSearchParams({
      next: nextRoute,
      role: selectedRole,
    });
    if (plan) callbackParams.set("plan", plan);

    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?${callbackParams.toString()}`,
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
    <main className="flex min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20">
      {/* Value Proposition Panel — Desktop only (≥1024px) */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 bg-gradient-to-br from-primary/5 via-background to-accent/10">
        <div className="max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground" style={{ letterSpacing: "-0.03em" }}>
              Australia&apos;s trusted car hire marketplace
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Connect with verified local operators and find the perfect vehicle for your journey.
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Verified operators</h3>
                <p className="text-sm text-muted-foreground">
                  Every vendor is verified for quality and reliability before joining our platform.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Direct communication</h3>
                <p className="text-sm text-muted-foreground">
                  Message vendors directly via WhatsApp, phone, or our inquiry system.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BadgeDollarSign className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">No hidden fees</h3>
                <p className="text-sm text-muted-foreground">
                  Transparent pricing from local operators — what you see is what you pay.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Card Panel */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-4 py-12 sm:px-6 lg:px-12">
        <Card variant="elevated" className="w-full max-w-[768px] py-8 sm:py-10">
          <CardHeader className="text-center space-y-4">
            {/* RentLeads / HireCar Logo */}
            <div className="flex justify-center">
              <div className="relative w-[180px] h-[48px] sm:w-[220px] sm:h-[56px]">
                <Image
                  src="/LOGO.png"
                  alt="HireCar Marketplace"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground" style={{ letterSpacing: "-0.03em" }}>
                Welcome to Hire Car
              </CardTitle>
              <p className="mt-2 text-muted-foreground">
                How would you like to use our platform today?
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {mfaRequired && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
                <p className="font-medium">Admin access requires two-factor authentication.</p>
                <p className="mt-1">
                  Sign in, enroll MFA in your account, then visit{" "}
                  <a href="/auth/mfa" className="font-semibold underline">/auth/mfa</a>.
                </p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
                <p className="font-medium">{error}</p>
                <p className="mt-1 text-destructive/80">
                  {error.includes("credentials") || error.includes("password")
                    ? "Please check your credentials and try again."
                    : error.includes("network") || error.includes("fetch")
                    ? "Check your internet connection and try again."
                    : "Please try again or contact support if the issue persists."}
                </p>
              </div>
            )}

            {/* Role Selection Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Customer Option */}
              <button
                type="button"
                onClick={() => { if (!isSubmitting) setSelectedRole("customer"); }}
                disabled={isSubmitting}
                className={`group relative flex flex-col items-center justify-center rounded-xl border-2 p-6 text-center transition-all duration-200 ${
                  selectedRole === "customer"
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border bg-card hover:border-muted-foreground/30 hover:shadow-md"
                } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full mb-3 transition-colors ${
                    selectedRole === "customer"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                  }`}
                >
                  <User className="h-7 w-7" />
                </div>
                <h2 className="text-lg font-bold text-foreground mb-1">I am a Customer</h2>
                <p className="text-sm text-muted-foreground">
                  Discover, compare, and rent vehicles.
                </p>
                {selectedRole === "customer" && (
                  <div className="absolute top-3 right-3 text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                )}
              </button>

              {/* Vendor Option */}
              <button
                type="button"
                onClick={() => { if (!isSubmitting) setSelectedRole("vendor"); }}
                disabled={isSubmitting}
                className={`group relative flex flex-col items-center justify-center rounded-xl border-2 p-6 text-center transition-all duration-200 ${
                  selectedRole === "vendor"
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border bg-card hover:border-muted-foreground/30 hover:shadow-md"
                } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full mb-3 transition-colors ${
                    selectedRole === "vendor"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                  }`}
                >
                  <Store className="h-7 w-7" />
                </div>
                <h2 className="text-lg font-bold text-foreground mb-1">I am a Vendor</h2>
                <p className="text-sm text-muted-foreground">
                  List my fleet and receive leads.
                </p>
                {selectedRole === "vendor" && (
                  <div className="absolute top-3 right-3 text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                )}
              </button>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col items-center gap-4">
              <Button
                size="cta"
                onClick={signIn}
                disabled={!selectedRole || isSubmitting}
                className="w-full sm:w-auto sm:min-w-[280px]"
                aria-label="Continue with Google sign-in"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Continue with Google
                    <ArrowRight className="h-5 w-5 transition-transform group-hover/button:translate-x-0.5" />
                  </>
                )}
              </Button>
            </div>

            {/* Dev sign-in buttons (development only) */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-2 flex gap-6 justify-center border-t border-border pt-4">
                <button
                  onClick={async () => {
                    setSelectedRole("customer");
                    setIsSubmitting(true);
                    setError(null);
                    const supabase = createClient();
                    sessionStorage.setItem("auth_intended_role", "customer");
                    const { error } = await supabase.auth.signInWithPassword({
                      email: "customer@example.com",
                      password: "password123",
                    });
                    if (error) {
                      setError(error.message);
                      setIsSubmitting(false);
                    } else {
                      window.location.href = resolveNextRoute("customer");
                    }
                  }}
                  disabled={isSubmitting}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground underline transition-colors disabled:opacity-50"
                >
                  Dev: Customer
                </button>
                <button
                  onClick={async () => {
                    setSelectedRole("vendor");
                    setIsSubmitting(true);
                    setError(null);
                    const supabase = createClient();
                    sessionStorage.setItem("auth_intended_role", "vendor");
                    const { error } = await supabase.auth.signInWithPassword({
                      email: "vendor@example.com",
                      password: "password123",
                    });
                    if (error) {
                      setError(error.message);
                      setIsSubmitting(false);
                    } else {
                      window.location.href = resolveNextRoute("vendor");
                    }
                  }}
                  disabled={isSubmitting}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground underline transition-colors disabled:opacity-50"
                >
                  Dev: Vendor
                </button>
                <button
                  onClick={async () => {
                    setIsSubmitting(true);
                    setError(null);
                    const supabase = createClient();
                    const { error } = await supabase.auth.signInWithPassword({
                      email: "admin@example.com",
                      password: "password123",
                    });
                    if (error) {
                      setError(error.message);
                      setIsSubmitting(false);
                    } else {
                      window.location.href = redirectedFrom || "/admin";
                    }
                  }}
                  disabled={isSubmitting}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground underline transition-colors disabled:opacity-50"
                >
                  Dev: Admin
                </button>
              </div>
            )}

            <p className="text-center text-xs text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20" />
      }
    >
      <SignInContent />
    </Suspense>
  );
}

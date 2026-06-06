"use client";

import { useActionState } from "react";
import { ShieldAlert, ArrowRight, Lock, User } from "lucide-react";
import { loginAdmin } from "@/lib/actions/admin-auth";
import { motion } from "framer-motion";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAdmin, null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 font-sans selection:bg-amber-500/30">
      {/* Dark Mode Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-amber-600/10 blur-[100px] mix-blend-screen" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md z-10"
      >
        <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="flex flex-col items-center text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-lg shadow-amber-500/25 mb-6"
            >
              <ShieldAlert className="h-8 w-8" />
            </motion.div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Admin Control Room
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Restricted access. Please authenticate to continue.
            </p>
          </div>

          <form action={formAction} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Admin ID
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    name="username"
                    type="text"
                    required
                    className="block w-full rounded-xl border border-white/10 bg-slate-950/50 py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
                    placeholder="Enter ID"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    className="block w-full rounded-xl border border-white/10 bg-slate-950/50 py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {state?.error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20 text-center"
              >
                {state.error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-bold text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:bg-slate-100 disabled:opacity-50 hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
            >
              {isPending ? "Authenticating..." : "Access Control Room"}
              {!isPending && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}

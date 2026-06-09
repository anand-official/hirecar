import { requireAdmin } from "@/lib/security/auth";
import { Settings, Shield, Key } from "lucide-react";

export const metadata = {
  title: "Platform Settings",
};

export default async function AdminSettingsPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-800 bg-slate-950 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-amber-500" />
          Platform Settings
        </h1>
        <p className="mt-2 text-slate-400">
          Manage global platform configurations, API keys, and security settings.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {/* General Settings */}
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-6 shadow-sm">
          <h2 className="text-lg font-medium text-white flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-emerald-500" />
            Security & Access
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-300">Require MFA for Admin Logins</p>
                <p className="text-sm text-slate-500">Enforce multi-factor authentication</p>
              </div>
              <div className="h-6 w-11 rounded-full bg-emerald-500/20 p-1">
                <div className="h-4 w-4 rounded-full bg-emerald-500 translate-x-5"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-300">Automatic Vendor Approval</p>
                <p className="text-sm text-slate-500">Bypass manual review for trusted vendors</p>
              </div>
              <div className="h-6 w-11 rounded-full bg-slate-800 p-1">
                <div className="h-4 w-4 rounded-full bg-slate-600"></div>
              </div>
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-6 shadow-sm">
          <h2 className="text-lg font-medium text-white flex items-center gap-2 mb-4">
            <Key className="h-5 w-5 text-blue-500" />
            Integration Keys
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-400">Stripe Public Key</label>
              <input 
                type="text" 
                value="pk_live_********************" 
                disabled 
                className="mt-1 block w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-slate-300 sm:text-sm" 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400">Google Maps API Key</label>
              <input 
                type="text" 
                value="AIzaSy********************" 
                disabled 
                className="mt-1 block w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-slate-300 sm:text-sm" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

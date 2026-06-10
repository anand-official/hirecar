import { requireAdmin } from "@/lib/security/auth";
import { Settings, Shield, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Platform Settings",
};

export default async function AdminSettingsPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Platform Settings
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage global platform configurations, API keys, and security settings.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {/* General Settings */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Security & Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Require MFA for Admin Logins</p>
                <p className="text-sm text-muted-foreground">Enforce multi-factor authentication</p>
              </div>
              <div className="h-6 w-11 rounded-full bg-emerald-500/20 p-1">
                <div className="h-4 w-4 rounded-full bg-emerald-500 translate-x-5"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Automatic Vendor Approval</p>
                <p className="text-sm text-muted-foreground">Bypass manual review for trusted vendors</p>
              </div>
              <div className="h-6 w-11 rounded-full bg-muted p-1">
                <div className="h-4 w-4 rounded-full bg-muted-foreground/40"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Integration Keys
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Stripe Public Key</label>
              <input 
                type="text" 
                value="pk_live_********************" 
                disabled 
                className="mt-1 block w-full rounded-lg border border-border bg-muted px-3 py-2 text-foreground sm:text-sm" 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Google Maps API Key</label>
              <input 
                type="text" 
                value="AIzaSy********************" 
                disabled 
                className="mt-1 block w-full rounded-lg border border-border bg-muted px-3 py-2 text-foreground sm:text-sm" 
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

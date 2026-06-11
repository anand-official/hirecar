// import removed
import { createBranch, getCurrentVendorContext } from "./actions";
import { GitBranch, MapPin, Phone, Plus, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { redirect } from "next/navigation";

export default async function VendorBranchesPage() {
  const context = await getCurrentVendorContext();
  
  if (context.organizations.length === 0) {
    redirect("/vendor/upgrade");
  }

  const firstOrganization = context.organizations[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Branches</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your pickup locations. Vehicles belong to branches so public visibility and lead routing remain precise.
        </p>
      </div>

      {context.setupError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 font-medium">{context.setupError}</p>
        </div>
      )}

      {context.organizations.map((organization) => {
        const isApproved = organization.status === "approved";
        return (
          <div key={organization.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Org Header */}
            <div className="border-b border-slate-100 px-6 py-5 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-slate-200 text-xl font-bold text-slate-900 shadow-sm">
                  {organization.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{organization.name}</h2>
                  <p className="text-sm text-slate-500">ABN {organization.abn}</p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                isApproved ? "bg-emerald-100 text-emerald-700" :
                organization.status === "pending" ? "bg-amber-100 text-amber-700" :
                "bg-red-100 text-red-700"
              }`}>
                {isApproved ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                {organization.status}
              </span>
            </div>

            {/* Branches List */}
            <div className="p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-slate-400" />
                Active Branches ({organization.branches.length})
              </h3>
              
              {organization.branches.length === 0 ? (
                <div className="text-center py-8 rounded-xl border border-dashed border-slate-300 bg-slate-50">
                  <p className="text-sm text-slate-500">No branches added yet. Add one below.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {organization.branches.map((branch) => (
                    <div key={branch.id} className="rounded-xl border border-slate-200 bg-white p-5 hover:shadow-md transition-shadow group">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                          <h4 className="font-bold text-slate-900">{branch.name}</h4>
                        </div>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                          branch.status === "approved" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                          "bg-amber-50 text-amber-600 border border-amber-100"
                        }`}>
                          {branch.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 pl-6.5">
                        <p className="text-sm text-slate-600">
                          {branch.city}, {branch.state}
                        </p>
                        <p className="text-sm text-slate-500 truncate" title={branch.address}>
                          {branch.address}
                        </p>
                        {(branch.phone || branch.whatsapp) && (
                          <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-slate-100">
                            {branch.phone && (
                              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Phone className="h-3 w-3" /> {branch.phone}
                              </span>
                            )}
                            {branch.whatsapp && (
                              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                <span className="text-green-500 font-bold">WA</span> {branch.whatsapp}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {firstOrganization && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-5 bg-slate-50/50">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Plus className="h-4.5 w-4.5 text-amber-500" />
              Add New Branch
            </h2>
          </div>
          
          <form action={createBranch} className="p-6">
            <input type="hidden" name="organizationId" value={firstOrganization.id} />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <Field label="Branch name" name="name" placeholder="e.g. Sydney Airport" className="lg:col-span-1" helper="A recognisable pickup location name" />
              <Field label="City" name="city" placeholder="e.g. Sydney" />
              <Field label="State" name="state" placeholder="e.g. NSW" helper="Australian state or territory abbreviation" />
              <Field label="Phone" name="phone" required={false} placeholder="e.g. 02 1234 5678" helper="Visible to customers for direct contact" />
              <Field label="WhatsApp" name="whatsapp" required={false} placeholder="e.g. +61412345678" helper="Include country code for WhatsApp click-to-chat" />
              <Field label="Address" name="address" className="md:col-span-2 lg:col-span-3" placeholder="Full street address" helper="Used for map display and directions" />
            </div>
            <div className="mt-6 pt-6 border-t border-border">
              <button className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm w-full sm:w-auto">
                Save Branch for Review
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  className = "",
  required = true,
  placeholder = "",
  helper,
}: {
  label: string;
  name: string;
  className?: string;
  required?: boolean;
  placeholder?: string;
  helper?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <input
        id={name}
        name={name}
        required={required}
        placeholder={placeholder}
        aria-describedby={helper ? `${name}-helper` : undefined}
        className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-normal text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all aria-invalid:border-destructive aria-invalid:ring-destructive/20"
      />
      {helper && (
        <p id={`${name}-helper`} className="text-xs text-muted-foreground">
          {helper}
        </p>
      )}
    </div>
  );
}

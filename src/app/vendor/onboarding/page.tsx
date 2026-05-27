import React from "react";
import { submitVendorOnboarding } from "./actions";

export default function VendorOnboardingPage() {
  return (
    <div className="mx-auto max-w-3xl py-10 animate-slide-up">
      <section className="glass rounded-3xl border border-slate-200/50 p-8 sm:p-12 shadow-xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Business Onboarding</h1>
          <p className="mt-3 text-lg text-slate-600">
            Submit business details for verification before your public listings can go live.
          </p>
        </div>
        
        <form action={submitVendorOnboarding} className="grid gap-6 md:grid-cols-2">
          <Field label="Business name" name="businessName" autoComplete="organization" />
          <Field label="ABN" name="abn" inputMode="numeric" pattern="[0-9]{11}" />
          <Field label="Contact person" name="contactName" autoComplete="name" />
          <Field label="Phone" name="phone" autoComplete="tel" />
          <Field label="City" name="city" autoComplete="address-level2" />
          <Field label="State" name="state" autoComplete="address-level1" />
          <Field label="Business address" name="address" autoComplete="street-address" className="md:col-span-2" />
          <Field label="Website" name="website" type="url" className="md:col-span-2" required={false} />
          
          <label className="flex items-start gap-3 mt-4 text-sm text-slate-600 md:col-span-2">
            <input 
              type="checkbox" 
              name="acceptedAgreement" 
              className="mt-1 h-5 w-5 rounded border-slate-300 text-slate-950 focus:ring-slate-950" 
              required 
            />
            <span>
              I accept the <a href="#" className="text-slate-900 underline hover:text-slate-700">vendor agreement</a> and confirm all business details provided are accurate and legally binding.
            </span>
          </label>
          
          <div className="mt-8 md:col-span-2 flex justify-center">
            <button className="w-full sm:w-auto min-w-[240px] rounded-xl bg-slate-950 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-slate-800 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              Submit for review
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  className = "",
  required = true,
  ...props
}: {
  label: string;
  name: string;
  className?: string;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`grid gap-2 text-sm font-medium text-slate-700 ${className}`}>
      {label}
      <input
        name={name}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 font-normal focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-950/20 transition-all"
        {...props}
      />
    </label>
  );
}

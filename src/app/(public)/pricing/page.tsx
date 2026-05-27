import Link from "next/link";
import { Check } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

const plans = [
  ["Starter", "5 vehicles", "Small local vendors"],
  ["Growth", "25 vehicles", "Growing rental shops"],
  ["Pro", "100 vehicles", "Established fleets"],
  ["Business", "300 vehicles", "Multi-branch operators"],
  ["Enterprise", "Custom", "National operators"],
];

export default function PricingPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">Vendor subscription plans</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Starter, Growth, and Pro use Stripe subscriptions. Business and
          Enterprise are contact-sales so larger fleets can align branch,
          reporting, and support requirements before launch.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-5">
          {plans.map(([name, limit, target]) => (
            <article key={name} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold">{name}</h2>
              <p className="mt-3 text-3xl font-bold">{limit}</p>
              <p className="mt-2 text-sm text-slate-600">{target}</p>
              <ul className="mt-5 space-y-2 text-sm text-slate-700">
                <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-600" /> Approved listings</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-600" /> Lead alerts</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-600" /> Vendor dashboard</li>
              </ul>
            </article>
          ))}
        </div>
        <Link
          href="/auth/sign-in"
          className="mt-8 inline-flex rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
        >
          Start vendor onboarding
        </Link>
      </main>
    </div>
  );
}

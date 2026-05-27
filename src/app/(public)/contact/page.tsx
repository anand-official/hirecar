import { SiteHeader } from "@/components/site-header";

export default function ContactPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">Contact Carhire</h1>
        <p className="mt-3 text-slate-600">
          For vendor onboarding, enterprise fleet discussions, or marketplace
          support, send the team a message. Customer rental terms are handled by
          the vendor listed on each vehicle.
        </p>
        <form className="mt-8 grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Name" />
          <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Email" type="email" />
          <select className="rounded-md border border-slate-300 px-3 py-2">
            <option>Vendor onboarding</option>
            <option>Enterprise plan</option>
            <option>Support</option>
            <option>Legal or privacy</option>
          </select>
          <textarea className="min-h-36 rounded-md border border-slate-300 px-3 py-2" placeholder="Message" />
          <button className="rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
            Send message
          </button>
        </form>
      </main>
    </div>
  );
}

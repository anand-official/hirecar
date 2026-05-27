export default function VendorBillingPage() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Billing</h1>
      <p className="mt-2 text-slate-600">
        Stripe Checkout and Billing Portal control subscriptions. The local
        database stores subscription state and plan limits, never card data.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        {["starter", "growth", "pro"].map((plan) => (
          <form key={plan} action="/api/billing/checkout" method="post">
            <input type="hidden" name="plan" value={plan} />
            <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold capitalize">
              Start {plan}
            </button>
          </form>
        ))}
      </div>
    </section>
  );
}

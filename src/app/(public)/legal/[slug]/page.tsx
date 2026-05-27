import { SiteHeader } from "@/components/site-header";

const titles: Record<string, string> = {
  terms: "Terms of Service",
  privacy: "Privacy Policy",
  "vendor-agreement": "Vendor Agreement",
  "billing-refunds": "Billing and Refund Policy",
  "listing-accuracy": "Listing Accuracy Policy",
  "acceptable-use": "Acceptable Use Policy",
  disclaimer: "Customer Disclaimer",
};

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const title = titles[slug] ?? "Legal Policy";

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
          This is a production placeholder. The client must replace it with
          lawyer-reviewed Australian legal copy before public launch.
        </div>
        <div className="prose prose-slate mt-8 max-w-none">
          <p>
            Carhire is a discovery and lead marketplace connecting customers
            with independent rental vendors. Vendors remain responsible for
            rental terms, booking acceptance, deposits, vehicle condition,
            insurance, refunds, and customer support.
          </p>
        </div>
      </main>
    </div>
  );
}

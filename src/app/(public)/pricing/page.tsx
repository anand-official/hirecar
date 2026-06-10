import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/security/auth";
import { getVendorContext } from "@/lib/data/vendor";
import { Section } from "@/components/ui/section";
import { PricingTable } from "@/components/pricing-table";

export const metadata = {
  title: "Pricing | Hire Car",
  description: "Simple, transparent pricing for vehicle rental operators.",
};

export default async function PricingPage() {
  const user = await getCurrentUser();

  if (user) {
    const vendorContext = await getVendorContext(user.id);
    if (vendorContext.organizations.length > 0) {
      redirect("/vendor/billing");
    }
  }

  return (
    <Section variant="gradient" size="lg" container>
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-[900] tracking-[-0.04em] text-foreground">
          Choose the Right Plan for Your Fleet
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Simple, transparent pricing. Start free and scale as your business grows.
        </p>
      </div>
      <PricingTable />
    </Section>
  );
}

import { ShieldCheck, Car, Star } from "lucide-react";
import { Section } from "@/components/ui/section";

const stats = [
  {
    icon: ShieldCheck,
    value: "150+",
    label: "Verified Vendors",
  },
  {
    icon: Car,
    value: "2,500+",
    label: "Vehicles",
  },
  {
    icon: Star,
    value: "4.8/5",
    label: "Customer Rating",
  },
];

const partnerLogos = [
  { name: "Partner 1" },
  { name: "Partner 2" },
  { name: "Partner 3" },
  { name: "Partner 4" },
  { name: "Partner 5" },
  { name: "Partner 6" },
];

export function TrustSignals() {
  return (
    <Section variant="muted" size="sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          {/* Stats */}
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-10 md:gap-12">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground leading-tight">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Partner Logos */}
          <div className="flex items-center gap-4">
            {partnerLogos.map((partner) => (
              <div
                key={partner.name}
                className="h-8 w-16 rounded bg-muted-foreground/10"
                aria-label={partner.name}
              />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

"use client";

import { StepCard } from "./step-card";
import { Search, CheckCircle2, Car } from "lucide-react";

const howItWorks = [
  {
    icon: Search,
    title: "Search & Compare",
    description: "Browse vehicles from verified local operators. Filter by location, dates, and vehicle type.",
  },
  {
    icon: CheckCircle2,
    title: "Book Directly",
    description: "Contact vendors instantly, no middleman fees. Get transparent pricing and instant confirmation.",
  },
  {
    icon: Car,
    title: "Pick Up & Drive",
    description: "Collect your vehicle and enjoy the journey. All vendors are verified and rated by customers.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            How Hire Car works
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Renting a car has never been easier. Three simple steps to get you on the road.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 relative">
          {howItWorks.map((step, index) => (
            <StepCard
              key={index}
              step={index + 1}
              icon={step.icon}
              title={step.title}
              description={step.description}
              isLast={index === howItWorks.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
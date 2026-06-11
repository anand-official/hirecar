"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";

const faqs = [
  {
    category: "For Customers",
    questions: [
      {
        q: "How does Hire Car work?",
        a: "Hire Car is a marketplace connecting you with verified, independent car rental operators. You browse vehicles, send an enquiry directly to the vendor, and they will coordinate the booking, payment, and pickup details directly with you."
      },
      {
        q: "Do I pay on the Hire Car website?",
        a: "No. Hire Car is a discovery platform. You do not pay any booking fees to us. All payments, deposits, and rental agreements are handled directly by the rental operator you choose."
      },
      {
        q: "Are the rental companies trustworthy?",
        a: "Yes. Every vendor on our platform must pass our verification process. We check their Australian Business Number (ABN) and business details before they are allowed to list vehicles on the marketplace."
      },
      {
        q: "What happens if I need to cancel my booking?",
        a: "Cancellation policies are set by each individual rental operator. When you make a booking, the vendor will provide their specific cancellation terms. You will need to contact the vendor directly to cancel or modify your reservation."
      },
      {
        q: "Does the price include insurance?",
        a: "Insurance coverage varies by vendor. While basic coverage is typically included by law, excess amounts and optional coverages depend on the operator's specific policies. Always confirm insurance details directly with the vendor before finalizing your booking."
      }
    ]
  },
  {
    category: "For Vendors",
    questions: [
      {
        q: "How much does it cost to list my fleet?",
        a: "We offer tiered subscription plans based on fleet size. The Starter plan is free ($0/month) for up to 10 vehicles. Growth and Pro plans include a 14-day free trial. We do not charge commissions on your bookings — you keep 100% of your rental revenue. See our Pricing page for details."
      },
      {
        q: "How do I receive leads?",
        a: "When a customer enquires about your vehicle, you will receive an instant email notification. You can also view and respond to all leads directly in your Vendor Dashboard. Customers can optionally contact you via Phone or WhatsApp if you provide those details."
      },
      {
        q: "How long does it take to get approved?",
        a: "After you complete the onboarding process and submit your ABN, our team reviews your application. Approval typically takes less than 24 hours during business days."
      },
      {
        q: "Can I bulk upload my vehicles?",
        a: "Yes, our Pro and Enterprise plans include bulk upload capabilities and API access, allowing you to sync your fleet inventory directly with our platform."
      }
    ]
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>("For Customers-0");

  const toggleAccordion = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="bg-slate-950 py-20 px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 mb-6">
              <MessageCircleQuestion className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-300">Help Center</span>
            </div>
            <h1 className="text-4xl font-black text-white sm:text-5xl">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 text-lg text-slate-300">
              Everything you need to know about renting or listing on Hire Car.
            </p>
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {faqs.map((section) => (
              <div key={section.category}>
                <h2 className="text-2xl font-black text-slate-900 mb-6">{section.category}</h2>
                <div className="space-y-3">
                  {section.questions.map((faq, index) => {
                    const id = `${section.category}-${index}`;
                    const isOpen = openIndex === id;

                    return (
                      <div 
                        key={index} 
                        className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                          isOpen ? "border-amber-400 bg-white shadow-md" : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <button
                          onClick={() => toggleAccordion(id)}
                          className="w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none"
                        >
                          <span className="text-base font-bold text-slate-900">{faq.q}</span>
                          <ChevronDown 
                            className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                              isOpen ? "rotate-180 text-amber-600" : ""
                            }`} 
                          />
                        </button>
                        <div 
                          className={`px-6 overflow-hidden transition-all duration-200 ease-in-out ${
                            isOpen ? "max-h-96 pb-5 opacity-100" : "max-h-0 opacity-0"
                          }`}
                        >
                          <p className="text-sm leading-relaxed text-slate-600 border-t border-slate-100 pt-4">
                            {faq.a}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Still need help? */}
          <div className="mt-16 rounded-3xl bg-amber-50 border border-amber-200 p-8 text-center sm:p-12">
            <h2 className="text-2xl font-black text-slate-900">Still have questions?</h2>
            <p className="mt-2 text-slate-600 max-w-lg mx-auto">
              If you can&apos;t find what you&apos;re looking for, our support team is ready to help you with any marketplace inquiries.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white hover:bg-slate-800 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

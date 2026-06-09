import { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Terms and Conditions | Hire Car",
  description: "Terms and Conditions for using the Hire Car marketplace.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <article className="prose prose-slate prose-orange max-w-none bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-200">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-8">Terms and Conditions</h1>
          <p className="text-sm text-slate-500 font-medium mb-8">Last Updated: June 2026</p>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">1. Introduction</h2>
            <p className="text-slate-600 mb-4">
              Welcome to Hire Car (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). By accessing or using our marketplace website, you agree to be bound by these Terms and Conditions. Our platform acts solely as an intermediary connecting renters with independent, verified vehicle rental operators (&quot;Vendors&quot;) across Australia.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">2. Australian Consumer Law (ACL)</h2>
            <p className="text-slate-600 mb-4">
              Our services come with guarantees that cannot be excluded under the Australian Consumer Law (ACL). You are entitled to a replacement or refund for a major failure and compensation for any other reasonably foreseeable loss or damage. You are also entitled to have the services supplied again or the cost of having the services supplied again if the services fail to be of acceptable quality and the failure does not amount to a major failure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">3. Role of Hire Car</h2>
            <p className="text-slate-600 mb-4">
              Hire Car does not own, operate, or maintain any of the vehicles listed on this platform. We provide a digital marketplace to facilitate communication and introductory bookings between you and the Vendor. The actual rental agreement is formed directly between you (the Renter) and the Vendor. We are not a party to that rental agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">4. Vendor Verification</h2>
            <p className="text-slate-600 mb-4">
              While we require all Vendors to provide a valid Australian Business Number (ABN) and pass our verification process before listing vehicles, we do not guarantee the condition of the vehicles or the performance of the Vendor. Renters are encouraged to review the specific terms, insurance policies, and conditions provided by the Vendor before completing a booking.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">5. Liability</h2>
            <p className="text-slate-600 mb-4">
              To the maximum extent permitted by law, Hire Car excludes all liability for any direct, indirect, incidental, or consequential loss or damage arising out of your use of the platform, the rental of any vehicle, or any dispute between you and a Vendor.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">6. Jurisdiction</h2>
            <p className="text-slate-600 mb-4">
              These Terms and Conditions are governed by the laws of New South Wales, Australia. Any disputes arising in connection with these terms shall be subject to the exclusive jurisdiction of the courts of New South Wales.
            </p>
          </section>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Send, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface EnquiryWidgetProps {
  vehicleId: string;
  vendorId: string;
  isLoggedIn: boolean;
  userProfile?: {
    name: string;
    email: string;
    phone: string;
  } | null;
}

export function EnquiryWidget({ vehicleId, vendorId, isLoggedIn, userProfile }: EnquiryWidgetProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Logged-out form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupCity, setPickupCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");

  const handleQuickSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/leads/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId, vendorId }),
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit interest");
      }
      
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId,
          vendorId,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          pickupCity,
          startDate,
          endDate,
          message,
        }),
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit enquiry");
      }
      
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 mb-4">
          <MessageCircle className="h-7 w-7 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold text-emerald-800">Enquiry Sent!</h3>
        <p className="mt-2 text-sm text-emerald-600">
          The vendor has been notified and will contact you shortly.
        </p>
        {isLoggedIn && (
          <button
            onClick={() => router.push("/messages")}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            View Messages
          </button>
        )}
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Message the seller</h2>
        <p className="mt-2 text-sm text-slate-600">
          Click below to express your interest. We&apos;ll share your contact details (
          <span className="font-medium">{userProfile?.email}</span>) with the vendor and start a chat thread.
        </p>
        
        {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
        
        <button 
          onClick={handleQuickSubmit}
          disabled={isSubmitting}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </span>
          ) : (
            <>
              <MessageCircle className="h-4 w-4" />
              I am interested
            </>
          )}
        </button>
      </div>
    );
  }

  // Guest enquiry form
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Send a rental enquiry</h2>
      <p className="mt-1 text-sm text-slate-500">
        Or{" "}
        <Link href="/auth/sign-in" className="font-medium text-amber-600 hover:underline">
          log in
        </Link>{" "}
        for 1-click enquiries.
      </p>
      
      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
      
      <form className="mt-5 grid gap-4" onSubmit={handleGuestSubmit}>
        <input
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all"
          placeholder="Phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <input
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all"
          placeholder="Pickup city"
          value={pickupCity}
          onChange={(e) => setPickupCity(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Pickup date</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all"
              type="date"
              value={startDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Return date</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all"
              type="date"
              value={endDate}
              min={startDate || new Date().toISOString().split("T")[0]}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>
        <textarea
          className="w-full min-h-[90px] rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all resize-none"
          placeholder="Optional message to the vendor..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input type="checkbox" className="mt-0.5 h-4 w-4" required />
          I agree for Carhire to share my enquiry with this vendor.
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </span>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit enquiry
            </>
          )}
        </button>
      </form>
    </div>
  );
}

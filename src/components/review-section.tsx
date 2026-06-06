"use client";

import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  body: string;
  created_at: string;
}

interface ReviewSectionProps {
  organizationId: string;
  vehicleId?: string;
  initialReviews: Review[];
}

export default function ReviewSection({ organizationId, vehicleId, initialReviews }: ReviewSectionProps) {
  const [reviews] = useState<Review[]>(initialReviews);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!turnstileToken) {
      setMessage({ type: "error", text: "Please complete the security challenge." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      organizationId,
      vehicleId,
      customerName: formData.get("customerName"),
      rating: parseInt(formData.get("rating") as string, 10),
      body: formData.get("body"),
      turnstileToken,
    };

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Thank you! Your review has been submitted and is pending approval.",
        });
        setShowForm(false);
        setTurnstileToken("");
        (e.target as HTMLFormElement).reset();
      } else {
        setMessage({ type: "error", text: result.error?.message || result.error || "Failed to submit review" });
      }
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred" });
      setTurnstileToken("");
    } finally {
      setIsSubmitting(false);
    }
  }

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "0";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Customer Reviews ({reviews.length})
          {reviews.length > 0 && (
            <span className="ml-2 text-lg text-amber-500">
              {"★".repeat(Math.round(parseFloat(averageRating)))}
              <span className="ml-1 text-sm text-slate-600">({averageRating})</span>
            </span>
          )}
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          {showForm ? "Cancel" : "Write a Review"}
        </button>
      </div>

      {message && (
        <div
          className={`rounded-md p-4 ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-medium">Write a Review</h3>
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Your Name</span>
              <input
                name="customerName"
                type="text"
                required
                minLength={2}
                maxLength={120}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                placeholder="John Doe"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Rating</span>
              <div className="mt-1 flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <label key={star} className="cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      value={star}
                      required
                      className="sr-only peer"
                    />
                    <span className="text-2xl text-slate-300 peer-checked:text-amber-400 hover:text-amber-300">
                      ★
                    </span>
                  </label>
                ))}
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Your Review</span>
              <textarea
                name="body"
                required
                minLength={10}
                maxLength={2000}
                rows={4}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                placeholder="Share your experience with this rental..."
              />
            </label>

            <div className="flex justify-center">
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                onSuccess={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken("")}
                onError={() => setTurnstileToken("")}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !turnstileToken}
              className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:bg-slate-400"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-slate-500">
            No reviews yet. Be the first to share your experience!
          </p>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex text-amber-400">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </div>
                <span className="font-medium">{review.customer_name}</span>
                <span className="text-sm text-slate-500">
                  {new Date(review.created_at).toLocaleDateString("en-AU", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="mt-2 text-slate-700">{review.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

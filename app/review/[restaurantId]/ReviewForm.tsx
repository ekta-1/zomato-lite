"use client";

// The interactive review form. It gathers a rating and a comment and hands
// all three values to POST /api/reviews. It does no validation logic of its
// own beyond disabling Submit for empty input (a kindness to honest users);
// the backend is the real gatekeeper. If the API returns a 400, this shows
// the backend's message verbatim — it does not invent its own.

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewForm({
  restaurantId,
  restaurantName,
}: {
  restaurantId: string;
  restaurantName: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = rating >= 1 && comment.trim().length > 0 && !submitting;

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: Number(restaurantId),
          rating,
          comment,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // Show exactly what the backend said.
        setError(data.error ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }

      // Success — send them to the restaurant page.
      router.push(`/restaurant/${restaurantId}`);
    } catch {
      setError("Could not reach the server. Is it running?");
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>
        Review {restaurantName}
      </h1>
      <p style={{ color: "var(--muted)", fontSize: 15, marginTop: 6, marginBottom: 36 }}>
        How was it?
      </p>

      {/* Star picker, 1 to 5 */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[1, 2, 3, 4, 5].map((n) => {
            const active = (hover || rating) >= n;
            return (
              <button
                key={n}
                type="button"
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                style={{
                  fontSize: 34,
                  lineHeight: 1,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  color: active ? "var(--accent)" : "var(--line)",
                  transition: "color 0.1s",
                }}
              >
                ★
              </button>
            );
          })}
        </div>
      </div>

      {/* Comment box */}
      <div style={{ marginBottom: 24 }}>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What should people know?"
          rows={4}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: 14,
            fontSize: 15,
            fontFamily: "inherit",
            color: "var(--ink)",
            background: "var(--card)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius)",
            resize: "vertical",
          }}
        />
      </div>

      {/* Error from the backend, shown verbatim */}
      {error && (
        <p style={{ color: "var(--accent)", fontSize: 14, marginBottom: 20 }}>{error}</p>
      )}

      {/* Submit — disabled until a rating is picked and the comment is non-empty */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        style={{
          fontSize: 15,
          fontWeight: 500,
          padding: "11px 22px",
          borderRadius: "var(--radius)",
          border: "none",
          cursor: canSubmit ? "pointer" : "not-allowed",
          color: "#fff",
          background: canSubmit ? "var(--accent)" : "var(--line)",
          transition: "background 0.15s",
        }}
      >
        {submitting ? "Submitting…" : "Submit"}
      </button>
    </div>
  );
}

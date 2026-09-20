// Screen 2 — /restaurant/[id]
//
// This is a display layer, nothing more. It calls GET /api/restaurants/[id]
// and prints whatever it gets back. There is NO calculation anywhere in this
// file: no adding, no dividing, no sorting. The backend already did all of
// that. See the line that prints the average — it just reads `data.averageRating`.

import Link from "next/link";
import { headers } from "next/headers";

type Review = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
};

type RestaurantData = {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: Review | null;
  reviews: Review[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

// Small typographic stars (filled/empty). Purely a display of the number.
function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} out of 5`} style={{ color: "var(--accent)", letterSpacing: 1 }}>
      {"★".repeat(rating)}
      <span style={{ color: "var(--line)" }}>{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Build an absolute URL for the server-side fetch (works locally and on Vercel).
  const h = await headers();
  const host = h.get("host")!;
  const proto = host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
  const res = await fetch(`${proto}://${host}/api/restaurants/${id}`, {
    cache: "no-store", // always fresh — recency is the whole point
  });

  if (res.status === 404) {
    return (
      <main className="page">
        <p style={{ color: "var(--muted)" }}>That restaurant does not exist.</p>
      </main>
    );
  }

  const data: RestaurantData = await res.json();

  return (
    <main className="page">
      {/* Name + cuisine/area */}
      <header style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>
          {data.name}
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, marginTop: 6 }}>
          {data.cuisine} · {data.area}
        </p>
      </header>

      {/* The average — the biggest thing on the page. Note: printed, not computed. */}
      <section style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 40 }}>
        {data.averageRating === null ? (
          <span style={{ fontSize: 20, color: "var(--muted)" }}>No ratings yet</span>
        ) : (
          <>
            <span style={{ fontSize: 64, fontWeight: 600, lineHeight: 1, letterSpacing: "-0.03em" }}>
              {data.averageRating}
            </span>
            <span style={{ color: "var(--muted)", fontSize: 15 }}>
              out of 5 · {data.totalReviews}{" "}
              {data.totalReviews === 1 ? "review" : "reviews"}
            </span>
          </>
        )}
      </section>

      {/* Empty state — invites the first review */}
      {data.totalReviews === 0 && (
        <section
          style={{
            border: "1px solid var(--line)",
            borderRadius: "var(--radius)",
            padding: 28,
            textAlign: "center",
            color: "var(--muted)",
          }}
        >
          <p style={{ margin: 0 }}>No reviews yet.</p>
          <p style={{ margin: "8px 0 0" }}>
            <Link href={`/review/${id}`}>Be the first to write one →</Link>
          </p>
        </section>
      )}

      {/* Latest review — visually highlighted, set apart from the rest */}
      {data.latestReview && (
        <section style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: 10 }}>
            Latest review
          </p>
          <article
            style={{
              background: "var(--card)",
              border: "1px solid var(--line)",
              borderLeft: "3px solid var(--accent)",
              borderRadius: "var(--radius)",
              padding: 20,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Stars rating={data.latestReview.rating} />
              <span style={{ color: "var(--muted)", fontSize: 13 }}>
                {formatDate(data.latestReview.createdAt)}
              </span>
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 16 }}>{data.latestReview.comment}</p>
          </article>
        </section>
      )}

      {/* Older reviews — a plain list */}
      {data.reviews.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {data.reviews.map((r) => (
              <li key={r.id} style={{ padding: "18px 0", borderTop: "1px solid var(--line)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Stars rating={r.rating} />
                  <span style={{ color: "var(--muted)", fontSize: 13 }}>{formatDate(r.createdAt)}</span>
                </div>
                <p style={{ margin: "8px 0 0", fontSize: 15 }}>{r.comment}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Link to write a review */}
      <Link href={`/review/${id}`} style={{ fontSize: 15 }}>
        Write a review →
      </Link>
    </main>
  );
}

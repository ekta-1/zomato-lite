// Screen 1 — /review/[restaurantId]
//
// A server component that looks up the restaurant name (so you know what you
// are reviewing) and hands it to the interactive form. If the restaurant does
// not exist, it says so instead of showing a form.

import { headers } from "next/headers";
import ReviewForm from "./ReviewForm";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;

  const h = await headers();
  const host = h.get("host")!;
  const proto = host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
  const res = await fetch(`${proto}://${host}/api/restaurants/${restaurantId}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    return (
      <main className="page">
        <p style={{ color: "var(--muted)" }}>That restaurant does not exist.</p>
      </main>
    );
  }

  const data = await res.json();

  return (
    <main className="page">
      <ReviewForm restaurantId={restaurantId} restaurantName={data.name} />
    </main>
  );
}

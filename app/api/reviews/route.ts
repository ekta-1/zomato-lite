// POST /api/reviews  — save one review.
//
// The backend does NOT trust whatever is sent to it. It validates, in order,
// and returns 400 with a plain-English reason on the FIRST failure:
//   1. rating is a whole number from 1 to 5
//   2. comment is a non-empty string (after trimming whitespace)
//   3. restaurantId points at a restaurant that actually exists (a DB lookup)
// On success it inserts exactly one row and returns 201.

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  let body: { restaurantId?: unknown; rating?: unknown; comment?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be valid JSON." }, { status: 400 });
  }

  const { restaurantId, rating, comment } = body ?? {};

  // 1. rating: integer 1..5
  if (
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return NextResponse.json(
      { error: "rating must be a whole number from 1 to 5." },
      { status: 400 },
    );
  }

  // 2. comment: non-empty after trimming
  if (typeof comment !== "string" || comment.trim().length === 0) {
    return NextResponse.json(
      { error: "comment must not be empty." },
      { status: 400 },
    );
  }

  // 3. restaurant must exist
  const existing = await sql`
    SELECT id FROM restaurants WHERE id = ${restaurantId as number}
  `;
  if (existing.length === 0) {
    return NextResponse.json(
      { error: `Restaurant ${String(restaurantId)} does not exist.` },
      { status: 400 },
    );
  }

  // Insert exactly one row. created_at defaults to NOW() in the schema.
  const inserted = await sql`
    INSERT INTO reviews (restaurant_id, rating, comment)
    VALUES (${restaurantId as number}, ${rating}, ${comment.trim()})
    RETURNING id
  `;

  return NextResponse.json(
    { success: true, reviewId: inserted[0].id },
    { status: 201 },
  );
}

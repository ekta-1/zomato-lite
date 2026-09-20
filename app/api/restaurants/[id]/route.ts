// GET /api/restaurants/[id]  — everything the restaurant page needs, in one call.
//
// This is where "store facts, compute answers" becomes real. The database
// holds only raw reviews. The average, the count, and which review is newest
// are all COMPUTED here, fresh, every time the page loads. Nothing is stored.
//
// The response is shaped like the screen (name, big rating, latest review,
// then the rest) so the frontend has nothing left to figure out.

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

type ReviewRow = {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
};

function toReview(row: ReviewRow) {
  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const restaurantId = Number(id);

  // 404 if the restaurant does not exist.
  const restaurants = await sql`
    SELECT name, cuisine, area FROM restaurants WHERE id = ${restaurantId}
  `;
  if (restaurants.length === 0) {
    return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
  }
  const restaurant = restaurants[0];

  // COMPUTED: average (rounded to 1 decimal in the backend) and count.
  // AVG returns NULL when there are no reviews; COUNT returns 0.
  const stats = await sql`
    SELECT ROUND(AVG(rating)::numeric, 1) AS avg, COUNT(*) AS count
    FROM reviews WHERE restaurant_id = ${restaurantId}
  `;
  const totalReviews = Number(stats[0].count);
  const averageRating = stats[0].avg === null ? null : Number(stats[0].avg);

  // COMPUTED: all reviews, newest first. The first one is "latest";
  // everything after it is the older list (so latest is never printed twice).
  const rows = (await sql`
    SELECT id, rating, comment, created_at
    FROM reviews WHERE restaurant_id = ${restaurantId}
    ORDER BY created_at DESC
  `) as ReviewRow[];

  const latestReview = rows.length > 0 ? toReview(rows[0]) : null;
  const reviews = rows.slice(1).map(toReview);

  return NextResponse.json({
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    area: restaurant.area,
    averageRating,
    totalReviews,
    latestReview,
    reviews,
  });
}

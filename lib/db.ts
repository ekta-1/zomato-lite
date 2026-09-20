// One shared database connection for the whole app.
// `neon(...)` gives us a tagged-template function `sql` that safely sends
// queries to Postgres. Writing sql`... ${value} ...` automatically escapes
// values, so user input can never be smuggled in as SQL (no injection).

import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Check .env.local");
}

export const sql = neon(process.env.DATABASE_URL);

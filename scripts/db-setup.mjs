// Applies db/schema.sql and db/seed.sql to the Neon database.
// Run with:  npm run db:setup
//
// This talks to Postgres over Neon's HTTP driver. It reads DATABASE_URL from
// the environment (loaded via --env-file=.env.local in the npm script), then:
//   1. drops the two tables if they already exist (so this is safe to re-run),
//   2. creates them from db/schema.sql,
//   3. inserts the seed rows from db/seed.sql,
//   4. prints what it created.

import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Missing DATABASE_URL. Is .env.local present?");
  process.exit(1);
}

const sql = neon(url);

// Split a .sql file into individual statements (naive split on ';' is fine
// here because our SQL has no semicolons inside strings).
function statements(file) {
  return readFileSync(new URL(`../db/${file}`, import.meta.url), "utf8")
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function run(file) {
  for (const stmt of statements(file)) {
    await sql.query(stmt);
  }
}

console.log("Resetting tables...");
// Drop in dependency order (reviews references restaurants).
await sql.query("DROP TABLE IF EXISTS reviews");
await sql.query("DROP TABLE IF EXISTS restaurants");

console.log("Applying schema (db/schema.sql)...");
await run("schema.sql");

console.log("Seeding data (db/seed.sql)...");
await run("seed.sql");

console.log("\nDone. Here is what exists now:\n");

const restaurants = await sql.query("SELECT * FROM restaurants ORDER BY id");
console.log("restaurants:");
console.table(restaurants);

const reviews = await sql.query(
  "SELECT id, restaurant_id, rating, comment, created_at FROM reviews ORDER BY created_at",
);
console.log("reviews:");
console.table(reviews);

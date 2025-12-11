import postgres from "postgres";

// Load environment variables if not already loaded
if (!process.env.DATABASE_URL) {
  try {
    const { config } = require("dotenv");
    config({ path: ".env.local" });
  } catch (e) {
    // dotenv not available or .env.local not found
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

// Create postgres connection for raw SQL queries
export const sql = postgres(process.env.DATABASE_URL);

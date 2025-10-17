import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

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

// Create postgres connection
const client = postgres(process.env.DATABASE_URL);

// Create drizzle instance
export const db = drizzle(client, { schema });

// Re-export schema for convenience
export * from "./schema";

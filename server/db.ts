import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

// Mengambil URL dari .env
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Setup connection pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize Drizzle
export const db = drizzle(pool);
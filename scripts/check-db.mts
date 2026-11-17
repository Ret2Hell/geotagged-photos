import "../lib/load-env.ts";

import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

import { env } from "../lib/env.ts";

// Use the same driver as the app, without loading Next.js-only modules.
const db = drizzle(neon(env.DATABASE_URL));

try {
    await db.execute(sql`select 1`);
    console.log("Database connection successful.");
} catch {
    console.error(
        "Database connection failed. Check DATABASE_URL and network access.",
    );
    process.exitCode = 1;
}

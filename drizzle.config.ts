import "./lib/load-env.ts";

import { defineConfig } from "drizzle-kit";

import { env } from "./lib/env.ts";

export default defineConfig({
    dialect: "postgresql",
    schema: "./db/schema.ts",
    out: "./drizzle",
    dbCredentials: { url: env.DATABASE_URL },
    // Do not introspect or push changes to Neon Auth-managed schemas.
    schemaFilter: ["public"],
    strict: true,
});

import * as nextEnv from "@next/env";

const envLoader: typeof nextEnv & { default?: typeof nextEnv } = nextEnv;

// Load environment variables for the database check script and Drizzle CLI.
(envLoader.default ?? envLoader).loadEnvConfig(
    process.cwd(),
    process.env.NODE_ENV !== "production",
);

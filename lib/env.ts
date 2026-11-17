import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        DATABASE_URL: z.url({ protocol: /^postgres(?:ql)?$/ }),
        NEON_AUTH_BASE_URL: z.url({ protocol: /^https$/ }),
        NEON_AUTH_COOKIE_SECRET: z.string().min(32),
        AWS_ENDPOINT_URL_S3: z.url({ protocol: /^https$/ }),
        AWS_REGION: z.string().trim().min(1),
        AWS_ACCESS_KEY_ID: z.string().trim().min(1),
        AWS_SECRET_ACCESS_KEY: z.string().trim().min(1),
        NEON_STORAGE_BUCKET: z.string().trim().min(1).max(255),
        GOOGLE_GENERATIVE_AI_API_KEY: z.string().trim().min(1),
        NODE_ENV: z
            .enum(["development", "production", "test"])
            .default("development"),
    },
    client: {
        NEXT_PUBLIC_MAPBOX_TOKEN: z.string().trim().startsWith("pk."),
    },
    runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
        NEON_AUTH_BASE_URL: process.env.NEON_AUTH_BASE_URL,
        NEON_AUTH_COOKIE_SECRET: process.env.NEON_AUTH_COOKIE_SECRET,
        AWS_ENDPOINT_URL_S3: process.env.AWS_ENDPOINT_URL_S3,
        AWS_REGION: process.env.AWS_REGION,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        NEON_STORAGE_BUCKET: process.env.NEON_STORAGE_BUCKET,
        GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
        NODE_ENV: process.env.NODE_ENV,
    },
    emptyStringAsUndefined: true,
});

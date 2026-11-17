import "server-only";

import { createNeonAuth } from "@neon/auth/next/server";
import { env } from "../env.ts";

export const auth = createNeonAuth({
    baseUrl: env.NEON_AUTH_BASE_URL,
    cookies: {
        secret: env.NEON_AUTH_COOKIE_SECRET,
        sessionDataTtl: 60,
    },
});

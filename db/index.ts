import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { env } from "../lib/env.ts";
import * as schema from "./schema.ts";

export const db = drizzle({ client: neon(env.DATABASE_URL), schema });

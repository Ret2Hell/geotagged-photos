import "server-only";

import { redirect } from "next/navigation";
import { auth } from "./server.ts";

export async function requireSession() {
    const { data: session, error } = await auth.getSession({
        query: { disableCookieCache: "true" },
    });
    if (error)
        throw new Error("Unable to verify your session. Please try again.");
    if (!session?.user) redirect("/auth/sign-in");
    return session;
}

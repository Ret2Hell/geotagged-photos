import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { auth } from "@/lib/auth/server";

async function SessionActions() {
    await connection();
    const result = await auth
        .getSession({
            query: { disableCookieCache: "true" },
        })
        .catch((error: unknown) => {
            unstable_rethrow(error);
            return null;
        });

    if (!result || result.error) {
        return (
            <output className="text-muted-foreground text-sm">
                Sign-in temporarily unavailable
            </output>
        );
    }
    const session = result.data;
    if (session?.user) {
        return (
            <div className="flex items-center gap-3">
                <span className="max-w-40 truncate text-sm">
                    {session.user.name || session.user.email}
                </span>
                <SignOutButton />
            </div>
        );
    }
    return null;
}

export function SiteHeader() {
    return (
        <header className="border-b px-6 py-4">
            <nav
                aria-label="Main navigation"
                className="mx-auto flex max-w-5xl items-center justify-between gap-6"
            >
                <Link
                    href="/"
                    className="rounded-sm text-lg font-semibold tracking-tight focus-visible:outline-2"
                >
                    Hylight<span className="text-primary">.</span>
                </Link>
                <Suspense fallback={null}>
                    <SessionActions />
                </Suspense>
            </nav>
        </header>
    );
}

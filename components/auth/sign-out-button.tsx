"use client";

import { useActionState } from "react";
import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import type { AuthFormState } from "@/lib/auth/validation";

const initialState: AuthFormState = {};

export function SignOutButton() {
    const [state, action, pending] = useActionState(signOut, initialState);
    return (
        <form action={action} className="space-y-1">
            <Button
                type="submit"
                variant="outline"
                size="sm"
                disabled={pending}
            >
                {pending ? "Signing out…" : "Sign out"}
            </Button>
            {state.error && (
                <p role="alert" className="text-destructive text-xs">
                    {state.error}
                </p>
            )}
        </form>
    );
}

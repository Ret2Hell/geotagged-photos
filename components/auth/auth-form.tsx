"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signIn, signUp } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordRequirements } from "./password-requirements";
import {
    PASSWORD_PATTERN,
    PASSWORD_REQUIREMENTS,
    type AuthFormState,
} from "@/lib/auth/validation";

const initialState: AuthFormState = {};

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
    const signingUp = mode === "sign-up";
    const [password, setPassword] = useState("");
    const [state, action, pending] = useActionState(
        signingUp ? signUp : signIn,
        initialState,
    );

    return (
        <form
            action={action}
            className="space-y-5"
            aria-label={signingUp ? "Create account" : "Sign in"}
        >
            {signingUp && (
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                        Name
                    </label>
                    <Input
                        id="name"
                        name="name"
                        autoComplete="name"
                        maxLength={100}
                        required
                        disabled={pending}
                    />
                </div>
            )}
            <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                    Email
                </label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    required
                    disabled={pending}
                />
            </div>
            <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                    Password
                </label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete={
                        signingUp ? "new-password" : "current-password"
                    }
                    minLength={signingUp ? 12 : 1}
                    maxLength={signingUp ? 64 : 128}
                    pattern={signingUp ? PASSWORD_PATTERN : undefined}
                    title={signingUp ? PASSWORD_REQUIREMENTS : undefined}
                    required
                    disabled={pending}
                    aria-describedby={signingUp ? "password-hint" : undefined}
                />
                {signingUp && <PasswordRequirements password={password} />}
            </div>
            {state.error && (
                <p role="alert" className="text-destructive text-sm">
                    {state.error}
                </p>
            )}
            {state.success && (
                <output className="text-primary block text-sm">
                    {state.success}
                </output>
            )}
            <Button type="submit" className="w-full" disabled={pending}>
                {pending
                    ? signingUp
                        ? "Creating account…"
                        : "Signing in…"
                    : signingUp
                      ? "Create account"
                      : "Sign in"}
            </Button>
            <p className="text-muted-foreground text-center text-sm">
                {signingUp ? "Already have an account? " : "New here? "}
                <Link
                    href={signingUp ? "/auth/sign-in" : "/auth/sign-up"}
                    className="text-primary rounded-sm underline underline-offset-4 focus-visible:outline-2"
                >
                    {signingUp ? "Sign in" : "Create an account"}
                </Link>
            </p>
        </form>
    );
}

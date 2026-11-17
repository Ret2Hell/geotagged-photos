"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { auth } from "@/lib/auth/server";
import {
    signInSchema,
    signUpSchema,
    type AuthFormState,
} from "@/lib/auth/validation";

export async function signIn(
    _previous: AuthFormState,
    formData: FormData,
): Promise<AuthFormState> {
    const input = signInSchema.safeParse(Object.fromEntries(formData));
    if (!input.success) return { error: "Enter a valid email and password." };

    try {
        const { error } = await auth.signIn.email(input.data);
        if (error)
            return {
                error: "Unable to sign in. Check your credentials and email verification, then try again.",
            };
    } catch (error) {
        unstable_rethrow(error);
        return { error: "Sign-in is unavailable. Please try again." };
    }
    return redirect("/");
}

export async function signUp(
    _previous: AuthFormState,
    formData: FormData,
): Promise<AuthFormState> {
    const input = signUpSchema.safeParse(Object.fromEntries(formData));
    if (!input.success)
        return {
            error: "Enter your name, a valid email, and a password between 8 and 128 characters.",
        };

    try {
        const { data, error } = await auth.signUp.email(input.data);
        if (error)
            return {
                error: "Unable to create an account. Try signing in if you already have one, or try again later.",
            };
        if (!data?.token)
            return {
                success: "Check your inbox to verify your email, then sign in.",
            };
    } catch (error) {
        unstable_rethrow(error);
        return { error: "Account creation is unavailable. Please try again." };
    }
    return redirect("/");
}

export async function signOut(
    _previous: AuthFormState,
    _formData: FormData,
): Promise<AuthFormState> {
    try {
        const { error } = await auth.signOut();
        if (error) return { error: "Unable to sign out. Please try again." };
    } catch (error) {
        unstable_rethrow(error);
        return { error: "Sign-out is unavailable. Please try again." };
    }
    return redirect("/auth/sign-in");
}

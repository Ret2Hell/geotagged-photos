import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Sign in · GeoTagged Photos" };

export default function SignInPage() {
    return (
        <>
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Sign in
                </h1>
                <p className="text-muted-foreground text-sm">
                    Upload photographs and join the discussion.
                </p>
            </div>
            <AuthForm mode="sign-in" />
        </>
    );
}

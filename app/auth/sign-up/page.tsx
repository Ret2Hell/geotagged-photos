import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
    title: "Create account · GeoTagged Photos",
};

export default function SignUpPage() {
    return (
        <>
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Create account
                </h1>
                <p className="text-muted-foreground text-sm">
                    Share the places behind your photographs.
                </p>
            </div>
            <AuthForm mode="sign-up" />
        </>
    );
}

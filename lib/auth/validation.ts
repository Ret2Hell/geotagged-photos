import { z } from "zod";

const email = z.string().trim().toLowerCase().max(254).pipe(z.email());
const password = z.string().min(1).max(128);

export const signInSchema = z.object({ email, password });
export const signUpSchema = signInSchema.extend({
    name: z.string().trim().min(1).max(100),
    password: password.min(8),
});

export type AuthFormState = { error?: string; success?: string };

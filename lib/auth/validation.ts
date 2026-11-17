import { z } from "zod";

const email = z.string().trim().toLowerCase().max(254).pipe(z.email());
const password = z.string().min(1).max(128);

export const PASSWORD_REQUIREMENTS =
    "Use 12–64 characters with uppercase and lowercase letters, a number, and a symbol.";
export const PASSWORD_PATTERN = String.raw`(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9\s]).{12,64}`;

export const signInSchema = z.object({ email, password });
export const signUpSchema = signInSchema.extend({
    name: z.string().trim().min(1).max(100),
    password: password
        .min(12, PASSWORD_REQUIREMENTS)
        .max(64, PASSWORD_REQUIREMENTS)
        .regex(
            new RegExp(`^(?:${PASSWORD_PATTERN})$`, "u"),
            PASSWORD_REQUIREMENTS,
        ),
});

export type AuthFormState = { error?: string; success?: string };

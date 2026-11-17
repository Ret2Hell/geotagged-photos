import { auth } from "@/lib/auth/server";
import { PASSWORD_REQUIREMENTS, signUpSchema } from "@/lib/auth/validation";

const handlers = auth.handler();
export const { GET, PUT, PATCH, DELETE } = handlers;

export async function POST(
    request: Request,
    context: { params: Promise<{ path: string[] }> },
) {
    const { path } = await context.params;
    if (path.join("/") === "sign-up/email") {
        const body: unknown = await request
            .clone()
            .json()
            .catch(() => null);
        if (!signUpSchema.safeParse(body).success) {
            return Response.json(
                {
                    message: `Enter your name and a valid email. ${PASSWORD_REQUIREMENTS}`,
                },
                { status: 400 },
            );
        }
    }
    return handlers.POST(request, context);
}

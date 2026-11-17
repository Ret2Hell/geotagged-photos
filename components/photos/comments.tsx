"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    apiErrorSchema,
    commentSchema,
    type PhotoComment,
} from "@/lib/photos/contracts";

export function PhotoComments({
    photoId,
    initialComments,
}: {
    photoId: string;
    initialComments: PhotoComment[];
}) {
    const [comments, setComments] = useState(initialComments);
    const [body, setBody] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = scrollRef.current;
        if (container && comments.length > 0) {
            container.scrollTop = container.scrollHeight;
        }
    }, [comments.length]);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (saving) return;
        setSaving(true);
        setError("");
        try {
            const response = await fetch(`/api/photos/${photoId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ body }),
            });
            const result: unknown = await response.json().catch(() => null);
            if (!response.ok) {
                const message = apiErrorSchema.safeParse(result);
                throw new Error(
                    message.success
                        ? message.data.error
                        : "The comment could not be saved.",
                );
            }
            const comment = commentSchema.parse(result);
            setComments((current) => [...current, comment]);
            setBody("");
        } catch (failure) {
            setError(
                failure instanceof Error
                    ? failure.message
                    : "The comment could not be saved.",
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <section
            aria-labelledby="comments-title"
            className="flex h-[28rem] min-h-0 min-w-0 flex-col border-t md:h-full md:border-t-0 md:border-l"
        >
            <header className="shrink-0 border-b px-5 py-4 sm:px-6">
                <h2 id="comments-title" className="font-semibold">
                    Comments
                </h2>
            </header>
            <div
                ref={scrollRef}
                className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6"
            >
                {!comments.length && (
                    <p className="text-muted-foreground text-sm">
                        No comments yet. Start the discussion.
                    </p>
                )}
                <ul
                    className="space-y-4"
                    aria-live="polite"
                    aria-relevant="additions"
                >
                    {comments.map((comment) => (
                        <li key={comment.id} className="space-y-2">
                            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                <span className="text-sm font-medium">
                                    {comment.authorName || "Unknown user"}
                                </span>
                                <time
                                    dateTime={comment.createdAt}
                                    className="text-muted-foreground text-xs"
                                >
                                    {new Date(
                                        comment.createdAt,
                                    ).toLocaleString()}
                                </time>
                            </div>
                            <p className="bg-muted/50 rounded-2xl p-3 text-sm leading-relaxed wrap-anywhere whitespace-pre-wrap">
                                {comment.body}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
            <form
                onSubmit={(event) => {
                    void submit(event);
                }}
                className="bg-background shrink-0 space-y-3 border-t p-5 sm:p-6"
            >
                <label htmlFor="comment-body" className="sr-only">
                    Add a comment
                </label>
                <Textarea
                    id="comment-body"
                    name="body"
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    maxLength={2000}
                    required
                    disabled={saving}
                    rows={3}
                    placeholder="Write a comment…"
                    className="max-h-32 overflow-y-auto"
                />
                {error && (
                    <p role="alert" className="text-destructive text-sm">
                        {error}
                    </p>
                )}
                <Button
                    type="submit"
                    className="w-full"
                    disabled={saving || !body.trim()}
                >
                    {saving ? "Posting…" : "Post comment"}
                </Button>
            </form>
        </section>
    );
}

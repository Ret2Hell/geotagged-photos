"use client";

import { useState, type FormEvent } from "react";
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
            className="space-y-4 border-t pt-5"
        >
            <h2 id="comments-title" className="font-semibold">
                Comments
            </h2>
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
                    <li key={comment.id} className="space-y-1">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <span className="text-sm font-medium">
                                {comment.authorName || "Unknown user"}
                            </span>
                            <time
                                dateTime={comment.createdAt}
                                className="text-muted-foreground text-xs"
                            >
                                {new Date(comment.createdAt).toLocaleString()}
                            </time>
                        </div>
                        <p className="text-sm wrap-anywhere whitespace-pre-wrap">
                            {comment.body}
                        </p>
                    </li>
                ))}
            </ul>
            <form
                onSubmit={(event) => {
                    void submit(event);
                }}
                className="space-y-3"
            >
                <label htmlFor="comment-body" className="text-sm font-medium">
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
                />
                {error && (
                    <p role="alert" className="text-destructive text-sm">
                        {error}
                    </p>
                )}
                <Button type="submit" disabled={saving || !body.trim()}>
                    {saving ? "Posting…" : "Post comment"}
                </Button>
            </form>
        </section>
    );
}

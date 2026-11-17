export function PasswordRequirements({ password }: { password: string }) {
    const requirements = [
        {
            label: "12–64 characters",
            met: password.length >= 12 && password.length <= 64,
        },
        { label: "An uppercase letter (A–Z)", met: /[A-Z]/.test(password) },
        { label: "A lowercase letter (a–z)", met: /[a-z]/.test(password) },
        { label: "A number (0–9)", met: /[0-9]/.test(password) },
        {
            label: "A symbol (e.g. !, @, #)",
            met: /[^A-Za-z0-9\s]/.test(password),
        },
    ];

    return (
        <section
            id="password-hint"
            aria-label="Password requirements"
            className="bg-muted/40 space-y-3 rounded-lg border p-3"
        >
            <ul className="space-y-2 text-xs">
                {requirements.map(({ label, met }) => (
                    <li
                        key={label}
                        className={`flex items-center gap-2 ${met ? "text-primary" : "text-muted-foreground"}`}
                    >
                        <span
                            aria-hidden="true"
                            className="flex size-4 shrink-0 items-center justify-center font-semibold"
                        >
                            {met ? "✓" : "○"}
                        </span>
                        <span>
                            {label}
                            <span className="sr-only">
                                : {met ? "met" : "not met"}
                            </span>
                        </span>
                    </li>
                ))}
            </ul>
        </section>
    );
}

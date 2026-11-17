export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="flex flex-1 items-center justify-center px-6 py-12">
            <div className="w-full max-w-sm space-y-6 rounded-xl border p-6">
                {children}
            </div>
        </main>
    );
}

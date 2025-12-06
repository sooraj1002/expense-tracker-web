export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12">
      <div className="w-full max-w-xl rounded-3xl bg-[var(--color-surface)] p-8 shadow-md ring-1 ring-[var(--color-border)]/70">
        {children}
      </div>
    </div>
  );
}

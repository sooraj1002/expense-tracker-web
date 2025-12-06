export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-brand)] text-white shadow-lg shadow-[var(--color-brand)]/25">
        <span className="text-lg font-semibold leading-none">TR</span>
      </div>
      <div className="flex flex-col leading-none text-[var(--color-foreground)]">
        <span className="text-lg font-semibold">Tracker</span>
        <span className="text-xs text-[var(--color-muted-foreground)]">
          expenses & sync
        </span>
      </div>
    </div>
  );
}

export function BlockSkeleton() {
  return (
    <div className="card p-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[var(--bg-tertiary)]" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-24 bg-[var(--bg-tertiary)] rounded" />
          <div className="h-4 w-32 bg-[var(--bg-tertiary)] rounded" />
        </div>
        <div className="hidden sm:flex items-center gap-6">
          <div className="h-4 w-16 bg-[var(--bg-tertiary)] rounded" />
          <div className="h-4 w-20 bg-[var(--bg-tertiary)] rounded" />
        </div>
      </div>
    </div>
  );
}






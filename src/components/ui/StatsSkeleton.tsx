export function StatsSkeleton() {
  return (
    <div className="card p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-24 bg-[var(--bg-tertiary)] rounded" />
        <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)]" />
      </div>
      <div className="space-y-2">
        <div className="h-8 w-32 bg-[var(--bg-tertiary)] rounded" />
        <div className="h-4 w-20 bg-[var(--bg-tertiary)] rounded" />
      </div>
    </div>
  );
}






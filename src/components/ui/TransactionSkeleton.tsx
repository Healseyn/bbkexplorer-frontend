export function TransactionSkeleton() {
  return (
    <div className="card p-4 animate-pulse">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-5 w-32 bg-[var(--bg-tertiary)] rounded" />
          <div className="h-4 w-48 bg-[var(--bg-tertiary)] rounded" />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end gap-1">
            <div className="h-4 w-24 bg-[var(--bg-tertiary)] rounded" />
            <div className="h-4 w-24 bg-[var(--bg-tertiary)] rounded" />
          </div>
          <div className="w-4 h-4 bg-[var(--bg-tertiary)] rounded-full" />
          <div className="flex flex-col items-start gap-1">
            <div className="h-4 w-24 bg-[var(--bg-tertiary)] rounded" />
            <div className="h-4 w-24 bg-[var(--bg-tertiary)] rounded" />
          </div>
        </div>

        <div className="space-y-1 text-right">
          <div className="h-5 w-24 bg-[var(--bg-tertiary)] rounded ml-auto" />
          <div className="h-3 w-16 bg-[var(--bg-tertiary)] rounded ml-auto" />
        </div>
      </div>
    </div>
  );
}






interface MasternodeStatusBadgeProps {
  status: 'ENABLED' | 'EXPIRED' | 'VIN_SPENT' | 'REMOVE' | 'POS_ERROR';
}

export function MasternodeStatusBadge({ status }: MasternodeStatusBadgeProps) {
  const styles = {
    ENABLED: 'bg-[var(--accent-success)]/10 text-[var(--accent-success)]',
    EXPIRED: 'bg-[var(--accent-warning)]/10 text-[var(--accent-warning)]',
    VIN_SPENT: 'bg-[var(--accent-error)]/10 text-[var(--accent-error)]',
    REMOVE: 'bg-[var(--accent-error)]/10 text-[var(--accent-error)]',
    POS_ERROR: 'bg-[var(--accent-error)]/10 text-[var(--accent-error)]',
  };

  const baseClasses = 'px-2 py-0.5 text-xs rounded-full font-medium';
  const statusClasses = styles[status];

  return (
    <span className={`${baseClasses} ${statusClasses}`}>
      {status}
    </span>
  );
}


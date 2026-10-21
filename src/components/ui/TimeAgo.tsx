'use client';

import { useNow } from '@/hooks/useNow';
import { formatTimeAgo } from '@/lib/api';

interface TimeAgoProps {
  timestamp: number; // Seconds (or milliseconds, normalized by formatTimeAgo)
}

/**
 * "Xs ago" label that updates every second. Only this element re-renders on each
 * tick, not the page that contains it.
 */
export function TimeAgo({ timestamp }: TimeAgoProps) {
  const now = useNow();
  return <>{now === null ? '—' : formatTimeAgo(timestamp, now)}</>;
}

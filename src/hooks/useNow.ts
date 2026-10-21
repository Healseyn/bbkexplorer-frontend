'use client';

import { useSyncExternalStore } from 'react';

/**
 * Shared 1-second clock for "time ago" labels.
 *
 * A single interval runs while at least one component is subscribed. The server
 * snapshot is null, so server-rendered HTML never contains a time that differs
 * from the client's first render (no hydration mismatch).
 */
let now = typeof window === 'undefined' ? 0 : Date.now();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function tick(): void {
  now = Date.now();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (!timer) {
    // React re-reads the snapshot after subscribing, so this refresh is picked up
    now = Date.now();
    timer = setInterval(tick, 1000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

const getSnapshot = (): number => now;
const getServerSnapshot = (): null => null;

/** Current time in ms, or null during server rendering and hydration */
export function useNow(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

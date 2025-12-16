'use client';

import { motion } from 'framer-motion';
import { Blocks } from 'lucide-react';

interface LoadingProps {
  text?: string;
  size?: 'small' | 'default' | 'large';
}

export function Loading({ text = 'Loading...', size = 'default' }: LoadingProps) {
  const sizes = {
    small: 'w-8 h-8',
    default: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  const iconSizes = {
    small: 'w-4 h-4',
    default: 'w-6 h-6',
    large: 'w-8 h-8',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className={`${sizes[size]} rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center`}
      >
        <Blocks className={`${iconSizes[size]} text-white`} />
      </motion.div>
      <p className="text-sm text-[var(--text-muted)]">{text}</p>
    </div>
  );
}

export function BlockSkeleton() {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-4">
        <div className="skeleton w-12 h-12 rounded-xl" />
        <div className="flex-1">
          <div className="skeleton h-5 w-32 mb-2" />
          <div className="skeleton h-4 w-48" />
        </div>
        <div className="hidden sm:flex gap-6">
          <div className="skeleton h-4 w-16" />
          <div className="skeleton h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

export function TransactionSkeleton() {
  return (
    <div className="card p-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex-1">
          <div className="skeleton h-5 w-48 mb-2" />
          <div className="skeleton h-3 w-32" />
        </div>
        <div className="skeleton h-8 w-40" />
        <div className="skeleton h-8 w-28" />
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="skeleton h-4 w-24 mb-2" />
          <div className="skeleton h-8 w-32 mb-1" />
          <div className="skeleton h-3 w-20" />
        </div>
        <div className="skeleton w-12 h-12 rounded-xl" />
      </div>
    </div>
  );
}



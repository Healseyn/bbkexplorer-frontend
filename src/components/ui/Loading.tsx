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

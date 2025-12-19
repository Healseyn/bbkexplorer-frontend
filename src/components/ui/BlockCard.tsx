'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Blocks, Clock, FileText } from 'lucide-react';
import { formatHash, formatTimeAgo, formatNumber } from '@/lib/api';
import type { Block } from '@/types';

interface BlockCardProps {
  block: Block;
  index?: number;
  compact?: boolean;
  now?: number; // Optional current timestamp in ms for real-time updates
}

export function BlockCard({ block, index = 0, compact = false, now }: BlockCardProps) {
  const confirmations = block.confirmations || 0;
  const isUnconfirmed = confirmations < 6;
  const confirmationText = isUnconfirmed ? `${confirmations}/6` : 'Confirmed';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/block/${block.height}`}>
        <div className={`card ${compact ? 'p-2.5' : 'p-3'} hover:bg-[var(--bg-hover)] group cursor-pointer`}>
          <div className="flex items-center gap-3">
            {/* Block Icon */}
            <div className={`${compact ? 'p-2' : 'p-2.5'} rounded-lg bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20 group-hover:from-[var(--accent-primary)]/30 group-hover:to-[var(--accent-secondary)]/30 transition-all duration-300`}>
              <Blocks className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-[var(--accent-primary)]`} />
            </div>

            {/* Block Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`${compact ? 'text-base' : 'text-lg'} font-semibold text-[var(--accent-primary)]`}>
                  #{formatNumber(block.height)}
                </span>
                {isUnconfirmed ? (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--accent-warning)]/10 text-[var(--accent-warning)]">
                    {confirmationText}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--accent-success)]/10 text-[var(--accent-success)]">
                    {confirmationText}
                  </span>
                )}
              </div>
              <p className={`hash-text ${compact ? 'text-xs' : 'text-sm'} truncate`}>{formatHash(block.hash, 10)}</p>
            </div>

            {/* Stats */}
            <div className="hidden sm:flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                <FileText className="w-3.5 h-3.5" />
                <span>{block.txCount} txs</span>
              </div>
              <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTimeAgo(block.timestamp, now)}</span>
              </div>
            </div>

            {/* Arrow indicator */}
            <div className="text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] group-hover:translate-x-1 transition-all duration-300">
              →
            </div>
          </div>

          {/* Mobile stats */}
          <div className="flex sm:hidden items-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span>{block.txCount} txs</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatTimeAgo(block.timestamp, now)}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}


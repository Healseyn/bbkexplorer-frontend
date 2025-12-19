'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2 } from 'lucide-react';
import { formatHash, formatTimeAgo, formatBBK, formatNumber } from '@/lib/api';
import type { Transaction } from '@/types';

interface TransactionRowProps {
  transaction: Transaction;
  index?: number;
}

export function TransactionRow({ transaction, index = 0 }: TransactionRowProps) {
  const confirmations = transaction.confirmations || 0;
  const isUnconfirmed = confirmations < 6;
  const confirmationText = isUnconfirmed ? `${confirmations}/6` : 'Confirmed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/tx/${transaction.txid}`}>
        <div className="card p-4 hover:bg-[var(--bg-hover)] cursor-pointer group">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* TXID and Status */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="hash-text font-medium">{formatHash(transaction.txid, 16)}</span>
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
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <Clock className="w-3 h-3" />
                <span>{formatTimeAgo(transaction.timestamp)}</span>
                {transaction.blockHeight && (
                  <>
                    <span>•</span>
                    <span>Block #{formatNumber(transaction.blockHeight)}</span>
                  </>
                )}
                {confirmations > 0 && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {formatNumber(confirmations)} confirmations
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Amount */}
            <div className="flex items-center gap-6 text-right">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {formatBBK(transaction.totalOutput)} BBK
                </p>
              </div>
              <div className="text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] group-hover:translate-x-1 transition-all duration-300">
                →
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}


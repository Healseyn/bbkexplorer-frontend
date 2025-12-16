'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';
import { formatHash, formatTimeAgo, formatBBK } from '@/lib/api';
import type { Transaction } from '@/types';

interface TransactionRowProps {
  transaction: Transaction;
  index?: number;
}

export function TransactionRow({ transaction, index = 0 }: TransactionRowProps) {
  const inputAddresses = transaction.inputs
    .map((i) => i.address)
    .filter(Boolean)
    .slice(0, 2);
  const outputAddresses = transaction.outputs
    .map((o) => o.address)
    .filter(Boolean)
    .slice(0, 2);

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
                <span className="hash-text font-medium">{formatHash(transaction.txid, 10)}</span>
                {transaction.confirmed ? (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--accent-success)]/10 text-[var(--accent-success)]">
                    Confirmed
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--accent-warning)]/10 text-[var(--accent-warning)]">
                    Pending
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <Clock className="w-3 h-3" />
                <span>{formatTimeAgo(transaction.timestamp)}</span>
                {transaction.blockHeight && (
                  <>
                    <span>•</span>
                    <span>Block #{transaction.blockHeight}</span>
                  </>
                )}
              </div>
            </div>

            {/* Addresses Flow */}
            <div className="flex items-center gap-2 text-sm">
              <div className="flex flex-col items-end gap-1">
                {inputAddresses.length > 0 ? (
                  inputAddresses.map((addr, i) => (
                    <span key={i} className="hash-text text-xs">
                      {formatHash(addr!, 6)}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[var(--accent-warning)]">Coinbase</span>
                )}
                {transaction.inputs.length > 2 && (
                  <span className="text-xs text-[var(--text-muted)]">
                    +{transaction.inputs.length - 2} more
                  </span>
                )}
              </div>

              <ArrowRight className="w-4 h-4 text-[var(--accent-primary)] flex-shrink-0" />

              <div className="flex flex-col items-start gap-1">
                {outputAddresses.map((addr, i) => (
                  <span key={i} className="hash-text text-xs">
                    {formatHash(addr!, 6)}
                  </span>
                ))}
                {transaction.outputs.length > 2 && (
                  <span className="text-xs text-[var(--text-muted)]">
                    +{transaction.outputs.length - 2} more
                  </span>
                )}
              </div>
            </div>

            {/* Amount and Fee */}
            <div className="flex items-center gap-4 lg:gap-6">
              <div className="text-right">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {formatBBK(transaction.totalOutput)} BBK
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Fee: {transaction.fee.toLocaleString()} sats
                </p>
              </div>

              {/* Arrow */}
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


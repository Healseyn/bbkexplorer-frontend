'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

import { TransactionSkeleton } from '@/components/ui';
import { getLatestTransactions, formatNumber, formatHash, formatTimeAgo, formatBBK } from '@/lib/api';
import type { Transaction } from '@/types';

export default function TransactionsPage() {
  const [now, setNow] = useState(Date.now());

  // Update "now" every second for real-time timestamps
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Get latest transactions from the recent endpoint - otimizado para 15 segundos (mesmo intervalo dos blocos)
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['latestTransactions'],
    queryFn: () => getLatestTransactions(12),
    staleTime: 15000, // Cache for 15s
    refetchInterval: 15000, // Refresh every 15s (same as blocks)
  });

  const transactionsList = Array.isArray(transactions) ? transactions : [];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20">
              <Activity className="w-8 h-8 text-[var(--accent-primary)]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
                Transactions
              </h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Latest transactions from mempool and recent blocks
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transactions List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          {isLoading ? (
            Array.from({ length: 12 }).map((_, i) => <TransactionSkeleton key={i} />)
          ) : transactionsList.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-[var(--text-muted)]">No transactions found.</p>
            </div>
          ) : (
            transactionsList.map((tx, index) => {
              const confirmations = tx.confirmations || 0;
              const isUnconfirmed = confirmations < 6;
              const confirmationText = isUnconfirmed ? `${confirmations}/6` : 'Confirmed';

              return (
                <Link key={tx.txid} href={`/tx/${tx.txid}`}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="card p-4 hover:bg-[var(--bg-hover)] cursor-pointer group"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* TXID and Status */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="hash-text font-medium">{formatHash(tx.txid, 16)}</span>
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
                          <span>{formatTimeAgo(tx.timestamp, now)}</span>
                          {tx.blockHeight && (
                            <>
                              <span>•</span>
                              <span>Block #{formatNumber(tx.blockHeight)}</span>
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
                          {formatBBK(tx.totalOutput)} BBK
                        </p>
                      </div>
                      <div className="text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] group-hover:translate-x-1 transition-all">
                        →
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
            })
          )}
        </motion.div>

        {/* Info */}
        <div className="mt-8 text-center text-sm text-[var(--text-muted)]">
          <p>Showing latest transactions. Transactions are updated every 15 seconds.</p>
        </div>
      </section>
    </div>
  );
}




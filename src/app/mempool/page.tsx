'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Wallet, Clock, Zap, Database, AlertCircle } from 'lucide-react';

import { StatsCard, TransactionSkeleton } from '@/components/ui';
import { getMempoolTransactions, formatNumber, formatBytes, formatHash, formatTimeAgo } from '@/lib/api';

// Mock data for development
const mockMempoolStats = {
  size: 34521,
  bytes: 156789012,
  avgFee: 12500,
  minFee: 1000,
};

const mockMempoolTxs = {
  data: Array.from({ length: 20 }, (_, i) => ({
    txid: `mempool${i}b2c3d4e5f67890123456789012345678901bcdef23456789012bcdef`,
    size: Math.floor(Math.random() * 500) + 200,
    fee: Math.floor(Math.random() * 50000) + 1000,
    feeRate: Math.random() * 100 + 1,
    timestamp: Date.now() / 1000 - i * 30,
  })),
  total: 34521,
  page: 1,
  pageSize: 20,
  hasMore: true,
};

export default function MempoolPage() {
  const { data: mempoolData, isLoading } = useQuery({
    queryKey: ['mempool'],
    queryFn: () => getMempoolTransactions(1, 20),
    placeholderData: mockMempoolTxs,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[var(--accent-warning)]/20 to-[var(--accent-primary)]/20 animate-pulse-glow">
              <Wallet className="w-8 h-8 text-[var(--accent-warning)]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
                Mempool
              </h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Unconfirmed transactions waiting to be included in a block
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Pending Transactions"
            value={formatNumber(mockMempoolStats.size)}
            icon={AlertCircle}
            delay={0}
          />
          <StatsCard
            title="Mempool Size"
            value={formatBytes(mockMempoolStats.bytes)}
            icon={Database}
            delay={0.1}
          />
          <StatsCard
            title="Average Fee"
            value={`${formatNumber(mockMempoolStats.avgFee)} sats`}
            icon={Zap}
            delay={0.2}
          />
          <StatsCard
            title="Minimum Fee"
            value={`${formatNumber(mockMempoolStats.minFee)} sats`}
            icon={Zap}
            delay={0.3}
          />
        </div>

        {/* Mempool Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Pending Transactions
          </h2>

          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => <TransactionSkeleton key={i} />)
            ) : (
              mempoolData?.data.map((tx, index) => (
                <motion.div
                  key={tx.txid}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link href={`/tx/${tx.txid}`}>
                    <div className="card p-4 hover:bg-[var(--bg-hover)] cursor-pointer group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-[var(--accent-warning)]/10">
                            <AlertCircle className="w-5 h-5 text-[var(--accent-warning)]" />
                          </div>
                          <div>
                            <span className="hash-text font-medium">{formatHash(tx.txid, 12)}</span>
                            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatTimeAgo(tx.timestamp)}</span>
                              <span>•</span>
                              <span>{formatBytes(tx.size)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-[var(--text-primary)]">
                            {formatNumber(tx.fee)} sats
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {tx.feeRate.toFixed(1)} sat/vB
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>

          {mempoolData?.hasMore && (
            <div className="mt-6 text-center">
              <button className="px-6 py-3 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all">
                Load more
              </button>
            </div>
          )}
        </motion.div>

        {/* Info box */}
        <div className="mt-8 card p-6 bg-[var(--accent-primary)]/5 border-[var(--accent-primary)]/20">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            About the Mempool
          </h3>
          <p className="text-sm text-[var(--text-muted)]">
            The mempool is where all valid transactions wait to be confirmed by miners.
            Transactions with higher fees are typically confirmed faster as miners prioritize
            them for inclusion in the next block. The mempool size fluctuates based on
            network activity and block production rate.
          </p>
        </div>
      </section>
    </div>
  );
}



'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

import { TransactionRow, TransactionSkeleton } from '@/components/ui';
import { getLatestTransactions, formatNumber } from '@/lib/api';

// Mock data for development
const mockTransactions = Array.from({ length: 20 }, (_, i) => ({
  txid: `tx${i}b2c3d4e5f67890123456789012345678901bcdef23456789012bcdef234567`,
  blockHash: '0000...',
  blockHeight: 823456 - Math.floor(i / 3),
  timestamp: Date.now() / 1000 - i * 120,
  size: Math.floor(Math.random() * 500) + 200,
  weight: Math.floor(Math.random() * 1500) + 500,
  fee: Math.floor(Math.random() * 20000) + 1000,
  feeRate: Math.random() * 50 + 5,
  confirmed: i < 18,
  inputs: [
    { txid: `prev${i}`, vout: 0, address: `bc1q${i}ar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq`, value: 100000000 + i * 1000000, sequence: 4294967295 },
  ],
  outputs: [
    { n: 0, address: `bc1q${i}34aq5drpuwy3wgl9lhup9892qp6svr8ldzyy7c`, value: 90000000 + i * 900000, scriptPubKey: '0014...', spent: false },
  ],
  totalInput: 100000000 + i * 1000000,
  totalOutput: 90000000 + i * 900000,
}));

export default function TransactionsPage() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['latestTransactions', 20],
    queryFn: () => getLatestTransactions(20),
    placeholderData: mockTransactions,
  });

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
                Recent Transactions
              </h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Latest confirmed and pending transactions
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
            Array.from({ length: 10 }).map((_, i) => <TransactionSkeleton key={i} />)
          ) : (
            transactions?.map((tx, index) => (
              <TransactionRow key={tx.txid} transaction={tx} index={index} />
            ))
          )}
        </motion.div>

        {/* Note about real-time updates */}
        <div className="mt-8 text-center text-sm text-[var(--text-muted)]">
          <p>Transactions are updated in real-time from the mempool and recent blocks.</p>
        </div>
      </section>
    </div>
  );
}



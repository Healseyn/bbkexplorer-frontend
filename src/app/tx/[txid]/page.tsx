'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Clock,
  Hash,
  Database,
  Zap,
  Copy,
  Check,
  CheckCircle,
  AlertCircle,
  Blocks,
} from 'lucide-react';
import { useState } from 'react';

import { Loading } from '@/components/ui';
import { getTransaction, formatNumber, formatDate, formatBytes, formatHash, formatBTC } from '@/lib/api';

// Mock data for development
const mockTransaction = {
  txid: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
  blockHash: '0000000000000000000234abc567def890123456789abcdef0123456789abcdef',
  blockHeight: 823456,
  timestamp: Date.now() / 1000 - 3600,
  size: 456,
  weight: 876,
  fee: 8900,
  feeRate: 23.5,
  confirmed: true,
  inputs: [
    { txid: 'prev1abc456def789012345678901234567890abcdef1234567890abcdef12345', vout: 0, address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', value: 50000000, scriptSig: '47304402...', sequence: 4294967295 },
    { txid: 'prev2def789012345678901234567890abcdef1234567890abcdef123456789012', vout: 1, address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', value: 75000000, scriptSig: '483045...', sequence: 4294967295 },
  ],
  outputs: [
    { n: 0, address: 'bc1q34aq5drpuwy3wgl9lhup9892qp6svr8ldzyy7c', value: 110000000, scriptPubKey: '0014...', spent: false },
    { n: 1, address: 'bc1qgdjqv0av3q56jvd82tkdjpy7gdp9ut8tlqmgrpmv24sq90ecnvqqjwvw97', value: 14991100, scriptPubKey: '0020...', spent: true, spentBy: 'spent123abc456def...' },
  ],
  totalInput: 125000000,
  totalOutput: 124991100,
};

export default function TransactionDetailPage() {
  const params = useParams();
  const txid = params.txid as string;
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Fetch transaction details
  const { data: tx, isLoading } = useQuery({
    queryKey: ['transaction', txid],
    queryFn: () => getTransaction(txid),
    placeholderData: mockTransaction,
  });

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading text="Loading transaction details..." size="large" />
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Transaction Not Found</h1>
          <p className="text-[var(--text-muted)] mb-4">The transaction you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/" className="text-[var(--accent-primary)] hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-4">
            <Link href="/" className="hover:text-[var(--accent-primary)] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/transactions" className="hover:text-[var(--accent-primary)] transition-colors">
              Transactions
            </Link>
            <span>/</span>
            <span className="text-[var(--text-primary)]">{formatHash(tx.txid, 8)}</span>
          </div>

          {/* Transaction Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${tx.confirmed ? 'bg-[var(--accent-success)]/20' : 'bg-[var(--accent-warning)]/20'}`}>
                {tx.confirmed ? (
                  <CheckCircle className="w-8 h-8 text-[var(--accent-success)]" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-[var(--accent-warning)]" />
                )}
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
                  Transaction
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  {tx.confirmed ? (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--accent-success)]/10 text-[var(--accent-success)]">
                      Confirmed
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--accent-warning)]/10 text-[var(--accent-warning)]">
                      Pending
                    </span>
                  )}
                  {tx.blockHeight && (
                    <Link
                      href={`/block/${tx.blockHeight}`}
                      className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--accent-primary)]"
                    >
                      <Blocks className="w-3 h-3" />
                      Block #{formatNumber(tx.blockHeight)}
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Amount */}
            <div className="text-right">
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {formatBTC(tx.totalOutput)} <span className="text-[var(--accent-primary)]">BTC</span>
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                Fee: {formatNumber(tx.fee)} sats ({tx.feeRate.toFixed(1)} sat/vB)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transaction Details */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TXID */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card p-6 mb-6"
        >
          <label className="text-sm text-[var(--text-muted)] block mb-2">Transaction ID</label>
          <div className="flex items-center gap-2 p-3 bg-[var(--bg-tertiary)] rounded-lg">
            <span className="hash-text flex-1 break-all">{tx.txid}</span>
            <button
              onClick={() => copyToClipboard(tx.txid, 'txid')}
              className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-all"
            >
              {copiedField === 'txid' ? (
                <Check className="w-4 h-4 text-[var(--accent-success)]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="card p-4">
            <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Timestamp</span>
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{formatDate(tx.timestamp)}</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
              <Database className="w-4 h-4" />
              <span className="text-xs">Size</span>
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{formatBytes(tx.size)}</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
              <Hash className="w-4 h-4" />
              <span className="text-xs">Weight</span>
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{formatNumber(tx.weight)} WU</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xs">Fee Rate</span>
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{tx.feeRate.toFixed(1)} sat/vB</p>
          </div>
        </motion.div>

        {/* Inputs and Outputs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Inputs & Outputs</h2>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Inputs */}
            <div>
              <h3 className="text-sm font-medium text-[var(--text-muted)] mb-4">
                Inputs ({tx.inputs.length})
              </h3>
              <div className="space-y-3">
                {tx.inputs.length === 0 ? (
                  <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
                    <span className="text-[var(--accent-warning)]">Coinbase (Newly Generated Coins)</span>
                  </div>
                ) : (
                  tx.inputs.map((input, index) => (
                    <div key={index} className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-[var(--text-muted)]">#{index}</span>
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                          {formatBTC(input.value)} BTC
                        </span>
                      </div>
                      {input.address ? (
                        <Link
                          href={`/address/${input.address}`}
                          className="hash-text text-sm hover:underline block truncate"
                        >
                          {input.address}
                        </Link>
                      ) : (
                        <span className="text-sm text-[var(--text-muted)]">Unknown</span>
                      )}
                      <div className="mt-2 text-xs text-[var(--text-muted)]">
                        <Link href={`/tx/${input.txid}`} className="hover:text-[var(--accent-primary)]">
                          {formatHash(input.txid, 10)}:{input.vout}
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 p-3 bg-[var(--bg-tertiary)] rounded-lg text-right">
                <span className="text-sm text-[var(--text-muted)]">Total Input: </span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {formatBTC(tx.totalInput)} BTC
                </span>
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden lg:flex items-center justify-center absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
              <ArrowRight className="w-6 h-6 text-[var(--accent-primary)]" />
            </div>

            {/* Outputs */}
            <div>
              <h3 className="text-sm font-medium text-[var(--text-muted)] mb-4">
                Outputs ({tx.outputs.length})
              </h3>
              <div className="space-y-3">
                {tx.outputs.map((output, index) => (
                  <div key={index} className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[var(--text-muted)]">#{output.n}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                          {formatBTC(output.value)} BTC
                        </span>
                        {output.spent ? (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--accent-error)]/10 text-[var(--accent-error)]">
                            Spent
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--accent-success)]/10 text-[var(--accent-success)]">
                            Unspent
                          </span>
                        )}
                      </div>
                    </div>
                    {output.address ? (
                      <Link
                        href={`/address/${output.address}`}
                        className="hash-text text-sm hover:underline block truncate"
                      >
                        {output.address}
                      </Link>
                    ) : (
                      <span className="text-sm text-[var(--text-muted)]">OP_RETURN</span>
                    )}
                    {output.spentBy && (
                      <div className="mt-2 text-xs text-[var(--text-muted)]">
                        Spent by:{' '}
                        <Link href={`/tx/${output.spentBy}`} className="hover:text-[var(--accent-primary)]">
                          {formatHash(output.spentBy, 10)}
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-[var(--bg-tertiary)] rounded-lg text-right">
                <span className="text-sm text-[var(--text-muted)]">Total Output: </span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {formatBTC(tx.totalOutput)} BTC
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}



'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Blocks,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Hash,
  Database,
  Cpu,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';
import { useState } from 'react';

import { TransactionRow, Loading, TransactionSkeleton } from '@/components/ui';
import { getBlock, getBlockTransactions, formatNumber, formatDate, formatBytes, formatHash } from '@/lib/api';

// Mock data for development
const mockBlock = {
  hash: '0000000000000000000234abc567def890123456789abcdef0123456789abcdef',
  height: 823456,
  timestamp: Date.now() / 1000 - 120,
  txCount: 2345,
  size: 1456789,
  weight: 3999234,
  version: 536870912,
  merkleRoot: 'abc123def456789012345678901234567890abcdef1234567890abcdef123456',
  previousBlockHash: '0000000000000000000123abc456def789012345678abcdef9012345678abcdef',
  nonce: 12345678,
  bits: '17034219',
  difficulty: 72006146478567.1,
  miner: 'F2Pool',
  reward: 625000000,
};

const mockTransactions = {
  data: [
    { txid: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456', blockHash: '0000...', blockHeight: 823456, timestamp: Date.now() / 1000 - 45, size: 234, weight: 654, fee: 0, feeRate: 0, confirmed: true, inputs: [], outputs: [{ n: 0, address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', value: 625000000, scriptPubKey: '76a914...', spent: false }], totalInput: 0, totalOutput: 625000000 },
    { txid: 'b2c3d4e5f67890123456789012345678901bcdef23456789012bcdef234567', blockHash: '0000...', blockHeight: 823456, timestamp: Date.now() / 1000 - 120, size: 456, weight: 876, fee: 8900, feeRate: 23.5, confirmed: true, inputs: [{ txid: 'prev2', vout: 1, address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', value: 120000000, sequence: 4294967295 }], outputs: [{ n: 0, address: 'bc1q34aq5drpuwy3wgl9lhup9892qp6svr8ldzyy7c', value: 110000000, scriptPubKey: '0014...', spent: false }], totalInput: 120000000, totalOutput: 110000000 },
    { txid: 'c3d4e5f678901234567890123456789012cdef345678901234cdef3456789', blockHash: '0000...', blockHeight: 823456, timestamp: Date.now() / 1000 - 300, size: 678, weight: 1234, fee: 15600, feeRate: 34.2, confirmed: true, inputs: [{ txid: 'prev3', vout: 0, address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2', value: 250000000, sequence: 4294967295 }], outputs: [{ n: 0, address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', value: 234000000, scriptPubKey: '0014...', spent: false }], totalInput: 250000000, totalOutput: 234000000 },
  ],
  total: 2345,
  page: 1,
  pageSize: 20,
  hasMore: true,
};

export default function BlockDetailPage() {
  const params = useParams();
  const hashOrHeight = params.hashOrHeight as string;
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Fetch block details
  const { data: block, isLoading: blockLoading } = useQuery({
    queryKey: ['block', hashOrHeight],
    queryFn: () => getBlock(hashOrHeight),
    placeholderData: mockBlock,
  });

  // Fetch block transactions
  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['blockTransactions', hashOrHeight],
    queryFn: () => getBlockTransactions(hashOrHeight),
    placeholderData: mockTransactions,
  });

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (blockLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading text="Loading block details..." size="large" />
      </div>
    );
  }

  if (!block) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Block Not Found</h1>
          <p className="text-[var(--text-muted)] mb-4">The block you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/" className="text-[var(--accent-primary)] hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const detailItems = [
    { label: 'Timestamp', value: formatDate(block.timestamp), icon: Clock },
    { label: 'Transactions', value: formatNumber(block.txCount), icon: FileText },
    { label: 'Size', value: formatBytes(block.size), icon: Database },
    { label: 'Weight', value: `${formatNumber(block.weight)} WU`, icon: Database },
    { label: 'Difficulty', value: block.difficulty.toExponential(2), icon: Cpu },
    { label: 'Version', value: `0x${block.version.toString(16)}`, icon: Hash },
    { label: 'Nonce', value: formatNumber(block.nonce), icon: Hash },
    { label: 'Bits', value: block.bits, icon: Hash },
  ];

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
            <Link href="/blocks" className="hover:text-[var(--accent-primary)] transition-colors">
              Blocks
            </Link>
            <span>/</span>
            <span className="text-[var(--text-primary)]">#{formatNumber(block.height)}</span>
          </div>

          {/* Block Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20">
                <Blocks className="w-8 h-8 text-[var(--accent-primary)]" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
                  Block #{formatNumber(block.height)}
                </h1>
                {block.miner && (
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    Mined by <span className="text-[var(--accent-primary)]">{block.miner}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Link
                href={`/block/${block.height - 1}`}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Link>
              <Link
                href={`/block/${block.height + 1}`}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Block Details */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Block Details</h2>

          {/* Hash Fields */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-sm text-[var(--text-muted)] block mb-1">Block Hash</label>
              <div className="flex items-center gap-2 p-3 bg-[var(--bg-tertiary)] rounded-lg">
                <span className="hash-text flex-1 break-all">{block.hash}</span>
                <button
                  onClick={() => copyToClipboard(block.hash, 'hash')}
                  className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-all"
                >
                  {copiedField === 'hash' ? (
                    <Check className="w-4 h-4 text-[var(--accent-success)]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-[var(--text-muted)] block mb-1">Merkle Root</label>
              <div className="flex items-center gap-2 p-3 bg-[var(--bg-tertiary)] rounded-lg">
                <span className="hash-text flex-1 break-all">{block.merkleRoot}</span>
                <button
                  onClick={() => copyToClipboard(block.merkleRoot, 'merkle')}
                  className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-all"
                >
                  {copiedField === 'merkle' ? (
                    <Check className="w-4 h-4 text-[var(--accent-success)]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-[var(--text-muted)] block mb-1">Previous Block Hash</label>
              <div className="flex items-center gap-2 p-3 bg-[var(--bg-tertiary)] rounded-lg">
                <Link
                  href={`/block/${block.previousBlockHash}`}
                  className="hash-text flex-1 break-all hover:underline"
                >
                  {block.previousBlockHash}
                </Link>
                <ArrowRight className="w-4 h-4 text-[var(--accent-primary)]" />
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {detailItems.map((item) => (
              <div
                key={item.label}
                className="p-4 bg-[var(--bg-tertiary)] rounded-lg"
              >
                <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
                  <item.icon className="w-4 h-4" />
                  <span className="text-xs">{item.label}</span>
                </div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Transactions ({formatNumber(txData?.total || 0)})
            </h2>
          </div>

          <div className="space-y-3">
            {txLoading ? (
              <>
                <TransactionSkeleton />
                <TransactionSkeleton />
                <TransactionSkeleton />
              </>
            ) : (
              txData?.data.map((tx, index) => (
                <TransactionRow key={tx.txid} transaction={tx} index={index} />
              ))
            )}
          </div>

          {txData?.hasMore && (
            <div className="mt-6 text-center">
              <Link
                href={`/block/${hashOrHeight}/transactions`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
              >
                View all transactions
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
}



'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useState } from 'react';

import { Loading, TransactionSkeleton } from '@/components/ui';
import { getAddress, getAddressTransactions, formatNumber, formatBTC, formatHash, formatDate } from '@/lib/api';

// Mock data for development
const mockAddress = {
  address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
  balance: 156789012345,
  totalReceived: 256789012345,
  totalSent: 100000000000,
  txCount: 234,
  unconfirmedBalance: 0,
  unconfirmedTxCount: 0,
};

const mockAddressTransactions = {
  data: [
    { txid: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456', timestamp: Date.now() / 1000 - 3600, blockHeight: 823456, confirmed: true, value: 50000000, balance: 156789012345 },
    { txid: 'b2c3d4e5f67890123456789012345678901bcdef23456789012bcdef234567', timestamp: Date.now() / 1000 - 7200, blockHeight: 823400, confirmed: true, value: -25000000, balance: 156739012345 },
    { txid: 'c3d4e5f678901234567890123456789012cdef345678901234cdef3456789', timestamp: Date.now() / 1000 - 86400, blockHeight: 823000, confirmed: true, value: 100000000, balance: 156764012345 },
    { txid: 'd4e5f6789012345678901234567890123def456789012345def45678901234', timestamp: Date.now() / 1000 - 172800, blockHeight: 822500, confirmed: true, value: -75000000, balance: 156664012345 },
  ],
  total: 234,
  page: 1,
  pageSize: 20,
  hasMore: true,
};

export default function AddressDetailPage() {
  const params = useParams();
  const address = params.address as string;
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Fetch address details
  const { data: addressData, isLoading: addressLoading } = useQuery({
    queryKey: ['address', address],
    queryFn: () => getAddress(address),
    placeholderData: mockAddress,
  });

  // Fetch address transactions
  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['addressTransactions', address],
    queryFn: () => getAddressTransactions(address),
    placeholderData: mockAddressTransactions,
  });

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (addressLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading text="Loading address details..." size="large" />
      </div>
    );
  }

  if (!addressData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Address Not Found</h1>
          <p className="text-[var(--text-muted)] mb-4">The address you&apos;re looking for doesn&apos;t exist.</p>
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
            <span className="text-[var(--text-primary)]">Address</span>
          </div>

          {/* Address Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20">
                <Wallet className="w-8 h-8 text-[var(--accent-primary)]" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
                  Address
                </h1>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  {formatNumber(addressData.txCount)} transactions
                </p>
              </div>
            </div>

            {/* Balance */}
            <div className="text-right">
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {formatBTC(addressData.balance)} <span className="text-[var(--accent-primary)]">BTC</span>
              </p>
              {addressData.unconfirmedBalance !== 0 && (
                <p className="text-sm text-[var(--accent-warning)]">
                  +{formatBTC(addressData.unconfirmedBalance)} pending
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Address Details */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card p-6 mb-6"
        >
          <label className="text-sm text-[var(--text-muted)] block mb-2">Address</label>
          <div className="flex items-center gap-2 p-3 bg-[var(--bg-tertiary)] rounded-lg">
            <span className="hash-text flex-1 break-all">{addressData.address}</span>
            <button
              onClick={() => copyToClipboard(addressData.address, 'address')}
              className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-all"
            >
              {copiedField === 'address' ? (
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
              <Wallet className="w-4 h-4" />
              <span className="text-xs">Balance</span>
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{formatBTC(addressData.balance)} BTC</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-[var(--accent-success)] mb-1">
              <ArrowDownLeft className="w-4 h-4" />
              <span className="text-xs">Total Received</span>
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{formatBTC(addressData.totalReceived)} BTC</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-[var(--accent-error)] mb-1">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-xs">Total Sent</span>
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{formatBTC(addressData.totalSent)} BTC</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Transactions</span>
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{formatNumber(addressData.txCount)}</p>
          </div>
        </motion.div>

        {/* Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">
            Transactions ({formatNumber(txData?.total || 0)})
          </h2>

          <div className="space-y-3">
            {txLoading ? (
              <>
                <TransactionSkeleton />
                <TransactionSkeleton />
                <TransactionSkeleton />
              </>
            ) : (
              txData?.data.map((tx) => (
                <Link key={tx.txid} href={`/tx/${tx.txid}`}>
                  <div className="card p-4 hover:bg-[var(--bg-hover)] cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${tx.value > 0 ? 'bg-[var(--accent-success)]/10' : 'bg-[var(--accent-error)]/10'}`}>
                          {tx.value > 0 ? (
                            <TrendingUp className="w-5 h-5 text-[var(--accent-success)]" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-[var(--accent-error)]" />
                          )}
                        </div>
                        <div>
                          <span className="hash-text font-medium">{formatHash(tx.txid, 10)}</span>
                          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(tx.timestamp)}</span>
                            {tx.blockHeight && (
                              <>
                                <span>•</span>
                                <span>Block #{formatNumber(tx.blockHeight)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${tx.value > 0 ? 'text-[var(--accent-success)]' : 'text-[var(--accent-error)]'}`}>
                          {tx.value > 0 ? '+' : ''}{formatBTC(Math.abs(tx.value))} BTC
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          Balance: {formatBTC(tx.balance)} BTC
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {txData?.hasMore && (
            <div className="mt-6 text-center">
              <button className="px-6 py-3 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all">
                Load more transactions
              </button>
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
}



'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'next/navigation';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

import { Loading, TransactionSkeleton } from '@/components/ui';
import { getAddress, formatNumber, formatBBKDirect, formatHash, formatDate } from '@/lib/api';

export default function AddressDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const address = params.address as string;
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Get pagination from URL params
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  // Fetch address details with transactions (includes pagination)
  const { data: addressData, isLoading: addressLoading } = useQuery({
    queryKey: ['address', address, currentPage, limit],
    queryFn: () => getAddress(address, currentPage, limit),
  });

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    return `/address/${address}?${params.toString()}`;
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

  const { transactions, pagination } = addressData;

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
                  {formatNumber(addressData.transactionCount)} transactions
                </p>
              </div>
            </div>

            {/* Balance */}
            <div className="text-right">
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {formatBBKDirect(addressData.balance)} <span className="text-[var(--accent-primary)]">BBK</span>
              </p>
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
            <p className="text-sm font-medium text-[var(--text-primary)]">{formatBBKDirect(addressData.balance)} BBK</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-[var(--accent-success)] mb-1">
              <ArrowDownLeft className="w-4 h-4" />
              <span className="text-xs">Total Received</span>
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{formatBBKDirect(addressData.received)} BBK</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-[var(--accent-error)] mb-1">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-xs">Total Sent</span>
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{formatBBKDirect(addressData.sent)} BBK</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Transactions</span>
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{formatNumber(addressData.transactionCount)}</p>
          </div>
        </motion.div>

        {/* Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">
            Transactions ({formatNumber(pagination.total)})
          </h2>

          <div className="space-y-3">
            {addressLoading ? (
              <>
                <TransactionSkeleton />
                <TransactionSkeleton />
                <TransactionSkeleton />
              </>
            ) : transactions.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-[var(--text-muted)]">No transactions found for this address.</p>
              </div>
            ) : (
              transactions.map((tx) => {
                const isReceived = tx.type === 'received' || tx.type === 'both';
                const isSent = tx.type === 'sent' || tx.type === 'both';
                
                return (
                  <Link key={tx.txid} href={`/tx/${tx.txid}`}>
                    <div className="card p-4 hover:bg-[var(--bg-hover)] cursor-pointer group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${
                            isReceived && !isSent 
                              ? 'bg-[var(--accent-success)]/10' 
                              : isSent && !isReceived
                              ? 'bg-[var(--accent-error)]/10'
                              : 'bg-[var(--accent-primary)]/10'
                          }`}>
                            {isReceived && !isSent ? (
                              <TrendingUp className="w-5 h-5 text-[var(--accent-success)]" />
                            ) : isSent && !isReceived ? (
                              <TrendingDown className="w-5 h-5 text-[var(--accent-error)]" />
                            ) : (
                              <ArrowDownLeft className="w-5 h-5 text-[var(--accent-primary)]" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="hash-text font-medium">{formatHash(tx.txid, 10)}</span>
                              {tx.type === 'both' && (
                                <span className="text-xs px-2 py-0.5 rounded bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]">
                                  Both
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatDate(tx.time)}</span>
                              {tx.blockHeight && (
                                <>
                                  <span>•</span>
                                  <span>Block #{formatNumber(tx.blockHeight)}</span>
                                </>
                              )}
                              {tx.confirmations !== undefined && (
                                <>
                                  <span>•</span>
                                  <span>{tx.confirmations} confirmations</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${
                            isReceived && !isSent
                              ? 'text-[var(--accent-success)]'
                              : isSent && !isReceived
                              ? 'text-[var(--accent-error)]'
                              : 'text-[var(--accent-primary)]'
                          }`}>
                            {isReceived && !isSent ? '+' : ''}
                            {formatBBKDirect(Math.abs(tx.value))} BBK
                          </p>
                          <p className="text-xs text-[var(--text-muted)] capitalize">
                            {tx.type}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Link
                href={getPageUrl(Math.max(1, pagination.page - 1))}
                className={`p-2 rounded-lg ${
                  pagination.page <= 1
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-[var(--bg-hover)]'
                }`}
                onClick={(e) => {
                  if (pagination.page <= 1) e.preventDefault();
                }}
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              
              <span className="text-sm text-[var(--text-muted)] px-4">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <Link
                href={getPageUrl(Math.min(pagination.totalPages, pagination.page + 1))}
                className={`p-2 rounded-lg ${
                  pagination.page >= pagination.totalPages
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-[var(--bg-hover)]'
                }`}
                onClick={(e) => {
                  if (pagination.page >= pagination.totalPages) e.preventDefault();
                }}
              >
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
}



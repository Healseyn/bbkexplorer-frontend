'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Blocks,
  Activity,
  TrendingUp,
  Clock,
  Database,
  Cpu,
  ArrowRight,
  Zap,
  Server,
} from 'lucide-react';

import { SearchBar, StatsCard, BlockCard, TransactionRow, StatsSkeleton, BlockSkeleton, TransactionSkeleton, LiveBlockTicker } from '@/components/ui';
import { getNetworkStats, getLatestBlocks, getLatestTransactions, formatNumber, formatBytes } from '@/lib/api';
import { mockStats, mockBlocks, mockTransactions } from '@/lib/mock-data';

export default function HomePage() {
  // Fetch network stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['networkStats'],
    queryFn: getNetworkStats,
    placeholderData: mockStats,
  });

  // Fetch latest blocks
  const { data: blocks, isLoading: blocksLoading } = useQuery({
    queryKey: ['latestBlocks'],
    queryFn: () => getLatestBlocks(5),
    placeholderData: mockBlocks,
  });

  // Fetch latest transactions
  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: ['latestTransactions'],
    queryFn: () => getLatestTransactions(5),
    placeholderData: mockTransactions,
  });

  return (
    <div className="min-h-screen">
      <LiveBlockTicker initialBlocks={blocks || mockBlocks} />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[var(--gradient-glow)] opacity-50" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="glow-text">BitBlocks</span>{' '}
              <span className="text-[var(--text-primary)]">Explorer (BBK)</span>
            </h1>
            <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
              Explore the BitBlocks blockchain with our open-source explorer.
              Track blocks, transactions, masternodes, and addresses with ease.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <SearchBar size="large" />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsLoading ? (
            <>
              <StatsSkeleton />
              <StatsSkeleton />
              <StatsSkeleton />
              <StatsSkeleton />
            </>
          ) : (
            <>
              <StatsCard
                title="Block Height"
                value={formatNumber(stats?.blockHeight || 0)}
                icon={Blocks}
                delay={0}
              />
              <StatsCard
                title="Masternodes"
                value={formatNumber(stats?.masternodes || 0)}
                icon={Server}
                delay={0.1}
              />
              <StatsCard
                title="Hash Rate"
                value={stats?.hashRate || '0 H/s'}
                icon={Cpu}
                delay={0.2}
              />
              <StatsCard
                title="Avg Block Time"
                value={`${stats?.avgBlockTime?.toFixed(1) || 0}s`}
                icon={Clock}
                delay={0.3}
              />
            </>
          )}
        </div>

        {/* Secondary Stats */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="BBK Price"
            value={`$${stats?.price?.toFixed(4) || '0.0000'}`}
            trend={stats?.priceChange24h ? { value: stats.priceChange24h, isPositive: stats.priceChange24h > 0 } : undefined}
            icon={TrendingUp}
            delay={0.4}
          />
           <StatsCard
            title="Mempool Size"
            value={formatNumber(stats?.mempoolSize || 0)}
            subtitle={formatBytes(stats?.mempoolBytes || 0)}
            icon={Database}
            delay={0.5}
          />
          <StatsCard
            title="Avg Fee"
            value={`${formatNumber(stats?.avgFee || 0)} sats`}
            icon={Zap}
            delay={0.6}
          />
          <StatsCard
            title="Transactions"
            value={formatNumber(stats?.totalTransactions || 0)}
            subtitle="All time"
            icon={Activity}
            delay={0.7}
          />
        </div>
      </section>

      {/* Latest Blocks and Transactions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Latest Blocks */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Blocks className="w-5 h-5 text-[var(--accent-primary)]" />
                Latest Blocks
              </h2>
              <Link
                href="/blocks"
                className="flex items-center gap-1 text-sm text-[var(--accent-primary)] hover:underline"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {blocksLoading ? (
                <>
                  <BlockSkeleton />
                  <BlockSkeleton />
                  <BlockSkeleton />
                  <BlockSkeleton />
                  <BlockSkeleton />
                </>
              ) : (
                blocks?.map((block, index) => (
                  <BlockCard key={block.hash} block={block} index={index} />
                ))
              )}
            </div>
          </div>

          {/* Latest Transactions */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Activity className="w-5 h-5 text-[var(--accent-primary)]" />
                Latest Transactions
              </h2>
              <Link
                href="/transactions"
                className="flex items-center gap-1 text-sm text-[var(--accent-primary)] hover:underline"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {txLoading ? (
                <>
                  <TransactionSkeleton />
                  <TransactionSkeleton />
                  <TransactionSkeleton />
                  <TransactionSkeleton />
                  <TransactionSkeleton />
                </>
              ) : (
                transactions?.map((tx, index) => (
                  <TransactionRow key={tx.txid} transaction={tx} index={index} />
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4">
            Open Source & Transparent
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            BitBlocks Explorer is built with transparency in mind. Explore the code, contribute, and be part of the decentralized future.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Blocks,
              title: 'Real-time Data',
              description: 'Get instant access to the latest blocks and transactions as they happen on the network.',
            },
            {
              icon: Server,
              title: 'Masternode Stats',
              description: 'Monitor Masternode health, rewards, and network distribution in real-time.',
            },
            {
              icon: Database,
              title: 'Full API Access',
              description: 'Build your own applications using our comprehensive and well-documented API.',
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card p-6 text-center glow-border"
            >
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 mb-4">
                <feature.icon className="w-8 h-8 text-[var(--accent-primary)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

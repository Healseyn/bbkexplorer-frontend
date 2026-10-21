'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Blocks,
  Activity,
  Cpu,
  Database,
  ArrowRight,
  Server,
  Network,
} from 'lucide-react';

import { SearchBar, StatsCard, BlockCard, TransactionRow, StatsSkeleton, BlockSkeleton, TransactionSkeleton, LiveBlockTicker } from '@/components/ui';
import { getMempoolStats, getLatestNBlocks, getLatestTransactions, getChainHeight, getLatestBlock, formatNumber, formatBytes, formatDifficulty, getMasternodesList, getTransactionsTotal, getPeers } from '@/lib/api';
import { mergeLatestBlocks } from '@/lib/live-blocks';

export default function HomePage() {
  // Fetch mempool size (the backend has no aggregated /api/stats endpoint)
  const { data: mempool } = useQuery({
    queryKey: ['mempoolStats'],
    queryFn: getMempoolStats,
    refetchInterval: 15000, // Refetch every 15s
  });

  // Fetch masternodes list to count enabled
  const { data: masternodesList, isLoading: masternodesListLoading } = useQuery({
    queryKey: ['masternodes-list'],
    queryFn: getMasternodesList,
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  // Fetch total transactions count
  const { data: totalTransactions } = useQuery({
    queryKey: ['transactionsTotal'],
    queryFn: getTransactionsTotal,
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  // Fetch peers count
  const { data: peersData } = useQuery({
    queryKey: ['peers'],
    queryFn: getPeers,
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  // Calculate enabled masternodes count
  const enabledMasternodes = masternodesList?.active
    ? masternodesList.active.filter((mn) => mn.status === 'ENABLED').length
    : 0;

  // Calculate offline masternodes count
  const offlineMasternodes = masternodesList?.inactive?.length ?? 0;

  // Fetch current chain height - otimizado para 15 segundos
  const { data: currentHeight, isLoading: heightLoading } = useQuery({
    queryKey: ['chainHeight'],
    queryFn: getChainHeight,
    staleTime: 15000, // Cache for 15s
    refetchInterval: 15000, // Refetch every 15s
  });

  // Fetch latest block - otimizado para 15 segundos (compartilhado com LiveBlockTicker)
  const { data: latestBlock } = useQuery({
    queryKey: ['latestBlock'],
    queryFn: getLatestBlock,
    staleTime: 15000, // Cache for 15s
    refetchInterval: 15000, // Refetch every 15s
  });

  // Fetch initial latest blocks - usando hook compartilhado
  // Usa cache do localStorage para blocos confirmados
  const { data: initialBlocks, isLoading: blocksLoading } = useQuery({
    queryKey: ['latestBlocks', 12],
    queryFn: () => getLatestNBlocks(12),
    staleTime: 15000, // Cache for 15s
    refetchInterval: 15000, // Refetch every 15s
  });

  // Fetch latest transactions - otimizado para 15 segundos (mesmo intervalo dos blocos)
  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: ['latestTransactions'],
    queryFn: () => getLatestTransactions(12),
    staleTime: 15000, // Cache for 15s
    refetchInterval: 15000, // Refetch every 15s (same as blocks)
  });

  // Blocks and the latest block refresh independently; merge them on every render.
  // Confirmations come from the chain height (stored values are snapshots).
  const tipHeight = currentHeight || latestBlock?.height;
  const latestBlocks = mergeLatestBlocks(latestBlock, initialBlocks, 12, tipHeight);
  const latestTransactions = transactions ?? [];

  return (
    <div className="min-h-screen">
      <LiveBlockTicker initialBlocks={latestBlocks} />

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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 flex items-center justify-center gap-3 flex-wrap">
              <span className="glow-text">BitBlocks</span>{' '}
              <span className="text-[var(--text-primary)]">Explorer (BBK)</span>
              <span className="px-3 py-1 text-xs md:text-sm font-semibold rounded-full bg-gradient-to-r from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 animate-pulse">
                BETA
              </span>
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {heightLoading ? (
            <>
              <StatsSkeleton />
              <StatsSkeleton />
              <StatsSkeleton />
              <StatsSkeleton />
              <StatsSkeleton />
              <StatsSkeleton />
            </>
          ) : (
            <>
              <StatsCard
                title="Block Height"
                value={formatNumber(currentHeight || 0)}
                icon={Blocks}
                delay={0}
              />
              <StatsCard
                title="Masternodes"
                value={formatNumber(enabledMasternodes)}
                subtitle={masternodesListLoading && !masternodesList ? 'Loading...' : `${formatNumber(offlineMasternodes)} Offline`}
                icon={Server}
                delay={0.1}
              />
              <StatsCard
                title="Difficulty"
                value={latestBlock ? formatDifficulty(latestBlock.difficulty) : '—'}
                icon={Cpu}
                delay={0.2}
              />
              <StatsCard
                title="Mempool Size"
                value={formatNumber(mempool?.size || 0)}
                subtitle={formatBytes(mempool?.bytes || 0)}
                icon={Database}
                delay={0.3}
              />
              <StatsCard
                title="PEERS"
                value={formatNumber(peersData?.total || 0)}
                icon={Network}
                delay={0.4}
              />
              <StatsCard
                title="Transactions"
                value={formatNumber(totalTransactions || 0)}
                subtitle="All time"
                icon={Activity}
                delay={0.5}
              />
            </>
          )}
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

            <div className="space-y-2">
              {blocksLoading ? (
                <>
                  <BlockSkeleton />
                  <BlockSkeleton />
                  <BlockSkeleton />
                  <BlockSkeleton />
                  <BlockSkeleton />
                  <BlockSkeleton />
                </>
              ) : (
                latestBlocks.map((block, index) => (
                  <BlockCard key={block.hash} block={block} index={index} compact />
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
                  {Array.from({ length: 12 }).map((_, i) => (
                    <TransactionSkeleton key={i} />
                  ))}
                </>
              ) : (
                latestTransactions.map((tx, index) => (
                  <TransactionRow key={tx.txid} transaction={tx} index={index} />
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

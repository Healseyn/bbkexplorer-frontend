'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Blocks,
  Activity,
  TrendingUp,
  Clock,
  Database,
  ArrowRight,
  Zap,
  Server,
  Globe,
  Network,
} from 'lucide-react';

import { SearchBar, StatsCard, BlockCard, TransactionRow, StatsSkeleton, BlockSkeleton, TransactionSkeleton, LiveBlockTicker } from '@/components/ui';
import { getNetworkStats, getLatestNBlocks, getLatestTransactions, getChainHeight, getLatestBlock, formatNumber, formatBytes, getMasternodesList, getTransactionsTotal, getPeers } from '@/lib/api';
import type { Transaction, Block } from '@/types';

export default function HomePage() {
  // Update "now" every second to refresh "ago" timestamps in real-time
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Fetch network stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['networkStats'],
    queryFn: getNetworkStats,
  });

  // Fetch masternodes list to count enabled
  const { data: masternodesList, isLoading: masternodesListLoading } = useQuery({
    queryKey: ['masternodes-list'],
    queryFn: getMasternodesList,
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  // Fetch total transactions count
  const { data: totalTransactions, isLoading: totalTransactionsLoading } = useQuery({
    queryKey: ['transactionsTotal'],
    queryFn: getTransactionsTotal,
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  // Fetch peers count
  const { data: peersData, isLoading: peersLoading } = useQuery({
    queryKey: ['peers'],
    queryFn: getPeers,
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  // Calculate enabled masternodes count
  const enabledMasternodes = useMemo(() => {
    // Try stats.masternodes.enabled first
    if (stats?.masternodes?.enabled !== undefined && stats.masternodes.enabled !== null) {
      return stats.masternodes.enabled;
    }
    // Fallback: count enabled masternodes from the list
    if (masternodesList?.active) {
      return masternodesList.active.filter(mn => mn.status === 'ENABLED').length;
    }
    return 0;
  }, [stats?.masternodes?.enabled, masternodesList?.active]);

  // Calculate offline masternodes count
  const offlineMasternodes = useMemo(() => {
    // Calculate from masternodes list (inactive masternodes)
    if (masternodesList?.inactive) {
      return masternodesList.inactive.length;
    }
    // Fallback: total - enabled
    const total = stats?.masternodes?.total || 0;
    if (total > 0 && enabledMasternodes > 0) {
      return total - enabledMasternodes;
    }
    return 0;
  }, [masternodesList?.inactive, stats?.masternodes?.total, enabledMasternodes]);

  // Fetch current chain height - otimizado para 15 segundos
  const { data: currentHeight } = useQuery({
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

  // Live blocks state - atualizado via React Query
  const [liveBlocks, setLiveBlocks] = useState<Block[]>([]);

  // Initialize with fetched blocks
  useEffect(() => {
    if (Array.isArray(initialBlocks) && initialBlocks.length > 0) {
      const height = currentHeight || latestBlock?.height || 0;
      const blocksWithConfirmations = initialBlocks.map(block => ({
        ...block,
        confirmations: Math.max(0, height - block.height + 1),
      }));
      setLiveBlocks(blocksWithConfirmations);
    }
  }, [initialBlocks, currentHeight, latestBlock]);

  // Update blocks when latestBlock changes (via React Query)
  useEffect(() => {
    if (!latestBlock) return;
    
    const height = currentHeight || latestBlock.height;
    
    setLiveBlocks((prev) => {
      // Check if we already have this block
      const exists = prev.some((b) => b.hash === latestBlock.hash || b.height === latestBlock.height);
      if (exists) {
        // Update confirmations for all blocks
        return prev.map(block => ({
          ...block,
          confirmations: Math.max(0, height - block.height + 1),
        }));
      }
      
      // Add new block at the front, keep max 12 blocks
      const newBlock = {
        ...latestBlock,
        confirmations: Math.max(0, height - latestBlock.height + 1),
      };
      return [newBlock, ...prev].slice(0, 12);
    });
  }, [latestBlock, currentHeight]);

  // Update confirmations when currentHeight changes
  useEffect(() => {
    if (currentHeight && liveBlocks.length > 0) {
      setLiveBlocks((prev) =>
        prev.map(block => ({
          ...block,
          confirmations: Math.max(0, currentHeight - block.height + 1),
        }))
      );
    }
  }, [currentHeight, liveBlocks.length]);

  // Fetch latest transactions - otimizado para 15 segundos (mesmo intervalo dos blocos)
  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: ['latestTransactions'],
    queryFn: () => getLatestTransactions(12),
    staleTime: 15000, // Cache for 15s
    refetchInterval: 15000, // Refetch every 15s (same as blocks)
  });

  // Live transactions state - atualizado via React Query
  const [liveTransactions, setLiveTransactions] = useState<Transaction[]>([]);

  // Initialize with fetched transactions
  useEffect(() => {
    if (Array.isArray(transactions) && transactions.length > 0) {
      setLiveTransactions(transactions);
    }
  }, [transactions]);

  // Update transactions when new data arrives (via React Query)
  // The API already returns updated confirmations, so we just update the state
  useEffect(() => {
    if (!transactions || !Array.isArray(transactions)) return;
    
    setLiveTransactions((prev) => {
      // Check if we have new transactions by comparing txids
      const newTxids = new Set(transactions.map(tx => tx.txid));
      const prevTxids = new Set(prev.map(tx => tx.txid));
      
      // If txids are the same, just update with new data (confirmations, etc)
      const txidsEqual = newTxids.size === prevTxids.size && 
        Array.from(newTxids).every(txid => prevTxids.has(txid));
      
      if (txidsEqual) {
        // Update existing transactions with new data (confirmations updated by API)
        return prev.map(prevTx => {
          const updatedTx = transactions.find(tx => tx.txid === prevTx.txid);
          if (updatedTx) {
            // Ensure confirmed status is based on confirmations >= 6
            return {
              ...updatedTx,
              confirmed: (updatedTx.confirmations || 0) >= 6,
            };
          }
          return prevTx;
        });
      }
      
      // New transactions arrived, replace the list
      // Ensure confirmed status is based on confirmations >= 6
      return transactions.map(tx => ({
        ...tx,
        confirmed: (tx.confirmations || 0) >= 6,
      }));
    });
  }, [transactions]);

  const latestBlocks = liveBlocks.length > 0 ? liveBlocks : (Array.isArray(initialBlocks) 
    ? initialBlocks.map(block => ({
        ...block,
        confirmations: currentHeight ? Math.max(0, currentHeight - block.height + 1) : block.confirmations || 0,
      }))
    : []);
  const latestTransactions = liveTransactions.length > 0 ? liveTransactions : (Array.isArray(transactions) ? transactions : []);

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
          {statsLoading ? (
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
                title="BBK Price"
                value={`$${stats?.price?.toFixed(4) || '0.0000'}`}
                trend={stats?.priceChange24h ? { value: stats.priceChange24h, isPositive: stats.priceChange24h > 0 } : undefined}
                icon={TrendingUp}
                delay={0.2}
              />
              <StatsCard
                title="Mempool Size"
                value={formatNumber(stats?.mempoolSize || 0)}
                subtitle={formatBytes(stats?.mempoolBytes || 0)}
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
                  <BlockCard key={block.hash} block={block} index={index} compact now={now} />
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

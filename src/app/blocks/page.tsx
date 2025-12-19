'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Blocks } from 'lucide-react';

import { BlockCard, BlockSkeleton } from '@/components/ui';
import { getChainHeight, getLatestNBlocks, formatNumber } from '@/lib/api';

export default function BlocksPage() {
  const limit = 20;

  // Update "now" every second to refresh "ago" timestamps in real-time
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Usar React Query compartilhado - otimizado para 15 segundos
  const { data: height } = useQuery({
    queryKey: ['chainHeight'],
    queryFn: getChainHeight,
    staleTime: 15000, // Cache for 15s
    refetchInterval: 15000, // Refetch every 15s
  });

  const { data: blocks, isLoading } = useQuery({
    queryKey: ['latestBlocks', limit],
    queryFn: () => getLatestNBlocks(limit),
    staleTime: 15000, // Cache for 15s
    refetchInterval: 15000, // Refetch every 15s
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20">
              <Blocks className="w-8 h-8 text-[var(--accent-primary)]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
                Blocks
              </h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Chain height: {typeof height === 'number' ? formatNumber(height) : '—'} · Showing latest {limit}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Blocks List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          {isLoading ? (
            Array.from({ length: 10 }).map((_, i) => <BlockSkeleton key={i} />)
          ) : (
            blocks?.map((block, index) => <BlockCard key={block.hash || String(block.height)} block={block} index={index} now={now} />)
          )}
        </motion.div>
      </section>
    </div>
  );
}




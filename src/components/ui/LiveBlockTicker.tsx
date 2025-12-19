'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Block } from '@/types';
import { formatTimeAgo, getLatestBlock } from '@/lib/api';

interface LiveBlockTickerProps {
  initialBlocks?: Block[];
}

export function LiveBlockTicker({ initialBlocks = [] }: LiveBlockTickerProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [now, setNow] = useState(Date.now());

  // Update "now" every second to refresh "ago" timestamps in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Usar React Query compartilhado - otimizado para 15 segundos
  const { data: latestBlock } = useQuery({
    queryKey: ['latestBlock'],
    queryFn: getLatestBlock,
    staleTime: 15000, // Cache for 15s
    refetchInterval: 15000, // Refetch every 15s
  });

  // Initialize with initialBlocks
  useEffect(() => {
    if (initialBlocks.length > 0 && blocks.length === 0) {
      setBlocks(initialBlocks.slice(0, 5));
    }
  }, [initialBlocks, blocks.length]);

  // Update blocks when latestBlock changes (via React Query compartilhado)
  useEffect(() => {
    if (!latestBlock) return;
    
    setBlocks((prev) => {
      // If we already have this block (by hash or height), don't update
      const exists = prev.some((b) => b.hash === latestBlock.hash || b.height === latestBlock.height);
      if (exists) return prev;
      
      // Add new block at the front, keep max 5 blocks
      return [latestBlock, ...prev].slice(0, 5);
    });
  }, [latestBlock]);

  return (
    <div className="w-full bg-[var(--bg-secondary)]/50 border-y border-[var(--border-primary)] backdrop-blur-sm overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[var(--accent-primary)] animate-pulse">
            <div className="w-2 h-2 rounded-full bg-current" />
            <span className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">Live Blocks</span>
          </div>
          
          <div className="flex-1 overflow-hidden relative">
            <div className="flex gap-4">
              <AnimatePresence mode="popLayout" initial={false}>
                {blocks.slice(0, 5).map((block) => (
                  <motion.div
                    key={`${block.height}-${block.hash}`}
                    initial={{ opacity: 0, x: -50, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 50, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <Link
                      href={`/block/${block.height}`}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border-primary)] hover:border-[var(--accent-primary)]/50 transition-all group min-w-[200px]"
                    >
                      <div className="p-2 rounded bg-[var(--bg-secondary)] group-hover:bg-[var(--accent-primary)]/10 transition-colors">
                        <Box className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                          #{block.height}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">
                          {formatTimeAgo(block.timestamp, now)} • {block.txCount} txs
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {/* Fade effect on the right */}
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[var(--bg-secondary)] to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}




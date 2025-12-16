'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box } from 'lucide-react';
import Link from 'next/link';
import { Block } from '@/types';
import { formatTimeAgo } from '@/lib/api';

interface LiveBlockTickerProps {
  initialBlocks?: Block[];
}

export function LiveBlockTicker({ initialBlocks = [] }: LiveBlockTickerProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);

  // Simulate real-time updates for demonstration
  useEffect(() => {
    if (initialBlocks.length > 0) {
      setBlocks(initialBlocks);
    }
    
    const interval = setInterval(() => {
      const newBlock: Block = {
        hash: Array(64).fill('0').map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
        height: (blocks[0]?.height || 823456) + 1,
        timestamp: Date.now() / 1000,
        txCount: Math.floor(Math.random() * 50) + 1,
        size: Math.floor(Math.random() * 20000) + 1000,
        weight: Math.floor(Math.random() * 50000) + 4000,
        version: 536870912,
        merkleRoot: 'new...',
        previousBlockHash: blocks[0]?.hash || 'prev...',
        nonce: Math.floor(Math.random() * 1000000),
        bits: '17034219',
        difficulty: 72006146478567.1,
      };

      setBlocks((prev) => [newBlock, ...prev.slice(0, 4)]);
    }, 10000); // New block every 10 seconds (simulated)

    return () => clearInterval(interval);
  }, [initialBlocks, blocks]); // Added blocks dependency to ensure correct height increment

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
              <AnimatePresence mode="popLayout">
                {blocks.slice(0, 5).map((block) => (
                  <motion.div
                    key={block.hash}
                    initial={{ opacity: 0, x: -50, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="flex-shrink-0"
                  >
                    <Link
                      href={`/block/${block.hash}`}
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
                          {formatTimeAgo(block.timestamp)} • {block.txCount} txs
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



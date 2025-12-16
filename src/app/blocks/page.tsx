'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Blocks, ChevronLeft, ChevronRight } from 'lucide-react';

import { BlockCard, BlockSkeleton } from '@/components/ui';
import { getBlocks, formatNumber } from '@/lib/api';

// Mock data for development
const generateMockBlocks = (page: number) => ({
  data: Array.from({ length: 20 }, (_, i) => ({
    hash: `0000000000000000000${page}${i}abc567def890123456789abcdef0123456789abcdef`,
    height: 823456 - (page - 1) * 20 - i,
    timestamp: Date.now() / 1000 - (page - 1) * 20 * 600 - i * 600,
    txCount: Math.floor(Math.random() * 3000) + 500,
    size: Math.floor(Math.random() * 1000000) + 500000,
    weight: Math.floor(Math.random() * 2000000) + 2000000,
    version: 536870912,
    merkleRoot: `merkle${page}${i}`,
    previousBlockHash: `prev${page}${i}`,
    nonce: Math.floor(Math.random() * 100000000),
    bits: '17034219',
    difficulty: 72006146478567.1,
  })),
  total: 823456,
  page,
  pageSize: 20,
  hasMore: page * 20 < 823456,
});

export default function BlocksPage() {
  const [page, setPage] = useState(1);

  const { data: blocksData, isLoading } = useQuery({
    queryKey: ['blocks', page],
    queryFn: () => getBlocks(page, 20),
    placeholderData: generateMockBlocks(page),
  });

  const totalPages = Math.ceil((blocksData?.total || 0) / 20);

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
                {formatNumber(blocksData?.total || 0)} blocks total
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
            blocksData?.data.map((block, index) => (
              <BlockCard key={block.hash} block={block} index={index} />
            ))
          )}
        </motion.div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          <div className="flex items-center gap-1 px-4">
            <span className="text-[var(--text-muted)]">Page</span>
            <span className="text-[var(--text-primary)] font-medium">{page}</span>
            <span className="text-[var(--text-muted)]">of</span>
            <span className="text-[var(--text-primary)] font-medium">{formatNumber(totalPages)}</span>
          </div>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!blocksData?.hasMore}
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}



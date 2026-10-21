'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';

import { handleSearchQuery } from '@/lib/search-utils';

export default function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const performSearch = async () => {
      if (!query) {
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);

      try {
        const route = await handleSearchQuery(query);
        // Replace so the back button doesn't return to this redirect
        if (route && !cancelled) {
          router.replace(route);
          return;
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    performSearch();
    return () => {
      cancelled = true;
    };
  }, [query, router]);

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-[var(--accent-primary)] animate-spin" />
        </div>
      ) : hasSearched ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="p-4 rounded-2xl bg-[var(--bg-tertiary)] inline-flex mb-4">
            <Search className="w-8 h-8 text-[var(--text-muted)]" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            No results found
          </h2>
          <p className="text-[var(--text-muted)] mb-6 max-w-md mx-auto">
            We couldn&apos;t find any blocks, transactions, or addresses matching{' '}
            <span className="text-[var(--accent-primary)]">&quot;{query}&quot;</span>
          </p>
          <div className="text-sm text-[var(--text-muted)]">
            <p className="mb-2">Try searching for:</p>
            <ul className="space-y-1">
              <li>• A block height (e.g., &quot;100000&quot;)</li>
              <li>• A block hash (e.g., &quot;0000000000000...&quot;)</li>
              <li>• A transaction ID</li>
              <li>• A BitBlocks address</li>
            </ul>
          </div>
        </motion.div>
      ) : (
        <div className="text-center py-12 text-[var(--text-muted)]">
          <p>Enter a search query above to find blocks, transactions, or addresses.</p>
        </div>
      )}
    </section>
  );
}







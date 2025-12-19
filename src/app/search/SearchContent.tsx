'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Blocks, Activity, Wallet, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { search, formatHash, getTransactionDetails, getBlockDetails } from '@/lib/api';
import { detectSearchTypeSync } from '@/lib/search-utils';
import type { SearchResult } from '@/types';

export default function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      if (!query) {
        setResult(null);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);

      try {
        const searchResult = await search(query);
        
        if (searchResult) {
          // Redirect directly to the result page
          switch (searchResult.type) {
            case 'block':
              router.push(`/block/${query}`);
              return;
            case 'transaction':
              router.push(`/tx/${query}`);
              return;
            case 'address':
              router.push(`/address/${query}`);
              return;
          }
        }
        
        // If search returns null, try to determine type and navigate directly
        if (!searchResult) {
          const detectedType = detectSearchTypeSync(query);
          if (detectedType === 'address') {
            router.push(`/address/${query}`);
            return;
          } else if (detectedType === 'block-hash' || detectedType === 'transaction-hash') {
            // For 64-char hex hashes, try transaction first (more common), then block
            if (query.length === 64 && /^[0-9a-fA-F]+$/.test(query)) {
              try {
                await getTransactionDetails(query);
                router.push(`/tx/${query}`);
                return;
              } catch {
                // Transaction doesn't exist, try as block
                try {
                  await getBlockDetails(query);
                  router.push(`/block/${query}`);
                  return;
                } catch {
                  // Neither transaction nor block found, show no results
                }
              }
            } else if (detectedType === 'transaction-hash') {
              router.push(`/tx/${query}`);
              return;
            }
          }
        }
        
        setResult(searchResult);
      } catch {
        // If search fails, try to determine type and navigate directly
        const detectedType = detectSearchTypeSync(query);
        if (detectedType === 'address') {
          router.push(`/address/${query}`);
          return;
        } else if (detectedType === 'block-hash' || detectedType === 'transaction-hash') {
          // For 64-char hex hashes, try transaction first (more common), then block
          if (query.length === 64 && /^[0-9a-fA-F]+$/.test(query)) {
            try {
              await getTransactionDetails(query);
              router.push(`/tx/${query}`);
              return;
            } catch {
              // Transaction doesn't exist, try as block
              try {
                await getBlockDetails(query);
                router.push(`/block/${query}`);
                return;
              } catch {
                // Neither transaction nor block found, show no results
              }
            }
          } else if (detectedType === 'transaction-hash') {
            router.push(`/tx/${query}`);
            return;
          }
        }
        setResult(null);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query, router]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'block':
        return <Blocks className="w-6 h-6" />;
      case 'transaction':
        return <Activity className="w-6 h-6" />;
      case 'address':
        return <Wallet className="w-6 h-6" />;
      default:
        return <Search className="w-6 h-6" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'block':
        return 'Block';
      case 'transaction':
        return 'Transaction';
      case 'address':
        return 'Address';
      default:
        return 'Unknown';
    }
  };

  const getTypeLink = (type: string, data: SearchResult['data']) => {
    switch (type) {
      case 'block':
        return `/block/${'height' in data ? data.height : ''}`;
      case 'transaction':
        return `/tx/${'txid' in data ? data.txid : ''}`;
      case 'address':
        return `/address/${'address' in data ? data.address : ''}`;
      default:
        return '/';
    }
  };

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-[var(--accent-primary)] animate-spin" />
        </div>
      ) : hasSearched && !result ? (
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
              <li>• A Bitcoin address</li>
            </ul>
          </div>
        </motion.div>
      ) : result ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Found 1 result for &quot;{query}&quot;
          </p>
          <Link href={getTypeLink(result.type, result.data)}>
            <div className="card p-6 hover:bg-[var(--bg-hover)] cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20">
                  {getTypeIcon(result.type)}
                </div>
                <div className="flex-1">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                    {getTypeLabel(result.type)}
                  </span>
                  <p className="hash-text mt-2">{formatHash(query, 20)}</p>
                </div>
                <div className="text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] group-hover:translate-x-1 transition-all">
                  →
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ) : (
        <div className="text-center py-12 text-[var(--text-muted)]">
          <p>Enter a search query above to find blocks, transactions, or addresses.</p>
        </div>
      )}
    </section>
  );
}







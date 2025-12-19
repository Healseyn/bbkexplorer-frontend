'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, ArrowRight } from 'lucide-react';
import { handleSearchQuery } from '@/lib/search-utils';

interface SearchBarProps {
  size?: 'default' | 'large';
  placeholder?: string;
}

export function SearchBar({
  size = 'default',
  placeholder = 'Search by block height, hash, transaction ID, or address...',
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || isSearching) return;
    
    setIsSearching(true);
    try {
      const route = await handleSearchQuery(trimmed);
      if (route) {
        router.push(route);
        setQuery(''); // Clear search after navigation
      }
    } catch (error) {
      // If search fails, fallback to search page
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    } finally {
      setIsSearching(false);
    }
  };

  const isLarge = size === 'large';

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <motion.div
        animate={{
          boxShadow: isFocused
            ? '0 0 40px rgba(0, 212, 255, 0.2)'
            : '0 0 0px rgba(0, 212, 255, 0)',
        }}
        className={`relative rounded-2xl ${isLarge ? 'glow-border' : ''}`}
      >
        <div className="relative">
          <Search
            className={`absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] ${
              isLarge ? 'w-6 h-6' : 'w-5 h-5'
            }`}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={`w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl placeholder:text-[var(--text-muted)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-all duration-300 ${
              isLarge
                ? 'pl-14 pr-32 py-5 text-lg'
                : 'pl-12 pr-24 py-3.5 text-base'
            }`}
          />
          <button
            type="submit"
            disabled={isSearching}
            className={`absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white font-medium rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${
              isLarge ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm'
            }`}
          >
            <span className="hidden sm:inline">Search</span>
            <ArrowRight className={isLarge ? 'w-5 h-5' : 'w-4 h-4'} />
          </button>
        </div>
      </motion.div>

      {/* Quick search suggestions */}
      {isLarge && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-sm text-[var(--text-muted)]">
          <span>Try:</span>
          <button
            type="button"
            onClick={() => setQuery('0')}
            className="px-3 py-1 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            Genesis Block
          </button>
          <button
            type="button"
            onClick={() => setQuery('100000')}
            className="px-3 py-1 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            Block #100000
          </button>
        </div>
      )}
    </form>
  );
}


'use client';

import { Suspense } from 'react';
import { SearchBar, Loading } from '@/components/ui';
import SearchContent from './SearchContent';

export default function SearchPage() {
  return (
    <div className="min-h-screen">
      {/* Search Header */}
      <section className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Search</h1>
          <SearchBar size="large" />
        </div>
      </section>

      {/* Results */}
      <Suspense fallback={
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Loading text="Loading search results..." />
        </section>
      }>
        <SearchContent />
      </Suspense>
    </div>
  );
}

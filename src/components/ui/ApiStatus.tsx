'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getApiHealth } from '@/lib/api';
import { TimeAgo } from './TimeAgo';

export default function ApiStatus() {

  const { data, isLoading, isError, dataUpdatedAt } = useQuery({
    queryKey: ['apiHealth'],
    queryFn: getApiHealth,
    refetchInterval: 60000, // Refetch every 1 minute
    staleTime: 30000, // Cache for 30 seconds
    retry: 2,
  });

  // Check if API is online: data exists, no error, and message indicates success
  const isOnline = !isError && data !== undefined && data.message !== 'API is unavailable' && (data.message.includes('running') || data.message.includes('API is running'));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2"
      aria-label={isOnline ? 'Server is online' : 'Server is offline'}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 text-[var(--text-muted)] animate-spin" />
          <span className="text-xs text-[var(--text-muted)]">Checking...</span>
        </>
      ) : (
        <>
          {isOnline ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
          <span className="text-xs text-[var(--text-muted)]">
            {isOnline ? 'Server is online' : 'Server is offline'}
            {dataUpdatedAt > 0 && (
              <span className="ml-1 text-[var(--text-muted)]/70">
                • <TimeAgo timestamp={dataUpdatedAt} />
              </span>
            )}
          </span>
        </>
      )}
    </motion.div>
  );
}


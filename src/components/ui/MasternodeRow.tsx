'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Masternode } from '@/types';
import { formatTimeAgo, formatHash } from '@/lib/api';
import { MasternodeStatusBadge } from './MasternodeStatusBadge';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface MasternodeRowProps {
  masternode: Masternode;
  index?: number;
  showOfflineTime?: boolean;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (hours > 0) return `${days}d ${hours}h`;
  return `${days}d`;
}

export function MasternodeRow({ masternode, index = 0, showOfflineTime = false }: MasternodeRowProps) {
  const [copied, setCopied] = useState(false);

  const copyAddress = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(masternode.addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors"
    >
      <td className="py-4 px-4 text-sm text-[var(--text-secondary)]">
        {masternode.rank !== null ? `#${masternode.rank}` : '-'}
      </td>
      <td className="py-4 px-4">
        <MasternodeStatusBadge status={masternode.status} />
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <Link 
            href={`/address/${masternode.addr.split(':')[0]}`}
            className="text-sm font-medium text-[var(--accent-primary)] hover:underline"
          >
            {masternode.addr.length > 20 ? formatHash(masternode.addr, 10) : masternode.addr}
          </Link>
          <button
            onClick={copyAddress}
            className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-[var(--accent-success)]" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </td>
      <td className="py-4 px-4 text-sm text-[var(--text-secondary)]">
        {masternode.network}
      </td>
      <td className="py-4 px-4 text-sm text-[var(--text-secondary)]">
        {formatTimeAgo(masternode.lastseen)}
      </td>
      <td className="py-4 px-4 text-sm text-[var(--text-secondary)]">
        {masternode.lastpaid !== null ? formatTimeAgo(masternode.lastpaid) : 'Never'}
      </td>
      <td className="py-4 px-4 text-sm text-[var(--text-secondary)] text-right">
        {formatDuration(masternode.activeTime)}
      </td>
      {showOfflineTime && (
        <td className="py-4 px-4 text-sm text-[var(--text-secondary)] text-right">
          {formatDuration(masternode.offlineTime)}
        </td>
      )}
    </motion.tr>
  );
}




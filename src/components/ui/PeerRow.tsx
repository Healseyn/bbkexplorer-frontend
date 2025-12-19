'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Peer } from '@/types';
import { formatTimeAgo, formatHash } from '@/lib/api';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface PeerRowProps {
  peer: Peer;
  index?: number;
  currentTime?: number;
}

export function PeerRow({ peer, index = 0, currentTime }: PeerRowProps) {
  const [copied, setCopied] = useState(false);

  const copyAddress = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(peer.addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine network type from address
  const getNetworkType = (addr: string): 'ipv4' | 'ipv6' => {
    // Remove port if present (format: [ip]:port or ip:port)
    let ipPart = addr;
    if (addr.includes('[') && addr.includes(']')) {
      // IPv6 with brackets: [2001:db8::1]:8333
      ipPart = addr.substring(addr.indexOf('[') + 1, addr.indexOf(']'));
    } else if (addr.includes(':')) {
      // Could be IPv4:port or IPv6:port
      const lastColonIndex = addr.lastIndexOf(':');
      ipPart = addr.substring(0, lastColonIndex);
    }
    
    // Check for IPv6 patterns:
    // 1. Contains multiple colons (IPv6 characteristic)
    const colonCount = (ipPart.match(/:/g) || []).length;
    if (colonCount > 1) {
      return 'ipv6';
    }
    
    // 2. Contains double colon (::) which is IPv6 shorthand
    if (ipPart.includes('::')) {
      return 'ipv6';
    }
    
    // 3. Check if it's a valid IPv4 format (4 numbers separated by dots)
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Pattern.test(ipPart)) {
      return 'ipv4';
    }
    
    // 4. If it contains hexadecimal characters and colons, it's likely IPv6
    const hexPattern = /[0-9a-fA-F:]+/;
    if (hexPattern.test(ipPart) && colonCount >= 1) {
      return 'ipv6';
    }
    
    // Default to IPv4 for backward compatibility
    return 'ipv4';
  };

  const networkType = getNetworkType(peer.addr);
  const ipAddress = peer.addr.split(':')[0].replace(/[\[\]]/g, '');

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors"
    >
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <Link 
            href={`/address/${ipAddress}`}
            className="text-sm font-medium text-[var(--accent-primary)] hover:underline"
          >
            {peer.addr.length > 30 ? formatHash(peer.addr, 12) : peer.addr}
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
        <span className={`px-2 py-1 rounded text-xs ${
          networkType === 'ipv6' 
            ? 'bg-blue-500/20 text-blue-400' 
            : 'bg-green-500/20 text-green-400'
        }`}>
          {networkType.toUpperCase()}
        </span>
      </td>
      <td className="py-4 px-4 text-sm text-[var(--text-secondary)]">
        {peer.subver}
      </td>
      <td className="py-4 px-4 text-sm text-[var(--text-secondary)]">
        {formatTimeAgo(peer.lastseen, currentTime)}
      </td>
      <td className="py-4 px-4 text-sm text-[var(--text-secondary)]">
        {peer.connectionDurationFormatted}
      </td>
      <td className="py-4 px-4 text-sm text-[var(--text-secondary)]">
        {peer.banscore}
      </td>
    </motion.tr>
  );
}


'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Network,
  Activity,
  Globe,
  Clock,
  Search,
  Server,
  Shield,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from 'lucide-react';

import { PeerRow, StatsCard, Loading } from '@/components/ui';
import { getPeers, formatNumber } from '@/lib/api';
import type { Peer } from '@/types';

type SortColumn = 'addr' | 'network' | 'version' | 'lastseen' | 'connectionDuration' | 'banscore';
type SortDirection = 'asc' | 'desc';

export default function PeersPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
  const [networkFilter, setNetworkFilter] = useState<'all' | 'ipv4' | 'ipv6'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every 10 seconds to refresh "Last Seen" timestamps in real-time
  // This only updates the display, no API call is made
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10000); // Update every 10 seconds for real-time feel

    return () => clearInterval(interval);
  }, []);

  // Fetch peers list
  const { data: peersData, isLoading: listLoading } = useQuery({
    queryKey: ['peers'],
    queryFn: getPeers,
    refetchInterval: 60000, // Refetch every 60 seconds
  });

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

  // Determine if peer is active (lastseen within 1 week)
  const isPeerActive = (peer: Peer): boolean => {
    const oneWeekAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60); // 1 week in seconds
    // Normalize timestamp: if it's > 1e10, it's in milliseconds, convert to seconds
    const lastseenSeconds = peer.lastseen > 1e10 ? Math.floor(peer.lastseen / 1000) : peer.lastseen;
    return lastseenSeconds >= oneWeekAgo;
  };

  // Handle column sort
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Filter and sort peers
  const filteredPeers = useMemo(() => {
    if (!peersData) return [];
    
    // First filter by active/inactive
    const peersByStatus = peersData.peers.filter((peer: Peer) => {
      const isActive = isPeerActive(peer);
      return activeTab === 'active' ? isActive : !isActive;
    });
    
    const filtered = peersByStatus.filter((peer: Peer) => {
      // Network filter
      if (networkFilter !== 'all') {
        const peerNetwork = getNetworkType(peer.addr);
        if (peerNetwork !== networkFilter) {
          return false;
        }
      }
      
      // Search filter (by address)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return peer.addr.toLowerCase().includes(query);
      }
      
      return true;
    });

    // Apply sorting
    if (!sortColumn) return filtered;

    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortColumn) {
        case 'addr':
          aValue = a.addr.toLowerCase();
          bValue = b.addr.toLowerCase();
          break;
        case 'network':
          aValue = getNetworkType(a.addr);
          bValue = getNetworkType(b.addr);
          break;
        case 'version':
          aValue = a.version;
          bValue = b.version;
          break;
        case 'lastseen':
          // Normalize timestamps
          aValue = a.lastseen > 1e10 ? Math.floor(a.lastseen / 1000) : a.lastseen;
          bValue = b.lastseen > 1e10 ? Math.floor(b.lastseen / 1000) : b.lastseen;
          break;
        case 'connectionDuration':
          aValue = a.connectionDuration;
          bValue = b.connectionDuration;
          break;
        case 'banscore':
          aValue = a.banscore;
          bValue = b.banscore;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortDirection === 'asc' 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

    return sorted;
  }, [peersData, activeTab, networkFilter, searchQuery, sortColumn, sortDirection]);

  // Calculate stats
  const activeCount = useMemo(() => {
    if (!peersData) return 0;
    return peersData.peers.filter((p: Peer) => isPeerActive(p)).length;
  }, [peersData]);

  const inactiveCount = useMemo(() => {
    if (!peersData) return 0;
    return peersData.peers.filter((p: Peer) => !isPeerActive(p)).length;
  }, [peersData]);

  const ipv4Count = useMemo(() => {
    if (!peersData) return 0;
    return peersData.peers.filter((p: Peer) => getNetworkType(p.addr) === 'ipv4').length;
  }, [peersData]);

  const ipv6Count = useMemo(() => {
    if (!peersData) return 0;
    return peersData.peers.filter((p: Peer) => getNetworkType(p.addr) === 'ipv6').length;
  }, [peersData]);

  return (
    <div className="min-h-screen">
      {/* Header & Stats */}
      <section className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-3">
              <Network className="w-8 h-8 text-[var(--accent-primary)]" />
              Peers
            </h1>
            <p className="text-[var(--text-secondary)]">
              Monitor the network peers connected to the BitBlocks network.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard
              title="Total Peers"
              value={formatNumber(peersData?.total || 0)}
              icon={Network}
              delay={0}
            />
            <StatsCard
              title="Active"
              value={formatNumber(activeCount)}
              subtitle={peersData?.total ? `${((activeCount / peersData.total) * 100).toFixed(1)}% active` : undefined}
              icon={Activity}
              delay={0.1}
            />
            <StatsCard
              title="Inactive"
              value={formatNumber(inactiveCount)}
              subtitle={peersData?.total ? `${((inactiveCount / peersData.total) * 100).toFixed(1)}% inactive` : undefined}
              icon={Shield}
              delay={0.15}
            />
            <StatsCard
              title="IPv4 Peers"
              value={formatNumber(ipv4Count)}
              icon={Globe}
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Peers List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card overflow-hidden"
        >
          {/* Toolbar */}
          <div className="p-4 border-b border-[var(--border-primary)] flex flex-col gap-4">
            {/* Tabs for Active/Inactive */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'active'
                    ? 'bg-[var(--accent-success)]/20 text-[var(--accent-success)] border border-[var(--accent-success)]'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                onClick={() => setActiveTab('inactive')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'inactive'
                    ? 'bg-[var(--accent-warning)]/20 text-[var(--accent-warning)] border border-[var(--accent-warning)]'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                Inactive ({inactiveCount})
              </button>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                {['all', 'ipv4', 'ipv6'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setNetworkFilter(f as typeof networkFilter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      networkFilter === f
                        ? 'bg-[var(--accent-primary)] text-white'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              
              <div className="w-full md:w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    placeholder="Search by address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--bg-tertiary)] text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  <th 
                    className="px-4 py-3 cursor-pointer hover:bg-[var(--bg-hover)] transition-colors select-none"
                    onClick={() => handleSort('addr')}
                  >
                    <div className="flex items-center gap-2">
                      Address
                      {sortColumn === 'addr' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-30" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 cursor-pointer hover:bg-[var(--bg-hover)] transition-colors select-none"
                    onClick={() => handleSort('network')}
                  >
                    <div className="flex items-center gap-2">
                      Network
                      {sortColumn === 'network' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-30" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 cursor-pointer hover:bg-[var(--bg-hover)] transition-colors select-none"
                    onClick={() => handleSort('version')}
                  >
                    <div className="flex items-center gap-2">
                      Version
                      {sortColumn === 'version' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-30" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 cursor-pointer hover:bg-[var(--bg-hover)] transition-colors select-none"
                    onClick={() => handleSort('lastseen')}
                  >
                    <div className="flex items-center gap-2">
                      Last Seen
                      {sortColumn === 'lastseen' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-30" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 cursor-pointer hover:bg-[var(--bg-hover)] transition-colors select-none"
                    onClick={() => handleSort('connectionDuration')}
                  >
                    <div className="flex items-center gap-2">
                      Connection Time
                      {sortColumn === 'connectionDuration' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-30" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 cursor-pointer hover:bg-[var(--bg-hover)] transition-colors select-none"
                    onClick={() => handleSort('banscore')}
                  >
                    <div className="flex items-center gap-2">
                      Ban Score
                      {sortColumn === 'banscore' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-30" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]">
                {listLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center">
                      <Loading text="Loading peers..." />
                    </td>
                  </tr>
                ) : filteredPeers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[var(--text-muted)]">
                      No peers found matching your filter.
                    </td>
                  </tr>
                ) : (
                  filteredPeers.map((peer, index) => (
                    <PeerRow key={peer.id} peer={peer} index={index} currentTime={currentTime} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="p-4 border-t border-[var(--border-primary)]">
            <span className="text-sm text-[var(--text-muted)]">
              Showing {filteredPeers.length} of {formatNumber(activeTab === 'active' ? activeCount : inactiveCount)} {activeTab} peers
            </span>
          </div>
        </motion.div>
      </section>
    </div>
  );
}


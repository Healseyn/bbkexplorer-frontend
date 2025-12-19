'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Server,
  Activity,
  Globe,
  Clock,
  Shield,
  Search,
} from 'lucide-react';

import { MasternodeRow, StatsCard, Loading } from '@/components/ui';
import { getMasternodesList, formatNumber } from '@/lib/api';
import type { Masternode } from '@/types';

export default function MasternodesPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
  const [networkFilter, setNetworkFilter] = useState<'all' | 'ipv4' | 'ipv6' | 'onion'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch masternodes list
  const { data: masternodesData, isLoading: listLoading } = useQuery({
    queryKey: ['masternodes-list'],
    queryFn: getMasternodesList,
    refetchInterval: 60000, // Refetch every 60 seconds (cache TTL)
  });

  // Filter masternodes based on active/inactive tab, network filter, and search
  const filteredMasternodes = useMemo(() => {
    if (!masternodesData) return [];
    
    const masternodes = activeTab === 'active' ? masternodesData.active : masternodesData.inactive;
    
    return masternodes.filter((mn: Masternode) => {
      // Network filter
      if (networkFilter !== 'all' && mn.network !== networkFilter) {
        return false;
      }
      
      // Search filter (by address or txhash)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          mn.addr.toLowerCase().includes(query) ||
          mn.txhash.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [masternodesData, activeTab, networkFilter, searchQuery]);

  return (
    <div className="min-h-screen">
      {/* Header & Stats */}
      <section className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-3">
              <Server className="w-8 h-8 text-[var(--accent-primary)]" />
              Masternodes
            </h1>
            <p className="text-[var(--text-secondary)]">
              Monitor the health and status of the BitBlocks masternode network.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard
              title="Total Nodes"
              value={formatNumber(masternodesData?.total.total || 0)}
              icon={Server}
              delay={0}
            />
            <StatsCard
              title="Active"
              value={formatNumber(masternodesData?.total.active || 0)}
              subtitle={masternodesData?.total.total ? `${((masternodesData.total.active / masternodesData.total.total) * 100).toFixed(1)}% active` : undefined}
              icon={Activity}
              delay={0.1}
            />
            <StatsCard
              title="Inactive"
              value={formatNumber(masternodesData?.total.inactive || 0)}
              subtitle={masternodesData?.total.total ? `${((masternodesData.total.inactive / masternodesData.total.total) * 100).toFixed(1)}% inactive` : undefined}
              icon={Shield}
              delay={0.2}
            />
            <StatsCard
              title="IPv4 Nodes"
              value={formatNumber(masternodesData?.active.filter(mn => mn.network === 'ipv4').length || 0)}
              icon={Globe}
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Masternode List */}
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
                Active ({masternodesData?.total.active || 0})
              </button>
              <button
                onClick={() => setActiveTab('inactive')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'inactive'
                    ? 'bg-[var(--accent-warning)]/20 text-[var(--accent-warning)] border border-[var(--accent-warning)]'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                Inactive ({masternodesData?.total.inactive || 0})
              </button>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                {['all', 'ipv4', 'ipv6', 'onion'].map((f) => (
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
                    placeholder="Search by address or txhash..."
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
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Protocol</th>
                  <th className="px-4 py-3">Last Seen</th>
                  <th className="px-4 py-3">Last Paid</th>
                  <th className="px-4 py-3 text-right">Active Time</th>
                  {activeTab === 'inactive' && (
                    <th className="px-4 py-3 text-right">Offline Time</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]">
                {listLoading ? (
                  <tr>
                    <td colSpan={activeTab === 'inactive' ? 8 : 7} className="py-8 text-center">
                      <Loading text="Loading masternodes..." />
                    </td>
                  </tr>
                ) : filteredMasternodes.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === 'inactive' ? 8 : 7} className="py-8 text-center text-[var(--text-muted)]">
                      No masternodes found matching your filter.
                    </td>
                  </tr>
                ) : (
                  filteredMasternodes.map((mn, index) => (
                    <MasternodeRow key={mn.txhash} masternode={mn} index={index} showOfflineTime={activeTab === 'inactive'} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="p-4 border-t border-[var(--border-primary)]">
            <span className="text-sm text-[var(--text-muted)]">
              Showing {filteredMasternodes.length} of {formatNumber(activeTab === 'active' ? (masternodesData?.total.active || 0) : (masternodesData?.total.inactive || 0))} {activeTab} masternodes
            </span>
          </div>
        </motion.div>
      </section>
    </div>
  );
}




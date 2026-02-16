'use client';

import { useQuery, useQueries } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Blocks,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Hash,
  Database,
  Cpu,
  ArrowRight,
  Copy,
  Check,
  ArrowDownLeft,
  ArrowUpRight,
  Award,
} from 'lucide-react';
import { useState } from 'react';

import { Loading } from '@/components/ui';
import { getBlockDetails, getTransactionDetails, formatNumber, formatDate, formatBytes, formatHash, formatBBK, formatDifficulty } from '@/lib/api';

export default function BlockDetailPage() {
  const params = useParams();
  const hashOrHeight = params.hashOrHeight as string;
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Fetch block details
  const { data, isLoading: blockLoading } = useQuery({
    queryKey: ['block', hashOrHeight],
    queryFn: () => getBlockDetails(hashOrHeight),
  });

  const block = data?.block;
  const txids = data?.txids || [];

  // Fetch transaction details for the first 20 transactions
  const txDetailsQueries = useQueries({
    queries: txids.slice(0, 20).map((txid) => ({
      queryKey: ['txDetails', txid],
      queryFn: () => getTransactionDetails(txid),
      enabled: !!txid,
    })),
  });

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (blockLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading text="Loading block details..." size="large" />
      </div>
    );
  }

  if (!block) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Block Not Found</h1>
          <p className="text-[var(--text-muted)] mb-4">The block you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/" className="text-[var(--accent-primary)] hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const detailItems = [
    { label: 'Timestamp', value: formatDate(block.timestamp), icon: Clock },
    { label: 'Transactions', value: formatNumber(block.txCount), icon: FileText },
    { label: 'Size', value: formatBytes(block.size), icon: Database },
    { label: 'Difficulty', value: formatDifficulty(block.difficulty), icon: Cpu },
    { label: 'Version', value: `0x${block.version.toString(16)}`, icon: Hash },
    { label: 'Nonce', value: formatNumber(block.nonce), icon: Hash },
    { label: 'Bits', value: block.bits, icon: Hash },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-4">
            <Link href="/" className="hover:text-[var(--accent-primary)] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/blocks" className="hover:text-[var(--accent-primary)] transition-colors">
              Blocks
            </Link>
            <span>/</span>
            <span className="text-[var(--text-primary)]">#{formatNumber(block.height)}</span>
          </div>

          {/* Block Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20">
                <Blocks className="w-8 h-8 text-[var(--accent-primary)]" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
                  Block #{formatNumber(block.height)}
                </h1>
                {block.miner && (
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    Mined by <span className="text-[var(--accent-primary)]">{block.miner}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Link
                href={`/block/${block.height - 1}`}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Link>
              <Link
                href={`/block/${block.height + 1}`}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Block Details */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Block Details</h2>

          {/* Hash Field */}
          <div className="mb-6">
            <div>
              <label className="text-sm text-[var(--text-muted)] block mb-1">Block Hash</label>
              <div className="flex items-center gap-2 p-3 bg-[var(--bg-tertiary)] rounded-lg">
                <span className="hash-text flex-1 break-all">{block.hash}</span>
                <button
                  onClick={() => copyToClipboard(block.hash, 'hash')}
                  className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-all"
                >
                  {copiedField === 'hash' ? (
                    <Check className="w-4 h-4 text-[var(--accent-success)]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {detailItems.map((item) => (
              <div
                key={item.label}
                className="p-4 bg-[var(--bg-tertiary)] rounded-lg"
              >
                <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
                  <item.icon className="w-4 h-4" />
                  <span className="text-xs">{item.label}</span>
                </div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Transactions ({formatNumber(block.txCount || txids.length || 0)})
            </h2>
          </div>
          
          {/* Block Rewards Summary - Calculate from coinbase and staking transactions */}
          {(() => {
            // Helper to convert value to satoshis
            const getValueInSatoshis = (value: unknown): number => {
              if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
              if (value < 1 && value > 0) return Math.round(value * 100000000);
              if (value >= 1e12) return Math.round(value);
              return Math.round(value * 100000000);
            };
            
            const allRewards: Array<{
              txid: string;
              address: string;
              masternodeReward: number; // in satoshis
              stakingReward: number; // in satoshis
            }> = [];
            
            // Process all transactions to find coinbase and staking rewards
            txids.slice(0, 20).forEach((txid, index) => {
              const txData = txDetailsQueries[index]?.data as Record<string, unknown> | undefined;
              if (!txData) return;
              
              const vin = (txData.vin as Array<Record<string, unknown>>) || [];
              const vout = (txData.vout as Array<Record<string, unknown>>) || [];
              const isCoinbase = vin.length > 0 && vin[0].coinbase;
              
              // Calculate totals
              const totalInput = vin.reduce((sum, input) => {
                if (input.coinbase) return sum;
                const value = (input.value as number | undefined) || 0;
                return sum + getValueInSatoshis(value);
              }, 0);
              
              const totalOutput = vout.reduce((sum, output) => {
                const value = output.value as number | undefined;
                return sum + getValueInSatoshis(value || 0);
              }, 0);
              
              // Coinbase transaction: all outputs are block rewards
              if (isCoinbase) {
                vout.forEach((output) => {
                  const valueBBK = output.value as number | undefined;
                  if (typeof valueBBK === 'number' && valueBBK > 0) {
                    const valueSatoshis = getValueInSatoshis(valueBBK);
                    const scriptPubKey = output.scriptPubKey as Record<string, unknown> | undefined;
                    const addresses = (scriptPubKey?.addresses as string[]) || [];
                    const address = addresses[0] || 'Unknown';
                    
                    allRewards.push({
                      txid,
                      address,
                      masternodeReward: 0,
                      stakingReward: valueSatoshis, // Coinbase rewards go to staking reward field for display
                    });
                  }
                });
              } 
              // Staking transaction: totalOutput > totalInput means new coins were generated
              else if (totalOutput > totalInput && totalInput > 0) {
                // Get the staker address (from input)
                const stakerAddress = vin.length > 0 && vin[0].address 
                  ? (vin[0].address as string)
                  : null;
                
                if (!stakerAddress) return;
                
                // Get all outputs with their values and addresses
                const outputsWithValues = vout
                  .map((output) => {
                    const valueBBK = output.value as number | undefined;
                    if (typeof valueBBK === 'number' && valueBBK > 0) {
                      const valueSatoshis = getValueInSatoshis(valueBBK);
                      const scriptPubKey = output.scriptPubKey as Record<string, unknown> | undefined;
                      const addresses = (scriptPubKey?.addresses as string[]) || [];
                      const address = addresses[0] || 'Unknown';
                      return { valueSatoshis, valueBBK, address };
                    }
                    return null;
                  })
                  .filter((o): o is { valueSatoshis: number; valueBBK: number; address: string } => o !== null);
                
                // Find output to staker (same address as input)
                const stakerOutput = outputsWithValues.find(o => o.address === stakerAddress);
                
                // Find masternode output (largest output that is NOT to the staker)
                const masternodeOutput = outputsWithValues
                  .filter(o => o.address !== stakerAddress)
                  .sort((a, b) => b.valueSatoshis - a.valueSatoshis)[0];
                
                // Staking reward = (output to staker) - (input from staker)
                if (stakerOutput) {
                  const stakingRewardSatoshis = stakerOutput.valueSatoshis - totalInput;
                  
                  if (stakingRewardSatoshis > 0) {
                    allRewards.push({
                      txid,
                      address: stakerAddress, // Staking reward goes to the staker
                      masternodeReward: 0,
                      stakingReward: stakingRewardSatoshis,
                    });
                  }
                }
                
                // Masternode reward is the largest output that goes to a different address
                if (masternodeOutput) {
                  allRewards.push({
                    txid,
                    address: masternodeOutput.address, // Masternode reward goes to masternode address
                    masternodeReward: masternodeOutput.valueSatoshis,
                    stakingReward: 0,
                  });
                }
              }
            });
            
            if (allRewards.length === 0) return null;
            
            // Group rewards by address
            const rewardsByAddress = new Map<string, {
              address: string;
              masternodeReward: number;
              stakingReward: number;
            }>();
            
            allRewards.forEach((reward) => {
              if (!rewardsByAddress.has(reward.address)) {
                rewardsByAddress.set(reward.address, {
                  address: reward.address,
                  masternodeReward: 0,
                  stakingReward: 0,
                });
              }
              
              const group = rewardsByAddress.get(reward.address)!;
              group.masternodeReward += reward.masternodeReward;
              group.stakingReward += reward.stakingReward;
            });
            
            // Calculate total block reward
            let totalBlockRewardSatoshis = 0;
            rewardsByAddress.forEach((group) => {
              totalBlockRewardSatoshis += group.masternodeReward + group.stakingReward;
            });
            
            return (
              <div className="card p-4 mb-6 bg-gradient-to-r from-[var(--accent-primary)]/5 to-[var(--accent-secondary)]/5 border border-[var(--accent-primary)]/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[var(--accent-primary)]" />
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">Block Rewards</h3>
                  </div>
                  <div className="text-sm font-bold text-[var(--accent-primary)]">
                    Total: {formatBBK(totalBlockRewardSatoshis)} BBK
                  </div>
                </div>
                <div className="space-y-3">
                  {Array.from(rewardsByAddress.values()).map((group, idx) => {
                    const hasMultipleRewards = group.masternodeReward > 0 && group.stakingReward > 0;
                    const totalReward = group.masternodeReward + group.stakingReward;
                    
                    return (
                      <div key={idx} className="p-3 bg-[var(--bg-tertiary)] rounded-lg">
                        <div className="text-xs text-[var(--text-muted)] mb-2">
                          {formatHash(group.address, 16)}
                        </div>
                        <div className="space-y-1">
                          {group.masternodeReward > 0 && (
                            <div className="text-sm font-medium text-[var(--accent-primary)]">
                              +{formatBBK(group.masternodeReward)} BBK <span className="text-xs text-[var(--text-muted)]">(Masternode)</span>
                            </div>
                          )}
                          {group.stakingReward > 0 && (
                            <div className="text-sm font-medium text-[var(--accent-secondary)]">
                              +{formatBBK(group.stakingReward)} BBK <span className="text-xs text-[var(--text-muted)]">(Staking)</span>
                            </div>
                          )}
                          {hasMultipleRewards && (
                            <div className="pt-1 border-t border-[var(--border-primary)] text-sm font-semibold text-[var(--text-primary)]">
                              Total: +{formatBBK(totalReward)} BBK
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <div className="space-y-4">
            {txids.length === 0 ? (
              <div className="card p-4">
                <p className="text-sm text-[var(--text-muted)]">
                  Transaction list is not available yet (backend currently returns only txids for this block).
                </p>
              </div>
            ) : (
              <>
                {(() => {
                  // Helper to convert value to satoshis
                  const getValueInSatoshis = (value: unknown): number => {
                    if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
                    if (value < 1 && value > 0) return Math.round(value * 100000000);
                    if (value >= 1e12) return Math.round(value);
                    return Math.round(value * 100000000);
                  };
                  
                  return txids.slice(0, 20).map((txid, index) => {
                    const txData = txDetailsQueries[index]?.data as Record<string, unknown> | undefined;
                    const vin = (txData?.vin as Array<Record<string, unknown>>) || [];
                    const vout = (txData?.vout as Array<Record<string, unknown>>) || [];
                    const isLoading = txDetailsQueries[index]?.isLoading;

                    // Helper to extract value (backend returns in BTC, convert to satoshis)
                    const getValueInSatoshis = (value: unknown): number => {
                      if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
                      // Backend returns values in BTC (decimals like 0.01488000), convert to satoshis
                      // If value is very small (< 1), it's definitely in BTC
                      if (value < 1 && value > 0) {
                        return Math.round(value * 100000000);
                      }
                      // If value is >= 1, check if it's reasonable for satoshis (max ~21M BTC = 2.1e15 satoshis)
                      // Values > 1e12 are likely already in satoshis
                      if (value >= 1e12) {
                        return Math.round(value);
                      }
                      // Otherwise assume it's BTC and convert
                      return Math.round(value * 100000000);
                    };

                    // Calculate total input value
                    // Backend now provides value directly in vin
                    const totalInput = vin.reduce((sum, input) => {
                      if (input.coinbase) return sum;
                      const value = (input.value as number | undefined) || 0;
                      return sum + getValueInSatoshis(value);
                    }, 0);

                    // Calculate total output value
                    const totalOutput = vout.reduce((sum, output) => {
                      const value = output.value as number | undefined;
                      return sum + getValueInSatoshis(value || 0);
                    }, 0);

                    const fee = totalInput > 0 && totalOutput > 0 ? totalInput - totalOutput : 0;
                    const isCoinbase = vin.length > 0 && !!vin[0].coinbase;
                    const isStaking = !isCoinbase && totalOutput > totalInput && totalInput > 0; // Staking: new coins generated
                    const isReward = isCoinbase && index === 0; // Coinbase has block rewards
                    
                    // Identify masternode and staking rewards in staking transactions
                    let masternodeOutputIndex: number | null = null;
                    let stakingRewardSatoshis = 0;
                    const stakerAddress = vin.length > 0 && vin[0].address 
                      ? (vin[0].address as string)
                      : null;
                    
                    if (isStaking && stakerAddress) {
                      // Get all outputs with their values and addresses
                      const outputsWithValues = vout
                        .map((output, idx) => {
                          const valueBBK = output.value as number | undefined;
                          if (typeof valueBBK === 'number' && valueBBK > 0) {
                            const valueSatoshis = getValueInSatoshis(valueBBK);
                            const scriptPubKey = output.scriptPubKey as Record<string, unknown> | undefined;
                            const addresses = (scriptPubKey?.addresses as string[]) || [];
                            const address = addresses[0] || 'Unknown';
                            return { index: idx, valueSatoshis, valueBBK, address };
                          }
                          return null;
                        })
                        .filter((o): o is { index: number; valueSatoshis: number; valueBBK: number; address: string } => o !== null);
                      
                      // Find output to staker (same address as input)
                      const stakerOutput = outputsWithValues.find(o => o.address === stakerAddress);
                      
                      // Find masternode output (largest output that is NOT to the staker)
                      const masternodeOutput = outputsWithValues
                        .filter(o => o.address !== stakerAddress)
                        .sort((a, b) => b.valueSatoshis - a.valueSatoshis)[0];
                      
                      if (masternodeOutput) {
                        masternodeOutputIndex = masternodeOutput.index;
                      }
                      
                      // Staking reward = (output to staker) - (input from staker)
                      if (stakerOutput) {
                        stakingRewardSatoshis = stakerOutput.valueSatoshis - totalInput;
                      }
                    }

                  return (
                    <Link
                      key={txid}
                      href={`/tx/${txid}`}
                      className="block card p-5 hover:bg-[var(--bg-hover)] transition-all group"
                    >
                      {/* Transaction Header */}
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--border-primary)]">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="hash-text text-sm font-medium truncate">{formatHash(txid, 20)}</span>
                          {isReward && (
                            <span className="px-2 py-0.5 text-xs rounded-full flex items-center gap-1 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                              <Award className="w-3 h-3" />
                              Block Reward
                            </span>
                          )}
                          {isStaking && (
                            <span className="px-2 py-0.5 text-xs rounded-full flex items-center gap-1 bg-[var(--accent-secondary)]/10 text-[var(--accent-secondary)]">
                              <Award className="w-3 h-3" />
                              Staking Reward
                            </span>
                          )}
                          <ArrowRight className="w-4 h-4 text-[var(--accent-primary)] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {fee > 0 && (
                          <div className="text-xs text-[var(--text-muted)] ml-2">
                            Fee: {formatBBK(fee)} BBK
                          </div>
                        )}
                      </div>

                      {isLoading ? (
                        <div className="text-xs text-[var(--text-muted)] text-center py-4">
                          Loading transaction details...
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Inputs Section */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 rounded bg-[var(--accent-warning)]/10">
                                <ArrowDownLeft className="w-3.5 h-3.5 text-[var(--accent-warning)]" />
                              </div>
                              <span className="text-xs font-medium text-[var(--text-muted)] uppercase">
                                Input{vin.length > 1 ? 's' : ''} ({vin.length})
                              </span>
                            </div>
                            {isCoinbase ? (
                              <div className="pl-8">
                                <div className="text-sm font-medium text-[var(--text-primary)]">Coinbase</div>
                                <div className="text-xs text-[var(--text-muted)] mt-0.5">Block reward</div>
                              </div>
                            ) : (
                              <div className="space-y-2 pl-8">
                                {vin.slice(0, 3).map((input, i) => {
                                  // Backend now provides value and address directly in vin
                                  const value = getValueInSatoshis((input.value as number | undefined) || 0);
                                  const address = (input.address as string) || 'Unknown';

                                  return (
                                    <div key={i} className="p-2 rounded bg-[var(--bg-tertiary)]">
                                      <div className="text-xs text-[var(--text-muted)] mb-1 truncate">
                                        {formatHash(address, 12)}
                                      </div>
                                      <div className="text-sm font-medium text-[var(--text-primary)]">
                                        {formatBBK(value)} BBK
                                      </div>
                                    </div>
                                  );
                                })}
                                {vin.length > 3 && (
                                  <div className="text-xs text-[var(--text-muted)] pt-1">
                                    +{vin.length - 3} more input{vin.length - 3 > 1 ? 's' : ''}
                                  </div>
                                )}
                                {totalInput > 0 && (
                                  <div className="pt-2 border-t border-[var(--border-primary)]">
                                    <div className="text-xs text-[var(--text-muted)]">Total</div>
                                    <div className="text-sm font-semibold text-[var(--text-primary)]">
                                      {formatBBK(totalInput)} BBK
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Outputs Section */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 rounded bg-[var(--accent-success)]/10">
                                <ArrowUpRight className="w-3.5 h-3.5 text-[var(--accent-success)]" />
                              </div>
                              <span className="text-xs font-medium text-[var(--text-muted)] uppercase">
                                Output{vout.length > 1 ? 's' : ''} ({vout.length})
                              </span>
                            </div>
                            <div className="space-y-2 pl-8">
                              {vout.slice(0, 3).map((output, sliceIndex) => {
                                const outputIndex = (output.n as number) ?? sliceIndex;
                                const value = getValueInSatoshis(output.value || 0);
                                const valueBBK = (output.value as number) || 0;
                                const scriptPubKey = output.scriptPubKey as Record<string, unknown> | undefined;
                                const addresses = (scriptPubKey?.addresses as string[]) || [];
                                const address = addresses[0] || 'Unknown';
                                
                                // Check if this output is a reward
                                const isRewardOutput = (isCoinbase && index === 0) || 
                                                      (isStaking && (outputIndex === masternodeOutputIndex || (address === stakerAddress && stakingRewardSatoshis > 0)));
                                const isMasternodeReward = isStaking && outputIndex === masternodeOutputIndex;
                                const isStakingReward = isStaking && address === stakerAddress && stakingRewardSatoshis > 0;

                                return (
                                  <div key={outputIndex} className="p-2 rounded bg-[var(--bg-tertiary)]">
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="text-xs text-[var(--text-muted)] truncate flex-1">
                                        {formatHash(address, 12)}
                                      </div>
                                      {isMasternodeReward && (
                                        <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                                          MN
                                        </span>
                                      )}
                                      {isStakingReward && (
                                        <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-[var(--accent-secondary)]/10 text-[var(--accent-secondary)]">
                                          ST
                                        </span>
                                      )}
                                      {isRewardOutput && !isMasternodeReward && !isStakingReward && (
                                        <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                                          Reward
                                        </span>
                                      )}
                                    </div>
                                    <div className={`text-sm font-medium ${
                                      isMasternodeReward
                                        ? 'text-[var(--accent-primary)]'
                                        : isStakingReward
                                        ? 'text-[var(--accent-secondary)]'
                                        : isRewardOutput
                                        ? 'text-[var(--accent-primary)]'
                                        : 'text-[var(--text-primary)]'
                                    }`}>
                                      {isRewardOutput ? '+' : ''}{formatBBK(value)} BBK
                                    </div>
                                  </div>
                                );
                              })}
                              {vout.length > 3 && (
                                <div className="text-xs text-[var(--text-muted)] pt-1">
                                  +{vout.length - 3} more output{vout.length - 3 > 1 ? 's' : ''}
                                </div>
                              )}
                              {isReward ? (
                                // For coinbase transactions, show total block reward
                                <div className="pt-2 border-t border-[var(--border-primary)]">
                                  <div className="text-xs text-[var(--text-muted)]">Block Reward</div>
                                  <div className="text-sm font-semibold text-[var(--accent-primary)]">
                                    +{formatBBK(totalOutput)} BBK
                                  </div>
                                </div>
                              ) : isStaking ? (
                                // For staking transactions, show masternode and staking rewards
                                <div className="pt-2 border-t border-[var(--border-primary)]">
                                  <div className="space-y-1">
                                    {stakingRewardSatoshis > 0 && (
                                      <div>
                                        <div className="text-xs text-[var(--text-muted)]">Staking Reward</div>
                                        <div className="text-sm font-semibold text-[var(--accent-secondary)]">
                                          +{formatBBK(stakingRewardSatoshis)} BBK
                                        </div>
                                      </div>
                                    )}
                                    {masternodeOutputIndex !== null && (
                                      <div>
                                        <div className="text-xs text-[var(--text-muted)]">Masternode Reward</div>
                                        <div className="text-sm font-semibold text-[var(--accent-primary)]">
                                          +{formatBBK(getValueInSatoshis(vout[masternodeOutputIndex]?.value || 0))} BBK
                                        </div>
                                      </div>
                                    )}
                                    <div className="pt-1 border-t border-[var(--border-primary)]">
                                      <div className="text-xs text-[var(--text-muted)]">New Coins Generated</div>
                                      <div className="text-sm font-semibold text-[var(--text-primary)]">
                                        +{formatBBK(totalOutput - totalInput)} BBK
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : totalOutput > 0 ? (
                                // For regular transactions, show total
                                <div className="pt-2 border-t border-[var(--border-primary)]">
                                  <div className="text-xs text-[var(--text-muted)]">Total</div>
                                  <div className="text-sm font-semibold text-[var(--text-primary)]">
                                    {formatBBK(totalOutput)} BBK
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      )}
                    </Link>
                  );
                  });
                })()}
                {txids.length > 20 && (
                  <p className="text-xs text-[var(--text-muted)] text-center">
                    Showing first 20 of {formatNumber(txids.length)} transactions.
                  </p>
                )}
              </>
            )}
          </div>
        </motion.div>
      </section>
    </div>
  );
}



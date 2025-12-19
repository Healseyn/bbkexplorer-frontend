'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Clock,
  Hash,
  Database,
  Zap,
  Copy,
  Check,
  CheckCircle,
  AlertCircle,
  Blocks,
  Award,
} from 'lucide-react';
import { useState } from 'react';

import { Loading } from '@/components/ui';
import { getTransactionDetails, formatNumber, formatDate, formatBytes, formatHash, formatBBK } from '@/lib/api';
import type { Transaction } from '@/types';

export default function TransactionDetailPage() {
  const params = useParams();
  const txid = params.txid as string;
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Helper to convert value to satoshis
  const getValueInSatoshis = (value: unknown): number => {
    if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
    if (value < 1 && value > 0) return Math.round(value * 100000000);
    if (value >= 1e12) return Math.round(value);
    return Math.round(value * 100000000);
  };

  // Fetch transaction details from API
  const { data: txData, isLoading } = useQuery({
    queryKey: ['transaction', txid],
    queryFn: () => getTransactionDetails(txid),
  });

  // Map API data to UI format
  const tx: Transaction | null = txData ? (() => {
    const vin = (txData.vin as Array<Record<string, unknown>>) || [];
    const vout = (txData.vout as Array<Record<string, unknown>>) || [];
    const txidFromApi = (txData.txid as string) || txid;
    const blockhash = txData.blockhash as string | undefined;
    const blocktime = txData.blocktime as number | undefined;
    const time = txData.time as number | undefined;
    const size = (txData.size as number) || (txData.vsize as number) || 0;
    const confirmations = (txData.confirmations as number) || 0;
    const blockHeight = txData.blockheight as number | undefined;

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

    const fee = totalInput > 0 && totalOutput > 0 ? totalInput - totalOutput : 0;
    const feeRate = size > 0 ? fee / size : 0;
    const isCoinbase = vin.length > 0 && !!vin[0].coinbase;
    const isStaking = !isCoinbase && totalOutput > totalInput && totalInput > 0;

    // Map inputs
    const inputs = vin.map((input, index) => {
      const prevout = input.prevout as Record<string, unknown> | undefined;
      const prevoutValue = prevout?.value as number | undefined;
      const value = (input.value as number | undefined) || prevoutValue || 0;
      const address = (input.address as string) || undefined;
      const txidInput = (input.txid as string) || '';
      const voutIndex = (input.vout as number) ?? (input.n as number) ?? index;
      const sequence = (input.sequence as number) ?? 0xffffffff;

      return {
        txid: txidInput,
        vout: voutIndex,
        address,
        value: getValueInSatoshis(value),
        scriptSig: undefined,
        sequence,
      };
    });

    // Identify staking rewards
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

    // Map outputs
    const outputs = vout.map((output, index) => {
      const value = output.value as number | undefined;
      const n = (output.n as number) ?? index;
      const scriptPubKey = output.scriptPubKey as Record<string, unknown> | undefined;
      const addresses = (scriptPubKey?.addresses as string[]) || [];
      const address = addresses[0] || undefined;
      const scriptPubKeyHex = (output.scriptPubKey as string | undefined) || 
                              (scriptPubKey?.hex as string | undefined) || 
                              '';

      const isMasternodeReward = isStaking && index === masternodeOutputIndex;
      const isStakingReward = isStaking && address === stakerAddress && stakingRewardSatoshis > 0;
      const isRewardOutput = isCoinbase || isMasternodeReward || isStakingReward;

      return {
        n,
        address,
        value: getValueInSatoshis(value || 0),
        scriptPubKey: scriptPubKeyHex,
        spent: false, // API doesn't provide this info
        spentBy: undefined,
        isRewardOutput,
        isMasternodeReward,
        isStakingReward,
      };
    });

    // Determine timestamp
    const timestamp = blocktime || time || Math.floor(Date.now() / 1000);

    // A transaction is confirmed only when it has 6 or more confirmations (same as blocks)
    const confirmed = confirmations >= 6;

    return {
      txid: txidFromApi,
      blockHash: blockhash,
      blockHeight,
      timestamp,
      size,
      fee,
      feeRate,
      confirmed,
      confirmations,
      inputs,
      outputs,
      totalInput,
      totalOutput,
      isCoinbase,
      isStaking,
    };
  })() : null;

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading text="Loading transaction details..." size="large" />
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Transaction Not Found</h1>
          <p className="text-[var(--text-muted)] mb-4">The transaction you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/" className="text-[var(--accent-primary)] hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

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
            <Link href="/transactions" className="hover:text-[var(--accent-primary)] transition-colors">
              Transactions
            </Link>
            <span>/</span>
            <span className="text-[var(--text-primary)]">{formatHash(tx.txid, 8)}</span>
          </div>

          {/* Transaction Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${tx.confirmed ? 'bg-[var(--accent-success)]/20' : 'bg-[var(--accent-warning)]/20'}`}>
                {tx.confirmed ? (
                  <CheckCircle className="w-8 h-8 text-[var(--accent-success)]" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-[var(--accent-warning)]" />
                )}
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
                  Transaction
                </h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {(() => {
                    const confirmations = tx.confirmations || 0;
                    const isUnconfirmed = confirmations < 6;
                    const confirmationText = isUnconfirmed ? `${confirmations}/6` : 'Confirmed';
                    
                    return isUnconfirmed ? (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--accent-warning)]/10 text-[var(--accent-warning)]">
                        {confirmationText}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--accent-success)]/10 text-[var(--accent-success)]">
                        {confirmationText}
                      </span>
                    );
                  })()}
                  {tx.isCoinbase && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Block Reward
                    </span>
                  )}
                  {tx.isStaking && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--accent-secondary)]/10 text-[var(--accent-secondary)] flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Staking Reward
                    </span>
                  )}
                  {tx.blockHeight && (
                    <Link
                      href={`/block/${tx.blockHeight}`}
                      className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--accent-primary)]"
                    >
                      <Blocks className="w-3 h-3" />
                      Block #{formatNumber(tx.blockHeight)}
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Amount */}
            <div className="text-right">
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {formatBBK(tx.totalOutput)} <span className="text-[var(--accent-primary)]">BBK</span>
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                Fee: {formatNumber(tx.fee)} sats ({tx.feeRate.toFixed(1)} sat/vB)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transaction Details */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TXID */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card p-6 mb-6"
        >
          <label className="text-sm text-[var(--text-muted)] block mb-2">Transaction ID</label>
          <div className="flex items-center gap-2 p-3 bg-[var(--bg-tertiary)] rounded-lg">
            <span className="hash-text flex-1 break-all">{tx.txid}</span>
            <button
              onClick={() => copyToClipboard(tx.txid, 'txid')}
              className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-all"
            >
              {copiedField === 'txid' ? (
                <Check className="w-4 h-4 text-[var(--accent-success)]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="card p-4">
            <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Timestamp</span>
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{formatDate(tx.timestamp)}</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
              <Database className="w-4 h-4" />
              <span className="text-xs">Size</span>
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{formatBytes(tx.size)}</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xs">Fee Rate</span>
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{tx.feeRate.toFixed(1)} sat/vB</p>
          </div>
        </motion.div>

        {/* Inputs and Outputs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Inputs & Outputs</h2>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Inputs */}
            <div>
              <h3 className="text-sm font-medium text-[var(--text-muted)] mb-4">
                Inputs ({tx.inputs.length})
              </h3>
              <div className="space-y-3">
                {tx.isCoinbase ? (
                  <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
                    <span className="text-[var(--accent-primary)] flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Coinbase (Block Reward)
                    </span>
                  </div>
                ) : tx.inputs.length === 0 ? (
                  <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
                    <span className="text-[var(--text-muted)]">No inputs</span>
                  </div>
                ) : (
                  tx.inputs.map((input, index) => (
                    <div key={index} className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-[var(--text-muted)]">#{index}</span>
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                          {formatBBK(input.value)} BBK
                        </span>
                      </div>
                      {input.address ? (
                        <Link
                          href={`/address/${input.address}`}
                          className="hash-text text-sm hover:underline block truncate"
                        >
                          {input.address}
                        </Link>
                      ) : (
                        <span className="text-sm text-[var(--text-muted)]">Unknown</span>
                      )}
                      {input.txid && (
                        <div className="mt-2 text-xs text-[var(--text-muted)]">
                          <Link href={`/tx/${input.txid}`} className="hover:text-[var(--accent-primary)]">
                            {formatHash(input.txid, 10)}:{input.vout}
                          </Link>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 p-3 bg-[var(--bg-tertiary)] rounded-lg text-right">
                <span className="text-sm text-[var(--text-muted)]">Total Input: </span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {formatBBK(tx.totalInput)} BBK
                </span>
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden lg:flex items-center justify-center absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
              <ArrowRight className="w-6 h-6 text-[var(--accent-primary)]" />
            </div>

            {/* Outputs */}
            <div>
              <h3 className="text-sm font-medium text-[var(--text-muted)] mb-4">
                Outputs ({tx.outputs.length})
              </h3>
              <div className="space-y-3">
                {tx.outputs.map((output, index) => (
                  <div key={index} className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[var(--text-muted)]">#{output.n}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${
                          output.isMasternodeReward
                            ? 'text-[var(--accent-primary)]'
                            : output.isStakingReward
                            ? 'text-[var(--accent-secondary)]'
                            : output.isRewardOutput
                            ? 'text-[var(--accent-primary)]'
                            : 'text-[var(--text-primary)]'
                        }`}>
                          {output.isRewardOutput ? '+' : ''}{formatBBK(output.value)} BBK
                        </span>
                        {output.isMasternodeReward && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                            MN
                          </span>
                        )}
                        {output.isStakingReward && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--accent-secondary)]/10 text-[var(--accent-secondary)]">
                            ST
                          </span>
                        )}
                        {output.isRewardOutput && !output.isMasternodeReward && !output.isStakingReward && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                            Reward
                          </span>
                        )}
                        {output.spent ? (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--accent-error)]/10 text-[var(--accent-error)]">
                            Spent
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--accent-success)]/10 text-[var(--accent-success)]">
                            Unspent
                          </span>
                        )}
                      </div>
                    </div>
                    {output.address ? (
                      <Link
                        href={`/address/${output.address}`}
                        className="hash-text text-sm hover:underline block truncate"
                      >
                        {output.address}
                      </Link>
                    ) : (
                      <span className="text-sm text-[var(--text-muted)]">OP_RETURN</span>
                    )}
                    {output.spentBy && (
                      <div className="mt-2 text-xs text-[var(--text-muted)]">
                        Spent by:{' '}
                        <Link href={`/tx/${output.spentBy}`} className="hover:text-[var(--accent-primary)]">
                          {formatHash(output.spentBy, 10)}
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-[var(--bg-tertiary)] rounded-lg text-right">
                <span className="text-sm text-[var(--text-muted)]">Total Output: </span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {formatBBK(tx.totalOutput)} BBK
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}



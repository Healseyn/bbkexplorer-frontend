import axios from 'axios';
import type {
  Block,
  Transaction,
  Address,
  AddressTransaction,
  NetworkStats,
  PaginatedResponse,
  SearchResult,
  MempoolTransaction,
} from '@/types';

// API base URL - configure via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Network Stats
export async function getNetworkStats(): Promise<NetworkStats> {
  const { data } = await api.get<NetworkStats>('/stats');
  return data;
}

// Blocks
export async function getLatestBlocks(limit = 10): Promise<Block[]> {
  const { data } = await api.get<Block[]>('/blocks', {
    params: { limit },
  });
  return data;
}

export async function getBlocks(page = 1, pageSize = 20): Promise<PaginatedResponse<Block>> {
  const { data } = await api.get<PaginatedResponse<Block>>('/blocks', {
    params: { page, pageSize },
  });
  return data;
}

export async function getBlock(hashOrHeight: string | number): Promise<Block> {
  const { data } = await api.get<Block>(`/block/${hashOrHeight}`);
  return data;
}

export async function getBlockTransactions(
  hashOrHeight: string | number,
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<Transaction>> {
  const { data } = await api.get<PaginatedResponse<Transaction>>(
    `/block/${hashOrHeight}/transactions`,
    { params: { page, pageSize } }
  );
  return data;
}

// Transactions
export async function getLatestTransactions(limit = 10): Promise<Transaction[]> {
  const { data } = await api.get<Transaction[]>('/transactions', {
    params: { limit },
  });
  return data;
}

export async function getTransaction(txid: string): Promise<Transaction> {
  const { data } = await api.get<Transaction>(`/tx/${txid}`);
  return data;
}

// Addresses
export async function getAddress(address: string): Promise<Address> {
  const { data } = await api.get<Address>(`/address/${address}`);
  return data;
}

export async function getAddressTransactions(
  address: string,
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<AddressTransaction>> {
  const { data } = await api.get<PaginatedResponse<AddressTransaction>>(
    `/address/${address}/transactions`,
    { params: { page, pageSize } }
  );
  return data;
}

// Search
export async function search(query: string): Promise<SearchResult | null> {
  try {
    const { data } = await api.get<SearchResult>('/search', {
      params: { q: query },
    });
    return data;
  } catch {
    return null;
  }
}

// Mempool
export async function getMempoolTransactions(
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<MempoolTransaction>> {
  const { data } = await api.get<PaginatedResponse<MempoolTransaction>>('/mempool', {
    params: { page, pageSize },
  });
  return data;
}

// Utility functions
export function formatHash(hash: string, chars = 8): string {
  if (hash.length <= chars * 2) return hash;
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatBBK(satoshis: number): string {
  const bbk = satoshis / 100000000;
  return bbk.toLocaleString('en-US', {
    minimumFractionDigits: 8,
    maximumFractionDigits: 8,
  });
}

/** @deprecated Use formatBBK instead */
export const formatBTC = formatBBK;

export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}


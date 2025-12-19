import axios from 'axios';
import type {
  Block,
  Transaction,
  TransactionInput,
  TransactionOutput,
  Address,
  AddressTransaction,
  NetworkStats,
  PaginatedResponse,
  SearchResult,
  MempoolTransaction,
  Masternode,
  MasternodesListResponse,
  StakingStatus,
  ApiHealth,
  Peer,
  PeersResponse,
} from '@/types';
import { getCachedBlock, cacheBlock, cacheBlocks } from './block-cache';

type ApiErrorPayload = { code?: string; message?: string };
type ApiResponse<T> = { success: true; data: T } | { success: false; error: ApiErrorPayload };

function normalizeApiRoot(url: string): string {
  // Accept both "...", ".../", ".../api", ".../api/" and normalize to API root (without trailing "/api")
  let out = url.trim();
  if (!out) return out;
  out = out.replace(/\/+$/, '');
  if (out.endsWith('/api')) out = out.slice(0, -4);
  return out;
}

function unwrap<T>(payload: ApiResponse<T>): T {
  if (payload && typeof payload === 'object' && 'success' in payload) {
    if (payload.success) return payload.data;
    const msg = payload.error?.message || payload.error?.code || 'Request failed';
    throw new Error(msg);
  }
  // If backend ever returns raw JSON, keep it usable
  return payload as unknown as T;
}

// API root URL - configure via environment variable (can be either root or ".../api")
const API_ROOT_URL = normalizeApiRoot(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');

const api = axios.create({
  baseURL: API_ROOT_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Network Stats
export async function getNetworkStats(): Promise<NetworkStats> {
  const { data } = await api.get<ApiResponse<NetworkStats>>('/api/stats');
  return unwrap(data);
}

// API Health
export async function getApiHealth(): Promise<ApiHealth> {
  try {
    // The actual API returns: { success: true, message: "...", timestamp: "..." }
    // Not the standard format with data wrapper
    const response = await api.get<{ success: boolean; message: string; timestamp: string } | ApiResponse<ApiHealth>>('/api/health');
    const data = response.data;
    
    // Handle the actual API response format which has message and timestamp at root level
    if (data && typeof data === 'object' && 'success' in data) {
      if (data.success) {
        // Check if it's the standard format with data wrapper
        if ('data' in data && data.data) {
          return unwrap(data as ApiResponse<ApiHealth>);
        }
        // Handle the actual format: { success: true, message: "...", timestamp: "..." }
        const healthData = data as { success: boolean; message: string; timestamp: string };
        if ('message' in healthData && 'timestamp' in healthData) {
          return {
            message: healthData.message,
            timestamp: healthData.timestamp,
          };
        }
      }
      // If success is false, check for error
      if (!data.success && 'error' in data) {
        throw new Error((data as { error: { message?: string; code?: string } }).error?.message || 'Request failed');
      }
    }
    
    // Fallback: try to unwrap anyway
    return unwrap(data as ApiResponse<ApiHealth>);
  } catch (error) {
    // Return a default error response instead of throwing
    // This ensures React Query always receives a value
    return {
      message: 'API is unavailable',
      timestamp: new Date().toISOString(),
    };
  }
}

// Blocks
export async function getLatestBlocks(limit = 10): Promise<Block[]> {
  // Back-compat helper: use the current backend-contract endpoints (no /api/blocks pagination)
  return getLatestNBlocks(limit);
}

export async function getBlocks(page = 1, pageSize = 20): Promise<PaginatedResponse<Block>> {
  // Legacy endpoint (not part of the current backend contract)
  const { data } = await api.get<ApiResponse<PaginatedResponse<Block>>>('/api/blocks', {
    params: { page, limit: pageSize, order: 'desc' },
  });
  return unwrap(data);
}

export async function getBlock(hashOrHeight: string | number): Promise<Block> {
  // Legacy endpoint (not part of the current backend contract)
  const { data } = await api.get<ApiResponse<Block>>(`/api/block/${hashOrHeight}`);
  return unwrap(data);
}

export async function getBlockTransactions(
  hashOrHeight: string | number,
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<Transaction>> {
  // Legacy endpoint (not part of the current backend contract)
  const { data } = await api.get<ApiResponse<PaginatedResponse<Transaction>>>(
    `/api/block/${hashOrHeight}/transactions`,
    { params: { page, pageSize } }
  );
  return unwrap(data);
}

// Transactions
export async function getLatestTransactions(limit = 10): Promise<Transaction[]> {
  // Use the new /api/transactions/recent endpoint
  const { data } = await api.get<ApiResponse<Record<string, unknown>[]>>('/api/transactions/recent');
  const rawTransactions = unwrap(data);
  
  // Map the API response to Transaction format
  return rawTransactions.slice(0, limit).map(mapBackendTransactionToTransaction);
}

export async function getTransactionsTotal(): Promise<number> {
  const { data } = await api.get<ApiResponse<{ transactions: number }>>('/api/transactions/total');
  return unwrap(data).transactions;
}

export async function getTransaction(txid: string): Promise<Transaction> {
  // Legacy endpoint (not part of the current backend contract)
  const { data } = await api.get<ApiResponse<Transaction>>(`/api/tx/${txid}`);
  return unwrap(data);
}

// Backend-contract endpoint: get raw transaction with verbose details
export async function getTransactionDetails(txid: string): Promise<Record<string, unknown>> {
  const { data } = await api.get<ApiResponse<Record<string, unknown>>>(`/api/transactions/${txid}`, {
    params: { verbose: 1 },
  });
  return unwrap(data);
}

// Addresses
export async function getAddress(
  address: string,
  page = 1,
  limit = 20
): Promise<Address> {
  const { data } = await api.get<ApiResponse<Address>>(`/api/address/${address}`, {
    params: { page, limit },
  });
  return unwrap(data);
}

// Legacy function for backward compatibility (deprecated)
export async function getAddressTransactions(
  address: string,
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<AddressTransaction>> {
  // Use the new endpoint and extract transactions
  const addressData = await getAddress(address, page, pageSize);
  return {
    data: addressData.transactions,
    total: addressData.pagination.total,
    page: addressData.pagination.page,
    pageSize: addressData.pagination.limit,
    hasMore: addressData.pagination.page < addressData.pagination.totalPages,
  };
}

// Masternodes
export async function getMasternodes(page = 1, pageSize = 50): Promise<PaginatedResponse<Masternode>> {
  const { data } = await api.get<ApiResponse<PaginatedResponse<Masternode>>>('/api/masternodes', {
    params: { page, pageSize },
  });
  return unwrap(data);
}

// New endpoint: Get all masternodes (active and inactive)
export async function getMasternodesList(): Promise<MasternodesListResponse> {
  const { data } = await api.get<ApiResponse<MasternodesListResponse>>('/api/masternodes');
  return unwrap(data);
}

export async function getMasternodeByTxHash(txhash: string): Promise<Masternode> {
  const { data } = await api.get<ApiResponse<Masternode>>(`/api/masternodes/${txhash}`);
  return unwrap(data);
}

// Peers
export async function getPeers(): Promise<PeersResponse> {
  const { data } = await api.get<ApiResponse<PeersResponse>>('/api/peers');
  return unwrap(data);
}

// Staking
export async function getStakingStatus(): Promise<StakingStatus> {
  const { data } = await api.get<ApiResponse<StakingStatus>>('/api/staking/status');
  return unwrap(data);
}

// Search
export async function search(query: string): Promise<SearchResult | null> {
  try {
    const { data } = await api.get<ApiResponse<SearchResult>>('/api/search', {
      params: { q: query },
    });
    return unwrap(data);
  } catch {
    return null;
  }
}

// Mempool
export async function getMempoolTransactions(
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<MempoolTransaction>> {
  // Legacy endpoint (not part of the current backend contract)
  const { data } = await api.get<ApiResponse<PaginatedResponse<MempoolTransaction>>>('/api/mempool', {
    params: { page, pageSize },
  });
  return unwrap(data);
}

// Backend-contract endpoint: get mempool transactions
export async function getMempoolTxids(verbose = false): Promise<string[] | Record<string, unknown>> {
  const { data } = await api.get<ApiResponse<string[] | Record<string, unknown>>>('/api/transactions/mempool', {
    params: { verbose: verbose ? 'true' : 'false' },
  });
  return unwrap(data);
}

// ===== Backend-contract endpoints (current BitBlocks Explorer API) =====
export async function getChainHeight(): Promise<number> {
  const { data } = await api.get<ApiResponse<{ height: number }>>('/api/blocks/height');
  return unwrap(data).height;
}

export async function getLatestBlock(): Promise<Block> {
  const { block } = await getBlockDetails('latest');
  return block;
}

export async function getBlockByIdentifier(identifier: string | number, currentHeight?: number): Promise<Block> {
  // Não usar cache para 'latest'
  if (identifier === 'latest') {
    const { block } = await getBlockDetails(identifier, currentHeight);
    return block;
  }

  // Tentar buscar do cache primeiro
  const cached = getCachedBlock(identifier);
  if (cached) {
    return cached;
  }

  // Se não estiver no cache, buscar da API
  const { block } = await getBlockDetails(identifier, currentHeight);
  
  // Salvar no cache se estiver confirmado
  if (currentHeight !== undefined && block.height < currentHeight) {
    cacheBlock(block, currentHeight);
  } else if (block.confirmations > 0) {
    cacheBlock(block, currentHeight);
  }

  return block;
}

export async function getBlockDetails(
  identifier: string | number,
  currentHeight?: number
): Promise<{ block: Block; txids: string[] }> {
  // Não usar cache para 'latest'
  if (identifier === 'latest') {
    const path = '/api/blocks/latest';
    const { data } = await api.get<ApiResponse<Record<string, unknown>>>(path);
    const raw = unwrap(data);
    const block = mapBackendBlockToBlock(raw);

    const tx = (raw as Record<string, unknown>).tx;
    const txids = Array.isArray(tx) ? tx.filter((t): t is string => typeof t === 'string') : [];

    return { block, txids };
  }

  // Tentar buscar do cache primeiro
  const cached = getCachedBlock(identifier);
  if (cached) {
    // Para blocos em cache, ainda precisamos buscar os txids da API
    // Mas podemos otimizar isso no futuro se necessário
    const path = `/api/blocks/${identifier}`;
    try {
      const { data } = await api.get<ApiResponse<Record<string, unknown>>>(path);
      const raw = unwrap(data);
      const tx = (raw as Record<string, unknown>).tx;
      const txids = Array.isArray(tx) ? tx.filter((t): t is string => typeof t === 'string') : [];
      return { block: cached, txids };
    } catch {
      // Se falhar, retornar com txids vazios
      return { block: cached, txids: [] };
    }
  }

  // Se não estiver no cache, buscar da API
  const path = `/api/blocks/${identifier}`;
  const { data } = await api.get<ApiResponse<Record<string, unknown>>>(path);
  const raw = unwrap(data);
  const block = mapBackendBlockToBlock(raw);

  const tx = (raw as Record<string, unknown>).tx;
  const txids = Array.isArray(tx) ? tx.filter((t): t is string => typeof t === 'string') : [];

  // Salvar no cache se estiver confirmado
  if (currentHeight !== undefined && block.height < currentHeight) {
    cacheBlock(block, currentHeight);
  } else if (block.confirmations > 0) {
    cacheBlock(block, currentHeight);
  }

  return { block, txids };
}

export async function getLatestNBlocks(limit = 20, concurrency = 6): Promise<Block[]> {
  const height = await getChainHeight();
  const heights = Array.from({ length: limit }, (_, i) => height - i).filter((h) => h >= 0);

  const out: Block[] = [];
  for (let i = 0; i < heights.length; i += concurrency) {
    const batch = heights.slice(i, i + concurrency);
    // Passar currentHeight para usar cache e salvar blocos confirmados
    const blocks = await Promise.all(batch.map((h) => getBlockByIdentifier(h, height)));
    out.push(...blocks);
    
    // Salvar blocos confirmados em lote
    const confirmedBlocks = blocks.filter(block => block.height < height || block.confirmations > 0);
    if (confirmedBlocks.length > 0) {
      cacheBlocks(confirmedBlocks, height);
    }
  }
  return out;
}

function pickNumber(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v);
  return undefined;
}

function pickString(v: unknown): string | undefined {
  if (typeof v === 'string' && v.trim() !== '') return v;
  return undefined;
}

// Mapper tolerante: backend pode usar nomes do Bitcoin Core (e.g. merkleroot, previousblockhash, nTx, time)
function mapBackendBlockToBlock(raw: Record<string, unknown>): Block {
  const hash = pickString(raw.hash) || pickString(raw.blockhash) || '';
  const height = pickNumber(raw.height) ?? pickNumber(raw.blockHeight) ?? 0;
  let timestamp = pickNumber(raw.timestamp) ?? pickNumber(raw.time) ?? pickNumber(raw.mediantime) ?? 0;
  // Normalize: if timestamp > 1e10, it's in milliseconds, convert to seconds
  if (timestamp > 1e10) timestamp = Math.floor(timestamp / 1000);

  const txCount =
    pickNumber(raw.txCount) ??
    pickNumber(raw.tx_count) ??
    pickNumber(raw.nTx) ??
    (Array.isArray(raw.tx) ? raw.tx.length : 0);

  const size = pickNumber(raw.size) ?? pickNumber(raw.strippedsize) ?? 0;
  const version = pickNumber(raw.version) ?? 0;
  const merkleRoot = pickString(raw.merkleRoot) || pickString(raw.merkleroot) || '';
  const previousBlockHash =
    pickString(raw.previousBlockHash) || pickString(raw.previousblockhash) || '';
  const nextBlockHash = pickString(raw.nextBlockHash) || pickString(raw.nextblockhash);
  const nonce = pickNumber(raw.nonce) ?? 0;
  const bits = pickString(raw.bits) || '';
  const difficulty = pickNumber(raw.difficulty) ?? 0;
  const chainwork = pickString(raw.chainwork);
  const confirmations = pickNumber(raw.confirmations) ?? 0;

  return {
    hash,
    height,
    timestamp,
    txCount,
    size,
    version,
    merkleRoot,
    previousBlockHash,
    nextBlockHash,
    nonce,
    bits,
    difficulty,
    chainwork,
    confirmations,
  };
}

// Mapper for transactions from /api/transactions/recent endpoint
function mapBackendTransactionToTransaction(raw: Record<string, unknown>): Transaction {
  const txid = pickString(raw.txid) || '';
  const blockhash = pickString(raw.blockhash);
  const confirmations = pickNumber(raw.confirmations) ?? 0;
  // A transaction is confirmed only when it has 6 or more confirmations (same as blocks)
  const confirmed = confirmations >= 6;
  
  // Timestamp: prefer time, fallback to blocktime
  let timestamp = pickNumber(raw.time) ?? pickNumber(raw.blocktime) ?? 0;
  // Normalize: if timestamp > 1e10, it's in milliseconds, convert to seconds
  if (timestamp > 1e10) timestamp = Math.floor(timestamp / 1000);

  // Map inputs (vin)
  const vin = Array.isArray(raw.vin) ? raw.vin : [];
  const inputs: TransactionInput[] = vin.map((input: unknown) => {
    if (typeof input !== 'object' || input === null) {
      return {
        txid: '',
        vout: 0,
        value: 0,
        sequence: 0,
      };
    }
    
    const inp = input as Record<string, unknown>;
    
    // Coinbase transaction
    if ('coinbase' in inp) {
      return {
        txid: '',
        vout: 0,
        value: 0,
        sequence: pickNumber(inp.sequence) ?? 0,
      };
    }
    
    // Regular input
    return {
      txid: pickString(inp.txid) || '',
      vout: pickNumber(inp.vout) ?? 0,
      address: pickString(inp.address),
      value: pickNumber(inp.value) ?? 0,
      scriptSig: typeof inp.scriptSig === 'object' && inp.scriptSig !== null
        ? pickString((inp.scriptSig as Record<string, unknown>).hex)
        : undefined,
      sequence: pickNumber(inp.sequence) ?? 0,
    };
  });

  // Map outputs (vout)
  const vout = Array.isArray(raw.vout) ? raw.vout : [];
  const outputs: TransactionOutput[] = vout.map((output: unknown) => {
    if (typeof output !== 'object' || output === null) {
      return {
        n: 0,
        value: 0,
        scriptPubKey: '',
        spent: false,
      };
    }
    
    const out = output as Record<string, unknown>;
    const scriptPubKey = typeof out.scriptPubKey === 'object' && out.scriptPubKey !== null
      ? (out.scriptPubKey as Record<string, unknown>)
      : {};
    
    // Extract address from scriptPubKey.addresses array
    let address: string | undefined;
    if (Array.isArray(scriptPubKey.addresses) && scriptPubKey.addresses.length > 0) {
      address = pickString(scriptPubKey.addresses[0]);
    }
    
    return {
      n: pickNumber(out.n) ?? 0,
      address,
      value: pickNumber(out.value) ?? 0,
      scriptPubKey: pickString(scriptPubKey.hex) || pickString(scriptPubKey.asm) || '',
      spent: false, // API doesn't provide spent info
      spentBy: undefined,
    };
  });

  // Calculate totals
  const totalInput = inputs.reduce((sum, input) => sum + (input.value || 0), 0);
  const totalOutput = outputs.reduce((sum, output) => sum + (output.value || 0), 0);
  const fee = Math.max(0, totalInput - totalOutput);
  
  // Size: estimate based on transaction structure if not provided
  // For now, we'll use a default or calculate a rough estimate
  const size = pickNumber(raw.size) ?? 0;
  const feeRate = size > 0 ? fee / size : 0;

  // Get block height if available (would need to fetch block details)
  // For now, we'll leave it undefined and it can be populated later if needed
  const blockHeight = undefined;

  return {
    txid,
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
  };
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

export function formatBBKDirect(bbk: number): string {
  return bbk.toLocaleString('en-US', {
    minimumFractionDigits: 8,
    maximumFractionDigits: 8,
  });
}

/** @deprecated Use formatBBK instead */
export const formatBTC = formatBBK;

export function formatTimeAgo(timestamp: number, nowMs?: number): string {
  // Normalize timestamp: if it's > 1e10, it's in milliseconds, convert to seconds
  const tsSeconds = timestamp > 1e10 ? Math.floor(timestamp / 1000) : Math.floor(timestamp);
  const now = nowMs ? Math.floor(nowMs / 1000) : Math.floor(Date.now() / 1000);
  const seconds = Math.max(0, now - tsSeconds); // Ensure non-negative
  
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
    timeZone: 'UTC',
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

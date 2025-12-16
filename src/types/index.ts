// Block types
export interface Block {
  hash: string;
  height: number;
  timestamp: number;
  txCount: number;
  size: number;
  weight: number;
  version: number;
  merkleRoot: string;
  previousBlockHash: string;
  nonce: number;
  bits: string;
  difficulty: number;
  miner?: string;
  reward?: number;
}

// Transaction types
export interface Transaction {
  txid: string;
  blockHash?: string;
  blockHeight?: number;
  timestamp: number;
  size: number;
  weight: number;
  fee: number;
  feeRate: number;
  confirmed: boolean;
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
  totalInput: number;
  totalOutput: number;
}

export interface TransactionInput {
  txid: string;
  vout: number;
  address?: string;
  value: number;
  scriptSig?: string;
  sequence: number;
}

export interface TransactionOutput {
  n: number;
  address?: string;
  value: number;
  scriptPubKey: string;
  spent: boolean;
  spentBy?: string;
}

// Address types
export interface Address {
  address: string;
  balance: number;
  totalReceived: number;
  totalSent: number;
  txCount: number;
  unconfirmedBalance: number;
  unconfirmedTxCount: number;
}

export interface AddressTransaction {
  txid: string;
  timestamp: number;
  blockHeight?: number;
  confirmed: boolean;
  value: number; // Positive for received, negative for sent
  balance: number; // Balance after this transaction
}

// Network stats
export interface NetworkStats {
  blockHeight: number;
  difficulty: number;
  hashRate: string;
  mempoolSize: number;
  mempoolBytes: number;
  avgBlockTime: number;
  avgFee: number;
  totalTransactions: number;
  marketCap?: number;
  price?: number;
  priceChange24h?: number;
  masternodes?: number;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface SearchResult {
  type: 'block' | 'transaction' | 'address';
  data: Block | Transaction | Address;
}

// Mempool transaction
export interface MempoolTransaction {
  txid: string;
  size: number;
  fee: number;
  feeRate: number;
  timestamp: number;
}


// Block types
export interface Block {
  hash: string;
  height: number;
  timestamp: number;
  txCount: number;
  size: number;
  // weight field removed as BitBlocks does not use SegWit
  version: number;
  merkleRoot: string;
  previousBlockHash: string;
  nextBlockHash?: string;
  nonce: number;
  bits: string;
  difficulty: number;
  chainwork?: string;
  confirmations: number;
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
  // weight field removed
  fee: number;
  feeRate: number;
  confirmed: boolean;
  confirmations?: number;
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
  totalInput: number;
  totalOutput: number;
  isCoinbase?: boolean;
  isStaking?: boolean;
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
  isRewardOutput?: boolean;
  isMasternodeReward?: boolean;
  isStakingReward?: boolean;
}

// Address types
export interface Address {
  address: string;
  balance: number;
  received: number;
  sent: number;
  transactionCount: number;
  firstSeen: number;
  lastSeen: number;
  transactions: AddressTransaction[];
  pagination: AddressPagination;
}

export interface AddressTransaction {
  txid: string;
  blockHeight: number;
  time: number;
  confirmations: number;
  value: number;
  type: 'sent' | 'received' | 'both';
}

export interface AddressPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Legacy Address type (for backward compatibility)
export interface LegacyAddress {
  address: string;
  balance: number;
  totalReceived: number;
  totalSent: number;
  txCount: number;
  unconfirmedBalance: number;
  unconfirmedTxCount: number;
}

// Masternode types
export interface Masternode {
  rank: number | null;
  network: 'ipv4' | 'ipv6' | 'onion';
  txhash: string;
  outidx: number;
  status: 'ENABLED' | 'EXPIRED' | 'VIN_SPENT' | 'REMOVE' | 'POS_ERROR';
  addr: string;
  version: number;
  lastseen: number;
  activetime: number;
  lastpaid: number | null;
  activeTime: number;
  offlineTime: number;
}

export interface MasternodesListResponse {
  active: Masternode[];
  inactive: Masternode[];
  total: {
    active: number;
    inactive: number;
    total: number;
  };
}

export interface MasternodeCount {
  total: number;
  stable: number;
  enabled: number;
  inqueue: number;
  ipv4: number;
  ipv6: number;
  onion: number;
}

// Staking Status
export interface StakingStatus {
  stakingEnabled: boolean;
  stakingActive: boolean;
  stakingStatus: string;
  hashesPerSec?: number;
  netStakeWeight?: number;
  expectedTime?: number;
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
  // BitBlocks specific fields
  masternodes: MasternodeCount;
  stakingStatus?: StakingStatus;
  connections?: number;
  protocolVersion?: number;
  // Market data (optional)
  marketCap?: number;
  price?: number;
  priceChange24h?: number;
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
  type: 'block' | 'transaction' | 'address' | 'masternode';
  data: Block | Transaction | Address | Masternode;
}

// Mempool transaction
export interface MempoolTransaction {
  txid: string;
  size: number;
  fee: number;
  feeRate: number;
  timestamp: number;
}

// API Health
export interface ApiHealth {
  message: string;
  timestamp: string; // ISO 8601 format
}

// Peer types
export interface Peer {
  id: number;
  addr: string;
  services: string;
  lastsend: number;
  lastrecv: number;
  lastseen: number;
  lastseenFormatted: string;
  conntime: number;
  conntimeFormatted: string;
  connectionDuration: number;
  connectionDurationFormatted: string;
  version: number;
  subver: string;
  startingheight: number;
  banscore: number;
  synced_headers: number;
  synced_blocks: number;
}

export interface PeersResponse {
  peers: Peer[];
  total: number;
  active: number;
  stored: number;
}

// Mock data for development
export const mockStats = {
  blockHeight: 823456,
  difficulty: 72006146478567.1,
  hashRate: '567.23 EH/s',
  mempoolSize: 34521,
  mempoolBytes: 156789012,
  avgBlockTime: 60,
  avgFee: 1000,
  totalTransactions: 934567890,
  price: 0.05,
  priceChange24h: 5.2,
  masternodes: {
    total: 1250,
    stable: 1200,
    enabled: 1150,
    inqueue: 100,
    ipv4: 1000,
    ipv6: 200,
    onion: 50
  },
  stakingStatus: {
    stakingEnabled: true,
    stakingActive: true,
    stakingStatus: "Staking Active",
    expectedTime: 86400
  }
};

export const mockBlocks = [
  { hash: '0000000000000000000234abc567def890123456789abcdef0123456789abcdef', height: 823456, timestamp: Date.now() / 1000 - 120, txCount: 15, size: 14567, version: 536870912, merkleRoot: 'abc123', previousBlockHash: 'def456', nonce: 12345678, bits: '17034219', difficulty: 72006146478567.1, confirmations: 1 },
  { hash: '0000000000000000000345bcd678ef0901234567890bcdef01234567890bcdef', height: 823455, timestamp: Date.now() / 1000 - 180, txCount: 8, size: 12345, version: 536870912, merkleRoot: 'def456', previousBlockHash: 'ghi789', nonce: 23456789, bits: '17034219', difficulty: 72006146478567.1, confirmations: 2 },
  { hash: '0000000000000000000456cde789f01012345678901cdef012345678901cdef0', height: 823454, timestamp: Date.now() / 1000 - 240, txCount: 22, size: 15678, version: 536870912, merkleRoot: 'ghi789', previousBlockHash: 'jkl012', nonce: 34567890, bits: '17034219', difficulty: 72006146478567.1, confirmations: 3 },
  { hash: '0000000000000000000567def890012123456789012def0123456789012def01', height: 823453, timestamp: Date.now() / 1000 - 300, txCount: 12, size: 13456, version: 536870912, merkleRoot: 'jkl012', previousBlockHash: 'mno345', nonce: 45678901, bits: '17034219', difficulty: 72006146478567.1, confirmations: 4 },
  { hash: '0000000000000000000678ef0901231234567890123ef01234567890123ef012', height: 823452, timestamp: Date.now() / 1000 - 360, txCount: 5, size: 11234, version: 536870912, merkleRoot: 'mno345', previousBlockHash: 'pqr678', nonce: 56789012, bits: '17034219', difficulty: 72006146478567.1, confirmations: 5 },
];

export const mockTransactions = [
  { txid: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456', blockHash: '0000...', blockHeight: 823456, timestamp: Date.now() / 1000 - 45, size: 234, fee: 4500, feeRate: 19.2, confirmed: true, confirmations: 1, inputs: [{ txid: 'prev1', vout: 0, address: 'B1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', value: 50000000, sequence: 4294967295 }], outputs: [{ n: 0, address: 'B3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', value: 45000000, scriptPubKey: '76a914...', spent: false }], totalInput: 50000000, totalOutput: 45000000 },
  { txid: 'b2c3d4e5f67890123456789012345678901bcdef23456789012bcdef234567', blockHash: '0000...', blockHeight: 823456, timestamp: Date.now() / 1000 - 120, size: 456, fee: 8900, feeRate: 23.5, confirmed: true, confirmations: 1, inputs: [{ txid: 'prev2', vout: 1, address: 'Bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', value: 120000000, sequence: 4294967295 }], outputs: [{ n: 0, address: 'Bc1q34aq5drpuwy3wgl9lhup9892qp6svr8ldzyy7c', value: 110000000, scriptPubKey: '0014...', spent: false }, { n: 1, address: 'Bc1qgdjqv0av3q56jvd82tkdjpy7gdp9ut8tlqmgrpmv24sq90ecnvqqjwvw97', value: 9000000, scriptPubKey: '0014...', spent: false }], totalInput: 120000000, totalOutput: 119000000 },
  { txid: 'c3d4e5f678901234567890123456789012cdef345678901234cdef3456789', blockHash: '0000...', blockHeight: 823455, timestamp: Date.now() / 1000 - 300, size: 678, fee: 15600, feeRate: 34.2, confirmed: true, confirmations: 2, inputs: [{ txid: 'prev3', vout: 0, address: 'B1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2', value: 250000000, sequence: 4294967295 }, { txid: 'prev4', vout: 2, address: 'B3Kzh9qAqVWQhEsfQz7zEQL1EuSx5tyNLNS', value: 75000000, sequence: 4294967295 }], outputs: [{ n: 0, address: 'Bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', value: 300000000, scriptPubKey: '0014...', spent: false }], totalInput: 325000000, totalOutput: 300000000 },
  { txid: 'd4e5f6789012345678901234567890123def456789012345def45678901234', blockHash: undefined, blockHeight: undefined, timestamp: Date.now() / 1000 - 15, size: 345, fee: 6700, feeRate: 28.1, confirmed: false, confirmations: 0, inputs: [{ txid: 'prev5', vout: 0, address: 'B1FeexV6bAHb8ybZjqQMjJrcCrHGW9sb6uF', value: 80000000, sequence: 4294967295 }], outputs: [{ n: 0, address: 'B12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX', value: 73000000, scriptPubKey: '76a914...', spent: false }], totalInput: 80000000, totalOutput: 73000000 },
  { txid: 'e5f67890123456789012345678901234ef0567890123456ef056789012345', blockHash: '0000...', blockHeight: 823454, timestamp: Date.now() / 1000 - 540, size: 567, fee: 11200, feeRate: 21.8, confirmed: true, confirmations: 3, inputs: [{ txid: 'prev6', vout: 1, address: 'B1HLoD9E4SDFFPDiYfNYnkBLQ85Y51J3Zb1', value: 500000000, sequence: 4294967295 }], outputs: [{ n: 0, address: 'B1dice8EMZmqKvrGE4Qc9bUFf9PX3xaYDp', value: 450000000, scriptPubKey: '76a914...', spent: false }, { n: 1, address: 'B1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', value: 49000000, scriptPubKey: '76a914...', spent: false }], totalInput: 500000000, totalOutput: 499000000 },
];

export const mockMasternodes = {
  data: [
    { rank: 1, network: 'ipv4', txhash: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456', outidx: 0, status: 'ENABLED', addr: 'B1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', version: 70914, lastseen: Date.now() / 1000, activetime: 86400 * 5, lastpaid: Date.now() / 1000 - 3600 },
    { rank: 2, network: 'ipv4', txhash: 'b2c3d4e5f67890123456789012345678901bcdef23456789012bcdef234567', outidx: 1, status: 'ENABLED', addr: 'B2A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', version: 70914, lastseen: Date.now() / 1000 - 10, activetime: 86400 * 4, lastpaid: Date.now() / 1000 - 7200 },
    { rank: 3, network: 'ipv6', txhash: 'c3d4e5f678901234567890123456789012cdef345678901234cdef3456789', outidx: 0, status: 'ENABLED', addr: 'B3A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', version: 70914, lastseen: Date.now() / 1000 - 5, activetime: 86400 * 10, lastpaid: Date.now() / 1000 - 18000 },
    { rank: 4, network: 'onion', txhash: 'd4e5f6789012345678901234567890123def456789012345def45678901234', outidx: 1, status: 'EXPIRED', addr: 'B4A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', version: 70914, lastseen: Date.now() / 1000 - 86400, activetime: 86400 * 20, lastpaid: Date.now() / 1000 - 86400 * 2 },
    { rank: 5, network: 'ipv4', txhash: 'e5f67890123456789012345678901234ef0567890123456ef056789012345', outidx: 0, status: 'VIN_SPENT', addr: 'B5A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', version: 70914, lastseen: Date.now() / 1000 - 43200, activetime: 86400, lastpaid: 0 },
  ],
  total: 1250,
  page: 1,
  pageSize: 50,
  hasMore: true,
};

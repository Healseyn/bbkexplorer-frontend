import { search, getTransactionDetails, getBlockDetails } from './api';
import type { SearchResult } from '@/types';

/**
 * Detects the type of search query and returns the appropriate route
 * Uses API search when needed to differentiate between block and transaction hashes
 */
export async function handleSearchQuery(query: string): Promise<string | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  // Check if it's a number (block height)
  if (/^\d+$/.test(trimmed)) {
    const num = parseInt(trimmed, 10);
    // Reasonable block height range (0 to 100 million)
    if (num >= 0 && num <= 100000000) {
      return `/block/${trimmed}`;
    }
  }

  // Check if it's a wallet address (alphanumeric, typically 25-35 characters)
  // BitBlocks addresses are alphanumeric and typically start with 'B'
  if (/^[A-Za-z0-9]{25,35}$/.test(trimmed) && !/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    // This looks like an address, use API to confirm
    try {
      const result = await search(trimmed);
      if (result) {
        switch (result.type) {
          case 'address':
            return `/address/${trimmed}`;
          case 'block':
            return `/block/${trimmed}`;
          case 'transaction':
            return `/tx/${trimmed}`;
          case 'masternode':
            // Redirect to masternodes page (no individual masternode page exists)
            return `/masternodes`;
        }
      }
      // If API returns null but it looks like an address, try as address anyway
      // (address might be valid but not found in search index, or search API might be unavailable)
      return `/address/${trimmed}`;
    } catch {
      // If API fails, try as address anyway
      return `/address/${trimmed}`;
    }
  }

  // Check if it's a hexadecimal string (could be block hash or transaction hash)
  if (/^[0-9a-fA-F]+$/.test(trimmed)) {
    // 64-char hex: could be block hash or transaction hash
    if (trimmed.length === 64) {
      // Use API to determine if it's a block or transaction
      try {
        const result = await search(trimmed);
        if (result) {
          switch (result.type) {
            case 'block':
              return `/block/${trimmed}`;
            case 'transaction':
              return `/tx/${trimmed}`;
            case 'address':
              return `/address/${trimmed}`;
            case 'masternode':
              return `/masternodes/${trimmed}`;
          }
        }
        // If API doesn't return a result, try transaction first (more common than blocks)
        // Then try block if transaction doesn't exist
        try {
          await getTransactionDetails(trimmed);
          return `/tx/${trimmed}`;
        } catch {
          // Transaction doesn't exist, try as block
          try {
            await getBlockDetails(trimmed);
            return `/block/${trimmed}`;
          } catch {
            // Neither transaction nor block found, fallback to search page
            return `/search?q=${encodeURIComponent(trimmed)}`;
          }
        }
      } catch {
        // If search API fails, try transaction first, then block
        try {
          await getTransactionDetails(trimmed);
          return `/tx/${trimmed}`;
        } catch {
          // Transaction doesn't exist, try as block
          try {
            await getBlockDetails(trimmed);
            return `/block/${trimmed}`;
          } catch {
            // Neither transaction nor block found, fallback to search page
            return `/search?q=${encodeURIComponent(trimmed)}`;
          }
        }
      }
    }
    // Other hex string lengths - try as transaction
    return `/tx/${trimmed}`;
  }

  // For unknown formats, use API search
  try {
    const result = await search(trimmed);
    if (result) {
      switch (result.type) {
        case 'block':
          return `/block/${trimmed}`;
        case 'transaction':
          return `/tx/${trimmed}`;
        case 'address':
          return `/address/${trimmed}`;
        case 'masternode':
          return `/masternodes/${trimmed}`;
      }
    }
  } catch {
    // If API fails, fallback to search page
  }

  // Fallback to search page for unknown formats
  return `/search?q=${encodeURIComponent(trimmed)}`;
}

/**
 * Synchronous version that makes best guess without API call
 * Used for immediate navigation when API call is not desired
 */
export function detectSearchTypeSync(query: string): 'block-height' | 'block-hash' | 'transaction-hash' | 'address' | 'unknown' {
  const trimmed = query.trim();
  
  if (!trimmed) return 'unknown';
  
  // Check if it's a number (block height)
  if (/^\d+$/.test(trimmed)) {
    const num = parseInt(trimmed, 10);
    if (num >= 0 && num <= 100000000) {
      return 'block-height';
    }
  }
  
  // Check if it's a wallet address (alphanumeric, typically 25-35 characters)
  if (/^[A-Za-z0-9]{25,35}$/.test(trimmed) && !/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return 'address';
  }
  
  // Check if it's a hexadecimal string
  if (/^[0-9a-fA-F]+$/.test(trimmed)) {
    if (trimmed.length === 64) {
      // 64-char hex: could be block hash or transaction hash
      // Default to block hash (route accepts both)
      return 'block-hash';
    }
    // Other hex string lengths are likely transaction hashes
    return 'transaction-hash';
  }
  
  return 'unknown';
}


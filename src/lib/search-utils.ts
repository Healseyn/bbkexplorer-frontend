import { getTransactionDetails, getBlockDetails } from './api';

/**
 * Resolves a search query to the page that shows it, or null when nothing matches.
 * The backend has no search endpoint, so the type is detected from the query format
 * and 64-char hashes are looked up as a transaction first, then as a block.
 */
export async function handleSearchQuery(query: string): Promise<string | null> {
  const trimmed = query.trim();

  switch (detectSearchTypeSync(trimmed)) {
    case 'block-height':
      return `/block/${trimmed}`;
    case 'address':
      return `/address/${trimmed}`;
    case 'block-hash':
      try {
        await getTransactionDetails(trimmed);
        return `/tx/${trimmed}`;
      } catch {
        try {
          await getBlockDetails(trimmed);
          return `/block/${trimmed}`;
        } catch {
          return null;
        }
      }
    default:
      return null;
  }
}

/**
 * Synchronous version that makes best guess without API call
 * Used for immediate navigation when API call is not desired
 */
export function detectSearchTypeSync(query: string): 'block-height' | 'block-hash' | 'address' | 'unknown' {
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
    // Transaction ids and block hashes are always 64 hex chars
    return 'unknown';
  }
  
  return 'unknown';
}


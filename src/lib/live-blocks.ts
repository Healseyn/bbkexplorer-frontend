import type { Block } from '@/types';

/**
 * Newest-first list of the latest blocks, merging the polled latest block into the
 * polled block list (they refresh independently, so either can be ahead).
 * When `tipHeight` is given, confirmations are recomputed from it.
 */
export function mergeLatestBlocks(
  latestBlock: Block | undefined,
  blocks: Block[] | undefined,
  limit: number,
  tipHeight?: number
): Block[] {
  const byHeight = new Map<number, Block>();
  for (const block of blocks ?? []) {
    byHeight.set(block.height, block);
  }
  if (latestBlock) {
    byHeight.set(latestBlock.height, latestBlock);
  }

  const merged = Array.from(byHeight.values())
    .sort((a, b) => b.height - a.height)
    .slice(0, limit);

  if (tipHeight === undefined) return merged;
  return merged.map((block) => ({
    ...block,
    confirmations: Math.max(0, tipHeight - block.height + 1),
  }));
}

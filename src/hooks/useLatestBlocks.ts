import { useQuery } from '@tanstack/react-query';
import { getLatestNBlocks, getChainHeight } from '@/lib/api';
import type { Block } from '@/types';

const DEFAULT_LIMIT = 20;
const REFETCH_INTERVAL = 15000; // 15 segundos
const STALE_TIME = 15000; // 15 segundos

/**
 * Hook compartilhado para buscar os últimos blocos
 * Usa cache do React Query e localStorage para evitar chamadas duplicadas
 */
export function useLatestBlocks(limit: number = DEFAULT_LIMIT) {
  // Buscar height primeiro para usar no cache
  const { data: currentHeight } = useQuery({
    queryKey: ['chainHeight'],
    queryFn: getChainHeight,
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  });

  // Buscar blocos - usar queryKey com limit para cache apropriado
  // Mas os blocos individuais serão compartilhados via localStorage cache
  const { data: blocks, isLoading, error } = useQuery({
    queryKey: ['latestBlocks', limit],
    queryFn: () => getLatestNBlocks(limit),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
    enabled: currentHeight !== undefined, // Só buscar quando temos height
  });

  return {
    blocks: blocks || [],
    isLoading,
    error,
    currentHeight,
  };
}

/**
 * Hook para buscar um número específico de blocos, compartilhando dados quando possível
 * Se o limite solicitado for menor ou igual ao limite padrão, pode usar dados compartilhados
 */
export function useLatestBlocksShared(requestedLimit: number) {
  // Se o limite solicitado for menor ou igual ao padrão, buscar o padrão e fazer slice
  const shouldUseShared = requestedLimit <= DEFAULT_LIMIT;
  const queryLimit = shouldUseShared ? DEFAULT_LIMIT : requestedLimit;

  const { blocks, isLoading, error, currentHeight } = useLatestBlocks(queryLimit);

  // Se estamos usando dados compartilhados, fazer slice
  const slicedBlocks = shouldUseShared ? blocks.slice(0, requestedLimit) : blocks;

  return {
    blocks: slicedBlocks,
    isLoading,
    error,
    currentHeight,
  };
}




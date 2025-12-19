import type { Block } from '@/types';

const CACHE_KEY_PREFIX = 'bbkexplorer_block_';
const CACHE_VERSION = '1';
const MAX_CACHE_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias
const MAX_CACHED_BLOCKS = 1000; // Limitar número de blocos em cache

/**
 * Logs a warning message only in development mode
 */
function devWarn(message: string, error?: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    console.warn(message, error);
  }
}

interface CachedBlock {
  block: Block;
  cachedAt: number;
  version: string;
}

/**
 * Gera a chave do localStorage para um bloco
 */
function getCacheKey(identifier: string | number): string {
  return `${CACHE_KEY_PREFIX}${identifier}`;
}

/**
 * Verifica se um bloco está confirmado (não é o latest e tem confirmations > 0)
 */
function isBlockConfirmed(block: Block, currentHeight?: number): boolean {
  // Se temos currentHeight, podemos verificar confirmations
  if (currentHeight !== undefined) {
    return block.confirmations > 0;
  }
  // Caso contrário, assumimos que blocos com confirmations > 0 estão confirmados
  return block.confirmations > 0;
}

/**
 * Salva um bloco no cache se estiver confirmado
 */
export function cacheBlock(block: Block, currentHeight?: number): void {
  if (typeof window === 'undefined') return; // SSR safety
  
  // Só cachear blocos confirmados
  if (!isBlockConfirmed(block, currentHeight)) {
    return;
  }

  try {
    const cached: CachedBlock = {
      block,
      cachedAt: Date.now(),
      version: CACHE_VERSION,
    };

    const key = getCacheKey(block.height);
    localStorage.setItem(key, JSON.stringify(cached));

    // Também cachear por hash
    if (block.hash) {
      const hashKey = getCacheKey(block.hash);
      localStorage.setItem(hashKey, JSON.stringify(cached));
    }

    // Limpar cache antigo periodicamente
    cleanupOldCache();
  } catch (error) {
    // localStorage pode estar cheio ou indisponível
    devWarn('Failed to cache block:', error);
  }
}

/**
 * Busca um bloco do cache
 */
export function getCachedBlock(identifier: string | number): Block | null {
  if (typeof window === 'undefined') return null; // SSR safety

  try {
    const key = getCacheKey(identifier);
    const cachedStr = localStorage.getItem(key);
    
    if (!cachedStr) return null;

    const cached: CachedBlock = JSON.parse(cachedStr);

    // Verificar versão do cache
    if (cached.version !== CACHE_VERSION) {
      localStorage.removeItem(key);
      return null;
    }

    // Verificar se o cache não expirou
    const age = Date.now() - cached.cachedAt;
    if (age > MAX_CACHE_AGE_MS) {
      localStorage.removeItem(key);
      return null;
    }

    return cached.block;
  } catch (error) {
    // Cache corrompido ou erro de parsing
    devWarn('Failed to read cached block:', error);
    return null;
  }
}

/**
 * Salva múltiplos blocos no cache
 */
export function cacheBlocks(blocks: Block[], currentHeight?: number): void {
  blocks.forEach(block => cacheBlock(block, currentHeight));
}

/**
 * Limpa blocos antigos do cache
 */
function cleanupOldCache(): void {
  if (typeof window === 'undefined') return;

  try {
    const keys: string[] = [];
    const now = Date.now();

    // Coletar todas as chaves do cache
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_KEY_PREFIX)) {
        keys.push(key);
      }
    }

    // Se temos muitas chaves, limpar as mais antigas
    if (keys.length > MAX_CACHED_BLOCKS) {
      // Ordenar por data de cache (mais antigas primeiro)
      const blocksWithAge = keys
        .map(key => {
          try {
            const cachedStr = localStorage.getItem(key);
            if (!cachedStr) return null;
            const cached: CachedBlock = JSON.parse(cachedStr);
            return { key, cachedAt: cached.cachedAt };
          } catch {
            return null;
          }
        })
        .filter((item): item is { key: string; cachedAt: number } => item !== null)
        .sort((a, b) => a.cachedAt - b.cachedAt);

      // Remover os mais antigos
      const toRemove = blocksWithAge.slice(0, blocksWithAge.length - MAX_CACHED_BLOCKS);
      toRemove.forEach(({ key }) => localStorage.removeItem(key));
    }

    // Remover blocos expirados
    keys.forEach(key => {
      try {
        const cachedStr = localStorage.getItem(key);
        if (!cachedStr) return;
        const cached: CachedBlock = JSON.parse(cachedStr);
        const age = now - cached.cachedAt;
        if (age > MAX_CACHE_AGE_MS) {
          localStorage.removeItem(key);
        }
      } catch {
        // Remover chave corrompida
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    devWarn('Failed to cleanup cache:', error);
  }
}

/**
 * Limpa todo o cache de blocos
 */
export function clearBlockCache(): void {
  if (typeof window === 'undefined') return;

  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_KEY_PREFIX)) {
        keys.push(key);
      }
    }
    keys.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    devWarn('Failed to clear cache:', error);
  }
}




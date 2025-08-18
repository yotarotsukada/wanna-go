// メモリ内キャッシュ（開発・小規模用）
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttlMs: number = 30000): void { // デフォルト30秒
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // 期限切れエントリのクリーンアップ
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// シングルトンインスタンス
export const cache = new MemoryCache();

// 定期クリーンアップ（5分ごと）
if (typeof global !== 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 5 * 60 * 1000);
}

// キャッシュキー生成ヘルパー
export const generateCacheKey = (prefix: string, ...params: (string | number | boolean | undefined)[]): string => {
  return `${prefix}:${params.filter(p => p !== undefined).join(':')}`;
};

// キャッシュミスの場合にデータを取得してキャッシュするヘルパー
export async function getOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 30000
): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  const data = await fetcher();
  cache.set(key, data, ttlMs);
  return data;
}
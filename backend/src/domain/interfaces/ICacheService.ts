export interface ICacheService {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
  getCached<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds: number): Promise<T>;
  invalidatePattern(pattern: string): Promise<void>;
}

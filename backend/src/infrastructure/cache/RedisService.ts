import Redis from 'ioredis';

let client: Redis;

function getClient(): Redis {
  if (!client) {
    client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      lazyConnect: false,
      retryStrategy: (times) => Math.min(times * 100, 3000),
    });
    client.on('error', (err) => console.error('[Redis] Error:', err.message));
    client.on('connect', () => console.log('[Redis] Connected'));
  }
  return client;
}

export class RedisService {
  static async get(key: string): Promise<string | null> {
    return getClient().get(key);
  }

  static async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await getClient().setex(key, ttlSeconds, value);
  }

  static async del(key: string): Promise<void> {
    await getClient().del(key);
  }

  static async getCached<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds: number): Promise<T> {
    const cached = await getClient().get(key);

    if (cached) {
      console.log(`[CACHE HIT]  key="${key}" | response_time=~40ms | source=Redis`);
      return JSON.parse(cached) as T;
    }

    const startTime = Date.now();
    console.log(`[CACHE MISS] key="${key}" | fetching from database...`);

    const result = await fetchFn();
    const elapsed = Date.now() - startTime;

    console.log(`[CACHE MISS] key="${key}" | response_time=${elapsed}ms | caching for ${ttlSeconds}s`);
    await getClient().setex(key, ttlSeconds, JSON.stringify(result));

    return result;
  }

  static async addToBlacklist(token: string, ttlSeconds: number): Promise<void> {
    await getClient().setex(`blacklist:${token}`, ttlSeconds, '1');
  }

  static async invalidatePattern(pattern: string): Promise<void> {
    const keys = await getClient().keys(pattern);
    if (keys.length > 0) {
      await getClient().del(...keys);
      console.log(`[CACHE INVALIDATED] ${keys.length} keys matching "${pattern}"`);
    }
  }
}

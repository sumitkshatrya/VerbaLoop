import { redisService } from '../redis/redisClient';
import { config } from '../../config/env';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetMs: number;
  mode: 'redis' | 'in-memory';
}

interface InMemoryBucket {
  count: number;
  resetTime: number;
}

export class TrafficController {
  private inMemoryBuckets: Map<string, InMemoryBucket> = new Map();
  private totalChecked = 0;
  private throttledCount = 0;
  private startTime = Date.now();

  constructor() {
    // Periodically clean expired in-memory buckets every 2 minutes
    setInterval(() => this.pruneExpiredBuckets(), 2 * 60 * 1000).unref();
  }

  private pruneExpiredBuckets(): void {
    const now = Date.now();
    for (const [key, bucket] of this.inMemoryBuckets.entries()) {
      if (now > bucket.resetTime) {
        this.inMemoryBuckets.delete(key);
      }
    }
  }

  async checkRateLimit(
    keyPrefix: string,
    identifier: string,
    limit: number,
    windowSeconds: number
  ): Promise<RateLimitResult> {
    this.totalChecked++;
    const key = `traffic:${keyPrefix}:${identifier}`;
    const redis = redisService.getClient();

    // 1. Redis Mode if connected
    if (redis && redisService.isReady()) {
      try {
        const pipeline = redis.pipeline();
        pipeline.incr(key);
        pipeline.ttl(key);
        const results = await pipeline.exec();

        const count = (results?.[0]?.[1] as number) || 1;
        let ttl = (results?.[1]?.[1] as number) || -1;

        if (ttl === -1) {
          await redis.expire(key, windowSeconds);
          ttl = windowSeconds;
        }

        const allowed = count <= limit;
        if (!allowed) {
          this.throttledCount++;
        }

        return {
          allowed,
          remaining: Math.max(0, limit - count),
          limit,
          resetMs: ttl * 1000,
          mode: 'redis',
        };
      } catch (err) {
        console.warn('⚠️ [TrafficController] Redis operation failed, falling back to in-memory:', (err as any)?.message);
      }
    }

    // 2. High-Performance In-Memory Sliding Window Fallback
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    let bucket = this.inMemoryBuckets.get(key);

    if (!bucket || now > bucket.resetTime) {
      bucket = {
        count: 1,
        resetTime: now + windowMs,
      };
      this.inMemoryBuckets.set(key, bucket);
      return {
        allowed: true,
        remaining: limit - 1,
        limit,
        resetMs: windowMs,
        mode: 'in-memory',
      };
    }

    bucket.count += 1;
    const allowed = bucket.count <= limit;
    if (!allowed) {
      this.throttledCount++;
    }

    return {
      allowed,
      remaining: Math.max(0, limit - bucket.count),
      limit,
      resetMs: Math.max(0, bucket.resetTime - now),
      mode: 'in-memory',
    };
  }

  /**
   * Check participant turn rate limit (e.g. max 30 turns/minute)
   */
  async checkTurnLimit(
    participantId: string,
    roomCode: string
  ): Promise<RateLimitResult> {
    return this.checkRateLimit(
      `turn:${roomCode.toUpperCase()}`,
      participantId,
      config.rateLimitTurnsPerMin,
      60
    );
  }

  /**
   * Check room translation rate limit (e.g. max 40 translations/minute)
   */
  async checkTranslationLimit(roomCode: string): Promise<RateLimitResult> {
    return this.checkRateLimit(
      'translation',
      roomCode.toUpperCase(),
      config.rateLimitTranslationsPerMin,
      60
    );
  }

  /**
   * Check IP connection flood rate limit (e.g. max 25 connects/minute)
   */
  async checkConnectionLimit(ip: string): Promise<RateLimitResult> {
    return this.checkRateLimit('conn', ip || 'unknown-ip', 25, 60);
  }

  /**
   * Return comprehensive traffic and rate-limiting metrics
   */
  getMetrics() {
    return {
      redisConnected: redisService.isReady(),
      mode: redisService.isReady() ? 'redis' : 'in-memory',
      totalChecked: this.totalChecked,
      throttledCount: this.throttledCount,
      activeInMemoryKeys: this.inMemoryBuckets.size,
      uptimeSeconds: Math.round((Date.now() - this.startTime) / 1000),
      limits: {
        turnsPerMin: config.rateLimitTurnsPerMin,
        translationsPerMin: config.rateLimitTranslationsPerMin,
        connectionsPerMin: 25,
      },
    };
  }
}

export const trafficController = new TrafficController();

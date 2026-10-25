import Redis, { RedisOptions } from 'ioredis';
import { config } from '../../config/env';

export class RedisService {
  private client: Redis | null = null;
  private pubClient: Redis | null = null;
  private subClient: Redis | null = null;
  private isConnected = false;
  private isConnecting = false;

  private createClientInstance(): Redis | null {
    const redisTarget =
      config.redisUrl ||
      (config.redisHost
        ? {
            host: config.redisHost,
            port: config.redisPort || 6379,
            password: config.redisPassword,
          }
        : null);

    if (!redisTarget && !process.env.REDIS_URL && !process.env.REDIS_HOST) {
      // Default to checking local 127.0.0.1:6379 with low-friction connection settings
      const opts: RedisOptions = {
        host: '127.0.0.1',
        port: 6379,
        lazyConnect: true,
        connectTimeout: 1500,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null, // Do not keep retrying continuously if not running
        enableOfflineQueue: false,
      };
      return new Redis(opts);
    }

    const opts: RedisOptions = {
      lazyConnect: true,
      connectTimeout: 2000,
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 500, 2000);
      },
      enableOfflineQueue: false,
    };

    if (typeof redisTarget === 'string') {
      return new Redis(redisTarget, opts);
    } else if (redisTarget) {
      return new Redis({ ...redisTarget, ...opts });
    }

    return null;
  }

  async init(): Promise<boolean> {
    if (this.isConnected) return true;
    if (this.isConnecting) return false;
    this.isConnecting = true;

    try {
      this.client = this.createClientInstance();
      if (!this.client) {
        this.isConnecting = false;
        return false;
      }

      // Suppress unhandled error crash
      this.client.on('error', (err) => {
        if (this.isConnected) {
          console.warn('⚠️ [Redis] Connection warning:', err.message);
        }
        this.isConnected = false;
      });

      // Attempt to connect
      await this.client.connect();
      await this.client.ping();
      this.isConnected = true;
      this.isConnecting = false;

      const endpoint = config.redisUrl || `${config.redisHost || '127.0.0.1'}:${config.redisPort || 6379}`;
      console.log(`✅ [Redis] Connected successfully to Redis (${endpoint}) for traffic control & rate-limiting`);
      return true;
    } catch {
      this.isConnected = false;
      this.isConnecting = false;
      console.log('ℹ️  [Redis] No external Redis server active. Operating with high-performance In-Memory Traffic Controller.');
      return false;
    }
  }

  getClient(): Redis | null {
    return this.isConnected ? this.client : null;
  }

  isReady(): boolean {
    return this.isConnected;
  }

  getPubSubClients(): { pubClient: Redis | null; subClient: Redis | null } {
    if (!this.isConnected || !this.client) {
      return { pubClient: null, subClient: null };
    }
    if (!this.pubClient) {
      this.pubClient = this.client.duplicate();
      this.pubClient.on('error', () => {});
    }
    if (!this.subClient) {
      this.subClient = this.client.duplicate();
      this.subClient.on('error', () => {});
    }
    return { pubClient: this.pubClient, subClient: this.subClient };
  }

  async disconnect(): Promise<void> {
    try {
      if (this.client) await this.client.quit();
      if (this.pubClient) await this.pubClient.quit();
      if (this.subClient) await this.subClient.quit();
    } catch {
      // Ignored
    } finally {
      this.isConnected = false;
    }
  }
}

export const redisService = new RedisService();


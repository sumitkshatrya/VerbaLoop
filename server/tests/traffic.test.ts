import { describe, it, expect, beforeEach } from 'vitest';
import { TrafficController } from '../src/services/traffic/trafficController';
import supertest from 'supertest';
import { createApp } from '../src/app';
import { InMemoryStorage } from '../src/services/storage/inMemoryStorage';

describe('TrafficController & Redis Rate Limiting', () => {
  let traffic: TrafficController;

  beforeEach(() => {
    traffic = new TrafficController();
  });

  it('allows requests within the configured turn rate limit', async () => {
    const result1 = await traffic.checkTurnLimit('user123', 'ROOM99');
    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBeLessThan(result1.limit);
  });

  it('throttles requests when turn rate limit is exceeded', async () => {
    // Exceed turn limit (limit is 30)
    for (let i = 0; i < 30; i++) {
      await traffic.checkTurnLimit('spamUser', 'ROOM99');
    }

    const throttled = await traffic.checkTurnLimit('spamUser', 'ROOM99');
    expect(throttled.allowed).toBe(false);
    expect(throttled.remaining).toBe(0);
  });

  it('enforces room-level translation limits', async () => {
    for (let i = 0; i < 40; i++) {
      await traffic.checkTranslationLimit('HIGH_VOLUME_ROOM');
    }

    const throttled = await traffic.checkTranslationLimit('HIGH_VOLUME_ROOM');
    expect(throttled.allowed).toBe(false);
  });

  it('tracks traffic metrics accurately', async () => {
    const initialMetrics = traffic.getMetrics();
    expect(initialMetrics).toHaveProperty('mode');
    expect(initialMetrics).toHaveProperty('totalChecked');
    expect(initialMetrics).toHaveProperty('throttledCount');

    // Run 5 allowed checks
    for (let i = 0; i < 5; i++) {
      await traffic.checkTurnLimit(`user_${i}`, 'ROOM1');
    }

    const updatedMetrics = traffic.getMetrics();
    expect(updatedMetrics.totalChecked).toBe(initialMetrics.totalChecked + 5);
  });

  it('exposes /api/traffic endpoint with metrics', async () => {
    const storage = new InMemoryStorage();
    await storage.init();
    const app = createApp(storage);

    const res = await supertest(app).get('/api/traffic');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.metrics).toHaveProperty('mode');
    expect(res.body.metrics).toHaveProperty('limits');
  });

  it('includes redis and traffic info in /api/health', async () => {
    const storage = new InMemoryStorage();
    await storage.init();
    const app = createApp(storage);

    const res = await supertest(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('redis');
    expect(res.body).toHaveProperty('traffic');
    expect(res.body.redis).toHaveProperty('connected');
  });
});


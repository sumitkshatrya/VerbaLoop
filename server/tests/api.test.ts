import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { InMemoryStorage } from '../src/services/storage/inMemoryStorage';
import { RoomState } from '@verbaloop/shared';

describe('HTTP API Endpoints', () => {
  let app: any;
  let storage: InMemoryStorage;

  beforeEach(() => {
    storage = new InMemoryStorage();
    app = createApp(storage);
  });

  it('GET /api/health returns health status and metadata', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.app).toBe('VerbaLoop');
    expect(res.body.storage).toBe('in-memory');
  });

  it('GET /api/rooms/:roomCode returns 404 for nonexistent room', async () => {
    const res = await request(app).get('/api/rooms/NONEXISTENT');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Room not found');
  });

  it('GET /api/rooms/:roomCode returns room when present', async () => {
    const room: RoomState = {
      roomCode: 'LOOP-REST',
      status: 'active',
      topic: 'API Test Topic',
      participants: [],
      turns: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await storage.createRoom(room);

    const res = await request(app).get('/api/rooms/LOOP-REST');
    expect(res.status).toBe(200);
    expect(res.body.roomCode).toBe('LOOP-REST');
    expect(res.body.topic).toBe('API Test Topic');
  });

  it('POST /api/translate performs translation for Indian languages', async () => {
    const res = await request(app)
      .post('/api/translate')
      .send({
        text: 'I disagree with you',
        sourceLang: 'en',
        targetLang: 'ta',
      });

    expect(res.status).toBe(200);
    expect(res.body.translatedText).toContain('உடன்படவில்லை');

    // Bengali
    const resBn = await request(app)
      .post('/api/translate')
      .send({
        text: 'I disagree with you',
        sourceLang: 'en',
        targetLang: 'bn',
      });
    expect(resBn.status).toBe(200);
    expect(resBn.body.translatedText).toContain('একমত');
  });

  it('rejects unsupported/invalid language codes in POST /api/translate', async () => {
    const res = await request(app)
      .post('/api/translate')
      .send({
        text: 'Hello',
        sourceLang: 'en',
        targetLang: 'invalid_code',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('DELETE /api/rooms/:roomCode permanently deletes the conversation', async () => {
    const room: RoomState = {
      roomCode: 'LOOP-TODEL',
      status: 'ended',
      participants: [],
      turns: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await storage.createRoom(room);

    const deleteRes = await request(app).delete('/api/rooms/LOOP-TODEL');
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    const fetchRes = await request(app).get('/api/rooms/LOOP-TODEL');
    expect(fetchRes.status).toBe(404);
  });
});


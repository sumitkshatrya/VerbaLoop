import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryStorage } from '../src/services/storage/inMemoryStorage';
import { RoomState, TurnMessage } from '@verbaloop/shared';

describe('InMemoryStorage Repository', () => {
  let storage: InMemoryStorage;

  beforeEach(() => {
    storage = new InMemoryStorage();
  });

  it('creates and retrieves a room', async () => {
    const room: RoomState = {
      roomCode: 'LOOP-TEST',
      status: 'waiting',
      topic: 'Test Topic',
      participants: [
        {
          id: 'u1',
          name: 'Alice',
          language: 'en',
          isHost: true,
          isReady: true,
          isAudioReady: false,
          socketId: 'sock_1',
          joinedAt: Date.now(),
        },
      ],
      turns: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await storage.createRoom(room);
    const fetched = await storage.getRoom('LOOP-TEST');

    expect(fetched).not.toBeNull();
    expect(fetched?.roomCode).toBe('LOOP-TEST');
    expect(fetched?.participants.length).toBe(1);
    expect(fetched?.participants[0].name).toBe('Alice');
  });

  it('appends and updates turns accurately', async () => {
    const room: RoomState = {
      roomCode: 'LOOP-TURNS',
      status: 'active',
      participants: [],
      turns: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await storage.createRoom(room);

    const turn1: TurnMessage = {
      turnId: 't1',
      roomCode: 'LOOP-TURNS',
      speakerId: 'u1',
      speakerName: 'Alice',
      speakerLanguage: 'en',
      originalText: 'Hello world',
      translatedText: 'नमस्ते दुनिया',
      targetLanguage: 'hi',
      status: 'completed',
      isPartial: false,
      isInterrupted: false,
      createdAt: Date.now(),
    };

    await storage.addTurn('LOOP-TURNS', turn1);
    let turns = await storage.getTurns('LOOP-TURNS');
    expect(turns.length).toBe(1);
    expect(turns[0].turnId).toBe('t1');

    // Update turn to interrupted
    await storage.updateTurn('LOOP-TURNS', 't1', {
      isInterrupted: true,
      status: 'interrupted',
    });

    turns = await storage.getTurns('LOOP-TURNS');
    expect(turns[0].isInterrupted).toBe(true);
    expect(turns[0].status).toBe('interrupted');
  });

  it('permanently deletes a conversation room', async () => {
    const room: RoomState = {
      roomCode: 'LOOP-DEL',
      status: 'active',
      participants: [],
      turns: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await storage.createRoom(room);
    expect(await storage.getRoom('LOOP-DEL')).not.toBeNull();

    const deleted = await storage.deleteRoom('LOOP-DEL');
    expect(deleted).toBe(true);
    expect(await storage.getRoom('LOOP-DEL')).toBeNull();
  });
});


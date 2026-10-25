import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryStorage } from '../src/services/storage/inMemoryStorage';
import { RoomManager } from '../src/socket/roomManager';
import { TurnManager } from '../src/socket/turnManager';
import { conversationSummaryService } from '../src/services/summary/summaryService';
import { RoomModel } from '../src/models/room.model';
import { RoomState } from '@verbaloop/shared';

describe('Senior QA Regression Test Suite - Real-Time Edge Cases', () => {
  let storage: InMemoryStorage;
  let roomManager: RoomManager;
  let turnManager: TurnManager;

  beforeEach(async () => {
    storage = new InMemoryStorage();
    roomManager = new RoomManager(storage);
    turnManager = new TurnManager(storage);
  });

  it('QA-01: Automatically interrupts prior speaker turn when a new speaker starts talking', async () => {
    const hostRes = await roomManager.createRoom('Arjun', 'hi', 'sock_1', 'Policy Debate');
    const roomCode = hostRes.room.roomCode;
    const hostId = hostRes.host.id;

    const peerRes = await roomManager.joinRoom(roomCode, 'Priya', 'ta', 'sock_2');
    const peerId = peerRes.participant.id;

    // 1. Host starts speaking
    const turn1Id = 'turn_host_1';
    const start1 = await turnManager.startTurn(roomCode, turn1Id, hostId, 'voice');
    expect(start1.turn.status).toBe('speaking');
    expect(start1.room.activeTurnId).toBe(turn1Id);
    expect(start1.interruptedPreviousTurn).toBeNull();

    // 2. Peer starts speaking immediately (direct interruption without clicking explicit button)
    const turn2Id = 'turn_peer_interjection';
    const start2 = await turnManager.startTurn(roomCode, turn2Id, peerId, 'voice');

    // 3. Verify turn 1 was marked as interrupted and turn 2 is now active
    expect(start2.interruptedPreviousTurn).toBeDefined();
    expect(start2.interruptedPreviousTurn?.turnId).toBe(turn1Id);
    expect(start2.interruptedPreviousTurn?.status).toBe('interrupted');
    expect(start2.interruptedPreviousTurn?.isInterrupted).toBe(true);
    expect(start2.interruptedPreviousTurn?.interruptedBy).toBe(peerId);

    // 4. Room active turn points to peer
    const roomState = await storage.getRoom(roomCode);
    expect(roomState?.activeTurnId).toBe(turn2Id);

    // 5. In storage, turn 1 is interrupted
    const turns = await storage.getTurns(roomCode);
    const savedTurn1 = turns.find((t) => t.turnId === turn1Id);
    expect(savedTurn1?.status).toBe('interrupted');
    expect(savedTurn1?.isInterrupted).toBe(true);
  });

  it('QA-02: Cancels active turn and cleans up room state when speaking participant disconnects', async () => {
    const hostRes = await roomManager.createRoom('Arjun', 'hi', 'sock_host', 'Topic');
    const roomCode = hostRes.room.roomCode;
    const hostId = hostRes.host.id;

    await roomManager.joinRoom(roomCode, 'Priya', 'ta', 'sock_peer');

    // Host starts turn
    const turnId = 'turn_host_active';
    await turnManager.startTurn(roomCode, turnId, hostId, 'voice');

    // Host abruptly disconnects
    const disconnectRes = await roomManager.handleDisconnect('sock_host');
    expect(disconnectRes.participantId).toBe(hostId);
    expect(disconnectRes.roomCode).toBe(roomCode);

    // Room activeTurnId is cleared and turn is marked cancelled
    const room = await storage.getRoom(roomCode);
    expect(room?.activeTurnId).toBeNull();

    const turns = await storage.getTurns(roomCode);
    const turn = turns.find((t) => t.turnId === turnId);
    expect(turn?.status).toBe('cancelled');

    // Disconnected participant audio flags are reset
    const host = room?.participants.find((p) => p.id === hostId);
    expect(host?.isSpeaking).toBe(false);
    expect(host?.isListening).toBe(false);
  });

  it('QA-03: Enforces strict maximum capacity of 2 participants for direct dialogue', async () => {
    const hostRes = await roomManager.createRoom('Arjun', 'hi', 'sock_1');
    const roomCode = hostRes.room.roomCode;

    await roomManager.joinRoom(roomCode, 'Priya', 'ta', 'sock_2');

    // 3rd participant attempt must fail with clear error
    await expect(
      roomManager.joinRoom(roomCode, 'ThirdPerson', 'en', 'sock_3')
    ).rejects.toThrow(/already full/i);
  });

  it('QA-04: Mongoose RoomModel validates turns starting with empty originalText without error', () => {
    // When a turn starts, originalText is initially empty string ''
    const turnData = {
      turnId: 'turn_m_1',
      roomCode: 'LOOP-MONG',
      speakerId: 'u1',
      speakerName: 'Arjun',
      speakerLanguage: 'hi',
      originalText: '',
      translatedText: '',
      targetLanguage: 'ta',
      status: 'speaking',
      isPartial: true,
      isInterrupted: false,
      createdAt: Date.now(),
    };

    const roomDoc = new RoomModel({
      roomCode: 'LOOP-MONG',
      status: 'active',
      participants: [
        {
          id: 'u1',
          name: 'Arjun',
          language: 'hi',
          socketId: 'sock_1',
        },
      ],
      turns: [turnData],
    });

    const validationError = roomDoc.validateSync();
    expect(validationError).toBeUndefined();
  });

  it('QA-05: ConversationSummaryService gracefully handles edge case of empty participants or turns', async () => {
    const emptyRoom: RoomState = {
      roomCode: 'LOOP-EMPTY',
      status: 'ended',
      participants: [],
      turns: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const summary = await conversationSummaryService.generateSummary(emptyRoom);
    expect(summary.roomCode).toBe('LOOP-EMPTY');
    expect(summary.totalTurns).toBe(0);
    expect(summary.durationSeconds).toBe(0);
    expect(summary.mainDisagreement).toHaveProperty('en');
    expect(summary.pointsOfAgreement).toHaveProperty('en');
    expect(summary.unresolvedQuestions).toHaveProperty('en');
  });

  it('QA-06: Automatically activates room status when 2nd participant connects', async () => {
    const hostRes = await roomManager.createRoom('Arjun', 'hi', 'sock_host');
    expect(hostRes.room.status).toBe('waiting');
    expect(hostRes.host.isReady).toBe(true);

    const joinRes = await roomManager.joinRoom(hostRes.room.roomCode, 'Mei', 'zh', 'sock_peer');
    expect(joinRes.participant.isReady).toBe(true);
    expect(joinRes.room.status).toBe('active');
  });
});

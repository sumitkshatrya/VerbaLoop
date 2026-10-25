import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryStorage } from '../src/services/storage/inMemoryStorage';
import { RoomManager } from '../src/socket/roomManager';
import { TurnManager } from '../src/socket/turnManager';

describe('Turn Lifecycle & Real Interruption Handling', () => {
  let storage: InMemoryStorage;
  let roomManager: RoomManager;
  let turnManager: TurnManager;
  let roomCode: string;
  let hostId: string;
  let peerId: string;

  beforeEach(async () => {
    storage = new InMemoryStorage();
    roomManager = new RoomManager(storage);
    turnManager = new TurnManager(storage);

    // Create room with Host (Hindi) and Peer (Mandarin)
    const hostRes = await roomManager.createRoom('Arjun', 'hi', 'sock_arjun', 'AI Ethics Debate');
    roomCode = hostRes.room.roomCode;
    hostId = hostRes.host.id;

    const peerRes = await roomManager.joinRoom(roomCode, 'Mei', 'zh', 'sock_mei');
    peerId = peerRes.participant.id;

    await roomManager.setParticipantReady(roomCode, hostId, true, true);
    await roomManager.setParticipantReady(roomCode, peerId, true, true);
  });

  it('starts a turn, streams partials, and completes translation', async () => {
    const turnId = 'turn_001';
    const startRes = await turnManager.startTurn(roomCode, turnId, hostId, 'voice');
    expect(startRes.turn.status).toBe('speaking');
    expect(startRes.turn.targetLanguage).toBe('zh');
    expect(startRes.room.activeTurnId).toBe(turnId);

    // Stream partial speech
    const partial = await turnManager.updatePartial(roomCode, turnId, hostId, 'मैं कहना चाहता हूँ...');
    expect(partial?.originalText).toBe('मैं कहना चाहता हूँ...');
    expect(partial?.isPartial).toBe(true);

    // Complete turn
    const completeRes = await turnManager.completeTurn(
      roomCode,
      turnId,
      hostId,
      'मैं आपसे असहमत हूँ'
    );
    expect(completeRes.isInterrupted).toBe(false);
    expect(completeRes.turn.status).toBe('completed');
    expect(completeRes.turn.translatedText).toBeTruthy();

    const currentRoom = await storage.getRoom(roomCode);
    expect(currentRoom?.activeTurnId).toBeNull();
  });

  it('correctly interrupts an active turn and prevents stale responses', async () => {
    const turnId = 'turn_002';
    await turnManager.startTurn(roomCode, turnId, hostId, 'voice');

    // Peer interrupts host mid-speech
    const interruptRes = await turnManager.interruptTurn(
      roomCode,
      turnId,
      peerId,
      'Direct interjection'
    );

    expect(interruptRes.turn?.status).toBe('interrupted');
    expect(interruptRes.turn?.isInterrupted).toBe(true);
    expect(interruptRes.turn?.interruptedBy).toBe(peerId);
    expect(interruptRes.room.activeTurnId).toBeNull();

    // Now if an obsolete/delayed completion event arrives for the interrupted turn
    const completeAfterInterrupt = await turnManager.completeTurn(
      roomCode,
      turnId,
      hostId,
      'Delayed text after interrupt'
    );

    expect(completeAfterInterrupt.isInterrupted).toBe(true);
    expect(completeAfterInterrupt.turn.status).toBe('interrupted');

    // Peer can immediately start their own turn without floor blockage
    const peerTurnId = 'turn_003';
    const peerTurnRes = await turnManager.startTurn(roomCode, peerTurnId, peerId, 'voice');
    expect(peerTurnRes.turn.status).toBe('speaking');
    expect(peerTurnRes.turn.speakerId).toBe(peerId);
    expect(peerTurnRes.turn.targetLanguage).toBe('hi');
  });

  it('allows correcting a previous turn and translates correction', async () => {
    const turnId = 'turn_004';
    await turnManager.startTurn(roomCode, turnId, hostId, 'text');
    await turnManager.completeTurn(roomCode, turnId, hostId, 'Wait, let me finish');

    const correctionRes = await turnManager.correctTurn(
      roomCode,
      turnId,
      hostId,
      'I disagree with you'
    );

    expect(correctionRes.turn.correction).toBeDefined();
    expect(correctionRes.turn.correction?.originalCorrection).toBe('I disagree with you');
    expect(correctionRes.turn.correction?.translatedCorrection).toBeTruthy();
  });

  it('supports Indian language pair: Hindi host and Tamil peer', async () => {
    const indicHost = await roomManager.createRoom('Arjun', 'hi', 'sock_indic_host', 'National Infrastructure');
    const indicPeer = await roomManager.joinRoom(indicHost.room.roomCode, 'Priya', 'ta', 'sock_indic_peer');

    expect(indicHost.room.participants[0].language).toBe('hi');
    expect(indicPeer.participant.language).toBe('ta');

    const turnId = 'turn_indic_1';
    const startRes = await turnManager.startTurn(indicHost.room.roomCode, turnId, indicHost.host.id, 'text');
    expect(startRes.turn.targetLanguage).toBe('ta');

    const completeRes = await turnManager.completeTurn(
      indicHost.room.roomCode,
      turnId,
      indicHost.host.id,
      'I disagree with you'
    );
    expect(completeRes.turn.targetLanguage).toBe('ta');
    expect(completeRes.turn.translatedText).toContain('உடன்படவில்லை');
  });
});


import {
  RoomState,
  Participant,
  RoomStatus,
  SupportedLanguageCode,
} from '@verbaloop/shared';
import { IStorageRepository } from '../services/storage/types';

export class RoomManager {
  private activeSockets: Map<string, { roomCode: string; participantId: string }> =
    new Map();

  constructor(private storage: IStorageRepository) {}

  generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'LOOP-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  generateParticipantId(): string {
    return 'user_' + Math.random().toString(36).substring(2, 9);
  }

  async createRoom(
    hostName: string,
    hostLanguage: SupportedLanguageCode,
    socketId: string,
    topic?: string
  ): Promise<{ room: RoomState; host: Participant }> {
    const roomCode = this.generateRoomCode();
    const hostId = this.generateParticipantId();

    const host: Participant = {
      id: hostId,
      name: hostName.trim(),
      language: hostLanguage,
      isHost: true,
      isReady: true,
      isAudioReady: false,
      socketId,
      isSpeaking: false,
      isListening: false,
      joinedAt: Date.now(),
    };

    const room: RoomState = {
      roomCode,
      status: 'waiting',
      topic: topic?.trim() || 'Real-time Multilingual Dialogue',
      participants: [host],
      turns: [],
      activeTurnId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await this.storage.createRoom(room);
    this.activeSockets.set(socketId, { roomCode, participantId: hostId });

    return { room, host };
  }

  async joinRoom(
    roomCode: string,
    participantName: string,
    participantLanguage: SupportedLanguageCode,
    socketId: string
  ): Promise<{ room: RoomState; participant: Participant }> {
    const normalizedCode = roomCode.toUpperCase().trim();
    const room = await this.storage.getRoom(normalizedCode);

    if (!room) {
      throw new Error(`Room ${normalizedCode} does not exist.`);
    }

    if (room.status === 'ended') {
      throw new Error(`Room ${normalizedCode} has already concluded.`);
    }

    // Check if participant is reconnecting
    const existing = room.participants.find(
      (p) => p.name.toLowerCase() === participantName.toLowerCase().trim()
    );

    let participant: Participant;

    if (existing) {
      existing.socketId = socketId;
      existing.language = participantLanguage;
      participant = existing;
    } else {
      // Room maximum capacity: 2 participants for direct 1-on-1 dialogue
      if (room.participants.length >= 2) {
        throw new Error(
          `Room ${normalizedCode} is already full (maximum 2 participants for focused dialogue).`
        );
      }

      participant = {
        id: this.generateParticipantId(),
        name: participantName.trim(),
        language: participantLanguage,
        isHost: false,
        isReady: false,
        isAudioReady: false,
        socketId,
        isSpeaking: false,
        isListening: false,
        joinedAt: Date.now(),
      };
      room.participants.push(participant);
    }

    // If 2 participants present, set status to ready or active
    if (room.participants.length === 2) {
      room.status = 'ready';
    }

    await this.storage.updateRoom(normalizedCode, {
      participants: room.participants,
      status: room.status,
    });

    this.activeSockets.set(socketId, {
      roomCode: normalizedCode,
      participantId: participant.id,
    });

    return { room, participant };
  }

  async setParticipantReady(
    roomCode: string,
    participantId: string,
    isReady: boolean,
    isAudioReady: boolean
  ): Promise<RoomState> {
    const room = await this.storage.getRoom(roomCode);
    if (!room) throw new Error('Room not found');

    const p = room.participants.find((part) => part.id === participantId);
    if (p) {
      p.isReady = isReady;
      p.isAudioReady = isAudioReady;
    }

    // If both ready, activate conversation
    if (
      room.participants.length === 2 &&
      room.participants.every((part) => part.isReady)
    ) {
      room.status = 'active';
    }

    await this.storage.updateRoom(roomCode, {
      participants: room.participants,
      status: room.status,
    });

    return room;
  }

  async pauseRoom(
    roomCode: string,
    participantId: string,
    reason?: string
  ): Promise<RoomState> {
    const room = await this.storage.getRoom(roomCode);
    if (!room) throw new Error('Room not found');

    room.status = 'paused';
    room.pausedBy = participantId;

    await this.storage.updateRoom(roomCode, {
      status: 'paused',
      pausedBy: participantId,
    });

    return room;
  }

  async resumeRoom(
    roomCode: string,
    participantId: string
  ): Promise<RoomState> {
    const room = await this.storage.getRoom(roomCode);
    if (!room) throw new Error('Room not found');

    room.status = 'active';
    room.pausedBy = null;

    await this.storage.updateRoom(roomCode, {
      status: 'active',
      pausedBy: null,
    });

    return room;
  }

  async endRoom(
    roomCode: string,
    participantId: string
  ): Promise<RoomState> {
    const room = await this.storage.getRoom(roomCode);
    if (!room) throw new Error('Room not found');

    room.status = 'ended';
    room.endedBy = participantId;

    await this.storage.updateRoom(roomCode, {
      status: 'ended',
      endedBy: participantId,
    });

    return room;
  }

  async updateAudioState(
    roomCode: string,
    participantId: string,
    isSpeaking: boolean,
    isListening: boolean
  ): Promise<RoomState | null> {
    const room = await this.storage.getRoom(roomCode);
    if (!room) return null;

    const p = room.participants.find((part) => part.id === participantId);
    if (p) {
      p.isSpeaking = isSpeaking;
      p.isListening = isListening;
      await this.storage.updateRoom(roomCode, {
        participants: room.participants,
      });
    }
    return room;
  }

  async handleDisconnect(socketId: string): Promise<{
    roomCode?: string;
    participantId?: string;
    room?: RoomState | null;
  }> {
    const mapping = this.activeSockets.get(socketId);
    if (!mapping) return {};

    this.activeSockets.delete(socketId);
    const room = await this.storage.getRoom(mapping.roomCode);

    return {
      roomCode: mapping.roomCode,
      participantId: mapping.participantId,
      room,
    };
  }

  getSocketInfo(socketId: string) {
    return this.activeSockets.get(socketId);
  }
}


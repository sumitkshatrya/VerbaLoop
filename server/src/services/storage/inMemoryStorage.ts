import {
  RoomState,
  TurnMessage,
  ConversationSummary,
} from '@verbaloop/shared';
import { IStorageRepository } from './types';

export class InMemoryStorage implements IStorageRepository {
  private rooms: Map<string, RoomState> = new Map();

  async init(): Promise<void> {
    // In-memory initialization is immediate
  }

  getStorageType(): 'in-memory' {
    return 'in-memory';
  }

  async createRoom(room: RoomState): Promise<RoomState> {
    const clone: RoomState = JSON.parse(JSON.stringify(room));
    this.rooms.set(room.roomCode, clone);
    return clone;
  }

  async getRoom(roomCode: string): Promise<RoomState | null> {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return null;
    return JSON.parse(JSON.stringify(room));
  }

  async updateRoom(
    roomCode: string,
    updates: Partial<RoomState>
  ): Promise<RoomState | null> {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return null;
    const updated: RoomState = {
      ...room,
      ...updates,
      updatedAt: Date.now(),
    };
    this.rooms.set(roomCode.toUpperCase(), updated);
    return JSON.parse(JSON.stringify(updated));
  }

  async addTurn(roomCode: string, turn: TurnMessage): Promise<void> {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return;
    const existingIndex = room.turns.findIndex((t) => t.turnId === turn.turnId);
    if (existingIndex >= 0) {
      room.turns[existingIndex] = { ...room.turns[existingIndex], ...turn };
    } else {
      room.turns.push({ ...turn });
    }
    room.updatedAt = Date.now();
  }

  async updateTurn(
    roomCode: string,
    turnId: string,
    updates: Partial<TurnMessage>
  ): Promise<void> {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return;
    const turnIndex = room.turns.findIndex((t) => t.turnId === turnId);
    if (turnIndex >= 0) {
      room.turns[turnIndex] = {
        ...room.turns[turnIndex],
        ...updates,
      };
      room.updatedAt = Date.now();
    }
  }

  async getTurns(roomCode: string): Promise<TurnMessage[]> {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return [];
    return JSON.parse(JSON.stringify(room.turns));
  }

  async saveSummary(
    roomCode: string,
    summary: ConversationSummary
  ): Promise<void> {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return;
    room.summary = JSON.parse(JSON.stringify(summary));
    room.updatedAt = Date.now();
  }

  async deleteRoom(roomCode: string): Promise<boolean> {
    return this.rooms.delete(roomCode.toUpperCase());
  }
}

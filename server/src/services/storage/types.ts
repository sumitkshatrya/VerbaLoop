import {
  RoomState,
  TurnMessage,
  ConversationSummary,
} from '@verbaloop/shared';

export interface IStorageRepository {
  init(): Promise<void>;
  createRoom(room: RoomState): Promise<RoomState>;
  getRoom(roomCode: string): Promise<RoomState | null>;
  updateRoom(roomCode: string, updates: Partial<RoomState>): Promise<RoomState | null>;
  addTurn(roomCode: string, turn: TurnMessage): Promise<void>;
  updateTurn(
    roomCode: string,
    turnId: string,
    updates: Partial<TurnMessage>
  ): Promise<void>;
  getTurns(roomCode: string): Promise<TurnMessage[]>;
  saveSummary(roomCode: string, summary: ConversationSummary): Promise<void>;
  deleteRoom(roomCode: string): Promise<boolean>;
  getStorageType(): 'mongodb' | 'in-memory';
}

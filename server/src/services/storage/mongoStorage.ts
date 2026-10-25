import dns from 'dns';
import mongoose from 'mongoose';
import {
  RoomState,
  TurnMessage,
  ConversationSummary,
} from '@verbaloop/shared';
import { IStorageRepository } from './types';
import { RoomModel } from '../../models/room.model';

export class MongoStorage implements IStorageRepository {
  private mongoUri: string;

  constructor(mongoUri: string) {
    this.mongoUri = mongoUri;
  }

  async init(): Promise<void> {
    if (mongoose.connection.readyState !== 1) {
      try {
        await mongoose.connect(this.mongoUri, {
          serverSelectionTimeoutMS: 8000,
        });
      } catch (err: any) {
        // On Windows, local ISP DNS often rejects SRV queries (querySrv ECONNREFUSED)
        // Fall back to public resolvers (Google / Cloudflare) to resolve MongoDB Atlas SRV records
        if (
          err?.message?.includes('querySrv') ||
          err?.message?.includes('ECONNREFUSED')
        ) {
          dns.setServers(['8.8.8.8', '1.1.1.1']);
          await mongoose.connect(this.mongoUri, {
            serverSelectionTimeoutMS: 8000,
          });
        } else {
          throw err;
        }
      }
    }
  }

  getStorageType(): 'mongodb' {
    return 'mongodb';
  }

  async createRoom(room: RoomState): Promise<RoomState> {
    const doc = new RoomModel({
      ...room,
      roomCode: room.roomCode.toUpperCase(),
    });
    await doc.save();
    return doc.toObject() as unknown as RoomState;
  }

  async getRoom(roomCode: string): Promise<RoomState | null> {
    const doc = await RoomModel.findOne({
      roomCode: roomCode.toUpperCase(),
    }).lean();
    if (!doc) return null;
    return doc as unknown as RoomState;
  }

  async updateRoom(
    roomCode: string,
    updates: Partial<RoomState>
  ): Promise<RoomState | null> {
    const doc = await RoomModel.findOneAndUpdate(
      { roomCode: roomCode.toUpperCase() },
      { $set: { ...updates, updatedAt: Date.now() } },
      { new: true }
    ).lean();
    if (!doc) return null;
    return doc as unknown as RoomState;
  }

  async addTurn(roomCode: string, turn: TurnMessage): Promise<void> {
    await RoomModel.updateOne(
      { roomCode: roomCode.toUpperCase() },
      {
        $push: { turns: turn },
        $set: { updatedAt: Date.now() },
      }
    );
  }

  async updateTurn(
    roomCode: string,
    turnId: string,
    updates: Partial<TurnMessage>
  ): Promise<void> {
    const setQuery: Record<string, any> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(updates)) {
      setQuery[`turns.$.${key}`] = value;
    }

    await RoomModel.updateOne(
      { roomCode: roomCode.toUpperCase(), 'turns.turnId': turnId },
      { $set: setQuery }
    );
  }

  async getTurns(roomCode: string): Promise<TurnMessage[]> {
    const doc = await RoomModel.findOne(
      { roomCode: roomCode.toUpperCase() },
      { turns: 1 }
    ).lean();
    return (doc?.turns as unknown as TurnMessage[]) || [];
  }

  async saveSummary(
    roomCode: string,
    summary: ConversationSummary
  ): Promise<void> {
    await RoomModel.updateOne(
      { roomCode: roomCode.toUpperCase() },
      {
        $set: {
          summary: summary,
          updatedAt: Date.now(),
        },
      }
    );
  }

  async deleteRoom(roomCode: string): Promise<boolean> {
    const res = await RoomModel.deleteOne({ roomCode: roomCode.toUpperCase() });
    return (res.deletedCount || 0) > 0;
  }
}


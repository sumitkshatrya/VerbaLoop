import mongoose, { Schema, Document } from 'mongoose';
import {
  RoomState,
  TurnMessage,
  ConversationSummary,
  Participant,
} from '@verbaloop/shared';

export interface RoomDocument extends Document, Omit<RoomState, 'roomCode'> {
  roomCode: string;
}

const ParticipantSchema = new Schema<Participant>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    language: { type: String, required: true },
    isHost: { type: Boolean, default: false },
    isReady: { type: Boolean, default: false },
    isAudioReady: { type: Boolean, default: false },
    socketId: { type: String, required: true },
    isSpeaking: { type: Boolean, default: false },
    isListening: { type: Boolean, default: false },
    joinedAt: { type: Number, default: () => Date.now() },
  },
  { _id: false }
);

const TurnMessageSchema = new Schema<TurnMessage>(
  {
    turnId: { type: String, required: true },
    roomCode: { type: String, required: true, index: true },
    speakerId: { type: String, required: true },
    speakerName: { type: String, required: true },
    speakerLanguage: { type: String, required: true },
    originalText: { type: String, default: '' },
    translatedText: { type: String, default: '' },
    targetLanguage: { type: String, required: true },
    status: {
      type: String,
      enum: [
        'drafting',
        'speaking',
        'translating',
        'playing',
        'completed',
        'interrupted',
        'cancelled',
        'error',
      ],
      default: 'speaking',
    },
    isPartial: { type: Boolean, default: false },
    isInterrupted: { type: Boolean, default: false },
    interruptedBy: { type: String },
    interruptedAt: { type: Number },
    correction: {
      originalCorrection: String,
      translatedCorrection: String,
      correctedAt: Number,
    },
    confidence: { type: Number },
    provider: { type: String },
    errorMessage: { type: String },
    createdAt: { type: Number, default: () => Date.now() },
    completedAt: { type: Number },
  },
  { _id: false }
);

const ConversationSummarySchema = new Schema(
  {
    roomCode: { type: String, required: true },
    generatedAt: { type: Number, required: true },
    durationSeconds: { type: Number, required: true },
    totalTurns: { type: Number, required: true },
    interruptedTurns: { type: Number, required: true },
    mainDisagreement: { type: Map, of: String },
    participantPositions: [
      {
        participantId: String,
        participantName: String,
        positions: { type: Map, of: String },
      },
    ],
    pointsOfAgreement: { type: Map, of: [String] },
    unresolvedQuestions: { type: Map, of: [String] },
    changesOfMind: [
      {
        participantId: String,
        participantName: String,
        description: { type: Map, of: String },
      },
    ],
  },
  { _id: false }
);

const RoomSchema = new Schema<RoomDocument>(
  {
    roomCode: { type: String, required: true, unique: true, uppercase: true },
    status: {
      type: String,
      enum: ['waiting', 'ready', 'active', 'paused', 'ended'],
      default: 'waiting',
    },
    topic: { type: String },
    participants: [ParticipantSchema],
    turns: [TurnMessageSchema],
    activeTurnId: { type: String, default: null },
    pausedBy: { type: String, default: null },
    endedBy: { type: String, default: null },
    summary: { type: ConversationSummarySchema, default: null },
    createdAt: { type: Number, default: () => Date.now() },
    updatedAt: { type: Number, default: () => Date.now() },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const RoomModel = mongoose.model<RoomDocument>('Room', RoomSchema);


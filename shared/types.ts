import { SupportedLanguageCode } from './languages';

export type TurnStatus =
  | 'drafting'
  | 'speaking'
  | 'translating'
  | 'playing'
  | 'completed'
  | 'interrupted'
  | 'cancelled'
  | 'error';

export type RoomStatus = 'waiting' | 'ready' | 'active' | 'paused' | 'ended';

export interface Participant {
  id: string;
  name: string;
  language: SupportedLanguageCode;
  isHost: boolean;
  isReady: boolean;
  isAudioReady: boolean;
  socketId: string;
  isSpeaking?: boolean;
  isListening?: boolean;
  joinedAt: number;
}

export interface TurnCorrection {
  originalCorrection: string;
  translatedCorrection: string;
  correctedAt: number;
}

export interface TurnMessage {
  turnId: string;
  roomCode: string;
  speakerId: string;
  speakerName: string;
  speakerLanguage: SupportedLanguageCode;
  originalText: string;
  translatedText: string;
  targetLanguage: SupportedLanguageCode;
  status: TurnStatus;
  isPartial: boolean;
  isInterrupted: boolean;
  interruptedBy?: string;
  interruptedAt?: number;
  correction?: TurnCorrection;
  confidence?: number;
  provider?: string;
  errorMessage?: string;
  createdAt: number;
  completedAt?: number;
}

export interface ParticipantPosition {
  participantId: string;
  participantName: string;
  positions: Record<string, string>; // languageCode -> position text
}

export interface MindChange {
  participantId: string;
  participantName: string;
  description: Record<string, string>; // languageCode -> explanation
}

export interface ConversationSummary {
  roomCode: string;
  generatedAt: number;
  durationSeconds: number;
  totalTurns: number;
  interruptedTurns: number;
  mainDisagreement: Record<string, string>; // languageCode -> summary
  participantPositions: ParticipantPosition[];
  pointsOfAgreement: Record<string, string[]>; // languageCode -> bullet points
  unresolvedQuestions: Record<string, string[]>; // languageCode -> bullet points
  changesOfMind: MindChange[];
}

export interface RoomState {
  roomCode: string;
  status: RoomStatus;
  topic?: string;
  participants: Participant[];
  turns: TurnMessage[];
  activeTurnId?: string | null;
  pausedBy?: string | null;
  endedBy?: string | null;
  summary?: ConversationSummary | null;
  createdAt: number;
  updatedAt: number;
}


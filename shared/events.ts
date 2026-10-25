import { z } from 'zod';

export const SupportedLanguageCodeSchema = z.enum([
  'hi',
  'en',
  'zh',
  'es',
  'fr',
  'ar',
  'ja',
  'de',
  'pt',
  'ru',
]);

// 1. room:create
export const RoomCreateSchema = z.object({
  hostName: z.string().min(1, 'Host name is required').max(50),
  hostLanguage: SupportedLanguageCodeSchema,
  topic: z.string().max(120).optional(),
});
export type RoomCreatePayload = z.infer<typeof RoomCreateSchema>;

// 2. room:join
export const RoomJoinSchema = z.object({
  roomCode: z.string().min(4).max(12).transform((v) => v.trim().toUpperCase()),
  participantName: z.string().min(1, 'Participant name is required').max(50),
  participantLanguage: SupportedLanguageCodeSchema,
});
export type RoomJoinPayload = z.infer<typeof RoomJoinSchema>;

// 3. participant:ready
export const ParticipantReadySchema = z.object({
  roomCode: z.string().min(4).max(12),
  participantId: z.string().min(1),
  isReady: z.boolean(),
  isAudioReady: z.boolean().default(false),
});
export type ParticipantReadyPayload = z.infer<typeof ParticipantReadySchema>;

// 4. turn:start
export const TurnStartSchema = z.object({
  roomCode: z.string().min(4).max(12),
  turnId: z.string().min(1),
  speakerId: z.string().min(1),
  inputType: z.enum(['voice', 'text']).default('text'),
});
export type TurnStartPayload = z.infer<typeof TurnStartSchema>;

// 5. turn:partial
export const TurnPartialSchema = z.object({
  roomCode: z.string().min(4).max(12),
  turnId: z.string().min(1),
  speakerId: z.string().min(1),
  partialText: z.string().max(2000),
});
export type TurnPartialPayload = z.infer<typeof TurnPartialSchema>;

// 6. turn:complete
export const TurnCompleteSchema = z.object({
  roomCode: z.string().min(4).max(12),
  turnId: z.string().min(1),
  speakerId: z.string().min(1),
  originalText: z.string().min(1, 'Original text cannot be empty').max(2000),
});
export type TurnCompletePayload = z.infer<typeof TurnCompleteSchema>;

// 7. translation:complete (Server to Client)
export const TranslationCompleteSchema = z.object({
  roomCode: z.string(),
  turnId: z.string(),
  speakerId: z.string(),
  speakerLanguage: SupportedLanguageCodeSchema,
  originalText: z.string(),
  translatedText: z.string(),
  targetLanguage: SupportedLanguageCodeSchema,
  status: z.enum(['completed', 'interrupted', 'error']),
  provider: z.string().optional(),
});
export type TranslationCompletePayload = z.infer<typeof TranslationCompleteSchema>;

// 8. turn:interrupt
export const TurnInterruptSchema = z.object({
  roomCode: z.string().min(4).max(12),
  turnId: z.string().min(1),
  interruptedBy: z.string().min(1),
  timestamp: z.number().default(() => Date.now()),
  reason: z.string().optional(),
});
export type TurnInterruptPayload = z.infer<typeof TurnInterruptSchema>;

// 9. turn:cancel
export const TurnCancelSchema = z.object({
  roomCode: z.string().min(4).max(12),
  turnId: z.string().min(1),
  speakerId: z.string().min(1),
  reason: z.string().optional(),
});
export type TurnCancelPayload = z.infer<typeof TurnCancelSchema>;

// 10. turn:correct
export const TurnCorrectSchema = z.object({
  roomCode: z.string().min(4).max(12),
  turnId: z.string().min(1),
  speakerId: z.string().min(1),
  correctedText: z.string().min(1).max(2000),
});
export type TurnCorrectPayload = z.infer<typeof TurnCorrectSchema>;

// 11. audio:playback-start & audio:playback-stop
export const AudioPlaybackSchema = z.object({
  roomCode: z.string().min(4).max(12),
  turnId: z.string().min(1),
  participantId: z.string().min(1),
});
export type AudioPlaybackPayload = z.infer<typeof AudioPlaybackSchema>;

// 12. conversation:pause & conversation:resume
export const ConversationPauseSchema = z.object({
  roomCode: z.string().min(4).max(12),
  participantId: z.string().min(1),
  reason: z.string().optional(),
});
export type ConversationPausePayload = z.infer<typeof ConversationPauseSchema>;

export const ConversationResumeSchema = z.object({
  roomCode: z.string().min(4).max(12),
  participantId: z.string().min(1),
});
export type ConversationResumePayload = z.infer<typeof ConversationResumeSchema>;

// 13. conversation:end
export const ConversationEndSchema = z.object({
  roomCode: z.string().min(4).max(12),
  participantId: z.string().min(1),
});
export type ConversationEndPayload = z.infer<typeof ConversationEndSchema>;

// 14. conversation:delete
export const ConversationDeleteSchema = z.object({
  roomCode: z.string().min(4).max(12),
  participantId: z.string().min(1),
});
export type ConversationDeletePayload = z.infer<typeof ConversationDeleteSchema>;

// Event Names
export const SOCKET_EVENTS = {
  ROOM_CREATE: 'room:create',
  ROOM_JOIN: 'room:join',
  PARTICIPANT_READY: 'participant:ready',
  TURN_START: 'turn:start',
  TURN_PARTIAL: 'turn:partial',
  TURN_COMPLETE: 'turn:complete',
  TRANSLATION_COMPLETE: 'translation:complete',
  TURN_INTERRUPT: 'turn:interrupt',
  TURN_CANCEL: 'turn:cancel',
  TURN_CORRECT: 'turn:correct',
  AUDIO_PLAYBACK_START: 'audio:playback-start',
  AUDIO_PLAYBACK_STOP: 'audio:playback-stop',
  CONVERSATION_PAUSE: 'conversation:pause',
  CONVERSATION_RESUME: 'conversation:resume',
  CONVERSATION_END: 'conversation:end',
  CONVERSATION_DELETE: 'conversation:delete',
  PARTICIPANT_DISCONNECT: 'participant:disconnect',
  ROOM_STATE: 'room:state',
  ERROR: 'error:event',
} as const;

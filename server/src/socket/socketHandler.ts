import { Server as SocketIOServer, Socket } from 'socket.io';
import {
  SOCKET_EVENTS,
  RoomCreateSchema,
  RoomJoinSchema,
  ParticipantReadySchema,
  TurnStartSchema,
  TurnPartialSchema,
  TurnCompleteSchema,
  TurnInterruptSchema,
  TurnCancelSchema,
  TurnCorrectSchema,
  AudioPlaybackSchema,
  ConversationPauseSchema,
  ConversationResumeSchema,
  ConversationEndSchema,
  ConversationDeleteSchema,
} from '@verbaloop/shared';
import { RoomManager } from './roomManager';
import { TurnManager } from './turnManager';
import { IStorageRepository } from '../services/storage/types';
import { conversationSummaryService } from '../services/summary/summaryService';

export function setupSocketHandlers(
  io: SocketIOServer,
  storage: IStorageRepository
) {
  const roomManager = new RoomManager(storage);
  const turnManager = new TurnManager(storage);

  io.on('connection', (socket: Socket) => {
    // 1. ROOM CREATE
    socket.on(SOCKET_EVENTS.ROOM_CREATE, async (rawPayload, callback) => {
      try {
        const payload = RoomCreateSchema.parse(rawPayload);
        const { room, host } = await roomManager.createRoom(
          payload.hostName,
          payload.hostLanguage,
          socket.id,
          payload.topic
        );

        socket.join(room.roomCode);

        const response = { success: true, room, participant: host };
        if (typeof callback === 'function') callback(response);
        socket.emit(SOCKET_EVENTS.ROOM_STATE, room);
      } catch (err: any) {
        console.error('Error in room:create:', err.message);
        const errorResp = {
          success: false,
          error: err.issues?.[0]?.message || err.message,
        };
        if (typeof callback === 'function') callback(errorResp);
        socket.emit(SOCKET_EVENTS.ERROR, errorResp);
      }
    });

    // 2. ROOM JOIN
    socket.on(SOCKET_EVENTS.ROOM_JOIN, async (rawPayload, callback) => {
      try {
        const payload = RoomJoinSchema.parse(rawPayload);
        const { room, participant } = await roomManager.joinRoom(
          payload.roomCode,
          payload.participantName,
          payload.participantLanguage,
          socket.id
        );

        socket.join(room.roomCode);

        const response = { success: true, room, participant };
        if (typeof callback === 'function') callback(response);

        // Broadcast to all participants in this room
        io.to(room.roomCode).emit(SOCKET_EVENTS.ROOM_STATE, room);
      } catch (err: any) {
        console.error('Error in room:join:', err.message);
        const errorResp = {
          success: false,
          error: err.issues?.[0]?.message || err.message,
        };
        if (typeof callback === 'function') callback(errorResp);
        socket.emit(SOCKET_EVENTS.ERROR, errorResp);
      }
    });

    // 3. PARTICIPANT READY
    socket.on(SOCKET_EVENTS.PARTICIPANT_READY, async (rawPayload) => {
      try {
        const payload = ParticipantReadySchema.parse(rawPayload);
        const room = await roomManager.setParticipantReady(
          payload.roomCode,
          payload.participantId,
          payload.isReady,
          payload.isAudioReady
        );
        io.to(payload.roomCode).emit(SOCKET_EVENTS.ROOM_STATE, room);
      } catch (err: any) {
        socket.emit(SOCKET_EVENTS.ERROR, { error: err.message });
      }
    });

    // 4. TURN START
    socket.on(SOCKET_EVENTS.TURN_START, async (rawPayload) => {
      try {
        const payload = TurnStartSchema.parse(rawPayload);
        const { room, turn } = await turnManager.startTurn(
          payload.roomCode,
          payload.turnId,
          payload.speakerId,
          payload.inputType
        );

        io.to(payload.roomCode).emit(SOCKET_EVENTS.TURN_START, turn);
        io.to(payload.roomCode).emit(SOCKET_EVENTS.ROOM_STATE, room);
      } catch (err: any) {
        socket.emit(SOCKET_EVENTS.ERROR, { error: err.message });
      }
    });

    // 5. TURN PARTIAL
    socket.on(SOCKET_EVENTS.TURN_PARTIAL, async (rawPayload) => {
      try {
        const payload = TurnPartialSchema.parse(rawPayload);
        const turn = await turnManager.updatePartial(
          payload.roomCode,
          payload.turnId,
          payload.speakerId,
          payload.partialText
        );
        if (turn) {
          // Broadcast live streaming transcript to other participant
          socket.to(payload.roomCode).emit(SOCKET_EVENTS.TURN_PARTIAL, turn);
        }
      } catch (err: any) {
        socket.emit(SOCKET_EVENTS.ERROR, { error: err.message });
      }
    });

    // 6. TURN COMPLETE & TRANSLATION
    socket.on(SOCKET_EVENTS.TURN_COMPLETE, async (rawPayload) => {
      try {
        const payload = TurnCompleteSchema.parse(rawPayload);
        const { turn, isInterrupted } = await turnManager.completeTurn(
          payload.roomCode,
          payload.turnId,
          payload.speakerId,
          payload.originalText
        );

        if (!isInterrupted) {
          io.to(payload.roomCode).emit(SOCKET_EVENTS.TRANSLATION_COMPLETE, turn);
          const room = await storage.getRoom(payload.roomCode);
          if (room) {
            io.to(payload.roomCode).emit(SOCKET_EVENTS.ROOM_STATE, room);
          }
        }
      } catch (err: any) {
        console.error('Error in turn:complete:', err.message);
        socket.emit(SOCKET_EVENTS.ERROR, { error: err.message });
      }
    });

    // 7. TURN INTERRUPT (Real interruption handling)
    socket.on(SOCKET_EVENTS.TURN_INTERRUPT, async (rawPayload) => {
      try {
        const payload = TurnInterruptSchema.parse(rawPayload);
        const { room, turn } = await turnManager.interruptTurn(
          payload.roomCode,
          payload.turnId,
          payload.interruptedBy,
          payload.reason
        );

        // Immediately notify all clients to cancel audio playback and mark turn as interrupted
        io.to(payload.roomCode).emit(SOCKET_EVENTS.TURN_INTERRUPT, {
          turnId: payload.turnId,
          interruptedBy: payload.interruptedBy,
          turn,
        });

        io.to(payload.roomCode).emit(SOCKET_EVENTS.ROOM_STATE, room);
      } catch (err: any) {
        socket.emit(SOCKET_EVENTS.ERROR, { error: err.message });
      }
    });

    // 8. TURN CANCEL
    socket.on(SOCKET_EVENTS.TURN_CANCEL, async (rawPayload) => {
      try {
        const payload = TurnCancelSchema.parse(rawPayload);
        const { room, turn } = await turnManager.cancelTurn(
          payload.roomCode,
          payload.turnId,
          payload.speakerId,
          payload.reason
        );

        io.to(payload.roomCode).emit(SOCKET_EVENTS.TURN_CANCEL, {
          turnId: payload.turnId,
          turn,
        });
        io.to(payload.roomCode).emit(SOCKET_EVENTS.ROOM_STATE, room);
      } catch (err: any) {
        socket.emit(SOCKET_EVENTS.ERROR, { error: err.message });
      }
    });

    // 9. TURN CORRECT
    socket.on(SOCKET_EVENTS.TURN_CORRECT, async (rawPayload) => {
      try {
        const payload = TurnCorrectSchema.parse(rawPayload);
        const { room, turn } = await turnManager.correctTurn(
          payload.roomCode,
          payload.turnId,
          payload.speakerId,
          payload.correctedText
        );

        io.to(payload.roomCode).emit(SOCKET_EVENTS.TURN_CORRECT, turn);
        io.to(payload.roomCode).emit(SOCKET_EVENTS.ROOM_STATE, room);
      } catch (err: any) {
        socket.emit(SOCKET_EVENTS.ERROR, { error: err.message });
      }
    });

    // 10. AUDIO PLAYBACK STATES
    socket.on(SOCKET_EVENTS.AUDIO_PLAYBACK_START, async (rawPayload) => {
      try {
        const payload = AudioPlaybackSchema.parse(rawPayload);
        await roomManager.updateAudioState(
          payload.roomCode,
          payload.participantId,
          false,
          true
        );
        socket.to(payload.roomCode).emit(SOCKET_EVENTS.AUDIO_PLAYBACK_START, payload);
      } catch {}
    });

    socket.on(SOCKET_EVENTS.AUDIO_PLAYBACK_STOP, async (rawPayload) => {
      try {
        const payload = AudioPlaybackSchema.parse(rawPayload);
        await roomManager.updateAudioState(
          payload.roomCode,
          payload.participantId,
          false,
          false
        );
        socket.to(payload.roomCode).emit(SOCKET_EVENTS.AUDIO_PLAYBACK_STOP, payload);
      } catch {}
    });

    // 11. PAUSE & RESUME
    socket.on(SOCKET_EVENTS.CONVERSATION_PAUSE, async (rawPayload) => {
      try {
        const payload = ConversationPauseSchema.parse(rawPayload);
        const room = await roomManager.pauseRoom(
          payload.roomCode,
          payload.participantId,
          payload.reason
        );
        io.to(payload.roomCode).emit(SOCKET_EVENTS.CONVERSATION_PAUSE, {
          pausedBy: payload.participantId,
          reason: payload.reason,
        });
        io.to(payload.roomCode).emit(SOCKET_EVENTS.ROOM_STATE, room);
      } catch (err: any) {
        socket.emit(SOCKET_EVENTS.ERROR, { error: err.message });
      }
    });

    socket.on(SOCKET_EVENTS.CONVERSATION_RESUME, async (rawPayload) => {
      try {
        const payload = ConversationResumeSchema.parse(rawPayload);
        const room = await roomManager.resumeRoom(
          payload.roomCode,
          payload.participantId
        );
        io.to(payload.roomCode).emit(SOCKET_EVENTS.CONVERSATION_RESUME, {
          resumedBy: payload.participantId,
        });
        io.to(payload.roomCode).emit(SOCKET_EVENTS.ROOM_STATE, room);
      } catch (err: any) {
        socket.emit(SOCKET_EVENTS.ERROR, { error: err.message });
      }
    });

    // 12. END CONVERSATION & GENERATE SUMMARY
    socket.on(SOCKET_EVENTS.CONVERSATION_END, async (rawPayload) => {
      try {
        const payload = ConversationEndSchema.parse(rawPayload);
        const room = await roomManager.endRoom(
          payload.roomCode,
          payload.participantId
        );

        // Generate bilingual structured summary
        const summary = await conversationSummaryService.generateSummary(room);
        room.summary = summary;
        await storage.saveSummary(payload.roomCode, summary);

        io.to(payload.roomCode).emit(SOCKET_EVENTS.CONVERSATION_END, {
          endedBy: payload.participantId,
          summary,
        });
        io.to(payload.roomCode).emit(SOCKET_EVENTS.ROOM_STATE, room);
      } catch (err: any) {
        socket.emit(SOCKET_EVENTS.ERROR, { error: err.message });
      }
    });

    // 13. CONVERSATION DELETE
    socket.on(SOCKET_EVENTS.CONVERSATION_DELETE, async (rawPayload) => {
      try {
        const payload = ConversationDeleteSchema.parse(rawPayload);
        await storage.deleteRoom(payload.roomCode);
        io.to(payload.roomCode).emit(SOCKET_EVENTS.CONVERSATION_DELETE, {
          deletedBy: payload.participantId,
        });
      } catch (err: any) {
        socket.emit(SOCKET_EVENTS.ERROR, { error: err.message });
      }
    });

    // 14. DISCONNECT
    socket.on('disconnect', async () => {
      const { roomCode, participantId, room } =
        await roomManager.handleDisconnect(socket.id);
      if (roomCode && participantId) {
        io.to(roomCode).emit(SOCKET_EVENTS.PARTICIPANT_DISCONNECT, {
          participantId,
          timestamp: Date.now(),
        });
        if (room) {
          io.to(roomCode).emit(SOCKET_EVENTS.ROOM_STATE, room);
        }
      }
    });
  });
}


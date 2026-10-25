import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  RoomState,
  Participant,
  TurnMessage,
  SOCKET_EVENTS,
  SupportedLanguageCode,
  ConversationSummary,
} from '@verbaloop/shared';
import { soundEffects } from '../utils/soundEffects';

export interface InterruptionEvent {
  turnId: string;
  interruptedBy: string;
  timestamp: number;
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [streamingTurn, setStreamingTurn] = useState<TurnMessage | null>(null);
  const [lastCompletedTurn, setLastCompletedTurn] = useState<TurnMessage | null>(null);
  const [remotePlayingAudioId, setRemotePlayingAudioId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastInterruption, setLastInterruption] = useState<InterruptionEvent | null>(null);

  useEffect(() => {
    // Determine socket target based on environment:
    // 1. Explicit VITE_BACKEND_URL (from client/.env or build env)
    // 2. Localhost development fallback (http://localhost:5000)
    // 3. Render production live backend URL (https://verbaloop-api.onrender.com)
    const envBackendUrl = (import.meta as any).env?.VITE_BACKEND_URL;
    const isLocalhost =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.origin.includes('5173'));

    const socketUrl =
      envBackendUrl ||
      (isLocalhost ? 'http://localhost:5000' : 'https://verbaloop-api.onrender.com');

    const socket = io(socketUrl, {
      reconnectionAttempts: 8,
      reconnectionDelay: 1500,
      autoConnect: true,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      setIsConnected(false);
      setError(`Connection error: ${err.message}`);
    });

    // Room state synchronization
    socket.on(SOCKET_EVENTS.ROOM_STATE, (room: RoomState) => {
      setRoomState(room);
      if (currentParticipant) {
        const updated = room.participants.find((p) => p.id === currentParticipant.id);
        if (updated) setCurrentParticipant(updated);
      }
    });

    // Turn events
    socket.on(SOCKET_EVENTS.TURN_START, (turn: TurnMessage) => {
      soundEffects.playTurnStart();
      setStreamingTurn(turn);
    });

    socket.on(SOCKET_EVENTS.TURN_PARTIAL, (turn: TurnMessage) => {
      setStreamingTurn(turn);
    });

    socket.on(SOCKET_EVENTS.TRANSLATION_COMPLETE, (turn: TurnMessage) => {
      soundEffects.playTurnComplete();
      setStreamingTurn(null);
      setLastCompletedTurn(turn);
      setRoomState((prev) => {
        if (!prev) return null;
        const exists = prev.turns.some((t) => t.turnId === turn.turnId);
        const updatedTurns = exists
          ? prev.turns.map((t) => (t.turnId === turn.turnId ? turn : t))
          : [...prev.turns, turn];
        return {
          ...prev,
          turns: updatedTurns,
          activeTurnId: prev.activeTurnId === turn.turnId ? null : prev.activeTurnId,
        };
      });
    });

    // Interruption event from peer
    socket.on(SOCKET_EVENTS.TURN_INTERRUPT, (data: any) => {
      soundEffects.playInterrupted();
      setStreamingTurn(null);
      setLastInterruption({
        turnId: data.turnId,
        interruptedBy: data.interruptedBy,
        timestamp: Date.now(),
      });
      setRoomState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          activeTurnId: null,
          turns: prev.turns.map((t) =>
            t.turnId === data.turnId
              ? { ...t, status: 'interrupted', isInterrupted: true }
              : t
          ),
        };
      });
    });

    socket.on(SOCKET_EVENTS.TURN_CANCEL, (data: any) => {
      setStreamingTurn(null);
      setRoomState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          activeTurnId: prev.activeTurnId === data.turnId ? null : prev.activeTurnId,
          turns: prev.turns.filter((t) => t.turnId !== data.turnId),
        };
      });
    });

    socket.on(SOCKET_EVENTS.CONVERSATION_PAUSE, () => {
      soundEffects.playPause();
    });

    socket.on(SOCKET_EVENTS.CONVERSATION_RESUME, () => {
      soundEffects.playResume();
    });

    socket.on(SOCKET_EVENTS.CONVERSATION_END, (data: { summary?: ConversationSummary }) => {
      soundEffects.playTurnComplete();
      if (data?.summary) {
        setRoomState((prev) => (prev ? { ...prev, status: 'ended', summary: data.summary } : null));
      }
    });

    socket.on(SOCKET_EVENTS.CONVERSATION_DELETE, () => {
      setRoomState(null);
      setCurrentParticipant(null);
      setStreamingTurn(null);
    });

    socket.on(SOCKET_EVENTS.AUDIO_PLAYBACK_START, (data: { participantId: string }) => {
      setRemotePlayingAudioId(data.participantId);
    });

    socket.on(SOCKET_EVENTS.AUDIO_PLAYBACK_STOP, () => {
      setRemotePlayingAudioId(null);
    });

    socket.on(SOCKET_EVENTS.ERROR, (err: { error: string }) => {
      setError(err.error);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // 1. Create Room
  const createRoom = useCallback(
    (
      hostName: string,
      hostLanguage: SupportedLanguageCode,
      topic?: string
    ): Promise<{ room: RoomState; participant: Participant }> => {
      return new Promise((resolve, reject) => {
        if (!socketRef.current) return reject(new Error('Socket not initialized'));

        socketRef.current.emit(
          SOCKET_EVENTS.ROOM_CREATE,
          { hostName, hostLanguage, topic },
          (response: any) => {
            if (response?.success) {
              setRoomState(response.room);
              setCurrentParticipant(response.participant);
              resolve(response);
            } else {
              reject(new Error(response?.error || 'Failed to create room'));
            }
          }
        );
      });
    },
    []
  );

  // 2. Join Room
  const joinRoom = useCallback(
    (
      roomCode: string,
      participantName: string,
      participantLanguage: SupportedLanguageCode
    ): Promise<{ room: RoomState; participant: Participant }> => {
      return new Promise((resolve, reject) => {
        if (!socketRef.current) return reject(new Error('Socket not initialized'));

        socketRef.current.emit(
          SOCKET_EVENTS.ROOM_JOIN,
          { roomCode, participantName, participantLanguage },
          (response: any) => {
            if (response?.success) {
              setRoomState(response.room);
              setCurrentParticipant(response.participant);
              resolve(response);
            } else {
              reject(new Error(response?.error || 'Failed to join room'));
            }
          }
        );
      });
    },
    []
  );

  // 3. Ready status
  const setReady = useCallback(
    (isReady: boolean, isAudioReady: boolean) => {
      if (!socketRef.current || !roomState || !currentParticipant) return;
      socketRef.current.emit(SOCKET_EVENTS.PARTICIPANT_READY, {
        roomCode: roomState.roomCode,
        participantId: currentParticipant.id,
        isReady,
        isAudioReady,
      });
    },
    [roomState, currentParticipant]
  );

  // 4. Turn start
  const startTurn = useCallback(
    (turnId: string, inputType: 'voice' | 'text' = 'text') => {
      if (!socketRef.current || !roomState || !currentParticipant) return;
      socketRef.current.emit(SOCKET_EVENTS.TURN_START, {
        roomCode: roomState.roomCode,
        turnId,
        speakerId: currentParticipant.id,
        inputType,
      });
    },
    [roomState, currentParticipant]
  );

  // 5. Send partial transcript
  const sendPartial = useCallback(
    (turnId: string, partialText: string) => {
      if (!socketRef.current || !roomState || !currentParticipant) return;
      socketRef.current.emit(SOCKET_EVENTS.TURN_PARTIAL, {
        roomCode: roomState.roomCode,
        turnId,
        speakerId: currentParticipant.id,
        partialText,
      });
    },
    [roomState, currentParticipant]
  );

  // 6. Complete turn & trigger translation
  const completeTurn = useCallback(
    (turnId: string, originalText: string) => {
      if (!socketRef.current || !roomState || !currentParticipant) return;
      socketRef.current.emit(SOCKET_EVENTS.TURN_COMPLETE, {
        roomCode: roomState.roomCode,
        turnId,
        speakerId: currentParticipant.id,
        originalText,
      });
    },
    [roomState, currentParticipant]
  );

  // 7. Interrupt turn
  const interruptTurn = useCallback(
    (turnId: string, reason?: string) => {
      if (!socketRef.current || !roomState || !currentParticipant) return;
      socketRef.current.emit(SOCKET_EVENTS.TURN_INTERRUPT, {
        roomCode: roomState.roomCode,
        turnId,
        interruptedBy: currentParticipant.id,
        reason: reason || 'Direct interruption by conversational partner',
      });
    },
    [roomState, currentParticipant]
  );

  // 8. Cancel turn
  const cancelTurn = useCallback(
    (turnId: string, reason?: string) => {
      if (!socketRef.current || !roomState || !currentParticipant) return;
      socketRef.current.emit(SOCKET_EVENTS.TURN_CANCEL, {
        roomCode: roomState.roomCode,
        turnId,
        speakerId: currentParticipant.id,
        reason,
      });
    },
    [roomState, currentParticipant]
  );

  // 9. Correct turn
  const correctTurn = useCallback(
    (turnId: string, correctedText: string) => {
      if (!socketRef.current || !roomState || !currentParticipant) return;
      socketRef.current.emit(SOCKET_EVENTS.TURN_CORRECT, {
        roomCode: roomState.roomCode,
        turnId,
        speakerId: currentParticipant.id,
        correctedText,
      });
    },
    [roomState, currentParticipant]
  );

  // 10. Audio playback indicator synchronization
  const notifyPlaybackStart = useCallback(
    (turnId: string) => {
      if (!socketRef.current || !roomState || !currentParticipant) return;
      socketRef.current.emit(SOCKET_EVENTS.AUDIO_PLAYBACK_START, {
        roomCode: roomState.roomCode,
        turnId,
        participantId: currentParticipant.id,
      });
    },
    [roomState, currentParticipant]
  );

  const notifyPlaybackStop = useCallback(
    (turnId: string) => {
      if (!socketRef.current || !roomState || !currentParticipant) return;
      socketRef.current.emit(SOCKET_EVENTS.AUDIO_PLAYBACK_STOP, {
        roomCode: roomState.roomCode,
        turnId,
        participantId: currentParticipant.id,
      });
    },
    [roomState, currentParticipant]
  );

  // 11. Pause & Resume
  const pauseConversation = useCallback(
    (reason?: string) => {
      if (!socketRef.current || !roomState || !currentParticipant) return;
      socketRef.current.emit(SOCKET_EVENTS.CONVERSATION_PAUSE, {
        roomCode: roomState.roomCode,
        participantId: currentParticipant.id,
        reason: reason || 'I need a moment to think',
      });
    },
    [roomState, currentParticipant]
  );

  const resumeConversation = useCallback(() => {
    if (!socketRef.current || !roomState || !currentParticipant) return;
    socketRef.current.emit(SOCKET_EVENTS.CONVERSATION_RESUME, {
      roomCode: roomState.roomCode,
      participantId: currentParticipant.id,
    });
  }, [roomState, currentParticipant]);

  // 12. End & Delete Conversation
  const endConversation = useCallback(() => {
    if (!socketRef.current || !roomState || !currentParticipant) return;
    socketRef.current.emit(SOCKET_EVENTS.CONVERSATION_END, {
      roomCode: roomState.roomCode,
      participantId: currentParticipant.id,
    });
  }, [roomState, currentParticipant]);

  const deleteConversation = useCallback(() => {
    if (!socketRef.current || !roomState || !currentParticipant) return;
    socketRef.current.emit(SOCKET_EVENTS.CONVERSATION_DELETE, {
      roomCode: roomState.roomCode,
      participantId: currentParticipant.id,
    });
    setRoomState(null);
    setCurrentParticipant(null);
  }, [roomState, currentParticipant]);

  const leaveRoom = useCallback(() => {
    setRoomState(null);
    setCurrentParticipant(null);
    setStreamingTurn(null);
    setError(null);
  }, []);

  return {
    isConnected,
    roomState,
    currentParticipant,
    streamingTurn,
    error,
    lastInterruption,
    lastCompletedTurn,
    remotePlayingAudioId,
    createRoom,
    joinRoom,
    setReady,
    startTurn,
    sendPartial,
    completeTurn,
    interruptTurn,
    cancelTurn,
    correctTurn,
    notifyPlaybackStart,
    notifyPlaybackStop,
    pauseConversation,
    resumeConversation,
    endConversation,
    deleteConversation,
    leaveRoom,
    clearError: () => setError(null),
  };
}

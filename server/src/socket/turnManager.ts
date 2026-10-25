import {
  TurnMessage,
  RoomState,
  SupportedLanguageCode,
  TurnCorrection,
} from '@verbaloop/shared';
import { IStorageRepository } from '../services/storage/types';
import { translationService } from '../services/ai/translationService';

export class TurnManager {
  constructor(private storage: IStorageRepository) {}

  async startTurn(
    roomCode: string,
    turnId: string,
    speakerId: string,
    inputType: 'voice' | 'text'
  ): Promise<{ room: RoomState; turn: TurnMessage }> {
    const room = await this.storage.getRoom(roomCode);
    if (!room) throw new Error('Room not found');

    if (room.status === 'paused') {
      throw new Error('Conversation is currently paused. Resume before speaking.');
    }
    if (room.status === 'ended') {
      throw new Error('Conversation has ended.');
    }

    const speaker = room.participants.find((p) => p.id === speakerId);
    if (!speaker) throw new Error('Speaker is not a member of this room');

    // Find receiver
    const receiver = room.participants.find((p) => p.id !== speakerId);
    const targetLanguage: SupportedLanguageCode = receiver
      ? receiver.language
      : speaker.language === 'en'
      ? 'zh'
      : 'en';

    const turn: TurnMessage = {
      turnId,
      roomCode,
      speakerId: speaker.id,
      speakerName: speaker.name,
      speakerLanguage: speaker.language,
      originalText: '',
      translatedText: '',
      targetLanguage,
      status: 'speaking',
      isPartial: true,
      isInterrupted: false,
      createdAt: Date.now(),
    };

    room.activeTurnId = turnId;
    await this.storage.addTurn(roomCode, turn);
    await this.storage.updateRoom(roomCode, { activeTurnId: turnId });

    return { room, turn };
  }

  async updatePartial(
    roomCode: string,
    turnId: string,
    speakerId: string,
    partialText: string
  ): Promise<TurnMessage | null> {
    const room = await this.storage.getRoom(roomCode);
    if (!room) return null;

    const turn = room.turns.find((t) => t.turnId === turnId);
    if (!turn || turn.isInterrupted) return null;

    turn.originalText = partialText;
    turn.isPartial = true;

    await this.storage.updateTurn(roomCode, turnId, {
      originalText: partialText,
      isPartial: true,
    });

    return turn;
  }

  async completeTurn(
    roomCode: string,
    turnId: string,
    speakerId: string,
    originalText: string
  ): Promise<{ turn: TurnMessage; isInterrupted: boolean }> {
    const room = await this.storage.getRoom(roomCode);
    if (!room) throw new Error('Room not found');

    const cleanText = (originalText || '').trim();

    let turn = room.turns.find((t) => t.turnId === turnId);
    if (!turn) {
      console.warn(
        `[TurnManager] Turn ${turnId} not found in room ${roomCode}. Initializing turn on-the-fly.`
      );
      const speaker = room.participants.find((p) => p.id === speakerId) || room.participants[0];
      const receiver = room.participants.find((p) => p.id !== speakerId);
      const targetLanguage: SupportedLanguageCode = receiver
        ? receiver.language
        : speaker?.language === 'en'
        ? 'zh'
        : 'en';

      turn = {
        turnId,
        roomCode,
        speakerId: speaker?.id || speakerId,
        speakerName: speaker?.name || 'Participant',
        speakerLanguage: speaker?.language || 'en',
        originalText: cleanText,
        translatedText: '',
        targetLanguage,
        status: 'speaking',
        isPartial: false,
        isInterrupted: false,
        createdAt: Date.now(),
      };
      room.turns.push(turn);
      await this.storage.addTurn(roomCode, turn);
    }

    if (turn.isInterrupted) {
      return { turn, isInterrupted: true };
    }

    if (turn.status === 'completed' && turn.translatedText) {
      return { turn, isInterrupted: false };
    }

    if (!cleanText) {
      // Cleanly cancel empty turn so no blank ghost bubbles enter the room
      turn.status = 'cancelled';
      turn.isPartial = false;
      await this.storage.updateTurn(roomCode, turnId, {
        status: 'cancelled',
        isPartial: false,
      });
      if (room.activeTurnId === turnId) {
        room.activeTurnId = null;
        await this.storage.updateRoom(roomCode, { activeTurnId: null });
      }
      return { turn, isInterrupted: false };
    }

    turn.originalText = cleanText;
    turn.status = 'translating';
    turn.isPartial = false;

    await this.storage.updateTurn(roomCode, turnId, {
      originalText: turn.originalText,
      status: 'translating',
      isPartial: false,
    });

    // Run real translation
    try {
      const translationResult = await translationService.translate(
        turn.originalText,
        turn.speakerLanguage,
        turn.targetLanguage,
        turnId
      );

      // Verify turn was not interrupted while translating
      const currentRoom = await this.storage.getRoom(roomCode);
      const currentTurn = currentRoom?.turns.find((t) => t.turnId === turnId);

      if (currentTurn?.isInterrupted) {
        return { turn: currentTurn, isInterrupted: true };
      }

      turn.translatedText = translationResult.translatedText;
      turn.provider = translationResult.provider;
      turn.confidence = translationResult.confidence;
      turn.status = 'completed';
      turn.completedAt = Date.now();

      await this.storage.updateTurn(roomCode, turnId, {
        translatedText: turn.translatedText,
        provider: turn.provider,
        confidence: turn.confidence,
        status: 'completed',
        completedAt: turn.completedAt,
      });

      if (room.activeTurnId === turnId) {
        await this.storage.updateRoom(roomCode, { activeTurnId: null });
      }

      return { turn, isInterrupted: false };
    } catch (err: any) {
      if (err.message?.includes('cancelled') || err.message?.includes('interrupted')) {
        const reloaded = await this.storage.getRoom(roomCode);
        const finalTurn = reloaded?.turns.find((t) => t.turnId === turnId) || turn;
        return { turn: finalTurn, isInterrupted: true };
      }

      // Fallback translation error handling
      turn.status = 'error';
      turn.errorMessage = err.message || 'Translation failed';
      turn.translatedText = `[Translation unavailable: ${turn.originalText}]`;

      await this.storage.updateTurn(roomCode, turnId, {
        status: 'error',
        errorMessage: turn.errorMessage,
        translatedText: turn.translatedText,
      });

      return { turn, isInterrupted: false };
    }
  }

  async interruptTurn(
    roomCode: string,
    turnId: string,
    interruptedBy: string,
    reason?: string
  ): Promise<{ room: RoomState; turn: TurnMessage | null }> {
    // 1. Cancel in-flight translation
    translationService.cancelTurn(turnId);

    const room = await this.storage.getRoom(roomCode);
    if (!room) throw new Error('Room not found');

    const turn = room.turns.find((t) => t.turnId === turnId);

    if (turn) {
      turn.status = 'interrupted';
      turn.isInterrupted = true;
      turn.interruptedBy = interruptedBy;
      turn.interruptedAt = Date.now();

      await this.storage.updateTurn(roomCode, turnId, {
        status: 'interrupted',
        isInterrupted: true,
        interruptedBy,
        interruptedAt: turn.interruptedAt,
      });
    }

    // Immediately clear active turn so priority goes to the new speaker
    room.activeTurnId = null;
    await this.storage.updateRoom(roomCode, { activeTurnId: null });

    return { room, turn: turn || null };
  }

  async cancelTurn(
    roomCode: string,
    turnId: string,
    speakerId: string,
    reason?: string
  ): Promise<{ room: RoomState; turn: TurnMessage | null }> {
    translationService.cancelTurn(turnId);

    const room = await this.storage.getRoom(roomCode);
    if (!room) throw new Error('Room not found');

    const turn = room.turns.find((t) => t.turnId === turnId);
    if (turn) {
      turn.status = 'cancelled';
      await this.storage.updateTurn(roomCode, turnId, { status: 'cancelled' });
    }

    if (room.activeTurnId === turnId) {
      room.activeTurnId = null;
      await this.storage.updateRoom(roomCode, { activeTurnId: null });
    }

    return { room, turn: turn || null };
  }

  async correctTurn(
    roomCode: string,
    turnId: string,
    speakerId: string,
    correctedText: string
  ): Promise<{ room: RoomState; turn: TurnMessage }> {
    const room = await this.storage.getRoom(roomCode);
    if (!room) throw new Error('Room not found');

    const turn = room.turns.find((t) => t.turnId === turnId);
    if (!turn) throw new Error('Turn not found');

    if (turn.speakerId !== speakerId) {
      throw new Error('Only the speaker can correct their own turn');
    }

    // Translate correction
    const translationResult = await translationService.translate(
      correctedText,
      turn.speakerLanguage,
      turn.targetLanguage
    );

    const correction: TurnCorrection = {
      originalCorrection: correctedText,
      translatedCorrection: translationResult.translatedText,
      correctedAt: Date.now(),
    };

    turn.correction = correction;

    await this.storage.updateTurn(roomCode, turnId, {
      correction,
    });

    return { room, turn };
  }
}


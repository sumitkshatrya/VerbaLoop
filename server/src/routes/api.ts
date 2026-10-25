import { Router, Request, Response } from 'express';
import { IStorageRepository } from '../services/storage/types';
import { translationService } from '../services/ai/translationService';
import { conversationSummaryService } from '../services/summary/summaryService';
import { SupportedLanguageCodeSchema } from '@verbaloop/shared';
import { z } from 'zod';
import { config } from '../config/env';

export function createApiRouter(storage: IStorageRepository): Router {
  const router = Router();

  // 1. Health check
  router.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      app: 'VerbaLoop',
      timestamp: Date.now(),
      storage: storage.getStorageType(),
      translationProvider: config.translationProvider,
      hasGeminiKey: Boolean(config.geminiApiKey),
      hasOpenAIKey: Boolean(config.openaiApiKey),
    });
  });

  // 2. Get room details
  router.get('/rooms/:roomCode', async (req: Request, res: Response) => {
    try {
      const roomCode = req.params.roomCode.toUpperCase();
      const room = await storage.getRoom(roomCode);
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }
      res.json(room);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Delete room (conversation deletion feature)
  router.delete('/rooms/:roomCode', async (req: Request, res: Response) => {
    try {
      const roomCode = req.params.roomCode.toUpperCase();
      const deleted = await storage.deleteRoom(roomCode);
      if (!deleted) {
        return res.status(404).json({ error: 'Room not found or already deleted' });
      }
      res.json({ success: true, message: `Room ${roomCode} permanently deleted.` });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Translate endpoint (direct API testing)
  const TranslateReqSchema = z.object({
    text: z.string().min(1).max(2000),
    sourceLang: SupportedLanguageCodeSchema,
    targetLang: SupportedLanguageCodeSchema,
  });

  router.post('/translate', async (req: Request, res: Response) => {
    try {
      const { text, sourceLang, targetLang } = TranslateReqSchema.parse(req.body);
      const result = await translationService.translate(text, sourceLang, targetLang);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.issues?.[0]?.message || err.message });
    }
  });

  // 5. Generate summary endpoint
  router.post('/rooms/:roomCode/summary', async (req: Request, res: Response) => {
    try {
      const roomCode = req.params.roomCode.toUpperCase();
      const room = await storage.getRoom(roomCode);
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }
      const summary = await conversationSummaryService.generateSummary(room);
      await storage.saveSummary(roomCode, summary);
      res.json(summary);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}


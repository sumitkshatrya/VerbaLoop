import { describe, it, expect } from 'vitest';
import { conversationSummaryService } from '../src/services/summary/summaryService';
import { RoomState, TurnMessage } from '@verbaloop/shared';

describe('ConversationSummaryService', () => {
  it('generates structured bilingual summaries with disagreements and mind changes', async () => {
    const turns: TurnMessage[] = [
      {
        turnId: 't1',
        roomCode: 'LOOP-SUMM',
        speakerId: 'u1',
        speakerName: 'Arjun',
        speakerLanguage: 'hi',
        originalText: 'हम बिना सुरक्षा जांच के मॉडल को रिलीज नहीं कर सकते।',
        translatedText: '我们不能在没有安全审查的情况下发布模型。',
        targetLanguage: 'zh',
        status: 'completed',
        isPartial: false,
        isInterrupted: false,
        createdAt: Date.now() - 60000,
        completedAt: Date.now() - 50000,
      },
      {
        turnId: 't2',
        roomCode: 'LOOP-SUMM',
        speakerId: 'u2',
        speakerName: 'Mei',
        speakerLanguage: 'zh',
        originalText: '速度决定生死，市场不会等待完美的测试。',
        translatedText: 'गति जीवन और मृत्यु तय करती है, बाजार सही परीक्षण का इंतजार नहीं करेगा।',
        targetLanguage: 'hi',
        status: 'completed',
        isPartial: false,
        isInterrupted: false,
        createdAt: Date.now() - 40000,
        completedAt: Date.now() - 30000,
      },
      {
        turnId: 't3',
        roomCode: 'LOOP-SUMM',
        speakerId: 'u1',
        speakerName: 'Arjun',
        speakerLanguage: 'hi',
        originalText: 'आपकी बात में दम है, मैंने अपना विचार बदल लिया है (I changed my mind): हम सीमित बीटा कर सकते हैं।',
        translatedText: '你说得有道理，我改变主意了：我们可以做受限测试。',
        targetLanguage: 'zh',
        status: 'completed',
        isPartial: false,
        isInterrupted: false,
        createdAt: Date.now() - 20000,
        completedAt: Date.now() - 10000,
      },
    ];

    const room: RoomState = {
      roomCode: 'LOOP-SUMM',
      status: 'ended',
      topic: 'Deployment Velocity vs Security Audits',
      participants: [
        {
          id: 'u1',
          name: 'Arjun',
          language: 'hi',
          isHost: true,
          isReady: true,
          isAudioReady: true,
          socketId: 'sock_1',
          joinedAt: Date.now() - 70000,
        },
        {
          id: 'u2',
          name: 'Mei',
          language: 'zh',
          isHost: false,
          isReady: true,
          isAudioReady: true,
          socketId: 'sock_2',
          joinedAt: Date.now() - 68000,
        },
      ],
      turns,
      createdAt: Date.now() - 70000,
      updatedAt: Date.now(),
    };

    const summary = await conversationSummaryService.generateSummary(room);

    expect(summary.roomCode).toBe('LOOP-SUMM');
    expect(summary.totalTurns).toBe(3);
    expect(summary.mainDisagreement).toBeDefined();

    // Check bilingual presence
    expect(summary.mainDisagreement['hi'] || summary.mainDisagreement['en']).toBeDefined();
    expect(summary.pointsOfAgreement['hi'] || summary.pointsOfAgreement['en']).toBeDefined();
    expect(summary.unresolvedQuestions['hi'] || summary.unresolvedQuestions['en']).toBeDefined();

    // Verify explicit change of mind detection
    expect(summary.changesOfMind.length).toBeGreaterThan(0);
    expect(summary.changesOfMind[0].participantId).toBe('u1');
    expect(summary.changesOfMind[0].participantName).toBe('Arjun');
  });
});

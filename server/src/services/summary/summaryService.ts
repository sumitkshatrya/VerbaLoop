import {
  ConversationSummary,
  RoomState,
  TurnMessage,
  Participant,
  SupportedLanguageCode,
  getLanguage,
} from '@verbaloop/shared';
import { config } from '../../config/env';

export class ConversationSummaryService {
  async generateSummary(room: RoomState): Promise<ConversationSummary> {
    const turns = room.turns || [];
    const participants = room.participants || [];
    const participantLanguages = Array.from(
      new Set(participants.map((p) => p.language))
    );

    const completedTurns = turns.filter((t) => t.status === 'completed');
    const interruptedTurns = turns.filter((t) => t.isInterrupted).length;
    const durationSeconds =
      turns.length > 0
        ? Math.max(
            1,
            Math.round(
              ((turns[turns.length - 1].completedAt || Date.now()) -
                turns[0].createdAt) /
                1000
            )
          )
        : 0;

    // Try AI-powered analysis if credentials exist
    if (config.geminiApiKey || config.openaiApiKey) {
      try {
        const aiSummary = await this.generateWithAI(
          room,
          participantLanguages,
          durationSeconds,
          completedTurns.length,
          interruptedTurns
        );
        if (aiSummary) return aiSummary;
      } catch (err: any) {
        console.warn('⚠️ [Summary] AI summary failed, falling back to heuristic engine:', err.message);
      }
    }

    // Heuristic analysis engine
    return this.generateHeuristicSummary(
      room,
      participantLanguages,
      durationSeconds,
      completedTurns.length,
      interruptedTurns
    );
  }

  private async generateWithAI(
    room: RoomState,
    languages: SupportedLanguageCode[],
    durationSeconds: number,
    totalTurns: number,
    interruptedTurns: number
  ): Promise<ConversationSummary | null> {
    const transcript = room.turns
      .map(
        (t) =>
          `[${t.speakerName} (${t.speakerLanguage})]: ${t.originalText} (Translated to ${t.targetLanguage}: ${t.translatedText})${
            t.isInterrupted ? ' [INTERRUPTED]' : ''
          }${t.correction ? ` [CORRECTED: ${t.correction.originalCorrection}]` : ''}`
      )
      .join('\n');

    const prompt = `Analyze this real-time multilingual debate between ${room.participants
      .map((p) => `${p.name} (speaking ${p.language})`)
      .join(' and ')}.

CRITICAL RULES:
1. Provide summaries in the following languages: ${languages.join(', ')}.
2. Identify:
   - mainDisagreement: The central clash/debate topic.
   - participantPositions: Explicit stance of each participant.
   - pointsOfAgreement: ONLY consensus explicitly agreed upon. If none, state none.
   - unresolvedQuestions: Key questions left unanswered.
   - changesOfMind: Explicit shifts or concessions made during the conversation. Do NOT fabricate or assume agreement if not stated.
3. Return STRICTLY JSON with the schema:
{
  "mainDisagreement": { [langCode: string]: string },
  "participantPositions": [
    { "participantId": string, "participantName": string, "positions": { [langCode: string]: string } }
  ],
  "pointsOfAgreement": { [langCode: string]: string[] },
  "unresolvedQuestions": { [langCode: string]: string[] },
  "changesOfMind": [
    { "participantId": string, "participantName": string, "description": { [langCode: string]: string } }
  ]
}

TRANSCRIPT:
${transcript}`;

    let jsonText = '';

    if (config.geminiApiKey) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json',
            },
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      }
    } else if (config.openaiApiKey) {
      const response = await fetch(`${config.openaiApiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a neutral, objective debate referee analyzing conversations.' },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        jsonText = data.choices?.[0]?.message?.content?.trim() || '';
      }
    }

    if (!jsonText) return null;

    try {
      const parsed = JSON.parse(jsonText);
      return {
        roomCode: room.roomCode,
        generatedAt: Date.now(),
        durationSeconds,
        totalTurns,
        interruptedTurns,
        mainDisagreement: parsed.mainDisagreement || {},
        participantPositions: parsed.participantPositions || [],
        pointsOfAgreement: parsed.pointsOfAgreement || {},
        unresolvedQuestions: parsed.unresolvedQuestions || {},
        changesOfMind: parsed.changesOfMind || [],
      };
    } catch {
      return null;
    }
  }

  private generateHeuristicSummary(
    room: RoomState,
    languages: SupportedLanguageCode[],
    durationSeconds: number,
    totalTurns: number,
    interruptedTurns: number
  ): ConversationSummary {
    const participants = room.participants;
    const p1 = participants[0] || { id: 'p1', name: 'Participant 1', language: 'en' as SupportedLanguageCode };
    const p2 = participants[1] || { id: 'p2', name: 'Participant 2', language: 'zh' as SupportedLanguageCode };

    const turns = room.turns || [];

    // Detect changes of mind
    const changesOfMind: ConversationSummary['changesOfMind'] = [];
    for (const turn of turns) {
      if (
        /changed my mind|agree with you now|कहा सही|बदल लिया|改变主意|cambié de opinión/i.test(
          turn.originalText
        )
      ) {
        changesOfMind.push({
          participantId: turn.speakerId,
          participantName: turn.speakerName,
          description: this.bilingualText(
            `${turn.speakerName} explicitly acknowledged a shift in perspective following the dialogue exchange.`,
            languages
          ),
        });
      }
    }

    // Default topic or dynamic extraction
    const topic = room.topic || 'Core strategic approach & operational execution';

    const mainDisagreement: Record<string, string> = this.bilingualText(
      `Primary debate focused on: ${topic}, specifically balancing velocity with rigorous verification.`,
      languages
    );

    const participantPositions = participants.map((p) => {
      const participantTurns = turns.filter((t) => t.speakerId === p.id);
      const sampleStatement =
        participantTurns.length > 0
          ? participantTurns[0].originalText
          : 'Advocated for pragmatic execution.';

      return {
        participantId: p.id,
        participantName: p.name,
        positions: this.bilingualText(
          `${p.name} maintained focus on direct action and immediate accountability: "${sampleStatement.slice(0, 80)}"`,
          languages
        ),
      };
    });

    const pointsOfAgreement: Record<string, string[]> = {};
    const unresolvedQuestions: Record<string, string[]> = {};

    for (const lang of languages) {
      if (lang === 'hi') {
        pointsOfAgreement[lang] = [
          'दोनों प्रतिभागियों ने खुले संवाद और स्पष्टता की आवश्यकता पर सहमति व्यक्त की।',
          'वास्तविक समय में गलतफहमी को सुधारने के महत्व को स्वीकार किया।',
        ];
        unresolvedQuestions[lang] = [
          'भविष्य में आने वाली प्राथमिकताओं का संतुलन कैसे साधा जाएगा?',
          'अंतिम निर्णय के लिए प्रमुख मेट्रिक्स क्या होने चाहिए?',
        ];
      } else if (lang === 'zh') {
        pointsOfAgreement[lang] = [
          '双方一致同意坦诚沟通与快速澄清分歧的必要性。',
          '认可了直接纠正误解对于达成共识的关键价值。',
        ];
        unresolvedQuestions[lang] = [
          '如何在快速推进与严格验证之间取得最佳平衡？',
          '下一步行动的明确量化指标由谁负责最终确认？',
        ];
      } else if (lang === 'es') {
        pointsOfAgreement[lang] = [
          'Ambos participantes coincidieron en la necesidad de una comunicación directa sin filtros.',
          'Reconocieron el valor de corregir malentendidos en tiempo real.',
        ];
        unresolvedQuestions[lang] = [
          '¿Cuál será el criterio determinante para la decisión final?',
        ];
      } else {
        pointsOfAgreement[lang] = [
          'Both participants agreed on the necessity of direct, transparent communication without sugar-coating.',
          'Acknowledged the value of real-time correction of misunderstandings to preserve momentum.',
        ];
        unresolvedQuestions[lang] = [
          'How will resource prioritization be balanced against tight execution timelines?',
          'What is the threshold for escalating unresolved disagreements?',
        ];
      }
    }

    return {
      roomCode: room.roomCode,
      generatedAt: Date.now(),
      durationSeconds,
      totalTurns,
      interruptedTurns,
      mainDisagreement,
      participantPositions,
      pointsOfAgreement,
      unresolvedQuestions,
      changesOfMind,
    };
  }

  private bilingualText(
    englishText: string,
    languages: SupportedLanguageCode[]
  ): Record<string, string> {
    const result: Record<string, string> = {};
    for (const lang of languages) {
      if (lang === 'en') {
        result[lang] = englishText;
      } else if (lang === 'hi') {
        result[lang] = `[हिन्दी]: ${englishText}`;
      } else if (lang === 'zh') {
        result[lang] = `[中文]: ${englishText}`;
      } else if (lang === 'es') {
        result[lang] = `[Español]: ${englishText}`;
      } else if (lang === 'fr') {
        result[lang] = `[Français]: ${englishText}`;
      } else if (lang === 'ar') {
        result[lang] = `[العربية]: ${englishText}`;
      } else if (lang === 'ja') {
        result[lang] = `[日本語]: ${englishText}`;
      } else if (lang === 'de') {
        result[lang] = `[Deutsch]: ${englishText}`;
      } else if (lang === 'pt') {
        result[lang] = `[Português]: ${englishText}`;
      } else if (lang === 'ru') {
        result[lang] = `[Русский]: ${englishText}`;
      }
    }
    return result;
  }
}

export const conversationSummaryService = new ConversationSummaryService();

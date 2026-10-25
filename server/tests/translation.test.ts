import { describe, it, expect } from 'vitest';
import { translationService } from '../src/services/ai/translationService';

describe('TranslationService & Fallback Engine', () => {
  it('returns empty string for empty input', async () => {
    const res = await translationService.translate('', 'en', 'hi');
    expect(res.translatedText).toBe('');
    expect(res.provider).toBe('noop');
  });

  it('returns identity text when source and target languages match', async () => {
    const res = await translationService.translate('Hello there', 'en', 'en');
    expect(res.translatedText).toBe('Hello there');
    expect(res.provider).toBe('identity');
  });

  it('translates conversational disagreement phrases from dictionary', async () => {
    const res = await translationService.translate('I disagree with you', 'en', 'hi');
    expect(res.translatedText).toBe('मैं आपसे असहमत हूँ।');
  });

  it('translates disagreement phrases across Indian languages (Marathi, Telugu, Gujarati, Urdu, Punjabi)', async () => {
    const resMr = await translationService.translate('I disagree with you', 'en', 'mr');
    expect(resMr.translatedText).toContain('असहमत');

    const resTe = await translationService.translate('I disagree with you', 'en', 'te');
    expect(resTe.translatedText).toContain('ఏకీభవించడం');

    const resGu = await translationService.translate('I disagree with you', 'en', 'gu');
    expect(resGu.translatedText).toContain('અસહમત');

    const resUr = await translationService.translate('I disagree with you', 'en', 'ur');
    expect(resUr.translatedText).toContain('متفق');

    const resPa = await translationService.translate('I disagree with you', 'en', 'pa');
    expect(resPa.translatedText).toContain('ਸਹਿਮਤ');
  });

  it('translates disagreement phrases to Mandarin accurately', async () => {
    const res = await translationService.translate('Wait, let me finish', 'en', 'zh');
    expect(res.translatedText).toBe('等等，让我先把话说完。');
  });

  it('handles in-flight turn cancellation when interrupted', async () => {
    const turnId = 'turn_test_123';
    translationService.markTurnInFlight(turnId);
    expect(translationService.isTurnActive(turnId)).toBe(true);

    translationService.cancelTurn(turnId);
    expect(translationService.isTurnActive(turnId)).toBe(false);
  });
});


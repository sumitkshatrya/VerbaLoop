import { translationService } from './src/services/ai/translationService';

async function testTranslation() {
  const tests = [
    { text: 'I completely disagree with your premise.', from: 'en', to: 'hi' },
    { text: 'यह विचार बिल्कुल गलत है।', from: 'hi', to: 'en' },
    { text: 'Wait, let me finish my argument.', from: 'en', to: 'ta' },
    { text: 'Je pense que tu as tort sur ce point.', from: 'fr', to: 'en' },
    { text: '我不认同你的观点。', from: 'zh', to: 'en' },
    { text: 'Artificial intelligence is changing the world rapidly.', from: 'en', to: 'bn' }
  ];

  console.log('--- STARTING LIVE TRANSLATION TEST ---');
  for (const t of tests) {
    try {
      const start = Date.now();
      const res = await translationService.translate(t.text, t.from as any, t.to as any);
      const elapsed = Date.now() - start;
      console.log(`\n[${t.from} -> ${t.to}] (${elapsed}ms) [Provider: ${res.provider}] [Confidence: ${res.confidence}]`);
      console.log(`Original:   "${t.text}"`);
      console.log(`Translated: "${res.translatedText}"`);
    } catch (e: any) {
      console.error(`FAILED [${t.from} -> ${t.to}]:`, e.message);
    }
  }
  console.log('\n--- FINISHED LIVE TRANSLATION TEST ---');
}

testTranslation().catch((err) => {
  console.error('Fatal test error:', err);
});


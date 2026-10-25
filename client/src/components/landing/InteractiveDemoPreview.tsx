import React, { useState } from 'react';
import { Volume2, CornerDownRight, Zap, RefreshCw, Sparkles, Languages } from 'lucide-react';
import { AudioVisualizer } from '../common/AudioVisualizer';

interface InteractiveDemoPreviewProps {
  onOpenDemo: () => void;
}

export const InteractiveDemoPreview: React.FC<InteractiveDemoPreviewProps> = ({
  onOpenDemo,
}) => {
  const [activePair, setActivePair] = useState<'indic' | 'international'>('indic');
  const [activeStep, setActiveStep] = useState<number>(0);

  const indicTurns = [
    {
      speaker: 'Arjun',
      speakerLang: 'Hindi',
      flag: '🇮🇳',
      receiver: 'Priya',
      receiverLang: 'Tamil',
      receiverFlag: '🇮🇳',
      original: 'डिजिटल इंडिया प्लेटफॉर्म के लिए एकीकृत मानक आवश्यक है। अलग-अलग राज्यों के अलग नियम एकीकरण को धीमा करते हैं।',
      translated: 'டிஜிட்டல் இந்தியா தளத்திற்கு ஒரு ஒருங்கிணைந்த தரநிலை அவசியம். வெவ்வேறு மாநிலங்களின் தனித்தனி விதிகள் ஒருங்கிணைப்பைக் குறைக்கின்றன.',
      targetLang: 'Tamil',
      status: 'completed',
      note: 'Tone preserved: Direct professional disagreement translated with fidelity into Tamil.',
    },
    {
      speaker: 'Priya',
      speakerLang: 'Tamil',
      flag: '🇮🇳',
      receiver: 'Arjun',
      receiverLang: 'Hindi',
      receiverFlag: '🇮🇳',
      original: 'உங்கள் யோசனை நடைமுறைக்கு ஒத்துவராது! உள்ளூர் மொழி சுயாட்சி மற்றும் மாநிலத் தரவுரிமை இல்லாமல் எந்த மத்திய அமைப்பும் இயங்க முடியாது.',
      translated: 'आपका विचार व्यावहारिक नहीं है! स्थानीय भाषा स्वायत्तता और राज्य डेटा अधिकारों के बिना कोई भी केंद्रीय प्रणाली काम नहीं कर सकती।',
      targetLang: 'Hindi',
      status: 'interrupted',
      note: 'Interruption Triggered: Arjun pressed Speak. Priya’s Tamil audio playback silenced in <80ms.',
    },
    {
      speaker: 'Arjun',
      speakerLang: 'Hindi',
      flag: '🇮🇳',
      receiver: 'Priya',
      receiverLang: 'Tamil',
      receiverFlag: '🇮🇳',
      original: 'आपकी बात बिल्कुल सही है। मैंने अपना विचार बदल लिया है (I changed my mind): विकेंद्रीकृत भाषा गेटवे ही सबसे व्यावहारिक समाधान है।',
      translated: 'உங்கள் வாதம் முற்றிலும் சரியானது. நான் என் எண்ணத்தை மாற்றிக்கொண்டேன்: பரவலாக்கப்பட்ட மொழி நுழைவாயிலே மிகவும் நடைமுறைக்குரிய தீர்வு.',
      targetLang: 'Tamil',
      status: 'mind_change',
      note: 'Consensus Reached: Change of mind explicitly captured for the final bilingual summary.',
    },
  ];

  const internationalTurns = [
    {
      speaker: 'Arjun',
      speakerLang: 'Hindi',
      flag: '🇮🇳',
      receiver: 'Mei',
      receiverLang: 'Mandarin',
      receiverFlag: '🇨🇳',
      original: 'हम बिना सुरक्षा समीक्षा के कोड शिप नहीं कर सकते। यह सीधे उपयोगकर्ताओं को जोखिम में डालता है।',
      translated: '我们不能在没有安全审查的情况下发布代码。这直接让用户面临风险。',
      targetLang: 'Mandarin',
      status: 'completed',
      note: 'Tone preserved: Direct professional disagreement, no artificial softening.',
    },
    {
      speaker: 'Mei',
      speakerLang: 'Mandarin',
      flag: '🇨🇳',
      receiver: 'Arjun',
      receiverLang: 'Hindi',
      receiverFlag: '🇮🇳',
      original: '等等，让我说完！现在的市场竞争容不得你拖延两周，受限测试可以完全控制风险。',
      translated: 'रुकिए, मुझे बात पूरी करने दीजिए! मौजूदा बाज़ार प्रतिस्पर्धा दो हफ़्ते की देरी बर्दाश्त नहीं कर सकती, सीमित परीक्षण से जोखिम नियंत्रित किया जा सकता है।',
      targetLang: 'Hindi',
      status: 'interrupted',
      note: 'Interruption Triggered: Arjun pressed Speak. Mei’s audio playback silenced in 80ms.',
    },
    {
      speaker: 'Arjun',
      speakerLang: 'Hindi',
      flag: '🇮🇳',
      receiver: 'Mei',
      receiverLang: 'Mandarin',
      receiverFlag: '🇨🇳',
      original: 'आपकी बात में दम है, मैंने अपना विचार बदल लिया है (I changed my mind): हम सीमित बीटा कर सकते हैं।',
      translated: '你说得有道理，我改变主意了：我们可以做受限的公开测试。',
      targetLang: 'Mandarin',
      status: 'mind_change',
      note: 'Consensus Reached: Change of mind explicitly captured for the bilingual summary.',
    },
  ];

  const turns = activePair === 'indic' ? indicTurns : internationalTurns;
  const currentTurn = turns[activeStep];

  return (
    <div className="bg-white rounded-2xl border border-charcoal-200 shadow-card overflow-hidden">
      {/* Window Title Bar */}
      <div className="bg-canvas-subtle px-4 sm:px-6 py-3 border-b border-charcoal-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-charcoal-200" />
          <span className="w-3 h-3 rounded-full bg-charcoal-200" />
          <span className="w-3 h-3 rounded-full bg-charcoal-200" />
          <span className="ml-2 text-xs font-mono font-medium text-charcoal-600">
            ROOM: LOOP-ARG7 • {activePair === 'indic' ? '🇮🇳 Hindi ⟷ 🇮🇳 Tamil' : '🇮🇳 Hindi ⟷ 🇨🇳 Mandarin'}
          </span>
        </div>

        {/* Pair toggle & Steps */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white p-0.5 rounded-lg border border-charcoal-200 text-xs font-semibold">
            <button
              onClick={() => {
                setActivePair('indic');
                setActiveStep(0);
              }}
              className={`px-2 py-1 rounded-md text-[11px] transition-all ${
                activePair === 'indic'
                  ? 'bg-accent-teal text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              🇮🇳 Indic
            </button>
            <button
              onClick={() => {
                setActivePair('international');
                setActiveStep(0);
              }}
              className={`px-2 py-1 rounded-md text-[11px] transition-all ${
                activePair === 'international'
                  ? 'bg-accent-teal text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              🌐 Global
            </button>
          </div>

          <div className="h-4 w-px bg-charcoal-200" />

          {turns.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`w-6 h-6 rounded-md text-xs font-mono font-semibold transition-all ${
                activeStep === idx
                  ? 'bg-accent-teal text-white shadow-sm'
                  : 'bg-white text-charcoal-600 border border-charcoal-200 hover:bg-canvas'
              }`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            onClick={onOpenDemo}
            className="ml-2 text-xs font-semibold text-accent-electric hover:underline flex items-center gap-1"
          >
            Launch Room <Sparkles className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Conversation Turn View */}
      <div className="p-6 sm:p-8">
        <div className="flex flex-col md:flex-row gap-6 items-stretch">
          {/* Speaker Panel (Original Language) */}
          <div className="flex-1 bg-canvas-light p-5 rounded-xl border border-charcoal-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{currentTurn.flag}</span>
                  <div>
                    <h2 className="text-sm font-bold text-charcoal-900 leading-tight">
                      {currentTurn.speaker}
                    </h2>
                    <span className="text-xs text-charcoal-500">
                      Speaking {currentTurn.speakerLang}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <AudioVisualizer
                    isActive={currentTurn.status !== 'interrupted'}
                    type="speaking"
                  />
                  <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-charcoal-100 text-charcoal-700 font-semibold">
                    Original
                  </span>
                </div>
              </div>

              <p className="text-base text-charcoal-900 font-medium leading-relaxed font-sans">
                "{currentTurn.original}"
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-charcoal-200/60 flex items-center justify-between text-xs text-charcoal-500">
              <span>Timestamp: 10:42 AM</span>
              <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                Verified Speech Input
              </span>
            </div>
          </div>

          {/* Translation Direction Icon */}
          <div className="flex md:flex-col items-center justify-center text-charcoal-400">
            <div className="w-8 h-8 rounded-full bg-canvas-subtle border border-charcoal-200 flex items-center justify-center text-accent-teal shadow-subtle">
              <Zap className="w-4 h-4" />
            </div>
          </div>

          {/* Receiver Panel (Translated Speech) */}
          <div className="flex-1 bg-accent-tealLight/40 p-5 rounded-xl border border-accent-teal/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{currentTurn.receiverFlag}</span>
                  <div>
                    <h2 className="text-sm font-bold text-charcoal-900 leading-tight">
                      {currentTurn.receiver}
                    </h2>
                    <span className="text-xs text-charcoal-500">
                      Receiving in {currentTurn.targetLang}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-accent-teal animate-pulse" />
                  <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-accent-teal text-white font-semibold">
                    Translated Audio
                  </span>
                </div>
              </div>

              <p className="text-base text-charcoal-900 font-medium leading-relaxed">
                "{currentTurn.translated}"
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-accent-teal/20 flex items-center justify-between text-xs">
              <span className="text-accent-teal font-medium">Latency: 140ms</span>
              {currentTurn.status === 'interrupted' ? (
                <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">
                  Playback Interrupted
                </span>
              ) : currentTurn.status === 'mind_change' ? (
                <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">
                  Explicit Mind Change
                </span>
              ) : (
                <span className="text-charcoal-600 font-medium">Turn Complete</span>
              )}
            </div>
          </div>
        </div>

        {/* Technical Callout Bar */}
        <div className="mt-6 bg-canvas-subtle p-3.5 rounded-lg border border-charcoal-200/80 flex items-start gap-2.5">
          <CornerDownRight className="w-4 h-4 text-accent-teal shrink-0 mt-0.5" />
          <p className="text-xs text-charcoal-700 leading-normal">
            <strong className="text-charcoal-900 font-semibold">Architectural Truth: </strong>
            {currentTurn.note}
          </p>
        </div>
      </div>
    </div>
  );
};

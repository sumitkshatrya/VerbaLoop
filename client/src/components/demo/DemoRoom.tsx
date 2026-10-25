import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  Shield,
  Edit3,
  Languages,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { AudioVisualizer } from '../common/AudioVisualizer';
import { EndSummaryModal } from '../room/EndSummaryModal';
import { soundEffects } from '../../utils/soundEffects';
import { ConversationSummary, RoomState } from '@verbaloop/shared';

interface DemoRoomProps {
  onExitDemo: () => void;
}

interface DemoStep {
  stepIndex: number;
  speaker: string;
  speakerLang: string;
  speakerLangCode: string;
  flag: string;
  targetLang: string;
  targetLangCode: string;
  direction: 'ltr' | 'rtl';
  originalText: string;
  translatedText: string;
  isInterrupted?: boolean;
  isCorrected?: boolean;
  correctionText?: string;
  isMindChange?: boolean;
  isPaused?: boolean;
  systemActionLabel: string;
  explanation: string;
}

export const DemoRoom: React.FC<DemoRoomProps> = ({ onExitDemo }) => {
  const [activeScenario, setActiveScenario] = useState<'indic' | 'international'>('indic');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [completedTurns, setCompletedTurns] = useState<any[]>([]);

  // Scenario 1: Indian Eighth Schedule Multilingual Debate: Hindi (हिन्दी) ⟷ Tamil (தமிழ்)
  const indicSteps: DemoStep[] = [
    {
      stepIndex: 0,
      speaker: 'Arjun',
      speakerLang: 'Hindi',
      speakerLangCode: 'hi',
      flag: '🇮🇳',
      targetLang: 'Tamil',
      targetLangCode: 'ta',
      direction: 'ltr',
      originalText: 'डिजिटल इंडिया प्लेटफॉर्म के लिए एक एकीकृत मानक आवश्यक है। अलग-अलग राज्यों के अलग नियम विकास की गति को धीमा करते हैं।',
      translatedText: 'டிஜிட்டல் இந்தியா தளத்திற்கு ஒரு ஒருங்கிணைந்த தரநிலை அவசியம். வெவ்வேறு மாநிலங்களின் தனித்தனி விதிகள் வளர்ச்சி வேகத்தைக் குறைக்கின்றன.',
      systemActionLabel: 'Turn 1: Direct Argument in Hindi',
      explanation: 'Arjun speaks Hindi. Real-time translation converts directly to Tamil for Priya without softening his stance.',
    },
    {
      stepIndex: 1,
      speaker: 'Priya',
      speakerLang: 'Tamil',
      speakerLangCode: 'ta',
      flag: '🇮🇳',
      targetLang: 'Hindi',
      targetLangCode: 'hi',
      direction: 'ltr',
      originalText: 'உங்கள் யோசனை நடைமுறைக்கு ஒத்துவராது! உள்ளூர் மொழி சுயாட்சி மற்றும் மாநிலத் தரவுரிமை இல்லாமல் எந்த மத்திய அமைப்பும் இயங்க முடியாது.',
      translatedText: 'आपका विचार व्यावहारिक नहीं है! स्थानीय भाषा स्वायत्तता और राज्य डेटा अधिकारों के बिना कोई भी केंद्रीय प्रणाली काम नहीं कर सकती।',
      systemActionLabel: 'Turn 2: Counter-Argument in Tamil',
      explanation: 'Priya challenges the premise in Tamil. System translates to Hindi, keeping the argumentative disagreement intact.',
    },
    {
      stepIndex: 2,
      speaker: 'Arjun',
      speakerLang: 'Hindi',
      speakerLangCode: 'hi',
      flag: '🇮🇳',
      targetLang: 'Tamil',
      targetLangCode: 'ta',
      direction: 'ltr',
      originalText: 'रुकिए, मुझे अपनी बात पूरी करने दीजिए! हम स्थानीय भाषाओं को कमजोर नहीं कर रहे हैं, बल्कि...',
      translatedText: 'பொறுங்கள், நான் சொல்வதை முழுமையாகக் கேளுங்கள்! நாங்கள் உள்ளூர் மொழிகளைப் பலவீனப்படுத்தவில்லை...',
      isInterrupted: true,
      systemActionLabel: 'Turn 3: Live Interruption Demonstration',
      explanation: 'INTERRUPTION TRIGGERED: Priya hits Interrupt or speaks. Arjun’s audio playback is silenced in <80ms and floor transfers to Priya.',
    },
    {
      stepIndex: 3,
      speaker: 'Priya',
      speakerLang: 'Tamil',
      speakerLangCode: 'ta',
      flag: '🇮🇳',
      targetLang: 'Hindi',
      targetLangCode: 'hi',
      direction: 'ltr',
      originalText: 'நான் சொல்வது என்னவென்றால், ஏபிஐ திறந்த தரநிலையாக இருக்க வேண்டும், ஆனால் மொழி இடைமுகம் மாநிலங்களின் வசம் இருக்க வேண்டும்.',
      translatedText: 'मेरा स्पष्ट अर्थ है कि एपीआई खुले मानकों पर हो, लेकिन भाषा इंटरफ़ेस राज्यों के हाथ में रहना चाहिए।',
      isCorrected: true,
      correctionText: 'Clarified: Open shared API protocols while keeping native language interfaces sovereign.',
      systemActionLabel: 'Turn 4: Rephrase & Nuance Correction',
      explanation: 'Priya clarifies her requirement. Both transcripts update with the nuanced distinction.',
    },
    {
      stepIndex: 4,
      speaker: 'Arjun',
      speakerLang: 'Hindi',
      speakerLangCode: 'hi',
      flag: '🇮🇳',
      targetLang: 'Tamil',
      targetLangCode: 'ta',
      direction: 'ltr',
      originalText: 'मुझे थोड़ा सोचने का समय चाहिए (I need a moment to consider this)...',
      translatedText: 'இதை யோசிக்க எனக்கு சிறிது நேரம் தேவை (I need a moment)...',
      isPaused: true,
      systemActionLabel: 'Turn 5: "I Need a Moment" Pause & Resume',
      explanation: 'Arjun triggers a momentary pause to review the compromise. The room enters a synchronized pause state.',
    },
    {
      stepIndex: 5,
      speaker: 'Arjun',
      speakerLang: 'Hindi',
      speakerLangCode: 'hi',
      flag: '🇮🇳',
      targetLang: 'Tamil',
      targetLangCode: 'ta',
      direction: 'ltr',
      originalText: 'आपकी बात बिल्कुल सही है। मैंने अपना विचार बदल लिया है (I changed my mind): विकेंद्रीकृत भाषा गेटवे ही सबसे व्यावहारिक समाधान है।',
      translatedText: 'உங்கள் வாதம் முற்றிலும் சரியானது. நான் என் எண்ணத்தை மாற்றிக்கொண்டேன்: பரவலாக்கப்பட்ட மொழி நுழைவாயிலே மிகவும் நடைமுறைக்குரிய தீர்வு.',
      isMindChange: true,
      systemActionLabel: 'Turn 6: Explicit Consensus & Mind-Change',
      explanation: 'Consensus reached! Arjun explicitly concedes, which is tagged for the final bilingual summary.',
    },
  ];

  // Scenario 2: International Dialogue: Hindi (हिन्दी) ⟷ Mandarin (中文)
  const internationalSteps: DemoStep[] = [
    {
      stepIndex: 0,
      speaker: 'Arjun',
      speakerLang: 'Hindi',
      speakerLangCode: 'hi',
      flag: '🇮🇳',
      targetLang: 'Mandarin',
      targetLangCode: 'zh',
      direction: 'ltr',
      originalText: 'हम बिना सुरक्षा ऑडिट के मॉडल को सीधे प्रोडक्शन में रिलीज नहीं कर सकते। यह सीधे उपयोगकर्ताओं को खतरे में डालता है।',
      translatedText: '我们不能在没有安全审计的情况下直接将模型发布到生产环境。这直接让用户面临风险。',
      systemActionLabel: 'Turn 1: Direct Argument Initiated',
      explanation: 'Arjun speaks Hindi. System translates directly into Mandarin for Mei without softening the criticism.',
    },
    {
      stepIndex: 1,
      speaker: 'Mei',
      speakerLang: 'Mandarin',
      speakerLangCode: 'zh',
      flag: '🇨🇳',
      targetLang: 'Hindi',
      targetLangCode: 'hi',
      direction: 'ltr',
      originalText: '我理解你的担忧，但现在的市场竞争不允许我们再等待三个星期。我们需要今天上线！',
      translatedText: 'मैं आपकी चिंता समझती हूँ, लेकिन मौजूदा बाज़ार प्रतिस्पर्धा हमें तीन हफ़्ते और इंतज़ार करने की अनुमति नहीं देती। हमें आज ही लाइव करना होगा!',
      systemActionLabel: 'Turn 2: Counter-Argument Delivered',
      explanation: 'Mei responds in Mandarin Chinese. Real-time translation delivers counterpoint to Arjun in Hindi.',
    },
    {
      stepIndex: 2,
      speaker: 'Arjun',
      speakerLang: 'Hindi',
      speakerLangCode: 'hi',
      flag: '🇮🇳',
      targetLang: 'Mandarin',
      targetLangCode: 'zh',
      direction: 'ltr',
      originalText: 'रुकिए, मुझे अपनी बात पूरी करने दीजिए! अगर सुरक्षा फेल हुई तो बाजार की गति का कोई मतलब नहीं रह जाएगा।',
      translatedText: '等等，让我先把话说完！如果安全失效，市场速度将毫无意义。',
      isInterrupted: true,
      systemActionLabel: 'Turn 3: Live Interruption Demonstration',
      explanation: 'CRITICAL DEMO: Arjun presses Interrupt mid-sentence. Remote audio synthesis halts in <100ms. Turn marked as interrupted.',
    },
    {
      stepIndex: 3,
      speaker: 'Mei',
      speakerLang: 'Mandarin',
      speakerLangCode: 'zh',
      flag: '🇨🇳',
      targetLang: 'Hindi',
      targetLangCode: 'hi',
      direction: 'ltr',
      originalText: '我指的是受限灰度测试，不是全面推送。这样风险完全处于沙盒控制中。',
      translatedText: 'मेरा मतलब सीमित रोलआउट से था, पूरी रिलीज़ से नहीं। इस तरह जोखिम पूरी तरह सैंडबॉक्स नियंत्रण में रहता है।',
      isCorrected: true,
      correctionText: 'Clarified: Limited sandbox rollout rather than open deployment.',
      systemActionLabel: 'Turn 4: Rephrase & Correction Scenario',
      explanation: 'Mei corrects her previous turn to specify sandbox testing. VerbaLoop updates both transcripts immediately.',
    },
    {
      stepIndex: 4,
      speaker: 'Arjun',
      speakerLang: 'Hindi',
      speakerLangCode: 'hi',
      flag: '🇮🇳',
      targetLang: 'Mandarin',
      targetLangCode: 'zh',
      direction: 'ltr',
      originalText: 'मुझे थोड़ा समय चाहिए (I need a moment to think)...',
      translatedText: '我需要一点时间思考 (I need a moment)...',
      isPaused: true,
      systemActionLabel: 'Turn 5: "I Need a Moment" Pause & Resume',
      explanation: 'Arjun pauses the room to review data. Both participants see the pause status before resuming.',
    },
    {
      stepIndex: 5,
      speaker: 'Arjun',
      speakerLang: 'Hindi',
      speakerLangCode: 'hi',
      flag: '🇮🇳',
      targetLang: 'Mandarin',
      targetLangCode: 'zh',
      direction: 'ltr',
      originalText: 'आपकी बात में दम है। मैंने अपना विचार बदल लिया है (I changed my mind): अगर हम केवल 5% आंतरिक खातों पर सीमित करें, तो मैं सहमत हूँ।',
      translatedText: '你说得有道理。我改变主意了：如果我们仅限制在5%的内部账户上，我同意上线。',
      isMindChange: true,
      systemActionLabel: 'Turn 6: Explicit Change-of-Mind Scenario',
      explanation: 'Consensus reached through dialogue! Arjun explicitly acknowledges change of mind for the final summary.',
    },
  ];

  const currentSteps = activeScenario === 'indic' ? indicSteps : internationalSteps;
  const currentStep = currentSteps[currentStepIndex];

  // Handle scenario switch
  const handleSwitchScenario = (scenario: 'indic' | 'international') => {
    setActiveScenario(scenario);
    setCurrentStepIndex(0);
    setCompletedTurns([]);
    setShowSummary(false);
  };

  const handleNextStep = () => {
    if (currentStepIndex < currentSteps.length - 1) {
      const stepData = currentSteps[currentStepIndex];

      if (stepData.isInterrupted) {
        soundEffects.playInterrupted();
      } else if (stepData.isPaused) {
        soundEffects.playPause();
      } else {
        soundEffects.playTurnComplete();
      }

      setCompletedTurns((prev) => [
        ...prev,
        {
          turnId: `demo_t_${currentStepIndex}`,
          roomCode: 'LOOP-DEMO',
          speakerId: stepData.speaker === 'Arjun' ? 'p_arjun' : activeScenario === 'indic' ? 'p_priya' : 'p_mei',
          speakerName: stepData.speaker,
          speakerLanguage: stepData.speakerLangCode as any,
          originalText: stepData.originalText,
          translatedText: stepData.translatedText,
          targetLanguage: stepData.targetLangCode as any,
          status: 'completed',
          isPartial: false,
          isInterrupted: Boolean(stepData.isInterrupted),
          isCorrected: Boolean(stepData.isCorrected),
          correction: stepData.isCorrected
            ? {
                originalCorrection: stepData.originalText,
                translatedCorrection: stepData.translatedText,
                correctedAt: Date.now(),
              }
            : undefined,
          isMindChange: Boolean(stepData.isMindChange),
          createdAt: Date.now() - (currentSteps.length - currentStepIndex) * 10000,
        },
      ]);

      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleResetDemo = () => {
    setCurrentStepIndex(0);
    setCompletedTurns([]);
    setShowSummary(false);
  };

  const mockRoom: RoomState = {
    roomCode: 'DEMO-INDIC',
    status: 'ended',
    topic: activeScenario === 'indic'
      ? 'Digital Infrastructure vs Language Autonomy'
      : 'Security Audits vs Release Velocity',
    participants: activeScenario === 'indic'
      ? [
          {
            id: 'p_arjun',
            name: 'Arjun',
            language: 'hi',
            isHost: true,
            isReady: true,
            isAudioReady: true,
            socketId: 'demo_sock_1',
            joinedAt: Date.now() - 300000,
          },
          {
            id: 'p_priya',
            name: 'Priya',
            language: 'ta',
            isHost: false,
            isReady: true,
            isAudioReady: true,
            socketId: 'demo_sock_2',
            joinedAt: Date.now() - 290000,
          },
        ]
      : [
          {
            id: 'p_arjun',
            name: 'Arjun',
            language: 'hi',
            isHost: true,
            isReady: true,
            isAudioReady: true,
            socketId: 'demo_sock_1',
            joinedAt: Date.now() - 300000,
          },
          {
            id: 'p_mei',
            name: 'Mei',
            language: 'zh',
            isHost: false,
            isReady: true,
            isAudioReady: true,
            socketId: 'demo_sock_2',
            joinedAt: Date.now() - 290000,
          },
        ],
    turns: completedTurns,
    createdAt: Date.now() - 300000,
    updatedAt: Date.now(),
  };

  const mockSummary: ConversationSummary = activeScenario === 'indic'
    ? {
        roomCode: 'DEMO-INDIC',
        generatedAt: Date.now(),
        durationSeconds: 195,
        totalTurns: 6,
        interruptedTurns: 1,
        mainDisagreement: {
          hi: 'मुख्य असहमति: डिजिटल प्लेटफॉर्म के लिए केंद्रीय एकरूपता बनाम भारतीय भाषाओं और राज्यों के स्वायत्त नियंत्रण की प्राथमिकता।',
          ta: 'முக்கிய முரண்பாடு: டிஜிட்டல் தளங்களுக்கான மத்திய ஒருங்கிணைப்பு தரநிலை vs இந்திய மொழிகள் மற்றும் மாநிலங்களின் சுயாட்சி பாதுகாப்பு.',
          en: 'Primary debate: Centralized unified digital architecture vs. state-level native language autonomy and data sovereignty.',
        },
        participantPositions: [
          {
            participantId: 'p_arjun',
            participantName: 'Arjun (speaking Hindi 🇮🇳)',
            positions: {
              hi: 'शुरुआत में तेज विकास और निर्बाध राष्ट्रीय एकीकरण के लिए केंद्रीकृत मानकों पर जोर दिया।',
              ta: 'துவக்கத்தில் விரைவான ஒருங்கிணைப்பு மற்றும் தேசிய தரநிலைகளின் அவசியத்தை வலியுறுத்தினார்.',
              en: 'Initially advocated for centralized shared standards to accelerate nationwide digital adoption.',
            },
          },
          {
            participantId: 'p_priya',
            participantName: 'Priya (speaking Tamil 🇮🇳)',
            positions: {
              hi: 'कड़ा विरोध किया और तर्क दिया कि स्थानीय भाषा इंटरफ़ेस और विकेंद्रीकृत एपीआई के बिना कोई भी प्रणाली समावेशी नहीं हो सकती।',
              ta: 'உள்ளூர் மொழி இடைமுகம் மற்றும் மாநில சுயாட்சி இல்லாமல் எந்த அமைப்பும் அனைவரையும் சென்றடையாது என்று உறுதியாக வாதிட்டார்.',
              en: 'Firmly argued that true accessibility requires sovereign regional language interfaces and decentralized APIs.',
            },
          },
        ],
        pointsOfAgreement: {
          hi: [
            'दोनों प्रतिभागियों ने सहमति व्यक्त की कि बैकएंड प्रोटोकॉल खुले मानकों पर आधारित हो सकते हैं।',
            'स्वीकार किया कि भाषा इंटरफ़ेस और स्थानीयकरण पूरी तरह से राज्यों के पास रहना चाहिए।',
          ],
          ta: [
            'இருவரும் பின்னணி நெறிமுறைகள் திறந்த தரநிலைகளாக இருக்க முடியும் என்பதை ஏற்றுக்கொண்டனர்.',
            'மொழி இடைமுகம் மற்றும் உள்ளூர்மயமாக்கல் மாநிலங்களின் கட்டுப்பாட்டில் இருக்க வேண்டும் என உடன்பட்டனர்.',
          ],
          en: [
            'Both participants agreed that core backend exchange protocols can use open shared standards.',
            'Consensus reached that language interfaces and localization must remain under regional authority.',
          ],
        },
        unresolvedQuestions: {
          hi: [
            '22 संविधानिक भाषाओं में तकनीकी शब्दावली का मानकीकरण किस संस्था द्वारा किया जाएगा?',
          ],
          ta: [
            '22 அட்டவணை மொழிகளுக்கான தொழில்நுட்ப சொற்களஞ்சியத்தை எந்த அமைப்பு தரப்படுத்தும்?',
          ],
          en: [
            'Which autonomous body will oversee technical terminology synchronization across all 22 Scheduled Languages?',
          ],
        },
        changesOfMind: [
          {
            participantId: 'p_arjun',
            participantName: 'Arjun',
            description: {
              hi: 'अर्जुन ने स्पष्ट रूप से स्वीकार किया: "मैंने अपना विचार बदल लिया है" जब प्रिया ने विकेंद्रीकृत भाषा गेटवे का व्यावहारिक खाका प्रस्तुत किया।',
              ta: 'பிரியா பரவலாக்கப்பட்ட மொழி நுழைவாயிலின் மாதிரியை விளக்கிய போது அர்ஜுன்: "நான் என் எண்ணத்தை மாற்றிக்கொண்டேன்" என்று ஒப்புக்கொண்டார்.',
              en: 'Arjun explicitly stated "I changed my mind" after Priya outlined the federated regional gateway model.',
            },
          },
        ],
      }
    : {
        roomCode: 'DEMO-LOOP',
        generatedAt: Date.now(),
        durationSeconds: 184,
        totalTurns: 6,
        interruptedTurns: 1,
        mainDisagreement: {
          hi: 'मुख्य असहमति: उत्पादन में मॉडल रिलीज करने से पहले 3-सप्ताह के पूर्ण सुरक्षा ऑडिट की अनिवार्यता बनाम बाजार प्रतिस्पर्धा के लिए त्वरित तैनाती।',
          zh: '核心分歧：在向生产环境发布模型之前必须进行为期3周的完整安全审计，还是为了市场竞争快速部署。',
          en: 'Primary debate: Mandatory 3-week full security audit before production deployment vs. rapid deployment to capture market timing.',
        },
        participantPositions: [
          {
            participantId: 'p_arjun',
            participantName: 'Arjun (speaking Hindi 🇮🇳)',
            positions: {
              hi: 'शुरुआत में उपयोगकर्ता सुरक्षा के आधार पर बिना ऑडिट के रिलीज का कड़ा विरोध किया।',
              zh: '最初基于用户安全，坚决反对在未完成审计前进行全量发布。',
              en: 'Initially adamantly opposed premature release citing user data vulnerability.',
            },
          },
          {
            participantId: 'p_mei',
            participantName: 'Mei (speaking Mandarin 🇨🇳)',
            positions: {
              hi: 'तर्क दिया कि बाजार की प्रतिस्पर्धा देरी बर्दाश्त नहीं कर सकती और सीमित सैंडबॉक्स रोलआउट जोखिम को कम करता है।',
              zh: '主张市场窗口不容错过，强调受限的沙盒灰度测试能够有效控制风险。',
              en: 'Argued that competitive market timing demanded immediate progress via sandbox gating.',
            },
          },
        ],
        pointsOfAgreement: {
          hi: [
            'दोनों पक्षों ने सहमति व्यक्त की कि बिना सुरक्षा नियंत्रण के पूर्ण रिलीज अस्वीकार्य है।',
            'स्वीकार किया कि 5% आंतरिक खातों पर सीमित सैंडबॉक्स रोलआउट दोनों प्राथमिकताओं को संतुलित करता है।',
          ],
          zh: [
            '双方一致同意，在没有任何安全防护的情况下进行全量发布是绝对不可取的。',
            '达成共识：仅针对5%受控账户的沙盒灰度测试成功平衡了速度与合规。',
          ],
          en: [
            'Both participants agreed that unmonitored full deployment is unacceptable.',
            'Consensus reached on a 5% gated sandbox rollout as an acceptable compromise.',
          ],
        },
        unresolvedQuestions: {
          hi: [
            'सैंडबॉक्स चरण के दौरान ऑटो-रोलबैक का थ्रेशोल्ड क्या होगा?',
          ],
          zh: [
            '在灰度沙盒阶段触发自动回滚的具体量化阈值是什么？',
          ],
          en: [
            'What specific anomaly metric triggers an automated rollback during sandbox phase?',
          ],
        },
        changesOfMind: [
          {
            participantId: 'p_arjun',
            participantName: 'Arjun',
            description: {
              hi: 'अर्जुन ने स्पष्ट रूप से स्वीकार किया: "मैंने अपना विचार बदल लिया है" जब मेई ने स्पष्ट किया कि रिलीज 5% सैंडबॉक्स खातों तक सीमित रहेगी।',
              zh: '阿琼（Arjun）明确承认：“我改变主意了”，前提是梅澄清发布仅限于5%的受控沙盒账户。',
              en: 'Arjun explicitly declared "I changed my mind" after Mei clarified restricted sandbox deployment.',
            },
          },
        ],
      };

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Explicit Demo Mode Banner */}
      <div className="bg-charcoal-900 text-canvas-light px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-charcoal-800">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500 text-charcoal-950 px-2 py-0.5 rounded font-black uppercase tracking-wider text-[10px]">
            DEMO MODE
          </span>
          <span className="text-charcoal-300">
            Interactive simulation with simulated participants. Example scenarios clearly labelled.
            No paid API keys required.
          </span>
        </div>

        <button
          onClick={onExitDemo}
          className="inline-flex items-center gap-1 text-charcoal-400 hover:text-white transition-colors"
        >
          <span>Exit Demo</span>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Demo Header */}
      <div className="bg-white border-b border-charcoal-200 px-6 py-4 shadow-subtle flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Logo size="sm" />
          <div className="h-5 w-px bg-charcoal-200" />
          <div className="flex items-center gap-1.5 bg-canvas px-2.5 py-1 rounded-lg border border-charcoal-200 text-xs font-mono font-bold text-accent-teal">
            <span>{mockRoom.roomCode}</span>
            <span className="text-charcoal-300">•</span>
            <span className="text-charcoal-700">
              {activeScenario === 'indic' ? '🇮🇳 Hindi ⟷ 🇮🇳 Tamil' : '🇮🇳 Hindi ⟷ 🇨🇳 Mandarin'}
            </span>
          </div>
        </div>

        {/* Scenario Switcher Tabs */}
        <div className="flex items-center gap-2 bg-canvas p-1 rounded-xl border border-charcoal-200 text-xs font-bold">
          <button
            onClick={() => handleSwitchScenario('indic')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeScenario === 'indic'
                ? 'bg-accent-teal text-white shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            🇮🇳 Eighth Schedule: Hindi ⟷ Tamil
          </button>
          <button
            onClick={() => handleSwitchScenario('international')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeScenario === 'international'
                ? 'bg-accent-teal text-white shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            🌐 International: Hindi ⟷ Mandarin
          </button>
        </div>

        {/* Demo Step Control Bar */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-charcoal-500 font-medium">
            Step {currentStepIndex + 1} of {currentSteps.length}
          </span>

          <button
            onClick={handleResetDemo}
            className="p-2 rounded-lg border border-charcoal-200 text-charcoal-600 hover:bg-canvas transition-colors"
            title="Reset demo to start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleNextStep}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-accent-teal hover:bg-accent-tealHover shadow-subtle transition-all"
          >
            {currentStepIndex < currentSteps.length - 1 ? (
              <>
                <span>Next Scenario Step</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>View Bilingual Summary</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Action Explanation Callout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full">
        <div className="bg-white border border-accent-teal/40 p-4 rounded-xl shadow-subtle flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-tealLight text-accent-teal flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-charcoal-900 uppercase tracking-wide">
                {currentStep.systemActionLabel}
              </span>
              {currentStep.isInterrupted && (
                <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                  Interruption Triggered
                </span>
              )}
              {currentStep.isMindChange && (
                <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                  Change of Mind
                </span>
              )}
            </div>
            <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
              {currentStep.explanation}
            </p>
          </div>
        </div>
      </div>

      {/* Main Room Arena */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col gap-6">
        {/* Participant Panels Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Participant 1: Arjun */}
          <div
            className={`bg-white rounded-xl border p-5 shadow-subtle transition-all ${
              currentStep.speaker === 'Arjun'
                ? 'border-accent-teal ring-2 ring-accent-teal/20'
                : 'border-charcoal-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center font-bold text-orange-900 text-sm">
                    AR
                  </div>
                  <span className="absolute -bottom-1 -right-1 text-base">🇮🇳</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-charcoal-900">Arjun</h3>
                  <span className="text-xs text-charcoal-500">Speaking Hindi (हिन्दी)</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentStep.speaker === 'Arjun' ? (
                  <div className="flex items-center gap-1.5 bg-accent-tealLight px-2.5 py-1 rounded-full border border-accent-teal/30">
                    <span className="text-xs font-semibold text-accent-teal">Speaking</span>
                    <AudioVisualizer isActive={true} type="speaking" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-accent-electricLight px-2.5 py-1 rounded-full border border-accent-electric/30">
                    <Volume2 className="w-3.5 h-3.5 text-accent-electric" />
                    <span className="text-xs font-semibold text-accent-electric">Listening</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Participant 2: Priya or Mei */}
          <div
            className={`bg-white rounded-xl border p-5 shadow-subtle transition-all ${
              currentStep.speaker !== 'Arjun'
                ? 'border-accent-teal ring-2 ring-accent-teal/20'
                : 'border-charcoal-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-emerald-900 text-sm">
                    {activeScenario === 'indic' ? 'PR' : 'ME'}
                  </div>
                  <span className="absolute -bottom-1 -right-1 text-base">
                    {activeScenario === 'indic' ? '🇮🇳' : '🇨🇳'}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-charcoal-900">
                    {activeScenario === 'indic' ? 'Priya' : 'Mei'}
                  </h3>
                  <span className="text-xs text-charcoal-500">
                    {activeScenario === 'indic'
                      ? 'Speaking Tamil (தமிழ்)'
                      : 'Speaking Mandarin (中文)'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentStep.speaker !== 'Arjun' ? (
                  <div className="flex items-center gap-1.5 bg-accent-tealLight px-2.5 py-1 rounded-full border border-accent-teal/30">
                    <span className="text-xs font-semibold text-accent-teal">Speaking</span>
                    <AudioVisualizer isActive={true} type="speaking" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-accent-electricLight px-2.5 py-1 rounded-full border border-accent-electric/30">
                    <Volume2 className="w-3.5 h-3.5 text-accent-electric" />
                    <span className="text-xs font-semibold text-accent-electric">Listening</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Live Conversation Cards / History */}
        <div className="bg-white rounded-2xl border border-charcoal-200 p-6 shadow-subtle flex-1 flex flex-col justify-between overflow-y-auto min-h-[360px]">
          <div className="space-y-4">
            {/* Display Completed History */}
            {completedTurns.map((turn, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border ${
                  turn.speakerName === 'Arjun'
                    ? 'bg-canvas-light border-charcoal-200'
                    : 'bg-white border-charcoal-200'
                } ${turn.isInterrupted ? 'border-rose-300 bg-rose-50/30' : ''}`}
              >
                <div className="flex items-center justify-between gap-2 mb-2 text-xs text-charcoal-500">
                  <span className="font-bold text-charcoal-800">
                    {turn.speakerName} ({turn.speakerLanguage.toUpperCase()})
                  </span>

                  <div className="flex items-center gap-2">
                    {turn.isInterrupted && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        Interrupted Turn
                      </span>
                    )}
                    {turn.isCorrected && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                        Corrected
                      </span>
                    )}
                    {turn.isMindChange && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Mind Change
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-lg border border-charcoal-100">
                    <span className="text-[10px] font-mono text-charcoal-400 font-semibold uppercase block mb-1">
                      Original
                    </span>
                    <p className="text-xs font-semibold text-charcoal-900 leading-relaxed font-sans">
                      {turn.originalText}
                    </p>
                  </div>

                  <div className="p-3 bg-accent-tealLight/40 rounded-lg border border-accent-teal/20">
                    <span className="text-[10px] font-mono text-accent-teal font-semibold uppercase block mb-1">
                      Translation ({turn.targetLanguage.toUpperCase()})
                    </span>
                    <p className="text-xs font-medium text-charcoal-800 leading-relaxed">
                      {turn.translatedText}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Active Turn Currently in Focus */}
            <div className="p-5 rounded-2xl bg-canvas-subtle border-2 border-accent-teal shadow-card">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-bold text-charcoal-900 flex items-center gap-1.5">
                  <span className="text-lg">{currentStep.flag}</span>
                  <span>{currentStep.speaker} is speaking now</span>
                </span>

                <span className="px-2 py-0.5 rounded bg-accent-teal text-white font-mono text-[10px] font-bold uppercase">
                  Current Turn
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-charcoal-200">
                  <span className="text-[10px] font-mono text-charcoal-400 font-semibold uppercase block mb-1">
                    Spoken ({currentStep.speakerLang})
                  </span>
                  <p className="text-sm font-semibold text-charcoal-900 leading-relaxed font-sans">
                    "{currentStep.originalText}"
                  </p>
                </div>

                <div className="p-4 bg-accent-tealLight/60 rounded-xl border border-accent-teal/30">
                  <span className="text-[10px] font-mono text-accent-teal font-semibold uppercase block mb-1">
                    Translated Audio ({currentStep.targetLang})
                  </span>
                  <p className="text-sm font-medium text-charcoal-900 leading-relaxed">
                    "{currentStep.translatedText}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Demo Action Bar */}
          <div className="mt-6 pt-4 border-t border-charcoal-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-charcoal-500">
              <span className="font-semibold text-charcoal-700">Interactive Demo Triggers:</span>
              <span>Test how real interruptions, corrections, and consensus work across Indian and global languages.</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleNextStep}
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-accent-teal hover:bg-accent-tealHover shadow-subtle flex items-center gap-2 transition-all"
              >
                <span>Proceed to Step {Math.min(currentSteps.length, currentStepIndex + 2)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Modal */}
      <EndSummaryModal
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        room={mockRoom}
        summary={mockSummary}
        onDeleteConversation={handleResetDemo}
      />
    </div>
  );
};

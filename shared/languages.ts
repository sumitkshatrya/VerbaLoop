export type SupportedLanguageCode =
  // 22 Eighth Schedule Indian Languages
  | 'hi'   // Hindi
  | 'bn'   // Bengali
  | 'mr'   // Marathi
  | 'te'   // Telugu
  | 'ta'   // Tamil
  | 'gu'   // Gujarati
  | 'ur'   // Urdu
  | 'kn'   // Kannada
  | 'or'   // Odia
  | 'ml'   // Malayalam
  | 'pa'   // Punjabi
  | 'as'   // Assamese
  | 'mai'  // Maithili
  | 'sa'   // Sanskrit
  | 'ks'   // Kashmiri
  | 'kok'  // Konkani
  | 'ne'   // Nepali
  | 'sd'   // Sindhi
  | 'doi'  // Dogri
  | 'mni'  // Manipuri (Meitei)
  | 'brx'  // Bodo
  | 'sat'  // Santali
  // Additional Official Language
  | 'en'   // English
  // International Languages
  | 'zh'   // Mandarin Chinese
  | 'es'   // Spanish
  | 'fr'   // French
  | 'ar'   // Arabic
  | 'ja'   // Japanese
  | 'de'   // German
  | 'pt'   // Portuguese
  | 'ru';  // Russian

export type LanguageGroup = 'indian_scheduled' | 'indian_additional' | 'international';

export interface LanguageCapabilities {
  textTranslation: boolean;
  speechRecognition: boolean;
  speechSynthesis: boolean;
}

export interface LanguageDefinition {
  code: SupportedLanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  speechCode: string;
  direction: 'ltr' | 'rtl';
  script: string;
  group: LanguageGroup;
  capabilities: LanguageCapabilities;
  sampleGreeting: string;
  voiceSupportNote?: string;
}

export const SUPPORTED_LANGUAGES: LanguageDefinition[] = [
  // ============================================================================
  // 1. Eighth Schedule Indian Languages (22 Languages)
  // ============================================================================
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    speechCode: 'hi-IN',
    direction: 'ltr',
    script: 'Devanagari',
    group: 'indian_scheduled',
    capabilities: { textTranslation: true, speechRecognition: true, speechSynthesis: true },
    sampleGreeting: 'नमस्ते, आइए खुलकर बात करते हैं।',
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇮🇳',
    speechCode: 'bn-IN',
    direction: 'ltr',
    script: 'Bengali',
    group: 'indian_scheduled',
    capabilities: { textTranslation: true, speechRecognition: true, speechSynthesis: true },
    sampleGreeting: 'নমস্কার, আসুন সরাসরি কথা বলি।',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    flag: '🇮🇳',
    speechCode: 'mr-IN',
    direction: 'ltr',
    script: 'Devanagari',
    group: 'indian_scheduled',
    capabilities: { textTranslation: true, speechRecognition: true, speechSynthesis: true },
    sampleGreeting: 'नमस्कार, चला मनमोकळेपणाने चर्चा करूया.',
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    speechCode: 'te-IN',
    direction: 'ltr',
    script: 'Telugu',
    group: 'indian_scheduled',
    capabilities: { textTranslation: true, speechRecognition: true, speechSynthesis: true },
    sampleGreeting: 'నమస్కారం, రండి సూటిగా మాట్లాడుకుందాం.',
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    speechCode: 'ta-IN',
    direction: 'ltr',
    script: 'Tamil',
    group: 'indian_scheduled',
    capabilities: { textTranslation: true, speechRecognition: true, speechSynthesis: true },
    sampleGreeting: 'வணக்கம், வாருங்கள் வெளிப்படையாகப் பேசுவோம்.',
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    flag: '🇮🇳',
    speechCode: 'gu-IN',
    direction: 'ltr',
    script: 'Gujarati',
    group: 'indian_scheduled',
    capabilities: { textTranslation: true, speechRecognition: true, speechSynthesis: true },
    sampleGreeting: 'નમસ્તે, ચાલો સીધી વાત કરીએ.',
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    flag: '🇮🇳',
    speechCode: 'ur-IN',
    direction: 'rtl',
    script: 'Perso-Arabic (Nastaliq)',
    group: 'indian_scheduled',
    capabilities: { textTranslation: true, speechRecognition: true, speechSynthesis: true },
    sampleGreeting: 'آداب، آئیے کھل کر بات کرتے ہیں۔',
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    flag: '🇮🇳',
    speechCode: 'kn-IN',
    direction: 'ltr',
    script: 'Kannada',
    group: 'indian_scheduled',
    capabilities: { textTranslation: true, speechRecognition: true, speechSynthesis: true },
    sampleGreeting: 'ನಮಸ್ಕಾರ, ಬನ್ನಿ ಮುಕ್ತವಾಗಿ ಚರ್ಚಿಸೋಣ.',
  },
  {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    flag: '🇮🇳',
    speechCode: 'or-IN',
    direction: 'ltr',
    script: 'Odia',
    group: 'indian_scheduled',
    capabilities: { textTranslation: true, speechRecognition: false, speechSynthesis: false },
    sampleGreeting: 'ନମସ୍କାର, ଆସନ୍ତୁ ସ୍ପଷ୍ଟ ଭାବରେ ଆଲୋଚନା କରିବା।',
    voiceSupportNote: 'Text translation fully supported. Browser speech synthesis dependent on local OS voice pack.',
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    flag: '🇮🇳',
    speechCode: 'ml-IN',
    direction: 'ltr',
    script: 'Malayalam',
    group: 'indian_scheduled',
    capabilities: { textTranslation: true, speechRecognition: true, speechSynthesis: true },
    sampleGreeting: 'നമസ്കാരം, നമുക്ക് തുറന്നു സംസാരിക്കാം.',
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    flag: '🇮🇳',
    speechCode: 'pa-IN',
    direction: 'ltr',
    script: 'Gurmukhi',
    group: 'indian_scheduled',
    capabilities: { textTranslation: true, speechRecognition: true, speechSynthesis: true },
    sampleGreeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਆਓ ਖੁੱਲ੍ਹ ਕੇ ਗੱਲ ਕਰੀਏ।',
  },
  {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    flag: '🇮🇳',
    speechCode: 'as-IN',
    direction: 'ltr',
    script: 'Bengali-Assamese',
    group: 'indian_scheduled',
    capabilities: { textTranslation: true, speechRecognition: false, speechSynthesis: false },
    sampleGreeting: 'নমস্কাৰ, আহক আমি স্পষ্টভাৱে কথা পাতোঁ।',
    voiceSupportNote: 'Text translation fully supported. Voice input/output defaults to text mode.',
  },
  {
    code: 'mai',
    name: 'Maithili',
    nativeName: 'मैथिली',
    flag: '🇮🇳',
    speechCode: 'mai-IN',
    direction: 'ltr',
    script: 'Devanagari',
    group: 'indian_scheduled',
    capabilities: { textTranslation: true, speechRecognition: false, speechSynthesis: false },
    sampleGreeting: 'प्रणाम, आउ हम सब सोझे बात करी।',
    voiceSupportNote: 'Text translation supported via neural translation. Text mode active.',
  },
  {
    code: 'sa',
    name: 'Sanskrit',
    nativeName: 'संस्कृतम्',
    flag: '🇮🇳',
    speechCode: 'sa-IN',
    direction: 'ltr',
    script: 'Devanagari',
    group: 'indian_scheduled',
    capabilities: { textTranslation: true, speechRecognition: false, speechSynthesis: false },
    sampleGreeting: 'नमस्ते, आगच्छन्तु वयं साक्षात् संवदामः।',
    voiceSupportNote: 'Classical Sanskrit text translation active. Voice STT/TTS not standardized in web browsers.',
  },
  {
    code: 'ks',
    name: 'Kashmiri',
    nativeName: 'कॉशुर / كٲشُر',
    flag: '🇮🇳',
    speechCode: 'ks-IN',
    direction: 'rtl',
    script: 'Perso-Arabic / Devanagari',
    group: 'indian_scheduled',
    capabilities: { textTranslation: true, speechRecognition: false, speechSynthesis: false },
    sampleGreeting: 'سلام، اَسِو کٔرِو پَنٕنؠ کتھ صٲف۔',
    voiceSupportNote: 'RTL Nastaliq text translation active. Text-only mode enabled.',
  },
  {
    code: 'kok',
    name: 'Konkani',
    nativeName: 'कोंकणी',
    flag: '🇮🇳',
    speechCode: 'kok-IN',
    direction: 'ltr',
    script: 'Devanagari',
    group: 'indian_scheduled',
    capabilities: { textTranslation: true, speechRecognition: false, speechSynthesis: false },
    sampleGreeting: 'नमस्कार, येयात आमी सरळ उलय्या.',
    voiceSupportNote: 'Text translation supported. Text mode enabled.',
  },
  {
    code: 'ne',
    name: 'Nepali',
    nativeName: 'नेपाली',
    flag: '🇮🇳',
    speechCode: 'ne-NP',
    direction: 'ltr',
    script: 'Devanagari',
    group: 'indian_scheduled',
    capabilities: { textTranslation: true, speechRecognition: true, speechSynthesis: true },
    sampleGreeting: 'नमस्ते, आउनुहोस् खुलस्त कुरा गरौँ।',
  },
  {
    code: 'sd',
    name: 'Sindhi',
    nativeName: 'سنڌي / सिन्धी',
    flag: '🇮🇳',
    speechCode: 'sd-IN',
    direction: 'rtl',
    script: 'Perso-Arabic / Devanagari',
    group: 'indian_scheduled',
    capabilities: { textTranslation: true, speechRecognition: false, speechSynthesis: false },
    sampleGreeting: 'هيلو، اچو ته کليل نموني ڳالهايون.',
    voiceSupportNote: 'RTL text translation active. Speech features default to text mode.',
  },
  {
    code: 'doi',
    name: 'Dogri',
    nativeName: 'डोगरी',
    flag: '🇮🇳',
    speechCode: 'doi-IN',
    direction: 'ltr',
    script: 'Devanagari',
    group: 'indian_scheduled',
    capabilities: { textTranslation: true, speechRecognition: false, speechSynthesis: false },
    sampleGreeting: 'नमस्ते, आओ सिधी गल्ल करिये।',
    voiceSupportNote: 'Text translation supported. Voice features default to text mode.',
  },
  {
    code: 'mni',
    name: 'Manipuri (Meitei)',
    nativeName: 'মেইতেইলোন',
    flag: '🇮🇳',
    speechCode: 'mni-IN',
    direction: 'ltr',
    script: 'Bengali / Meitei Mayek',
    group: 'indian_scheduled',
    capabilities: { textTranslation: true, speechRecognition: false, speechSynthesis: false },
    sampleGreeting: 'খুরুমজরি, চৎলসি অশেংবা ৱারী শানসি।',
    voiceSupportNote: 'Text translation supported. Voice features default to text mode.',
  },
  {
    code: 'brx',
    name: 'Bodo',
    nativeName: 'बड़ो',
    flag: '🇮🇳',
    speechCode: 'brx-IN',
    direction: 'ltr',
    script: 'Devanagari',
    group: 'indian_scheduled',
    capabilities: { textTranslation: true, speechRecognition: false, speechSynthesis: false },
    sampleGreeting: 'खुलुमबाय, फै जों थोंजों रायज्लायदिनि।',
    voiceSupportNote: 'Text translation supported. Voice features default to text mode.',
  },
  {
    code: 'sat',
    name: 'Santali',
    nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ',
    flag: '🇮🇳',
    speechCode: 'sat-IN',
    direction: 'ltr',
    script: 'Ol Chiki',
    group: 'indian_scheduled',
    capabilities: { textTranslation: true, speechRecognition: false, speechSynthesis: false },
    sampleGreeting: 'ᱡᱚᱦᱟᱨ, ᱫᱮᱞᱟᱵᱚᱱ ᱥᱚᱡᱷᱮ ᱜᱟᱞᱢᱟᱨᱟᱣᱟ᱾',
    voiceSupportNote: 'Text translation supported. Voice features default to text mode.',
  },

  // ============================================================================
  // 2. Additional Official Language
  // ============================================================================
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🌐',
    speechCode: 'en-US',
    direction: 'ltr',
    script: 'Latin',
    group: 'indian_additional',
    capabilities: { textTranslation: true, speechRecognition: true, speechSynthesis: true },
    sampleGreeting: 'Hello, let us talk directly.',
  },

  // ============================================================================
  // 3. International Languages
  // ============================================================================
  {
    code: 'zh',
    name: 'Mandarin Chinese',
    nativeName: '中文 (普通话)',
    flag: '🇨🇳',
    speechCode: 'zh-CN',
    direction: 'ltr',
    script: 'Simplified Chinese',
    group: 'international',
    capabilities: { textTranslation: true, speechRecognition: true, speechSynthesis: true },
    sampleGreeting: '你好，让我们坦诚地交流吧。',
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    speechCode: 'es-ES',
    direction: 'ltr',
    script: 'Latin',
    group: 'international',
    capabilities: { textTranslation: true, speechRecognition: true, speechSynthesis: true },
    sampleGreeting: 'Hola, hablemos con total franqueza.',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    speechCode: 'fr-FR',
    direction: 'ltr',
    script: 'Latin',
    group: 'international',
    capabilities: { textTranslation: true, speechRecognition: true, speechSynthesis: true },
    sampleGreeting: 'Bonjour, échangeons en toute franchise.',
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    speechCode: 'ar-SA',
    direction: 'rtl',
    script: 'Arabic',
    group: 'international',
    capabilities: { textTranslation: true, speechRecognition: true, speechSynthesis: true },
    sampleGreeting: 'مرحباً، دعنا نتحدث بكل صراحة ووضوح.',
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    speechCode: 'ja-JP',
    direction: 'ltr',
    script: 'Japanese (Kanji/Kana)',
    group: 'international',
    capabilities: { textTranslation: true, speechRecognition: true, speechSynthesis: true },
    sampleGreeting: 'こんにちは、率直に話し合いましょう。',
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    speechCode: 'de-DE',
    direction: 'ltr',
    script: 'Latin',
    group: 'international',
    capabilities: { textTranslation: true, speechRecognition: true, speechSynthesis: true },
    sampleGreeting: 'Hallo, lass uns offen und direkt sprechen.',
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷',
    speechCode: 'pt-BR',
    direction: 'ltr',
    script: 'Latin',
    group: 'international',
    capabilities: { textTranslation: true, speechRecognition: true, speechSynthesis: true },
    sampleGreeting: 'Olá, vamos conversar abertamente.',
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    speechCode: 'ru-RU',
    direction: 'ltr',
    script: 'Cyrillic',
    group: 'international',
    capabilities: { textTranslation: true, speechRecognition: true, speechSynthesis: true },
    sampleGreeting: 'Здравствуйте, давайте поговорим начистоту.',
  },
];

export function getLanguage(code: string): LanguageDefinition {
  const found = SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
  return (
    found || {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🌐',
      speechCode: 'en-US',
      direction: 'ltr',
      script: 'Latin',
      group: 'indian_additional',
      capabilities: { textTranslation: true, speechRecognition: true, speechSynthesis: true },
      sampleGreeting: 'Hello',
    }
  );
}

export function getLanguagesByGroup(group: LanguageGroup): LanguageDefinition[] {
  return SUPPORTED_LANGUAGES.filter((lang) => lang.group === group);
}

export function isRTL(code: string): boolean {
  return getLanguage(code).direction === 'rtl';
}

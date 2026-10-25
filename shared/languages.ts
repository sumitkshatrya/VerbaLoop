export type SupportedLanguageCode =
  | 'hi'
  | 'en'
  | 'zh'
  | 'es'
  | 'fr'
  | 'ar'
  | 'ja'
  | 'de'
  | 'pt'
  | 'ru';

export interface LanguageDefinition {
  code: SupportedLanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  speechCode: string; // e.g. hi-IN
  sampleGreeting: string;
}

export const SUPPORTED_LANGUAGES: LanguageDefinition[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    speechCode: 'en-US',
    sampleGreeting: 'Hello, let us talk directly.',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    speechCode: 'hi-IN',
    sampleGreeting: 'नमस्ते, आइए खुलकर बात करते हैं।',
  },
  {
    code: 'zh',
    name: 'Mandarin Chinese',
    nativeName: '中文 (普通话)',
    flag: '🇨🇳',
    speechCode: 'zh-CN',
    sampleGreeting: '你好，让我们坦诚地交流吧。',
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    speechCode: 'es-ES',
    sampleGreeting: 'Hola, hablemos con total franqueza.',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    speechCode: 'fr-FR',
    sampleGreeting: 'Bonjour, échangeons en toute franchise.',
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    speechCode: 'ar-SA',
    sampleGreeting: 'مرحباً، دعنا نتحدث بكل صراحة ووضوح.',
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    speechCode: 'ja-JP',
    sampleGreeting: 'こんにちは、率直に話し合いましょう。',
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    speechCode: 'de-DE',
    sampleGreeting: 'Hallo, lass uns offen und direkt sprechen.',
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷',
    speechCode: 'pt-BR',
    sampleGreeting: 'Olá, vamos conversar abertamente.',
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    speechCode: 'ru-RU',
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
      sampleGreeting: 'Hello',
    }
  );
}

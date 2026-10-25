import { useState, useCallback, useRef, useEffect } from 'react';
import { getLanguage, SupportedLanguageCode } from '@verbaloop/shared';

export function useSpeechSynthesis() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const cancel = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      currentUtteranceRef.current = null;
      setIsPlaying(false);
    }
  }, []);

  const speak = useCallback(
    (
      text: string,
      language: SupportedLanguageCode,
      onStart?: () => void,
      onEnd?: () => void
    ) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        setIsSupported(false);
        return;
      }

      // Cancel any ongoing speech first
      window.speechSynthesis.cancel();

      const cleanText = text.trim();
      if (!cleanText) return;

      const langDef = getLanguage(language);
      if (!langDef.capabilities.speechSynthesis) {
        if (onEnd) onEnd();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = langDef.speechCode;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Select suitable voice if available
      const voices = window.speechSynthesis.getVoices();
      const targetCode = langDef.speechCode.toLowerCase();
      const langPrefix = language.toLowerCase();
      const matchingVoice =
        voices.find((v) => v.lang.toLowerCase() === targetCode) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(targetCode)) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onstart = () => {
        setIsPlaying(true);
        if (onStart) onStart();
      };

      utterance.onend = () => {
        setIsPlaying(false);
        currentUtteranceRef.current = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        // 'interrupted' or 'canceled' are expected when user interrupts
        setIsPlaying(false);
        currentUtteranceRef.current = null;
        if (onEnd) onEnd();
      };

      currentUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    []
  );

  return {
    isSupported,
    isPlaying,
    speak,
    cancel,
  };
}


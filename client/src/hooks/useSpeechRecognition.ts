import { useState, useEffect, useRef, useCallback } from 'react';
import { getLanguage, SupportedLanguageCode } from '@verbaloop/shared';

interface UseSpeechRecognitionProps {
  language: SupportedLanguageCode;
  onPartial?: (text: string) => void;
  onFinal?: (text: string) => void;
  onError?: (error: string) => void;
}

export function useSpeechRecognition({
  language,
  onPartial,
  onFinal,
  onError,
}: UseSpeechRecognitionProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognitionRef.current = recognition;
    } catch (e) {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const startListening = useCallback(() => {
    const langDef = getLanguage(language);

    if (!langDef.capabilities.speechRecognition) {
      if (onError) {
        onError(`Speech recognition not standardized in browser for ${langDef.name}; text-only mode enabled.`);
      }
      return;
    }

    if (!recognitionRef.current) {
      setIsSupported(false);
      return;
    }

    const recognition = recognitionRef.current;
    recognition.lang = langDef.speechCode;
    transcriptRef.current = '';

    recognition.onstart = () => {
      setIsListening(true);
      setPermissionState('granted');
      transcriptRef.current = '';
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = 0; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interimTranscript += item[0].transcript;
        }
      }

      const combined = (finalTranscript + ' ' + interimTranscript).trim();
      if (combined) {
        transcriptRef.current = combined;
        if (onPartial) {
          onPartial(combined);
        }
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        setPermissionState('denied');
      }
      setIsListening(false);
      if (onError) onError(event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
      const remaining = transcriptRef.current.trim();
      if (remaining && onFinal) {
        onFinal(remaining);
        transcriptRef.current = '';
      }
    };

    try {
      recognition.start();
    } catch (err: any) {
      // Ignore already started error
      if (!err.message?.includes('already started')) {
        console.warn('SpeechRecognition start warning:', err);
      }
    }
  }, [language, onPartial, onFinal, onError]);

  const stopListening = useCallback((): string => {
    const textToSubmit = transcriptRef.current.trim();
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    }
    transcriptRef.current = '';
    return textToSubmit;
  }, [isListening]);

  return {
    isListening,
    isSupported,
    permissionState,
    startListening,
    stopListening,
  };
}


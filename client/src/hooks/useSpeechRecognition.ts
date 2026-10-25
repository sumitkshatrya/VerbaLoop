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
    if (!recognitionRef.current) {
      setIsSupported(false);
      return;
    }

    const recognition = recognitionRef.current;
    const langDef = getLanguage(language);
    recognition.lang = langDef.speechCode;

    recognition.onstart = () => {
      setIsListening(true);
      setPermissionState('granted');
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interimTranscript += item[0].transcript;
        }
      }

      if (interimTranscript && onPartial) {
        onPartial(interimTranscript);
      }

      if (finalTranscript && onFinal) {
        onFinal(finalTranscript.trim());
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

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    }
  }, [isListening]);

  return {
    isListening,
    isSupported,
    permissionState,
    startListening,
    stopListening,
  };
}

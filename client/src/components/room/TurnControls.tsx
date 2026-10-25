import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { TurnMessage, Participant } from '@verbaloop/shared';

interface TurnControlsProps {
  currentParticipant: Participant;
  isRoomActive: boolean;
  isPaused: boolean;
  activeTurn?: TurnMessage | null;
  isListening: boolean;
  isAudioPlaying: boolean;
  onStartVoiceTurn: () => void;
  onStopVoiceTurn: () => void;
  onSendTextMessage: (text: string) => void;
  onInterrupt: () => void;
  onPause: () => void;
  onResume: () => void;
}

export const TurnControls: React.FC<TurnControlsProps> = ({
  currentParticipant,
  isRoomActive,
  isPaused,
  activeTurn,
  isListening,
  isAudioPlaying,
  onStartVoiceTurn,
  onStopVoiceTurn,
  onSendTextMessage,
  onInterrupt,
  onPause,
  onResume,
}) => {
  const [typedText, setTypedText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Can interrupt if peer is actively speaking or if audio is currently playing
  const isPeerSpeaking =
    activeTurn &&
    activeTurn.speakerId !== currentParticipant.id &&
    (activeTurn.status === 'speaking' || activeTurn.status === 'translating');

  const canInterrupt = isPeerSpeaking || isAudioPlaying;

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedText.trim() || !isRoomActive || isPaused) return;
    onSendTextMessage(typedText.trim());
    setTypedText('');
  };

  // Keyboard shortcut listener (Esc to interrupt)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && canInterrupt) {
        e.preventDefault();
        onInterrupt();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canInterrupt, onInterrupt]);

  return (
    <div className="bg-white border-t border-charcoal-200 p-4 sm:p-5 shadow-elevated">
      <div className="max-w-4xl mx-auto flex flex-col gap-3">
        {/* Top Control Bar: Interrupt & Pause Actions */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Real Interruption Trigger Button */}
            <button
              onClick={onInterrupt}
              disabled={!canInterrupt}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all ${
                canInterrupt
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-card animate-pulse cursor-pointer'
                  : 'bg-charcoal-100 text-charcoal-400 border border-charcoal-200 cursor-not-allowed opacity-60'
              }`}
              title={
                canInterrupt
                  ? 'Interrupt remote speech immediately (Esc)'
                  : 'Interrupt is enabled when partner is speaking or audio is playing'
              }
              aria-label="Interrupt current turn"
            >
              <VolumeX className="w-4 h-4" />
              <span>Interrupt Voice (Esc)</span>
            </button>

            {isPaused && (
              <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                Paused: "I need a moment"
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-charcoal-400 font-mono">
            <span>[Enter] to send</span>
            <span>•</span>
            <span>[Esc] to interrupt</span>
          </div>
        </div>

        {/* Input Controls: Push-to-Talk & Text Input */}
        <div className="flex items-center gap-2.5">
          {/* Push-to-Talk / Voice Toggle */}
          <button
            type="button"
            disabled={!isRoomActive || isPaused}
            onClick={isListening ? onStopVoiceTurn : onStartVoiceTurn}
            className={`shrink-0 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
              isListening
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-card animate-pulse ring-4 ring-rose-200'
                : 'bg-accent-teal hover:bg-accent-tealHover text-white shadow-subtle'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isListening ? 'Click to finish speaking' : 'Click to start speaking in your language'}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                <span className="hidden sm:inline">Speaking... (Finish)</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span className="hidden sm:inline">Push to Talk</span>
              </>
            )}
          </button>

          {/* Direct Text Input Form */}
          <form onSubmit={handleSendText} className="flex-1 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              disabled={!isRoomActive || isPaused}
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder={
                isPaused
                  ? 'Conversation is paused. Click Resume above to continue...'
                  : isListening
                  ? 'Speaking into microphone... or type here...'
                  : `Type in ${currentParticipant.language} or speak with button...`
              }
              className="flex-1 bg-canvas border border-charcoal-200 rounded-xl px-4 py-3 text-sm font-medium text-charcoal-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-accent-teal/40 focus:border-accent-teal disabled:opacity-60 disabled:cursor-not-allowed"
            />

            <button
              type="submit"
              disabled={!typedText.trim() || !isRoomActive || isPaused}
              className="shrink-0 p-3 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useRef } from 'react';
import { TurnMessage, Participant, getLanguage } from '@verbaloop/shared';
import {
  Volume2,
  VolumeX,
  Edit3,
  Clock,
  AlertCircle,
  CheckCircle2,
  CornerDownRight,
  Sparkles,
} from 'lucide-react';

interface ConversationTranscriptProps {
  turns: TurnMessage[];
  currentParticipant: Participant;
  streamingTurn: TurnMessage | null;
  onOpenCorrection: (turn: TurnMessage) => void;
  onReplayAudio?: (text: string, lang: string) => void;
}

export const ConversationTranscript: React.FC<ConversationTranscriptProps> = ({
  turns,
  currentParticipant,
  streamingTurn,
  onOpenCorrection,
  onReplayAudio,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, streamingTurn]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
      {turns.length === 0 && !streamingTurn && (
        <div className="h-64 flex flex-col items-center justify-center text-center text-charcoal-400">
          <p className="text-sm font-medium text-charcoal-600">The floor is quiet.</p>
          <p className="text-xs text-charcoal-400 mt-1 max-w-sm">
            Press Speak or type a message below to start the conversation.
            Translations and audio playback will appear here in real time.
          </p>
        </div>
      )}

      {/* Render all confirmed turns (hide cancelled or incomplete turns without text) */}
      {turns
        .filter(
          (t) =>
            t.status !== 'cancelled' &&
            t.status !== 'speaking' &&
            Boolean(t.originalText && t.originalText.trim())
        )
        .map((turn: TurnMessage) => {
        const isFromMe = turn.speakerId === currentParticipant.id;
        const speakerLangDef = getLanguage(turn.speakerLanguage);
        const targetLangDef = getLanguage(turn.targetLanguage);

        return (
          <div
            key={turn.turnId}
            className={`flex flex-col ${
              isFromMe ? 'items-end' : 'items-start'
            } transition-all duration-150`}
          >
            {/* Speaker Header */}
            <div className="flex items-center gap-2 mb-1 px-1 text-xs text-charcoal-500 font-medium">
              <span>{turn.speakerName}</span>
              <span title={speakerLangDef.name}>{speakerLangDef.flag}</span>
              <span className="text-charcoal-300">•</span>
              <span className="flex items-center gap-1 font-mono text-[11px] text-charcoal-400">
                <Clock className="w-3 h-3" />
                {new Date(turn.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>

              {turn.isInterrupted && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                  <VolumeX className="w-3 h-3" />
                  Interrupted
                </span>
              )}

              {turn.correction && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  <Edit3 className="w-3 h-3" />
                  Corrected
                </span>
              )}
            </div>

            {/* Turn Bubble Card */}
            <div
              className={`max-w-2xl rounded-2xl p-4 shadow-subtle border ${
                isFromMe
                  ? 'bg-white border-charcoal-200 rounded-tr-none'
                  : 'bg-canvas-light border-charcoal-200 rounded-tl-none'
              } ${turn.isInterrupted ? 'border-rose-300 bg-rose-50/30' : ''}`}
            >
              {/* Original Text */}
              <div className="mb-2.5 pb-2.5 border-b border-charcoal-100">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-charcoal-400 font-semibold">
                      Original ({speakerLangDef.name})
                    </span>
                    {speakerLangDef.direction === 'rtl' && (
                      <span className="text-[9px] font-mono bg-amber-100 text-amber-800 px-1 rounded font-semibold">
                        RTL
                      </span>
                    )}
                  </div>

                  {isFromMe && !turn.isInterrupted && (
                    <button
                      onClick={() => onOpenCorrection(turn)}
                      className="text-[11px] text-accent-teal hover:underline flex items-center gap-1 font-medium"
                      title="Correct or rephrase translation"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Rephrase / Correct</span>
                    </button>
                  )}
                </div>
                <p
                  className="text-sm font-semibold text-charcoal-900 leading-relaxed font-sans"
                  dir={speakerLangDef.direction}
                >
                  {turn.originalText}
                </p>
              </div>

              {/* Translated Text */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-accent-teal font-semibold">
                      Translation ({targetLangDef.name})
                    </span>
                    {targetLangDef.direction === 'rtl' && (
                      <span className="text-[9px] font-mono bg-amber-100 text-amber-800 px-1 rounded font-semibold">
                        RTL
                      </span>
                    )}
                  </div>

                  {onReplayAudio && turn.translatedText && (
                    <button
                      onClick={() => onReplayAudio(turn.translatedText, turn.targetLanguage)}
                      className="p-1 rounded text-charcoal-400 hover:text-accent-teal hover:bg-canvas transition-colors"
                      title="Replay translated audio"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p
                  className="text-sm font-medium text-charcoal-800 leading-relaxed"
                  dir={targetLangDef.direction}
                >
                  {turn.status === 'translating' ? (
                    <span className="text-xs text-amber-700 italic flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-spin" />
                      [Translating in real time...]
                    </span>
                  ) : (
                    turn.translatedText || (
                      <span className="text-xs text-charcoal-400 italic">
                        [Translation unavailable]
                      </span>
                    )
                  )}
                </p>
              </div>

              {/* Correction Display if present */}
              {turn.correction && (
                <div className="mt-2.5 pt-2 border-t border-purple-200 bg-purple-50/50 p-2 rounded-lg">
                  <div className="text-[10px] font-mono text-purple-700 font-semibold uppercase">
                    Speaker Clarification:
                  </div>
                  <p className="text-xs text-charcoal-800 font-medium mt-0.5">
                    "{turn.correction.originalCorrection}" ➔ "{turn.correction.translatedCorrection}"
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Live Interim Streaming Bubble */}
      {streamingTurn && (
        <div
          className={`flex flex-col ${
            streamingTurn.speakerId === currentParticipant.id ? 'items-end' : 'items-start'
          } animate-in fade-in duration-100`}
        >
          <div className="flex items-center gap-1.5 mb-1 px-1 text-xs text-charcoal-500 font-medium">
            <span>{streamingTurn.speakerName}</span>
            <span className="text-accent-teal font-mono text-[10px] font-semibold uppercase animate-pulse">
              [Live Streaming]
            </span>
          </div>

          <div className="max-w-2xl rounded-2xl p-4 bg-accent-tealLight/40 border border-accent-teal/30 shadow-subtle">
            <p
              className="text-sm font-semibold text-charcoal-900 leading-relaxed font-sans italic"
              dir={getLanguage(streamingTurn.speakerLanguage).direction}
            >
              {streamingTurn.originalText || 'Listening...'}
            </p>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};


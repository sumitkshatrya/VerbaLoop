import React from 'react';
import { Participant, getLanguage, TurnMessage } from '@verbaloop/shared';
import { AudioVisualizer } from '../common/AudioVisualizer';
import { Mic, Volume2, ShieldCheck, User } from 'lucide-react';

interface ParticipantPanelProps {
  participant: Participant | null;
  isCurrentUser: boolean;
  activeTurn?: TurnMessage | null;
  isAudioPlaying?: boolean;
  className?: string;
}

export const ParticipantPanel: React.FC<ParticipantPanelProps> = ({
  participant,
  isCurrentUser,
  activeTurn,
  isAudioPlaying = false,
  className = '',
}) => {
  if (!participant) {
    return (
      <div
        className={`bg-white rounded-xl border border-dashed border-charcoal-300 p-5 flex flex-col items-center justify-center text-center min-h-[120px] ${className}`}
      >
        <User className="w-8 h-8 text-charcoal-300 mb-2 animate-pulse" />
        <p className="text-xs font-semibold text-charcoal-700">Waiting for peer to join...</p>
        <p className="text-[11px] text-charcoal-400 mt-0.5">Share the room code above</p>
      </div>
    );
  }

  const langDef = getLanguage(participant.language);

  // Determine current active state
  const isSpeaking = activeTurn?.speakerId === participant.id && activeTurn?.status === 'speaking';
  const isTranslating = activeTurn?.speakerId === participant.id && activeTurn?.status === 'translating';
  const isReceivingAudio = isAudioPlaying && activeTurn?.speakerId !== participant.id;

  return (
    <div
      className={`bg-white rounded-xl border p-5 shadow-subtle transition-all duration-200 ${
        isSpeaking
          ? 'border-accent-teal ring-2 ring-accent-teal/20'
          : isReceivingAudio
          ? 'border-accent-electric ring-2 ring-accent-electric/20'
          : 'border-charcoal-200'
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* User Identity */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-canvas-subtle border border-charcoal-200 flex items-center justify-center font-bold text-charcoal-800 text-sm shadow-inner">
              {participant.name.slice(0, 2).toUpperCase()}
            </div>
            <span
              className="absolute -bottom-1 -right-1 text-base leading-none select-none"
              title={langDef.name}
            >
              {langDef.flag}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-charcoal-900 leading-tight">
                {participant.name}
              </h3>
              {isCurrentUser && (
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-charcoal-100 text-charcoal-700 font-semibold">
                  You
                </span>
              )}
              {participant.isHost && (
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-accent-tealLight text-accent-teal font-semibold">
                  Host
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-charcoal-500 mt-0.5">
              <span>Speaks {langDef.name}</span>
              <span className="text-charcoal-300">•</span>
              <span className="font-mono text-[11px] text-charcoal-400">{langDef.nativeName}</span>
            </div>
          </div>
        </div>

        {/* Audio Visualizer & State Badge */}
        <div className="flex flex-col items-end gap-1.5">
          {isSpeaking ? (
            <div className="flex items-center gap-1.5 bg-accent-tealLight px-2.5 py-1 rounded-full border border-accent-teal/30">
              <span className="w-2 h-2 rounded-full bg-accent-teal animate-ping" />
              <span className="text-xs font-semibold text-accent-teal">Speaking</span>
              <AudioVisualizer isActive={true} type="speaking" />
            </div>
          ) : isTranslating ? (
            <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 text-amber-800 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-spin" />
              <span>Translating...</span>
            </div>
          ) : isReceivingAudio ? (
            <div className="flex items-center gap-1.5 bg-accent-electricLight px-2.5 py-1 rounded-full border border-accent-electric/30">
              <Volume2 className="w-3.5 h-3.5 text-accent-electric animate-pulse" />
              <span className="text-xs font-semibold text-accent-electric">Playing Audio</span>
              <AudioVisualizer isActive={true} type="listening" />
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-charcoal-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-charcoal-300" />
              <span>Ready / Idle</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

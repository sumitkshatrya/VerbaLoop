import React, { useState } from 'react';
import { RoomState, Participant } from '@verbaloop/shared';
import { Logo } from '../common/Logo';
import {
  Copy,
  Check,
  Pause,
  Play,
  PhoneOff,
  Trash2,
  Users,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';

interface RoomHeaderProps {
  room: RoomState;
  currentParticipant: Participant;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
  onDelete: () => void;
  onLeave: () => void;
  onOpenSummary?: () => void;
}

export const RoomHeader: React.FC<RoomHeaderProps> = ({
  room,
  currentParticipant,
  onPause,
  onResume,
  onEnd,
  onDelete,
  onLeave,
  onOpenSummary,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const inviteUrl = `${window.location.origin}?room=${room.roomCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete room ${room.roomCode} and all conversation history? This cannot be undone.`
      )
    ) {
      onDelete();
    }
  };

  const isPaused = room.status === 'paused';
  const peer = room.participants.find((p) => p.id !== currentParticipant.id);

  return (
    <header className="bg-white border-b border-charcoal-200 px-4 sm:px-6 py-3 sticky top-0 z-20 shadow-subtle">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Room Identity & Invitation */}
        <div className="flex items-center gap-4">
          <Logo size="sm" />

          <div className="h-5 w-px bg-charcoal-200 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-canvas px-2.5 py-1 rounded-lg border border-charcoal-200">
              <span className="text-xs font-mono font-bold text-charcoal-900 tracking-wider">
                {room.roomCode}
              </span>
              <button
                onClick={handleCopyLink}
                className="p-1 rounded text-charcoal-500 hover:text-accent-teal hover:bg-white transition-colors"
                title="Copy shareable room invitation link"
                aria-label="Copy invitation link"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Participant Status */}
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md border ${
                room.participants.length === 2
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>
                {room.participants.length === 2
                  ? 'Both Connected'
                  : 'Waiting for Peer (1/2)'}
              </span>
            </span>
          </div>

          {room.topic && (
            <span className="hidden lg:inline-flex text-xs font-medium text-charcoal-600 bg-canvas-subtle px-2.5 py-1 rounded border border-charcoal-200 max-w-xs truncate">
              {room.topic}
            </span>
          )}
        </div>

        {/* Right: Conversation Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Pause / Resume Button */}
          {room.status !== 'ended' && (
            <button
              onClick={isPaused ? onResume : onPause}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isPaused
                  ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                  : 'bg-canvas text-charcoal-700 border-charcoal-200 hover:bg-canvas-subtle'
              }`}
              title={isPaused ? 'Resume conversation' : 'Pause: "I need a moment"'}
            >
              {isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume Conversation</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>I need a moment</span>
                </>
              )}
            </button>
          )}

          {/* End Conversation Button */}
          {room.status !== 'ended' ? (
            <button
              onClick={onEnd}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>End & Summarize</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-charcoal-500 bg-charcoal-100 px-2.5 py-1 rounded-md border border-charcoal-200">
                Concluded
              </span>
              {onOpenSummary && (
                <button
                  onClick={onOpenSummary}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-accent-teal bg-accent-tealLight hover:bg-accent-tealLight/80 border border-accent-teal/30 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>View Summary</span>
                </button>
              )}
            </div>
          )}

          {/* Delete Conversation Button */}
          <button
            onClick={handleDelete}
            className="p-1.5 text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Permanently delete conversation transcript and data"
            aria-label="Delete conversation permanently"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};


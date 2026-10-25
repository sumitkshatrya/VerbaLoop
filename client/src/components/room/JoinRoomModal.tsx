import React, { useState, useEffect } from 'react';
import { SupportedLanguageCode, sanitizeRoomCode } from '@verbaloop/shared';
import { LanguageSelect } from '../common/LanguageSelect';
import { X, LogIn, AlertCircle } from 'lucide-react';

interface JoinRoomModalProps {
  isOpen: boolean;
  initialRoomCode?: string;
  onClose: () => void;
  onJoinRoom: (
    roomCode: string,
    participantName: string,
    participantLanguage: SupportedLanguageCode
  ) => Promise<any>;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  isOpen,
  initialRoomCode,
  onClose,
  onJoinRoom,
}) => {
  const [roomCode, setRoomCode] = useState(initialRoomCode || '');
  const [participantName, setParticipantName] = useState('');
  const [participantLanguage, setParticipantLanguage] = useState<SupportedLanguageCode>('zh');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialRoomCode) {
      setRoomCode(sanitizeRoomCode(initialRoomCode) || initialRoomCode);
    }
  }, [initialRoomCode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = sanitizeRoomCode(roomCode);
    if (!cleanCode) {
      setError('Please enter a valid room code (e.g. LOOP-XXXX) or paste a complete invite link');
      return;
    }
    if (!participantName.trim()) {
      setError('Please enter your name');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await onJoinRoom(cleanCode, participantName.trim(), participantLanguage);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[92vh] border border-charcoal-200 shadow-elevated flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-canvas-subtle px-6 py-4 border-b border-charcoal-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-electricLight text-accent-electric flex items-center justify-center">
              <LogIn className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-charcoal-900">Join Argument Room</h3>
              <p className="text-xs text-charcoal-500">Enter code provided by host</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-canvas transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wide mb-1.5">
                Room Code or Full Invite Link
              </label>
              <input
                type="text"
                required
                maxLength={256}
                value={roomCode}
                onChange={(e) => {
                  const val = e.target.value;
                  const sanitized = sanitizeRoomCode(val);
                  setRoomCode(sanitized || val.toUpperCase());
                }}
                placeholder="e.g. LOOP-7X9K or paste full invite URL"
                className="w-full bg-white border border-charcoal-200 rounded-lg px-3.5 py-2.5 text-sm font-mono font-bold text-charcoal-900 tracking-wider shadow-subtle focus:outline-none focus:ring-2 focus:ring-accent-electric/40 focus:border-accent-electric uppercase"
              />
              <p className="text-[11px] text-charcoal-500 mt-1">
                Enter your 8-character code or paste the complete invite address.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wide mb-1.5">
                Your Name / Alias
              </label>
              <input
                type="text"
                required
                maxLength={50}
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="e.g. Mei or Sofia"
                className="w-full bg-white border border-charcoal-200 rounded-lg px-3.5 py-2.5 text-sm font-medium text-charcoal-900 shadow-subtle focus:outline-none focus:ring-2 focus:ring-accent-electric/40 focus:border-accent-electric"
              />
            </div>

            <LanguageSelect
              label="Your Preferred Language"
              value={participantLanguage}
              onChange={setParticipantLanguage}
            />
          </div>

          {/* Sticky Action Footer */}
          <div className="p-4 bg-canvas-subtle border-t border-charcoal-200 shrink-0">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-accent-electric hover:bg-accent-electricHover shadow-subtle disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Validating room...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Join Conversation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


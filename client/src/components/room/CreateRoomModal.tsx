import React, { useState } from 'react';
import { SupportedLanguageCode } from '@verbaloop/shared';
import { LanguageSelect } from '../common/LanguageSelect';
import { X, Mic, MicOff, MessageSquarePlus, Sparkles, AlertCircle } from 'lucide-react';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (
    hostName: string,
    hostLanguage: SupportedLanguageCode,
    topic?: string
  ) => Promise<any>;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreateRoom,
}) => {
  const [hostName, setHostName] = useState('');
  const [hostLanguage, setHostLanguage] = useState<SupportedLanguageCode>('en');
  const [topic, setTopic] = useState('');
  const [audioMode, setAudioMode] = useState<'voice' | 'text'>('voice');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostName.trim()) {
      setError('Please enter your name');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await onCreateRoom(hostName.trim(), hostLanguage, topic.trim() || undefined);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full border border-charcoal-200 shadow-elevated overflow-hidden">
        {/* Header */}
        <div className="bg-canvas-subtle px-6 py-4 border-b border-charcoal-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-tealLight text-accent-teal flex items-center justify-center">
              <MessageSquarePlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-charcoal-900">Create Argument Room</h3>
              <p className="text-xs text-charcoal-500">Different languages. One conversation.</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wide mb-1.5">
              Your Name / Alias
            </label>
            <input
              type="text"
              required
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="e.g. Arjun or Mei"
              className="w-full bg-white border border-charcoal-200 rounded-lg px-3.5 py-2.5 text-sm font-medium text-charcoal-900 shadow-subtle focus:outline-none focus:ring-2 focus:ring-accent-teal/40 focus:border-accent-teal"
            />
          </div>

          <LanguageSelect
            label="Your Preferred Language"
            value={hostLanguage}
            onChange={setHostLanguage}
          />

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wide mb-1.5">
              Debate Topic / Premise <span className="text-charcoal-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Speed vs Security in AI releases"
              className="w-full bg-white border border-charcoal-200 rounded-lg px-3.5 py-2.5 text-sm font-medium text-charcoal-900 shadow-subtle focus:outline-none focus:ring-2 focus:ring-accent-teal/40 focus:border-accent-teal"
            />
          </div>

          {/* Audio vs Text Mode Toggle */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wide mb-1.5">
              Preferred Input Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAudioMode('voice')}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                  audioMode === 'voice'
                    ? 'bg-accent-tealLight text-accent-teal border-accent-teal'
                    : 'bg-white text-charcoal-600 border-charcoal-200 hover:bg-canvas'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Voice & Speech</span>
              </button>

              <button
                type="button"
                onClick={() => setAudioMode('text')}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                  audioMode === 'text'
                    ? 'bg-accent-tealLight text-accent-teal border-accent-teal'
                    : 'bg-white text-charcoal-600 border-charcoal-200 hover:bg-canvas'
                }`}
              >
                <MicOff className="w-3.5 h-3.5" />
                <span>Text-Only Mode</span>
              </button>
            </div>
            <p className="text-[11px] text-charcoal-500 mt-1">
              {audioMode === 'voice'
                ? 'Microphone required. Instant speech-to-text with audio playback.'
                : 'No mic permissions required. Type messages directly.'}
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-accent-teal hover:bg-accent-tealHover shadow-subtle disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Generating secure room...</span>
              ) : (
                <>
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>Create Room & Generate Code</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


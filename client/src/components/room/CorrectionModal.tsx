import React, { useState, useEffect } from 'react';
import { TurnMessage, getLanguage } from '@verbaloop/shared';
import { Edit3, X, Check, AlertCircle } from 'lucide-react';

interface CorrectionModalProps {
  turn: TurnMessage | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitCorrection: (turnId: string, correctedText: string) => void;
}

export const CorrectionModal: React.FC<CorrectionModalProps> = ({
  turn,
  isOpen,
  onClose,
  onSubmitCorrection,
}) => {
  if (!isOpen || !turn) return null;

  const [correctedText, setCorrectedText] = useState(turn.originalText);
  const langDef = getLanguage(turn.speakerLanguage);

  useEffect(() => {
    if (turn) {
      setCorrectedText(turn.originalText);
    }
  }, [turn]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctedText.trim()) return;
    onSubmitCorrection(turn.turnId, correctedText.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-charcoal-200 shadow-elevated overflow-hidden">
        <div className="bg-canvas-subtle px-6 py-4 border-b border-charcoal-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-accent-teal" />
            <h3 className="text-sm font-bold text-charcoal-900">
              Clarify or Correct Statement
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-charcoal-400 hover:text-charcoal-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wide mb-1">
              Original statement ({langDef.name})
            </label>
            <div className="p-3 bg-canvas rounded-lg text-sm font-medium text-charcoal-700 italic border border-charcoal-200">
              "{turn.originalText}"
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wide mb-1.5">
              Your Corrected Clarification
            </label>
            <textarea
              rows={3}
              required
              value={correctedText}
              onChange={(e) => setCorrectedText(e.target.value)}
              className="w-full bg-white border border-charcoal-200 rounded-lg p-3 text-sm font-medium text-charcoal-900 shadow-subtle focus:outline-none focus:ring-2 focus:ring-accent-teal/40 focus:border-accent-teal"
              placeholder="Enter exact nuanced clarification..."
            />
            <p className="text-[11px] text-charcoal-500 mt-1">
              VerbaLoop will instantly re-translate this correction and update both participants' transcripts.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-charcoal-600 hover:text-charcoal-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-accent-teal hover:bg-accent-tealHover shadow-subtle"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Update Translation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


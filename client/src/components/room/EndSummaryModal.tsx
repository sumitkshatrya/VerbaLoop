import React, { useState, useEffect } from 'react';
import { ConversationSummary, RoomState, getLanguage } from '@verbaloop/shared';
import confetti from 'canvas-confetti';
import {
  FileText,
  Copy,
  Check,
  X,
  Scale,
  Users,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Trash2,
  Share2,
} from 'lucide-react';

interface EndSummaryModalProps {
  summary: ConversationSummary | null;
  room: RoomState;
  isOpen: boolean;
  onClose: () => void;
  onDeleteConversation: () => void;
}

export const EndSummaryModal: React.FC<EndSummaryModalProps> = ({
  summary,
  room,
  isOpen,
  onClose,
  onDeleteConversation,
}) => {
  if (!isOpen || !summary) return null;

  // Collect the available summary languages
  const availableLangs = Array.from(
    new Set([
      ...Object.keys(summary.mainDisagreement || {}),
      ...room.participants.map((p) => p.language),
    ])
  );

  const [selectedLang, setSelectedLang] = useState<string>(
    availableLangs[0] || 'en'
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      if (canvas && typeof canvas.getContext === 'function' && canvas.getContext('2d')) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    } catch {}
  }, []);

  const handleCopySummary = () => {
    const mainDisagreements = summary.mainDisagreement || {};
    const participantPositions = summary.participantPositions || [];
    const pointsOfAgreement = summary.pointsOfAgreement || {};
    const unresolvedQuestions = summary.unresolvedQuestions || {};
    const changesOfMind = summary.changesOfMind || [];

    const text = `
VERBALOOP CONVERSATION SUMMARY (${getLanguage(selectedLang).name})
Room: ${summary.roomCode}
Duration: ${summary.durationSeconds}s | Total Turns: ${summary.totalTurns} | Interrupted: ${summary.interruptedTurns}

MAIN DISAGREEMENT:
${mainDisagreements[selectedLang] || mainDisagreements['en'] || 'N/A'}

PARTICIPANT POSITIONS:
${participantPositions
  .map(
    (p) =>
      `• ${p.participantName}: ${
        p.positions?.[selectedLang] || p.positions?.['en'] || ''
      }`
  )
  .join('\n')}

POINTS OF AGREEMENT:
${(pointsOfAgreement[selectedLang] || pointsOfAgreement['en'] || [])
  .map((pt) => `• ${pt}`)
  .join('\n')}

UNRESOLVED QUESTIONS:
${(unresolvedQuestions[selectedLang] || unresolvedQuestions['en'] || [])
  .map((q) => `• ${q}`)
  .join('\n')}

CHANGES OF MIND:
${
  changesOfMind.length > 0
    ? changesOfMind
        .map(
          (m) =>
            `• ${m.participantName}: ${
              m.description?.[selectedLang] || m.description?.['en'] || ''
            }`
        )
        .join('\n')
    : 'None explicitly recorded.'
}
    `.trim();

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentLangDef = getLanguage(selectedLang);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] border border-charcoal-200 shadow-elevated flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-canvas-subtle px-6 py-4 border-b border-charcoal-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-tealLight text-accent-teal flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-charcoal-900 leading-tight">
                End-of-Conversation Bilingual Summary
              </h3>
              <p className="text-xs text-charcoal-500">
                Objective neutral synthesis across languages
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-charcoal-200 bg-white hover:bg-canvas text-xs font-semibold text-charcoal-700 transition-colors"
              title="Copy formatted summary"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Language Tabs & Metadata Pill */}
        <div className="px-6 py-3 bg-canvas border-b border-charcoal-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-charcoal-500 mr-1">
              Read in:
            </span>
            {availableLangs.map((langCode) => {
              const lang = getLanguage(langCode);
              return (
                <button
                  key={langCode}
                  onClick={() => setSelectedLang(langCode)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedLang === langCode
                      ? 'bg-accent-teal text-white shadow-sm'
                      : 'bg-white text-charcoal-700 border border-charcoal-200 hover:bg-canvas-subtle'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-xs text-charcoal-500 font-mono">
            <span>Turns: {summary.totalTurns}</span>
            <span>•</span>
            <span className="text-rose-700 font-semibold">
              Interrupted: {summary.interruptedTurns}
            </span>
            <span>•</span>
            <span>Duration: {summary.durationSeconds}s</span>
          </div>
        </div>

        {/* Scrollable Summary Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Disagreement */}
          <div className="bg-canvas-light p-4 rounded-xl border border-charcoal-200">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-charcoal-900 uppercase tracking-wide">
              <Scale className="w-4 h-4 text-accent-coral" />
              <span>Main Disagreement</span>
            </div>
            <p className="text-sm font-semibold text-charcoal-900 leading-relaxed">
              {summary.mainDisagreement?.[selectedLang] ||
                summary.mainDisagreement?.['en'] ||
                'No strong dispute logged.'}
            </p>
          </div>

          {/* Participant Positions */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-charcoal-900 uppercase tracking-wide">
              <Users className="w-4 h-4 text-accent-teal" />
              <span>Each Participant's Stance</span>
            </div>
            <div className="space-y-2.5">
              {(summary.participantPositions || []).map((p, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-white border border-charcoal-200 shadow-subtle flex flex-col gap-1"
                >
                  <span className="text-xs font-bold text-charcoal-900">
                    {p.participantName}
                  </span>
                  <p className="text-xs text-charcoal-700 leading-relaxed font-medium">
                    {p.positions?.[selectedLang] || p.positions?.['en']}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Points of Agreement */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-800 uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Points of Agreement</span>
            </div>
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 space-y-2">
              {(
                summary.pointsOfAgreement?.[selectedLang] ||
                summary.pointsOfAgreement?.['en'] ||
                []
              ).map((pt, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-emerald-950 font-medium">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Changes of Mind */}
          {(summary.changesOfMind || []).length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-purple-900 uppercase tracking-wide">
                <Lightbulb className="w-4 h-4 text-purple-600" />
                <span>Explicitly Stated Changes of Mind</span>
              </div>
              <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-200 space-y-2">
                {(summary.changesOfMind || []).map((change, idx) => (
                  <div key={idx} className="text-xs text-purple-950 font-medium">
                    <span className="font-bold">{change.participantName}: </span>
                    <span>
                      {change.description?.[selectedLang] ||
                        change.description?.['en']}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unresolved Questions */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-900 uppercase tracking-wide">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>Unresolved Questions</span>
            </div>
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 space-y-2">
              {(
                summary.unresolvedQuestions?.[selectedLang] ||
                summary.unresolvedQuestions?.['en'] ||
                []
              ).map((q, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-amber-950 font-medium">
                  <span className="text-amber-600 font-bold">?</span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-canvas-subtle px-6 py-4 border-t border-charcoal-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            onClick={onDeleteConversation}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Conversation Data</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-charcoal-900 hover:bg-charcoal-800 transition-colors"
          >
            Done & Return to Room
          </button>
        </div>
      </div>
    </div>
  );
};


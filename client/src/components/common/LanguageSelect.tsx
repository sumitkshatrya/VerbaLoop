import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  SUPPORTED_LANGUAGES,
  SupportedLanguageCode,
  LanguageDefinition,
  getLanguage,
} from '@verbaloop/shared';
import {
  Search,
  Check,
  ChevronDown,
  Globe2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface LanguageSelectProps {
  value: SupportedLanguageCode;
  onChange: (code: SupportedLanguageCode) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  showCapabilityNote?: boolean;
}

export const LanguageSelect: React.FC<LanguageSelectProps> = ({
  value,
  onChange,
  label,
  disabled = false,
  className = '',
  showCapabilityNote = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedLang = useMemo(() => getLanguage(value), [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Filter languages based on search query (name, nativeName, script, code)
  const filteredLanguages = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return SUPPORTED_LANGUAGES;
    return SUPPORTED_LANGUAGES.filter(
      (lang) =>
        lang.name.toLowerCase().includes(q) ||
        lang.nativeName.toLowerCase().includes(q) ||
        lang.code.toLowerCase().includes(q) ||
        lang.script.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Group filtered languages
  const scheduledIndian = filteredLanguages.filter((l) => l.group === 'indian_scheduled');
  const additionalIndian = filteredLanguages.filter((l) => l.group === 'indian_additional');
  const international = filteredLanguages.filter((l) => l.group === 'international');

  const handleSelect = (code: SupportedLanguageCode) => {
    onChange(code);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`flex flex-col gap-1.5 relative ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-charcoal-700 tracking-wide uppercase">
            {label}
          </label>
          {selectedLang.direction === 'rtl' && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold uppercase">
              RTL (Right-to-Left)
            </span>
          )}
        </div>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full bg-white border border-charcoal-200 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-charcoal-900 shadow-subtle flex items-center justify-between gap-2 hover:border-accent-teal/60 focus:outline-none focus:ring-2 focus:ring-accent-teal/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
      >
        <div className="flex items-center gap-2.5 truncate">
          <span className="inline-flex items-center justify-center w-7 h-6 rounded-md bg-canvas-subtle border border-charcoal-200 text-xs font-bold font-mono text-charcoal-800 shadow-xs shrink-0 select-none">
            {selectedLang.flag}
          </span>
          <span className="font-bold text-charcoal-900 truncate">
            {selectedLang.name}
          </span>
          <span
            className={`font-semibold text-charcoal-500 font-sans truncate ${
              selectedLang.direction === 'rtl' ? 'font-mono' : ''
            }`}
            dir={selectedLang.direction}
          >
            — {selectedLang.nativeName}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-charcoal-400">
          {!selectedLang.capabilities.speechRecognition && (
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-charcoal-100 text-charcoal-600 hidden sm:inline-flex items-center gap-1"
              title="Voice input unavailable in browser; text mode active"
            >
              <MicOff className="w-3 h-3 text-charcoal-500" />
              <span>Text Only</span>
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-accent-teal' : ''
            }`}
          />
        </div>
      </button>

      {/* Voice Capability Limitation Note */}
      {showCapabilityNote && selectedLang.voiceSupportNote && (
        <div className="p-2 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900 text-[11px] flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-700 mt-0.5" />
          <span>
            <strong>Note for {selectedLang.name}:</strong> {selectedLang.voiceSupportNote}
          </span>
        </div>
      )}

      {/* Dropdown Menu - In-flow expandable so modals scroll naturally without clipping */}
      {isOpen && (
        <div className="mt-2 bg-white border border-charcoal-200 rounded-xl shadow-card overflow-hidden flex flex-col max-h-[260px] animate-in fade-in duration-150">
          {/* Search Header */}
          <div className="p-2.5 bg-canvas-subtle border-b border-charcoal-200 flex items-center gap-2 shrink-0">
            <Search className="w-4 h-4 text-charcoal-400 shrink-0 ml-1" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by language, native script, or code..."
              className="w-full bg-white border border-charcoal-200 rounded-lg px-3 py-1.5 text-xs font-medium text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-accent-teal"
            />
          </div>

          {/* Languages List */}
          <div className="overflow-y-auto p-1.5 space-y-3 flex-1" role="listbox">
            {/* 1. Eighth Schedule Indian Languages Group */}
            {scheduledIndian.length > 0 && (
              <div>
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-charcoal-500 bg-canvas rounded flex items-center justify-between">
                  <span>Eighth Schedule Indian Languages ({scheduledIndian.length})</span>
                  <span className="font-mono text-accent-teal font-bold">22 Official</span>
                </div>
                <div className="mt-1 space-y-0.5">
                  {scheduledIndian.map((lang) => renderOption(lang))}
                </div>
              </div>
            )}

            {/* 2. Additional Official Languages Group */}
            {additionalIndian.length > 0 && (
              <div>
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-charcoal-500 bg-canvas rounded">
                  <span>Additional Official & Bridge Language</span>
                </div>
                <div className="mt-1 space-y-0.5">
                  {additionalIndian.map((lang) => renderOption(lang))}
                </div>
              </div>
            )}

            {/* 3. International Languages Group */}
            {international.length > 0 && (
              <div>
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-charcoal-500 bg-canvas rounded flex items-center justify-between">
                  <span>International Languages ({international.length})</span>
                  <Globe2 className="w-3 h-3 text-accent-electric" />
                </div>
                <div className="mt-1 space-y-0.5">
                  {international.map((lang) => renderOption(lang))}
                </div>
              </div>
            )}

            {filteredLanguages.length === 0 && (
              <div className="p-6 text-center text-xs text-charcoal-500">
                No matching languages found for "{searchQuery}".
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  function renderOption(lang: LanguageDefinition) {
    const isSelected = lang.code === value;
    const hasVoice = lang.capabilities.speechRecognition && lang.capabilities.speechSynthesis;

    return (
      <button
        key={lang.code}
        type="button"
        role="option"
        aria-selected={isSelected}
        onClick={() => handleSelect(lang.code)}
        className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between gap-2 text-xs transition-colors ${
          isSelected
            ? 'bg-accent-tealLight text-charcoal-900 font-bold border border-accent-teal/30'
            : 'hover:bg-canvas text-charcoal-700'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="inline-flex items-center justify-center w-7 h-6 rounded-md bg-canvas-subtle border border-charcoal-200 text-xs font-bold font-mono text-charcoal-800 shadow-xs shrink-0 select-none">
            {lang.flag}
          </span>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-charcoal-900 truncate">
                {lang.name}
              </span>
              <span className="font-mono text-[10px] text-charcoal-400">
                ({lang.code})
              </span>
              {lang.direction === 'rtl' && (
                <span className="text-[9px] font-mono px-1 rounded bg-amber-100 text-amber-800 font-semibold">
                  RTL
                </span>
              )}
            </div>
            <span
              className="text-xs font-medium text-charcoal-500 truncate"
              dir={lang.direction}
            >
              {lang.nativeName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasVoice ? (
            <span
              className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium"
              title="Voice input & audio playback supported"
            >
              <Mic className="w-3 h-3 text-emerald-600" />
              <Volume2 className="w-3 h-3 text-emerald-600" />
            </span>
          ) : (
            <span
              className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-charcoal-100 text-charcoal-500 flex items-center gap-0.5"
              title="Text translation active; speech synthesizer not standardized"
            >
              <MicOff className="w-2.5 h-2.5 text-charcoal-400" />
              <span>Text</span>
            </span>
          )}

          {isSelected && <Check className="w-4 h-4 text-accent-teal shrink-0" />}
        </div>
      </button>
    );
  }
};

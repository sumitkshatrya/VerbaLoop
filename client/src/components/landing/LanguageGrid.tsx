import React, { useState } from 'react';
import {
  SUPPORTED_LANGUAGES,
  LanguageDefinition,
  LanguageGroup,
} from '@verbaloop/shared';
import { Globe, Volume2, Mic, MicOff, Search, Sparkles } from 'lucide-react';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';

export const LanguageGrid: React.FC = () => {
  const { speak } = useSpeechSynthesis();
  const [playingCode, setPlayingCode] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string>('indian_scheduled');
  const [search, setSearch] = useState('');

  const handleTestAudio = (lang: LanguageDefinition) => {
    if (!lang.capabilities.speechSynthesis) return;
    setPlayingCode(lang.code);
    speak(
      lang.sampleGreeting,
      lang.code,
      undefined,
      () => setPlayingCode(null)
    );
  };

  const filteredLanguages = SUPPORTED_LANGUAGES.filter((lang) => {
    const matchesGroup =
      activeGroup === 'all'
        ? true
        : activeGroup === 'indian_scheduled'
        ? lang.group === 'indian_scheduled' || lang.group === 'indian_additional'
        : lang.group === activeGroup;

    const matchesSearch =
      !search ||
      lang.name.toLowerCase().includes(search.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(search.toLowerCase()) ||
      lang.code.toLowerCase().includes(search.toLowerCase());

    return matchesGroup && matchesSearch;
  });

  return (
    <section className="py-20 bg-canvas-subtle border-t border-charcoal-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-wider uppercase text-accent-teal">
            Constitutional & Global Coverage
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
            All 22 Eighth Schedule Indian Languages + Global Reach
          </h2>
          <p className="mt-4 text-base text-charcoal-600 leading-relaxed">
            Every citizen can converse in their mother tongue. Real-time translation preserves
            nuance across India’s linguistic diversity, with honest capability indicators for voice and text modes.
          </p>

          {/* Group Filter Tabs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setActiveGroup('indian_scheduled')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeGroup === 'indian_scheduled'
                  ? 'bg-accent-teal text-white shadow-subtle'
                  : 'bg-white text-charcoal-700 border border-charcoal-200 hover:bg-canvas'
              }`}
            >
              🇮🇳 Eighth Schedule Indian Languages (22) + English
            </button>

            <button
              onClick={() => setActiveGroup('international')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeGroup === 'international'
                  ? 'bg-accent-teal text-white shadow-subtle'
                  : 'bg-white text-charcoal-700 border border-charcoal-200 hover:bg-canvas'
              }`}
            >
              🌐 International Languages (8)
            </button>

            <button
              onClick={() => setActiveGroup('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeGroup === 'all'
                  ? 'bg-accent-teal text-white shadow-subtle'
                  : 'bg-white text-charcoal-700 border border-charcoal-200 hover:bg-canvas'
              }`}
            >
              All Languages ({SUPPORTED_LANGUAGES.length})
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by language name or native script..."
              className="w-full bg-white border border-charcoal-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-charcoal-900 shadow-subtle focus:outline-none focus:ring-2 focus:ring-accent-teal/40"
            />
          </div>
        </div>

        {/* Language Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredLanguages.map((lang: LanguageDefinition) => {
            const isPlaying = playingCode === lang.code;
            const hasVoice =
              lang.capabilities.speechRecognition && lang.capabilities.speechSynthesis;

            return (
              <div
                key={lang.code}
                className="bg-white p-5 rounded-2xl border border-charcoal-200 shadow-subtle hover:border-accent-teal/50 hover:shadow-card transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="font-mono text-xs font-bold text-charcoal-400 uppercase">
                        {lang.code}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {lang.direction === 'rtl' && (
                        <span className="text-[9px] font-mono px-1 rounded bg-amber-100 text-amber-800 font-bold">
                          RTL
                        </span>
                      )}

                      {hasVoice ? (
                        <button
                          onClick={() => handleTestAudio(lang)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isPlaying
                              ? 'bg-accent-teal text-white border-accent-teal'
                              : 'bg-canvas text-charcoal-500 border-charcoal-200 hover:text-charcoal-900 hover:bg-canvas-subtle'
                          }`}
                          title={`Listen to sample greeting in ${lang.name}`}
                          aria-label={`Test voice audio for ${lang.name}`}
                        >
                          <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? 'animate-pulse' : ''}`} />
                        </button>
                      ) : (
                        <span
                          className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-charcoal-100 text-charcoal-500 flex items-center gap-0.5"
                          title="Text mode supported; browser speech synthesis not standardized"
                        >
                          <MicOff className="w-2.5 h-2.5 text-charcoal-400" />
                          <span>Text</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-charcoal-900 group-hover:text-accent-teal transition-colors">
                    {lang.name}
                  </h3>
                  <div
                    className="text-sm font-semibold text-charcoal-600 mt-0.5 font-sans"
                    dir={lang.direction}
                  >
                    {lang.nativeName}
                  </div>
                  <div className="text-[11px] text-charcoal-400 mt-1 font-mono">
                    Script: {lang.script}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-charcoal-100">
                  <p
                    className="text-xs text-charcoal-700 italic line-clamp-2"
                    dir={lang.direction}
                  >
                    "{lang.sampleGreeting}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

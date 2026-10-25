import React, { useState } from 'react';
import { SUPPORTED_LANGUAGES, LanguageDefinition } from '@verbaloop/shared';
import { Globe, Volume2 } from 'lucide-react';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';

export const LanguageGrid: React.FC = () => {
  const { speak } = useSpeechSynthesis();
  const [playingCode, setPlayingCode] = useState<string | null>(null);

  const handleTestAudio = (lang: LanguageDefinition) => {
    setPlayingCode(lang.code);
    speak(
      lang.sampleGreeting,
      lang.code,
      undefined,
      () => setPlayingCode(null)
    );
  };

  return (
    <section className="py-20 bg-canvas-subtle border-t border-charcoal-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-wider uppercase text-accent-teal">
            Global Coverage
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
            Supported languages & real-time voice synthesis
          </h2>
          <p className="mt-4 text-base text-charcoal-600 leading-relaxed">
            Direct bilingual synthesis across major global linguistic families. Click any card to preview native accent pronunciation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {SUPPORTED_LANGUAGES.map((lang: LanguageDefinition) => {
            const isPlaying = playingCode === lang.code;
            return (
              <div
                key={lang.code}
                className="bg-white p-5 rounded-xl border border-charcoal-200 shadow-subtle hover:border-accent-teal/50 hover:shadow-card transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{lang.flag}</span>
                    <button
                      onClick={() => handleTestAudio(lang)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isPlaying
                          ? 'bg-accent-teal text-white border-accent-teal'
                          : 'bg-canvas text-charcoal-500 border-charcoal-200 hover:text-charcoal-900 hover:bg-canvas-subtle'
                      }`}
                      title={`Listen to sample in ${lang.name}`}
                      aria-label={`Test voice audio for ${lang.name}`}
                    >
                      <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-charcoal-900 group-hover:text-accent-teal transition-colors">
                    {lang.name}
                  </h3>
                  <div className="text-sm font-medium text-charcoal-500 font-sans mt-0.5">
                    {lang.nativeName}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-charcoal-100">
                  <p className="text-xs text-charcoal-600 italic line-clamp-2">
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

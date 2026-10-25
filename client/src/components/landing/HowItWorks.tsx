import React from 'react';
import { UserCheck, Mic, ArrowRightLeft, Radio, Shield, Sparkles } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Create or Join with Native Language',
      description:
        'Generate a private room code in one click. Pick your preferred native tongue — whether Hindi, Mandarin, Spanish, French, or English. Test your microphone or toggle text mode.',
      icon: UserCheck,
    },
    {
      step: '02',
      title: 'Speak Naturally Without Pausing for Bots',
      description:
        'Hold Push-to-Talk or speak with live speech recognition. Live partial words stream in real time to your partner while preserving raw emotional inflection and conviction.',
      icon: Mic,
    },
    {
      step: '03',
      title: 'High-Fidelity Tone-Preserved Translation',
      description:
        'VerbaLoop translates directly into your peer’s language without diluting arguments, softening disagreements, or inventing fake politeness. Spoken audio plays immediately.',
      icon: ArrowRightLeft,
    },
    {
      step: '04',
      title: 'Interrupt Freely & Rephrase on the Fly',
      description:
        'Disagreements don’t wait for turns. Press Interrupt or speak to immediately silence your peer’s local audio playback. Correct mistranslations or pause whenever needed.',
      icon: Radio,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-canvas border-t border-charcoal-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-wider uppercase text-accent-teal">
            The Flow
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
            How natural dialogue happens across language divides
          </h2>
          <p className="mt-4 text-base text-charcoal-600 leading-relaxed">
            Engineered from first principles for arguments, quick interjections, and high-stakes
            discussions between real human beings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl border border-charcoal-200 shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black font-mono text-charcoal-200">
                      {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-lg bg-accent-tealLight flex items-center justify-center text-accent-teal">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-charcoal-900 mb-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-charcoal-100 flex items-center text-xs font-semibold text-accent-teal">
                  <span>Engineered for zero latency</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

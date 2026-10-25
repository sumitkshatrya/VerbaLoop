import React from 'react';
import { Lock, Trash2, MicOff, KeyRound, CheckCircle2 } from 'lucide-react';

export const PrivacySection: React.FC = () => {
  const privacyPillars = [
    {
      icon: Trash2,
      title: 'Permanent Conversation Deletion',
      description:
        'Either participant can permanently purge room history, transcripts, and cached translations with a single click. Nothing remains stored in memory or database.',
    },
    {
      icon: MicOff,
      title: 'Zero Persistent Audio Storage',
      description:
        'Voice audio is processed ephemerally for speech recognition and immediately released from memory. We do not store raw audio recordings or voiceprints.',
    },
    {
      icon: Lock,
      title: 'Encrypted in Transit (WSS/TLS)',
      description:
        'All WebSocket traffic, REST payloads, and speech streams are transmitted over TLS/WSS. We do not claim client-to-client E2EE because server-side AI translation is required.',
    },
    {
      icon: KeyRound,
      title: 'Ephemeral Scoped Access',
      description:
        'Rooms are strictly private and accessible only with a valid 6-character room code. Rooms automatically expire when concluded, and third parties cannot eavesdrop.',
    },
  ];

  return (
    <section id="privacy" className="py-20 bg-canvas border-t border-charcoal-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-wider uppercase text-emerald-700">
            Trust & Integrity
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
            Transparent privacy & honest architecture
          </h2>
          <p className="mt-4 text-base text-charcoal-600 leading-relaxed">
            We don’t make unverifiable security claims. Here is exactly how your data, speech,
            and arguments are handled.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {privacyPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl border border-charcoal-200 shadow-subtle flex gap-4 items-start"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-charcoal-900 mb-1.5">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed">
                    {pillar.description}
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


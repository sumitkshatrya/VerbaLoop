import React from 'react';
import { Radio, Zap, VolumeX, ShieldCheck, ArrowRight, CornerRightDown } from 'lucide-react';

export const InterruptionShowcase: React.FC = () => {
  return (
    <section id="interruption" className="py-20 bg-canvas border-t border-charcoal-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-wider uppercase text-accent-coral">
            Core Architectural Requirement
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
            Real Interruption Handling. Not a decorative button.
          </h2>
          <p className="mt-4 text-base text-charcoal-600 leading-relaxed">
            In genuine human disagreements, people do not wait politely for robotic 30-second speech synthesis
            to finish playing before reacting.
          </p>
        </div>

        {/* State Machine Flow Diagram Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Stage 1 */}
          <div className="bg-white p-6 rounded-xl border border-charcoal-200 shadow-subtle relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-accent-teal animate-ping" />
              <span className="text-xs font-mono font-bold text-accent-teal uppercase">
                Step 1: Active Turn
              </span>
            </div>
            <h3 className="text-base font-bold text-charcoal-900 mb-2">
              Speaker A speaks in Hindi
            </h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Interim partials stream in real time. Backend translates into Mandarin and starts audio
              synthesis on Speaker B’s device. Turn status: <code className="text-xs bg-canvas px-1 py-0.5 rounded font-mono">playing</code>.
            </p>
          </div>

          {/* Stage 2 */}
          <div className="bg-white p-6 rounded-xl border-2 border-accent-coral shadow-card relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-accent-coral animate-pulse" />
              <span className="text-xs font-mono font-bold text-accent-coral uppercase">
                Step 2: Interruption Trigger
              </span>
            </div>
            <h3 className="text-base font-bold text-charcoal-900 mb-2 flex items-center gap-1.5">
              <VolumeX className="w-4 h-4 text-accent-coral" />
              Speaker B interrupts
            </h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              B taps Interrupt or begins speaking. Socket.IO immediately broadcasts <code className="text-xs bg-canvas px-1 py-0.5 rounded font-mono">turn:interrupt</code>.
              Audio synthesis halts instantly via Web Speech cancel.
            </p>
          </div>

          {/* Stage 3 */}
          <div className="bg-white p-6 rounded-xl border border-charcoal-200 shadow-subtle relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-accent-electric" />
              <span className="text-xs font-mono font-bold text-accent-electric uppercase">
                Step 3: Floor Transfer
              </span>
            </div>
            <h3 className="text-base font-bold text-charcoal-900 mb-2">
              Floor Priority to Speaker B
            </h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Stale in-flight translation jobs from Turn 1 are purged. Partial transcript is preserved
              with an interrupted marker, and Speaker B is granted immediate floor access.
            </p>
          </div>
        </div>

        {/* Deep Dive Engineering Banner */}
        <div className="bg-charcoal-900 text-canvas-light p-6 sm:p-8 rounded-2xl shadow-elevated">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-accent-teal" />
                <h4 className="text-base font-bold text-white tracking-wide">
                  Lifecycle Invariants Enforced by VerbaLoop Turn Manager
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-charcoal-300 leading-relaxed max-w-3xl">
                Every conversation turn possesses an immutable turn ID. Whenever an interruption is emitted,
                the backend updates the persistent room record to <span className="text-accent-coral font-mono font-semibold">interrupted</span>, drops subsequent synthesis chunks, and synchronizes both browsers without race conditions or ghost transcripts.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-lg bg-charcoal-800 border border-charcoal-700 text-xs font-mono text-accent-teal font-semibold">
                TurnState = interrupted
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


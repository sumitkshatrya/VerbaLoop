import React from 'react';
import { Check, X, ShieldAlert, Sparkles, Scale } from 'lucide-react';

export const ComparisonSection: React.FC = () => {
  return (
    <section className="py-20 bg-canvas-subtle border-t border-charcoal-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-wider uppercase text-accent-electric">
            Why Generic AI Translation Fails at Debates
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
            Original words & translations side-by-side
          </h2>
          <p className="mt-4 text-base text-charcoal-600 leading-relaxed">
            Standard translation tools sanitize conflict, hallucinate agreeable conclusions, or
            make hesitant statements sound artificially confident. VerbaLoop preserves the exact emotional weight.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* What traditional translation tools do */}
          <div className="bg-white p-8 rounded-2xl border border-rose-200 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                  Standard Translation Apps & Chatbots
                </span>
                <X className="w-5 h-5 text-rose-600" />
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-rose-50/50 border border-rose-100">
                  <div className="text-xs font-semibold text-rose-800 mb-1">
                    Input: "You are entirely ignoring the customer feedback."
                  </div>
                  <div className="text-sm text-charcoal-700 italic">
                    Output: "Perhaps customer feedback could be reviewed further." (Conflict diluted)
                  </div>
                </div>

                <ul className="space-y-3 text-sm text-charcoal-600 mt-6">
                  <li className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>Rigid walkie-talkie turns where you cannot interrupt rambling.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>Hides the original text, leaving you blind to possible mistranslations.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>Silently replaces emotional disagreements with sterile pleasantries.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>Fake AI participants simulating synthetic conversations.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-rose-100 text-xs text-rose-800 font-medium">
              Result: Miscommunication escalates; participants feel unheard.
            </div>
          </div>

          {/* How VerbaLoop solves it */}
          <div className="bg-white p-8 rounded-2xl border border-accent-teal/40 shadow-card flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-teal/5 rounded-bl-full pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-accent-teal bg-accent-tealLight px-3 py-1 rounded-full border border-accent-teal/30">
                  VerbaLoop Real-Time Protocol
                </span>
                <Check className="w-5 h-5 text-accent-teal" />
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-accent-tealLight/50 border border-accent-teal/20">
                  <div className="text-xs font-semibold text-accent-teal mb-1">
                    Input: "You are entirely ignoring the customer feedback."
                  </div>
                  <div className="text-sm font-semibold text-charcoal-900">
                    Output: Exact direct translation preserving accusation, urgency, and tone.
                  </div>
                </div>

                <ul className="space-y-3 text-sm text-charcoal-700 mt-6">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-accent-teal shrink-0 mt-0.5" />
                    <span><strong>Instant Interruption:</strong> Halts remote speech audio within 100ms.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-accent-teal shrink-0 mt-0.5" />
                    <span><strong>Side-by-Side Dual Display:</strong> Inspect original speech alongside translation.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-accent-teal shrink-0 mt-0.5" />
                    <span><strong>Live Rephrase & Correction:</strong> Fix misunderstandings before arguments derail.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-accent-teal shrink-0 mt-0.5" />
                    <span><strong>100% Real Human-to-Human:</strong> Both participants are authentic users.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-accent-teal/20 text-xs text-accent-teal font-semibold">
              Result: Real consensus, authentic disagreement, and mutual comprehension.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

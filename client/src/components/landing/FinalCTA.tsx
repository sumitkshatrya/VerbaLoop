import React from 'react';
import { ArrowRight, Sparkles, MessageSquarePlus } from 'lucide-react';

interface FinalCTAProps {
  onStartArgument: () => void;
  onTryDemo: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({
  onStartArgument,
  onTryDemo,
}) => {
  return (
    <section className="py-20 bg-charcoal-900 text-canvas-light relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent-teal">
          Ready for real conversation?
        </span>

        <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Test your disagreement across languages now.
        </h2>

        <p className="mt-4 text-base sm:text-lg text-charcoal-300 max-w-2xl mx-auto leading-relaxed">
          No credit card, no registration wall, and no simulated bots. Connect with a real human speaking another tongue in seconds.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStartArgument}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-bold text-white bg-accent-teal hover:bg-accent-tealHover rounded-xl shadow-lg transition-all duration-200 group"
          >
            <MessageSquarePlus className="w-5 h-5" />
            <span>Create a room</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={onTryDemo}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-bold text-white bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 rounded-xl transition-all duration-200"
          >
            <Sparkles className="w-5 h-5 text-accent-electric" />
            <span>Try the interactive demo</span>
          </button>
        </div>
      </div>
    </section>
  );
};

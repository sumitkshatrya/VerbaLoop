import React from 'react';
import { ArrowRight, Sparkles, MessageSquare, Volume2, ShieldAlert } from 'lucide-react';
import { InteractiveDemoPreview } from './InteractiveDemoPreview';

interface HeroSectionProps {
  onStartArgument: () => void;
  onTryDemo: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartArgument,
  onTryDemo,
}) => {
  return (
    <section className="relative pt-12 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-tealLight border border-accent-teal/20 text-accent-teal text-xs font-semibold uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-accent-teal animate-pulse" />
            <span>Different languages. One conversation.</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-charcoal-900 tracking-tight leading-[1.12]">
            Disagree freely.{' '}
            <span className="text-accent-teal underline decoration-accent-teal/30 underline-offset-8">
              Language isn't a barrier.
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="mt-6 text-lg sm:text-xl text-charcoal-700 leading-relaxed max-w-2xl mx-auto font-normal">
            Two real people speaking completely different languages holding an authentic,
            unfiltered conversation. Interrupt mid-sentence, clarify misunderstandings in real time,
            and view the original words alongside high-fidelity translations.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={onStartArgument}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-accent-teal hover:bg-accent-tealHover rounded-xl shadow-card hover:shadow-elevated transition-all duration-200 group"
            >
              <span>Start an argument</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={onTryDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-charcoal-800 bg-white hover:bg-canvas-subtle border border-charcoal-200 rounded-xl shadow-subtle transition-all duration-200"
            >
              <Sparkles className="w-4 h-4 text-accent-electric" />
              <span>Try the demo</span>
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-charcoal-500 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-teal" />
              Real human-to-human
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-electric" />
              Instant playback cancellation
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Bilingual summary
            </span>
          </div>
        </div>

        {/* Realistic Interactive Conversation Preview */}
        <div className="mt-14 max-w-4xl mx-auto">
          <InteractiveDemoPreview onOpenDemo={onTryDemo} />
        </div>
      </div>
    </section>
  );
};

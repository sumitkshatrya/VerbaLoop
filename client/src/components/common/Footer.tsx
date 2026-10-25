import React from 'react';
import { Logo } from './Logo';
import { Shield, Globe2, Activity } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-canvas-subtle border-t border-charcoal-200/80 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <Logo size="md" showTagline={true} />
          <p className="text-xs text-charcoal-500 mt-2 max-w-md leading-relaxed">
            Engineered for real-time multilingual disagreements, interruptions, and authentic human dialogue.
            No automated bots posing as participants.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-charcoal-500">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-accent-teal" />
            <span>Ephemeral Rooms • Zero Audio Storage</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Globe2 className="w-4 h-4 text-accent-electric" />
            <span>10 Supported Global Languages</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Sub-second Interruption Cancellation</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-charcoal-200 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-charcoal-400 gap-4">
        <p>© {new Date().getFullYear()} VerbaLoop Platform. Different languages. One conversation.</p>
        <div className="flex items-center gap-4">
          <a href="#how-it-works" className="hover:text-charcoal-700 transition-colors">How it Works</a>
          <a href="#interruption" className="hover:text-charcoal-700 transition-colors">Interruption Protocol</a>
          <a href="#privacy" className="hover:text-charcoal-700 transition-colors">Privacy Principles</a>
        </div>
      </div>
    </footer>
  );
};

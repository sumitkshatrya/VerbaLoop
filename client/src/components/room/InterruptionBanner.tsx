import React, { useEffect, useState } from 'react';
import { InterruptionEvent } from '../../hooks/useSocket';
import { VolumeX, X } from 'lucide-react';

interface InterruptionBannerProps {
  lastInterruption: InterruptionEvent | null;
}

export const InterruptionBanner: React.FC<InterruptionBannerProps> = ({
  lastInterruption,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (lastInterruption) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [lastInterruption]);

  if (!visible || !lastInterruption) return null;

  return (
    <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 flex items-center justify-between text-xs text-rose-900 animate-in slide-in-from-top duration-200">
      <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1">
        <div className="w-5 h-5 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center shrink-0">
          <VolumeX className="w-3 h-3" />
        </div>
        <div>
          <span className="font-bold">Interruption triggered.</span> Local speech playback was immediately cancelled.
        </div>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="text-rose-500 hover:text-rose-800 p-1"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};


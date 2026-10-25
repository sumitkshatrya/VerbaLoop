import React from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
  type?: 'speaking' | 'listening' | 'idle';
  className?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isActive,
  type = 'speaking',
  className = '',
}) => {
  const barColors = {
    speaking: 'bg-accent-teal',
    listening: 'bg-accent-electric',
    idle: 'bg-charcoal-300',
  };

  const currentColor = barColors[isActive ? type : 'idle'];

  return (
    <div
      className={`flex items-center gap-1 h-5 px-1 ${className}`}
      aria-label={isActive ? `${type} audio visualizer active` : 'audio idle'}
    >
      <span
        className={`w-1 h-2 rounded-full transition-all duration-150 ${currentColor} ${
          isActive ? 'animate-audio-bar-1 h-4' : 'h-1.5'
        }`}
      />
      <span
        className={`w-1 h-3 rounded-full transition-all duration-150 ${currentColor} ${
          isActive ? 'animate-audio-bar-2 h-5' : 'h-2'
        }`}
      />
      <span
        className={`w-1 h-4 rounded-full transition-all duration-150 ${currentColor} ${
          isActive ? 'animate-audio-bar-3 h-5' : 'h-3'
        }`}
      />
      <span
        className={`w-1 h-3 rounded-full transition-all duration-150 ${currentColor} ${
          isActive ? 'animate-audio-bar-4 h-4' : 'h-2'
        }`}
      />
      <span
        className={`w-1 h-1.5 rounded-full transition-all duration-150 ${currentColor} ${
          isActive ? 'animate-audio-bar-5 h-3' : 'h-1.5'
        }`}
      />
    </div>
  );
};


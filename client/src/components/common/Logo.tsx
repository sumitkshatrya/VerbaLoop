import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Speech-Loop Interlocking Logo */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform transition-transform hover:scale-105 duration-200"
          aria-label="VerbaLoop Speech Loop Logo"
        >
          {/* Primary Loop (Teal Accent) */}
          <path
            d="M8 15C8 10.0294 12.0294 6 17 6C21.9706 6 26 10.0294 26 15C26 16.5866 25.5901 18.0776 24.8722 19.375L26.5 24L21.75 22.8C20.3478 23.56 18.7297 24 17 24C12.0294 24 8 19.9706 8 15Z"
            fill="#0D9488"
            fillOpacity="0.18"
            stroke="#0D9488"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Intersecting Counter Loop (Charcoal / Electric) */}
          <path
            d="M13 21C13 18.5 15.0147 16 19 16C22.9853 16 27 18.5 27 22.5C27 26.5 22.9853 29 19 29C17.3972 29 15.9189 28.5397 14.6738 27.75L10.5 28.75L11.75 24.7C12.25 23.5 13 22.2 13 21Z"
            stroke="#191E24"
            strokeWidth="2.2"
            strokeLinejoin="round"
            strokeDasharray="0.5 1"
          />
          {/* Real-time convergence node */}
          <circle cx="19" cy="18" r="2.2" fill="#0284C7" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-bold tracking-tight text-charcoal-900 ${textSizes[size]}`}>
            Verba<span className="text-accent-teal">Loop</span>
          </span>
        </div>
        {showTagline && (
          <span className="text-xs text-charcoal-500 font-medium tracking-normal mt-0.5">
            Different languages. One conversation.
          </span>
        )}
      </div>
    </div>
  );
};


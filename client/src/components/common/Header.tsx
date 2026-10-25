import React from 'react';
import { Logo } from './Logo';
import { Wifi, WifiOff, Sparkles, MessageSquarePlus, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  onOpenDemo: () => void;
  onOpenCreateRoom: () => void;
  onOpenJoinRoom: () => void;
  inRoom?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isConnected,
  onOpenDemo,
  onOpenCreateRoom,
  onOpenJoinRoom,
  inRoom = false,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-canvas/90 backdrop-blur-md border-b border-charcoal-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <a href="#" className="flex items-center gap-2 group">
            <Logo size="md" showTagline={false} />
          </a>

          {/* Real-time Connection Status Badge */}
          <div
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isConnected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
            title={isConnected ? 'Real-time WebSocket connected' : 'Connecting to communication layer...'}
          >
            {isConnected ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Socket</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Connecting...</span>
              </>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {!inRoom && (
            <>
              <button
                onClick={onOpenDemo}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-charcoal-700 bg-white hover:bg-canvas-subtle border border-charcoal-200 rounded-lg shadow-subtle transition-all duration-150"
              >
                <Sparkles className="w-4 h-4 text-accent-electric" />
                <span>Try Demo</span>
              </button>

              <button
                onClick={onOpenJoinRoom}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-charcoal-700 hover:text-charcoal-900 transition-colors"
              >
                Join Room
              </button>

              <button
                onClick={onOpenCreateRoom}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-accent-teal hover:bg-accent-tealHover rounded-lg shadow-subtle hover:shadow transition-all duration-150"
              >
                <MessageSquarePlus className="w-4 h-4" />
                <span>Create Room</span>
              </button>
            </>
          )}

          {inRoom && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-charcoal-500 bg-charcoal-100 px-2.5 py-1 rounded-md">
                <ShieldCheck className="w-3.5 h-3.5 text-accent-teal" />
                Private Session
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from './hooks/useSocket';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HeroSection } from './components/landing/HeroSection';
import { HowItWorks } from './components/landing/HowItWorks';
import { ComparisonSection } from './components/landing/ComparisonSection';
import { InterruptionShowcase } from './components/landing/InterruptionShowcase';
import { LanguageGrid } from './components/landing/LanguageGrid';
import { PrivacySection } from './components/landing/PrivacySection';
import { FinalCTA } from './components/landing/FinalCTA';
import { CreateRoomModal } from './components/room/CreateRoomModal';
import { JoinRoomModal } from './components/room/JoinRoomModal';
import { RoomHeader } from './components/room/RoomHeader';
import { ParticipantPanel } from './components/room/ParticipantPanel';
import { ConversationTranscript } from './components/room/ConversationTranscript';
import { TurnControls } from './components/room/TurnControls';
import { InterruptionBanner } from './components/room/InterruptionBanner';
import { CorrectionModal } from './components/room/CorrectionModal';
import { EndSummaryModal } from './components/room/EndSummaryModal';
import { DemoRoom } from './components/demo/DemoRoom';
import { TurnMessage, SupportedLanguageCode } from '@verbaloop/shared';

export function App() {
  const {
    isConnected,
    roomState,
    currentParticipant,
    streamingTurn,
    error,
    lastInterruption,
    lastCompletedTurn,
    remotePlayingAudioId,
    createRoom,
    joinRoom,
    setReady,
    startTurn,
    sendPartial,
    completeTurn,
    interruptTurn,
    cancelTurn,
    correctTurn,
    notifyPlaybackStart,
    notifyPlaybackStop,
    pauseConversation,
    resumeConversation,
    endConversation,
    deleteConversation,
    leaveRoom,
  } = useSocket();

  const { speak, cancel: cancelAudioPlayback, isPlaying: isAudioPlaying } =
    useSpeechSynthesis();

  // App Views: 'landing' | 'demo' | 'room'
  const [view, setView] = useState<'landing' | 'demo' | 'room'>('landing');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedCorrectionTurn, setSelectedCorrectionTurn] =
    useState<TurnMessage | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Active turn ID being spoken by current user
  const [activeVoiceTurnId, setActiveVoiceTurnId] = useState<string | null>(null);

  // Auto-switch to 'room' view if roomState is populated
  useEffect(() => {
    if (roomState && currentParticipant) {
      setView('room');
    }
  }, [roomState, currentParticipant]);

  // Check URL query param for room invitation code (e.g. ?room=LOOP-7X9K)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam && !roomState) {
      setIsJoinModalOpen(true);
    }
  }, [roomState]);

  // When an interruption event arrives from peer or server: IMMEDIATELY halt local audio playback!
  useEffect(() => {
    if (lastInterruption) {
      cancelAudioPlayback();
    }
  }, [lastInterruption, cancelAudioPlayback]);

  // When room summary becomes available, automatically open summary modal
  useEffect(() => {
    if (roomState?.summary) {
      setShowSummaryModal(true);
    }
  }, [roomState?.summary]);

  // Speech Recognition hook for current user
  const userLanguage = currentParticipant?.language || 'en';

  const handleSpeechPartial = useCallback(
    (text: string) => {
      if (activeVoiceTurnId) {
        sendPartial(activeVoiceTurnId, text);
      }
    },
    [activeVoiceTurnId, sendPartial]
  );

  const handleSpeechFinal = useCallback(
    (finalText: string) => {
      if (activeVoiceTurnId && finalText.trim()) {
        completeTurn(activeVoiceTurnId, finalText.trim());
        setActiveVoiceTurnId(null);
      }
    },
    [activeVoiceTurnId, completeTurn]
  );

  const {
    isListening,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    language: userLanguage,
    onPartial: handleSpeechPartial,
    onFinal: handleSpeechFinal,
  });

  // Handle Voice Turn Start
  const handleStartVoiceTurn = () => {
    if (!roomState || !currentParticipant) return;
    const newTurnId = 'turn_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    setActiveVoiceTurnId(newTurnId);
    startTurn(newTurnId, 'voice');
    startListening();
  };

  // Handle Voice Turn Stop
  const handleStopVoiceTurn = () => {
    const text = stopListening();
    if (activeVoiceTurnId) {
      if (text && text.trim()) {
        completeTurn(activeVoiceTurnId, text.trim());
      } else {
        cancelTurn(activeVoiceTurnId, 'No speech detected');
      }
      setActiveVoiceTurnId(null);
    }
  };

  // Handle Typed Message
  const handleSendTextMessage = (text: string) => {
    if (!roomState || !currentParticipant || !text.trim()) return;
    const newTurnId = 'turn_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    startTurn(newTurnId, 'text');
    completeTurn(newTurnId, text.trim());
  };

  // Handle Interruption
  const handleInterrupt = () => {
    cancelAudioPlayback();
    if (activeVoiceTurnId) {
      stopListening();
      cancelTurn(activeVoiceTurnId, 'Interrupted self');
      setActiveVoiceTurnId(null);
    }

    if (roomState?.activeTurnId) {
      interruptTurn(roomState.activeTurnId, 'Interrupted by participant');
    }
  };

  // When receiving completed turn from peer, immediately trigger speech synthesis
  const playedTurnIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!lastCompletedTurn || !currentParticipant) return;
    if (
      lastCompletedTurn.speakerId !== currentParticipant.id &&
      lastCompletedTurn.translatedText &&
      !lastCompletedTurn.isInterrupted &&
      !playedTurnIdsRef.current.has(lastCompletedTurn.turnId)
    ) {
      playedTurnIdsRef.current.add(lastCompletedTurn.turnId);
      notifyPlaybackStart(lastCompletedTurn.turnId);

      speak(
        lastCompletedTurn.translatedText,
        lastCompletedTurn.targetLanguage,
        undefined,
        () => notifyPlaybackStop(lastCompletedTurn.turnId)
      );
    }
  }, [lastCompletedTurn, currentParticipant, speak, notifyPlaybackStart, notifyPlaybackStop]);

  // Peer participant
  const peerParticipant =
    roomState?.participants.find((p) => p.id !== currentParticipant?.id) || null;

  // Active turn object
  const activeTurn =
    roomState?.turns.find((t) => t.turnId === roomState.activeTurnId) || streamingTurn;

  // 1. DEMO VIEW
  if (view === 'demo') {
    return <DemoRoom onExitDemo={() => setView('landing')} />;
  }

  // 2. LIVE ARGUMENT ROOM VIEW
  if (view === 'room' && roomState && currentParticipant) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col">
        <RoomHeader
          room={roomState}
          currentParticipant={currentParticipant}
          onPause={() => pauseConversation('I need a moment to think')}
          onResume={resumeConversation}
          onEnd={endConversation}
          onDelete={deleteConversation}
          onLeave={() => {
            leaveRoom();
            setView('landing');
          }}
        />

        <InterruptionBanner lastInterruption={lastInterruption} />

        {/* Dual Participant Panels */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ParticipantPanel
              participant={currentParticipant}
              isCurrentUser={true}
              activeTurn={activeTurn}
              isAudioPlaying={isAudioPlaying}
            />
            <ParticipantPanel
              participant={peerParticipant}
              isCurrentUser={false}
              activeTurn={activeTurn}
              isAudioPlaying={Boolean(peerParticipant && remotePlayingAudioId === peerParticipant.id)}
            />
          </div>
        </div>

        {/* Conversation Transcript Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full flex-1 flex flex-col">
          <div className="bg-white rounded-2xl border border-charcoal-200 shadow-subtle flex-1 flex flex-col overflow-hidden min-h-[400px]">
            <ConversationTranscript
              turns={roomState.turns}
              currentParticipant={currentParticipant}
              streamingTurn={streamingTurn}
              onOpenCorrection={(turn) => setSelectedCorrectionTurn(turn)}
              onReplayAudio={(text, lang) =>
                speak(text, lang as SupportedLanguageCode)
              }
            />

            {/* Turn Control Bar */}
            <TurnControls
              currentParticipant={currentParticipant}
              isRoomActive={roomState.status === 'active' || roomState.status === 'ready'}
              isPaused={roomState.status === 'paused'}
              activeTurn={activeTurn}
              isListening={isListening}
              isAudioPlaying={isAudioPlaying}
              onStartVoiceTurn={handleStartVoiceTurn}
              onStopVoiceTurn={handleStopVoiceTurn}
              onSendTextMessage={handleSendTextMessage}
              onInterrupt={handleInterrupt}
              onPause={() => pauseConversation('I need a moment')}
              onResume={resumeConversation}
            />
          </div>
        </div>

        {/* Correction Modal */}
        <CorrectionModal
          turn={selectedCorrectionTurn}
          isOpen={Boolean(selectedCorrectionTurn)}
          onClose={() => setSelectedCorrectionTurn(null)}
          onSubmitCorrection={(turnId, text) => correctTurn(turnId, text)}
        />

        {/* End-of-Conversation Summary Modal */}
        {roomState.summary && (
          <EndSummaryModal
            isOpen={showSummaryModal}
            onClose={() => setShowSummaryModal(false)}
            room={roomState}
            summary={roomState.summary}
            onDeleteConversation={() => {
              deleteConversation();
              setShowSummaryModal(false);
              setView('landing');
            }}
          />
        )}
      </div>
    );
  }

  // 3. LANDING PAGE VIEW
  return (
    <div className="min-h-screen bg-canvas flex flex-col selection:bg-accent-tealLight selection:text-accent-teal">
      <Header
        isConnected={isConnected}
        onOpenDemo={() => setView('demo')}
        onOpenCreateRoom={() => setIsCreateModalOpen(true)}
        onOpenJoinRoom={() => setIsJoinModalOpen(true)}
      />

      <main className="flex-1">
        <HeroSection
          onStartArgument={() => setIsCreateModalOpen(true)}
          onTryDemo={() => setView('demo')}
        />

        <HowItWorks />

        <ComparisonSection />

        <InterruptionShowcase />

        <LanguageGrid />

        <PrivacySection />

        <FinalCTA
          onStartArgument={() => setIsCreateModalOpen(true)}
          onTryDemo={() => setView('demo')}
        />
      </main>

      <Footer />

      {/* Room Modals */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateRoom={async (name, lang, topic) => {
          await createRoom(name, lang, topic);
          setView('room');
        }}
      />

      <JoinRoomModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoinRoom={async (code, name, lang) => {
          await joinRoom(code, name, lang);
          setView('room');
        }}
      />
    </div>
  );
}
export default App;

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Logo } from '../src/components/common/Logo';
import { LanguageSelect } from '../src/components/common/LanguageSelect';
import { TurnControls } from '../src/components/room/TurnControls';
import { DemoRoom } from '../src/components/demo/DemoRoom';
import { Participant } from '@verbaloop/shared';

describe('Frontend UI Components', () => {
  it('renders Logo with brand name and tagline', () => {
    render(<Logo showTagline={true} />);
    expect(screen.getByText(/Verba/i)).toBeInTheDocument();
    expect(screen.getByText(/Loop/i)).toBeInTheDocument();
    expect(screen.getByText(/Different languages. One conversation./i)).toBeInTheDocument();
  });

  it('renders LanguageSelect with supported languages', () => {
    const handleChange = vi.fn();
    render(
      <LanguageSelect
        value="hi"
        onChange={handleChange}
        label="Select Language"
      />
    );
    expect(screen.getByText('Select Language')).toBeInTheDocument();
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('hi');
    expect(screen.getByText(/हिन्दी/i)).toBeInTheDocument();
    expect(screen.getByText(/Mandarin Chinese/i)).toBeInTheDocument();
  });

  it('renders TurnControls and handles Interruption button states', () => {
    const mockParticipant: Participant = {
      id: 'p1',
      name: 'Arjun',
      language: 'hi',
      isHost: true,
      isReady: true,
      isAudioReady: true,
      socketId: 'sock_1',
      joinedAt: Date.now(),
    };

    const handleInterrupt = vi.fn();

    const { rerender } = render(
      <TurnControls
        currentParticipant={mockParticipant}
        isRoomActive={true}
        isPaused={false}
        activeTurn={null}
        isListening={false}
        isAudioPlaying={false}
        onStartVoiceTurn={() => {}}
        onStopVoiceTurn={() => {}}
        onSendTextMessage={() => {}}
        onInterrupt={handleInterrupt}
        onPause={() => {}}
        onResume={() => {}}
      />
    );

    // When idle, interrupt button is disabled
    const interruptBtn = screen.getByRole('button', { name: /interrupt current turn/i });
    expect(interruptBtn).toBeDisabled();

    // When audio is playing, interrupt button becomes active
    rerender(
      <TurnControls
        currentParticipant={mockParticipant}
        isRoomActive={true}
        isPaused={false}
        activeTurn={null}
        isListening={false}
        isAudioPlaying={true}
        onStartVoiceTurn={() => {}}
        onStopVoiceTurn={() => {}}
        onSendTextMessage={() => {}}
        onInterrupt={handleInterrupt}
        onPause={() => {}}
        onResume={() => {}}
      />
    );

    expect(interruptBtn).not.toBeDisabled();
    fireEvent.click(interruptBtn);
    expect(handleInterrupt).toHaveBeenCalledTimes(1);
  });

  it('renders DemoRoom with DEMO MODE badge and navigates steps', () => {
    const handleExit = vi.fn();
    render(<DemoRoom onExitDemo={handleExit} />);

    expect(screen.getByText('DEMO MODE')).toBeInTheDocument();
    expect(screen.getAllByText(/Arjun/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Mei/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Next Scenario Step/i)).toBeInTheDocument();

    const nextBtn = screen.getByText(/Next Scenario Step/i);
    fireEvent.click(nextBtn);

    // Moves to step 2
    expect(screen.getByText(/Step 2 of 6/i)).toBeInTheDocument();
  });
});

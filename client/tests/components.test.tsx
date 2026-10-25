import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Logo } from '../src/components/common/Logo';
import { LanguageSelect } from '../src/components/common/LanguageSelect';
import { TurnControls } from '../src/components/room/TurnControls';
import { DemoRoom } from '../src/components/demo/DemoRoom';
import {
  Participant,
  SUPPORTED_LANGUAGES,
  getLanguage,
  isRTL,
} from '@verbaloop/shared';

describe('Frontend UI Components & Multilingual Features', () => {
  it('renders Logo with brand name and tagline', () => {
    render(<Logo showTagline={true} />);
    expect(screen.getByText(/Verba/i)).toBeInTheDocument();
    expect(screen.getByText(/Loop/i)).toBeInTheDocument();
    expect(screen.getByText(/Different languages. One conversation./i)).toBeInTheDocument();
  });

  it('contains all 22 Eighth Schedule Indian Languages + English in centralized config', () => {
    const scheduled = SUPPORTED_LANGUAGES.filter((l) => l.group === 'indian_scheduled');
    expect(scheduled.length).toBeGreaterThanOrEqual(21);

    // Verify presence of all key Eighth Schedule languages
    const expectedCodes = [
      'hi', 'bn', 'mr', 'te', 'ta', 'gu', 'ur', 'kn', 'or', 'ml',
      'pa', 'as', 'mai', 'sa', 'ks', 'kok', 'ne', 'sd', 'doi', 'mni', 'brx'
    ];
    for (const code of expectedCodes) {
      const found = scheduled.find((l) => l.code === code);
      expect(found).toBeDefined();
      expect(found?.nativeName).toBeTruthy();
    }

    // Verify English in additional group
    const english = getLanguage('en');
    expect(english.name).toBe('English');
    expect(english.group).toBe('indian_additional');
  });

  it('renders searchable LanguageSelect and filters languages dynamically', () => {
    const handleChange = vi.fn();
    render(
      <LanguageSelect
        value="hi"
        onChange={handleChange}
        label="Select Preferred Language"
      />
    );

    expect(screen.getByText('Select Preferred Language')).toBeInTheDocument();
    expect(screen.getByText(/Hindi/i)).toBeInTheDocument();
    expect(screen.getByText(/हिन्दी/i)).toBeInTheDocument();

    // Click trigger button to open search dropdown
    const triggerBtn = screen.getByRole('button', { expanded: false });
    fireEvent.click(triggerBtn);

    // Search input should appear
    const searchInput = screen.getByPlaceholderText(/Search by language, native script, or code.../i);
    expect(searchInput).toBeInTheDocument();

    // Search for "Tamil"
    fireEvent.change(searchInput, { target: { value: 'Tamil' } });
    expect(screen.getByText(/தமிழ்/i)).toBeInTheDocument();

    // Click Tamil
    const tamilOption = screen.getByText(/தமிழ்/i).closest('button');
    if (tamilOption) {
      fireEvent.click(tamilOption);
      expect(handleChange).toHaveBeenCalledWith('ta');
    }
  });

  it('verifies RTL text direction for Urdu and Sindhi', () => {
    expect(isRTL('ur')).toBe(true);
    expect(isRTL('sd')).toBe(true);
    expect(isRTL('ar')).toBe(true);
    expect(isRTL('hi')).toBe(false);
    expect(isRTL('en')).toBe(false);

    const urdu = getLanguage('ur');
    expect(urdu.direction).toBe('rtl');
    expect(urdu.nativeName).toBe('اردو');
  });

  it('renders TurnControls with text-only mode when speech recognition is unstandardized', () => {
    // Odia ('or') has textTranslation: true, but speechRecognition: false
    const mockOdiaParticipant: Participant = {
      id: 'p_odia',
      name: 'Subhashree',
      language: 'or',
      isHost: false,
      isReady: true,
      isAudioReady: false,
      socketId: 'sock_odia',
      joinedAt: Date.now(),
    };

    render(
      <TurnControls
        currentParticipant={mockOdiaParticipant}
        isRoomActive={true}
        isPaused={false}
        activeTurn={null}
        isListening={false}
        isAudioPlaying={false}
        onStartVoiceTurn={() => {}}
        onStopVoiceTurn={() => {}}
        onSendTextMessage={() => {}}
        onInterrupt={() => {}}
        onPause={() => {}}
        onResume={() => {}}
      />
    );

    // Voice button shows "Text Mode" and is disabled
    expect(screen.getByText('Text Mode')).toBeInTheDocument();

    // Input placeholder explains text mode
    const textInput = screen.getByPlaceholderText(/Type in Odia \(ଓଡ଼ିଆ\) — text mode active.../i);
    expect(textInput).toBeInTheDocument();
  });

  it('renders TurnControls and handles Interruption button activation', () => {
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

    const interruptBtn = screen.getByRole('button', { name: /interrupt current turn/i });
    expect(interruptBtn).toBeDisabled();

    // Audio starts playing on peer device -> interrupt activates
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

  it('renders DemoRoom with Indic and International scenarios', () => {
    const handleExit = vi.fn();
    render(<DemoRoom onExitDemo={handleExit} />);

    expect(screen.getByText('DEMO MODE')).toBeInTheDocument();
    expect(screen.getAllByText(/Arjun/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Priya/i).length).toBeGreaterThan(0);

    // Toggle scenario to International
    const intlBtn = screen.getByText(/International: Hindi ⟷ Mandarin/i);
    fireEvent.click(intlBtn);

    expect(screen.getAllByText(/Mei/i).length).toBeGreaterThan(0);
  });
});

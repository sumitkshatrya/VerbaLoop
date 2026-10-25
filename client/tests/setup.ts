import '@testing-library/jest-dom';

// Mock Web Speech API
(window as any).SpeechRecognition = class {
  continuous = false;
  interimResults = false;
  lang = '';
  start = () => {};
  stop = () => {};
  abort = () => {};
};

(window as any).speechSynthesis = {
  speak: () => {},
  cancel: () => {},
  pause: () => {},
  resume: () => {},
  getVoices: () => [],
};

// Mock AudioContext
(window as any).AudioContext = class {
  currentTime = 0;
  state = 'running';
  createOscillator = () => ({
    type: 'sine',
    frequency: {
      setValueAtTime: () => {},
      exponentialRampToValueAtTime: () => {},
    },
    connect: () => {},
    start: () => {},
    stop: () => {},
  });
  createGain = () => ({
    gain: {
      setValueAtTime: () => {},
      exponentialRampToValueAtTime: () => {},
    },
    connect: () => {},
  });
  destination = {};
  resume = async () => {};
};

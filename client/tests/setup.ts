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

// Mock Element.prototype.scrollIntoView
if (typeof window !== 'undefined') {
  window.HTMLElement.prototype.scrollIntoView = function () {};
  HTMLCanvasElement.prototype.getContext = function () {
    return {
      clearRect: () => {},
      fillRect: () => {},
      getImageData: () => ({ data: [] }),
      putImageData: () => {},
      createImageData: () => [],
      setTransform: () => {},
      drawImage: () => {},
      save: () => {},
      fillText: () => {},
      restore: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      stroke: () => {},
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      arc: () => {},
      fill: () => {},
      measureText: () => ({ width: 0 }),
      transform: () => {},
      rect: () => {},
      clip: () => {},
    } as any;
  };
}


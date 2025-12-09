import { create } from 'zustand';

// IVR State Machine Definition
export type CallState = 
  | 'IDLE' 
  | 'DIALING' 
  | 'RINGING' 
  | 'CONNECTED' 
  | 'IVR_LEVEL_1' // Language Selection
  | 'IVR_LEVEL_2_EN' // English Menu
  | 'IVR_LEVEL_2_ES' // Spanish Menu
  | 'PLAYING_AUDIO_EN'
  | 'PLAYING_AUDIO_ES'
  | 'FORWARDING'
  | 'ENDED';

export type LogEntry = {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error' | 'dtmf' | 'system';
  message: string;
};

interface IVRStore {
  callState: CallState;
  targetNumber: string;
  logs: LogEntry[];
  currentAudioMessage: string | null;
  
  // Actions
  setTargetNumber: (num: string) => void;
  initiateCall: () => void;
  answerCall: () => void;
  hangUp: () => void;
  sendDtmf: (digit: string) => void;
  addLog: (type: LogEntry['type'], message: string) => void;
  reset: () => void;
}

export const useIVRStore = create<IVRStore>((set, get) => ({
  callState: 'IDLE',
  targetNumber: '',
  logs: [],
  currentAudioMessage: null,

  setTargetNumber: (num) => set({ targetNumber: num }),

  addLog: (type, message) => set((state) => ({
    logs: [...state.logs, { id: Math.random().toString(36), timestamp: new Date(), type, message }]
  })),

  initiateCall: async () => {
    const { targetNumber, addLog } = get();
    if (!targetNumber) {
      addLog('error', 'No target number provided.');
      return;
    }
    
    set({ callState: 'DIALING' });
    addLog('system', `Initiating outbound call to ${targetNumber} via Plivo API...`);
    
    try {
      const response = await fetch('/api/calls/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetNumber }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.simulation) {
          addLog('info', 'Running in simulation mode - configure Plivo credentials for real calls');
        } else {
          addLog('success', `Real call initiated - UUID: ${data.callUuid}`);
        }
        
        // Simulate phone ringing for demo purposes
        setTimeout(() => {
          set({ callState: 'RINGING' });
          addLog('info', 'Phone is ringing...');
        }, 1500);
      } else {
        addLog('error', `Failed to initiate call: ${data.error || 'Unknown error'}`);
        set({ callState: 'IDLE' });
      }
    } catch (error) {
      addLog('error', `Error initiating call: ${error instanceof Error ? error.message : 'Unknown error'}`);
      set({ callState: 'IDLE' });
    }
  },

  answerCall: () => {
    const { addLog } = get();
    set({ callState: 'CONNECTED' });
    addLog('success', 'Call answered.');
    
    // Transition to IVR Level 1 immediately
    setTimeout(() => {
      set({ callState: 'IVR_LEVEL_1', currentAudioMessage: "Welcome to IVR Demo. Please select your language. Press 1 for English, Press 2 for Spanish." });
      addLog('system', 'IVR Level 1: Playing Language Selection Prompt');
      
      speak("Welcome to IVR Demo. Please select your language. Press 1 for English, Press 2 for Spanish.");
    }, 1000);
  },

  hangUp: () => {
    const { addLog } = get();
    set({ callState: 'ENDED', currentAudioMessage: null });
    addLog('warning', 'Call ended.');
    cancelSpeech();
    
    setTimeout(() => {
      set({ callState: 'IDLE', logs: [] });
    }, 3000);
  },

  sendDtmf: (digit: string) => {
    const { callState, addLog } = get();
    addLog('dtmf', `DTMF Received: ${digit}`);
    cancelSpeech(); // Stop current audio on input

    switch (callState) {
      case 'IVR_LEVEL_1':
        if (digit === '1') {
          set({ callState: 'IVR_LEVEL_2_EN', currentAudioMessage: "English selected. Press 1 to play a message. Press 2 to speak to an associate." });
          addLog('system', 'Language set to English. Moving to Level 2.');
          speak("English selected. Press 1 to play a message. Press 2 to speak to an associate.");
        } else if (digit === '2') {
          set({ callState: 'IVR_LEVEL_2_ES', currentAudioMessage: "Español seleccionado. Presione 1 para escuchar un mensaje. Presione 2 para hablar con un asociado." });
          addLog('system', 'Language set to Spanish. Moving to Level 2.');
          speak("Español seleccionado. Presione 1 para escuchar un mensaje. Presione 2 para hablar con un asociado.", 'es-ES');
        } else {
          addLog('warning', 'Invalid Input. Replaying Level 1 Menu.');
          speak("Invalid input. Press 1 for English, Press 2 for Spanish.");
        }
        break;

      case 'IVR_LEVEL_2_EN':
        if (digit === '1') {
          set({ callState: 'PLAYING_AUDIO_EN', currentAudioMessage: "Playing English music..." });
          addLog('system', 'Action: Playing English Music');
          speak("Playing your music now.");
          setTimeout(() => {
            playAudio(AUDIO_FILES.en, () => {
              addLog('success', 'Music finished. Ending call.');
              get().hangUp();
            });
          }, 1500);
          setTimeout(() => get().hangUp(), 15000);
        } else if (digit === '2') {
          set({ callState: 'FORWARDING', currentAudioMessage: "Connecting you to an associate..." });
          addLog('system', 'Action: Forwarding Call');
          speak("Please hold while we connect you to an associate.");
          setTimeout(() => get().hangUp(), 4000);
        } else {
          addLog('warning', 'Invalid Input. Replaying Level 2 Menu.');
          speak("Invalid input. Press 1 to play music. Press 2 to speak to an associate.");
        }
        break;

      case 'IVR_LEVEL_2_ES':
        if (digit === '1') {
          set({ callState: 'PLAYING_AUDIO_ES', currentAudioMessage: "Reproduciendo música en español..." });
          addLog('system', 'Action: Playing Spanish Music');
          speak("Reproduciendo su música ahora.", 'es-ES');
          setTimeout(() => {
            playAudio(AUDIO_FILES.es, () => {
              addLog('success', 'Música terminada. Finalizando llamada.');
              get().hangUp();
            });
          }, 1500);
          setTimeout(() => get().hangUp(), 15000);
        } else if (digit === '2') {
          set({ callState: 'FORWARDING', currentAudioMessage: "Conectando con un asociado..." });
          addLog('system', 'Action: Forwarding Call');
          speak("Por favor espere mientras le conectamos con un asociado.", 'es-ES');
          setTimeout(() => get().hangUp(), 4000);
        } else {
          addLog('warning', 'Invalid Input. Replaying Level 2 Menu.');
          speak("Entrada inválida. Presione 1 para música. Presione 2 para hablar con un asociado.", 'es-ES');
        }
        break;
        
      default:
        break;
    }
  },

  reset: () => set({ callState: 'IDLE', logs: [], currentAudioMessage: null })
}));

const AUDIO_FILES = {
  en: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  es: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
};

let currentAudio: HTMLAudioElement | null = null;

function speak(text: string, lang = 'en-US') {
  if (!window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

function cancelSpeech() {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  stopAudio();
}

function playAudio(url: string, onEnded?: () => void) {
  stopAudio();
  currentAudio = new Audio(url);
  currentAudio.volume = 0.7;
  if (onEnded) {
    currentAudio.onended = onEnded;
  }
  currentAudio.play().catch(err => console.error('Audio play error:', err));
}

function stopAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

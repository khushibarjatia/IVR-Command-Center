import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Delete, Voicemail } from 'lucide-react';
import { useIVRStore } from '@/lib/ivr-store';
import { cn } from '@/lib/utils';

export function VirtualPhone() {
  const { callState, currentAudioMessage, sendDtmf, answerCall, hangUp } = useIVRStore();

  const isRinging = callState === 'RINGING';
  const isConnected = ['CONNECTED', 'IVR_LEVEL_1', 'IVR_LEVEL_2_EN', 'IVR_LEVEL_2_ES', 'PLAYING_AUDIO_EN', 'PLAYING_AUDIO_ES', 'FORWARDING'].includes(callState);
  const isDialing = callState === 'DIALING';

  const handleKeyPad = (key: string) => {
    if (isConnected) {
      sendDtmf(key);
    }
  };

  return (
    <div className="w-[320px] h-[640px] bg-black rounded-[3rem] border-4 border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col glass-panel mx-auto">
      {/* Dynamic Island / Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-black rounded-b-xl z-20 flex items-center justify-center">
        <div className="w-16 h-1 bg-zinc-800 rounded-full" />
      </div>

      {/* Screen Content */}
      <div className="flex-1 flex flex-col relative z-10 p-6 pt-12">
        
        {/* Status Bar */}
        <div className="flex justify-between text-xs text-zinc-400 mb-8 font-medium">
          <span>9:41</span>
          <div className="flex gap-1">
            <span className="w-4 h-3 bg-zinc-600 rounded-[2px]" />
            <span className="w-4 h-3 bg-zinc-600 rounded-[2px]" />
            <span className="w-4 h-3 bg-white rounded-[2px]" />
          </div>
        </div>

        {/* Call Info */}
        <div className="flex-1 flex flex-col items-center justify-start mt-8 space-y-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4 relative">
             <span className="text-3xl font-bold text-white">IW</span>
             {isRinging && (
               <motion.div 
                className="absolute inset-0 rounded-full border-2 border-white/50"
                animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
               />
             )}
          </div>
          
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-semibold text-white tracking-tight">IVR Demo</h2>
            <p className="text-sm font-medium text-emerald-400 uppercase tracking-widest">
              {callState.replace(/_/g, ' ')}
            </p>
            {callState === 'RINGING' && <p className="text-zinc-400">Incoming Call...</p>}
          </div>

          {/* Simulated Voice Output Display */}
          <AnimatePresence mode="wait">
            {currentAudioMessage && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 p-3 bg-white/5 rounded-xl border border-white/10 text-center"
              >
                <div className="flex justify-center gap-1 mb-2">
                   {[1,2,3,4].map(i => (
                     <motion.div 
                       key={i}
                       className="w-1 bg-indigo-400 rounded-full"
                       animate={{ height: [4, 12, 4] }}
                       transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                     />
                   ))}
                </div>
                <p className="text-xs text-zinc-300 italic font-mono leading-relaxed">
                  "{currentAudioMessage}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls / Keypad */}
        <div className="mt-auto space-y-6 pb-8">
          
          {isConnected && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((key) => (
                <button
                  key={key}
                  onClick={() => handleKeyPad(key.toString())}
                  className="w-16 h-16 rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 text-white text-2xl font-light flex items-center justify-center transition-colors backdrop-blur-sm border border-white/5 active:bg-white/20"
                >
                  {key}
                </button>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-around items-center px-4">
            {isRinging ? (
              <>
                <button 
                  onClick={hangUp}
                  className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg hover:bg-red-600 transition-transform hover:scale-105"
                >
                  <PhoneOff size={28} />
                </button>
                <button 
                  onClick={answerCall}
                  className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg hover:bg-emerald-600 transition-transform hover:scale-105 animate-pulse"
                >
                  <Phone size={28} />
                </button>
              </>
            ) : isConnected || isDialing ? (
              <button 
                onClick={hangUp}
                className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg hover:bg-red-600 transition-transform hover:scale-105 mx-auto"
              >
                <PhoneOff size={28} />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

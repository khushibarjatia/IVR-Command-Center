import React from 'react';
import { useIVRStore } from '@/lib/ivr-store';
import { Phone, Activity, Terminal, Hash, Clock, Globe, User, Volume2, ArrowRight } from 'lucide-react';
import { VirtualPhone } from '@/components/virtual-phone';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { callState, targetNumber, setTargetNumber, initiateCall, logs } = useIVRStore();

  const isCallActive = callState !== 'IDLE' && callState !== 'ENDED';

  return (
    <div className="min-h-screen w-full p-4 md:p-8 flex flex-col md:flex-row gap-8 max-w-[1600px] mx-auto">
      
      {/* Left Column: Controls & System Status */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Header */}
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
              IVR Command Center
            </h1>
            <p className="text-zinc-400 text-sm mt-1">Plivo API Integration Demo</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-mono">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            SYSTEM ONLINE
          </div>
        </div>

        {/* Control Panel */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-2 text-indigo-400 mb-2">
            <Activity size={20} />
            <h2 className="font-display font-semibold tracking-wide uppercase text-sm">Outbound Call Trigger</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400 ml-1">TARGET PHONE NUMBER</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                  <Phone size={16} />
                </div>
                <input
                  type="text"
                  value={targetNumber}
                  onChange={(e) => setTargetNumber(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  data-testid="input-target-number"
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                />
              </div>
            </div>

            <button
              onClick={initiateCall}
              disabled={isCallActive || !targetNumber}
              data-testid="button-initiate-call"
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              <span>Initiate Outbound Call</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* System Logs */}
        <div className="glass-panel p-6 rounded-2xl flex-1 flex flex-col min-h-[400px]">
          <div className="flex items-center gap-2 text-zinc-400 mb-4 border-b border-white/5 pb-4">
            <Terminal size={18} />
            <h2 className="font-display font-semibold tracking-wide uppercase text-sm">System Logs</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2 font-mono text-xs pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <AnimatePresence initial={false}>
              {logs.length === 0 && (
                <div className="text-zinc-600 text-center py-8 italic">Waiting for system events...</div>
              )}
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "p-2 rounded border-l-2 pl-3 bg-white/5",
                    log.type === 'system' && "border-indigo-500 text-indigo-200",
                    log.type === 'info' && "border-blue-500 text-blue-200",
                    log.type === 'success' && "border-emerald-500 text-emerald-200",
                    log.type === 'warning' && "border-amber-500 text-amber-200",
                    log.type === 'error' && "border-red-500 text-red-200",
                    log.type === 'dtmf' && "border-pink-500 text-pink-200 font-bold",
                  )}
                >
                  <span className="opacity-50 mr-2">[{format(log.timestamp, 'HH:mm:ss')}]</span>
                  <span className="uppercase tracking-wider opacity-75 text-[10px] mr-2 border border-white/10 px-1 rounded">{log.type}</span>
                  {log.message}
                </motion.div>
              ))}
            </AnimatePresence>
            <div id="log-end" />
          </div>
        </div>
      </div>

      {/* Center/Right Column: Visualization */}
      <div className="w-full md:w-auto flex flex-col gap-6">
        
        {/* Call Flow Visualization */}
        <div className="glass-panel p-6 rounded-2xl">
           <div className="flex items-center gap-2 text-zinc-400 mb-6">
            <Globe size={18} />
            <h2 className="font-display font-semibold tracking-wide uppercase text-sm">Active Call Flow</h2>
          </div>

          <div className="flex justify-between items-center gap-4 text-xs font-mono text-center">
            <FlowStep 
              active={callState !== 'IDLE'} 
              label="Initiated" 
              icon={<Phone size={14} />} 
            />
            <FlowLine active={callState !== 'IDLE' && callState !== 'DIALING'} />
            
            <FlowStep 
              active={['IVR_LEVEL_1', 'IVR_LEVEL_2_EN', 'IVR_LEVEL_2_ES', 'PLAYING_AUDIO_EN', 'PLAYING_AUDIO_ES', 'FORWARDING'].includes(callState)} 
              label="IVR Menu" 
              icon={<Hash size={14} />} 
            />
            <FlowLine active={['IVR_LEVEL_2_EN', 'IVR_LEVEL_2_ES', 'PLAYING_AUDIO_EN', 'PLAYING_AUDIO_ES', 'FORWARDING'].includes(callState)} />
            
            <FlowStep 
              active={['PLAYING_AUDIO_EN', 'PLAYING_AUDIO_ES'].includes(callState)} 
              label="Audio Play" 
              icon={<Volume2 size={14} />} 
            />
            
            <div className="h-px w-8 bg-zinc-800" /> {/* Branch */}
            
            <FlowStep 
              active={callState === 'FORWARDING'} 
              label="Forwarding" 
              icon={<User size={14} />} 
            />
          </div>
        </div>

        {/* The Phone Simulator */}
        <div className="flex-1 flex items-center justify-center min-h-[600px] perspective-[1000px]">
          <VirtualPhone />
        </div>

      </div>
    </div>
  );
}

function FlowStep({ active, label, icon }: { active: boolean; label: string; icon: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col items-center gap-2 transition-all duration-500", active ? "text-emerald-400" : "text-zinc-700")}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-500",
        active ? "bg-emerald-500/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-zinc-900 border-zinc-800"
      )}>
        {icon}
      </div>
      <span className="uppercase tracking-wider text-[10px]">{label}</span>
    </div>
  );
}

function FlowLine({ active }: { active: boolean }) {
  return (
    <div className="flex-1 h-[2px] bg-zinc-800 relative overflow-hidden">
      {active && (
        <motion.div 
          className="absolute inset-0 bg-emerald-500"
          initial={{ x: '-100%' }}
          animate={{ x: '0%' }}
          transition={{ duration: 0.5 }}
        />
      )}
    </div>
  );
}

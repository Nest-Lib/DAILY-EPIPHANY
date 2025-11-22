
import React, { useState, useEffect, useRef } from 'react';
import { X, Wind, Ear, Eye, Play, Pause, Volume2, VolumeX, Check } from 'lucide-react';

interface Props {
  onClose: () => void;
  onComplete: (prompt?: string) => void;
}

type Mode = 'breathe' | 'listen' | 'observe';

const MODES: { id: Mode; icon: any; label: string; prompt: string; duration: number }[] = [
  { 
    id: 'breathe', 
    icon: Wind, 
    label: 'Breathe', 
    prompt: 'Sync your breath with the circle. Inhale as it expands, exhale as it contracts.', 
    duration: 60 
  },
  { 
    id: 'listen', 
    icon: Ear, 
    label: 'Listen', 
    prompt: 'Close your eyes. Focus on the furthest sound you can hear, then the closest.', 
    duration: 60 
  },
  { 
    id: 'observe', 
    icon: Eye, 
    label: 'Observe', 
    prompt: 'Find one small detail in your immediate vicinity. Stare at it until the timer ends.', 
    duration: 60 
  }
];

export const MindfulMoment: React.FC<Props> = ({ onClose, onComplete }) => {
  const [activeMode, setActiveMode] = useState<Mode>('breathe');
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isMuted, setIsMuted] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  
  // Audio Context Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Timer Logic
  useEffect(() => {
    let interval: number;
    if (isPlaying && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
      stopAudio();
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeLeft]);

  // Breathing Animation Logic (4-4-4 Box Breathing or similar)
  useEffect(() => {
    if (activeMode !== 'breathe' || !isPlaying) return;

    const cycle = () => {
      setBreathPhase('inhale');
      setTimeout(() => {
        if (isPlaying) setBreathPhase('hold');
        setTimeout(() => {
          if (isPlaying) setBreathPhase('exhale');
        }, 4000);
      }, 4000);
    };

    cycle();
    const interval = setInterval(cycle, 12000); // 4s In + 4s Hold + 4s Out = 12s cycle
    return () => clearInterval(interval);
  }, [activeMode, isPlaying]);

  // Audio Logic (Binaural Beats / Drone)
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    }
  };

  const startAudio = () => {
    if (isMuted) return;
    initAudio();
    const ctx = audioCtxRef.current!;
    
    // Create oscillators for binaural effect (Theta waves ~100Hz base, 6Hz difference)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(100, ctx.currentTime); // Base
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(106, ctx.currentTime); // +6Hz for binaural beat

    // Soft attack
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 2);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();

    osc1Ref.current = osc1;
    osc2Ref.current = osc2;
    gainNodeRef.current = gain;
  };

  const stopAudio = () => {
    if (gainNodeRef.current && audioCtxRef.current) {
      // Soft release
      gainNodeRef.current.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 1);
      setTimeout(() => {
        osc1Ref.current?.stop();
        osc2Ref.current?.stop();
        osc1Ref.current?.disconnect();
        osc2Ref.current?.disconnect();
      }, 1000);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      stopAudio();
    } else {
      setIsPlaying(true);
      startAudio();
    }
  };

  const handleModeChange = (mode: Mode) => {
    setActiveMode(mode);
    setIsPlaying(false);
    stopAudio();
    setTimeLeft(MODES.find(m => m.id === mode)?.duration || 60);
  };

  const handleComplete = () => {
    stopAudio();
    let initialInput = "";
    if (activeMode === 'listen') initialInput = "I heard ";
    if (activeMode === 'observe') initialInput = "I noticed ";
    if (activeMode === 'breathe') initialInput = "I feel ";
    onComplete(initialInput);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopAudio();
  }, []);

  const currentModeData = MODES.find(m => m.id === activeMode)!;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-lg relative">
        
        {/* Close Button */}
        <button 
          onClick={() => { stopAudio(); onClose(); }}
          className="absolute -top-12 right-0 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center">
          
          {/* Visualizer */}
          <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
             {/* Breathing Circles */}
             <div className={`absolute w-full h-full rounded-full bg-indigo-500/20 blur-3xl transition-all duration-[4000ms] ease-in-out ${isPlaying && activeMode === 'breathe' && breathPhase !== 'exhale' ? 'scale-125 opacity-60' : 'scale-90 opacity-20'}`}></div>
             <div className={`absolute w-48 h-48 rounded-full border border-indigo-400/30 transition-all duration-[4000ms] ease-in-out ${isPlaying && activeMode === 'breathe' && breathPhase !== 'exhale' ? 'scale-110 border-indigo-300/50' : 'scale-95'}`}></div>
             
             {/* Central Timer/Icon */}
             <div className="relative z-10">
                {timeLeft === 0 ? (
                  <button 
                    onClick={handleComplete}
                    className="w-20 h-20 bg-white rounded-full flex items-center justify-center animate-bounce shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-110 transition-transform"
                  >
                    <Check className="w-8 h-8 text-indigo-900" />
                  </button>
                ) : (
                  <div className="text-5xl font-serif text-indigo-100 font-light tabular-nums">
                    {timeLeft}
                  </div>
                )}
             </div>
          </div>

          {/* Instructions */}
          <h2 className="text-2xl font-serif text-white mb-2 transition-all duration-500">
            {timeLeft === 0 ? "Moment Complete" : activeMode === 'breathe' && isPlaying 
               ? (breathPhase === 'inhale' ? 'Inhale...' : breathPhase === 'hold' ? 'Hold...' : 'Exhale...') 
               : currentModeData.label}
          </h2>
          
          <p className="text-slate-400 text-sm max-w-xs min-h-[3rem] mb-8">
             {timeLeft === 0 ? "You are now centered. Capture your insight." : currentModeData.prompt}
          </p>

          {/* Controls */}
          <div className="flex items-center gap-6 mb-10">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-full transition-colors ${isMuted ? 'bg-slate-800 text-slate-500' : 'bg-indigo-500/20 text-indigo-300'}`}
              title="Ambient Sound"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <button 
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-white hover:bg-indigo-50 text-indigo-900 flex items-center justify-center transition-transform hover:scale-105 shadow-lg shadow-indigo-900/50"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
            </button>

            <div className="w-11"></div> {/* Spacer for balance */}
          </div>

          {/* Mode Selector */}
          <div className="flex gap-2 bg-slate-800/50 p-1 rounded-xl backdrop-blur-md">
             {MODES.map(mode => {
               const Icon = mode.icon;
               return (
                 <button
                   key={mode.id}
                   onClick={() => handleModeChange(mode.id)}
                   className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                     activeMode === mode.id 
                       ? 'bg-indigo-600 text-white shadow-lg' 
                       : 'text-slate-400 hover:text-white hover:bg-slate-700'
                   }`}
                 >
                   <Icon className="w-4 h-4" />
                   <span className="hidden sm:inline">{mode.label}</span>
                 </button>
               )
             })}
          </div>

          {timeLeft === 0 && (
             <button 
               onClick={handleComplete}
               className="mt-8 text-indigo-300 text-sm hover:text-white flex items-center gap-2 animate-fade-in"
             >
               Write Observation <Check className="w-4 h-4" />
             </button>
          )}

        </div>
      </div>
    </div>
  );
};

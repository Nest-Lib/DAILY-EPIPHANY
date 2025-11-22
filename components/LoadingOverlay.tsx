import React from 'react';
import { Loader2, Zap } from 'lucide-react';

interface LoadingOverlayProps {
  state: 'generating-text' | 'generating-image';
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ state }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-20 text-white animate-fade-in">
      
      {/* Animation Container */}
      <div className="relative mb-8">
        {/* Outer Ring */}
        <div className="w-24 h-24 rounded-full border-t-2 border-r-2 border-indigo-500/30 animate-spin-slow absolute inset-0"></div>
        
        {/* Inner Spinning Ring */}
        <div className="w-24 h-24 rounded-full border-l-2 border-indigo-400 animate-spin absolute inset-0"></div>
        
        {/* Center Pulse */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-full animate-pulse flex items-center justify-center">
            <Zap className="w-6 h-6 text-indigo-300 fill-indigo-300/20 animate-pulse" />
          </div>
        </div>
      </div>

      <h2 className="text-2xl serif italic font-light tracking-wide mb-3 text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200">
        Connecting to cosmic patterns...
      </h2>
      
      <div className="flex items-center gap-2 text-slate-400 text-sm">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>
          {state === 'generating-text' ? 'Analyzing mundane observation...' : 'Visualizing the connection...'}
        </span>
      </div>

      <style>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
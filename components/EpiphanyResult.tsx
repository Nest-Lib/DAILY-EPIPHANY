
import React, { useState } from 'react';
import { EpiphanyResult as EpiphanyResultType } from '../types';
import { Share2, RefreshCw, Heart, ArrowLeft, Sparkles, Tag } from 'lucide-react';
import { ShareModal } from './ShareModal';

interface Props {
  data: EpiphanyResultType;
  onBack: () => void;
  onRegenerate: () => void;
  onToggleFavorite?: (id: string) => void;
}

export const EpiphanyResult: React.FC<Props> = ({ data, onBack, onRegenerate, onToggleFavorite }) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  return (
    <div className="w-full max-w-2xl mx-auto px-4 animate-fade-in pb-16 relative">
      
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        data={data} 
      />

      {/* Celebration Burst Background (CSS Animation) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-radial-gradient pointer-events-none animate-pulse-once opacity-0"></div>

      {/* Main Card */}
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden z-10">
        
        {/* Gradient Glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        {/* Content Container */}
        <div className="p-8 md:p-10 flex flex-col items-center text-center">
          
          {/* Category Tag */}
          {data.category && data.category !== 'Other' && (
            <div className="mb-4 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[10px] uppercase tracking-widest font-medium">
              <Tag className="w-3 h-3" />
              {data.category}
            </div>
          )}

          {/* User Input (Small) */}
          <div className="mb-6 opacity-60">
            <p className="text-xs font-medium tracking-widest uppercase text-slate-400 mb-2">Your Observation</p>
            <p className="text-slate-300 italic text-sm">"{data.originalInput}"</p>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 mb-6 drop-shadow-sm">
            {data.content.title}
          </h1>

          {/* Visualization */}
          {data.imageUrl && (
            <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden mb-8 shadow-lg border border-slate-700/50 relative group animate-scale-in">
              <img 
                src={data.imageUrl} 
                alt={data.content.title} 
                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-md rounded text-[10px] text-white/70 uppercase tracking-wider">
                AI Visualization
              </div>
            </div>
          )}

          {/* The Epiphany (Large Elegant Font) */}
          <div className="prose prose-invert prose-lg max-w-none mb-8">
            <p className="text-slate-100 leading-relaxed font-serif text-lg md:text-xl">
              {data.content.explanation}
            </p>
          </div>

          {/* Fact Box */}
          <div className="w-full bg-indigo-950/20 rounded-lg p-4 border border-indigo-500/10 text-left mb-8">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wide">Cosmic Fact</span>
            </div>
            <p className="text-sm text-indigo-100/80 leading-relaxed">
              {data.content.fact}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full">
            <button 
              onClick={() => onToggleFavorite?.(data.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium ${data.isFavorite ? 'bg-pink-500/20 border-pink-500/50 text-pink-300' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'}`}
            >
              <Heart className={`w-4 h-4 ${data.isFavorite ? 'fill-current' : ''}`} />
              {data.isFavorite ? 'Saved' : 'Save'}
            </button>
            
            <button 
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-all text-sm font-medium group"
            >
              <Share2 className="w-4 h-4 group-hover:text-indigo-400" />
              Share
            </button>

            <button 
              onClick={onRegenerate}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-all text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </button>
          </div>

        </div>
      </div>

      {/* Try Another Button (Outside Card) */}
      <div className="mt-8 text-center">
        <button 
          onClick={onBack}
          className="inline-flex items-center text-slate-500 hover:text-indigo-300 transition-colors text-sm group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Try Another Observation
        </button>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 1s ease-out forwards;
        }

        @keyframes pulse-once {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          50% { opacity: 0.2; transform: translate(-50%, -50%) scale(1.1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
        }
        .animate-pulse-once {
          animation: pulse-once 1.5s ease-out forwards;
          background: radial-gradient(circle, rgba(99,102,241,0.4) 0%, rgba(0,0,0,0) 70%);
        }
      `}</style>
    </div>
  );
};

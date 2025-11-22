import React from 'react';
import { EpiphanyResult } from '../types';
import { Clock } from 'lucide-react';

interface Props {
  history: EpiphanyResult[];
  onSelect: (item: EpiphanyResult) => void;
}

export const RecentList: React.FC<Props> = ({ history, onSelect }) => {
  if (history.length === 0) return null;

  return (
    <div className="mt-16 w-full max-w-3xl mx-auto px-4">
      <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-800">
        <Clock className="w-4 h-4 text-slate-500" />
        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Recent Discoveries</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="text-left group p-4 rounded-xl bg-slate-800/30 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all duration-300"
          >
            <div className="text-xs text-indigo-400 mb-2 font-medium">{item.content.concept}</div>
            <h3 className="text-slate-200 font-serif text-lg leading-snug mb-2 group-hover:text-white transition-colors">
              {item.content.title}
            </h3>
            <p className="text-slate-500 text-xs truncate">
              Observation: {item.originalInput}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

import React, { useState, useMemo, useEffect } from 'react';
import { Sparkles, Search, AlertCircle, Loader2, Trophy, X, Tag, Brain } from 'lucide-react';
import { DailyChallenge, Category } from '../types';

interface Props {
  onSubmit: (input: string, category: Category) => void;
  error?: string | null;
  isLoading?: boolean;
  activeChallenge?: DailyChallenge | null;
  onCancelChallenge?: () => void;
  onStartMindful?: () => void;
  initialInput?: string;
}

const CATEGORIES: Category[] = ['Nature', 'People', 'Objects', 'Feelings', 'Dreams', 'Memories', 'Urban', 'Other'];

const EXAMPLE_PROMPTS = [
  "I made toast this morning",
  "A bird flew past my window",
  "My shoelace came untied",
  "I dropped my pen",
  "The traffic light turned red",
  "I watched water boil",
  "I saw a leaf fall",
  "My coffee went cold",
  "I heard a distant siren",
  "The elevator was slow",
  "I found a coin on the ground",
  "The rain hit the window",
  "I forgot my password",
  "I waited in line today",
  "My plant grew a new leaf"
];

export const InputForm: React.FC<Props> = ({ 
  onSubmit, 
  error, 
  isLoading, 
  activeChallenge, 
  onCancelChallenge, 
  onStartMindful,
  initialInput = '' 
}) => {
  const [input, setInput] = useState(initialInput);
  const [selectedCategory, setSelectedCategory] = useState<Category>('Other');
  const [isDirty, setIsDirty] = useState(false); // Track if user manually selected category

  useEffect(() => {
    if (initialInput) {
      setInput(initialInput);
    }
  }, [initialInput]);

  const dailyExamples = useMemo(() => {
    const day = new Date().getDate(); 
    const count = 4;
    // Rotate through the list based on the day of the month
    const startIndex = (day * count) % EXAMPLE_PROMPTS.length;
    
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(EXAMPLE_PROMPTS[(startIndex + i) % EXAMPLE_PROMPTS.length]);
    }
    return result;
  }, []);

  // Reset input when switching modes
  useEffect(() => {
    if (!activeChallenge && !initialInput) {
       setInput('');
       setSelectedCategory('Other');
       setIsDirty(false);
    }
  }, [activeChallenge]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSubmit(input, selectedCategory);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto text-center px-4 animate-fade-in-up relative">
      
      {/* Challenge Mode Banner */}
      {activeChallenge ? (
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-b from-indigo-900/50 to-slate-900 border border-indigo-500/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500"></div>
          <button onClick={onCancelChallenge} className="absolute top-3 right-3 text-slate-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex flex-col items-center relative z-10">
            <div className="bg-indigo-500/20 p-2 rounded-full mb-3">
              <Trophy className="w-6 h-6 text-indigo-300" />
            </div>
            <h2 className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2">Daily Challenge</h2>
            <h1 className="text-2xl font-serif text-white mb-2">{activeChallenge.theme}</h1>
            <p className="text-slate-400 text-sm italic">"{activeChallenge.prompt}"</p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8 inline-block p-3 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
          
          <h1 className="text-4xl md:text-5xl serif font-bold text-slate-100 mb-4 tracking-tight">
            Daily Epiphany
          </h1>
          
          <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto leading-relaxed">
            Type something mundane. Tag it. Discover the universe within.
          </p>
        </>
      )}

      {/* Category Selection (Hidden during Loading) */}
      {!isLoading && !activeChallenge && (
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setIsDirty(true); }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                selectedCategory === cat && isDirty
                  ? 'bg-indigo-600 border-indigo-500 text-white' 
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative group mb-4">
        <div className={`absolute -inset-1 bg-gradient-to-r rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 ${error ? 'from-red-500 via-orange-500 to-red-500' : activeChallenge ? 'from-yellow-400 via-orange-500 to-pink-500' : 'from-indigo-500 via-purple-500 to-pink-500'} ${isLoading ? 'opacity-0' : ''}`}></div>
        <div className={`relative flex items-center bg-slate-900 rounded-xl p-2 border shadow-2xl ${error ? 'border-red-500/50' : activeChallenge ? 'border-indigo-500/50' : 'border-slate-700'} ${isLoading ? 'opacity-70' : ''}`}>
          <Search className="w-5 h-5 text-slate-500 ml-3 mr-2" />
          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-600 h-12 text-lg"
            placeholder={activeChallenge ? `Describe your ${activeChallenge.theme.toLowerCase()} observation...` : "e.g., I watched water boil..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
            disabled={isLoading}
          />
          
          {/* Tag Indicator inside input if selected */}
          {!isLoading && selectedCategory !== 'Other' && (
            <div className="hidden md:flex items-center gap-1 text-xs text-indigo-400 bg-indigo-950/50 px-2 py-1 rounded mr-2 border border-indigo-500/20">
              <Tag className="w-3 h-3" />
              {selectedCategory}
            </div>
          )}

          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`px-6 py-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-white ${activeChallenge ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reveal'}
          </button>
        </div>
      </form>

      {/* Mindful Moment Trigger */}
      {!isLoading && !activeChallenge && (
        <div className="flex justify-center mb-8">
          <button 
            type="button"
            onClick={onStartMindful}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/30 border border-indigo-500/20 hover:bg-indigo-500/10 hover:border-indigo-500/40 text-indigo-300 text-xs font-medium transition-all group"
          >
            <Brain className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Need help noticing? Try a Mindful Moment
          </button>
        </div>
      )}

      {/* Example Prompts Section */}
      {!isLoading && !activeChallenge && (
        <div className="mt-2 animate-fade-in">
          <p className="text-slate-500 text-sm mb-3 font-medium">Or use a prompt:</p>
          <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
            {dailyExamples.map((text) => (
              <button
                key={text}
                type="button"
                onClick={() => setInput(text)}
                className="px-4 py-1.5 rounded-full bg-slate-800/40 border border-slate-700/50 hover:border-indigo-400/40 hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-200 text-xs transition-all duration-200 cursor-pointer"
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 flex items-center justify-center gap-2 text-red-400 text-sm animate-pulse">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

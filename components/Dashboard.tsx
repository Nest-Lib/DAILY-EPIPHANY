
import React, { useState, useMemo } from 'react';
import { EpiphanyResult, User, DailyChallenge, Category } from '../types';
import { Search, Calendar, Heart, ArrowUpRight, Filter, Flame, Award, PieChart, Sparkles } from 'lucide-react';
import { getDailyChallenge, getBadges } from '../services/challengeService';

interface Props {
  history: EpiphanyResult[];
  onSelect: (item: EpiphanyResult) => void;
  onToggleFavorite: (id: string) => void;
  user: User | null;
  onStartChallenge: (challenge: DailyChallenge) => void;
}

type TimeFilter = 'all' | 'week' | 'month';
const ALL_CATEGORIES: Category[] = ['Nature', 'People', 'Objects', 'Feelings', 'Dreams', 'Memories', 'Urban'];

export const Dashboard: React.FC<Props> = ({ history, onSelect, onToggleFavorite, user, onStartChallenge }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Challenge Logic
  const dailyChallenge = getDailyChallenge();
  const today = new Date().toISOString().split('T')[0];
  const isChallengeCompleted = user?.lastChallengeDate === today;
  const userBadges = user ? getBadges(user.badges || []) : [];

  // Stats Calculation
  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_CATEGORIES.forEach(c => counts[c] = 0);
    counts['Other'] = 0;

    history.forEach(item => {
      const cat = item.category || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const unexplored = ALL_CATEGORIES.filter(cat => counts[cat] === 0);
    return { counts, unexplored };
  }, [history]);

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      // Text Search
      const matchesSearch = 
        item.content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.concept.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.originalInput.toLowerCase().includes(searchQuery.toLowerCase());

      // Favorites Filter
      const matchesFav = showFavoritesOnly ? item.isFavorite : true;
      
      // Category Filter
      const matchesCat = categoryFilter === 'All' ? true : (item.category || 'Other') === categoryFilter;

      // Date Filter
      let matchesDate = true;
      const itemDate = new Date(item.date);
      const now = new Date();
      
      if (timeFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = itemDate >= weekAgo;
      } else if (timeFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = itemDate >= monthAgo;
      }

      return matchesSearch && matchesFav && matchesDate && matchesCat;
    });
  }, [history, searchQuery, timeFilter, showFavoritesOnly, categoryFilter]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-20 animate-fade-in">
      
      {/* Top Grid: Stats & Challenge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        
        {/* Column 1: Daily Challenge (Same as before) */}
        <div className="bg-gradient-to-br from-indigo-900/50 to-slate-800 rounded-xl border border-indigo-500/30 p-6 relative overflow-hidden flex flex-col justify-center">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="px-2 py-0.5 bg-indigo-500 rounded text-[10px] font-bold uppercase tracking-wide text-white">Today's Challenge</div>
                {isChallengeCompleted && <div className="text-green-400 text-xs font-bold flex items-center gap-1"><Award className="w-3 h-3" /> Completed</div>}
              </div>
              <h2 className="text-2xl serif font-bold text-white mb-1">{dailyChallenge.theme}</h2>
              <p className="text-indigo-200 text-sm mb-4 italic">"{dailyChallenge.prompt}"</p>
            </div>
          </div>
          
          {!isChallengeCompleted ? (
             <button 
               onClick={() => onStartChallenge(dailyChallenge)}
               className="w-fit px-6 py-2 bg-white text-indigo-900 font-bold rounded-lg hover:bg-indigo-50 transition-colors text-sm"
             >
               Accept Challenge
             </button>
          ) : (
            <div className="text-sm text-indigo-200/60">
              Come back tomorrow for a new theme.
            </div>
          )}
        </div>

        {/* Column 2: Cosmic Balance Stats */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
           <div className="flex items-center gap-2 mb-4 text-indigo-300">
             <PieChart className="w-5 h-5" />
             <h3 className="font-bold uppercase tracking-wider text-xs">Cosmic Balance</h3>
           </div>
           
           <div className="space-y-3">
             {Object.entries(stats.counts)
               .sort(([,a], [,b]) => (b as number) - (a as number))
               .slice(0, 4) // Show top 4 categories
               .map(([cat, count]) => (
                 <div key={cat}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">{cat}</span>
                      <span className="text-slate-200">{count as number}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div 
                        className="bg-indigo-500 h-1.5 rounded-full transition-all duration-1000" 
                        style={{ width: `${Math.min(((count as number) / Math.max(...(Object.values(stats.counts) as number[]), 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                 </div>
               ))
             }
             {history.length === 0 && <p className="text-xs text-slate-500 italic">No observations yet.</p>}
           </div>
        </div>

        {/* Column 3: Unexplored Suggestion */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 flex flex-col">
           <div className="flex items-center gap-2 mb-4 text-pink-300">
             <Sparkles className="w-5 h-5" />
             <h3 className="font-bold uppercase tracking-wider text-xs">Unexplored</h3>
           </div>
           
           {stats.unexplored.length > 0 ? (
             <div className="flex-1 flex flex-col justify-center">
               <p className="text-sm text-slate-400 mb-3">
                 You haven't had an epiphany about <span className="text-white font-medium">{stats.unexplored[0]}</span> yet.
               </p>
               <div className="text-xs text-slate-500 italic">
                 Try observing a {stats.unexplored[0].toLowerCase().slice(0, -1)} today.
               </div>
             </div>
           ) : (
             <div className="flex-1 flex flex-col justify-center text-center">
               <div className="text-3xl mb-2">🌌</div>
               <p className="text-sm text-slate-400">You have explored every corner of the universe!</p>
             </div>
           )}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-medium text-white mb-6 border-b border-slate-800 pb-2">My Discovery History</h2>

        {/* Controls */}
        <div className="flex flex-col xl:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Search concepts, titles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Category Filter Dropdown */}
            <div className="relative">
               <select 
                 value={categoryFilter}
                 onChange={(e) => setCategoryFilter(e.target.value as Category | 'All')}
                 className="appearance-none bg-slate-800/50 border border-slate-700 rounded-lg py-2.5 pl-4 pr-10 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer hover:bg-slate-800 text-sm"
               >
                 <option value="All">All Categories</option>
                 {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                 <option value="Other">Other</option>
               </select>
               <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
            </div>

            {/* Time Filter */}
            <div className="relative">
              <select 
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                className="appearance-none bg-slate-800/50 border border-slate-700 rounded-lg py-2.5 pl-4 pr-10 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer hover:bg-slate-800 text-sm"
              >
                <option value="all">All Time</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
              </select>
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
            </div>

            {/* Favorite Toggle */}
            <button 
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all text-sm ${showFavoritesOnly ? 'bg-pink-500/20 border-pink-500 text-pink-200' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200'}`}
            >
              <Heart className={`w-3 h-3 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">Favorites</span>
            </button>
          </div>
        </div>

        {/* Grid */}
        {filteredHistory.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl">
            <Filter className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-400 mb-1">No epiphanies found</h3>
            <p className="text-slate-600 text-sm">Try adjusting your filters or make a new observation.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHistory.map((item) => (
              <div 
                key={item.id} 
                className={`group relative bg-slate-800/30 hover:bg-slate-800 border ${item.isChallenge ? 'border-indigo-500/30' : 'border-slate-700/50'} hover:border-indigo-500/30 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
              >
                {item.isChallenge && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">
                    CHALLENGE
                  </div>
                )}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-400 bg-indigo-950/30 px-2 py-1 rounded">
                        {item.content.concept}
                      </span>
                      {item.category && item.category !== 'Other' && (
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 border border-slate-700 px-2 py-1 rounded">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(item.id);
                      }}
                      className={`p-1.5 rounded-full hover:bg-white/10 transition-colors ${item.isFavorite ? 'text-pink-500' : 'text-slate-600 hover:text-pink-400'}`}
                    >
                      <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <h3 
                    onClick={() => onSelect(item)}
                    className="text-xl serif font-semibold text-slate-200 mb-2 line-clamp-2 group-hover:text-white cursor-pointer"
                  >
                    {item.content.title}
                  </h3>

                  <p className="text-sm text-slate-500 mb-4 line-clamp-2 italic">
                    "{item.originalInput}"
                  </p>

                  <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-700/30">
                    <span className="text-xs text-slate-600">
                      {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <button 
                      onClick={() => onSelect(item)}
                      className="text-xs font-medium text-indigo-400 flex items-center gap-1 hover:underline"
                    >
                      View 
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
    
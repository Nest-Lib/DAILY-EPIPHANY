
import React, { useState, useEffect, useMemo } from 'react';
import { CommunityPost, Category, User } from '../types';
import { getCommunityFeed, getPopularPosts, getTrendingObservations } from '../services/challengeService';
import { CommunityCard } from './CommunityCard';
import { TrendingUp, Flame, Filter } from 'lucide-react';

interface Props {
  user: User | null;
}

const CATEGORIES: (Category | 'All')[] = ['All', 'Nature', 'People', 'Objects', 'Feelings', 'Dreams', 'Memories', 'Urban', 'Other'];

export const CommunityPage: React.FC<Props> = ({ user }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [popularPosts, setPopularPosts] = useState<CommunityPost[]>([]);
  const [trendingObs, setTrendingObs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const fetchData = () => {
      setIsLoading(true);
      setTimeout(() => {
        setPosts(getCommunityFeed(15));
        setPopularPosts(getPopularPosts());
        setTrendingObs(getTrendingObservations());
        setIsLoading(false);
      }, 600);
    };
    fetchData();
  }, []);

  // Filter duplicates (by Title) and by Category
  const filteredPosts = useMemo(() => {
    // 1. Remove Duplicates based on Title to ensure content uniqueness
    // We use a Map to keep the first occurrence of each title
    const uniquePostsMap = new Map();
    posts.forEach(post => {
      if (!uniquePostsMap.has(post.epiphany.title)) {
        uniquePostsMap.set(post.epiphany.title, post);
      }
    });
    const uniquePosts = Array.from(uniquePostsMap.values());

    // 2. Filter by Category
    if (selectedCategory === 'All') {
      return uniquePosts;
    }
    return uniquePosts.filter(p => p.category === selectedCategory);
  }, [posts, selectedCategory]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-20 animate-fade-in">
      
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl serif font-bold text-white mb-2">Community Discoveries</h1>
        <p className="text-slate-400">Explore how others connect the mundane to the magnificent.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Feed (Left/Center) */}
        <div className="lg:col-span-2">
          
          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Posts Feed */}
          {isLoading ? (
            <div className="space-y-6">
              {[1,2,3].map(i => (
                <div key={i} className="h-64 bg-slate-800/30 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <CommunityCard key={post.id} post={post} currentUser={user} />
            ))
          ) : (
            <div className="text-center py-20 border border-dashed border-slate-800 rounded-xl">
              <p className="text-slate-500">No posts found in this category.</p>
            </div>
          )}
        </div>

        {/* Sidebar (Right) */}
        <div className="hidden lg:block space-y-8">
          
          {/* Trending Observations */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4 text-indigo-300">
              <TrendingUp className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-wider text-sm">Trending Observations</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingObs.map((obs, i) => (
                <span key={i} className="px-3 py-1 bg-slate-900/50 border border-slate-700 rounded-lg text-xs text-slate-300 hover:border-indigo-500/50 transition-colors cursor-default">
                  # {obs.toLowerCase().replace(/\s/g, '')}
                </span>
              ))}
            </div>
          </div>

          {/* Popular This Week */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6 text-orange-300">
              <Flame className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-wider text-sm">Popular This Week</h3>
            </div>
            <div className="space-y-6">
              {popularPosts.map((post, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-1.5 rounded">{i + 1}</span>
                    <span className="text-[10px] text-slate-500">{post.likes} likes</span>
                  </div>
                  <h4 className="text-sm font-serif font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                    {post.epiphany.title}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">
                    "{post.originalInput}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          <div className="text-xs text-slate-600 text-center pt-4 border-t border-slate-800">
            <p>Guidelines • Privacy • Terms</p>
            <p className="mt-1">© 2024 Daily Epiphany</p>
          </div>

        </div>
      </div>
    </div>
  );
};

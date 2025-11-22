
import React, { useState } from 'react';
import { CommunityPost, User } from '../types';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send } from 'lucide-react';

interface Props {
  post: CommunityPost;
  currentUser: User | null;
}

export const CommunityCard: React.FC<Props> = ({ post, currentUser }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments);
  const [newComment, setNewComment] = useState('');

  const handleLike = () => {
    if (isLiked) {
      setLikesCount(c => c - 1);
    } else {
      setLikesCount(c => c + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now().toString(),
      authorName: currentUser?.name || 'Guest',
      authorAvatar: currentUser?.avatarUrl || `https://ui-avatars.com/api/?name=Guest&background=random`,
      text: newComment,
      timestamp: new Date().toISOString()
    };

    setComments([...comments, comment]);
    setNewComment('');
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000; // seconds

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden hover:bg-slate-800/60 transition-colors mb-6">
      
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full border border-slate-600" />
          <div>
            <div className="text-sm font-medium text-slate-200">{post.author.name}</div>
            <div className="text-xs text-slate-500">{formatTime(post.timestamp)} • <span className="text-indigo-400">{post.category}</span></div>
          </div>
        </div>
        <button className="text-slate-500 hover:text-slate-300">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-2">
        <div className="mb-4 pl-4 border-l-2 border-indigo-500/30">
          <p className="text-slate-400 italic text-sm">"{post.originalInput}"</p>
        </div>
        
        <h3 className="text-xl font-serif text-slate-100 font-semibold mb-2">{post.epiphany.title}</h3>
        <p className="text-slate-300 text-sm leading-relaxed mb-3">
          {post.epiphany.explanation}
        </p>
        <div className="inline-block px-2 py-0.5 bg-slate-700/50 rounded text-[10px] text-slate-400 uppercase tracking-wider font-medium">
          {post.epiphany.concept}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-slate-700/30 flex items-center gap-6">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-colors ${isLiked ? 'text-pink-500' : 'text-slate-500 hover:text-pink-400'}`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likesCount}</span>
        </button>
        
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-400 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{comments.length}</span>
        </button>

        <button className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-white transition-colors ml-auto">
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="bg-slate-900/30 p-4 border-t border-slate-700/30 animate-fade-in">
          <div className="space-y-4 mb-4">
            {comments.length === 0 ? (
              <div className="text-center text-xs text-slate-600 italic py-2">No comments yet. Be the first!</div>
            ) : (
              comments.map((cmt) => (
                <div key={cmt.id} className="flex gap-3">
                  <img src={cmt.authorAvatar} alt={cmt.authorName} className="w-6 h-6 rounded-full mt-1" />
                  <div className="flex-1">
                    <div className="bg-slate-800/50 rounded-lg p-2">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs font-bold text-slate-300">{cmt.authorName}</span>
                        <span className="text-[10px] text-slate-600">{formatTime(cmt.timestamp)}</span>
                      </div>
                      <p className="text-xs text-slate-400">{cmt.text}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmitComment} className="relative">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full bg-slate-800 border border-slate-700 rounded-full py-2 pl-4 pr-10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button 
              type="submit"
              disabled={!newComment.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed p-1"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

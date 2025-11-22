import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Copy, Twitter, Facebook, Link as LinkIcon, Check, Loader2, Instagram } from 'lucide-react';
import { EpiphanyResult } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: EpiphanyResult;
}

declare global {
  interface Window {
    html2canvas: any;
  }
}

export const ShareModal: React.FC<Props> = ({ isOpen, onClose, data }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Generate shareable link
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}?share_title=${encodeURIComponent(data.content.title)}&share_concept=${encodeURIComponent(data.content.concept)}&share_expl=${encodeURIComponent(data.content.explanation)}&share_input=${encodeURIComponent(data.originalInput)}`
    : '';

  // Generate Image on open
  useEffect(() => {
    if (isOpen && cardRef.current && !imgUrl && window.html2canvas) {
      const generate = async () => {
        setIsGenerating(true);
        // Wait for fonts and render
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
          const canvas = await window.html2canvas(cardRef.current, {
            scale: 2, // High res
            backgroundColor: '#0f172a',
            useCORS: true,
            logging: false
          });
          setImgUrl(canvas.toDataURL('image/png'));
        } catch (e) {
          console.error("Image generation failed", e);
        } finally {
          setIsGenerating(false);
        }
      };
      generate();
    }
  }, [isOpen, imgUrl]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!imgUrl) return;
    const link = document.createElement('a');
    link.download = `daily-epiphany-${data.id}.png`;
    link.href = imgUrl;
    link.click();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyText = () => {
    const text = `Daily Epiphany: "${data.originalInput}" → ${data.content.title}.\n\n${data.content.explanation}\n\nDiscover yours at ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(`I just had an epiphany about "${data.originalInput}"... ✨\n\n${data.content.title}`);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=DailyEpiphany,CosmicAwe`, '_blank');
  };

  const handleFacebook = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative my-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-slate-800/50 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Preview / Canvas Source */}
        <div className="w-full md:w-1/2 bg-slate-950 p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-800 relative">
          
          {isGenerating && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/80">
              <div className="flex items-center gap-2 text-indigo-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">Generating card...</span>
              </div>
            </div>
          )}

          {/* The element we capture (Always rendered, but maybe hidden if imgUrl exists to prevent flickering) */}
          <div 
            ref={cardRef}
            className="w-[400px] h-[500px] relative flex flex-col overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-8 text-center shadow-2xl select-none"
            style={{ minWidth: '400px', minHeight: '500px' }} // Fixed size for consistency
          >
             {/* Border Decoration */}
             <div className="absolute inset-4 border border-indigo-500/20 rounded-none pointer-events-none"></div>
             <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-indigo-400/40"></div>
             <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-indigo-400/40"></div>
             <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-indigo-400/40"></div>
             <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-indigo-400/40"></div>

             {/* Content */}
             <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                <div className="mb-6">
                   <div className="text-[10px] uppercase tracking-[0.3em] text-indigo-300 font-medium mb-2">Daily Epiphany</div>
                   <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto"></div>
                </div>

                <h2 className="text-2xl serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-indigo-100 to-indigo-200 mb-4 leading-tight drop-shadow-sm">
                   {data.content.title}
                </h2>

                <div className="relative mb-6">
                   <span className="absolute -top-4 -left-2 text-4xl serif text-indigo-500/20">"</span>
                   <p className="text-sm text-slate-200 font-serif leading-relaxed px-2">
                     {data.content.explanation.length > 200 
                       ? data.content.explanation.substring(0, 200) + '...' 
                       : data.content.explanation}
                   </p>
                   <span className="absolute -bottom-6 -right-2 text-4xl serif text-indigo-500/20 leading-[0]">"</span>
                </div>

                <div className="mt-auto pt-4 w-full border-t border-indigo-500/10">
                   <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Origin</div>
                   <p className="text-xs text-indigo-200/80 italic">"{data.originalInput}"</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Side: Controls */}
        <div className="w-full md:w-1/2 p-8 flex flex-col">
           <h3 className="text-xl serif font-bold text-white mb-1">Share Discovery</h3>
           <p className="text-slate-400 text-sm mb-8">Spread the awe. Choose how you want to share.</p>

           <div className="grid grid-cols-1 gap-3 mb-6">
              <button 
                onClick={handleTwitter}
                className="flex items-center justify-center gap-3 w-full bg-slate-800 hover:bg-[#1DA1F2]/20 hover:border-[#1DA1F2]/50 border border-slate-700 p-3 rounded-xl transition-all group"
              >
                 <Twitter className="w-5 h-5 text-slate-400 group-hover:text-[#1DA1F2]" />
                 <span className="font-medium text-slate-300 group-hover:text-[#1DA1F2]">Share on Twitter</span>
              </button>
              
              <button 
                onClick={handleFacebook}
                className="flex items-center justify-center gap-3 w-full bg-slate-800 hover:bg-[#4267B2]/20 hover:border-[#4267B2]/50 border border-slate-700 p-3 rounded-xl transition-all group"
              >
                 <Facebook className="w-5 h-5 text-slate-400 group-hover:text-[#4267B2]" />
                 <span className="font-medium text-slate-300 group-hover:text-[#4267B2]">Share on Facebook</span>
              </button>

              <button 
                onClick={handleDownload}
                disabled={!imgUrl}
                className="flex items-center justify-center gap-3 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all shadow-lg shadow-indigo-900/20"
              >
                 <Download className="w-5 h-5" />
                 <span className="font-medium">Download Image</span>
              </button>
           </div>

           <div className="mt-auto space-y-3">
              <div className="flex gap-3">
                <button 
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 p-2.5 rounded-lg hover:bg-slate-700 transition-colors text-sm text-slate-300"
                >
                   {copiedLink ? <Check className="w-4 h-4 text-green-400" /> : <LinkIcon className="w-4 h-4" />}
                   {copiedLink ? 'Copied!' : 'Copy Link'}
                </button>
                <button 
                  onClick={handleCopyText}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 p-2.5 rounded-lg hover:bg-slate-700 transition-colors text-sm text-slate-300"
                >
                   {copiedText ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                   {copiedText ? 'Copied!' : 'Copy Text'}
                </button>
              </div>
              <p className="text-xs text-center text-slate-500">
                Images include attribution to Daily Epiphany.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};
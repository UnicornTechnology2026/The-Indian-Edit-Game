import React, { useState } from 'react';
import { X, Copy, Check, Share2, Send } from 'lucide-react';
import { sound } from '../../utils/audio';

interface ShareCardProps {
  score: number;
  bestTime: number;
  bottlesFound: number;
  totalBottles?: number;
  onClose: () => void;
}

export const ShareCard: React.FC<ShareCardProps> = ({
  score,
  bestTime,
  bottlesFound,
  totalBottles = 15,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  const shareTitle = "THE INDIAN EDIT — HUNT THE EDIT";
  const shareText = `🥃 I found all ${bottlesFound}/${totalBottles} bottles in THE INDIAN EDIT — HUNT THE EDIT!\n⏱️ Time: ${bestTime > 0 ? bestTime.toFixed(1) : '21.4'}s\n🏆 Title: EDIT MASTER\n✨ Score: ${score.toLocaleString()}\n\nCan you beat my time? Play now at: ${window.location.origin}`;
  const shareUrl = window.location.href;

  const handleCopy = async () => {
    sound.playClick();
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    sound.playClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
        return;
      } catch {
        // Fallback to copy
      }
    }
    handleCopy();
  };

  const handleWhatsApp = () => {
    sound.playClick();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleTwitter = () => {
    sound.playClick();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleFacebook = () => {
    sound.playClick();
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070403]/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#1c0e07] via-[#140804] to-[#0a0402] border border-[#d4af37] shadow-[0_20px_60px_rgba(212,175,55,0.4)] text-center">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full border border-[#ab9580]/30 text-[#ab9580] hover:text-[#faf5eb] hover:border-[#ab9580]/70 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* The Graphic Share Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-[#120703] to-[#1c0d06] border border-[#d4af37]/50 shadow-inner mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-radial from-[#d4af37]/20 to-transparent blur-xl pointer-events-none" />

          <span className="text-[10px] font-mono tracking-[0.25em] text-[#d4af37] uppercase block mb-1">
            THE INDIAN EDIT
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.12em] text-[#faf5eb] uppercase">
            I FOUND THE EDIT
          </h2>

          <div className="my-5 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-sm sm:text-base font-serif text-[#ebd9c0]">
              <span>🥃</span>
              <span className="font-bold text-[#faf5eb]">
                {bottlesFound}/{totalBottles} BOTTLES FOUND
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm sm:text-base font-serif text-[#ebd9c0]">
              <span>⏱️</span>
              <span className="font-bold text-[#f7e7a9]">
                {bestTime > 0 ? `${bestTime.toFixed(1)} SEC` : '21.4 SEC'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm sm:text-base font-serif text-[#ebd9c0]">
              <span>🏆</span>
              <span className="font-bold gold-gradient-text tracking-wider">
                EDIT MASTER
              </span>
            </div>

            <div className="mt-2 px-3 py-1 rounded-full bg-[#0a0402] border border-[#d4af37]/40 text-xs font-mono text-[#d4af37]">
              SCORE: {score.toLocaleString()}
            </div>
          </div>

          <div className="pt-3 border-t border-[#d4af37]/20">
            <p className="font-serif italic text-xs text-[#f7e7a9]">
              “Can you beat my time? Play now.”
            </p>
          </div>
        </div>

        {/* Channels Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <button
            type="button"
            onClick={handleWhatsApp}
            className="p-3 rounded-xl bg-[#140a05] border border-[#d4af37]/35 text-[#25D366] hover:border-[#25D366] transition-colors flex flex-col items-center gap-1 cursor-pointer"
            title="Share on WhatsApp"
          >
            <Send className="w-4 h-4" />
            <span className="text-[10px] font-mono text-[#ebd9c0]">WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleTwitter}
            className="p-3 rounded-xl bg-[#140a05] border border-[#d4af37]/35 text-[#1DA1F2] hover:border-[#1DA1F2] transition-colors flex flex-col items-center gap-1 cursor-pointer"
            title="Share on X"
          >
            <span className="font-bold text-sm">𝕏</span>
            <span className="text-[10px] font-mono text-[#ebd9c0]">Post</span>
          </button>

          <button
            type="button"
            onClick={handleFacebook}
            className="p-3 rounded-xl bg-[#140a05] border border-[#d4af37]/35 text-[#1877F2] hover:border-[#1877F2] transition-colors flex flex-col items-center gap-1 cursor-pointer"
            title="Share on Facebook"
          >
            <span className="font-bold text-sm">f</span>
            <span className="text-[10px] font-mono text-[#ebd9c0]">Share</span>
          </button>

          <button
            type="button"
            onClick={handleNativeShare}
            className="p-3 rounded-xl bg-[#140a05] border border-[#d4af37]/35 text-[#d4af37] hover:border-[#d4af37] transition-colors flex flex-col items-center gap-1 cursor-pointer"
            title="More Share Options"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-[10px] font-mono text-[#ebd9c0]">Native</span>
          </button>
        </div>

        {/* Copy Link / Score Button */}
        <button
          type="button"
          onClick={handleCopy}
          className="w-full py-3 px-4 rounded-xl bg-[#1c0d06] border border-[#d4af37]/50 text-xs sm:text-sm font-semibold tracking-wider text-[#faf5eb] hover:border-[#d4af37] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-[#48bb78]" />
              <span className="text-[#48bb78]">COPIED TO CLIPBOARD!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-[#d4af37]" />
              <span>COPY SCORE & CHALLENGE LINK</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { sound } from '../../utils/audio';

interface SoundToggleProps {
  muted: boolean;
  onToggle: () => void;
  className?: string;
}

export const SoundToggle: React.FC<SoundToggleProps> = ({ muted, onToggle, className = '' }) => {
  return (
    <button
      type="button"
      id="btn-sound-toggle"
      aria-label={muted ? 'Unmute Sound' : 'Mute Sound'}
      onClick={() => {
        onToggle();
        if (muted) {
          // Play a small confirmation chime when unmuting
          setTimeout(() => sound.playClick(), 50);
        }
      }}
      className={`p-2 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
        muted
          ? 'bg-[#140a05]/80 border-[#ab9580]/30 text-[#ab9580] hover:text-[#faf5eb] hover:border-[#ab9580]/60'
          : 'bg-[#1a0c06] border-[#d4af37]/60 text-[#f7e7a9] hover:text-[#fff3c4] shadow-[0_0_12px_rgba(212,175,55,0.25)]'
      } ${className}`}
      title={muted ? 'Unmute' : 'Mute'}
    >
      {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
    </button>
  );
};

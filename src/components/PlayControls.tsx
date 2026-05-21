import { useAudio } from '../context/AudioContext';
import { PrevIcon, NextIcon } from './Icons';

interface PlayControlsProps {
  onPrev: () => void;
  onToggle: () => void;
  onNext: () => void;
  isPlaying: boolean;
}

export default function PlayControls({ onPrev, onToggle, onNext, isPlaying }: PlayControlsProps) {
  const { state } = useAudio();

  return (
    <div className="flex justify-center items-center gap-10 py-3">
      <button onClick={onPrev} className="transition-transform hover:scale-110">
        <PrevIcon size={26} />
      </button>

      {/* Center play/pause button with neon glow */}
      <button
        onClick={onToggle}
        className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105"
        style={{
          background: '#1db954',
          animation: state.currentTrack ? 'pulse-glow 2s ease-in-out infinite' : 'none',
          boxShadow: state.currentTrack
            ? '0 0 24px rgba(29,185,84,0.5)'
            : '0 0 8px rgba(29,185,84,0.2)',
        }}
      >
        {isPlaying
          ? <svg width="22" height="22" viewBox="0 0 24 24" fill="#0a0a0a"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
          : <svg width="22" height="22" viewBox="0 0 24 24" fill="#0a0a0a"><path d="M8 5.14v14l11-7-11-7z" /></svg>
        }
      </button>

      <button onClick={onNext} className="transition-transform hover:scale-110">
        <NextIcon size={26} />
      </button>
    </div>
  );
}

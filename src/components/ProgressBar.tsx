import { useRef, useCallback } from 'react';
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';

interface ProgressBarProps {
  seek: (time: number) => void;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ProgressBar({ seek }: ProgressBarProps) {
  const { state } = useAudio();
  const { colors } = useTheme();
  const { currentTime, duration, currentTrack } = state;
  const barRef = useRef<HTMLDivElement>(null);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!barRef.current || duration <= 0) return;
      const rect = barRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      seek(ratio * duration);
    },
    [duration, seek]
  );

  return (
    <div className="px-8 py-4">
      <div
        ref={barRef}
        className="w-full h-1 rounded-full relative cursor-pointer group"
        style={{ background: colors.border }}
        onClick={handleClick}
      >
        <div
          className="h-full rounded-full relative"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #1db954, #1ed760)',
            boxShadow: currentTrack ? '0 0 12px rgba(29,185,84,0.4)' : 'none',
          }}
        >
          {currentTrack && (
            <div
              className="absolute -right-1.5 -top-1 w-3.5 h-3.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background: '#1db954',
                boxShadow: '0 0 14px rgba(29,185,84,0.6)',
              }}
            />
          )}
        </div>
      </div>
      <div className="flex justify-between mt-1.5">
        <span style={{ color: colors.muted, fontSize: 12 }}>{formatTime(currentTime)}</span>
        <span style={{ color: colors.muted, fontSize: 12 }}>{formatTime(duration)}</span>
      </div>
    </div>
  );
}

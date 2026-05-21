import type { PlayMode } from '../types';
import { useTheme } from '../context/ThemeContext';
import VolumeSlider from './VolumeSlider';
import { HeartIcon, PlaylistIcon, ShuffleIcon, RepeatIcon, RepeatOneIcon } from './Icons';

interface BottomActionsProps {
  playMode: PlayMode;
  onCyclePlayMode: () => void;
  onTogglePlaylist: () => void;
  onToggleLibrary?: () => void;
  isLiked?: boolean;
  onToggleLike?: () => void;
}

function PlayModeIcon({ mode }: { mode: PlayMode }) {
  switch (mode) {
    case 'random': return <ShuffleIcon size={20} />;
    case 'single': return <RepeatOneIcon size={20} />;
    default: return <RepeatIcon size={20} />;
  }
}

export default function BottomActions({ playMode, onCyclePlayMode, onTogglePlaylist, onToggleLibrary, isLiked, onToggleLike }: BottomActionsProps) {
  const { colors } = useTheme();

  return (
    <div className="flex justify-around items-center px-5 py-3" style={{ borderTop: `1px solid ${colors.card}` }}>
      {onToggleLibrary && (
        <button className="hover:brightness-150 transition-all" onClick={onToggleLibrary}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
        </button>
      )}
      <button className="hover:brightness-150 transition-all" onClick={onToggleLike}>
        {isLiked ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#e74c3c" stroke="#e74c3c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        ) : (
          <HeartIcon size={20} />
        )}
      </button>
      <button className="hover:brightness-150 transition-all" onClick={onCyclePlayMode}>
        <PlayModeIcon mode={playMode} />
      </button>
      <button className="hover:brightness-150 transition-all" onClick={onTogglePlaylist}>
        <PlaylistIcon size={20} />
      </button>
      <VolumeSlider />
    </div>
  );
}

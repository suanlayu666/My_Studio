import { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import { VolumeHighIcon, VolumeLowIcon, VolumeMuteIcon } from './Icons';

export default function VolumeSlider() {
  const { state, dispatch } = useAudio();
  const { colors } = useTheme();
  const [showSlider, setShowSlider] = useState(false);

  const Icon = state.volume === 0 ? VolumeMuteIcon : state.volume < 0.5 ? VolumeLowIcon : VolumeHighIcon;

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      <button
        className="hover:brightness-150 transition-all"
        onClick={() => dispatch({ type: 'SET_VOLUME', volume: state.volume > 0 ? 0 : 0.7 })}
      >
        <Icon size={18} />
      </button>

      <div
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 transition-all duration-200 ${
          showSlider ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="flex flex-col items-center gap-2 p-3 rounded-lg border" style={{ background: colors.surface, borderColor: colors.border }}>
          <span className="text-studio-green text-xs font-mono">{Math.round(state.volume * 100)}</span>
          <div
            className="relative w-1.5 h-24 rounded-full cursor-pointer"
            style={{ background: colors.border }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = 1 - Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
              dispatch({ type: 'SET_VOLUME', volume: ratio });
            }}
          >
            <div
              className="absolute bottom-0 w-full rounded-full"
              style={{
                height: `${state.volume * 100}%`,
                background: 'linear-gradient(to top, #1db954, #1ed760)',
                boxShadow: '0 0 8px rgba(29,185,84,0.4)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

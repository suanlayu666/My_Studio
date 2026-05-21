import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import { SearchIcon, MusicNoteSmallIcon, SunIcon, MoonIcon } from './Icons';

export default function TopBar() {
  const { dispatch } = useAudio();
  const { theme, colors, toggleTheme } = useTheme();

  return (
    <div className="flex justify-between items-center px-4 pt-4 pb-2">
      <div className="flex items-center gap-1.5">
        <MusicNoteSmallIcon size={14} />
        <span style={{ color: colors.sub, fontSize: 12, letterSpacing: '0.05em' }}>My Studio</span>
      </div>
      <div className="flex gap-2 items-center">
        <button className="hover:brightness-150 transition-all" onClick={toggleTheme}>
          {theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
        </button>
        <button
          className="hover:brightness-150 transition-all"
          onClick={() => dispatch({ type: 'TOGGLE_SEARCH' })}
        >
          <SearchIcon size={18} />
        </button>
      </div>
    </div>
  );
}

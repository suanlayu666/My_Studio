import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';

export default function SongInfo() {
  const { state } = useAudio();
  const { colors } = useTheme();
  const { currentTrack } = state;

  if (!currentTrack) {
    return (
      <div className="text-center px-8">
        <div style={{ color: colors.sub, fontSize: 18 }}>No Track</div>
        <div style={{ color: colors.muted, fontSize: 14, marginTop: 4 }}>Add music to get started</div>
      </div>
    );
  }

  return (
    <div className="text-center px-8">
      <div style={{ color: colors.text, fontWeight: 'bold', fontSize: 20, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={currentTrack.title}>
        {currentTrack.title}
      </div>
      <div style={{ color: colors.sub, fontSize: 14, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={currentTrack.artist}>
        {currentTrack.artist}
      </div>
    </div>
  );
}

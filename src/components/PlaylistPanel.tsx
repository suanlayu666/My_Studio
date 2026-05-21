import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import type { Track } from '../types';
import { ChevronLeftIcon, CloseIcon, MusicNoteSmallIcon, PauseIcon, PlayIcon } from './Icons';

function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function hasSource(track: Track): boolean {
  return !!track.url || !!track.file;
}

export default function PlaylistPanel() {
  const { state, dispatch } = useAudio();
  const { colors } = useTheme();
  const { playlist, currentTrack, isPlaying, isPlaylistOpen } = state;

  if (!isPlaylistOpen) return null;

  const offlineCount = playlist.filter(t => !hasSource(t)).length;

  const handleSelect = (track: Track) => {
    if (!hasSource(track)) return;
    dispatch({ type: 'SET_TRACK', track });
  };

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dispatch({ type: 'REMOVE_FROM_PLAYLIST', id });
  };

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col rounded-2xl overflow-hidden"
      style={{ background: colors.bg, animation: 'slide-up 0.3s ease-out' }}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-4 pt-4 pb-2">
        <button className="flex items-center gap-1" onClick={() => dispatch({ type: 'TOGGLE_PLAYLIST' })}>
          <ChevronLeftIcon size={20} />
          <span className="text-studio-green text-sm">返回</span>
        </button>
        <span style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>播放列表</span>
        <span style={{ color: colors.muted, fontSize: 14 }}>{playlist.length} 首</span>
      </div>

      {/* Offline warning */}
      {offlineCount > 0 && (
        <div className="mx-4 mb-2 px-3 py-2 rounded-lg text-xs flex items-center gap-2"
          style={{ background: colors.surface, color: colors.muted }}
        >
          <span>⚠</span>
          <span>{offlineCount} 首歌缺少源文件，请重新拖入文件夹恢复播放</span>
        </div>
      )}

      {/* Now playing banner */}
      {currentTrack && (
        <div className="mx-4 my-2 p-3 rounded-lg flex items-center gap-3"
          style={{ background: colors.surface, borderLeft: '3px solid #1db954' }}
        >
          <div className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${colors.coverGradient[0]}, ${colors.coverGradient[1]})`, border: '1px solid rgba(29,185,84,0.3)' }}
          >
            <MusicNoteSmallIcon size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-studio-green text-sm font-bold truncate">{currentTrack.title}</div>
            <div style={{ color: colors.muted, fontSize: 12 }}>{currentTrack.artist} · {formatDuration(currentTrack.duration)}</div>
          </div>
          {isPlaying && (
            <div className="flex gap-0.5 items-end h-4 flex-shrink-0">
              <div style={{ width: 2, height: 8, background: '#1db954', borderRadius: 1, animation: 'eq1 0.6s ease infinite' }} />
              <div style={{ width: 2, height: 14, background: '#1db954', borderRadius: 1, animation: 'eq2 0.6s ease infinite 0.15s' }} />
              <div style={{ width: 2, height: 6, background: '#1db954', borderRadius: 1, animation: 'eq3 0.6s ease infinite 0.1s' }} />
            </div>
          )}
        </div>
      )}

      {/* Song list */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4">
        {playlist.length === 0 ? (
          <div className="text-center py-12 text-sm" style={{ color: colors.muted }}>
            <div className="mb-2 flex justify-center"><MusicNoteSmallIcon size={32} /></div>
            播放列表为空<br />
            <span className="text-xs">拖拽文件或文件夹来添加歌曲</span>
          </div>
        ) : (
          playlist.map((track, idx) => {
            const isActive = currentTrack?.id === track.id;
            const isOffline = !hasSource(track);
            return (
              <div
                key={track.id}
                onClick={() => handleSelect(track)}
                className={`flex items-center gap-3 py-2.5 px-2 rounded transition-colors ${
                  isOffline ? 'cursor-default' : 'cursor-pointer'
                }`}
                style={{
                  background: isActive ? 'rgba(29,185,84,0.08)' : 'transparent',
                  opacity: isOffline ? 0.4 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isActive && !isOffline) e.currentTarget.style.background = colors.card;
                }}
                onMouseLeave={(e) => {
                  if (!isActive && !isOffline) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ color: isActive ? '#1db954' : colors.muted, fontSize: 12, width: 20, fontWeight: isActive ? 'bold' : 'normal' }}>
                  {isActive && isPlaying ? (
                    <div className="flex gap-px items-end h-3">
                      <div style={{ width: 2, height: 6, background: '#1db954', borderRadius: 1, animation: 'eq1 0.5s ease infinite' }} />
                      <div style={{ width: 2, height: 10, background: '#1db954', borderRadius: 1, animation: 'eq2 0.5s ease infinite 0.15s' }} />
                      <div style={{ width: 2, height: 4, background: '#1db954', borderRadius: 1, animation: 'eq3 0.5s ease infinite 0.1s' }} />
                    </div>
                  ) : (
                    isOffline ? '·' : idx + 1
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <div style={{
                    color: isActive ? '#1db954' : colors.text,
                    fontSize: 13,
                    fontWeight: isActive ? 'bold' : 'normal',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {track.title}
                  </div>
                  <div style={{
                    color: colors.muted, fontSize: 12,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {isOffline ? '缺少源文件' : track.artist}
                  </div>
                </div>
                <span style={{ color: colors.muted, fontSize: 12 }}>{formatDuration(track.duration)}</span>
                <button onClick={(e) => handleRemove(e, track.id)} className="flex-shrink-0 hover:brightness-150 transition-all">
                  <CloseIcon size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom player bar */}
      {currentTrack && (
        <div className="flex items-center gap-3 px-4 py-3" style={{ background: colors.surface, borderTop: '1px solid rgba(29,185,84,0.2)' }}>
          <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${colors.coverGradient[0]}, ${colors.coverGradient[1]})`, border: '1px solid rgba(29,185,84,0.3)' }}
          >
            <MusicNoteSmallIcon size={12} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-studio-green text-xs font-bold truncate">{currentTrack.title} - {currentTrack.artist}</div>
          </div>
          <button onClick={() => dispatch({ type: 'TOGGLE_PLAY' })}>
            {isPlaying ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
          </button>
        </div>
      )}
    </div>
  );
}

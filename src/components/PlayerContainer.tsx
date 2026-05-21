import { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAudio } from '../context/AudioContext';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useFileDrop } from '../hooks/useFileDrop';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';
import { useMusicLibrary, saveToStorage, loadFromStorage, parseAudioFile } from '../hooks/useMusicLibrary';
import { useFavorites } from '../hooks/useFavorites';
import { FolderIcon } from './Icons';
import TopBar from './TopBar';
import CoverArt from './CoverArt';
import SongInfo from './SongInfo';
import ProgressBar from './ProgressBar';
import PlayControls from './PlayControls';
import BottomActions from './BottomActions';
import PlaylistPanel from './PlaylistPanel';
import SearchPanel from './SearchPanel';
import MusicLibrary from './MusicLibrary';
import type { Playlist } from './MusicLibrary';
import type { SavedPlaylistEntry } from '../hooks/useMusicLibrary';

interface Props {
  playlists: Playlist[];
  autoPlaylist: Playlist | null;
  onAutoRestored: () => void;
}

export default function PlayerContainer({ playlists, autoPlaylist, onAutoRestored }: Props) {
  const { theme, colors } = useTheme();
  const player = useAudioPlayer();
  const { state, dispatch } = useAudio();
  useAudioAnalyzer({ audioEl: player.audioRef.current, isPlaying: player.isPlaying });
  const { isDragging, handleDragEnter, handleDragOver, handleDragLeave, handleDrop, handleFileSelect } = useFileDrop();
  const { importFolder } = useMusicLibrary();
  const { isLiked, toggleLike } = useFavorites();

  const showLibrary = playlists.length > 0 && !state.isPlaylistOpen && !state.isSearchOpen && state.currentPlaylistView;

  useEffect(() => {
    const saved = loadFromStorage();
    if (saved?.playlist?.length) {
      const tracks = saved.playlist.map((e: SavedPlaylistEntry) => ({
        id: e.id, title: e.title, artist: e.artist, album: e.album,
        duration: e.duration, cover: e.cover, source: 'local' as const, url: '', file: undefined,
      }));
      dispatch({ type: 'SET_PLAYLIST', playlist: tracks });
      if (saved.playMode) dispatch({ type: 'SET_PLAY_MODE', mode: saved.playMode as any });
      if (saved.volume !== undefined) dispatch({ type: 'SET_VOLUME', volume: saved.volume });
    }
  }, []);

  useEffect(() => {
    if (state.playlist.length === 0) return;
    const entries: SavedPlaylistEntry[] = state.playlist
      .filter(t => t.source === 'local')
      .map(t => ({ id: t.id, title: t.title, artist: t.artist, album: t.album, duration: t.duration, cover: t.cover, source: 'local' as const, fileName: t.id }));
    if (entries.length > 0) {
      saveToStorage({ playlist: entries, currentTrackId: state.currentTrack?.id || null, volume: state.volume, playMode: state.playMode });
    }
  }, [state.playlist, state.currentTrack?.id, state.volume, state.playMode]);

  const handleImportFolder = async () => {
    const files = await importFolder();
    if (files.length === 0) return;
    const tracks = [];
    for (const file of files) tracks.push(await parseAudioFile(file));
    if (tracks.length > 0) {
      dispatch({ type: 'SET_PLAYLIST', playlist: tracks });
      dispatch({ type: 'SET_TRACK', track: tracks[0] });
    }
  };

  return (
    <div
      className="w-[660px] h-[700px] rounded-2xl overflow-hidden relative select-none flex shadow-2xl"
      style={{
        background: colors.bg,
        boxShadow: theme === 'dark' ? '0 0 60px rgba(0,0,0,0.5), 0 0 120px rgba(0,0,0,0.3)' : '0 0 60px rgba(0,0,0,0.1), 0 0 120px rgba(0,0,0,0.05)',
      }}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Library sidebar */}
      {showLibrary && (
        <div className="w-[280px] h-full overflow-y-auto hide-scrollbar border-r flex-shrink-0" style={{ borderColor: colors.border, background: colors.bg }}>
          <MusicLibrary
            playlists={playlists}
            autoPlaylist={autoPlaylist}
            onAutoRestored={onAutoRestored}
            embedded
          />
        </div>
      )}

      {/* Main player */}
      <div className={`${showLibrary ? 'w-[375px]' : 'w-full'} h-[700px] flex flex-col relative flex-shrink-0`}>
        {isDragging && (
          <div className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl pointer-events-none"
            style={{ background: theme === 'dark' ? 'rgba(10,10,10,0.9)' : 'rgba(250,250,250,0.9)', border: '2px dashed #1db954', boxShadow: '0 0 40px rgba(29,185,84,0.3) inset' }}>
            <div className="text-center"><div className="text-studio-green text-4xl mb-3">🎵</div><div className="text-studio-green font-bold text-lg">拖入文件或文件夹</div></div>
          </div>
        )}
        <TopBar />
        <CoverArt />
        <SongInfo />
        <ProgressBar seek={player.seek} />
        <PlayControls onPrev={player.prevTrack} onToggle={player.togglePlay} onNext={player.nextTrack} isPlaying={player.isPlaying} />
        <div className="flex-1" />
        <BottomActions
          playMode={player.playMode}
          onCyclePlayMode={player.cyclePlayMode}
          onTogglePlaylist={() => player.dispatch({ type: 'TOGGLE_PLAYLIST' })}
          onToggleLibrary={() => player.dispatch({ type: 'TOGGLE_LIBRARY' })}
          isLiked={!!state.currentTrack && isLiked(state.currentTrack.id)}
          onToggleLike={() => {
            if (state.currentTrack) toggleLike(state.currentTrack);
          }}
        />
        <div className="flex justify-center gap-4 mb-1">
          <button onClick={handleFileSelect} className="flex items-center gap-1 text-xs hover:brightness-150 transition-all" style={{ color: colors.muted }}>
            <span style={{ color: '#1db954', fontSize: 16, lineHeight: 1 }}>+</span>选择文件
          </button>
          <button onClick={handleImportFolder} className="flex items-center gap-1 text-xs hover:brightness-150 transition-all" style={{ color: colors.muted }}>
            <FolderIcon size={16} />选择文件夹
          </button>
        </div>
        <PlaylistPanel />
        <SearchPanel />
      </div>
    </div>
  );
}

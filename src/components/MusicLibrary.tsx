import { useState, useEffect, useCallback } from 'react';
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import { parseBlob } from 'music-metadata';
import { ChevronLeftIcon } from './Icons';
import type { Track } from '../types';

export interface ManifestTrack {
  name: string;
  path: string;
}

export interface Playlist {
  name: string;
  path: string;
  tracks: ManifestTrack[];
}

function formatDuration(s: number) {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

async function fetchAndParse(path: string): Promise<Track> {
  const res = await fetch(import.meta.env.BASE_URL + path);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  try {
    const meta = await parseBlob(blob, { skipCovers: false });
    const common = meta.common;
    let cover: string | undefined;
    if (common.picture?.[0]) {
      const pic = common.picture[0];
      const coverBlob = new Blob([pic.data as unknown as BlobPart], { type: pic.format });
      cover = await new Promise<string>(resolve => {
        const r = new FileReader();
        r.onloadend = () => resolve(r.result as string);
        r.readAsDataURL(coverBlob);
      });
    }
    return {
      id: path,
      title: common.title || path.split('/').pop()!.replace(/\.[^.]+$/, ''),
      artist: common.artist || 'Unknown Artist',
      album: common.album,
      duration: meta.format.duration || 0,
      cover,
      source: 'local',
      url,
    };
  } catch {
    return {
      id: path,
      title: path.split('/').pop()!.replace(/\.[^.]+$/, ''),
      artist: 'Unknown Artist',
      duration: 0,
      source: 'local',
      url,
    };
  }
}

interface Props {
  playlists: Playlist[];
  autoPlaylist?: Playlist | null;
  onAutoRestored?: () => void;
  embedded?: boolean;
}

export default function MusicLibrary({ playlists, autoPlaylist, onAutoRestored, embedded }: Props) {
  const { state, dispatch } = useAudio();
  const { colors } = useTheme();
  const [selectedPl, setSelectedPl] = useState<Playlist | null>(null);
  const [loadingTracks, setLoadingTracks] = useState(false);

  // Auto-restore playlist on mount
  useEffect(() => {
    if (autoPlaylist && !selectedPl) {
      setSelectedPl(autoPlaylist);
      setLoadingTracks(true);
      Promise.all(autoPlaylist.tracks.map(t => fetchAndParse(t.path)))
        .then(tracks => {
          dispatch({ type: 'SET_PLAYLIST', playlist: tracks });
        })
        .finally(() => {
          setLoadingTracks(false);
          onAutoRestored?.();
        });
    }
  }, [autoPlaylist]);

  const openPlaylist = useCallback(async (pl: Playlist) => {
    setSelectedPl(pl);
    setLoadingTracks(true);
    localStorage.setItem('my-studio-last-playlist', pl.name);

    if (pl.path === '__favorites__') {
      // Load favorites from localStorage
      const raw = localStorage.getItem('my-studio-favorites');
      const favs = raw ? JSON.parse(raw) : [];
      const tracks: Track[] = favs.map((f: any) => ({
        id: f.id, title: f.title, artist: f.artist, album: f.album,
        duration: f.duration, cover: f.cover, source: 'local' as const,
        url: f.path.startsWith('music/') ? '/' + f.path : '',
      }));
      dispatch({ type: 'SET_PLAYLIST', playlist: tracks });
    } else {
      const tracks = await Promise.all(pl.tracks.map(t => fetchAndParse(t.path)));
      dispatch({ type: 'SET_PLAYLIST', playlist: tracks });
    }
    setLoadingTracks(false);
  }, [dispatch]);

  const playTrack = useCallback((track: Track) => {
    dispatch({ type: 'SET_TRACK', track });
  }, [dispatch]);

  if (selectedPl) {
    const plTracks = state.playlist.filter(t => selectedPl.tracks.some(mt => mt.path === t.id));
    return (
      <div className={`flex flex-col ${embedded ? 'p-3' : ''}`}>
        <button
          className="flex items-center gap-1 mb-3 px-1"
          onClick={() => setSelectedPl(null)}
        >
          <ChevronLeftIcon size={16} />
          <span className="text-studio-green text-xs">歌单列表</span>
        </button>
        <div className="rounded-xl overflow-hidden" style={{ background: colors.bg }}>
          <div className="px-3 py-2" style={{ background: colors.surface, borderLeft: '3px solid #1db954' }}>
            <div style={{ color: colors.text, fontWeight: 'bold', fontSize: 14 }}>{selectedPl.name}</div>
            <div style={{ color: colors.muted, fontSize: 11 }}>{selectedPl.tracks.length} 首</div>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto hide-scrollbar" style={{ borderColor: colors.border }}>
            {loadingTracks ? (
              <div className="px-3 py-6 text-center" style={{ color: colors.muted, fontSize: 12 }}>加载中...</div>
            ) : plTracks.length === 0 ? (
              <div className="px-3 py-8 text-center" style={{ color: colors.muted, fontSize: 12 }}>暂无歌曲</div>
            ) : (
              plTracks.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:brightness-110 transition-all"
                  style={{ background: state.currentTrack?.id === track.id ? 'rgba(29,185,84,0.08)' : 'transparent' }}
                  onClick={() => playTrack(track)}
                >
                  <span style={{ color: state.currentTrack?.id === track.id ? '#1db954' : colors.muted, fontSize: 11, width: 16 }}>
                    {state.currentTrack?.id === track.id && state.isPlaying ? '♪' : '♫'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div style={{ color: state.currentTrack?.id === track.id ? '#1db954' : colors.text, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: state.currentTrack?.id === track.id ? 'bold' : 'normal' }}>
                      {track.title}
                    </div>
                    <div style={{ color: colors.muted, fontSize: 10 }}>{track.artist}</div>
                  </div>
                  <span style={{ color: colors.muted, fontSize: 10 }}>{formatDuration(track.duration)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 ${embedded ? 'p-3' : ''}`} style={embedded ? undefined : { width: 280 }}>
      {playlists.map((pl) => (
        <div
          key={pl.name}
          className="rounded-xl overflow-hidden cursor-pointer hover:brightness-110 transition-all"
          style={{ background: colors.surface, borderLeft: '3px solid #1db954' }}
          onClick={() => openPlaylist(pl)}
        >
          <div className="px-3 py-2.5">
            <div style={{ color: colors.text, fontWeight: 'bold', fontSize: 14 }}>{pl.name}</div>
            <div style={{ color: colors.muted, fontSize: 11, marginTop: 1 }}>{pl.tracks.length} 首</div>
          </div>
        </div>
      ))}
    </div>
  );
}

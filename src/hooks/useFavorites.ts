import { useState, useCallback, useEffect } from 'react';
import type { Track } from '../types';

const STORAGE_KEY = 'my-studio-favorites';
const CHANGE_EVENT = 'favorites-changed';

interface LikedTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  cover?: string;
  path: string;
}

function loadLiked(): LikedTrack[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function useFavorites() {
  const [liked, setLiked] = useState<LikedTrack[]>(loadLiked);

  // Listen for changes from other instances (same page, different hook call)
  useEffect(() => {
    const handler = () => setLiked(loadLiked());
    window.addEventListener(CHANGE_EVENT, handler);
    return () => window.removeEventListener(CHANGE_EVENT, handler);
  }, []);

  const saveAndNotify = useCallback((newLiked: LikedTrack[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLiked));
    setLiked(newLiked);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const isLiked = useCallback((trackId: string) => {
    return liked.some(t => t.id === trackId);
  }, [liked]);

  const toggleLike = useCallback((track: Track) => {
    const prev = loadLiked();
    const exists = prev.find(t => t.id === track.id);
    if (exists) {
      saveAndNotify(prev.filter(t => t.id !== track.id));
    } else {
      saveAndNotify([...prev, {
        id: track.id,
        title: track.title,
        artist: track.artist,
        album: track.album,
        duration: track.duration,
        cover: track.cover,
        path: track.id,
      }]);
    }
  }, [saveAndNotify]);

  const getLikedTracks = useCallback((): Track[] => {
    return liked.map(t => ({
      id: t.id, title: t.title, artist: t.artist, album: t.album,
      duration: t.duration, cover: t.cover, source: 'local' as const,
      url: t.path, file: undefined,
    }));
  }, [liked]);

  return { liked, isLiked, toggleLike, getLikedTracks };
}

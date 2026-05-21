import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { PlayerState, PlayerAction, Track, PlayMode } from '../types';

const initialState: PlayerState = {
  currentTrack: null,
  playlist: [],
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.7,
  playMode: 'sequential',
  isPlaylistOpen: false,
  isSearchOpen: false,
  currentPlaylistView: true,
  audioData: { bass: 0, mid: 0, treble: 0, amplitude: 0 },
};

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'SET_TRACK':
      return { ...state, currentTrack: action.track, currentTime: 0, isPlaying: true };
    case 'PLAY':
      return { ...state, isPlaying: true };
    case 'PAUSE':
      return { ...state, isPlaying: false };
    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying };
    case 'SET_TIME':
      return { ...state, currentTime: action.time };
    case 'SET_DURATION':
      return { ...state, duration: action.duration };
    case 'SET_VOLUME':
      return { ...state, volume: action.volume };
    case 'NEXT_TRACK': {
      const { playlist, currentTrack, playMode } = state;
      if (playlist.length === 0) return state;
      const idx = playlist.findIndex(t => t.id === currentTrack?.id);
      let next: Track;
      if (playMode === 'random') {
        const others = playlist.filter(t => t.id !== currentTrack?.id);
        next = others[Math.floor(Math.random() * others.length)] || playlist[0];
      } else if (playMode === 'single') {
        next = currentTrack || playlist[0];
      } else {
        next = idx < playlist.length - 1 ? playlist[idx + 1] : playlist[0];
      }
      return { ...state, currentTrack: next, currentTime: 0, isPlaying: true };
    }
    case 'PREV_TRACK': {
      const { playlist, currentTrack } = state;
      if (playlist.length === 0) return state;
      const idx = playlist.findIndex(t => t.id === currentTrack?.id);
      const prev = idx > 0 ? playlist[idx - 1] : playlist[playlist.length - 1];
      return { ...state, currentTrack: prev, currentTime: 0, isPlaying: true };
    }
    case 'ADD_TO_PLAYLIST': {
      // Merge: replace dupes with new versions (which have valid URLs), add truly new ones
      const merged = [...state.playlist];
      for (const t of action.tracks) {
        const idx = merged.findIndex(p => p.id === t.id);
        if (idx >= 0) {
          merged[idx] = t;
        } else {
          merged.push(t);
        }
      }
      const hadTrack = !!state.currentTrack;
      // Update currentTrack ref if it was replaced
      let currentTrack = state.currentTrack;
      if (currentTrack) {
        const updated = merged.find(p => p.id === currentTrack!.id);
        if (updated) currentTrack = updated;
      }
      currentTrack = currentTrack || merged[0] || null;
      return { ...state, playlist: merged, currentTrack, isPlaying: hadTrack ? state.isPlaying : true };
    }
    case 'REMOVE_FROM_PLAYLIST': {
      const playlist = state.playlist.filter(t => t.id !== action.id);
      const currentTrack = state.currentTrack?.id === action.id
        ? playlist[0] || null
        : state.currentTrack;
      return { ...state, playlist, currentTrack };
    }
    case 'SET_PLAYLIST': {
      // Keep current track if it's already in the new playlist
      const currentInNew = state.currentTrack && action.playlist.some(t => t.id === state.currentTrack!.id);
      return {
        ...state,
        playlist: action.playlist,
        currentTrack: currentInNew ? state.currentTrack : (action.playlist[0] || null),
        currentTime: currentInNew ? state.currentTime : 0,
        isPlaying: currentInNew ? state.isPlaying : false,
      };
    }
    case 'SET_PLAY_MODE':
      return { ...state, playMode: action.mode };
    case 'TOGGLE_PLAYLIST':
      return { ...state, isPlaylistOpen: !state.isPlaylistOpen, isSearchOpen: false };
    case 'TOGGLE_SEARCH':
      return { ...state, isSearchOpen: !state.isSearchOpen, isPlaylistOpen: false };
    case 'TOGGLE_LIBRARY':
      return { ...state, currentPlaylistView: !state.currentPlaylistView };
    case 'SET_AUDIO_DATA':
      return { ...state, audioData: action.data };
    default:
      return state;
  }
}

interface AudioContextValue {
  state: PlayerState;
  dispatch: React.Dispatch<PlayerAction>;
  nextTrack: () => void;
}

const AudioCtx = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, initialState);

  const nextTrack = () => dispatch({ type: 'NEXT_TRACK' });

  return (
    <AudioCtx.Provider value={{ state, dispatch, nextTrack }}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio must be inside AudioProvider');
  return ctx;
}

export function getNextPlayMode(current: PlayMode): PlayMode {
  const modes: PlayMode[] = ['sequential', 'random', 'single'];
  const idx = modes.indexOf(current);
  return modes[(idx + 1) % modes.length];
}
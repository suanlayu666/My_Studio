export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  cover?: string;
  source: 'local' | 'online';
  url: string;
  file?: File;
}

export type PlayMode = 'sequential' | 'random' | 'single';

export interface AudioData {
  bass: number;
  mid: number;
  treble: number;
  amplitude: number;
}

export interface PlayerState {
  currentTrack: Track | null;
  playlist: Track[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playMode: PlayMode;
  isPlaylistOpen: boolean;
  isSearchOpen: boolean;
  currentPlaylistView: boolean;
  audioData: AudioData;
}

export type PlayerAction =
  | { type: 'SET_TRACK'; track: Track }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'SET_TIME'; time: number }
  | { type: 'SET_DURATION'; duration: number }
  | { type: 'SET_VOLUME'; volume: number }
  | { type: 'NEXT_TRACK' }
  | { type: 'PREV_TRACK' }
  | { type: 'ADD_TO_PLAYLIST'; tracks: Track[] }
  | { type: 'REMOVE_FROM_PLAYLIST'; id: string }
  | { type: 'SET_PLAYLIST'; playlist: Track[] }
  | { type: 'SET_PLAY_MODE'; mode: PlayMode }
  | { type: 'TOGGLE_PLAYLIST' }
  | { type: 'TOGGLE_SEARCH' }
  | { type: 'TOGGLE_LIBRARY' }
  | { type: 'SET_AUDIO_DATA'; data: AudioData };

import { useEffect, useRef, useCallback } from 'react';
import { useAudio, getNextPlayMode } from '../context/AudioContext';

export function useAudioPlayer() {
  const { state, dispatch } = useAudio();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    audio.volume = state.volume;

    let lastTime = 0;
    const onTimeUpdate = () => {
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = 0;
          if (audio.currentTime !== lastTime) {
            lastTime = audio.currentTime;
            dispatch({ type: 'SET_TIME', time: audio.currentTime });
          }
        });
      }
    };
    const onLoadedMeta = () => dispatch({ type: 'SET_DURATION', duration: audio.duration });
    const onEnded = () => dispatch({ type: 'NEXT_TRACK' });

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMeta);
    audio.addEventListener('ended', onEnded);

    return () => {
      cancelAnimationFrame(rafRef.current);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMeta);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentTrack) return;

    if (audio.src !== state.currentTrack.url) {
      audio.src = state.currentTrack.url;
    }

    if (state.isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [state.currentTrack?.id, state.isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.volume;
    }
  }, [state.volume]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      dispatch({ type: 'SET_TIME', time });
    }
  }, [dispatch]);

  const togglePlay = () => dispatch({ type: 'TOGGLE_PLAY' });
  const nextTrack = () => dispatch({ type: 'NEXT_TRACK' });
  const prevTrack = () => dispatch({ type: 'PREV_TRACK' });
  const cyclePlayMode = () => dispatch({ type: 'SET_PLAY_MODE', mode: getNextPlayMode(state.playMode) });

  return {
    ...state,
    audioRef,
    dispatch,
    seek,
    togglePlay,
    nextTrack,
    prevTrack,
    cyclePlayMode,
  };
}

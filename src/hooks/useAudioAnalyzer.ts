import { useEffect, useRef } from 'react';
import { useAudio } from '../context/AudioContext';
import type { AudioData } from '../types';

const FFT_SIZE = 256;
const SMOOTHING = 0.55;

interface AnalyzerInput {
  audioEl: HTMLAudioElement | null;
  isPlaying: boolean;
}

export function useAudioAnalyzer({ audioEl, isPlaying }: AnalyzerInput) {
  const { dispatch } = useAudio();
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number>(0);
  const prevRef = useRef<AudioData>({ bass: 0, mid: 0, treble: 0, amplitude: 0 });
  const sourceCreatedRef = useRef(false);

  // One-time setup: create AudioContext + analyser + MediaElementSourceNode
  useEffect(() => {
    if (!audioEl || sourceCreatedRef.current) return;

    try {
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0.5;

      const source = ctx.createMediaElementSource(audioEl);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      ctxRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
      sourceCreatedRef.current = true;
    } catch {
      // Audio element already has a source connected (StrictMode double-fire)
      // The previous connection still works — just reuse the existing context
    }

    return () => {
      if (sourceRef.current) {
        try { sourceRef.current.disconnect(); } catch {}
        sourceRef.current = null;
      }
      if (ctxRef.current && ctxRef.current.state !== 'closed') {
        ctxRef.current.close();
        ctxRef.current = null;
      }
      sourceCreatedRef.current = false;
    };
  }, [audioEl]);

  // rAF loop: read frequency data while playing
  useEffect(() => {
    const analyser = analyserRef.current;
    const ctx = ctxRef.current;
    if (!analyser || !ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const sampleRate = ctx.sampleRate;
    const binWidth = sampleRate / FFT_SIZE;
    const bassEnd = Math.floor(250 / binWidth);
    const midEnd = Math.floor(2000 / binWidth);
    const trebleEnd = Math.floor(20000 / binWidth);

    function tick() {
      if (!isPlaying) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // Resume AudioContext if suspended (browser autoplay policy)
      if (analyserRef.current && ctxRef.current) {
        if (ctxRef.current.state === 'suspended') {
          ctxRef.current.resume();
        }
        analyserRef.current.getByteFrequencyData(dataArray);
      } else {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      let bassSum = 0, midSum = 0, trebleSum = 0, totalSum = 0;
      let bassCount = 0, midCount = 0, trebleCount = 0;

      for (let i = 0; i < bufferLength; i++) {
        const val = dataArray[i] / 255;
        totalSum += val;
        if (i < bassEnd) { bassSum += val; bassCount++; }
        else if (i < midEnd) { midSum += val; midCount++; }
        else if (i < trebleEnd) { trebleSum += val; trebleCount++; }
      }

      const raw: AudioData = {
        bass: bassCount > 0 ? bassSum / bassCount : 0,
        mid: midCount > 0 ? midSum / midCount : 0,
        treble: trebleCount > 0 ? trebleSum / trebleCount : 0,
        amplitude: totalSum / bufferLength,
      };

      const prev = prevRef.current;
      prevRef.current = {
        bass: prev.bass + (raw.bass - prev.bass) * SMOOTHING,
        mid: prev.mid + (raw.mid - prev.mid) * SMOOTHING,
        treble: prev.treble + (raw.treble - prev.treble) * SMOOTHING,
        amplitude: prev.amplitude + (raw.amplitude - prev.amplitude) * SMOOTHING,
      };

      dispatch({ type: 'SET_AUDIO_DATA', data: prevRef.current });
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, dispatch]);
}

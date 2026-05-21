import { useCallback, useState, useRef } from 'react';
import { useAudio } from '../context/AudioContext';
import { parseAudioFile, scanEntries } from './useMusicLibrary';
import type { Track } from '../types';

export function useFileDrop() {
  const { dispatch } = useAudio();
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (!isDragging) setIsDragging(true);
  }, [isDragging]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  }, []);

  const processTracks = useCallback(async (tracks: Track[]) => {
    if (tracks.length > 0) {
      dispatch({ type: 'ADD_TO_PLAYLIST', tracks });
    }
  }, [dispatch]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);

    const items = e.dataTransfer.items;
    if (items.length === 0) return;

    // Check for directory entries (folder drop)
    const entries: Array<FileSystemEntry | null> = [];
    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry?.();
      entries.push(entry);
    }

    if (entries.some(e => e?.isDirectory)) {
      // Folder drop: scan recursively
      const validEntries = entries.filter((e): e is FileSystemEntry => e !== null);
      const files = await scanEntries(validEntries);
      const tracks: Track[] = [];
      for (const file of files) {
        const track = await parseAudioFile(file);
        tracks.push(track);
      }
      await processTracks(tracks);
    } else {
      // File drop: parse directly
      const fileList = e.dataTransfer.files;
      const tracks: Track[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (file.type.startsWith('audio/') || /\.(mp3|flac|wav|ogg|m4a|aac)$/i.test(file.name)) {
          const track = await parseAudioFile(file);
          tracks.push(track);
        }
      }
      await processTracks(tracks);
    }
  }, [processTracks]);

  const handleFileSelect = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.multiple = true;
    input.onchange = async () => {
      if (!input.files) return;
      const tracks: Track[] = [];
      for (let i = 0; i < input.files.length; i++) {
        const track = await parseAudioFile(input.files[i]);
        tracks.push(track);
      }
      await processTracks(tracks);
    };
    input.click();
  }, [processTracks]);

  return { isDragging, handleDragEnter, handleDragOver, handleDragLeave, handleDrop, handleFileSelect };
}

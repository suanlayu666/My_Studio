import { useCallback } from 'react';
import { parseBlob } from 'music-metadata';
import type { Track } from '../types';

const STORAGE_KEY = 'my-studio-playlist';

export interface SavedPlaylistEntry {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  cover?: string;
  source: 'local';
  fileName: string;
}

export interface SavedState {
  playlist: SavedPlaylistEntry[];
  currentTrackId: string | null;
  volume: number;
  playMode: string;
}

export function saveToStorage(state: SavedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function loadFromStorage(): SavedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedState;
  } catch {
    return null;
  }
}

export function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

export async function parseAudioFile(file: File): Promise<Track> {
  const url = URL.createObjectURL(file);
  const id = `local-${file.name}-${file.size}`;

  try {
    const meta = await parseBlob(file, { skipCovers: false });
    const common = meta.common;

    let cover: string | undefined;
    if (common.picture && common.picture.length > 0) {
      const pic = common.picture[0];
      const blob = new Blob([pic.data as unknown as BlobPart], { type: pic.format });
      cover = await blobToBase64(blob);
    }

    return {
      id,
      title: common.title || file.name.replace(/\.[^.]+$/, ''),
      artist: common.artist || 'Unknown Artist',
      album: common.album,
      duration: meta.format.duration || 0,
      cover,
      source: 'local',
      url,
      file,
    };
  } catch {
    // Fallback: read duration via Audio element
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.addEventListener('loadedmetadata', () => {
        resolve({
          id,
          title: file.name.replace(/\.[^.]+$/, ''),
          artist: 'Unknown Artist',
          duration: audio.duration,
          source: 'local',
          url,
          file,
        });
      });
      audio.addEventListener('error', () => {
        resolve({
          id,
          title: file.name.replace(/\.[^.]+$/, ''),
          artist: 'Unknown Artist',
          duration: 0,
          source: 'local',
          url,
          file,
        });
      });
      audio.src = url;
    });
  }
}

const AUDIO_EXT = /\.(mp3|flac|wav|ogg|m4a|aac|wma|aiff)$/i;

export function isAudioFile(name: string): boolean {
  return AUDIO_EXT.test(name);
}

export async function scanEntries(
  entries: Array<FileSystemEntry | null>,
): Promise<File[]> {
  const files: File[] = [];

  async function scan(entry: FileSystemEntry) {
    if (entry.isFile) {
      const file = await new Promise<File>((resolve, reject) => {
        (entry as FileSystemFileEntry).file(resolve, reject);
      });
      if (isAudioFile(file.name) || file.type.startsWith('audio/')) {
        files.push(file);
      }
    } else if (entry.isDirectory) {
      const reader = (entry as FileSystemDirectoryEntry).createReader();
      const subEntries = await new Promise<FileSystemEntry[]>((resolve, reject) => {
        reader.readEntries(resolve, reject);
      });
      for (const sub of subEntries) {
        await scan(sub);
      }
    }
  }

  // Scan entries (handle nested directories by calling readEntries recursively)
  async function readAllEntries(dirReader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> {
    const all: FileSystemEntry[] = [];
    let batch: FileSystemEntry[];
    do {
      batch = await new Promise<FileSystemEntry[]>((resolve, reject) => {
        dirReader.readEntries(resolve, reject);
      });
      all.push(...batch);
    } while (batch.length > 0);
    return all;
  }

  for (const entry of entries) {
    if (!entry) continue;
    if (entry.isFile) {
      const file = await new Promise<File>((resolve, reject) => {
        (entry as FileSystemFileEntry).file(resolve, reject);
      });
      if (isAudioFile(file.name) || file.type.startsWith('audio/')) {
        files.push(file);
      }
    } else if (entry.isDirectory) {
      const dirEntry = entry as FileSystemDirectoryEntry;
      const reader = dirEntry.createReader();
      const subEntries = await readAllEntries(reader);
      for (const sub of subEntries) {
        await scan(sub);
      }
    }
  }

  return files;
}

export async function parseFiles(files: File[]): Promise<Track[]> {
  const results: Track[] = [];
  for (const file of files) {
    try {
      const track = await parseAudioFile(file);
      results.push(track);
    } catch {
      // skip unreadable files
    }
  }
  return results;
}

export function useMusicLibrary() {
  const importFolder = useCallback(async (): Promise<File[]> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.webkitdirectory = true;
      input.onchange = () => {
        const files = Array.from(input.files || []);
        resolve(files);
      };
      input.click();
    });
  }, []);

  return { importFolder };
}

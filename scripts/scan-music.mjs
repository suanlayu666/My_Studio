import { readdir, stat, writeFile, mkdir } from 'fs/promises';
import { join, relative, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const musicDir = join(__dirname, '..', 'public', 'music');
const outputFile = join(__dirname, '..', 'public', 'music-manifest.json');

const AUDIO_EXT = /\.(mp3|flac|wav|ogg|m4a|aac|wma|aiff)$/i;

async function scanDir(dir) {
  const tracks = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        const sub = await scanDir(full);
        tracks.push(...sub);
      } else if (AUDIO_EXT.test(entry.name)) {
        const rel = relative(musicDir, full).replace(/\\/g, '/');
        tracks.push({ name: entry.name, path: 'music/' + rel });
      }
    }
  } catch {}
  return tracks;
}

async function main() {
  try {
    await mkdir(musicDir, { recursive: true });
  } catch {}

  const playlists = [];
  try {
    const entries = await readdir(musicDir, { withFileTypes: true });
    const rootTracks = [];

    for (const entry of entries) {
      const full = join(musicDir, entry.name);
      if (entry.isDirectory()) {
        const tracks = await scanDir(full);
        if (tracks.length > 0) {
          playlists.push({ name: entry.name, path: 'music/' + entry.name, tracks });
        }
      } else if (AUDIO_EXT.test(entry.name)) {
        rootTracks.push({ name: entry.name, path: 'music/' + entry.name });
      }
    }

    if (rootTracks.length > 0) {
      playlists.unshift({ name: '未分类', path: 'music', tracks: rootTracks });
    }
  } catch {}

  await writeFile(outputFile, JSON.stringify({ playlists }, null, 2), 'utf-8');
  console.log(`  Music manifest: ${playlists.length} playlists, ${playlists.reduce((s, p) => s + p.tracks.length, 0)} tracks`);
}

main();

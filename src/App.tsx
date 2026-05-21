import { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AudioProvider } from './context/AudioContext';
import { usePWAInstall } from './hooks/usePWAInstall';
import { useFavorites } from './hooks/useFavorites';
import PlayerContainer from './components/PlayerContainer';
import type { Playlist } from './components/MusicLibrary';

function AppContent() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [autoPlaylist, setAutoPlaylist] = useState<Playlist | null>(null);
  const restored = useRef(false);
  const { isInstallable, isStandalone, install } = usePWAInstall();
  const { liked } = useFavorites();

  useEffect(() => {
    fetch('/music-manifest.json')
      .then(res => res.json())
      .then(data => {
        let pls = data.playlists || [];

        // Always show favorites playlist
        pls = [...pls, {
          name: '💚 我喜欢的',
          path: '__favorites__',
          tracks: liked.map(t => ({ name: t.title, path: t.path })),
        }];

        setPlaylists(pls);

        if (!restored.current && pls.length > 0) {
          const lastName = localStorage.getItem('my-studio-last-playlist');
          if (lastName) {
            const found = pls.find((p: Playlist) => p.name === lastName);
            if (found) setAutoPlaylist(found);
          }
          restored.current = true;
        }
      })
      .catch(() => setPlaylists([]));
  }, [liked]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-2 p-4" style={{ background: '#0a0a0a' }}>
      <PlayerContainer
        playlists={playlists}
        autoPlaylist={autoPlaylist}
        onAutoRestored={() => setAutoPlaylist(null)}
      />
      {(isInstallable && !isStandalone) && (
        <button
          onClick={install}
          className="px-4 py-2 rounded-lg text-sm font-bold transition-all hover:scale-105"
          style={{ background: '#1db954', color: '#0a0a0a' }}
        >
          安装为桌面应用
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AudioProvider>
        <AppContent />
      </AudioProvider>
    </ThemeProvider>
  );
}

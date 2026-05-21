import { useState, useCallback } from 'react';
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import type { Track } from '../types';
import { ChevronLeftIcon, PlusIcon } from './Icons';

const SEARCH_API = 'https://music-api-8djy.onrender.com/search';

interface SearchResult {
  id: string;
  name: string;
  artist: string;
  duration: number;
}

export default function SearchPanel() {
  const { state, dispatch } = useAudio();
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${SEARCH_API}?keywords=${encodeURIComponent(query)}`);
      const data = await res.json();
      const songs = (data.result?.songs || []).map((s: any) => ({
        id: String(s.id),
        name: s.name,
        artist: (s.artists || s.ar || []).map((a: any) => a.name).join(', '),
        duration: (s.duration || s.dt || 0) / 1000,
      }));
      setResults(songs);
    } catch {
      setError('Search failed. Check network or API.');
    }
    setLoading(false);
  }, [query]);

  const addToPlaylist = (item: SearchResult) => {
    const track: Track = {
      id: `online-${item.id}`,
      title: item.name,
      artist: item.artist,
      duration: item.duration,
      source: 'online',
      url: `https://music-api-8djy.onrender.com/song/url?id=${item.id}`,
    };
    dispatch({ type: 'ADD_TO_PLAYLIST', tracks: [track] });
    dispatch({ type: 'TOGGLE_SEARCH' });
  };

  if (!state.isSearchOpen) return null;

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col rounded-2xl overflow-hidden"
      style={{ background: colors.bg, animation: 'fade-in 0.2s ease-out' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button className="flex-shrink-0 flex items-center gap-1" onClick={() => dispatch({ type: 'TOGGLE_SEARCH' })}>
          <ChevronLeftIcon size={20} />
          <span className="text-studio-green text-sm">返回</span>
        </button>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="搜索歌曲..."
          className="flex-1 text-sm px-3 py-2 rounded-lg outline-none transition-colors placeholder:text-studio-muted"
          style={{
            background: colors.surface,
            color: colors.text,
            border: `1px solid ${colors.border}`,
          }}
          autoFocus
        />
        <button onClick={handleSearch} disabled={loading} className="text-studio-green text-sm flex-shrink-0 disabled:opacity-50">
          {loading ? '...' : '搜索'}
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4">
        {error && <div className="text-red-400 text-sm text-center py-6">{error}</div>}
        {results.length === 0 && !loading && !error && (
          <div className="text-center py-12 text-sm" style={{ color: colors.muted }}>
            输入关键词搜索歌曲
          </div>
        )}
        {results.map((item) => (
          <div
            key={item.id}
            onClick={() => addToPlaylist(item)}
            className="flex items-center gap-3 py-2.5 px-2 cursor-pointer rounded transition-colors"
            style={{}}
            onMouseEnter={(e) => { e.currentTarget.style.background = colors.card; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <div className="flex-1 min-w-0">
              <div style={{ color: colors.text, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
              <div style={{ color: colors.muted, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.artist}</div>
            </div>
            <button className="flex-shrink-0 hover:brightness-150 transition-all">
              <PlusIcon size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

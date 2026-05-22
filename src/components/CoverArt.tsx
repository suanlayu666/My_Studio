import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import { MusicNoteIcon } from './Icons';

export default function CoverArt() {
  const { state } = useAudio();
  const { colors } = useTheme();
  const { currentTrack, isPlaying, audioData } = state;
  const hasTrack = !!currentTrack;

  const { bass, mid, treble, amplitude } = isPlaying
    ? audioData
    : { bass: 0, mid: 0, treble: 0, amplitude: 0 };

  const innerScale = 1 + bass * 0.1;
  const glowIntensity = 0.08 + mid * 0.5 + amplitude * 0.3;
  const rotationSpeed = 0.6 + treble * 0.6;
  const coverGlow = 0.08 + amplitude * 0.5;

  // Bar heights: CSS base + audio modulation
  const h1 = 12 + bass * 40;
  const h2 = 12 + mid * 36;
  const h3 = 12 + treble * 40;
  const h4 = 12 + (mid + amplitude) * 18;
  const h5 = 12 + bass * 34;


  const [g1, g2, g3] = colors.coverGradient;
  const coverBg = currentTrack?.cover
    ? `url(${currentTrack.cover}) center/cover no-repeat`
    : `linear-gradient(135deg, ${g1} 0%, ${g2} 50%, ${g3} 100%)`;
  const coverBorder = hasTrack ? '2px solid rgba(29,185,84,0.4)' : `2px solid ${colors.border}`;

  return (
    <div className="flex-1 flex items-center justify-center py-6">
      <div className="relative">
        {hasTrack && (
          <>
            <div
              className="absolute -inset-3 rounded-full"
              style={{
                border: '1px dashed rgba(29,185,84,0.15)',
                animation: isPlaying ? `spin ${12 / rotationSpeed}s linear infinite` : 'none',
                opacity: isPlaying ? 0.6 + amplitude * 0.4 : 0.5,
              }}
            />
            <div
              className="absolute -inset-2 rounded-full"
              style={{
                border: '1px solid rgba(29,185,84,0.2)',
                animation: isPlaying ? `spin-reverse ${8 / rotationSpeed}s linear infinite` : 'none',
                opacity: isPlaying ? 0.7 + mid * 0.3 : 0.6,
              }}
            />
            <div
              className="absolute -inset-1 rounded-full"
              style={{
                border: `2px solid rgba(29,185,84,${0.25 + mid * 0.25})`,
                animation: isPlaying ? `spin ${5 / rotationSpeed}s linear infinite` : 'none',
                transform: `scale(${innerScale})`,
                boxShadow: isPlaying
                  ? `0 0 ${16 + mid * 24}px rgba(29,185,84,${glowIntensity}), 0 0 ${32 + mid * 32}px rgba(29,185,84,${glowIntensity * 0.5})`
                  : 'none',
              }}
            />
          </>
        )}

        <div
          className="w-48 h-48 rounded-full flex items-center justify-center relative overflow-hidden transition-shadow duration-150"
          style={{
            background: coverBg,
            border: coverBorder,
            boxShadow: isPlaying
              ? `0 0 ${40 + amplitude * 40}px rgba(29,185,84,${coverGlow}), 0 0 ${80 + amplitude * 80}px rgba(29,185,84,${coverGlow * 0.4})`
              : hasTrack
                ? '0 0 40px rgba(29,185,84,0.25), 0 0 80px rgba(29,185,84,0.08)'
                : 'none',
          }}
        >
          {/* Dark overlay on album art for visibility */}
          {currentTrack?.cover && (
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.35)' }} />
          )}

          {isPlaying && hasTrack ? (
            <div className="flex items-end justify-center gap-1.5 relative z-10" style={{ height: 52 }}>
              {[h1, h2, h3, h4, h5].map((h, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div style={{
                    width: 5, borderRadius: '2px 2px 0 0',
                    minHeight: 8,
                    height: h,
                    background: `linear-gradient(to top, #1db954, rgba(29,185,84,0.3))`,
                    boxShadow: `0 0 6px rgba(29,185,84,0.4)`,
                    transition: 'height 0.08s ease-out',
                  }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="relative z-10">
              <MusicNoteIcon size={48} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

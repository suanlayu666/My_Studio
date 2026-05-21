export type Theme = 'dark' | 'light';

export interface ThemeColors {
  bg: string;
  surface: string;
  card: string;
  border: string;
  text: string;
  sub: string;
  muted: string;
  green: string;
  greenLight: string;
  coverGradient: [string, string, string];
  glowBase: string;
}

const dark: ThemeColors = {
  bg: '#0a0a0a',
  surface: '#111111',
  card: '#1a1a1a',
  border: '#222222',
  text: '#ffffff',
  sub: '#888888',
  muted: '#666666',
  green: '#1db954',
  greenLight: '#1ed760',
  coverGradient: ['#0d1117', '#161b22', '#0d1117'],
  glowBase: 'rgba(10,10,10,',
};

const light: ThemeColors = {
  bg: '#fafafa',
  surface: '#eeeeee',
  card: '#e5e5e5',
  border: '#d4d4d4',
  text: '#111111',
  sub: '#777777',
  muted: '#999999',
  green: '#1db954',
  greenLight: '#1ed760',
  coverGradient: ['#e8ecef', '#dde1e5', '#e8ecef'],
  glowBase: 'rgba(250,250,250,',
};

export const themeColors: Record<Theme, ThemeColors> = { dark, light };

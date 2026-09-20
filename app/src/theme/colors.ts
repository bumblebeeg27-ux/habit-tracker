export type ThemeColors = {
  bg: string;
  card: string;
  cardSolid: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentFill: string;
  onAccent: string;
  accentText: string;
  accentBg: string;
  accentLight: string;
  danger: string;
  dangerBorder: string;
  dangerBg: string;
  tertiary: string;
};

// The original (and still default) neon-on-near-black palette.
export const DARK_COLORS: ThemeColors = {
  bg: '#05070A',
  card: '#0A0F0C80',
  cardSolid: '#0A0F0C',
  border: '#1C2318',
  textPrimary: '#EAFFEF',
  textSecondary: '#9BA895',
  textMuted: '#7C8A78',
  accentFill: '#B6FF3C',
  onAccent: '#0A1400',
  accentText: '#B6FF3C',
  accentBg: '#1A2A0F',
  accentLight: '#CFFF7A',
  danger: '#F87171',
  dangerBorder: '#7F1D1D',
  dangerBg: '#3A1414',
  tertiary: '#B9C4B2',
};

// Same brand (lime accent, button fills stay identical), rebuilt for a
// light background: accent hue darkens where it's used as text/borders
// directly on the page (bright lime on white fails contrast), and the
// danger/tertiary tones invert from "light-on-dark" to "dark-on-light".
export const LIGHT_COLORS: ThemeColors = {
  bg: '#F7FAF2',
  card: '#FFFFFF',
  cardSolid: '#FFFFFF',
  border: '#DCE5D2',
  textPrimary: '#12170D',
  textSecondary: '#4B5641',
  textMuted: '#6E7A64',
  accentFill: '#B6FF3C',
  onAccent: '#0A1400',
  accentText: '#4A7209',
  accentBg: '#E7F5CE',
  accentLight: '#3E6608',
  danger: '#D92D2D',
  dangerBorder: '#F3B4B4',
  dangerBg: '#FCE8E8',
  tertiary: '#39422F',
};

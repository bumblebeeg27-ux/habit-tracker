import { useLiveQuery } from 'drizzle-orm/expo-sqlite/query';
import { createContext, ReactNode, useContext, useMemo } from 'react';
import { db } from '../db/client';
import { userProfile } from '../db/schema';
import { DARK_COLORS, LIGHT_COLORS, ThemeColors } from './colors';

export type ThemeMode = 'light' | 'dark';

const ThemeContext = createContext<{ mode: ThemeMode; colors: ThemeColors }>({
  mode: 'dark',
  colors: DARK_COLORS,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { data: profiles } = useLiveQuery(db.select().from(userProfile));
  const mode: ThemeMode = profiles?.[0]?.themePreference === 'light' ? 'light' : 'dark';
  const colors = mode === 'light' ? LIGHT_COLORS : DARK_COLORS;
  const value = useMemo(() => ({ mode, colors }), [mode, colors]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useThemeColors(): ThemeColors {
  return useContext(ThemeContext).colors;
}

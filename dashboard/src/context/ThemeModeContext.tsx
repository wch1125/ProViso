/**
 * ThemeModeContext — light / dark mode for the whole app.
 *
 * Light is the DEFAULT, deliberately. The system `prefers-color-scheme` is
 * not consulted: a visitor arriving with their OS in dark mode should still
 * land on the light dashboard, because that is the reviewed default. Dark is
 * available, but it is a choice the visitor makes here.
 *
 * The mode is a single `.dark` class on <html>; every colour token in
 * index.css is defined for both, so nothing else has to know the mode.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

/** Shared with the pre-paint script in index.html — keep the two in step. */
export const THEME_STORAGE_KEY = 'proviso-theme';

interface ThemeModeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

/**
 * Read the persisted choice. Anything other than an explicit 'dark' — no
 * value, a stale value, or a storage failure — resolves to light.
 */
export function readStoredMode(): ThemeMode {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    // Private browsing or blocked storage: fall back to the default.
    return 'light';
  }
}

function applyModeToDocument(mode: ThemeMode): void {
  document.documentElement.classList.toggle('dark', mode === 'dark');
  // Lets the browser paint form controls, scrollbars and the like to match.
  document.documentElement.style.colorScheme = mode;
}

interface ThemeModeProviderProps {
  children: React.ReactNode;
}

export function ThemeModeProvider({ children }: ThemeModeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode);

  useEffect(() => {
    applyModeToDocument(mode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // Persisting is a convenience; the app works without it.
    }
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => setModeState(next), []);
  const toggleMode = useCallback(
    () => setModeState((current) => (current === 'dark' ? 'light' : 'dark')),
    []
  );

  const value = useMemo<ThemeModeContextValue>(
    () => ({ mode, isDark: mode === 'dark', setMode, toggleMode }),
    [mode, setMode, toggleMode]
  );

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

/**
 * Access the active theme mode.
 *
 * Usable outside the provider (it reports light and no-ops), so a component
 * rendered in isolation — a test, a storybook-style page — does not crash.
 */
export function useThemeMode(): ThemeModeContextValue {
  const context = useContext(ThemeModeContext);

  if (!context) {
    return {
      mode: 'light',
      isDark: false,
      setMode: () => undefined,
      toggleMode: () => undefined,
    };
  }

  return context;
}

export default ThemeModeProvider;

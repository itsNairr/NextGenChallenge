// Summary: Composable hook managing light and dark theme state and DOM attribute synchronization.
"use client";

import { useCallback, useLayoutEffect, useState } from "react";
import type { ThemeName } from "@/types";
import { THEME_ATTRIBUTE, THEME_STORAGE_KEY } from "./themeScript";

// Accept a stored value only when it names a real theme.
export function isThemeName(value: unknown): value is ThemeName {
  return value === "light" || value === "dark";
}

// Pick the starting theme. A stored choice wins over the system setting.
export function resolveInitialTheme(stored: unknown, prefersDark: boolean): ThemeName {
  if (isThemeName(stored)) {
    return stored;
  }
  return prefersDark ? "dark" : "light";
}

// Return the other theme.
export function oppositeTheme(theme: ThemeName): ThemeName {
  return theme === "dark" ? "light" : "dark";
}

// Read the stored theme. Storage can throw in a private window.
function readStoredTheme(): ThemeName | null {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeName(stored) ? stored : null;
  } catch {
    return null;
  }
}

// Store the theme. Ignore failures so the toggle still works.
function writeStoredTheme(theme: ThemeName): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage is unavailable. The theme still applies for this page view.
  }
}

// Ask the operating system for its colour preference.
function prefersDarkTheme(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

// Read the theme currently applied to the document.
function readDocumentTheme(): ThemeName {
  return document.documentElement.getAttribute(THEME_ATTRIBUTE) === "dark" ? "dark" : "light";
}

// Describe the composable result.
export interface UseThemeResult {
  // Hold null during server rendering, because the server cannot know the theme.
  // Do not render this value during the first client pass. Use the dark: variant instead.
  readonly theme: ThemeName | null;
  readonly setTheme: (theme: ThemeName) => void;
  readonly toggleTheme: () => void;
}

// Provide the active theme and a way to change it.
export function useTheme(): UseThemeResult {
  // Read the same sources as the inline script, so the state matches the document.
  const [theme, setThemeState] = useState<ThemeName | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return resolveInitialTheme(readStoredTheme(), prefersDarkTheme());
  });

  // Restore the attribute after React clears it on the development remount.
  // This is a no operation in production, where the inline script already set it.
  useLayoutEffect(() => {
    document.documentElement.setAttribute(
      THEME_ATTRIBUTE,
      resolveInitialTheme(readStoredTheme(), prefersDarkTheme())
    );
  }, []);

  const setTheme = useCallback((next: ThemeName) => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, next);
    writeStoredTheme(next);
    setThemeState(next);
  }, []);

  // Read the document so the toggle is correct even before React has hydrated.
  const toggleTheme = useCallback(() => {
    setTheme(oppositeTheme(readDocumentTheme()));
  }, [setTheme]);

  return { theme, setTheme, toggleTheme };
}

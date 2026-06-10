// Utility functions for theme storage and persistence

import type { Theme } from "next-themes"
const THEME_KEY = "termly_theme"

/**
 * Save the user's theme preference to localStorage
 */
export function saveThemePreference(theme: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("theme-preference", theme)
  }
}

/**
 * Get the user's theme preference from localStorage
 * Returns the saved preference or 'light' as default
 */
export function getThemePreference(): string {
  if (typeof window !== "undefined") {
    const savedTheme = localStorage.getItem("theme-preference")
    return savedTheme || "light"
  }
  return "light" // Default to light theme
}

/**
 * Save the user's font size preference to localStorage
 */
export function saveFontSizePreference(fontSize: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("font-size-preference", fontSize)
  }
}

/**
 * Get the user's font size preference from localStorage
 * Returns the saved preference or 'medium' as default
 */
export function getFontSizePreference(): string {
  if (typeof window !== "undefined") {
    const savedFontSize = localStorage.getItem("font-size-preference")
    return savedFontSize || "medium"
  }
  return "medium" // Default to medium font size
}

/**
 * Save the user's color scheme preference to localStorage
 */
export function saveColorSchemePreference(colorScheme: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("color-scheme-preference", colorScheme)
    // Apply the color scheme immediately
    document.documentElement.classList.remove(
      "theme-default",
      "theme-blue",
      "theme-green",
      "theme-purple",
      "theme-orange",
    )
    if (colorScheme !== "default") {
      document.documentElement.classList.add(`theme-${colorScheme}`)
    }
  }
}

/**
 * Get the user's color scheme preference from localStorage
 * Returns the saved preference or 'default' as default
 */
export function getColorSchemePreference(): string {
  if (typeof window !== "undefined") {
    const savedColorScheme = localStorage.getItem("color-scheme-preference")
    return savedColorScheme || "default"
  }
  return "default" // Default color scheme
}

export const themeStorage = {
  setTheme: (theme: Theme) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_KEY, theme)
    }
  },
  getTheme: (): Theme | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(THEME_KEY) as Theme | null
    }
    return null
  },
  clear: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(THEME_KEY)
    }
  },
}

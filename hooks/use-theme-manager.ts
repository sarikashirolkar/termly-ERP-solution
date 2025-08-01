"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import {
  getThemePreference,
  saveThemePreference,
  getFontSizePreference,
  saveFontSizePreference,
  getColorSchemePreference,
  saveColorSchemePreference,
} from "@/lib/theme-storage"

export type FontSize = "small" | "medium" | "large"
export type ColorScheme = "default" | "blue" | "green" | "purple" | "orange"

export function useThemeManager() {
  const { theme, setTheme } = useTheme()
  const [fontSize, setFontSize] = useState<FontSize>("medium")
  const [colorScheme, setColorScheme] = useState<ColorScheme>("default")
  const [mounted, setMounted] = useState(false)

  // Load saved preferences on mount
  useEffect(() => {
    setMounted(true)

    // Load font size preference
    const savedFontSize = getFontSizePreference() as FontSize
    if (savedFontSize) {
      setFontSize(savedFontSize)
      applyFontSize(savedFontSize)
    }

    // Load color scheme preference
    const savedColorScheme = getColorSchemePreference() as ColorScheme
    if (savedColorScheme) {
      setColorScheme(savedColorScheme)
      applyColorScheme(savedColorScheme)
    }

    // Get saved theme preference
    const savedTheme = getThemePreference()
    if (savedTheme && savedTheme !== theme) {
      setTheme(savedTheme)
    }
  }, [theme, setTheme])

  // Apply font size to document
  const applyFontSize = (size: FontSize) => {
    const html = document.documentElement

    // Remove existing font size classes
    html.classList.remove("text-sm", "text-base", "text-lg")

    // Add appropriate class based on size
    switch (size) {
      case "small":
        html.classList.add("text-sm")
        break
      case "medium":
        html.classList.add("text-base")
        break
      case "large":
        html.classList.add("text-lg")
        break
    }
  }

  // Apply color scheme to document
  const applyColorScheme = (scheme: ColorScheme) => {
    if (typeof window !== "undefined") {
      const html = document.documentElement

      // Remove existing color scheme classes
      html.classList.remove("theme-default", "theme-blue", "theme-green", "theme-purple", "theme-orange")

      // Add appropriate class based on scheme
      if (scheme !== "default") {
        html.classList.add(`theme-${scheme}`)
      }
    }
  }

  // Update font size and save preference
  const updateFontSize = (size: FontSize) => {
    setFontSize(size)
    saveFontSizePreference(size)
    applyFontSize(size)
  }

  // Update color scheme and save preference
  const updateColorScheme = (scheme: ColorScheme) => {
    setColorScheme(scheme)
    saveColorSchemePreference(scheme)
    applyColorScheme(scheme)
  }

  // Update theme and save preference
  const updateTheme = (newTheme: string) => {
    setTheme(newTheme)
    saveThemePreference(newTheme)
  }

  return {
    theme,
    setTheme: updateTheme,
    fontSize,
    setFontSize: updateFontSize,
    colorScheme,
    setColorScheme: updateColorScheme,
    mounted,
  }
}

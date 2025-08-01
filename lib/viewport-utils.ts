// Utility functions for responsive design

// Media query breakpoints (matching Tailwind defaults)
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
}

// Function to generate media query strings
export function mediaQuery(breakpoint: keyof typeof breakpoints, type: "min" | "max" = "min") {
  const pixelValue = breakpoints[breakpoint]
  return type === "min" ? `@media (min-width: ${pixelValue}px)` : `@media (max-width: ${pixelValue - 1}px)`
}

// Function to check if the current viewport matches a media query
// Note: This should only be used client-side
export function matchesViewport(breakpoint: keyof typeof breakpoints, type: "min" | "max" = "min"): boolean {
  if (typeof window === "undefined") return false

  const pixelValue = breakpoints[breakpoint]
  return type === "min" ? window.innerWidth >= pixelValue : window.innerWidth < pixelValue
}

// Calculate responsive font sizes
export function responsiveFontSize(
  base: number,
  options?: {
    min?: number
    max?: number
    scaleDown?: number
    scaleUp?: number
  },
): string {
  const { min = base * 0.75, max = base * 1.25, scaleDown = 0.2, scaleUp = 0.1 } = options || {}

  return `clamp(${min}rem, calc(${base - scaleDown}rem + ${scaleDown * 5}vw), ${max}rem)`
}

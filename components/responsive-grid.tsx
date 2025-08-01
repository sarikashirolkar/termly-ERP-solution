"use client"

import type React from "react"
import { useMobile } from "@/hooks/use-mobile"

interface ResponsiveGridProps {
  children: React.ReactNode
  mobileColumns?: number
  tabletColumns?: number
  desktopColumns?: number
  gap?: "none" | "sm" | "md" | "lg"
  className?: string
}

export function ResponsiveGrid({
  children,
  mobileColumns = 1,
  tabletColumns = 2,
  desktopColumns = 3,
  gap = "md",
  className = "",
}: ResponsiveGridProps) {
  const { isMobile, isTablet } = useMobile()

  const gapClasses = {
    none: "gap-0",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  }

  let columns = desktopColumns
  if (isMobile) {
    columns = mobileColumns
  } else if (isTablet) {
    columns = tabletColumns
  }

  return (
    <div
      className={`grid ${gapClasses[gap]} ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {children}
    </div>
  )
}

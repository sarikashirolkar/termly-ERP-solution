"use client"

import type React from "react"
import { useMobile } from "@/hooks/use-mobile"

interface ResponsiveContainerProps {
  children: React.ReactNode
  mobileClassName?: string
  tabletClassName?: string
  desktopClassName?: string
  className?: string
}

export function ResponsiveContainer({
  children,
  mobileClassName = "",
  tabletClassName = "",
  desktopClassName = "",
  className = "",
}: ResponsiveContainerProps) {
  const { isMobile, isTablet, isDesktop } = useMobile()

  let responsiveClass = className

  if (isMobile) {
    responsiveClass += ` ${mobileClassName}`
  } else if (isTablet) {
    responsiveClass += ` ${tabletClassName}`
  } else if (isDesktop) {
    responsiveClass += ` ${desktopClassName}`
  }

  return <div className={responsiveClass.trim()}>{children}</div>
}

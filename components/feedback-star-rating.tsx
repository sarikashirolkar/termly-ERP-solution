"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeedbackStarRatingProps {
  value?: number
  onChange?: (value: number) => void
  readOnly?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function FeedbackStarRating({
  value = 0,
  onChange,
  readOnly = false,
  size = "md",
  className,
}: FeedbackStarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  const handleClick = (rating: number) => {
    if (!readOnly && onChange) {
      onChange(rating)
    }
  }

  const handleMouseEnter = (rating: number) => {
    if (!readOnly) {
      setHoverValue(rating)
    }
  }

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverValue(null)
    }
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((rating) => {
        const isFilled = (hoverValue ?? value) >= rating
        return (
          <button
            key={rating}
            type="button"
            className={cn(
              "transition-colors",
              readOnly ? "cursor-default" : "cursor-pointer hover:scale-110",
              sizeClasses[size],
            )}
            onClick={() => handleClick(rating)}
            onMouseEnter={() => handleMouseEnter(rating)}
            onMouseLeave={handleMouseLeave}
            disabled={readOnly}
          >
            <Star
              className={cn(
                "transition-colors",
                isFilled ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
                sizeClasses[size],
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"

interface AttainmentTableCellProps {
  value: string
  rowIndex: number
  colIndex: number
  onChange: (value: string, rowIndex: number, colIndex: number) => void
  onNavigate: (rowIndex: number, colIndex: number, direction: "up" | "down" | "left" | "right") => void
  className?: string
}

export function AttainmentTableCell({
  value,
  rowIndex,
  colIndex,
  onChange,
  onNavigate,
  className = "",
}: AttainmentTableCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    setEditValue(value)
  }, [value])

  const handleClick = () => {
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (editValue !== value) {
      onChange(editValue, rowIndex, colIndex)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false)
      onChange(editValue, rowIndex, colIndex)
    } else if (e.key === "Escape") {
      setIsEditing(false)
      setEditValue(value)
    } else if (e.key === "Tab") {
      e.preventDefault()
      setIsEditing(false)
      onChange(editValue, rowIndex, colIndex)
      onNavigate(rowIndex, colIndex, e.shiftKey ? "left" : "right")
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setIsEditing(false)
      onChange(editValue, rowIndex, colIndex)
      onNavigate(rowIndex, colIndex, "up")
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      setIsEditing(false)
      onChange(editValue, rowIndex, colIndex)
      onNavigate(rowIndex, colIndex, "down")
    } else if (e.key === "ArrowLeft" && inputRef.current?.selectionStart === 0) {
      e.preventDefault()
      setIsEditing(false)
      onChange(editValue, rowIndex, colIndex)
      onNavigate(rowIndex, colIndex, "left")
    } else if (e.key === "ArrowRight" && inputRef.current?.selectionEnd === inputRef.current?.value.length) {
      e.preventDefault()
      setIsEditing(false)
      onChange(editValue, rowIndex, colIndex)
      onNavigate(rowIndex, colIndex, "right")
    }
  }

  return (
    <div className={`w-full h-full min-h-[32px] flex items-center justify-center ${className}`} onClick={handleClick}>
      {isEditing ? (
        <Input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full h-8 text-center p-1 border-0 focus:ring-1 focus:ring-primary dark:bg-slate-900 dark:text-white dark:border-slate-500"
        />
      ) : (
        <div className="w-full text-center px-1 py-1 cursor-pointer hover:bg-primary/20 dark:hover:bg-slate-600 rounded transition-colors text-foreground dark:text-white dark:bg-slate-800/80">
          {value ? (
            <span className="font-medium dark:text-white dark:drop-shadow-sm">{value}</span>
          ) : (
            <span className="text-muted-foreground/70 dark:text-slate-100 font-medium text-xs dark:drop-shadow-lg">
              Click to edit
            </span>
          )}
        </div>
      )}
    </div>
  )
}

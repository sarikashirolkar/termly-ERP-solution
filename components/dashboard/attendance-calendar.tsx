"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Mock data for attendance
const attendanceData = {
  "2025-03-01": "present",
  "2025-03-02": "present",
  "2025-03-03": "present",
  "2025-03-04": "absent",
  "2025-03-05": "present",
  "2025-03-06": "present",
  "2025-03-07": "present",
  "2025-03-10": "present",
  "2025-03-11": "present",
  "2025-03-12": "absent",
  "2025-03-13": "present",
  "2025-03-14": "present",
  "2025-03-17": "present",
  "2025-03-18": "present",
  "2025-03-19": "present",
  "2025-03-20": "present",
  "2025-03-21": "absent",
  "2025-03-24": "present",
  "2025-03-25": "present",
  "2025-03-26": "present",
  "2025-03-27": "present",
  "2025-03-28": "present",
}

export function AttendanceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)

  const days = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          {monthNames[month]} {year}
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 md:gap-2 text-center">
        <div className="text-xs md:text-sm font-medium">S</div>
        <div className="text-xs md:text-sm font-medium">M</div>
        <div className="text-xs md:text-sm font-medium">T</div>
        <div className="text-xs md:text-sm font-medium">W</div>
        <div className="text-xs md:text-sm font-medium">T</div>
        <div className="text-xs md:text-sm font-medium">F</div>
        <div className="text-xs md:text-sm font-medium">S</div>
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="h-8 md:h-10" />
          }

          const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          const status = attendanceData[dateString]

          return (
            <div
              key={`day-${day}`}
              className={cn(
                "flex h-8 md:h-10 items-center justify-center rounded-md text-xs md:text-sm",
                status === "present" && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
                status === "absent" && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
                !status && "hover:bg-muted",
              )}
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}

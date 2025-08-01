"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Button } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = React.useState<Date>(today)

  // Navigate to previous month
  const handlePreviousMonth = () => {
    const previousMonth = new Date(currentMonth)
    previousMonth.setMonth(previousMonth.getMonth() - 1)
    setCurrentMonth(previousMonth)
  }

  // Navigate to next month, but not beyond current month
  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    if (
      nextMonth.getFullYear() < today.getFullYear() ||
      (nextMonth.getFullYear() === today.getFullYear() && nextMonth.getMonth() <= today.getMonth())
    ) {
      setCurrentMonth(nextMonth)
    }
  }

  // Check if next month button should be disabled
  const isNextMonthDisabled =
    currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() >= today.getMonth()

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-medium">
          {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </div>
        <Button variant="outline" size="icon" onClick={handleNextMonth} disabled={isNextMonthDisabled}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-3 w-full", className)}
        month={currentMonth}
        captionLayout="buttons-hidden"
        hideNavigation={true}
        formatters={{
          formatCaption: () => "", // Remove the month caption (April 2025)
        }}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
          month: "space-y-4 w-full",
          caption: "hidden", // Hide the default caption with navigation
          table: "w-full border-collapse space-y-1",
          head_row: "flex w-full justify-between",
          head_cell: "text-muted-foreground rounded-md w-10 font-normal text-[0.8rem] px-1",
          row: "flex w-full mt-2 justify-between",
          cell: "text-center text-sm p-0 relative w-10 h-10 [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(buttonVariants({ variant: "ghost" }), "h-10 w-10 p-0 font-normal aria-selected:opacity-100"),
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside:
            "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        {...props}
      />
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }

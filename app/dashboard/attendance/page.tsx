"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface AttendanceRecord {
  id: string
  date: string
  isPresent: boolean
  markedAt: string
  course: {
    id: string
    code: string
    name: string
    semester: number
    section: string
    componentType: string
  }
  subject: {
    code: string
    name: string
  }
}

interface CourseAttendance {
  courseCode: string
  courseName: string
  componentType: string
  presentClasses: number
  totalClasses: number
  attendancePercentage: number
}

interface AttendanceData {
  overall: {
    attendancePercentage: number
    presentClasses: number
    totalClasses: number
  }
  courseWise: CourseAttendance[]
  records: AttendanceRecord[]
}

// Color scheme for different attendance percentages
const getAttendanceColor = (percentage: number) => {
  if (percentage >= 90) return "bg-green-500"
  if (percentage >= 80) return "bg-blue-500"
  if (percentage >= 70) return "bg-yellow-500"
  if (percentage >= 60) return "bg-orange-500"
  return "bg-red-500"
}

const getAttendanceMessage = (percentage: number) => {
  if (percentage >= 90) return "Excellent attendance!"
  if (percentage >= 80) return "Good attendance"
  if (percentage >= 70) return "Average attendance"
  if (percentage >= 60) return "Below average"
  return "Poor attendance"
}

export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({
    overall: { attendancePercentage: 0, presentClasses: 0, totalClasses: 0 },
    courseWise: [],
    records: [],
  })
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedCourse, setSelectedCourse] = useState<string>("All Courses")
  const [loading, setLoading] = useState(true)
  const [calendarData, setCalendarData] = useState<{ [key: string]: { present: boolean; courses: string[] } }>({})
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    fetchAttendanceData()
  }, [])

  const fetchAttendanceData = async () => {
    try {
      setLoading(true)
      const userData = localStorage.getItem("user")
      if (!userData) {
        console.error("No user data found")
        return
      }

      const user = JSON.parse(userData)
      const studentId = user.id

      console.log("Fetching attendance data for student:", studentId)

      const response = await fetch(`/api/attendance?studentId=${studentId}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success && result.data) {
        setAttendanceData(result.data)

        // Create calendar data
        const newCalendarData: { [key: string]: { present: boolean; courses: string[] } } = {}
        result.data.records.forEach((record: AttendanceRecord) => {
          const dateKey = record.date
          if (!newCalendarData[dateKey]) {
            newCalendarData[dateKey] = { present: false, courses: [] }
          }
          newCalendarData[dateKey].courses.push(`${record.course.code} (${record.course.componentType})`)
          if (record.isPresent) {
            newCalendarData[dateKey].present = true
          }
        })

        setCalendarData(newCalendarData)
        console.log("Final attendance data:", result.data)
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSelectedDateAttendance = () => {
    if (!selectedDate) return null

    const dateKey = format(selectedDate, "yyyy-MM-dd")
    const dayAttendance = calendarData[dateKey]

    if (!dayAttendance) return null

    const dayRecords = attendanceData.records.filter((record) => record.date === dateKey)

    if (selectedCourse !== "All Courses") {
      const filteredRecords = dayRecords.filter(
        (record) => `${record.course.code} (${record.course.componentType})` === selectedCourse,
      )
      return filteredRecords.length > 0 ? filteredRecords : null
    }

    return dayRecords.length > 0 ? dayRecords : null
  }

  const selectedDateAttendance = getSelectedDateAttendance()

  // Get unique courses for the dropdown
  const uniqueCourses = Array.from(
    new Set(attendanceData.records.map((record) => `${record.course.code} (${record.course.componentType})`)),
  )

  // Custom calendar component
  const CustomCalendar = () => {
    const getDaysInMonth = (year: number, month: number) => {
      return new Date(year, month + 1, 0).getDate()
    }

    const getFirstDayOfMonth = (year: number, month: number) => {
      return new Date(year, month, 1).getDay()
    }

    const handlePrevMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    }

    const handleNextMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    }

    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
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

        <div className="mb-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Absent</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          <div className="text-sm font-medium p-2">Su</div>
          <div className="text-sm font-medium p-2">Mo</div>
          <div className="text-sm font-medium p-2">Tu</div>
          <div className="text-sm font-medium p-2">We</div>
          <div className="text-sm font-medium p-2">Th</div>
          <div className="text-sm font-medium p-2">Fr</div>
          <div className="text-sm font-medium p-2">Sa</div>

          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="h-10" />
            }

            const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            const dayData = calendarData[dateString]
            const isSelected = selectedDate && format(selectedDate, "yyyy-MM-dd") === dateString
            const isToday = format(new Date(), "yyyy-MM-dd") === dateString

            return (
              <button
                key={`day-${day}`}
                onClick={() => setSelectedDate(new Date(year, month, day))}
                className={cn(
                  "relative h-10 w-10 rounded-md text-sm transition-colors hover:bg-muted",
                  isSelected && "bg-primary text-primary-foreground",
                  isToday && !isSelected && "bg-accent text-accent-foreground font-semibold",
                )}
              >
                {day}
                {dayData && (
                  <div
                    className={cn(
                      "absolute bottom-0 right-0 w-2 h-2 rounded-full",
                      dayData.present ? "bg-green-500" : "bg-red-500",
                    )}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Attendance</h1>
            <p className="text-muted-foreground">Loading your attendance data...</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Attendance</h1>
          <p className="text-muted-foreground">View and track your attendance across all courses.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Overall Attendance */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Attendance</CardTitle>
            <p className="text-sm text-muted-foreground">Your attendance across all courses</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={cn(
                      "transition-all duration-1000",
                      attendanceData.overall.attendancePercentage >= 90
                        ? "text-green-500"
                        : attendanceData.overall.attendancePercentage >= 80
                          ? "text-blue-500"
                          : attendanceData.overall.attendancePercentage >= 70
                            ? "text-yellow-500"
                            : attendanceData.overall.attendancePercentage >= 60
                              ? "text-orange-500"
                              : "text-red-500",
                    )}
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={`${attendanceData.overall.attendancePercentage}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{attendanceData.overall.attendancePercentage}%</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div
                className={cn(
                  "font-medium",
                  attendanceData.overall.attendancePercentage >= 90
                    ? "text-green-600"
                    : attendanceData.overall.attendancePercentage >= 80
                      ? "text-blue-600"
                      : attendanceData.overall.attendancePercentage >= 70
                        ? "text-yellow-600"
                        : attendanceData.overall.attendancePercentage >= 60
                          ? "text-orange-600"
                          : "text-red-600",
                )}
              >
                {getAttendanceMessage(attendanceData.overall.attendancePercentage)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {attendanceData.overall.presentClasses} out of {attendanceData.overall.totalClasses} classes attended
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course-wise Attendance */}
        <Card>
          <CardHeader>
            <CardTitle>Course-wise Attendance</CardTitle>
            <p className="text-sm text-muted-foreground">Your attendance percentage by course</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {attendanceData.courseWise.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No course data available</div>
            ) : (
              attendanceData.courseWise.map((course, index) => (
                <div key={`${course.courseCode}-${course.componentType}`} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">
                        {course.courseName} ({course.componentType})
                      </span>
                    </div>
                    <span className="font-bold text-sm">{course.attendancePercentage}%</span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all duration-1000",
                          getAttendanceColor(course.attendancePercentage),
                        )}
                        style={{ width: `${course.attendancePercentage}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {course.presentClasses} / {course.totalClasses} classes attended
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Attendance Calendar and Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Calendar</CardTitle>
            <p className="text-sm text-muted-foreground">Select a date to view your attendance details</p>
          </CardHeader>
          <CardContent>
            <CustomCalendar />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Select a date"}</CardTitle>
            <p className="text-sm text-muted-foreground">Subject/Period-wise Attendance</p>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <div className="space-y-4">
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Courses">All Courses</SelectItem>
                    {uniqueCourses.map((course) => (
                      <SelectItem key={course} value={course}>
                        {course}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedDateAttendance ? (
                  <div className="space-y-3">
                    {selectedDateAttendance.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">
                            {record.subject.code} - {record.subject.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {record.course.componentType} • Section {record.course.section}
                          </p>
                        </div>
                        <Badge variant={record.isPresent ? "default" : "destructive"}>
                          {record.isPresent ? "Present" : "Absent"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No attendance records for this date</p>
                    <p className="text-sm text-muted-foreground mt-1">Select another date or check your schedule</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Select a date to view attendance details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

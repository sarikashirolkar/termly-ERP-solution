"use client"

import { BookOpen, Calendar, FileText, MessageSquare } from "lucide-react"

export function RecentActivityCard() {
  // Mock data
  const activities = [
    {
      id: 1,
      type: "quiz",
      title: "Completed Quiz: Introduction to AI",
      time: "2 hours ago",
      icon: FileText,
    },
    {
      id: 2,
      type: "material",
      title: "Downloaded: Database Systems Notes",
      time: "Yesterday",
      icon: BookOpen,
    },
    {
      id: 3,
      type: "attendance",
      title: "Attended: Data Structures & Algorithms",
      time: "Yesterday",
      icon: Calendar,
    },
    {
      id: 4,
      type: "assistant",
      title: "AI Assistant: Study session on Neural Networks",
      time: "2 days ago",
      icon: MessageSquare,
    },
  ]

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-3 p-3 rounded-lg border hover:shadow-md transition-all cursor-pointer bg-white dark:bg-background"
        >
          <div
            className={`rounded-full p-2 ${
              activity.type === "quiz"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                : activity.type === "material"
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                  : activity.type === "attendance"
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
            }`}
          >
            <activity.icon className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{activity.title}</p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

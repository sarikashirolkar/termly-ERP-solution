"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"

interface Announcement {
  id: number
  title: string
  description: string
  date: string
  icon: any
  important?: boolean
}

export function ViewAllAnnouncementsDialog({ announcements }: { announcements: Announcement[] }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>All Announcements</DialogTitle>
          <DialogDescription>View all announcements and notifications from your academic portal.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="bg-white dark:bg-background">
              <CardContent className="p-4">
                <div className="flex items-start gap-2 md:gap-4">
                  <div className="rounded-full bg-primary/10 p-2 mt-1">
                    <announcement.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{announcement.title}</h3>
                      {announcement.important && (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
                          Important
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{announcement.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Posted on {new Date(announcement.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

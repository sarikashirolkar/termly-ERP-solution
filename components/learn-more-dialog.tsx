"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface LearnMoreDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LearnMoreDialog({ open, onOpenChange }: LearnMoreDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Learn More About TERMLY</DialogTitle>
          <DialogDescription>Discover the features and benefits of our academic management system.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p>
            TERMLY is a comprehensive academic management system designed to streamline various administrative and
            academic processes for educational institutions.
          </p>
          <p>Key features include:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Student and Faculty Management</li>
            <li>Attendance Tracking</li>
            <li>Marks and Performance Analytics</li>
            <li>Course and Syllabus Management</li>
            <li>Feedback and Communication Tools</li>
            <li>Achievement Tracking and Verification</li>
            <li>CO-PO Mapping and Attainment Reports</li>
            <li>Timetable Generation</li>
            <li>Application and Letter Request Management</li>
            <li>Proctoring Integration</li>
            <li>And much more!</li>
          </ul>
          <p>
            Our goal is to provide an intuitive and efficient platform that enhances the academic experience for
            students, faculty, and administrators alike.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

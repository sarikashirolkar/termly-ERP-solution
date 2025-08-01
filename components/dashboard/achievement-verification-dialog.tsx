"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Check, Download, ExternalLink, FileText, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import type { Achievement } from "@/lib/database-schema"

interface AchievementVerificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  achievement: Achievement | null
  onVerify: (id: string) => void
  onReject: (id: string, reason: string) => void
}

export function AchievementVerificationDialog({
  open,
  onOpenChange,
  achievement,
  onVerify,
  onReject,
}: AchievementVerificationDialogProps) {
  const [rejectionReason, setRejectionReason] = useState("")
  const [isRejecting, setIsRejecting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!achievement) return null

  // Use student data from the achievement object instead of hardcoding
  const student = {
    firstName: achievement.studentName?.split(" ")[0] || "Unknown",
    lastName: achievement.studentName?.split(" ")[1] || "Student",
    department: achievement.department,
    usn: achievement.usn || "N/A",
    semester: achievement.semester || "6",
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const getCategoryBadge = (category: string) => {
    switch (category.toLowerCase()) {
      case "academic":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">Academic</Badge>
      case "technical":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100">Technical</Badge>
      case "sports":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">Sports</Badge>
      case "cultural":
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">Cultural</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">Other</Badge>
    }
  }

  const handleVerify = async () => {
    setIsSubmitting(true)
    try {
      await onVerify(achievement.id)
      // Close the dialog after successful verification
      onOpenChange(false)
    } catch (error) {
      console.error("Error verifying achievement:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) return

    setIsSubmitting(true)
    try {
      await onReject(achievement.id, rejectionReason)
      onOpenChange(false)
    } catch (error) {
      console.error("Error rejecting achievement:", error)
    } finally {
      setIsSubmitting(false)
      setIsRejecting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Verify Achievement</DialogTitle>
          <DialogDescription>Review the achievement details before verification</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Student Information */}
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/placeholder.svg" alt={`${student.firstName} ${student.lastName}`} />
              <AvatarFallback>{`${student.firstName.charAt(0)}${student.lastName.charAt(0)}`}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{`${student.firstName} ${student.lastName}`}</h3>
              <div className="text-sm text-muted-foreground">
                <p>{student.department}</p>
                <p>
                  USN: {student.usn} | Semester: {student.semester}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Achievement Details */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">{achievement.title}</h3>
              {getCategoryBadge(achievement.category)}
            </div>

            <div className="bg-muted/50 p-3 rounded-md">
              <p className="text-sm">{achievement.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Date of Achievement</p>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> {formatDate(achievement.date)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Category</p>
                <p className="font-medium capitalize">{achievement.category}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Institution</p>
                <p className="font-medium">
                  {achievement.institution === "college" ? "College/University" : achievement.otherInstitutionName}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Department</p>
                <p className="font-medium">{achievement.department}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Proof Document */}
          <div className="space-y-2">
            <h4 className="font-medium">Proof Document</h4>
            {achievement.fileUrl ? (
              <div className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="text-sm">Achievement_Proof.pdf</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8" asChild>
                    <a href={achievement.fileUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 mr-1" /> View
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="h-8" asChild>
                    <a href={achievement.fileUrl} download>
                      <Download className="h-3.5 w-3.5 mr-1" /> Download
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-muted/50 p-3 rounded-md text-sm text-muted-foreground">No proof document provided</div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {isRejecting ? (
            <>
              <div className="grid w-full gap-2">
                <label htmlFor="rejection-reason" className="text-sm font-medium">
                  Reason for rejection
                </label>
                <textarea
                  id="rejection-reason"
                  className="min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full"
                  placeholder="Please provide a reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 w-full">
                <Button variant="outline" onClick={() => setIsRejecting(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason.trim() || isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Confirm Rejection"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button variant="destructive" onClick={() => setIsRejecting(true)}>
                <X className="h-4 w-4 mr-1" /> Reject
              </Button>
              <Button onClick={handleVerify} disabled={isSubmitting}>
                <Check className="h-4 w-4 mr-1" /> {isSubmitting ? "Verifying..." : "Verify Achievement"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

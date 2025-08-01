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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { achievementService, studentService } from "@/lib/supabase-service"
import type { StudentProfile } from "@/lib/database-schema"

interface AddAchievementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAchievementAdded: () => void
}

export function AddAchievementDialog({ open, onOpenChange, onAchievementAdded }: AddAchievementDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [type, setType] = useState("")
  const [certificateUrl, setCertificateUrl] = useState("")
  const [studentId, setStudentId] = useState("")
  const [students, setStudents] = useState<StudentProfile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data, error } = await studentService.getAll() // Destructure data and error
        if (error) {
          console.error("Error fetching students:", error)
          toast({
            title: "Error",
            description: "Failed to load students.",
            variant: "destructive",
          })
          setStudents([]) // Ensure students is an empty array on error
          return
        }
        setStudents(data || []) // Set students to data or an empty array if data is null/undefined
      } catch (error) {
        console.error("Unexpected error fetching students:", error)
        toast({
          title: "Error",
          description: "Failed to load students due to an unexpected error.",
          variant: "destructive",
        })
        setStudents([]) // Ensure students is an empty array on unexpected error
      }
    }
    fetchStudents()
  }, [toast])

  const handleSubmit = async () => {
    if (!title || !description || !date || !type || !studentId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await achievementService.create({
        student_id: studentId,
        title,
        description,
        date: format(date, "yyyy-MM-dd"),
        type,
        certificate_url: certificateUrl || null,
        status: "pending", // Default status
      })

      toast({
        title: "Success",
        description: "Achievement added successfully and is pending verification.",
      })
      onAchievementAdded()
      onOpenChange(false)
      // Reset form fields
      setTitle("")
      setDescription("")
      setDate(undefined)
      setType("")
      setCertificateUrl("")
      setStudentId("")
    } catch (error) {
      console.error("Error adding achievement:", error)
      toast({
        title: "Error",
        description: `Failed to add achievement. ${error instanceof Error ? error.message : ""}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Achievement</DialogTitle>
          <DialogDescription>Fill in the details of the student's achievement.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="student" className="text-right">
              Student
            </Label>
            <Select value={studentId} onValueChange={setStudentId} disabled={isSubmitting}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name} ({student.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              rows={3}
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("col-span-3 justify-start text-left font-normal", !date && "text-muted-foreground")}
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus disabled={isSubmitting} />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select value={type} onValueChange={setType} disabled={isSubmitting}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select achievement type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Academic">Academic</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
                <SelectItem value="Cultural">Cultural</SelectItem>
                <SelectItem value="Community Service">Community Service</SelectItem>
                <SelectItem value="Innovation">Innovation</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="certificateUrl" className="text-right">
              Certificate URL (Optional)
            </Label>
            <Input
              id="certificateUrl"
              value={certificateUrl}
              onChange={(e) => setCertificateUrl(e.target.value)}
              className="col-span-3"
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Achievement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

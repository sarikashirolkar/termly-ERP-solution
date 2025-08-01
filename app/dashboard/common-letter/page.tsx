"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

type Recipient = "proctor" | "hod" | "principal"

type CommonLetterApplication = {
  id: string
  subject: string
  message: string
  recipients: Recipient[]
  status: "pending" | "approved" | "rejected"
  comments?: string
  createdAt: Date
  studentId: string
  studentName: string
  studentDepartment: string
  studentSemester: number
  currentApprover?: "proctor" | "hod" | "principal"
  approvalFlow: {
    proctor?: {
      status: "pending" | "approved" | "rejected"
      comments?: string
      timestamp?: Date
    }
    hod?: {
      status: "pending" | "approved" | "rejected"
      comments?: string
      timestamp?: Date
    }
    principal?: {
      status: "pending" | "approved" | "rejected"
      comments?: string
      timestamp?: Date
    }
  }
}

export default function CommonLetterPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [recipients, setRecipients] = useState<Recipient[]>(["proctor"])
  const [applications, setApplications] = useState<CommonLetterApplication[]>([])

  // Load user data
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    // Load applications from localStorage
    const storedApplications = localStorage.getItem("student-common-letters")
    if (storedApplications) {
      setApplications(JSON.parse(storedApplications))
    }
  }, [])

  // Toggle recipient selection
  const toggleRecipient = (recipient: Recipient) => {
    if (recipients.includes(recipient)) {
      // Don't allow removing proctor if it's the only recipient
      if (recipient === "proctor" && recipients.length === 1) {
        return
      }
      setRecipients(recipients.filter((r) => r !== recipient))
    } else {
      setRecipients([...recipients, recipient])
    }
  }

  // Handle common letter submission
  const handleSubmit = () => {
    if (subject.trim() === "") {
      toast({
        title: "Error",
        description: "Please provide a subject for your letter.",
        variant: "destructive",
      })
      return
    }

    if (message.trim() === "") {
      toast({
        title: "Error",
        description: "Please provide a message for your letter.",
        variant: "destructive",
      })
      return
    }

    if (!user) {
      toast({
        title: "Error",
        description: "User information not available.",
        variant: "destructive",
      })
      return
    }

    // Create new common letter application
    const newApplication: CommonLetterApplication = {
      id: `letter-${Date.now()}`,
      subject,
      message,
      recipients,
      status: "pending",
      createdAt: new Date(),
      studentId: user.id || `student-${Date.now()}`,
      studentName: `${user.firstName} ${user.lastName}`,
      studentDepartment: user.department || "Computer Science",
      studentSemester: user.semester || 4,
      currentApprover: "proctor",
      approvalFlow: {
        proctor: {
          status: "pending",
        },
        ...(recipients.includes("hod") && {
          hod: {
            status: "pending",
          },
        }),
        ...(recipients.includes("principal") && {
          principal: {
            status: "pending",
          },
        }),
      },
    }

    // Update applications list
    const updatedApplications = [...applications, newApplication]
    setApplications(updatedApplications)
    localStorage.setItem("student-common-letters", JSON.stringify(updatedApplications))

    // Reset form
    setSubject("")
    setMessage("")
    setRecipients(["proctor"])

    toast({
      title: "Success",
      description: "Common letter submitted successfully.",
    })
  }

  if (!user || user.role !== "student") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Common Letter</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Common Letter</h1>
        <p className="text-muted-foreground">Submit a common letter for approval.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Common Letter</CardTitle>
          <CardDescription>Submit a common letter for approval.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject (Regarding)</Label>
            <Input
              id="subject"
              placeholder="Enter the subject of your letter"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Brief Explanation/Message</Label>
            <Textarea
              id="message"
              placeholder="Please provide a detailed explanation"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
            />
          </div>

          {/* Recipients */}
          <div className="space-y-3">
            <Label>Send Letter To</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="proctor"
                  checked={recipients.includes("proctor")}
                  onCheckedChange={() => toggleRecipient("proctor")}
                  disabled={recipients.length === 1 && recipients.includes("proctor")}
                />
                <Label htmlFor="proctor" className="cursor-pointer">
                  Proctor
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hod"
                  checked={recipients.includes("hod")}
                  onCheckedChange={() => toggleRecipient("hod")}
                />
                <Label htmlFor="hod" className="cursor-pointer">
                  HOD
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="principal"
                  checked={recipients.includes("principal")}
                  onCheckedChange={() => toggleRecipient("principal")}
                />
                <Label htmlFor="principal" className="cursor-pointer">
                  Principal
                </Label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button className="w-full" onClick={handleSubmit}>
            Submit Common Letter
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
